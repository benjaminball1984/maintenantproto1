/**
 * Frais de port La Poste (au prix coûtant, indicatif).
 * À ajuster avec le tarif négocié par BCA si besoin.
 */
export function calculateShipping(totalWeightGrams: number): number {
  if (totalWeightGrams <= 0) return 0;
  if (totalWeightGrams <= 100) return 2.5; // Lettre suivie
  if (totalWeightGrams <= 500) return 5.0;
  if (totalWeightGrams <= 1000) return 8.0;
  if (totalWeightGrams <= 2000) return 12.0;
  return 18.0; // Colissimo 2-5 kg
}

export function formatEuros(eur: number): string {
  return eur.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });
}
