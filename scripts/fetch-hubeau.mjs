#!/usr/bin/env node
/**
 * fetch-hubeau.mjs — récupère les derniers résultats du contrôle sanitaire
 * de l'eau potable depuis l'API publique Hub'Eau, pour une liste de communes.
 *
 * Usage :
 *   node scripts/fetch-hubeau.mjs                 # 10 communes de test
 *   node scripts/fetch-hubeau.mjs --all           # toutes les communes (long, ~25 min)
 *   node scripts/fetch-hubeau.mjs --communes=75056,13055,69123  # liste explicite
 *
 * Cache : .cache/hubeau/<code>.json — JSON compact contenant les derniers
 * prélèvements par paramètre principal.
 *
 * Politesse vis-à-vis de l'API :
 *  - concurrence limitée (CONCURRENT_REQUESTS)
 *  - délai entre lots
 *  - retry exponentiel sur erreur 429/5xx
 */

import { mkdirSync, existsSync, writeFileSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const CACHE_DIR = join(ROOT, '.cache', 'hubeau');

const API = 'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis';
const API_COMMUNES = 'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/communes_udi';
const CONCURRENT_REQUESTS = 6;
const BATCH_DELAY_MS = 200;
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours
const COMMUNES_LIST_PATH = join(process.cwd(), '.cache', 'hubeau', '_communes-list.json');

/**
 * 10 communes de test choisies pour leur diversité :
 * - 5 grandes métropoles (Paris, Marseille, Lyon, Toulouse, Nice)
 * - 2 villes moyennes (Bordeaux, Nantes)
 * - 1 commune ultramarine (Saint-Denis Réunion)
 * - 2 communes rurales (Mende Lozère, Rocamadour Lot)
 */
const TEST_COMMUNES = [
  '75056', // Paris
  '13055', // Marseille
  '69123', // Lyon
  '31555', // Toulouse
  '06088', // Nice
  '33063', // Bordeaux
  '44109', // Nantes
  '97411', // Saint-Denis (Réunion)
  '48095', // Mende (Lozère)
  '46240', // Rocamadour (Lot)
];

/**
 * Paramètres réglementaires principaux qu'on veut systématiquement extraire.
 * Codes `code_parametre_se` réels observés dans Hub'Eau.
 *
 * Les autres paramètres sont aussi conservés mais marqués comme "secondaires"
 * et regroupés à l'affichage.
 */
const PRINCIPAL_PARAMS = new Set([
  'NO3',     // Nitrates
  'NO2',     // Nitrites
  'PTOT',    // Pesticides totaux
  'PH',      // pH
  'TH',      // Dureté (titre hydrotimétrique)
  'CL2LIB',  // Chlore libre
  'CL2TOT',  // Chlore total
  'PB',      // Plomb
  'CDT25',   // Conductivité 25°C
  'CU',      // Cuivre
  'AS',      // Arsenic
  'FET',     // Fer total
  'ECOLI',   // Escherichia coli
  'CTF',     // Bactéries coliformes
  'STRF',    // Entérocoques
  'NH4',     // Ammonium
  'TURBNFU', // Turbidité
  'THM4',    // Trihalométhanes
]);

function parseArgs(argv) {
  const args = { all: false, communes: null, sample: null };
  for (const a of argv.slice(2)) {
    if (a === '--all') args.all = true;
    else if (a.startsWith('--sample=')) {
      args.sample = parseInt(a.slice('--sample='.length), 10);
    } else if (a.startsWith('--communes=')) {
      args.communes = a.slice('--communes='.length).split(',').filter(Boolean);
    }
  }
  return args;
}

function readCache(code) {
  const p = join(CACHE_DIR, `${code}.json`);
  if (!existsSync(p)) return null;
  const age = Date.now() - statSync(p).mtimeMs;
  if (age > CACHE_TTL_MS) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf-8'));
  } catch {
    return null;
  }
}

function writeCache(code, data) {
  writeFileSync(join(CACHE_DIR, `${code}.json`), JSON.stringify(data));
}

/**
 * Récupère les derniers résultats Hub'Eau pour une commune.
 * size=500 + date_min_prelevement = J-380 → couvre les 12 derniers mois pour la majorité
 * des communes. Pour Paris (très fréquence), on a ~3 mois (toujours utile).
 */
async function fetchCommune(code, attempt = 1) {
  const minDate = new Date(Date.now() - 380 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const url = `${API}?code_commune=${code}&size=500&sort=desc&date_min_prelevement=${minDate}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      if ((res.status === 429 || res.status >= 500) && attempt < 4) {
        const backoff = 500 * 2 ** attempt;
        await new Promise((r) => setTimeout(r, backoff));
        return fetchCommune(code, attempt + 1);
      }
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    const compactData = compact(code, json);
    // Enrichissement avec les coordonnées (centroïde) via BAN api-adresse
    if (!compactData.empty && compactData.name) {
      compactData.coords = await fetchCoords(code, compactData.name);
    }
    return compactData;
  } catch (err) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      return fetchCommune(code, attempt + 1);
    }
    throw err;
  }
}

/**
 * Récupère les coordonnées (centroïde lon/lat) d'une commune via la BAN.
 * Recherche par nom + filtre citycode pour fiabilité.
 * Échec gracieux : retourne null si l'API ne renvoie rien.
 */
async function fetchCoords(code, name) {
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

/**
 * Transforme la réponse Hub'Eau en structure compacte :
 *   - métadonnées de la commune
 *   - dernier prélèvement (statut de conformité globale)
 *   - dernière valeur par paramètre principal (avec date, seuil, conformité)
 */
function compact(code, json) {
  const data = json?.data ?? [];
  if (data.length === 0) {
    return { code, empty: true, fetchedAt: new Date().toISOString() };
  }

  // 1er résultat = plus récent (tri desc)
  const first = data[0];

  // Indexer toutes les valeurs par code_parametre_se (gardées dans l'ordre desc).
  // Pour chaque paramètre, on garde la dernière valeur (instantané) ET la série (history).
  const byParamLatest = new Map();
  const historyByParam = new Map();
  const allPrelevements = new Set();
  const allParams = new Set();

  for (const row of data) {
    const param = row.code_parametre_se;
    if (!param) continue;
    allPrelevements.add(row.code_prelevement);
    allParams.add(param);

    // Latest
    const existing = byParamLatest.get(param);
    if (!existing || new Date(row.date_prelevement) > new Date(existing.date_prelevement)) {
      byParamLatest.set(param, row);
    }

    // History — uniquement pour les paramètres principaux (PFAS exclus pour la taille)
    if (PRINCIPAL_PARAMS.has(param)) {
      const value = row.resultat_numerique;
      // On ne garde que les valeurs numériques pour la série (pH, NO3...) — pas les qualitatifs
      if (typeof value === 'number') {
        if (!historyByParam.has(param)) historyByParam.set(param, []);
        historyByParam.get(param).push({
          date: row.date_prelevement,
          value,
          compliant_pc: row.conformite_limites_pc_prelevement === 'C',
        });
      }
    }
  }

  // Dernière valeur de chaque paramètre principal (+ PFAS détectés)
  const params = {};
  for (const [paramCode, row] of byParamLatest) {
    const isPrincipal = PRINCIPAL_PARAMS.has(paramCode);
    const isPfas = /PFAS|perfluor/i.test(row.libelle_parametre ?? '');
    if (!isPrincipal && !isPfas) continue;
    params[paramCode] = {
      code: paramCode,
      label: row.libelle_parametre,
      value: row.resultat_numerique ?? row.resultat_alphanumerique,
      unit: row.libelle_unite,
      reference: row.reference_qualite_parametre,
      limit: row.limite_qualite_parametre,
      compliant_pc: row.conformite_limites_pc_prelevement === 'C',
      compliant_bact: row.conformite_limites_bact_prelevement === 'C',
      date: row.date_prelevement,
    };
  }

  // Snapshot complet du DERNIER prélèvement (pour le CSV) — tous les paramètres mesurés ce jour-là
  const lastSampleCode = first.code_prelevement;
  const lastSampleRows = data
    .filter((r) => r.code_prelevement === lastSampleCode)
    .map((r) => ({
      code: r.code_parametre_se,
      label: r.libelle_parametre,
      value: r.resultat_numerique ?? r.resultat_alphanumerique,
      unit: r.libelle_unite,
      reference: r.reference_qualite_parametre,
      limit: r.limite_qualite_parametre,
      compliant_pc: r.conformite_limites_pc_prelevement === 'C',
      compliant_bact: r.conformite_limites_bact_prelevement === 'C',
      date: r.date_prelevement,
    }));

  // Sérialise l'historique en tri asc (chronologique) pour les sparklines
  const history = {};
  for (const [paramCode, series] of historyByParam) {
    history[paramCode] = series
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((p) => ({ date: p.date.slice(0, 10), value: p.value, c: p.compliant_pc ? 1 : 0 }));
  }

  return {
    code,
    name: first.nom_commune,
    department: first.code_departement,
    departmentName: first.nom_departement,
    distributor: first.nom_distributeur,
    network: first.reseaux?.[0]?.nom,
    lastSampleDate: first.date_prelevement,
    conclusion: first.conclusion_conformite_prelevement,
    compliantOverall:
      first.conformite_limites_pc_prelevement === 'C' &&
      first.conformite_limites_bact_prelevement === 'C',
    samplesCount: allPrelevements.size,
    paramsCount: allParams.size,
    params,
    history,
    lastSampleAllParams: lastSampleRows,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Récupère la liste des codes INSEE de toutes les communes ayant des données
 * dans Hub'Eau. Pagine via /communes_udi, déduplique. Cache local 30 jours.
 */
async function listAllCommuneCodes() {
  // Lecture cache si récent
  if (existsSync(COMMUNES_LIST_PATH)) {
    const age = Date.now() - statSync(COMMUNES_LIST_PATH).mtimeMs;
    if (age < CACHE_TTL_MS) {
      try {
        const codes = JSON.parse(readFileSync(COMMUNES_LIST_PATH, 'utf-8'));
        if (Array.isArray(codes) && codes.length > 0) return codes;
      } catch {
        // cache corrompu → on refetch
      }
    }
  }

  console.log('  → récupération de la liste des communes Hub\'Eau...');
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

  const codes = new Set();
  const size = 10000;
  let page = 1;
  let totalPages = null;

  while (true) {
    const url = `${API_COMMUNES}?size=${size}&page=${page}&fields=code_commune`;
    let attempt = 0;
    let json = null;
    while (attempt < 3) {
      try {
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok && res.status !== 206) {
          throw new Error(`HTTP ${res.status}`);
        }
        json = await res.json();
        break;
      } catch (err) {
        attempt++;
        if (attempt >= 3) throw err;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    if (!json?.data) break;
    for (const row of json.data) {
      if (row.code_commune) codes.add(row.code_commune);
    }

    if (!totalPages) {
      totalPages = Math.ceil((json.count ?? 0) / size);
    }
    process.stdout.write(`\r    page ${page}/${totalPages} — ${codes.size} communes uniques`);

    if (!json.next || page >= totalPages) break;
    page++;
    await new Promise((r) => setTimeout(r, 100)); // politesse API
  }
  process.stdout.write('\n');

  const list = Array.from(codes).sort();
  writeFileSync(COMMUNES_LIST_PATH, JSON.stringify(list));
  console.log(`  ✓ ${list.length} communes recensées (cache écrit).\n`);
  return list;
}

async function runBatch(communes) {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

  let done = 0;
  let cached = 0;
  let fetched = 0;
  let failed = 0;
  const total = communes.length;
  const t0 = Date.now();

  function formatEta(ms) {
    if (!isFinite(ms) || ms < 0) return '--';
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    if (m < 60) return `${m}m${r.toString().padStart(2, '0')}s`;
    return `${Math.floor(m / 60)}h${(m % 60).toString().padStart(2, '0')}m`;
  }

  // Traitement par lots de CONCURRENT_REQUESTS
  for (let i = 0; i < total; i += CONCURRENT_REQUESTS) {
    const batch = communes.slice(i, i + CONCURRENT_REQUESTS);
    await Promise.all(
      batch.map(async (code) => {
        const cached_ = readCache(code);
        if (cached_) {
          cached++;
          done++;
          return;
        }
        try {
          const data = await fetchCommune(code);
          writeCache(code, data);
          fetched++;
        } catch (err) {
          if (failed < 10) {
            // évite de noyer le terminal pour les premiers échecs
            console.warn(`\n  ✗ ${code} — ${err.message}`);
          }
          failed++;
        }
        done++;
      }),
    );
    // Progress + ETA basé sur les communes restantes à FETCHER (les caches sont instantanés)
    const elapsed = Date.now() - t0;
    const remaining = total - done;
    const rate = fetched > 0 ? elapsed / fetched : 0;
    const etaMs = rate * remaining;
    const pct = ((done / total) * 100).toFixed(1);
    process.stdout.write(
      `\r  ${done}/${total} (${pct}%) — cache: ${cached}, fetch: ${fetched}, fail: ${failed} — ETA: ${formatEta(etaMs)}    `,
    );
    if (i + CONCURRENT_REQUESTS < total) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }
  process.stdout.write('\n');

  return { done, cached, fetched, failed };
}

async function main() {
  const args = parseArgs(process.argv);
  let communes;

  if (args.all || args.sample) {
    // Récupère la liste officielle depuis Hub'Eau (cache 30j)
    const allCodes = await listAllCommuneCodes();
    if (args.sample) {
      // Échantillon déterministe : on prend les N premiers codes triés
      communes = allCodes.slice(0, args.sample);
      console.log(`\n→ Mode échantillon : ${communes.length} communes (sur ${allCodes.length} disponibles)`);
    } else {
      communes = allCodes;
    }
  } else if (args.communes) {
    communes = args.communes;
  } else {
    communes = TEST_COMMUNES;
  }

  console.log(`\n→ Hub'Eau fetch — ${communes.length} commune(s)`);
  const t0 = Date.now();
  const stats = await runBatch(communes);
  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n✓ Terminé en ${dt}s — ${stats.fetched} récupérées, ${stats.cached} depuis cache, ${stats.failed} en erreur.\n`);
  if (stats.failed > 0 && stats.failed > stats.done * 0.05) {
    // tolère <5% d'échec (timeout sporadique sur quelques communes)
    console.warn(`  ⚠ ${stats.failed} échecs > 5% — vérifier la santé de l'API.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\n✗ Échec :', err.message);
  process.exit(1);
});
