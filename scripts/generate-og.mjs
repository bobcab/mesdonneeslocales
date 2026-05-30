#!/usr/bin/env node
/**
 * Génère public/og-default.png (1200×630) à partir d'un SVG inline.
 * À relancer si la baseline / les couleurs changent.
 *
 *   node scripts/generate-og.mjs
 *
 * Utilise sharp (installé en tant que dépendance transitive d'Astro).
 */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const outPath = join(__dirname, '..', 'public', 'og-default.png');

// NOTE : ce script est conservé pour pouvoir régénérer l'image OG en cas de changement
// de charte. L'OG livrée par le designer (Piste A, package/public/og-default.png) est en
// place dans `public/og-default.png` et n'a pas à être écrasée par ce script tant que la
// charte n'évolue pas. Ne pas exécuter sans nécessité — on perd le rendu typographique
// soigné du designer.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- Fond warm beige (Piste A) -->
  <rect width="1200" height="630" fill="#f5f4f0"/>

  <!-- Bandeau indigo sur le côté gauche -->
  <rect x="0" y="0" width="12" height="630" fill="#4f46e5"/>

  <!-- Kicker (étiquette en haut) -->
  <text x="100" y="160" font-family="'Open Sans', system-ui, sans-serif" font-size="18" font-weight="600" fill="#6b7280" letter-spacing="3">
    L'OBSERVATOIRE CITOYEN
  </text>

  <!-- Title -->
  <text x="100" y="260" font-family="'Poppins', system-ui, sans-serif" font-size="72" font-weight="700" fill="#111827">
    Mes données locales
  </text>

  <!-- Baseline -->
  <text x="100" y="340" font-family="'Open Sans', system-ui, sans-serif" font-size="34" font-weight="400" fill="#374151">
    Savoir, c'est pouvoir.
  </text>

  <!-- Tagline -->
  <text x="100" y="480" font-family="'Open Sans', system-ui, sans-serif" font-size="22" font-weight="400" fill="#374151">
    Données publiques fiables, cartographiées et qualifiées,
  </text>
  <text x="100" y="515" font-family="'Open Sans', system-ui, sans-serif" font-size="22" font-weight="400" fill="#374151">
    pour mieux comprendre votre territoire.
  </text>

  <!-- URL bottom-right -->
  <text x="1100" y="580" text-anchor="end" font-family="'Open Sans', system-ui, sans-serif" font-size="20" font-weight="600" fill="#4f46e5">
    mesdonneeslocales.fr
  </text>

  <!-- Trois points colorés en bas à droite (indigo brand + ambre accent + teal eau) -->
  <circle cx="1010" cy="540" r="8" fill="#4f46e5"/>
  <circle cx="1040" cy="540" r="8" fill="#f59e0b"/>
  <circle cx="1070" cy="540" r="8" fill="#1D9E75"/>
</svg>`;

const buffer = await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toBuffer();

await writeFile(outPath, buffer);
console.log(`✓ Image OG générée : ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
