---
title: Densité carcérale des établissements pénitentiaires
shortDescription: La cartographie des établissements pénitentiaires de France affiche les densités carcérales calculées sur la base du dernier chiffrage mensuel. Cet indicateur est pertinent, les taux d'occupation des établissements étant à comparer aux normes officielles des conditions de détention.
description: |
  Les établissements pénitentiaires en France (188 en 2025), comprennent 86 maisons d'arrêt (attente de jugement et courtes peines) et 94 établissements pour peine (maisons centrales, centres de détention). Le solde est composé d'établissements spécifiques : centres de semi-liberté, structures d'accompagnement vers la sortie (SAS), établissements pénitentiaires pour mineurs (EPM), centre national d'évaluation (CNE), unité hospitalière spécialement aménagée (UHSA), unité hospitalière sécurisée interrégionale (UHSI) ou encore établissement public de santé national (EPSN).

  Les densités carcérales sont calculées par l'administration pénitentiaire (Ministère de la justice). Cet indicateur est pertinent, les taux d'occupation des établissements étant à comparer aux normes officielles des conditions de détention. Le taux d'occupation est le nombre de personnes détenues par rapport au nombre de places.

  Ces données officielles sont actualisées mensuellement et disponibles en open data.
image: ../../assets/cartographies/prisons.png
imageAlt: Carte de France colorée par département selon la densité carcérale des établissements pénitentiaires.
url: https://mesdonneeslocales.fr/mviewer/#stats_carcerales.xml
mapUrl: https://mesdonneeslocales.fr/mviewer/#stats_carcerales.xml
# TODO: GeoJSON sera accessible une fois la v2 déployée à côté de mviewer
# geojsonUrl: https://mesdonneeslocales.fr/mviewer/apps/stats_carcerales/data/stats_carcerales.json
author: L'Observatoire citoyen
keywords: [pénitentiaires, prison, centre, incarcération, densité, INES]
category: Justice
subCategories: [Détention, Conditions carcérales]
typeapp: Carte
status: updated
featured: true
order: 1

source:
  name: Ministère de la Justice — Administration pénitentiaire
  url: https://www.justice.gouv.fr/statistiques
  license: Licence Ouverte 2.0 (Etalab)
  licenseUrl: https://www.etalab.gouv.fr/licence-ouverte-open-licence/

# TODO: dates à confirmer par le producteur de données
publishedAt: 2024-01-01
lastDataUpdate: 2026-04-01
updateFrequency: monthly

spatialCoverage: France métropolitaine et Outre-mer
downloadFormats: []

# Chiffres clés affichés au-dessus de la carte (Synthèse UX p.12)
keyFigures:
  - value: "142"
    label: établissements en surpopulation (>100%)
  - value: "128 %"
    label: densité moyenne nationale
  - value: "76 412"
    label: personnes détenues
  - value: "59 700"
    label: capacité opérationnelle totale

# Ce que dit / ne dit pas la cartographie (Synthèse UX p.13)
says:
  - Le rapport entre le nombre de personnes détenues et la capacité opérationnelle des établissements.
  - Les établissements où la densité dépasse 100 % accueillent plus de personnes que ce que les installations prévoient — c'est ce qu'on appelle la surpopulation carcérale.
  - L'évolution dans le temps de la surpopulation, mesurée mensuellement par l'administration pénitentiaire.
saysNot:
  - Les conditions concrètes de détention (état du bâti, vétusté, accès aux soins, ni la sûreté).
  - La durée moyenne des peines, ni la nature des infractions sous-jacentes.
  - Le caractère adapté ou non d'un établissement à la population qu'il accueille (mineurs, femmes, fins de peine, etc.).

# Colonnes affichées dans le tableau accessible (depuis GeoJSON stats_carcerales.json)
# Propriétés attendues : etablissement, ville, densite_car, capacite_oper, ecroue_dete
tableColumns:
  - key: etablissement
    label: Établissement
  - key: ville
    label: Ville
  - key: capacite_oper
    label: Capacité opérationnelle
  - key: ecroue_dete
    label: Personnes détenues
  - key: densite_car
    label: Densité (%)

methodology:
  provenance: Données issues du portail open data du Ministère de la Justice (statistiques mensuelles de l'administration pénitentiaire), publiées sous Licence Ouverte 2.0 Etalab.
  processing: Géocodage des établissements sur la Base Adresse Nationale (BAN). Calcul de la densité par quartier puis agrégation par établissement. Aucune donnée nominative n'est utilisée.
  limits: Les variations mensuelles peuvent refléter des transferts ponctuels de population. Pour une analyse de tendance, comparer plusieurs mois consécutifs.
  partner: Observatoire international des prisons (OIP) — apport sur la sélection des indicateurs et l'interprétation des seuils.

furtherReading:
  - label: Portail open data du Ministère de la Justice
    url: https://www.justice.gouv.fr/statistiques
  - label: Rapport annuel de l'Observatoire international des prisons
    url: https://oip.org/
  - label: Conseil de l'Europe — Statistiques SPACE I
    url: https://wp.unil.ch/space/space-i/
---
