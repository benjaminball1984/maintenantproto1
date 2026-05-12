import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import {
  getCommuneBySlug,
  listCommuneMembers,
  type CommuneMemberRow,
  type CommuneRow,
} from '@/lib/communes';

export type CommuneStatus = 'idle' | 'loading' | 'ready' | 'notfound' | 'error';

export interface UseCommuneResult {
  commune: CommuneRow | null;
  members: CommuneMemberRow[];
  status: CommuneStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useCommune(slug: string | undefined): UseCommuneResult {
  const [commune, setCommune] = useState<CommuneRow | null>(null);
  const [members, setMembers] = useState<CommuneMemberRow[]>([]);
  const [status, setStatus] = useState<CommuneStatus>(slug ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousSlug, setPreviousSlug] = useState<string | undefined>(slug);
  if (previousSlug !== slug) {
    setPreviousSlug(slug);
    setCommune(null);
    setMembers([]);
    setError(null);
    setStatus(slug ? 'loading' : 'idle');
  }

  const fetchCommune = useCallback(async (currentSlug: string) => {
    const { data, error: err } = await getCommuneBySlug(currentSlug);
    if (err) {
      setCommune(null);
      setMembers([]);
      setError(err);
      setStatus('error');
      return;
    }
    if (!data) {
      setCommune(null);
      setMembers([]);
      setStatus('notfound');
      return;
    }
    setCommune(data);
    const { data: memberData, error: memberError } = await listCommuneMembers(data.id);
    if (memberError) {
      setMembers([]);
      setError(memberError);
      setStatus('error');
      return;
    }
    setMembers(memberData);
    setStatus('ready');
  }, []);

  useEffect(() => {
    if (!slug) return;
    const current = slug;
    queueMicrotask(() => {
      void fetchCommune(current);
    });
  }, [slug, fetchCommune]);

  const refresh = useCallback(async () => {
    if (!slug) return;
    setStatus('loading');
    setError(null);
    await fetchCommune(slug);
  }, [slug, fetchCommune]);

  return { commune, members, status, error, refresh };
}
