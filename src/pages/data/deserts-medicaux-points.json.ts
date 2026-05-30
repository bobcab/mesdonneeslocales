import type { APIRoute } from 'astro';
import {
  listAvailableCommunes,
  getCommuneData,
  getLatestMG,
} from '../../lib/drees-apl';

/**
 * Endpoint statique servant la liste des points communes pour la carte déserts médicaux.
 * Généré au build, hébergé sous /data/deserts-medicaux-points.json.
 *
 * Format GeoJSON FeatureCollection — chaque feature porte :
 *  - geometry : Point [lon, lat]
 *  - properties.code : INSEE
 *  - properties.name : nom commune
 *  - properties.apl : APL médecins généralistes dernier millésime (number ou null)
 *  - properties.category : critique | desert | sous_densite | correct | bon | null
 *
 * À l'échelle complète (~36 000 communes), le fichier pèsera ~5 MB — chargé par MapLibre
 * directement via `data: '/data/deserts-medicaux-points.json'` (pas inline).
 */
export const GET: APIRoute = () => {
  const features = listAvailableCommunes()
    .map((code) => {
      const d = getCommuneData(code);
      if (!d || !d.coords) return null;
      return {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: d.coords },
        properties: {
          code: d.code,
          name: d.name,
          apl: getLatestMG(d),
          category: d.categoryMG,
        },
      };
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);

  const fc = {
    type: 'FeatureCollection' as const,
    features,
  };

  return new Response(JSON.stringify(fc), {
    headers: { 'Content-Type': 'application/geo+json' },
  });
};
