import { useCallback, useEffect, useState } from 'react';
import { PostgrestError } from '@supabase/supabase-js';

import { useAuth } from '@/lib/auth';
import { getProfile, updateProfile, type UserRow, type UserUpdate } from '@/lib/profile';

export type ProfileStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseProfileResult {
  profile: UserRow | null;
  status: ProfileStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
  update: (patch: UserUpdate) => Promise<{ error: PostgrestError | null }>;
}

/**
 * Lit le profil de l'utilisateur courant depuis `public.users` et expose les
 * primitives d'édition. Le hook reste « anonymous » tant que `useAuth()` n'a
 * pas confirmé une session.
 */
export function useProfile(): UseProfileResult {
  const { user, status: authStatus } = useAuth();
  const userId = user?.id ?? null;

  const [profile, setProfile] = useState<UserRow | null>(null);
  const [fetchStatus, setFetchStatus] = useState<ProfileStatus>('idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  // Status dérivé : tant que l'auth charge, on reflète le loading global.
  const status: ProfileStatus = authStatus === 'loading' ? 'loading' : fetchStatus;

  // Réinitialise l'état local lorsqu'on perd la session ou que l'on change
  // d'utilisateur (pattern « set state during render » avec clé).
  const [trackedUserId, setTrackedUserId] = useState<string | null>(userId);
  if (trackedUserId !== userId) {
    setTrackedUserId(userId);
    setProfile(null);
    setError(null);
    setFetchStatus(userId ? 'loading' : 'idle');
  }

  const fetchProfile = useCallback(async (id: string) => {
    // Le premier setState se fait via le bloc « set state during render » plus
    // haut (la clé `trackedUserId` repasse à 'loading'). Ici on est déjà après
    // l'attente du fetch — toutes les updates de state suivent un `await`.
    const { data, error: fetchError } = await getProfile(id);
    if (fetchError) {
      setError(fetchError);
      setFetchStatus('error');
      return;
    }
    setProfile(data);
    setFetchStatus('ready');
  }, []);

  useEffect(() => {
    if (!userId) return;
    const id = userId;
    queueMicrotask(() => {
      void fetchProfile(id);
    });
  }, [userId, fetchProfile]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setFetchStatus('loading');
    setError(null);
    await fetchProfile(userId);
  }, [userId, fetchProfile]);

  const update = useCallback(
    async (patch: UserUpdate): Promise<{ error: PostgrestError | null }> => {
      if (!userId) {
        return {
          error: new PostgrestError({
            message: 'Session expirée. Reconnectez-vous.',
            details: '',
            hint: '',
            code: 'PGRST301',
          }),
        };
      }
      const { data, error: updateError } = await updateProfile(userId, patch);
      if (updateError) {
        setError(updateError);
        return { error: updateError };
      }
      if (data) {
        setProfile(data);
      }
      setError(null);
      return { error: null };
    },
    [userId],
  );

  return { profile, status, error, refresh, update };
}
