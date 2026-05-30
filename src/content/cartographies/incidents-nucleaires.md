---
title: Incidents et accidents dans les centrales nucléaires
shortDescription: La cartographie affiche les incidents et accidents survenus dans les 18 centrales nucléaires. Le classement de ces événements sur l'échelle INES ne constitue pas un outil d'évaluation ou de mesure de la sûreté nucléaire mais son utilisation permet à l'Autorité de sûreté nucléaire et de radioprotection (ASNR) de sélectionner ceux suffisamment importants pour faire l'objet d'une communication.
description: |
  18 centrales nucléaires fonctionnent actuellement en France. Pour s'assurer que leur exploitant, EDF, respecte les exigences de la réglementation en matière de sûreté nucléaire, l'État a chargé l'Autorité de sûreté nucléaire et de radioprotection (ASNR), de le contrôler.

  Tout événement concernant la sûreté nucléaire est classé de 0 à 7 selon l'échelle INES (International Nuclear and Radiological Event Scale) conçue par l'Agence internationale de l'énergie atomique (AIEA) et l'Agence pour l'énergie nucléaire (AEN) de l'Organisation pour la coopération et le développement économique (OCDE).

  EDF est tenu de déclarer à l'ASNR sous 48 heures ouvrées tout événement significatif (incidents et accidents) qui surviendrait au sein de ses installations nucléaires avec une proposition de classement sur l'échelle INES. L'ASNR est responsable de la décision finale de classement.

  L'utilisation de l'échelle INES permet à l'ASNR de sélectionner, parmi l'ensemble des événements et incidents qui surviennent, ceux qui ont une importance suffisante pour faire l'objet d'une communication de sa part : les événements classés au niveau 0 ne font l'objet d'un avis d'incident que s'ils présentent un intérêt particulier ; les événements classés au niveau 1 font systématiquement l'objet d'un avis d'incident publié sur asnr.fr ; les événements classés des niveau 2 à 7 sont de plus déclarés à l'AIEA et l'ASNR peut publier un communiqué de presse.

  L'échelle INES ne constitue pas un outil d'évaluation ou de mesure de la sûreté nucléaire et ne saurait établir de relation de cause à effet entre le nombre d'incidents déclarés et la probabilité que survienne un accident grave sur une centrale.

  Les données des incidents ou accidents du mois dernier visualisées sur la cartographie sont collectées sur le site de l'ASNR.
image: ../../assets/cartographies/incidents-nucleaires.png
imageAlt: Carte de France localisant les centrales nucléaires et leurs incidents classés sur l'échelle INES.
url: https://mesdonneeslocales.fr/mviewer/#incidents_nucleaires.xml
mapUrl: https://mesdonneeslocales.fr/mviewer/#incidents_nucleaires.xml
author: L'Observatoire citoyen
keywords: [nucléaire, centrale, incident, accident, INES, ASNR, sûreté, EDF]
category: Énergie
subCategories: [Sûreté nucléaire, Risques industriels]
typeapp: Carte
status: new
featured: true
order: 3

source:
  name: Autorité de sûreté nucléaire et de radioprotection (ASNR)
  url: https://www.asnr.fr/
  license: Licence Ouverte 2.0 (Etalab)
  licenseUrl: https://www.etalab.gouv.fr/licence-ouverte-open-licence/

# TODO: dates à confirmer
publishedAt: 2026-05-01
lastDataUpdate: 2026-05-01
updateFrequency: monthly

spatialCoverage: France métropolitaine
downloadFormats: []

# TODO: GeoJSON sera accessible une fois la v2 déployée à côté de mviewer
# geojsonUrl: https://mesdonneeslocales.fr/mviewer/apps/incidents_nucleaires/data/centrales_incidents.geojson

# Chiffres clés (Synthèse UX annexe — 18 features GeoJSON)
keyFigures:
  - value: "18"
    label: centrales nucléaires en fonctionnement
  - value: "56"
    label: réacteurs en service (2026)
  - value: "1"
    label: niveau INES maximum atteint sur les 12 derniers mois
  - value: "0"
    label: événement classé niveau 2 ou plus

says:
  - La localisation des 18 centrales nucléaires en fonctionnement et leur exploitant (EDF).
  - Le nombre d'événements significatifs déclarés à l'ASNR sur la période couverte, et leur classement sur l'échelle INES.
  - Les incidents classés au niveau 1 (anomalies) qui font systématiquement l'objet d'un avis d'incident public.
saysNot:
  - L'échelle INES ne mesure pas la sûreté nucléaire en soi — elle classe des événements selon leur importance pour la communication.
  - La cartographie n'établit aucune relation entre le nombre d'incidents déclarés et la probabilité d'un accident grave.
  - Les rejets radioactifs autorisés en fonctionnement normal ne sont pas couverts par cet indicateur.

# Colonnes pour le tableau accessible (depuis centrales_incidents.geojson)
tableColumns:
  - key: nom_site
    label: Site
  - key: exploitant
    label: Exploitant
  - key: nb_reacteurs
    label: Réacteurs
  - key: ines_max
    label: INES max
  - key: nb_total_incidents
    label: Total incidents (12 mois)

methodology:
  provenance: Données collectées sur le site asnr.fr (avis d'incidents et communiqués) et croisées avec la base des installations nucléaires de base (INB).
  processing: Géocodage des sites depuis la base INB de l'ASNR. Agrégation mensuelle des événements significatifs déclarés par l'exploitant et classés par l'ASNR.
  limits: Le classement INES peut être révisé par l'ASNR a posteriori. Les événements classés au niveau 0 ne sont publiés que s'ils présentent un intérêt particulier — ils ne sont donc pas tous représentés.
  partner: "À identifier (à approcher : Global Chance, Réseau Sortir du Nucléaire, Wise-Paris pour expertise indépendante)."

furtherReading:
  - label: ASNR — Avis d'incidents et communiqués
    url: https://www.asnr.fr/
  - label: Échelle INES — fiche AIEA
    url: https://www.iaea.org/topics/emergency-preparedness-and-response/international-nuclear-radiological-event-scale-ines
  - label: Base des installations nucléaires de base (INB)
    url: https://www.asnr.fr/exploitants/installations-nucleaires-de-base
---
