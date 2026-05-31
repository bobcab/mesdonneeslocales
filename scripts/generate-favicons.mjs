/**
 * Génère les favicons et icônes PWA depuis src/assets/logo/mdl-seal.svg.
 *
 * Sortie :
 *  - public/favicon.png (32×32) — fallback PNG navigateurs anciens
 *  - public/apple-touch-icon.png (180×180) — iOS home screen
 *  - public/icons/icon-192x192.png — PWA Android
 *  - public/icons/icon-256x256.png — PWA
 *  - public/icons/icon-384x384.png — PWA
 *  - public/icons/icon-512x512.png — PWA splash + maskable
 *
 * Note : favicon.ico (multi-tailles) n'est pas régénéré ici — sharp ne le supporte pas
 * nativement. Pour le moment on garde l'ancien favicon.ico (les navigateurs modernes
 * prennent favicon.svg en priorité de toute façon). Si besoin de le regénérer plus tard :
 *   npx png-to-ico public/icons/icon-32x32.png > public/favicon.ico
 *
 * Utilise sharp (dépendance transitive d'Astro).
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = join(__dirname, '..');
const sealPath = join(projectRoot, 'src/assets/logo/mdl-seal.svg');
const publicDir = join(projectRoot, 'public');
const iconsDir = join(publicDir, 'icons');

if (!existsSync(iconsDir)) {
  await mkdir(iconsDir, { recursive: true });
}

const svg = await readFile(sealPath);

// Note : Playfair Display n'est pas installée sur le système, donc sharp utilisera
// Georgia ou un fallback serif. Le rendu sera moins fidèle qu'en navigateur mais reste
// lisible et identifie bien la marque "mdl".

const targets = [
  { name: 'favicon.png',         dir: publicDir, size: 32 },
  { name: 'favicon-16.png',      dir: publicDir, size: 16 },
  { name: 'favicon-48.png',      dir: publicDir, size: 48 },
  { name: 'apple-touch-icon.png',dir: publicDir, size: 180 },
  { name: 'icon-192x192.png',    dir: iconsDir,  size: 192 },
  { name: 'icon-256x256.png',    dir: iconsDir,  size: 256 },
  { name: 'icon-384x384.png',    dir: iconsDir,  size: 384 },
  { name: 'icon-512x512.png',    dir: iconsDir,  size: 512 },
];

for (const t of targets) {
  const buffer = await sharp(svg, { density: 384 })
    .resize(t.size, t.size, { fit: 'contain', background: { r: 10, g: 31, b: 61, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(t.dir, t.name), buffer);
  console.log(`✓ ${t.name} (${t.size}×${t.size}, ${buffer.length} B)`);
}

console.log('\nFavicons générés depuis src/assets/logo/mdl-seal.svg.');
