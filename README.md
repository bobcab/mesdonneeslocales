# mesdonneeslocales-v2

Refonte de [mesdonneeslocales.fr](https://mesdonneeslocales.fr) avec **Astro** + **Tailwind CSS v4**.
Site statique multi-pages, contenu en Markdown, déploiement FTP incrémental depuis le poste local.

## Stack

- [Astro 6](https://astro.build) — générateur statique
- [Tailwind CSS v4](https://tailwindcss.com) — styles utility-first
- [Content Collections](https://docs.astro.build/en/guides/content-collections/) Astro — cartographies en Markdown typées via Zod
- `basic-ftp` — déploiement FTP incrémental
- TypeScript (strict)

## Prérequis

- Node.js **≥ 22.12** (`node --version`)
- npm

## Installation

```powershell
npm install
cp .env.example .env
# puis renseignez FTP_HOST / FTP_USER / FTP_PASS / FTP_REMOTE_DIR dans .env
```

## Développement

```powershell
npm run dev
```

Ouvre `http://localhost:4321`. Hot-reload sur tous les fichiers.

## Build

```powershell
npm run build
```

Sortie : `dist/`. C'est ce dossier qui est uploadé sur le serveur.

Aperçu local du build :

```powershell
npm run preview
```

## Déploiement FTP

Tout passe par un script unique qui build puis upload **uniquement les fichiers modifiés**, et supprime côté serveur les fichiers qui n'existent plus localement (sauf chemins protégés).

### Premier déploiement

1. Renseignez `.env` (cf. `.env.example`).
2. **Toujours** lancer un dry-run pour visualiser ce qui va changer :

   ```powershell
   npm run deploy:dry
   ```

3. Si le diff est correct, lancez le déploiement réel :

   ```powershell
   npm run deploy
   ```

### Scripts disponibles

| Script | Action |
| --- | --- |
| `npm run deploy:dry` | Build + simulation (rien n'est envoyé/supprimé) |
| `npm run deploy` | Build + upload incrémental + suppression des orphelins |
| `npm run deploy:only` | Upload sans rebuild (utile pour relancer après échec réseau) |

### Préserver des dossiers du serveur

`FTP_PROTECT` (dans `.env`) accepte une liste CSV de chemins distants qui **ne seront jamais supprimés** par le script.

Exemple :

```env
FTP_PROTECT=mviewer,geoserver,geonetwork
```

→ même si ces dossiers n'existent pas dans `dist/`, ils restent intacts sur le serveur. C'est le cas typique pour mviewer, déployé indépendamment.

## Structure

```
src/
  pages/                       # Routes (= URL)
    index.astro                #   /
    cartographies/index.astro  #   /cartographies/
  layouts/
    Base.astro                 # Layout commun (head + Header + Footer)
  components/
    Header.astro
    Footer.astro
    CartoCard.astro            # Carte d'une cartographie (catalog + featured)
    CopyLinkScript.astro       # Logique "copier le lien" + toast
  content/
    cartographies/             # Une cartographie = un .md (frontmatter + texte)
  content.config.ts            # Schema Zod des cartographies
  assets/                      # Images traitées par Astro (optim auto)
  styles/global.css            # Tailwind + tokens design

public/                        # Fichiers servis tels quels (favicon, manifest, robots, …)
scripts/deploy.mjs             # Script FTP incrémental
```

## Ajouter une cartographie

Créer un fichier `src/content/cartographies/mon-slug.md` :

```yaml
---
title: Titre de la carto
shortDescription: Phrase courte affichée dans la carte (~2 lignes).
description: |
  Description longue, multi-paragraphes,
  peut être formatée librement.
image: ../../assets/cartographies/mon-slug.png
url: https://mesdonneeslocales.fr/mviewer/#ma_carte.xml
shareUrl: https://mesdonneeslocales.fr/mviewer/#ma_carte.xml
author: L'Observatoire citoyen
keywords: [thème1, thème2]
typeapp: Carte           # Carte | Tableau de bord | Geostorie | Module métier
status: new              # new | updated | maintenance
featured: false          # true = visible sur la home
order: 10                # tri ascendant
---
```

Image à placer dans `src/assets/cartographies/mon-slug.png` (Astro optimise automatiquement → WebP responsive).

## TODO post-fondations

- [ ] Recherche + filtres (Fuse.js ou approche native)
- [ ] Pages légales (mentions, CGU, confidentialité, FAQ)
- [ ] PWA (service-worker, manifeste — à reconnecter)
- [ ] Open Graph / image de partage
- [ ] Tests visuels automatisés (Playwright ?)
