import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { getMobilization, hasUserRsvp, type MobilizationRow } from '@/lib/mobilizations';

export type MobilizationStatusUi = 'idle' | 'loading' | 'ready' | 'notfound' | 'error';

export interface UseMobilizationResult {
  mobilization: MobilizationRow | null;
  status: MobilizationStatusUi;
  error: PostgrestError | null;
  rsvp: boolean;
  refresh: () => Promise<void>;
}

/**
 * Lit une mobilisation par slug et vérifie en parallèle si l'utilisateur
 * courant s'y est déjà inscrit. `userId === null` (anonyme) → `rsvp` reste
 * `false`.
 *
 * Le hook expose `refresh` pour rejouer après une inscription ou un retrait :
 * la fiche se met alors à jour avec le nouveau `participation_count` et l'état
 * d'inscription de l'utilisateur.
 */
export function useMobilization(
  slug: string | undefined,
  userId: string | null,
): UseMobilizationResult {
  const [mobilization, setMobilization] = useState<MobilizationRow | null>(null);
  const [status, setStatus] = useState<MobilizationStatusUi>(slug ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);
  const [rsvp, setRsvp] = useState<boolean>(false);

  const trackedKey = `${slug ?? ''}:${userId ?? ''}`;
  const [previousKey, setPreviousKey] = useState<string>(trackedKey);
  if (previousKey !== trackedKey) {
    setPreviousKey(trackedKey);
    setMobilization(null);
    setError(null);
    setRsvp(false);
    setStatus(slug ? 'loading' : 'idle');
  }

  const fetchMobilization = useCallback(
    async (currentSlug: string, currentUserId: string | null) => {
      const { data, error: fetchError } = await getMobilization(currentSlug);
      if (fetchError) {
        setMobilization(null);
        setError(fetchError);
        setStatus('error');
        return;
      }
      if (!data) {
        setMobilization(null);
        setStatus('notfound');
        return;
      }
      setMobilization(data);
      setStatus('ready');
      if (currentUserId) {
        const { rsvp: hasRsvp, error: rsvpError } = await hasUserRsvp(data.id, currentUserId);
        if (!rsvpError) setRsvp(hasRsvp);
      } else {
        setRsvp(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!slug) return;
    const currentSlug = slug;
    const currentUserId = userId;
    queueMicrotask(() => {
      void fetchMobilization(currentSlug, currentUserId);
    });
  }, [slug, userId, fetchMobilization]);

  const refresh = useCallback(async () => {
    if (!slug) return;
    setStatus('loading');
    setError(null);
    await fetchMobilization(slug, userId);
  }, [slug, userId, fetchMobilization]);

  return { mobilization, status, error, rsvp, refresh };
}
