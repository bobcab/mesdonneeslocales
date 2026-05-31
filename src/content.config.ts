import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Cartographies — une carte = une page dédiée + des métadonnées riches
 * permettant la génération d'un Dataset Schema.org (Google Dataset Search)
 * et l'affichage d'une fiche complète (source, fraîcheur, licence...).
 */
const cartographies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cartographies' }),
  schema: ({ image }) =>
    z.object({
      // --- contenu éditorial
      title: z.string(),
      description: z.string(),
      shortDescription: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().min(10, "imageAlt doit décrire ce que montre l'image (≥10 caractères)"),
      ogImage: image().optional(),

      // --- type de gabarit
      /**
       * Gabarit de fiche cartographie :
       *   - 'mviewer' (défaut) : iframe MViewer embarquée — pour les cartos GIS existantes
       *   - 'native' : composant natif Astro/MapLibre — pour les cartos comme Hub'Eau (eau potable)
       */
      type: z.enum(['mviewer', 'native']).default('mviewer'),

      // --- accès à la cartographie
      url: z.string().url(), // legacy : lien direct MViewer (utilisé en interne, mais le visiteur passe par la page)
      mapUrl: z.string().url(), // URL effective MViewer (ouverte depuis la page interne)
      shareUrl: z.string().url().optional(), // lien à copier (par défaut = page interne)

      // --- catégorisation
      keywords: z.array(z.string()).default([]),
      category: z.string(), // catégorie principale : justice, environnement, énergie, santé, etc.
      subCategories: z.array(z.string()).default([]),
      typeapp: z.enum(['Carte', 'Tableau de bord', 'Geostorie', 'Module métier']).default('Carte'),

      // --- état
      status: z.enum(['new', 'updated', 'maintenance']).default('updated'),
      featured: z.boolean().default(false),
      order: z.number().default(100),

      // --- source des données (obligatoire pour Dataset Schema.org)
      source: z.object({
        name: z.string(),
        url: z.string().url(),
        license: z.string(),
        licenseUrl: z.string().url(),
      }),

      // --- fraîcheur (essentiel pour Dataset Schema.org et l'affichage)
      publishedAt: z.coerce.date().optional(),
      lastDataUpdate: z.coerce.date().optional(),
      updateFrequency: z
        .enum(['continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'irregular'])
        .default('irregular'),

      // --- diffusion
      spatialCoverage: z.string().default('France'),
      downloadFormats: z.array(z.string()).default([]),

      // --- legacy compatibilité affichage (auteur lisible) — on garde
      author: z.string(),

      // --- fiche détaillée (P4.2)
      /** URL du GeoJSON pour lecture au build (chiffres clés auto + tableau accessible).
       *  Si absent, on s'appuie uniquement sur keyFigures manuels. */
      geojsonUrl: z.string().url().optional(),

      /** Chiffres clés affichés au-dessus de la carte (max 4 recommandés).
       *  value peut contenir des unités (ex. "142", "128 %", "76 412"). */
      keyFigures: z
        .array(
          z.object({
            value: z.string(),
            label: z.string(),
          }),
        )
        .default([]),

      /** Bloc "Ce que dit cette cartographie" — chaque entrée = un point factuel. */
      says: z.array(z.string()).default([]),

      /** Bloc "Ce qu'elle ne dit pas" — limites assumées, pour éviter la sur-interprétation. */
      saysNot: z.array(z.string()).default([]),

      /** Colonnes du tableau de données accessible, mappées sur les propriétés GeoJSON.
       *  Ex. [{ key: 'etablissement', label: 'Établissement' }, ...] */
      tableColumns: z
        .array(
          z.object({
            key: z.string(),
            label: z.string(),
          }),
        )
        .default([]),

      /** Bloc méthodologie spécifique à la cartographie. */
      methodology: z
        .object({
          provenance: z.string().optional(),
          processing: z.string().optional(),
          limits: z.string().optional(),
          partner: z.string().optional(),
        })
        .optional(),

      /** Sources et liens externes pour aller plus loin. */
      furtherReading: z
        .array(
          z.object({
            label: z.string(),
            url: z.string().url(),
          }),
        )
        .default([]),
    }),
});

/**
 * Pages éditoriales (à propos, FAQ, méthodologie, légal, etc.).
 * Supporte .md (legacy) et .mdx (nouveau, permet d'utiliser les composants editorial/).
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string().min(50).max(200),
    keywords: z.array(z.string()).default([]),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    lastUpdated: z.coerce.date(),
    schemaType: z
      .enum(['AboutPage', 'TechArticle', 'FAQPage', 'ContactPage', 'WebPage'])
      .default('WebPage'),

    // Nouveau gabarit éditorial (optionnel — legacy md sans ces champs continuent de fonctionner)
    kicker: z.string().optional(),
    lead: z.string().min(20).optional(),
    toc: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          level: z.union([z.literal(2), z.literal(3)]).default(2),
        }),
      )
      .default([]),
  }),
});

/**
 * "En ce moment" — un seul fichier markdown (current.md) éditorialisé chaque mois.
 * Affiché en hero droit sur la home. Signal de fraîcheur + crochet narratif.
 */
const highlights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/highlights' }),
  schema: ({ image }) =>
    z.object({
      /** Question éditorialisée affichée en intro */
      question: z.string(),
      /** Chiffre fort (peut contenir des espaces/unités) */
      figure: z.string(),
      /** Contexte sous le chiffre (ex. "sur 188 établissements au 1er avril 2026") */
      context: z.string(),
      /** Lien vers la cartographie référencée */
      href: z.string(),
      /** Label du lien (ex. "Voir la cartographie complète") */
      linkLabel: z.string().default('Voir la cartographie'),
      /** Image isométrique 3D de la cartographie référencée, affichée en arrière-plan du hero magazine */
      heroImage: image().optional(),
      /** Texte alternatif de heroImage (vide = décorative). */
      heroImageAlt: z.string().default(''),
      /** Date d'édition de ce highlight (pour cache busting) */
      publishedAt: z.coerce.date(),
    }),
});

export const collections = { cartographies, pages, highlights };
