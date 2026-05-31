#!/usr/bin/env node
/**
 * Génère public/og-default.png (1200×630) à partir d'un SVG inline.
 * À relancer si la baseline / les couleurs changent.
 *
 *   node scripts/generate-og.mjs
 *
 * Utilise sharp (installé en tant que dépendance transitive d'Astro).
 * Charte Piste B : bleu de Prusse (#0a1f3d) + ocre (#92400e) + paper (#f5f4f0)
 * + Playfair Display italic + Inter.
 */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const outPath = join(__dirname, '..', 'public', 'og-default.png');

// Pattern « drapeau éditorial » : wordmark mdl + filet ocre + tagline,
// puis manifeste « L'information est un bien commun. » en Playfair italic.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- Fond paper (beige chaud Piste B) -->
  <rect width="1200" height="630" fill="#f5f4f0"/>

  <!-- Bloc logo mdl en haut à gauche -->
  <text x="100" y="180"
        font-family="'Playfair Display', Georgia, serif"
        font-style="italic" font-weight="900" font-size="120"
        letter-spacing="-4.8" fill="#0a1f3d">mdl</text>
  <rect x="100" y="200" width="42" height="4" fill="#92400e"/>
  <text x="158" y="215"
        font-family="Inter, system-ui, sans-serif"
        font-weight="500" font-size="13" letter-spacing="1.6"
        fill="#0a1f3d" opacity="0.8">SAVOIR C'EST POUVOIR</text>

  <!-- Manifeste central en Playfair italic -->
  <text x="100" y="380"
        font-family="'Playfair Display', Georgia, serif"
        font-style="italic" font-weight="900" font-size="68"
        letter-spacing="-2.7" fill="#0a1f3d">L'information</text>
  <text x="100" y="455"
        font-family="'Playfair Display', Georgia, serif"
        font-style="italic" font-weight="900" font-size="68"
        letter-spacing="-2.7" fill="#0a1f3d">est un bien commun.</text>

  <!-- URL bottom-right -->
  <text x="1100" y="580" text-anchor="end"
        font-family="Inter, system-ui, sans-serif"
        font-size="20" font-weight="500" fill="#0a1f3d">
    mesdonneeslocales.fr
  </text>

  <!-- Filet ocre signature en bas à gauche -->
  <rect x="100" y="555" width="120" height="3" fill="#92400e"/>
</svg>`;

const buffer = await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toBuffer();

await writeFile(outPath, buffer);
console.log(`✓ Image OG générée : ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
