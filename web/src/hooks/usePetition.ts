import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { getPetition, hasUserSigned, type PetitionRow } from '@/lib/petitions';

export type PetitionStatusUi = 'idle' | 'loading' | 'ready' | 'notfound' | 'error';

export interface UsePetitionResult {
  petition: PetitionRow | null;
  status: PetitionStatusUi;
  error: PostgrestError | null;
  signed: boolean;
  refresh: () => Promise<void>;
}

/**
 * Lit une pétition par slug et vérifie en parallèle si l'utilisateur courant
 * l'a déjà signée. `userId === null` (anonyme) → `signed` reste `false`.
 *
 * Le hook expose `refresh` pour rejouer après une signature ou un retrait :
 * la fiche se met alors à jour avec le nouveau `signature_count` et l'état
 * de signature de l'utilisateur.
 */
export function usePetition(slug: string | undefined, userId: string | null): UsePetitionResult {
  const [petition, setPetition] = useState<PetitionRow | null>(null);
  const [status, setStatus] = useState<PetitionStatusUi>(slug ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);
  const [signed, setSigned] = useState<boolean>(false);

  const trackedKey = `${slug ?? ''}:${userId ?? ''}`;
  const [previousKey, setPreviousKey] = useState<string>(trackedKey);
  if (previousKey !== trackedKey) {
    setPreviousKey(trackedKey);
    setPetition(null);
    setError(null);
    setSigned(false);
    setStatus(slug ? 'loading' : 'idle');
  }

  const fetchPetition = useCallback(async (currentSlug: string, currentUserId: string | null) => {
    const { data, error: fetchError } = await getPetition(currentSlug);
    if (fetchError) {
      setPetition(null);
      setError(fetchError);
      setStatus('error');
      return;
    }
    if (!data) {
      setPetition(null);
      setStatus('notfound');
      return;
    }
    setPetition(data);
    setStatus('ready');
    if (currentUserId) {
      const { signed: hasSigned, error: signError } = await hasUserSigned(data.id, currentUserId);
      if (!signError) setSigned(hasSigned);
    } else {
      setSigned(false);
    }
  }, []);

  useEffect(() => {
    if (!slug) return;
    const currentSlug = slug;
    const currentUserId = userId;
    queueMicrotask(() => {
      void fetchPetition(currentSlug, currentUserId);
    });
  }, [slug, userId, fetchPetition]);

  const refresh = useCallback(async () => {
    if (!slug) return;
    setStatus('loading');
    setError(null);
    await fetchPetition(slug, userId);
  }, [slug, userId, fetchPetition]);

  return { petition, status, error, signed, refresh };
}
