#!/usr/bin/env node
/**
 * fetch-drees-apl.mjs — récupère les indicateurs APL (Accessibilité Potentielle Localisée)
 * de la DREES pour 5 professions médicales et toutes les communes métropolitaines.
 *
 * Usage :
 *   node scripts/fetch-drees-apl.mjs                 # 10 communes test (default)
 *   node scripts/fetch-drees-apl.mjs --sample=100    # échantillon N
 *   node scripts/fetch-drees-apl.mjs --all           # toutes les communes (~35 000)
 *
 * Source : data.drees.solidarites-sante.gouv.fr — dataset 530
 *   "L'accessibilité potentielle localisée (APL)" — 5 Excel attachés (1 par profession).
 *   L'API records n'expose PAS le dataset 530, il faut télécharger les .xlsx et les parser.
 *
 * Cache : .cache/drees-apl/{code}.json — 1 JSON par commune (5 professions × 2 millésimes).
 */

import { mkdirSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const CACHE_DIR = join(ROOT, '.cache', 'drees-apl');
const XLSX_CACHE_DIR = join(ROOT, '.cache', 'drees-apl-xlsx');
const META_PATH = join(CACHE_DIR, '_meta.json');

const XLSX_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 1 an (données annuelles)

/**
 * Les 5 professions APL. Le `key` est le slug court utilisé dans le JSON cache.
 * L'`attachmentId` est l'identifiant de l'attachement DREES pour télécharger l'Excel.
 */
const PROFESSIONS = [
  {
    key: 'medecin_generaliste',
    label: 'Médecins généralistes',
    attachmentId: 'indicateur_d_accessibilite_potentielle_localisee_apl_aux_medecins_generalistes_xlsx',
  },
  {
    key: 'infirmier',
    label: 'Infirmières et infirmiers',
    attachmentId: 'indicateur_d_accessibilite_potentielle_localisee_apl_aux_infirmieres_xlsx',
  },
  {
    key: 'sage_femme',
    label: 'Sages-femmes',
    attachmentId: 'indicateur_d_accessibilite_potentielle_localisee_apl_aux_sages_femmes_xlsx',
  },
  {
    key: 'kine',
    label: 'Masseurs-kinésithérapeutes',
    attachmentId: 'indicateur_d_accessibilite_potentielle_localisee_apl_aux_kinesitherapeutes_xlsx',
  },
  {
    key: 'dentiste',
    label: 'Chirurgiens-dentistes',
    attachmentId: 'indicateur_d_accessibilite_potentielle_localisee_apl_aux_chirurgiens_dentistes_xlsx',
  },
];

const BASE_URL =
  'https://data.drees.solidarites-sante.gouv.fr/api/explore/v2.1/catalog/datasets/530_l-accessibilite-potentielle-localisee-apl/attachments';

/**
 * 10 communes test — adaptées à la maille DREES qui utilise les arrondissements pour
 * Paris (75101-75120), Marseille (13201-13216), Lyon (69381-69389).
 * On prend un arrondissement représentatif de chaque grande métropole.
 * Saint-Denis Réunion exclue (DROM hors périmètre APL).
 */
const TEST_COMMUNES = new Set([
  '75101', // Paris 1er
  '13201', // Marseille 1er
  '69381', // Lyon 1er
  '31555', // Toulouse
  '06088', // Nice
  '33063', // Bordeaux
  '44109', // Nantes
  '67482', // Strasbourg
  '48095', // Mende (Lozère)
  '46240', // Rocamadour (Lot)
]);

/**
 * Seuils de catégorisation APL pour les médecins généralistes
 * (synthèse note Claude Code §1.2).
 */
function categorizeMG(apl) {
  if (apl == null || !isFinite(apl)) return null;
  if (apl < 1.5) return 'critique';
  if (apl < 2.5) return 'desert';
  if (apl < 4.0) return 'sous_densite';
  if (apl < 6.0) return 'correct';
  return 'bon';
}

function parseArgs(argv) {
  const args = { all: false, sample: null, force: false };
  for (const a of argv.slice(2)) {
    if (a === '--all') args.all = true;
    else if (a.startsWith('--sample=')) args.sample = parseInt(a.slice('--sample='.length), 10);
    else if (a === '--force') args.force = true;
  }
  return args;
}

/**
 * Télécharge un Excel DREES et le cache localement.
 * TTL 1 an car les données sont annuelles.
 */
async function downloadXlsx(attachmentId, force = false) {
  if (!existsSync(XLSX_CACHE_DIR)) mkdirSync(XLSX_CACHE_DIR, { recursive: true });
  const localPath = join(XLSX_CACHE_DIR, `${attachmentId}.xlsx`);

  if (!force && existsSync(localPath)) {
    const age = Date.now() - statSync(localPath).mtimeMs;
    if (age < XLSX_TTL_MS) return localPath;
  }

  const url = `${BASE_URL}/${attachmentId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} pour ${attachmentId}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(localPath, buf);
  return localPath;
}

/**
 * Parse un Excel DREES APL et retourne une Map<code, { name, apl, millesime }> pour chaque
 * millésime trouvé.
 *
 * Structure des fichiers (vérifiée sur médecins généralistes + sages-femmes) :
 *   - Feuilles : "Paramètres", "APL 2022", "APL 2023"
 *   - Ligne 8 = header (Code commune INSEE, Commune, APL aux ..., ...)
 *   - Lignes 10+ = données (col 0 = code, col 1 = nom, col 2 = APL principale)
 */
function parseAplWorkbook(xlsxPath) {
  const wb = XLSX.readFile(xlsxPath);
  const byMillesimeByCode = new Map(); // millesime -> Map(code -> { name, apl })

  for (const sheetName of wb.SheetNames) {
    const match = sheetName.match(/APL\s+(\d{4})/);
    if (!match) continue; // ignore "Paramètres" et autres
    const millesime = parseInt(match[1], 10);

    const sh = wb.Sheets[sheetName];
    if (!sh['!ref']) continue;
    const rows = XLSX.utils.sheet_to_json(sh, { header: 1, defval: null });

    const byCode = new Map();
    // Données à partir de la ligne 10 (header en 8)
    for (let i = 10; i < rows.length; i++) {
      const r = rows[i];
      if (!r) continue;
      const code = typeof r[0] === 'string' ? r[0].trim() : r[0];
      const name = typeof r[1] === 'string' ? r[1].trim() : r[1];
      const apl = typeof r[2] === 'number' ? r[2] : null;
      if (!code || typeof code !== 'string' || code.length < 4) continue;
      byCode.set(code, { name, apl });
    }
    byMillesimeByCode.set(millesime, byCode);
  }
  return byMillesimeByCode;
}

/**
 * Récupère le nom de département à partir des 2 premiers caractères du code INSEE.
 * Pour la Corse (2A, 2B), le code passe par-dessus le mapping numérique.
 *
 * Note : on importerait `getDepartment` de src/lib/departments.ts mais ce script Node ne
 * peut pas importer du TypeScript directement. On duplique la table essentielle ici (juste
 * code → nom court). 96 entrées.
 */
const DEPT_NAMES = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
  '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron', '13': 'Bouches-du-Rhône',
  '14': 'Calvados', '15': 'Cantal', '16': 'Charente', '17': 'Charente-Maritime',
  '18': 'Cher', '19': 'Corrèze', '21': "Côte-d'Or", '22': "Côtes-d'Armor", '23': 'Creuse',
  '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme', '27': 'Eure', '28': 'Eure-et-Loir',
  '29': 'Finistère', '2A': 'Corse-du-Sud', '2B': 'Haute-Corse', '30': 'Gard',
  '31': 'Haute-Garonne', '32': 'Gers', '33': 'Gironde', '34': 'Hérault', '35': 'Ille-et-Vilaine',
  '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura', '40': 'Landes',
  '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire', '44': 'Loire-Atlantique',
  '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne', '48': 'Lozère', '49': 'Maine-et-Loire',
  '50': 'Manche', '51': 'Marne', '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle',
  '55': 'Meuse', '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
  '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
  '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
  '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
  '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne', '87': 'Haute-Vienne',
  '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort', '91': 'Essonne',
  '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne', '95': "Val-d'Oise",
};

function getDepartmentCode(communeCode) {
  // Corse : 2A/2B
  if (communeCode.startsWith('2A') || communeCode.startsWith('2a')) return '2A';
  if (communeCode.startsWith('2B') || communeCode.startsWith('2b')) return '2B';
  return communeCode.slice(0, 2);
}

function getDepartmentName(deptCode) {
  return DEPT_NAMES[deptCode] ?? deptCode;
}

/**
 * Récupère les coordonnées (centroïde lon/lat) d'une commune via la BAN.
 * Recherche par nom + filtre citycode pour fiabilité.
 * Échec gracieux : retourne null si l'API ne renvoie rien.
 */
async function fetchCoords(code, name) {
  // Pour les arrondissements (75101, 13201, 69381...), la BAN renvoie soit l'arrondissement
  // soit la commune tête. On tente d'abord par citycode exact.
  try {
    const q = encodeURIComponent(name);
    const url = `https://api-adresse.data.gouv.fr/search/?q=${q}&type=municipality&citycode=${code}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const feat = json?.features?.[0];
    if (!feat?.geometry?.coordinates) return null;
    const [lon, lat] = feat.geometry.coordinates;
    return [Number(lon), Number(lat)];
  } catch {
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

  console.log("\n→ DREES APL fetch — Indicateur d'Accessibilité Potentielle Localisée");
  console.log('  source : data.drees.solidarites-sante.gouv.fr (dataset 530)');
  console.log(`  mode   : ${args.all ? 'TOUTES communes' : args.sample ? `échantillon ${args.sample}` : '10 communes test'}`);
  if (args.force) console.log('  force  : re-télécharger les XLSX même si en cache');

  // 1. Télécharger les 5 .xlsx (cache local 1 an)
  console.log('\n  Téléchargement des 5 fichiers Excel DREES…');
  const xlsxPaths = {};
  for (const p of PROFESSIONS) {
    process.stdout.write(`    ${p.label}… `);
    try {
      const localPath = await downloadXlsx(p.attachmentId, args.force);
      const isFresh = Date.now() - statSync(localPath).mtimeMs < 10_000;
      xlsxPaths[p.key] = localPath;
      console.log(isFresh ? '✓ téléchargé' : '✓ (cache)');
    } catch (err) {
      console.log(`✗ ${err.message}`);
      throw err;
    }
  }

  // 2. Parser chaque .xlsx
  console.log('\n  Parsing des fichiers Excel…');
  const aplByProf = {}; // { profKey: Map<millesime, Map<code, { name, apl }>> }
  for (const p of PROFESSIONS) {
    process.stdout.write(`    ${p.label}… `);
    const data = parseAplWorkbook(xlsxPaths[p.key]);
    aplByProf[p.key] = data;
    const millesimes = [...data.keys()].sort();
    const sampleSize = data.get(millesimes.at(-1))?.size ?? 0;
    console.log(`✓ millésimes ${millesimes.join(', ')} (${sampleSize} communes)`);
  }

  // 3. Croiser les 5 professions × millésimes par commune
  console.log('\n  Consolidation par commune…');
  const allCodes = new Set();
  for (const profKey of Object.keys(aplByProf)) {
    for (const byCode of aplByProf[profKey].values()) {
      for (const code of byCode.keys()) allCodes.add(code);
    }
  }
  console.log(`    ${allCodes.size} communes uniques recensées`);

  // 4. Filtrer selon le mode
  let targetCodes;
  if (args.all) {
    targetCodes = [...allCodes].sort();
  } else if (args.sample) {
    targetCodes = [...allCodes].sort().slice(0, args.sample);
  } else {
    targetCodes = [...allCodes].filter((c) => TEST_COMMUNES.has(c)).sort();
    console.log(`    mode test : ${targetCodes.length} communes retenues sur ${TEST_COMMUNES.size} demandées`);
  }

  // 5. Préparer les données par commune (sans coords pour l'instant)
  console.log(`\n  Préparation des données pour ${targetCodes.length} communes…`);
  const preparedByCode = new Map();
  let withoutMG = 0;
  const categoryCounts = { critique: 0, desert: 0, sous_densite: 0, correct: 0, bon: 0 };

  for (const code of targetCodes) {
    let name = null;
    const millesimesSet = new Set();
    const aplByMillesime = new Map();

    for (const p of PROFESSIONS) {
      const byMillesime = aplByProf[p.key];
      for (const [millesime, byCode] of byMillesime) {
        millesimesSet.add(millesime);
        const row = byCode.get(code);
        if (!row) continue;
        if (!name && row.name) name = row.name;
        if (!aplByMillesime.has(millesime)) aplByMillesime.set(millesime, {});
        if (typeof row.apl === 'number') {
          aplByMillesime.get(millesime)[p.key] = row.apl;
        }
      }
    }

    if (!name) continue;

    const deptCode = getDepartmentCode(code);
    const millesimes = [...millesimesSet].sort().map((annee) => ({
      annee,
      apl: aplByMillesime.get(annee) ?? {},
    }));

    const latestApl = millesimes.at(-1)?.apl?.medecin_generaliste;
    const categoryMG = categorizeMG(latestApl);
    if (categoryMG == null) withoutMG++;
    else categoryCounts[categoryMG]++;

    preparedByCode.set(code, {
      code,
      name,
      department: deptCode,
      departmentName: getDepartmentName(deptCode),
      millesimes,
      categoryMG,
    });
  }

  // 6. Récupérer les coords BAN avec concurrence 6 (comme fetchHubeau)
  console.log(`\n  Récupération des coordonnées via BAN (${preparedByCode.size} communes)…`);
  const codes = [...preparedByCode.keys()];
  const CONCURRENT = 6;
  const BATCH_DELAY = 200;
  let coordsCount = 0;
  let coordsMissing = 0;
  const t0 = Date.now();

  for (let i = 0; i < codes.length; i += CONCURRENT) {
    const batch = codes.slice(i, i + CONCURRENT);
    await Promise.all(
      batch.map(async (code) => {
        const entry = preparedByCode.get(code);
        const coords = await fetchCoords(code, entry.name);
        entry.coords = coords;
        if (coords) coordsCount++;
        else coordsMissing++;
      }),
    );
    if (i % 60 === 0 || i + CONCURRENT >= codes.length) {
      const done = Math.min(i + CONCURRENT, codes.length);
      const pct = ((done / codes.length) * 100).toFixed(1);
      const elapsed = Date.now() - t0;
      const eta = done > 0 ? Math.round(((elapsed / done) * (codes.length - done)) / 1000) : 0;
      process.stdout.write(`\r    ${done}/${codes.length} (${pct}%) — coords: ${coordsCount}, miss: ${coordsMissing}, ETA: ${eta}s    `);
    }
    if (i + CONCURRENT < codes.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY));
    }
  }
  process.stdout.write('\n');

  // 7. Écrire les fichiers
  console.log(`\n  Écriture de ${preparedByCode.size} fichiers cache…`);
  let written = 0;
  for (const [code, entry] of preparedByCode) {
    const out = {
      ...entry,
      fetchedAt: new Date().toISOString(),
    };
    writeFileSync(join(CACHE_DIR, `${code}.json`), JSON.stringify(out));
    written++;
  }

  // 6. _meta.json
  const meta = {
    fetchedAt: new Date().toISOString(),
    source: 'data.drees.solidarites-sante.gouv.fr — dataset 530',
    totalCommunes: written,
    millesimesDispos: [...new Set(
      Object.values(aplByProf).flatMap((m) => [...m.keys()]),
    )].sort(),
    professions: PROFESSIONS.map((p) => p.key),
    categoryCounts,
    withoutMG,
  };
  writeFileSync(META_PATH, JSON.stringify(meta, null, 2));

  console.log(`\n✓ ${written} communes écrites dans .cache/drees-apl/`);
  if (withoutMG) console.log(`  ⚠ ${withoutMG} communes sans valeur APL médecin généraliste`);
  console.log('  Répartition catégories (médecins généralistes) :');
  for (const [cat, count] of Object.entries(categoryCounts)) {
    console.log(`    ${cat.padEnd(14)} : ${count}`);
  }
  console.log();
}

main().catch((err) => {
  console.error('\n✗ Échec :', err.message);
  console.error(err.stack);
  process.exit(1);
});
