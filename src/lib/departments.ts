/**
 * Métadonnées des départements français (métropole + DROM).
 * Source : INSEE — codes officiels.
 * Populations : estimations INSEE 2024 arrondies.
 *
 * MVP : seulement la métropole (96 départements). Les DROM viendront avec leur GeoJSON dédié.
 */

export interface Department {
  code: string;
  name: string;
  /** Population (estimation 2024, milliers) */
  population: number;
  /** Région d'appartenance */
  region: string;
}

const DATA: Department[] = [
  { code: '01', name: 'Ain', population: 658, region: 'Auvergne-Rhône-Alpes' },
  { code: '02', name: 'Aisne', population: 524, region: 'Hauts-de-France' },
  { code: '03', name: 'Allier', population: 333, region: 'Auvergne-Rhône-Alpes' },
  { code: '04', name: 'Alpes-de-Haute-Provence', population: 167, region: "Provence-Alpes-Côte d'Azur" },
  { code: '05', name: 'Hautes-Alpes', population: 141, region: "Provence-Alpes-Côte d'Azur" },
  { code: '06', name: 'Alpes-Maritimes', population: 1086, region: "Provence-Alpes-Côte d'Azur" },
  { code: '07', name: 'Ardèche', population: 328, region: 'Auvergne-Rhône-Alpes' },
  { code: '08', name: 'Ardennes', population: 268, region: 'Grand Est' },
  { code: '09', name: 'Ariège', population: 154, region: 'Occitanie' },
  { code: '10', name: 'Aube', population: 309, region: 'Grand Est' },
  { code: '11', name: 'Aude', population: 376, region: 'Occitanie' },
  { code: '12', name: 'Aveyron', population: 280, region: 'Occitanie' },
  { code: '13', name: 'Bouches-du-Rhône', population: 2062, region: "Provence-Alpes-Côte d'Azur" },
  { code: '14', name: 'Calvados', population: 696, region: 'Normandie' },
  { code: '15', name: 'Cantal', population: 144, region: 'Auvergne-Rhône-Alpes' },
  { code: '16', name: 'Charente', population: 354, region: 'Nouvelle-Aquitaine' },
  { code: '17', name: 'Charente-Maritime', population: 660, region: 'Nouvelle-Aquitaine' },
  { code: '18', name: 'Cher', population: 297, region: 'Centre-Val de Loire' },
  { code: '19', name: 'Corrèze', population: 239, region: 'Nouvelle-Aquitaine' },
  { code: '21', name: "Côte-d'Or", population: 535, region: 'Bourgogne-Franche-Comté' },
  { code: '22', name: "Côtes-d'Armor", population: 605, region: 'Bretagne' },
  { code: '23', name: 'Creuse', population: 113, region: 'Nouvelle-Aquitaine' },
  { code: '24', name: 'Dordogne', population: 414, region: 'Nouvelle-Aquitaine' },
  { code: '25', name: 'Doubs', population: 545, region: 'Bourgogne-Franche-Comté' },
  { code: '26', name: 'Drôme', population: 521, region: 'Auvergne-Rhône-Alpes' },
  { code: '27', name: 'Eure', population: 605, region: 'Normandie' },
  { code: '28', name: 'Eure-et-Loir', population: 432, region: 'Centre-Val de Loire' },
  { code: '29', name: 'Finistère', population: 920, region: 'Bretagne' },
  { code: '2A', name: 'Corse-du-Sud', population: 162, region: 'Corse' },
  { code: '2B', name: 'Haute-Corse', population: 188, region: 'Corse' },
  { code: '30', name: 'Gard', population: 760, region: 'Occitanie' },
  { code: '31', name: 'Haute-Garonne', population: 1452, region: 'Occitanie' },
  { code: '32', name: 'Gers', population: 196, region: 'Occitanie' },
  { code: '33', name: 'Gironde', population: 1657, region: 'Nouvelle-Aquitaine' },
  { code: '34', name: 'Hérault', population: 1207, region: 'Occitanie' },
  { code: '35', name: 'Ille-et-Vilaine', population: 1110, region: 'Bretagne' },
  { code: '36', name: 'Indre', population: 218, region: 'Centre-Val de Loire' },
  { code: '37', name: 'Indre-et-Loire', population: 615, region: 'Centre-Val de Loire' },
  { code: '38', name: 'Isère', population: 1287, region: 'Auvergne-Rhône-Alpes' },
  { code: '39', name: 'Jura', population: 259, region: 'Bourgogne-Franche-Comté' },
  { code: '40', name: 'Landes', population: 423, region: 'Nouvelle-Aquitaine' },
  { code: '41', name: 'Loir-et-Cher', population: 332, region: 'Centre-Val de Loire' },
  { code: '42', name: 'Loire', population: 766, region: 'Auvergne-Rhône-Alpes' },
  { code: '43', name: 'Haute-Loire', population: 228, region: 'Auvergne-Rhône-Alpes' },
  { code: '44', name: 'Loire-Atlantique', population: 1466, region: 'Pays de la Loire' },
  { code: '45', name: 'Loiret', population: 689, region: 'Centre-Val de Loire' },
  { code: '46', name: 'Lot', population: 174, region: 'Occitanie' },
  { code: '47', name: 'Lot-et-Garonne', population: 332, region: 'Nouvelle-Aquitaine' },
  { code: '48', name: 'Lozère', population: 77, region: 'Occitanie' },
  { code: '49', name: 'Maine-et-Loire', population: 822, region: 'Pays de la Loire' },
  { code: '50', name: 'Manche', population: 495, region: 'Normandie' },
  { code: '51', name: 'Marne', population: 565, region: 'Grand Est' },
  { code: '52', name: 'Haute-Marne', population: 173, region: 'Grand Est' },
  { code: '53', name: 'Mayenne', population: 307, region: 'Pays de la Loire' },
  { code: '54', name: 'Meurthe-et-Moselle', population: 728, region: 'Grand Est' },
  { code: '55', name: 'Meuse', population: 184, region: 'Grand Est' },
  { code: '56', name: 'Morbihan', population: 765, region: 'Bretagne' },
  { code: '57', name: 'Moselle', population: 1042, region: 'Grand Est' },
  { code: '58', name: 'Nièvre', population: 200, region: 'Bourgogne-Franche-Comté' },
  { code: '59', name: 'Nord', population: 2607, region: 'Hauts-de-France' },
  { code: '60', name: 'Oise', population: 829, region: 'Hauts-de-France' },
  { code: '61', name: 'Orne', population: 277, region: 'Normandie' },
  { code: '62', name: 'Pas-de-Calais', population: 1466, region: 'Hauts-de-France' },
  { code: '63', name: 'Puy-de-Dôme', population: 663, region: 'Auvergne-Rhône-Alpes' },
  { code: '64', name: 'Pyrénées-Atlantiques', population: 690, region: 'Nouvelle-Aquitaine' },
  { code: '65', name: 'Hautes-Pyrénées', population: 226, region: 'Occitanie' },
  { code: '66', name: 'Pyrénées-Orientales', population: 487, region: 'Occitanie' },
  { code: '67', name: 'Bas-Rhin', population: 1153, region: 'Grand Est' },
  { code: '68', name: 'Haut-Rhin', population: 768, region: 'Grand Est' },
  { code: '69', name: 'Rhône', population: 1899, region: 'Auvergne-Rhône-Alpes' },
  { code: '70', name: 'Haute-Saône', population: 232, region: 'Bourgogne-Franche-Comté' },
  { code: '71', name: 'Saône-et-Loire', population: 549, region: 'Bourgogne-Franche-Comté' },
  { code: '72', name: 'Sarthe', population: 564, region: 'Pays de la Loire' },
  { code: '73', name: 'Savoie', population: 449, region: 'Auvergne-Rhône-Alpes' },
  { code: '74', name: 'Haute-Savoie', population: 845, region: 'Auvergne-Rhône-Alpes' },
  { code: '75', name: 'Paris', population: 2102, region: 'Île-de-France' },
  { code: '76', name: 'Seine-Maritime', population: 1244, region: 'Normandie' },
  { code: '77', name: 'Seine-et-Marne', population: 1454, region: 'Île-de-France' },
  { code: '78', name: 'Yvelines', population: 1456, region: 'Île-de-France' },
  { code: '79', name: 'Deux-Sèvres', population: 376, region: 'Nouvelle-Aquitaine' },
  { code: '80', name: 'Somme', population: 569, region: 'Hauts-de-France' },
  { code: '81', name: 'Tarn', population: 393, region: 'Occitanie' },
  { code: '82', name: 'Tarn-et-Garonne', population: 264, region: 'Occitanie' },
  { code: '83', name: 'Var', population: 1077, region: "Provence-Alpes-Côte d'Azur" },
  { code: '84', name: 'Vaucluse', population: 564, region: "Provence-Alpes-Côte d'Azur" },
  { code: '85', name: 'Vendée', population: 698, region: 'Pays de la Loire' },
  { code: '86', name: 'Vienne', population: 437, region: 'Nouvelle-Aquitaine' },
  { code: '87', name: 'Haute-Vienne', population: 370, region: 'Nouvelle-Aquitaine' },
  { code: '88', name: 'Vosges', population: 358, region: 'Grand Est' },
  { code: '89', name: 'Yonne', population: 333, region: 'Bourgogne-Franche-Comté' },
  { code: '90', name: 'Territoire de Belfort', population: 140, region: 'Bourgogne-Franche-Comté' },
  { code: '91', name: 'Essonne', population: 1313, region: 'Île-de-France' },
  { code: '92', name: 'Hauts-de-Seine', population: 1632, region: 'Île-de-France' },
  { code: '93', name: 'Seine-Saint-Denis', population: 1665, region: 'Île-de-France' },
  { code: '94', name: 'Val-de-Marne', population: 1407, region: 'Île-de-France' },
  { code: '95', name: "Val-d'Oise", population: 1241, region: 'Île-de-France' },
];

const BY_CODE = new Map<string, Department>(DATA.map((d) => [d.code, d]));

export function getDepartment(code: string): Department | undefined {
  return BY_CODE.get(code);
}

export function getAllDepartments(): Department[] {
  return DATA;
}
