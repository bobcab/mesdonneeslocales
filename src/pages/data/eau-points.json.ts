import type { APIRoute } from 'astro';
import { listAvailableCommunes, getCommuneData } from '../../lib/hubeau';

/**
 * Endpoint statique servant la liste des points communes pour la carte eau.
 * Généré au build, hébergé sous /data/eau-points.json.
 * Évite d'inclure 34 000 points dans le HTML inline de la page index.
 */
export const GET: APIRoute = () => {
  const features = listAvailableCommunes()
    .map((code) => {
      const d = getCommuneData(code);
      if (!d || d.empty || !d.coords) return null;
      return {
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: d.coords },
        properties: {
          code: d.code,
          name: d.name ?? code,
          compliant: d.compliantOverall ? 1 : 0,
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
