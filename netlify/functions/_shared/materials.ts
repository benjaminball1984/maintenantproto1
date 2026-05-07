// Côté serveur : validation indépendante du client.
// Source de vérité pour les poids, formats autorisés et plafond.

export type MaterialKey =
  | 'flyer_a6'
  | 'flyer_a5'
  | 'poster_a3'
  | 'petition_paper';

type Spec = {
  label: string;
  format: string;
  weightGrams: number;
  allowed: number[];
};

export const SPEC: Record<MaterialKey, Spec> = {
  flyer_a6: {
    label: 'Flyer A6',
    format: 'recto-verso 4 couleurs, 135 g',
    weightGrams: 2,
    allowed: [0, 50, 100, 250, 500],
  },
  flyer_a5: {
    label: 'Flyer A5',
    format: 'recto-verso 4 couleurs, 135 g',
    weightGrams: 4,
    allowed: [0, 50, 100, 250, 500],
  },
  poster_a3: {
    label: 'Affiche A3',
    format: 'recto 4 couleurs, 170 g',
    weightGrams: 12,
    allowed: [0, 5, 10, 25, 50],
  },
  petition_paper: {
    label: 'Pétition papier A4',
    format: 'A4, 80 g',
    weightGrams: 5,
    allowed: [0, 10, 25, 50, 100],
  },
};

export const KEYS = Object.keys(SPEC) as MaterialKey[];

export const TOTAL_UNITS_CAP = 500;

export type Cart = Record<MaterialKey, number>;

export function validateCart(input: unknown):
  | { ok: true; cart: Cart }
  | { ok: false; error: string } {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: 'invalid_cart' };
  }
  const cart: Cart = { flyer_a6: 0, flyer_a5: 0, poster_a3: 0, petition_paper: 0 };
  let units = 0;
  for (const k of KEYS) {
    const raw = (input as Record<string, unknown>)[k];
    const n = typeof raw === 'number' ? raw : 0;
    if (!Number.isInteger(n) || n < 0) return { ok: false, error: `invalid_${k}` };
    if (!SPEC[k].allowed.includes(n)) return { ok: false, error: `forbidden_${k}` };
    cart[k] = n;
    units += n;
  }
  if (units === 0) return { ok: false, error: 'empty_cart' };
  if (units > TOTAL_UNITS_CAP) return { ok: false, error: 'cap_exceeded' };
  return { ok: true, cart };
}

export function totalWeightGrams(cart: Cart): number {
  return KEYS.reduce((g, k) => g + cart[k] * SPEC[k].weightGrams, 0);
}

export function calculateShippingEur(totalWeightGrams: number): number {
  if (totalWeightGrams <= 0) return 0;
  if (totalWeightGrams <= 100) return 2.5;
  if (totalWeightGrams <= 500) return 5.0;
  if (totalWeightGrams <= 1000) return 8.0;
  if (totalWeightGrams <= 2000) return 12.0;
  return 18.0;
}
