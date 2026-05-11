import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { listFollowing, type FollowRow } from '@/lib/social';

export type FollowingStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseFollowingResult {
  following: FollowRow[];
  status: FollowingStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

/**
 * Liste les utilisateurs suivis par `followerId`. Si `followerId` est
 * vide / undefined (utilisateur non authentifié), renvoie immédiatement
 * un état stable « idle » sans appel réseau.
 */
export function useFollowing(followerId: string | undefined): UseFollowingResult {
  const [following, setFollowing] = useState<FollowRow[]>([]);
  const [status, setStatus] = useState<FollowingStatus>(followerId ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousId, setPreviousId] = useState<string | undefined>(followerId);
  if (previousId !== followerId) {
    setPreviousId(followerId);
    setFollowing([]);
    setError(null);
    setStatus(followerId ? 'loading' : 'idle');
  }

  const fetchFollowing = useCallback(async (currentId: string) => {
    const { data, error: err } = await listFollowing(currentId);
    if (err) {
      setFollowing([]);
      setError(err);
      setStatus('error');
      return;
    }
    setFollowing(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    if (!followerId) return;
    const id = followerId;
    queueMicrotask(() => {
      void fetchFollowing(id);
    });
  }, [followerId, fetchFollowing]);

  const refresh = useCallback(async () => {
    if (!followerId) return;
    setStatus('loading');
    setError(null);
    await fetchFollowing(followerId);
  }, [followerId, fetchFollowing]);

  return { following, status, error, refresh };
}
