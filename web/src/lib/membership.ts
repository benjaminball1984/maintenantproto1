import { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type AdhesionRow = Database['public']['Tables']['adhesions']['Row'];
export type AdhesionInsert = Database['public']['Tables']['adhesions']['Insert'];
export type AdhesionTier = Database['public']['Enums']['adhesion_tier'];
export type AdhesionStatus = Database['public']['Enums']['adhesion_status'];

export interface AdhesionResult {
  data: AdhesionRow | null;
  error: PostgrestError | null;
}

export interface CheckoutSessionResult {
  url: string | null;
  error: PostgrestError | null;
}

/** Hiérarchie des tiers — utilisée pour griser un tier inférieur ou égal au tier courant. */
export const TIER_RANK: Record<AdhesionTier, number> = {
  gratuit: 0,
  soutien: 1,
  engage: 2,
};

/** Liste ordonnée des tiers (du moins engageant au plus engageant). */
export const TIER_ORDER: readonly AdhesionTier[] = ['gratuit', 'soutien', 'engage'];

/**
 * Récupère l'adhésion active la plus récente d'un utilisateur. Aucune ligne =
 * data: null (l'utilisateur n'est pas encore adhérent). Inactive ou expirée =
 * traitée comme « pas d'adhésion en cours » (on n'affiche pas le badge).
 */
export async function getCurrentAdhesion(userId: string): Promise<AdhesionResult> {
  const { data, error } = await supabase
    .from('adhesions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return { data, error };
}

/**
 * Insère une adhésion gratuite (tier=gratuit, status=active). Utilise la
 * policy RLS `adhesions_insert_self` : le check exige auth.uid()=user_id.
 * Le status par défaut côté DB est 'pending' — on force 'active' ici car
 * il n'y a pas de webhook à attendre.
 */
export async function createFreeAdhesion(userId: string): Promise<AdhesionResult> {
  const insert: AdhesionInsert = {
    user_id: userId,
    tier: 'gratuit',
    status: 'active',
    amount_eur: 0,
  };
  const { data, error } = await supabase.from('adhesions').insert(insert).select('*').maybeSingle();
  return { data, error };
}

/**
 * Appelle l'Edge Function `create-checkout-session` et renvoie l'URL Stripe
 * hébergée. Le caller est responsable de la redirection :
 *   const { url } = await createCheckoutSession('soutien');
 *   if (url) window.location.assign(url);
 *
 * Toute erreur (réseau, validation côté Edge, configuration Stripe absente)
 * est normalisée en PostgrestError pour partager le mapper FR.
 */
export async function createCheckoutSession(
  tier: Exclude<AdhesionTier, 'gratuit'>,
): Promise<CheckoutSessionResult> {
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
    'create-checkout-session',
    { body: { tier } },
  );
  if (error) {
    return {
      url: null,
      error: new PostgrestError({
        message: error.message || 'stripe_error',
        details: '',
        hint: '',
        code: 'STRIPE_INVOKE_ERROR',
      }),
    };
  }
  if (!data?.url) {
    return {
      url: null,
      error: new PostgrestError({
        message: data?.error ?? 'no_url_returned',
        details: '',
        hint: '',
        code: 'STRIPE_NO_URL',
      }),
    };
  }
  return { url: data.url, error: null };
}

/** Petit helper pur — true si l'utilisateur ne peut plus revenir en arrière sur un tier inférieur. */
export function isTierLockedFor(currentTier: AdhesionTier | null, target: AdhesionTier): boolean {
  if (!currentTier) return false;
  return TIER_RANK[target] <= TIER_RANK[currentTier];
}
