---
title: Méthodologie
slug: methodologie
description: Comment Mes données locales sélectionne, vérifie et actualise les données publiques cartographiées. Critères de qualité, sources, fréquences de mise à jour, limites assumées.
keywords:
  - méthodologie
  - sources de données
  - qualité
  - vérification
  - open data
ogTitle: Méthodologie — Mes données locales
ogDescription: Critères de sélection, vérification et actualisation des données publiques cartographiées.
lastUpdated: 2026-05-29
schemaType: TechArticle
---

Cette page détaille les principes méthodologiques que L'Observatoire citoyen applique à chaque cartographie publiée sur Mes données locales. L'objectif est double : garantir la qualité de l'information diffusée et permettre à toute personne de juger par elle-même de la fiabilité des données qu'elle consulte.

## Choix des thématiques

Une cartographie est mise en chantier lorsque trois conditions sont réunies.

**Un intérêt citoyen avéré.** La donnée doit éclairer une question qui concerne directement la vie des territoires : santé, environnement, justice, énergie, éducation, logement, transports, démocratie locale, économie. Les thématiques privilégiées sont celles pour lesquelles l'information existe mais reste difficile d'accès pour le public.

**Une source officielle stable.** Les données utilisées proviennent d'institutions publiques (ministères, agences, autorités indépendantes), d'opérateurs de service public, ou d'organismes reconnus dans leur domaine. Les sources non vérifiables ou à diffusion confidentielle ne sont pas retenues.

**Un partenaire thématique.** Chaque cartographie est conçue en lien avec une organisation spécialisée — association, ONG, observatoire métier — qui apporte son expertise sur les données, leur interprétation et leurs limites. Ce partenariat garantit la pertinence des indicateurs choisis.

## Sélection des indicateurs

Pour chaque thématique, L'Observatoire citoyen identifie les indicateurs les plus pertinents en concertation avec ses partenaires. Le choix est guidé par trois critères :

- **La signification.** L'indicateur doit avoir un sens immédiat pour le public — pas seulement pour les spécialistes.
- **La comparabilité.** Les valeurs doivent pouvoir être comparées dans le temps et entre territoires, à partir d'une définition stable.
- **La disponibilité.** L'indicateur doit être publié à une fréquence permettant une actualisation régulière.

Lorsqu'un indicateur est techniquement valable mais complexe à interpréter, il est accompagné d'une définition claire et de seuils de référence (normes officielles, valeurs limites, moyennes nationales).

## Provenance des données

Toutes les données utilisées sont **publiques et ouvertes**. L'Observatoire citoyen ne collecte aucune donnée par lui-même : il s'appuie sur des fichiers déjà produits et diffusés par des organismes officiels.

Sur chaque cartographie publiée, vous trouverez systématiquement :

- le nom de l'organisme producteur des données ;
- un lien vers le portail source ;
- la licence sous laquelle ces données sont diffusées (Licence Ouverte 2.0, ODbL, autres) ;
- la date du dernier import ;
- la fréquence de mise à jour ;
- la couverture géographique et temporelle.

Aucune donnée n'est anonymisée ni transformée sans que cela soit explicitement signalé.

## Traitement et qualification

Entre le fichier brut et la cartographie publiée, plusieurs étapes de traitement sont appliquées. Chacune est documentée dans la fiche méthodologique de la cartographie.

**Vérification de cohérence.** Les fichiers source sont contrôlés pour détecter les valeurs aberrantes, les doublons, les enregistrements incomplets. Les anomalies signalées par les contrôles automatiques sont vérifiées manuellement.

**Géocodage.** Lorsque les données ne comportent pas de coordonnées géographiques, les adresses sont géolocalisées à partir des référentiels officiels (Base Adresse Nationale, IGN). Le taux de géocodage réussi est indiqué dans la fiche méthodologique.

**Calcul d'indicateurs dérivés.** Lorsque l'indicateur publié est calculé (taux d'occupation, ratio, moyenne), la formule de calcul est explicitée et les variables d'entrée sont citées.

**Mise en forme cartographique.** Les seuils de couleur, les classes de valeurs et les modes de représentation sont choisis pour éviter de surinterpréter les données. Les choix graphiques sont eux aussi documentés.

## Mises à jour

Les données affichées sont mises à jour à la fréquence indiquée pour chaque cartographie. Trois rythmes coexistent selon les sources :

- **Mise à jour continue** lorsque le producteur publie en temps réel (qualité de l'eau potable, par exemple).
- **Mise à jour mensuelle** pour les indicateurs dont les fichiers sont publiés chaque mois (densité carcérale, par exemple).
- **Mise à jour ponctuelle** pour les sources publiées à intervalles plus larges (rapports annuels, recensements).

Chaque page de cartographie affiche la date du dernier import effectif, qui peut différer légèrement de la date de publication par la source.

## Limites assumées

L'Observatoire citoyen reconnaît trois limites principales aux cartographies publiées, et choisit de les expliciter plutôt que de les masquer.

**Les données disponibles ne disent pas tout.** Une cartographie présente un indicateur, pas une réalité dans son ensemble. La densité carcérale donne une information précieuse sur les conditions de détention, mais ne suffit pas à les décrire. Chaque fiche signale ce que l'indicateur dit — et ce qu'il ne dit pas.

**Les données publiques comportent des erreurs.** Aucune donnée n'est exempte d'imprécision. Les fichiers produits par les institutions peuvent contenir des saisies erronées, des retards de mise à jour, des changements de méthodologie. L'Observatoire citoyen signale les écarts détectés lorsqu'ils sont significatifs.

**Les choix de représentation orientent la lecture.** Le choix des couleurs, des seuils ou des unités influence la perception. L'association s'efforce d'être neutre dans ses représentations, et publie les paramètres choisis pour permettre à chacun d'en juger.

## Signaler une erreur

Si vous constatez une donnée erronée ou un choix de représentation discutable, vous pouvez le signaler par email à [contact@mesdonneeslocales.fr](mailto:contact@mesdonneeslocales.fr). Les signalements sont examinés à chaque réunion mensuelle de l'équipe bénévole et donnent lieu, si nécessaire, à une correction documentée.

## Évolution de cette méthodologie

Cette méthodologie est susceptible d'évoluer à mesure que de nouvelles thématiques sont traitées. Toute modification substantielle sera consignée publiquement sur cette page, avec sa date d'application.

**Dernière mise à jour de cette page :** 29 mai 2026.
