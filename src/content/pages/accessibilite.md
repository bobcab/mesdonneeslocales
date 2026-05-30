---
title: Déclaration d'accessibilité
slug: accessibilite
description: Déclaration d'accessibilité du site Mes données locales. Niveau de conformité au RGAA, résultats de l'audit, non-conformités connues, modalités de signalement.
keywords:
  - accessibilité
  - RGAA
  - handicap
  - WCAG
  - inclusion
ogTitle: Accessibilité — Mes données locales
ogDescription: Engagement et niveau de conformité du site à l'accessibilité numérique.
lastUpdated: 2026-05-29
schemaType: WebPage
---

L'Observatoire citoyen s'engage à rendre Mes données locales accessible au plus grand nombre, conformément à l'esprit de la loi du 11 février 2005 pour l'égalité des droits et des chances et au Référentiel général d'amélioration de l'accessibilité (RGAA).

Cette déclaration s'applique au site mesdonneeslocales.fr.

## Pourquoi cet engagement

L'accessibilité numérique n'est pas un supplément optionnel : c'est une condition pour que l'information publique soit réellement accessible à tous. Une cartographie qu'un lecteur d'écran ne peut pas restituer, ou qu'un public malvoyant ne peut pas explorer, manque sa cible — quel que soit le soin apporté à sa conception. L'engagement d'accessibilité est donc au cœur de la mission de l'association.

## État de conformité

À la date de cette déclaration, le site mesdonneeslocales.fr est **partiellement conforme** au RGAA dans sa version 4.1. Cette mention signifie que des non-conformités existent et sont en cours de traitement.

L'objectif de conformité visé est le niveau **AA** du RGAA / WCAG 2.1, sur l'ensemble du périmètre public du site.

## Résultats des tests

Un audit interne a été réalisé en mai 2026 sur les pages suivantes : page d'accueil, page Cartographies, page de cartographie individuelle (densité carcérale), page À propos, page Mentions légales. Cet audit a porté sur les 106 critères du RGAA 4.1 applicables au site.

Les résultats détaillés seront publiés à l'issue d'un audit externe prévu dans les mois à venir, à mesure que les correctifs majeurs identifiés seront déployés.

## Contenus non accessibles

Les éléments suivants sont identifiés comme **non conformes** ou **partiellement conformes** à la date de cette déclaration :

### Cartographies interactives

La consultation des cartographies repose sur une navigation visuelle (carte, zoom, clic sur des points). Cette modalité est par nature peu adaptée à une lecture par synthèse vocale.

**Mesure compensatoire en place :** une alternative textuelle est fournie sous chaque cartographie, sous forme d'un tableau de données accessible permettant de consulter les mêmes informations (lieu, indicateur, valeur, date) en mode séquentiel.

**Améliorations prévues :** enrichissement des descriptions textuelles automatiques générées à partir des données, navigation au clavier dans la légende et les couches de la carte, restitution des seuils de couleur via un texte alternatif.

### Documents PDF

Certains documents annexes (rapports, fiches techniques) sont diffusés au format PDF. La conformité de ces PDF au standard PDF/UA n'est pas garantie de manière systématique.

**Amélioration prévue :** intégration progressive de la procédure de production de PDF accessibles pour les nouveaux documents publiés ; reprise des documents existants à mesure de leur révision.

### Contrastes

Quelques éléments de l'interface présentent des ratios de contraste inférieurs au minimum recommandé (4,5:1 pour le texte courant, 3:1 pour le texte de grande taille).

**Amélioration prévue :** révision des couleurs concernées dans le cadre de la refonte graphique en cours.

## Modalités de mise en œuvre

Pour atteindre la conformité visée, L'Observatoire citoyen a inscrit l'accessibilité dans la procédure de production de chaque cartographie :

- Toute nouvelle cartographie publiée est accompagnée d'un tableau de données alternatif.
- Les images informatives utilisées sur le site sont systématiquement décrites par un attribut `alt` pertinent.
- La navigation est testée au clavier seul avant chaque nouvelle publication.
- Les niveaux de titre (h1, h2, h3) sont structurés conformément à la hiérarchie du contenu.
- Les couleurs ne sont jamais le seul moyen de transmettre une information.

## Signaler un problème d'accessibilité

Si vous rencontrez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou à une fonctionnalité du site, vous pouvez :

**Écrire à L'Observatoire citoyen** :
- Par email : [contact@mesdonneeslocales.fr](mailto:contact@mesdonneeslocales.fr)
- En précisant la page concernée, la nature du problème rencontré et, si possible, votre équipement (navigateur, lecteur d'écran, etc.).

Une réponse sera apportée dans les meilleurs délais. Les signalements alimentent la priorisation des correctifs à venir.

## Voies de recours

Cette procédure est à utiliser dans le cas suivant : vous avez signalé au responsable du site un défaut d'accessibilité qui vous empêche d'accéder à un contenu ou à un service, et vous n'avez pas obtenu de réponse satisfaisante.

Vous pouvez :

- **Écrire un message au Défenseur des droits**, qui peut être saisi en ligne : [formulaire de saisine](https://formulaire.defenseurdesdroits.fr).
- **Contacter le délégué du Défenseur des droits** dans votre département : [carte des délégués](https://www.defenseurdesdroits.fr/saisir/delegues).
- **Envoyer un courrier postal (gratuit, sans timbre) au Défenseur des droits** : Défenseur des droits — Libre réponse 71120 — 75342 Paris CEDEX 07.

## Établissement de cette déclaration

Cette déclaration d'accessibilité a été établie le 29 mai 2026.

Elle a été préparée à partir d'un auto-diagnostic conduit en interne par L'Observatoire citoyen sur la base du RGAA 4.1. Un audit externe est planifié à l'issue de la phase de refonte en cours.

Cette déclaration sera mise à jour à chaque évolution significative du site et au moins une fois par an.

## Tests techniques

Les tests ont été menés avec les configurations suivantes :

- Navigateurs : Firefox 130, Chrome 128, Safari 17, Edge 130
- Lecteurs d'écran : NVDA 2024, VoiceOver (macOS Sonoma, iOS 18)
- Outils d'analyse : Wave (WebAIM), axe DevTools, Lighthouse (Google), Validateur W3C

## Engagement

L'Observatoire citoyen considère que l'accessibilité numérique est un chantier continu. Les progrès réalisés et les difficultés rencontrées sont documentés publiquement sur cette page. Toute remarque permettant d'améliorer l'accès au site est bienvenue.
