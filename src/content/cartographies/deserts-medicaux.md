---
title: Déserts médicaux en France
shortDescription: Combien de minutes pour rejoindre un médecin chez vous ? Cette cartographie restitue l'indicateur APL de la DREES, qui mesure l'accessibilité aux soins de premier recours dans chaque commune de France métropolitaine.
description: |
  L'accès aux soins de premier recours est un enjeu majeur du débat public français. Selon la DREES, **87 % du territoire** est aujourd'hui classé en fragilité médicale, et **151 intercommunalités sont en « zone rouge »**.

  Cette cartographie restitue l'indicateur d'**Accessibilité Potentielle Localisée (APL)** développé par la DREES et l'IRDES. L'APL mesure pour chaque commune le nombre de consultations potentielles par habitant et par an, en tenant compte de l'offre médicale environnante (jusqu'à 20 minutes) et de la demande locale (structure d'âge de la population).

  Cinq professions sont couvertes : médecins généralistes, infirmiers, sages-femmes, masseurs-kinésithérapeutes et chirurgiens-dentistes. La carte de France affiche par défaut l'APL pour les médecins généralistes ; les autres professions sont consultables sur la fiche de chaque commune.

  Les données proviennent de la DREES (Direction de la Recherche, des Études, de l'Évaluation et des Statistiques), mises à disposition via le portail Data.DREES. Les millésimes 2022 et 2023 sont disponibles ; le millésime 2024 sera diffusé fin 2025-début 2026.

# TODO : visuel dédié à produire (carte de France APL médecins généralistes, dominante rouge/vert).
# imageAlt est conservé pour cohérence éditoriale même sans image.
imageAlt: "Carte de France colorée par commune selon l'indicateur APL pour les médecins généralistes, du rouge profond (désert médical critique) au vert (bonne accessibilité)."

type: native
url: https://mesdonneeslocales.fr/cartographies/deserts-medicaux/
mapUrl: https://mesdonneeslocales.fr/cartographies/deserts-medicaux/

author: L'Observatoire citoyen
keywords: [APL, accessibilité, soins, médecins, déserts médicaux, DREES, santé, premier recours]
category: Santé
subCategories: [Démographie médicale, Accès aux soins]
typeapp: Carte
status: new
featured: true
order: 3

source:
  name: DREES — Direction de la Recherche, des Études, de l'Évaluation et des Statistiques
  url: https://data.drees.solidarites-sante.gouv.fr/explore/dataset/530_l-accessibilite-potentielle-localisee-apl/
  license: Licence Ouverte 2.0 (Etalab)
  licenseUrl: https://www.etalab.gouv.fr/licence-ouverte-open-licence/

publishedAt: 2026-05-30
lastDataUpdate: 2024-12-20
updateFrequency: yearly

spatialCoverage: France métropolitaine et Corse (les DROM ne sont pas couverts par l'indicateur APL DREES)
downloadFormats: [CSV]

keyFigures:
  - value: "34 967"
    label: communes couvertes en métropole
  - value: "87 %"
    label: du territoire classé en fragilité
  - value: "5"
    label: professions médicales mesurées
  - value: "2023"
    label: dernier millésime disponible

says:
  - L'accessibilité aux médecins généralistes, infirmiers, sages-femmes, kinésithérapeutes et chirurgiens-dentistes, exprimée en nombre de consultations potentielles par habitant et par an.
  - La distribution spatiale des déserts médicaux selon les seuils conventionnels de la DREES (moins de 2,5 consultations par habitant et par an pour les médecins généralistes).
  - L'évolution de l'accessibilité entre les millésimes 2022 et 2023, profession par profession.

saysNot:
  - Les délais effectifs pour obtenir un rendez-vous (l'APL mesure l'offre théorique, pas la disponibilité réelle des praticiens).
  - L'accès aux médecins spécialistes (cardiologues, dermatologues, etc.) — l'indicateur ne couvre que les soins de premier recours.
  - L'accès aux soins dans les départements d'outre-mer (DROM exclus du périmètre DREES).
  - La qualité ou la spécialisation des praticiens présents.

methodology:
  provenance: |
    Données issues du Système National des Données de Santé (SNDS) et du Système National d'Information Inter-Régimes de l'Assurance Maladie (SNIIR-AM), traitées par la DREES selon la méthode APL (Accessibilité Potentielle Localisée) développée en 2012 et refondue en 2015.
  processing: |
    Pour chaque commune française, le site agrège les valeurs APL des cinq professions médicales pour les millésimes disponibles. Aucun calcul ne modifie les valeurs : seules les valeurs publiées par la DREES sont restituées. Les communes sont classées selon les seuils conventionnels (médecins généralistes) : moins de 1,5 (critique), 1,5 à 2,5 (désert médical), 2,5 à 4,0 (sous-densité), 4,0 à 6,0 (accessibilité correcte), 6,0 et plus (bonne accessibilité). Ces seuils sont indicatifs et propres aux médecins généralistes ; les autres professions ont leurs propres échelles.
  limits: |
    L'APL est un indicateur d'offre théorique, calculé à partir des praticiens libéraux exerçant. Il n'inclut ni les médecins hospitaliers, ni les remplaçants non rattachés à un cabinet, ni les téléconsultations. Il ne tient pas compte des refus de soins éventuels, des dépassements d'honoraires, ni de l'engorgement réel des agendas. Les DROM sont exclus du calcul DREES.
  partner: "À approcher : UFC-Que Choisir (rapport déserts médicaux 2024-2025), France Assos Santé, Conseil national de l'Ordre des médecins."

furtherReading:
  - label: DREES — L'indicateur d'accessibilité potentielle localisée (APL)
    url: https://drees.solidarites-sante.gouv.fr/sources-outils-et-enquetes/lindicateur-daccessibilite-potentielle-localisee-apl
  - label: Data.DREES — Dataset 530 (l'accessibilité potentielle localisée)
    url: https://data.drees.solidarites-sante.gouv.fr/explore/dataset/530_l-accessibilite-potentielle-localisee-apl/
  - label: Observatoire des Territoires — Carte APL médecins généralistes
    url: https://www.observatoire-des-territoires.gouv.fr/accessibilite-potentielle-localisee-apl-aux-medecins-generalistes
  - label: Data.DREES — Application Shiny carto APL
    url: https://drees.shinyapps.io/carto-apl/
---
