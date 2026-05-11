import type { AuthError, Provider } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

/**
 * Providers OAuth exposés côté UI. La liste domaine est volontairement plus
 * restreinte que `Provider` de @supabase/auth-js : seuls Google et Instagram
 * sont activés à l'étape 8.
 *
 * Décision Instagram : la résolution effective côté Supabase Auth se fait dans
 * le dashboard (Settings → Auth → Providers). En 2026, Supabase expose
 * Instagram en tant que provider natif via OIDC. Le typage `Provider` de
 * @supabase/auth-js installé ici (v2.x packagé avec @supabase/supabase-js)
 * ne le liste pas encore, d'où le `as Provider` ciblé ci-dessous, justifié
 * et limité à cette ligne.
 */
export type SocialProvider = 'google' | 'instagram';

export interface OAuthResult {
  error: AuthError | null;
}

function resolveRedirectTo(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return `${window.location.origin}/auth/callback`;
}

/**
 * Lance le flux OAuth Supabase pour le provider social demandé. La promise
 * résolue contient `error: null` si Supabase a renvoyé l'URL de redirection
 * (à ce stade, le navigateur est en train de naviguer vers le consent screen).
 */
export async function signInWithProvider(provider: SocialProvider): Promise<OAuthResult> {
  const redirectTo = resolveRedirectTo();
  const { error } = redirectTo
    ? await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: { redirectTo },
      })
    : await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
      });
  return { error };
}
