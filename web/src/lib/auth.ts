import { useEffect } from 'react';
import { create } from 'zustand';
import type { AuthError, Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface MagicLinkPayload {
  email: string;
}

export interface AuthResult {
  error: AuthError | null;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  setSession: (session: Session | null) => void;
  signInWithPassword: (payload: SignInPayload) => Promise<AuthResult>;
  signUpWithPassword: (payload: SignUpPayload) => Promise<AuthResult>;
  signInWithMagicLink: (payload: MagicLinkPayload) => Promise<AuthResult>;
  resetPasswordForEmail: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  status: 'loading',
  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      status: session ? 'authenticated' : 'anonymous',
    });
  },
  signInWithPassword: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      set({ session: data.session, user: data.user, status: 'authenticated' });
    }
    return { error };
  },
  signUpWithPassword: async ({ email, password, displayName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    if (!error && data.session) {
      set({ session: data.session, user: data.user, status: 'authenticated' });
    }
    return { error };
  },
  signInWithMagicLink: async ({ email }) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error };
  },
  resetPasswordForEmail: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      set({ session: null, user: null, status: 'anonymous' });
    }
    return { error };
  },
}));

let subscribed = false;

/**
 * Hook à monter une fois au plus haut niveau (RootLayout). S'abonne aux
 * changements de session Supabase Auth et synchronise le store Zustand.
 */
export function useAuth(): AuthState {
  const state = useAuthStore();

  useEffect(() => {
    if (subscribed) {
      return;
    }
    subscribed = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        useAuthStore.getState().setSession(data.session);
      })
      .catch(() => {
        useAuthStore.getState().setSession(null);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setSession(session);
    });

    return () => {
      data.subscription.unsubscribe();
      subscribed = false;
    };
  }, []);

  return state;
}

/**
 * Mappe les codes d'erreur Supabase Auth vers des messages en français.
 * Tout code non reconnu retombe sur le message brut Supabase.
 */
export function authErrorMessage(error: AuthError | null): string | null {
  if (!error) return null;
  const code = error.code ?? '';
  switch (code) {
    case 'invalid_credentials':
    case 'invalid_grant':
      return 'Email ou mot de passe incorrect.';
    case 'email_not_confirmed':
      return 'Votre email n’est pas encore confirmé. Vérifiez votre boîte de réception.';
    case 'user_already_exists':
    case 'email_already_exists':
    case 'email_exists':
      return 'Un compte existe déjà avec cet email.';
    case 'weak_password':
      return 'Mot de passe trop faible (minimum 8 caractères).';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Trop de tentatives. Réessayez dans quelques minutes.';
    case 'user_not_found':
      return 'Aucun compte trouvé avec cet email.';
    case 'signup_disabled':
      return 'Les inscriptions sont actuellement désactivées.';
    default:
      return error.message || 'Une erreur est survenue. Réessayez plus tard.';
  }
}
