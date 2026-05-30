/**
 * Lecture build-time du cache Hub'Eau alimenté par `scripts/fetch-hubeau.mjs`.
 *
 * Au build, Astro lit les fichiers JSON pour générer une page par commune
 * (`getStaticPaths`) et indexer les agrégats par département pour la carte
 * choroplèthe.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CACHE_DIR = join(process.cwd(), '.cache', 'hubeau');

export interface HubeauParam {
  code: string;
  label: string;
  value: number | string;
  unit: string;
  reference: string | null;
  limit: string | null;
  compliant_pc: boolean;
  compliant_bact: boolean;
  date: string;
}

/** Point d'historique léger pour un paramètre (date + valeur + conformité). */
export interface HubeauHistoryPoint {
  date: string; // YYYY-MM-DD
  value: number;
  c: 0 | 1; // 1 = conforme PC
}

export interface HubeauCommune {
  code: string;
  empty?: boolean;
  name?: string;
  department?: string;
  departmentName?: string;
  distributor?: string;
  network?: string;
  lastSampleDate?: string;
  conclusion?: string;
  compliantOverall?: boolean;
  samplesCount?: number;
  paramsCount?: number;
  params: Record<string, HubeauParam>;
  /** Historique 12 mois des paramètres principaux (séries numériques uniquement). */
  history?: Record<string, HubeauHistoryPoint[]>;
  /** Liste complète des paramètres mesurés lors du DERNIER prélèvement (utilisé pour le CSV). */
  lastSampleAllParams?: HubeauParam[];
  /** Coordonnées géographiques [lon, lat] récupérées via la BAN (centroïde). */
  coords?: [number, number] | null;
  fetchedAt?: string;
}

/**
 * Paramètres principaux affichés en priorité (ordre = ordre d'affichage).
 * Les paramètres absents de cette liste sont regroupés dans "Autres paramètres".
 */
export const PRINCIPAL_PARAM_CODES = [
  'NO3',     // Nitrates
  'NO2',     // Nitrites
  'PH',      // pH
  'TH',      // Dureté
  'CL2LIB',  // Chlore libre
  'ECOLI',   // E. coli
  'CTF',     // Coliformes
  'PB',      // Plomb
] as const;

/** Codes paramètres PFAS — détectés par préfixe `PF` */
export function isPfasCode(code: string): boolean {
  return /^PF[A-Z]+[A-Z0-9]*$/i.test(code) || code === 'SPFAS';
}

/**
 * Charge la liste des communes disponibles dans le cache.
 * Retourne uniquement les communes avec données (filtre `empty`).
 * Les fichiers techniques préfixés `_` (ex. _communes-list.json) sont ignorés.
 *
 * Résultat mis en cache mémoire pour ne pas re-scanner à chaque appel pendant le build
 * (notamment depuis getStaticPaths qui peut être appelé indirectement plusieurs fois).
 */
let _availableCommunesCache: string[] | undefined;
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
      return data !== null && !data.empty;
    });
  return _availableCommunesCache;
}

const _communeCache = new Map<string, HubeauCommune | null>();
export function getCommuneData(code: string): HubeauCommune | null {
  const hit = _communeCache.get(code);
  if (hit !== undefined) return hit;
  const path = join(CACHE_DIR, `${code}.json`);
  if (!existsSync(path)) {
    _communeCache.set(code, null);
    return null;
  }
  try {
    const data = JSON.parse(readFileSync(path, 'utf-8')) as HubeauCommune;
    _communeCache.set(code, data);
    return data;
  } catch {
    _communeCache.set(code, null);
    return null;
  }
}

export interface CommuneSummary {
  code: string;
  name: string;
  department: string;
  departmentName: string;
  compliant: boolean;
}

/** Récupère un résumé léger de chaque commune dispo (pour index, recherche). */
export function listCommunesSummary(): CommuneSummary[] {
  return listAvailableCommunes()
    .map((code) => {
      const d = getCommuneData(code);
      if (!d || d.empty || !d.name) return null;
      return {
        code: d.code,
        name: d.name,
        department: d.department ?? '',
        departmentName: d.departmentName ?? '',
        compliant: d.compliantOverall ?? false,
      };
    })
    .filter((s): s is CommuneSummary => s !== null)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

/**
 * Agrégation par département : nombre de communes, taux de conformité.
 * Utilisé par la carte choroplèthe (session C).
 */
export interface DepartmentAggregate {
  code: string;
  name: string;
  totalCommunes: number;
  compliantCommunes: number;
  complianceRate: number; // 0-1
}

export function aggregateByDepartment(): DepartmentAggregate[] {
  const byDept = new Map<string, { name: string; total: number; compliant: number }>();
  for (const code of listAvailableCommunes()) {
    const d = getCommuneData(code);
    if (!d || d.empty || !d.department) continue;
    const entry = byDept.get(d.department) ?? {
      name: d.departmentName ?? d.department,
      total: 0,
      compliant: 0,
    };
    entry.total += 1;
    if (d.compliantOverall) entry.compliant += 1;
    byDept.set(d.department, entry);
  }
  return Array.from(byDept.entries())
    .map(([code, e]) => ({
      code,
      name: e.name,
      totalCommunes: e.total,
      compliantCommunes: e.compliant,
      complianceRate: e.total > 0 ? e.compliant / e.total : 0,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * Génère un CSV (texte brut) du dernier prélèvement d'une commune — 1 ligne par paramètre.
 * Utilisé en data URI dans le bouton de téléchargement de la fiche commune.
 */
export function buildLastSampleCsv(commune: HubeauCommune): string {
  const rows = commune.lastSampleAllParams ?? [];
  const header = [
    'code_parametre',
    'libelle_parametre',
    'valeur',
    'unite',
    'reference_qualite',
    'limite_qualite',
    'conformite_physico_chimique',
    'conformite_bacteriologique',
    'date_prelevement',
  ];
  const lines = [header.join(',')];
  for (const r of rows) {
    const cells = [
      r.code,
      r.label,
      String(r.value ?? ''),
      r.unit ?? '',
      r.reference ?? '',
      r.limit ?? '',
      r.compliant_pc ? 'C' : 'NC',
      r.compliant_bact ? 'C' : 'NC',
      r.date,
    ];
    lines.push(cells.map(escapeCsv).join(','));
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
 * Date de dernier import (mtime du fichier le plus récent dans le cache).
 * Affiché en pied de page de la fiche commune.
 * Mis en cache mémoire pour ne pas re-scanner le dossier à chaque page lors du build.
 */
let _lastImportCache: Date | null | undefined;
export function getLastImportDate(): Date | null {
  if (_lastImportCache !== undefined) return _lastImportCache;
  if (!existsSync(CACHE_DIR)) {
    _lastImportCache = null;
    return null;
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
