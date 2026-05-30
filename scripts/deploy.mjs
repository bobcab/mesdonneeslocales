#!/usr/bin/env node
/**
 * FTP deploy incrémental.
 *
 * Compare la liste locale (dist/) à la liste distante : n'upload que les fichiers
 * nouveaux ou modifiés (taille différente), supprime les fichiers distants qui
 * n'existent plus localement (sauf paths protégés).
 *
 * Config via .env :
 *   FTP_HOST, FTP_USER, FTP_PASS, FTP_REMOTE_DIR (ex: /), FTP_PORT (def 21), FTP_SECURE (true/false)
 *   FTP_PROTECT  (csv de chemins distants à ne JAMAIS supprimer, ex: "mviewer,old-stuff")
 *   FTP_DRY_RUN  (true → ne touche à rien, affiche juste le diff)
 */

import { readFileSync, statSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join, posix, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'basic-ftp';
import 'dotenv/config';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = join(__dirname, '..');
const distDir = join(projectRoot, 'dist');

const HOST = process.env.FTP_HOST;
const USER = process.env.FTP_USER;
const PASS = process.env.FTP_PASS;
const REMOTE_DIR = process.env.FTP_REMOTE_DIR || '/';
const PORT = Number(process.env.FTP_PORT || 21);
const SECURE = String(process.env.FTP_SECURE || 'false').toLowerCase() === 'true';
const DRY_RUN = String(process.env.FTP_DRY_RUN || 'false').toLowerCase() === 'true';
const PROTECT = (process.env.FTP_PROTECT || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (!HOST || !USER || !PASS) {
  console.error('✗ Variables FTP manquantes. Renseignez FTP_HOST, FTP_USER, FTP_PASS dans .env');
  process.exit(1);
}

try {
  statSync(distDir);
} catch {
  console.error('✗ dist/ introuvable. Lancez `npm run build` d\'abord.');
  process.exit(1);
}

/** Liste récursive du build local : Map<chemin POSIX relatif, { size, mtime }> */
async function listLocal() {
  const out = new Map();
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const abs = join(dir, e.name);
      if (e.isDirectory()) await walk(abs);
      else if (e.isFile()) {
        const rel = relative(distDir, abs).split(sep).join('/');
        const s = await stat(abs);
        out.set(rel, { size: s.size, mtime: s.mtimeMs, absolute: abs });
      }
    }
  }
  await walk(distDir);
  return out;
}

/** Liste récursive du distant. Map<chemin POSIX relatif au REMOTE_DIR, { size, type }> */
async function listRemote(client, baseRemote) {
  const out = new Map();
  async function walk(remoteRel) {
    const remoteAbs = posix.join(baseRemote, remoteRel);
    let entries;
    try {
      entries = await client.list(remoteAbs);
    } catch (err) {
      if (remoteRel === '') throw err;
      return; // dossier vide ou inexistant
    }
    for (const e of entries) {
      if (e.name === '.' || e.name === '..') continue;
      const rel = remoteRel ? `${remoteRel}/${e.name}` : e.name;
      if (e.isDirectory) {
        await walk(rel);
      } else if (e.isFile) {
        out.set(rel, { size: e.size });
      }
    }
  }
  await walk('');
  return out;
}

function isProtected(remotePath) {
  return PROTECT.some((p) => remotePath === p || remotePath.startsWith(`${p}/`));
}

async function ensureRemoteDir(client, baseRemote, relPath) {
  const parts = relPath.split('/').filter(Boolean);
  let current = baseRemote;
  for (const part of parts) {
    current = posix.join(current, part);
    try {
      await client.ensureDir(current);
    } catch (err) {
      // ensureDir change cwd ; on revient à la racine après
    }
  }
  await client.cd(baseRemote);
}

async function main() {
  console.log(`\n→ FTP deploy → ${USER}@${HOST}:${PORT}${REMOTE_DIR}`);
  console.log(`  mode      : ${DRY_RUN ? 'DRY-RUN (aucun changement)' : 'LIVE'}`);
  console.log(`  protégés  : ${PROTECT.length ? PROTECT.join(', ') : '(aucun)'}`);

  console.log('\n→ Scan local dist/...');
  const local = await listLocal();
  console.log(`  ${local.size} fichier(s) locaux`);

  const client = new Client();
  client.ftp.verbose = false;

  try {
    await client.access({ host: HOST, port: PORT, user: USER, password: PASS, secure: SECURE });
    await client.ensureDir(REMOTE_DIR);
    await client.cd(REMOTE_DIR);

    console.log('→ Scan distant...');
    const remote = await listRemote(client, REMOTE_DIR);
    console.log(`  ${remote.size} fichier(s) distants`);

    const toUpload = [];
    const toSkip = [];
    for (const [rel, info] of local) {
      const r = remote.get(rel);
      if (!r) toUpload.push({ rel, reason: 'new', ...info });
      else if (r.size !== info.size) toUpload.push({ rel, reason: 'changed', ...info });
      else toSkip.push(rel);
    }

    const toDelete = [];
    for (const rel of remote.keys()) {
      if (!local.has(rel) && !isProtected(rel)) toDelete.push(rel);
    }

    console.log(`\n  ↑ upload   : ${toUpload.length}`);
    console.log(`  = inchangé : ${toSkip.length}`);
    console.log(`  ✗ delete   : ${toDelete.length}`);

    if (DRY_RUN) {
      if (toUpload.length) console.log('\n  Upload prévu :');
      toUpload.slice(0, 50).forEach((f) => console.log(`    ↑ ${f.rel} (${f.reason})`));
      if (toUpload.length > 50) console.log(`    ... +${toUpload.length - 50}`);
      if (toDelete.length) console.log('\n  Delete prévu :');
      toDelete.slice(0, 50).forEach((f) => console.log(`    ✗ ${f}`));
      if (toDelete.length > 50) console.log(`    ... +${toDelete.length - 50}`);
      console.log('\n✓ Dry-run terminé.\n');
      return;
    }

    const dirsCreated = new Set();
    for (let i = 0; i < toUpload.length; i++) {
      const f = toUpload[i];
      const parent = posix.dirname(f.rel);
      if (parent !== '.' && !dirsCreated.has(parent)) {
        await ensureRemoteDir(client, REMOTE_DIR, parent);
        dirsCreated.add(parent);
      }
      const remotePath = posix.join(REMOTE_DIR, f.rel);
      process.stdout.write(`  [${i + 1}/${toUpload.length}] ↑ ${f.rel}`);
      await client.uploadFrom(f.absolute, remotePath);
      process.stdout.write(' ✓\n');
    }

    for (let i = 0; i < toDelete.length; i++) {
      const rel = toDelete[i];
      const remotePath = posix.join(REMOTE_DIR, rel);
      process.stdout.write(`  [${i + 1}/${toDelete.length}] ✗ ${rel}`);
      try {
        await client.remove(remotePath);
        process.stdout.write(' ✓\n');
      } catch (err) {
        process.stdout.write(` ⚠ ${err.message}\n`);
      }
    }

    console.log('\n✓ Déploiement terminé.\n');
  } finally {
    client.close();
  }
}

main().catch((err) => {
  console.error('\n✗ Échec du déploiement :', err.message);
  process.exit(1);
});
