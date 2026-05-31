#!/usr/bin/env node
/**
 * Génère public/og-default.png (1200×630) à partir d'un SVG inline.
 * À relancer si la baseline / les couleurs changent.
 *
 *   node scripts/generate-og.mjs
 *
 * Utilise sharp (installé en tant que dépendance transitive d'Astro).
 * Charte Piste B : bleu de Prusse (#0a1f3d) + ocre (#92400e) + paper (#f5f4f0).
 *
 * Le wordmark mdl est composé via les paths vectorisés (extraits de
 * src/assets/logo/mdl-wordmark.svg) pour ne pas dépendre du chargement de
 * Playfair Display Italic 900 dans sharp.
 */

import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const outPath = join(__dirname, '..', 'public', 'og-default.png');
const wordmarkPath = join(__dirname, '..', 'src', 'assets', 'logo', 'mdl-wordmark.svg');

// Charge le wordmark vectorisé (paths Playfair Italic 900 en dur).
const wordmark = await readFile(wordmarkPath, 'utf-8');

// Compose l'OG image : fond paper + wordmark scalé en haut à gauche + manifeste
// en gros à droite. Note : le manifeste utilise Inter italic en fallback Georgia
// — un visuel sobre suffit pour l'OG, le wordmark fait le boulot d'identité.
//
// On embed le wordmark via <svg><svg>...</svg></svg> nested (SVG 2.0 supporte
// les SVG imbriqués, et sharp/librsvg les rend correctement).
const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- Fond paper (beige chaud Piste B) -->
  <rect width="1200" height="630" fill="#f5f4f0"/>

  <!-- Wordmark mdl vectorisé en haut à gauche -->
  <svg x="80" y="80" width="380" height="198" viewBox="-27.0 -885.0 2262.0 1179.0">
    <g transform="scale(1, -1)" fill="#0a1f3d">
      <path d="M180 0H3L125 434Q130 450 129.5 459.0Q129 468 125.5 472.0Q122 476 114 476Q100 476 87.0 461.5Q74 447 61 413L38 352H19L47 430Q61 468 83.0 490.5Q105 513 133.0 523.0Q161 533 191 533Q228 533 249.0 521.0Q270 509 279.5 488.5Q289 468 288.5 443.0Q288 418 282 393ZM394 417Q398 431 400.5 441.0Q403 451 401.5 456.0Q400 461 392 461Q373 461 352.0 438.0Q331 415 308.0 372.5Q285 330 261.5 270.0Q238 210 214 135L201 143Q241 284 280.5 370.0Q320 456 369.5 494.5Q419 533 486 533Q519 533 538.5 522.5Q558 512 566.5 492.5Q575 473 573.5 445.0Q572 417 562 382L452 0H274ZM672 417Q680 440 679.5 450.5Q679 461 671 461Q658 461 639.5 445.5Q621 430 597.5 393.5Q574 357 547.5 294.0Q521 231 491 136L480 141Q513 262 545.5 338.5Q578 415 612.5 457.5Q647 500 684.5 516.5Q722 533 763 533Q807 533 829.0 514.5Q851 496 853.0 462.5Q855 429 839 382L740 85Q730 57 737.5 50.0Q745 43 752 43Q761 43 775.0 53.5Q789 64 805 106L826 162H845L820 89Q806 47 782.5 25.0Q759 3 731.5 -5.5Q704 -14 677 -14Q644 -14 620.5 -3.5Q597 7 584 28Q571 49 571.0 81.5Q571 114 586 158Z" transform="translate(0 0)"/>
      <path d="M460 85Q451 60 457.0 51.5Q463 43 472 43Q481 43 495.0 53.5Q509 64 525 106L546 162H565L540 89Q526 47 502.5 25.0Q479 3 451.5 -5.5Q424 -14 397 -14Q333 -14 307 24Q293 45 292.5 78.5Q292 112 306 158L441 667Q451 701 439.0 717.0Q427 733 378 733L385 754Q467 755 532.0 765.5Q597 776 656 795ZM210 48Q222 48 239.5 65.0Q257 82 278.0 120.5Q299 159 321.0 222.0Q343 285 364 376L349 268Q320 176 291.5 113.0Q263 50 225.0 18.0Q187 -14 128 -14Q94 -14 64.5 1.0Q35 16 17.0 48.0Q-1 80 -1 132Q-1 176 13.0 229.5Q27 283 54.5 336.0Q82 389 123.0 434.0Q164 479 217.5 506.0Q271 533 338 533Q377 533 389.5 520.5Q402 508 405 488L397 468Q393 488 387.0 499.0Q381 510 361 510Q343 510 320.0 488.5Q297 467 273.5 428.0Q250 389 230.0 338.0Q210 287 198.0 227.5Q186 168 186 105Q186 77 191.0 62.5Q196 48 210 48Z" transform="translate(847 0)"/>
      <path d="M169 85Q162 61 169.0 52.0Q176 43 185 43Q190 43 205.0 52.5Q220 62 236 106L257 162H276L251 89Q236 46 211.5 24.0Q187 2 160.0 -6.0Q133 -14 109 -14Q77 -14 53.5 -3.0Q30 8 17.0 29.5Q4 51 3.0 83.0Q2 115 15 158L168 667Q178 701 166.0 717.0Q154 733 105 733L112 754Q194 755 257.5 765.5Q321 776 380 795Z" transform="translate(1410 0)"/>
    </g>
    <rect x="0" y="100" width="300" height="30" fill="#92400e"/>
    <text x="400" y="180"
          font-family="Inter, system-ui, sans-serif"
          font-weight="500" font-size="100" letter-spacing="12"
          fill="#0a1f3d" opacity="0.75">SAVOIR C'EST POUVOIR</text>
  </svg>

  <!-- Filet ocre signature en bas à gauche -->
  <rect x="80" y="540" width="120" height="3" fill="#92400e"/>

  <!-- URL bottom-right -->
  <text x="1120" y="572" text-anchor="end"
        font-family="Inter, system-ui, sans-serif"
        font-weight="500" font-size="20" letter-spacing="0.5" fill="#0a1f3d">
    mesdonneeslocales.fr
  </text>

  <!-- Manifeste central : Inter italic 64px (fallback Georgia acceptable
       puisque le wordmark vectorisé porte déjà l'identité Playfair).
       Suppression du manifeste rend l'OG plus sobre, davantage focalisée
       sur la marque. -->
  <text x="80" y="400"
        font-family="Inter, system-ui, sans-serif"
        font-weight="500" font-size="48" letter-spacing="-0.5"
        fill="#0a1f3d">
    Plateforme citoyenne d'accès
  </text>
  <text x="80" y="460"
        font-family="Inter, system-ui, sans-serif"
        font-weight="500" font-size="48" letter-spacing="-0.5"
        fill="#0a1f3d">
    aux données publiques.
  </text>
</svg>`;

const buffer = await sharp(Buffer.from(ogSvg))
  .png({ compressionLevel: 9 })
  .toBuffer();

await writeFile(outPath, buffer);
console.log(`✓ Image OG générée : ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
