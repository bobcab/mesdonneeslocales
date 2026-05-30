/**
 * Lecture build-time du cache DREES APL alimenté par `scripts/fetch-drees-apl.mjs`.
 *
 * Au build, Astro lit les fichiers JSON pour générer une page par commune
 * (`getStaticPaths`) et indexer les agrégats par département pour la carte choroplèthe.
 *
 * Structure jumelle de `src/lib/hubeau.ts` — toute évolution doit garder les deux modules
 * alignés pour faciliter l'émergence éventuelle d'un module `commune-cache.ts` partagé.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CACHE_DIR = join(process.cwd(), '.cache', 'drees-apl');
const META_PATH = join(CACHE_DIR, '_meta.json');

/** Les 5 professions APL DREES. */
export type Profession =
  | 'medecin_generaliste'
  | 'infirmier'
  | 'sage_femme'
  | 'kine'
  | 'dentiste';

/** Catégories d'accessibilité selon les seuils DREES (médecins généralistes). */
export type APLCategory = 'critique' | 'desert' | 'sous_densite' | 'correct' | 'bon';

export interface APLMillesime {
  annee: number;
  apl: Partial<Record<Profession, number>>;
}

export interface CommuneAPL {
  code: string;
  name: string;
  department: string;
  departmentName: string;
  millesimes: APLMillesime[];
  /** Catégorie sur le dernier millésime, médecins généralistes uniquement. */
  categoryMG: APLCategory | null;
  /** Coordonnées géographiques [lon, lat] (centroïde BAN). Null si la BAN ne renvoie rien. */
  coords?: [number, number] | null;
  fetchedAt: string;
}

export interface CommuneAPLSummary {
  code: string;
  name: string;
  department: string;
  departmentName: string;
  categoryMG: APLCategory | null;
  /** APL médecins généralistes sur le dernier millésime (utile pour le tri). */
  aplMG: number | null;
}

export interface APLDepartmentAggregate {
  code: string;
  name: string;
  totalCommunes: number;
  /** Communes en désert ou critique (APL MG < 2.5). */
  desertsCommunes: number;
  /** Part des communes en désert (0-1). */
  desertsRate: number;
  /** Moyenne APL MG du département (non pondérée). */
  meanAPL: number;
}

export interface APLMeta {
  fetchedAt: string;
  source: string;
  totalCommunes: number;
  millesimesDispos: number[];
  professions: Profession[];
  categoryCounts: Record<APLCategory, number>;
  withoutMG: number;
}

/** Libellés FR des professions (utilisés à l'affichage). */
export const PROFESSION_LABELS: Record<Profession, string> = {
  medecin_generaliste: 'Médecin généraliste',
  infirmier: 'Infirmier·ère',
  sage_femme: 'Sage-femme',
  kine: 'Kinésithérapeute',
  dentiste: 'Chirurgien-dentiste',
};

/** Ordre d'affichage des professions (priorité éditoriale). */
export const PROFESSION_ORDER: readonly Profession[] = [
  'medecin_generaliste',
  'infirmier',
  'sage_femme',
  'kine',
  'dentiste',
] as const;

/**
 * Couleurs cartographiques par catégorie. Couleurs métier sémantiques, non liées
 * directement aux tokens `brand-*` ni `accent-*` de la palette globale (cf. note §6.4).
 */
export const CATEGORY_COLORS: Record<APLCategory, string> = {
  critique: '#993c1d', // rouge profond
  desert: '#d85a30', // rouge-orange
  sous_densite: '#f0997b', // corail
  correct: '#fcd34d', // ambre clair
  bon: '#1d9e75', // teal
};

/** Couleur appliquée aux communes sans donnée APL (DROM, communes hors champ). */
export const CATEGORY_COLOR_NODATA = '#9ca3af'; // ink-300

export const CATEGORY_LABELS: Record<APLCategory, string> = {
  critique: 'Désert médical critique',
  desert: 'Désert médical',
  sous_densite: 'Sous-densité',
  correct: 'Accessibilité correcte',
  bon: 'Bonne accessibilité',
};

/**
 * Seuils de catégorisation pour les médecins généralistes (note §1.2).
 * Pour les autres professions, les échelles sont différentes (infirmiers en centaines,
 * dentistes en dizaines, etc.) — ne pas appliquer ces seuils.
 */
export function categorizeAPL(apl: number | null | undefined): APLCategory | null {
  if (apl == null || !isFinite(apl)) return null;
  if (apl < 1.5) return 'critique';
  if (apl < 2.5) return 'desert';
  if (apl < 4.0) return 'sous_densite';
  if (apl < 6.0) return 'correct';
  return 'bon';
}

// ---------------------------------------------------------------------------
// Cache I/O (memoization pour éviter les scans/lectures répétés au build)
// ---------------------------------------------------------------------------

let _availableCommunesCache: string[] | undefined;
const _communeCache = new Map<string, CommuneAPL | null>();
let _lastImportCache: Date | null | undefined;
let _metaCache: APLMeta | null | undefined;

/**
 * Liste les codes commune disponibles dans le cache. Les fichiers techniques
 * (préfixe `_`) sont ignorés.
 */
export function listAvailableCommunes(): string[] {
  if (_availableCommunesCache !== undefined) return _availableCommunesCache;
  if (!existsSync(CACHE_DIR)) {
    _availableCommunesCache = [];
    return _availableCommunesCache;
  }
  _availableCommunesCache = readdirSync(CACHE_DIR)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .map((f) => f.replace(/\.json$/, ''))
    .filter((code) => {
      const data = getCommuneData(code);
      return data !== null;
    });
  return _availableCommunesCache;
}

export function getCommuneData(code: string): CommuneAPL | null {
  const hit = _communeCache.get(code);
  if (hit !== undefined) return hit;
  const path = join(CACHE_DIR, `${code}.json`);
  if (!existsSync(path)) {
    _communeCache.set(code, null);
    return null;
  }
  try {
    const data = JSON.parse(readFileSync(path, 'utf-8')) as CommuneAPL;
    _communeCache.set(code, data);
    return data;
  } catch {
    _communeCache.set(code, null);
    return null;
  }
}

/** Récupère l'APL médecins généralistes sur le dernier millésime (peut être null). */
export function getLatestMG(commune: CommuneAPL): number | null {
  const last = commune.millesimes.at(-1);
  const v = last?.apl?.medecin_generaliste;
  return typeof v === 'number' && isFinite(v) ? v : null;
}

/** Résumé léger pour la home / l'index. */
export function listCommunesSummary(): CommuneAPLSummary[] {
  return listAvailableCommunes()
    .map((code): CommuneAPLSummary | null => {
      const d = getCommuneData(code);
      if (!d) return null;
      return {
        code: d.code,
        name: d.name,
        department: d.department,
        departmentName: d.departmentName,
        categoryMG: d.categoryMG,
        aplMG: getLatestMG(d),
      };
    })
    .filter((s): s is CommuneAPLSummary => s !== null)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

/**
 * Agrégation par département pour le panneau contextuel de la carte de France.
 *
 * - `desertsCommunes` = communes dont l'APL MG dernier millésime < 2.5 (catégories
 *   `critique` et `desert`).
 * - `meanAPL` = moyenne arithmétique non pondérée (équivaut à la moyenne par commune,
 *   pas par habitant — utiliser pour comparer des départements, pas pour faire des
 *   statistiques de population).
 */
export function aggregateByDepartment(): APLDepartmentAggregate[] {
  const byDept = new Map<string, { name: string; total: number; deserts: number; sum: number; count: number }>();
  for (const code of listAvailableCommunes()) {
    const d = getCommuneData(code);
    if (!d) continue;
    const entry = byDept.get(d.department) ?? {
      name: d.departmentName ?? d.department,
      total: 0,
      deserts: 0,
      sum: 0,
      count: 0,
    };
    entry.total += 1;
    if (d.categoryMG === 'critique' || d.categoryMG === 'desert') entry.deserts += 1;
    const apl = getLatestMG(d);
    if (apl != null) {
      entry.sum += apl;
      entry.count += 1;
    }
    byDept.set(d.department, entry);
  }
  return Array.from(byDept.entries())
    .map(([code, e]) => ({
      code,
      name: e.name,
      totalCommunes: e.total,
      desertsCommunes: e.deserts,
      desertsRate: e.total > 0 ? e.deserts / e.total : 0,
      meanAPL: e.count > 0 ? e.sum / e.count : 0,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * Date du dernier import (mtime du `_meta.json` si présent, sinon mtime max des fichiers
 * communes). Affichée en pied de page de la fiche commune.
 */
export function getLastImportDate(): Date | null {
  if (_lastImportCache !== undefined) return _lastImportCache;
  if (!existsSync(CACHE_DIR)) {
    _lastImportCache = null;
    return null;
  }
  if (existsSync(META_PATH)) {
    _lastImportCache = new Date(statSync(META_PATH).mtimeMs);
    return _lastImportCache;
  }
  const files = readdirSync(CACHE_DIR).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
  if (files.length === 0) {
    _lastImportCache = null;
    return null;
  }
  let max = 0;
  for (const f of files) {
    const m = statSync(join(CACHE_DIR, f)).mtimeMs;
    if (m > max) max = m;
  }
  _lastImportCache = new Date(max);
  return _lastImportCache;
}

/** Lit le fichier `_meta.json` produit par le fetcher (millésimes dispos, etc.). */
export function getMeta(): APLMeta | null {
  if (_metaCache !== undefined) return _metaCache;
  if (!existsSync(META_PATH)) {
    _metaCache = null;
    return null;
  }
  try {
    _metaCache = JSON.parse(readFileSync(META_PATH, 'utf-8')) as APLMeta;
    return _metaCache;
  } catch {
    _metaCache = null;
    return null;
  }
}

// ---------------------------------------------------------------------------
// Export CSV
// ---------------------------------------------------------------------------

/**
 * Génère un CSV (texte brut) avec une ligne par profession × millésime.
 * Utilisé en data URI dans le bouton "Télécharger" de la fiche commune.
 *
 * Colonnes : code_commune, nom_commune, departement, millesime, profession_code,
 * profession_label, apl, categorie_mg.
 */
export function buildCommuneCsv(commune: CommuneAPL): string {
  const header = [
    'code_commune',
    'nom_commune',
    'departement',
    'millesime',
    'profession_code',
    'profession_label',
    'apl',
    'categorie_mg',
  ];
  const lines = [header.join(',')];

  for (const m of commune.millesimes) {
    for (const profKey of PROFESSION_ORDER) {
      const apl = m.apl[profKey];
      if (apl == null) continue;
      const cat = profKey === 'medecin_generaliste' ? categorizeAPL(apl) : '';
      const cells = [
        commune.code,
        commune.name,
        commune.department,
        String(m.annee),
        profKey,
        PROFESSION_LABELS[profKey],
        String(apl),
        cat ?? '',
      ];
      lines.push(cells.map(escapeCsv).join(','));
    }
  }
  return lines.join('\n');
}

function escapeCsv(value: string): string {
  if (/[",\n;]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

/**
 * Évolution d'une profession sur les millésimes disponibles, format prêt pour Sparkline.
 * Retourne [] si moins de 2 valeurs.
 */
export function getProfessionTrend(
  commune: CommuneAPL,
  profession: Profession,
): Array<{ date: string; value: number; c?: 0 | 1 }> {
  const points: Array<{ date: string; value: number; c?: 0 | 1 }> = [];
  for (const m of commune.millesimes) {
    const v = m.apl[profession];
    if (typeof v !== 'number' || !isFinite(v)) continue;
    // c = 1 si APL ≥ 2.5 (hors désert) pour les généralistes ; pour les autres on ne sait pas
    const c = profession === 'medecin_generaliste' ? ((v >= 2.5 ? 1 : 0) as 0 | 1) : undefined;
    points.push({ date: `${m.annee}-01-01`, value: v, c });
  }
  return points;
}
