import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { getCurrentAdhesion, type AdhesionRow } from '@/lib/membership';

export type AdhesionStatusUi = 'idle' | 'loading' | 'ready' | 'error';

export interface UseAdhesionResult {
  adhesion: AdhesionRow | null;
  status: AdhesionStatusUi;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/**
 * Charge l'adhésion active courante pour `userId`. Si `userId` est null
 * (utilisateur anonyme), reste en status='idle' sans déclencher de requête.
 * Expose `refresh` pour rejouer la requête manuellement après un succès
 * (insert gratuit, retour Stripe, etc.).
 *
 * Pattern repris de `useProfile` : reset via « set state during render »
 * (clé `trackedUserId`) + fetch dans `queueMicrotask` pour ne pas violer
 * la règle ESLint `react-hooks/set-state-in-effect`.
 */
export function useAdhesion(userId: string | null): UseAdhesionResult {
  const [adhesion, setAdhesion] = useState<AdhesionRow | null>(null);
  const [status, setStatus] = useState<AdhesionStatusUi>(userId ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  // Réinitialise l'état quand userId change (login / logout / impersonation).
  const [trackedUserId, setTrackedUserId] = useState<string | null>(userId);
  if (trackedUserId !== userId) {
    setTrackedUserId(userId);
    setAdhesion(null);
    setError(null);
    setStatus(userId ? 'loading' : 'idle');
  }

  const fetchAdhesion = useCallback(async (id: string) => {
    const { data, error: err } = await getCurrentAdhesion(id);
    if (err) {
      setAdhesion(null);
      setError(err);
      setStatus('error');
      return;
    }
    setAdhesion(data ?? null);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    if (!userId) return;
    const id = userId;
    queueMicrotask(() => {
      void fetchAdhesion(id);
    });
  }, [userId, fetchAdhesion]);

  const refresh = useCallback(async () => {
    if (!userId) {
      setAdhesion(null);
      setError(null);
      setStatus('idle');
      return;
    }
    setStatus('loading');
    setError(null);
    await fetchAdhesion(userId);
  }, [userId, fetchAdhesion]);

  return { adhesion, status, error, refresh };
}
