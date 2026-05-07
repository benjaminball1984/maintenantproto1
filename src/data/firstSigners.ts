export type SignerCategory =
  | 'scientifique'
  | 'medical'
  | 'paysan'
  | 'culturel'
  | 'elu'
  | 'autre';

export type FirstSigner = {
  name: string;
  role: string;
  category: SignerCategory;
  photoUrl?: string;
};

export const CATEGORY_LABELS: Record<SignerCategory, string> = {
  scientifique: 'Scientifiques et chercheur·euses',
  medical: 'Professionnel·les de santé',
  paysan: 'Paysannes et paysans',
  culturel: 'Personnalités culturelles',
  elu: 'Élu·es',
  autre: 'Autres signataires',
};

/**
 * À compléter manuellement par l'équipe Bio Consom'acteurs.
 * Garder l'ordre alphabétique au sein de chaque catégorie.
 */
export const firstSigners: FirstSigner[] = [
  // Exemples ; à remplacer par les vrais signataires.
  // {
  //   name: "Marc Dufumier",
  //   role: "Ingénieur agronome, professeur émérite AgroParisTech",
  //   category: "scientifique",
  // },
];
