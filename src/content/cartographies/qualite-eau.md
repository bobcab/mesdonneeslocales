---
title: Qualité de l'eau potable en France
shortDescription: Vérifiez la qualité de l'eau du robinet par commune. Les résultats du contrôle sanitaire officiel mené par les ARS sont mis à jour mensuellement et couvrent toutes les communes françaises, y compris ultramarines.
description: |
  La qualité de l'eau du robinet est contrôlée en permanence par les services sanitaires de l'État sur toutes les installations (captages, traitement, unités de distribution) concourant à la fourniture d'eau via un réseau de distribution.

  La qualité de l'eau du robinet est évaluée par rapport à des limites et des références de qualité fixées par la réglementation pour une soixantaine de paramètres (bactériologiques, physico-chimiques et radiologiques).

  Cette cartographie affiche par commune les conclusions sanitaires du dernier prélèvement. Cet indicateur est pertinent pour savoir si l'eau d'alimentation est conforme aux exigences officielles de qualité en vigueur pour l'ensemble des paramètres mesurés, ce qui la qualifie d'eau potable.

  Les données proviennent du système SISE-Eaux du ministère chargé de la santé, exposées par l'API publique Hub'Eau. Elles sont actualisées mensuellement.

image: ../../assets/cartographies/eau-potable.png
imageAlt: Carte de France colorée par commune selon les conclusions sanitaires du dernier prélèvement d'eau potable.

# Gabarit natif (Hub'Eau) — pas d'iframe MViewer
type: native
# Pour les cartos natives, url et mapUrl pointent sur la page interne elle-même
url: https://mesdonneeslocales.fr/cartographies/qualite-eau/
mapUrl: https://mesdonneeslocales.fr/cartographies/qualite-eau/

author: L'Observatoire citoyen
keywords: [qualité, eau, potable, ARS, sanitaire, nitrates, pesticides, PFAS, plomb, SISE-Eaux, Hub'Eau]
category: Santé
subCategories: [Environnement, Eau]
typeapp: Carte
status: new
featured: true
order: 2

source:
  name: Ministère chargé de la santé — SISE-Eaux via Hub'Eau
  url: https://hubeau.eaufrance.fr/page/api-qualite-eau-potable
  license: Licence Ouverte 2.0 (Etalab)
  licenseUrl: https://www.etalab.gouv.fr/licence-ouverte-open-licence/

publishedAt: 2026-05-29
lastDataUpdate: 2026-05-29
updateFrequency: monthly

spatialCoverage: France métropolitaine et Outre-mer (34 969 communes)
downloadFormats: []

keyFigures:
  - value: "34 969"
    label: communes couvertes en France
  - value: "60+"
    label: paramètres réglementaires mesurés
  - value: Mensuelle
    label: fréquence d'actualisation
  - value: "0"
    label: inscription requise

says:
  - La conformité du dernier prélèvement par commune au regard de la réglementation française.
  - Les paramètres réglementaires mesurés (nitrates, pesticides, PFAS, plomb, chlore résiduel, pH, dureté) et leur statut.
  - L'identité du distributeur d'eau pour chaque commune et le nombre de prélèvements effectués sur les 12 derniers mois.

saysNot:
  - La qualité de l'eau du robinet à votre domicile (canalisations privées, vétusté éventuelle non couvertes par le contrôle public).
  - Les sources non raccordées au réseau public (puits privés, sources individuelles).
  - La qualité bactériologique en temps réel (les résultats reflètent le dernier prélèvement officiel).

methodology:
  provenance: Données du contrôle sanitaire SISE-Eaux assuré par les Agences régionales de santé (ARS), publiées via l'API publique Hub'Eau (BRGM / Office français de la biodiversité).
  processing: "Pour chaque commune française, le site agrège les derniers prélèvements officiels et présente les paramètres réglementaires principaux. Aucun calcul ne modifie les valeurs : seules les valeurs brutes du contrôle sanitaire sont affichées, avec leur seuil réglementaire de référence."
  limits: La conformité concerne le réseau de distribution public, pas les installations privées intérieures aux logements. Les paramètres affichés sont les plus significatifs pour le grand public ; tous les paramètres réglementaires restent consultables via les ARS.
  partner: "À approcher : UFC Que Choisir, France Nature Environnement, Eau Secours, Fondation pour la Nature et l'Homme."

furtherReading:
  - label: Hub'Eau — API publique de la qualité de l'eau potable
    url: https://hubeau.eaufrance.fr/page/api-qualite-eau-potable
  - label: Ministère de la santé — Eaux destinées à la consommation humaine
    url: https://sante.gouv.fr/sante-et-environnement/eaux/eau
  - label: ANSES — Valeurs guides pour l'eau de consommation
    url: https://www.anses.fr/fr/content/eau-potable
---
