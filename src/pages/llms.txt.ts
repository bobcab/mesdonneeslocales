import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

const SITE = 'https://mesdonneeslocales.fr';

/**
 * Catégorisation des pages éditoriales pour le regroupement dans llms.txt.
 * L'ordre des sections de la sortie suit l'ordre de déclaration ici.
 */
const SECTIONS: Array<{
  title: string;
  match: (p: CollectionEntry<'pages'>) => boolean;
}> = [
  { title: 'À propos du projet', match: (p) => ['a-propos', 'methodologie', 'faq'].includes(p.data.slug) },
  { title: 'Participer', match: (p) => ['je-participe', 'contact'].includes(p.data.slug) },
  { title: 'Légal', match: (p) => ['mentions-legales', 'confidentialite', 'accessibilite'].includes(p.data.slug) },
];

export const GET: APIRoute = async () => {
  const cartos = (await getCollection('cartographies')).sort(
    (a, b) => a.data.order - b.data.order,
  );
  const pages = await getCollection('pages');

  const lines: string[] = [];
  lines.push('# Mes données locales');
  lines.push('');
  lines.push(
    "> Plateforme citoyenne d'accès aux données publiques françaises, cartographiées et qualifiées. Éditée par l'association L'Observatoire citoyen (loi 1901, créée en 2025).",
  );
  lines.push('');

  if (cartos.length > 0) {
    lines.push('## Cartographies');
    for (const c of cartos) {
      const slug = c.id.replace(/\.md$/, '');
      const hint = c.data.shortDescription ?? c.data.description.split('\n')[0];
      lines.push(`- [${c.data.title}](${SITE}/cartographies/${slug}/): ${trimSentence(hint)}`);
    }
    lines.push('');
  }

  for (const section of SECTIONS) {
    const items = pages.filter(section.match);
    if (items.length === 0) continue;
    lines.push(`## ${section.title}`);
    for (const p of items) {
      lines.push(`- [${p.data.title}](${SITE}/${p.data.slug}/): ${trimSentence(p.data.description)}`);
    }
    lines.push('');
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

function trimSentence(s: string, max = 160): string {
  const single = s.replace(/\s+/g, ' ').trim();
  if (single.length <= max) return single;
  return single.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}
