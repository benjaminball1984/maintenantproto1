import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { getPoll, getUserVote, type PollOptionRow, type PollRow } from '@/lib/polls';

export type PollStatusUi = 'idle' | 'loading' | 'ready' | 'notfound' | 'error';

export interface UsePollResult {
  poll: PollRow | null;
  options: PollOptionRow[];
  status: PollStatusUi;
  error: PostgrestError | null;
  userOptionId: string | null;
  refresh: () => Promise<void>;
}

/**
 * Lit un sondage par slug avec ses options + le vote courant de l'utilisateur.
 * `userId === null` (anonyme) → `userOptionId` reste `null`.
 *
 * Le hook expose `refresh` pour rejouer après un vote ou un retrait : la fiche
 * se met alors à jour avec les compteurs (vote_count) et le choix de l'user.
 */
export function usePoll(slug: string | undefined, userId: string | null): UsePollResult {
  const [poll, setPoll] = useState<PollRow | null>(null);
  const [options, setOptions] = useState<PollOptionRow[]>([]);
  const [status, setStatus] = useState<PollStatusUi>(slug ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);
  const [userOptionId, setUserOptionId] = useState<string | null>(null);

  const trackedKey = `${slug ?? ''}:${userId ?? ''}`;
  const [previousKey, setPreviousKey] = useState<string>(trackedKey);
  if (previousKey !== trackedKey) {
    setPreviousKey(trackedKey);
    setPoll(null);
    setOptions([]);
    setError(null);
    setUserOptionId(null);
    setStatus(slug ? 'loading' : 'idle');
  }

  const fetchPoll = useCallback(async (currentSlug: string, currentUserId: string | null) => {
    const { data, error: fetchError } = await getPoll(currentSlug);
    if (fetchError) {
      setPoll(null);
      setOptions([]);
      setError(fetchError);
      setStatus('error');
      return;
    }
    if (!data) {
      setPoll(null);
      setOptions([]);
      setStatus('notfound');
      return;
    }
    setPoll(data.poll);
    setOptions(data.options);
    setStatus('ready');
    if (currentUserId) {
      const { optionId, error: voteError } = await getUserVote(data.poll.id, currentUserId);
      if (!voteError) setUserOptionId(optionId);
    } else {
      setUserOptionId(null);
    }
  }, []);

  useEffect(() => {
    if (!slug) return;
    const currentSlug = slug;
    const currentUserId = userId;
    queueMicrotask(() => {
      void fetchPoll(currentSlug, currentUserId);
    });
  }, [slug, userId, fetchPoll]);

  const refresh = useCallback(async () => {
    if (!slug) return;
    setStatus('loading');
    setError(null);
    await fetchPoll(slug, userId);
  }, [slug, userId, fetchPoll]);

  return { poll, options, status, error, userOptionId, refresh };
}
