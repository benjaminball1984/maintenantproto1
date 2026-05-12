// =====================================================================================
// stripe-webhook — Thin re-export du handler canonique.
//
// La logique pure du webhook Stripe vit dans
// `web/src/lib/stripeWebhookHandler.ts` (étape 23, dette H2-arch clôturée).
// Ce fichier existe uniquement pour que :
//   * Le bootstrap Deno (`./index.ts`) continue d'importer depuis
//     `./handler.ts` (chemin stable côté Edge Function).
//   * Le bundler `supabase functions deploy` suive le chemin relatif vers
//     `../../../web/src/lib/stripeWebhookHandler.ts` lors du déploiement.
//
// Pas de logique ici : tout ajout doit aller dans `stripeWebhookHandler.ts`
// pour rester couvert par les tests vitest.
// =====================================================================================

// IMPORTANT — Ne pas retirer le suffixe `.ts` : Deno l'exige pour les
// imports relatifs (le bundler `supabase functions deploy` utilise Deno).
// `export *` plutôt que re-export multi-clauses : zéro dette de synchro
// si un nouveau symbole est ajouté à `stripeWebhookHandler.ts`.
export * from '../../../web/src/lib/stripeWebhookHandler.ts';
