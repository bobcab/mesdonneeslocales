import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CACHE_DIR = join(process.cwd(), '.cache', 'geojson');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: unknown;
  properties: Record<string, unknown>;
}

export interface GeoJson {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

/**
 * Fetch un GeoJSON au build, avec cache disque 24h pour éviter les appels répétés.
 * Si l'URL est inaccessible, retourne null — l'appelant doit gérer ce cas.
 */
export async function loadGeoJson(url: string): Promise<GeoJson | null> {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

  const safe = url.replace(/[^a-zA-Z0-9_-]+/g, '_');
  const cachePath = join(CACHE_DIR, `${safe}.json`);

  // Cache hit récent ?
  if (existsSync(cachePath)) {
    const age = Date.now() - statSync(cachePath).mtimeMs;
    if (age < CACHE_TTL_MS) {
      try {
        return JSON.parse(readFileSync(cachePath, 'utf-8')) as GeoJson;
      } catch {
        // cache corrompu → on refetch
      }
    }
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json,application/geo+json' },
    });
    if (!res.ok) {
      console.warn(`[geojson] ${url} → HTTP ${res.status}`);
      return readStaleCache(cachePath);
    }
    const data = (await res.json()) as GeoJson;
    if (data?.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
      console.warn(`[geojson] ${url} → format inattendu`);
      return readStaleCache(cachePath);
    }
    writeFileSync(cachePath, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn(`[geojson] ${url} → fetch failed: ${(err as Error).message}`);
    return readStaleCache(cachePath);
  }
}

/** Si le fetch échoue mais qu'on a une vieille version en cache, on l'utilise. */
function readStaleCache(cachePath: string): GeoJson | null {
  if (!existsSync(cachePath)) return null;
  try {
    return JSON.parse(readFileSync(cachePath, 'utf-8')) as GeoJson;
  } catch {
    return null;
  }
}

/**
 * Récupère la valeur d'une propriété dans un Feature, en tolérant les variations de casse
 * et de typographie (espaces, accents).
 */
export function getProp(feature: GeoJsonFeature, key: string): unknown {
  const props = feature.properties;
  if (key in props) return props[key];
  const lower = key.toLowerCase();
  for (const k of Object.keys(props)) {
    if (k.toLowerCase() === lower) return props[k];
  }
  return undefined;
}

/**
 * Compte les features qui satisfont un prédicat.
 */
export function countWhere(
  geo: GeoJson,
  predicate: (f: GeoJsonFeature) => boolean,
): number {
  return geo.features.filter(predicate).length;
}
