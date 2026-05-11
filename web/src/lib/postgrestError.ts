import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Mappe les codes d'erreur Postgrest (Supabase) vers des messages utilisateur
 * en français. Les codes officiels viennent de PostgREST :
 *   https://postgrest.org/en/stable/references/errors.html
 * et des `SQLSTATE` Postgres standards.
 *
 * Tout code non reconnu retombe sur `error.message` puis sur un message générique.
 */
export function postgrestErrorMessage(error: PostgrestError | null): string | null {
  if (!error) return null;
  const code = error.code ?? '';
  switch (code) {
    case '23505':
      return 'Cette valeur est déjà utilisée par un autre compte.';
    case '23503':
      return 'Référence invalide : la ressource liée n’existe pas ou plus.';
    case '23502':
      return 'Un champ obligatoire est manquant.';
    case '23514':
      return 'La valeur saisie ne respecte pas les contraintes du champ.';
    case '22001':
      return 'Une valeur saisie dépasse la longueur maximale autorisée.';
    case '22P02':
      return 'Format de donnée invalide.';
    case '42501':
      return 'Vous n’avez pas les droits pour effectuer cette action.';
    case 'PGRST116':
      return 'Aucun résultat trouvé.';
    case 'PGRST301':
      return 'Votre session a expiré. Reconnectez-vous.';
    case 'PGRST204':
      return 'Aucune ligne mise à jour : la ressource n’existe pas ou est protégée.';
    default:
      return error.message || 'Une erreur est survenue. Réessayez plus tard.';
  }
}
