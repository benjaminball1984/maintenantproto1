export type MaterialKey = 'flyer_a6' | 'flyer_a5' | 'poster_a3' | 'petition_paper';

export type MaterialItem = {
  key: MaterialKey;
  label: string;
  description: string;
  format: string;
  weightGrams: number;
  quantities: number[];
};

export const MATERIALS: MaterialItem[] = [
  {
    key: 'flyer_a6',
    label: 'Flyer A6',
    description:
      'Distribution main à main, à glisser dans les sacs ou laisser sur les commerces partenaires.',
    format: 'Recto-verso 4 couleurs, 135 g brillant',
    weightGrams: 2,
    quantities: [0, 50, 100, 250, 500],
  },
  {
    key: 'flyer_a5',
    label: 'Flyer A5',
    description: 'Distribution table, support de signature.',
    format: 'Recto-verso 4 couleurs, 135 g brillant',
    weightGrams: 4,
    quantities: [0, 50, 100, 250, 500],
  },
  {
    key: 'poster_a3',
    label: 'Affiche A3',
    description: 'Affichage devant école, marché, salle des fêtes.',
    format: 'Recto 4 couleurs, 170 g brillant',
    weightGrams: 12,
    quantities: [0, 5, 10, 25, 50],
  },
  {
    key: 'petition_paper',
    label: 'Pétition papier A4',
    description: 'Recueil physique en distribution — 20 signatures par page.',
    format: 'A4, 80 g',
    weightGrams: 5,
    quantities: [0, 10, 25, 50, 100],
  },
];

export const TOTAL_UNITS_CAP = 500;

export type Cart = Record<MaterialKey, number>;

export const emptyCart: Cart = {
  flyer_a6: 0,
  flyer_a5: 0,
  poster_a3: 0,
  petition_paper: 0,
};

export function totalUnits(cart: Cart): number {
  return Object.values(cart).reduce((sum, n) => sum + n, 0);
}

export function totalWeightGrams(cart: Cart): number {
  return MATERIALS.reduce((g, m) => g + cart[m.key] * m.weightGrams, 0);
}
