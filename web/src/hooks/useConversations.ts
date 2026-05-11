import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { listConversations, type ConversationRow } from '@/lib/messaging';

export type ConversationsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseConversationsResult {
  conversations: ConversationRow[];
  status: ConversationsStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useConversations(userId: string | undefined): UseConversationsResult {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [status, setStatus] = useState<ConversationsStatus>(userId ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousId, setPreviousId] = useState<string | undefined>(userId);
  if (previousId !== userId) {
    setPreviousId(userId);
    setConversations([]);
    setError(null);
    setStatus(userId ? 'loading' : 'idle');
  }

  const fetchConversations = useCallback(async (currentId: string) => {
    const { data, error: err } = await listConversations(currentId);
    if (err) {
      setConversations([]);
      setError(err);
      setStatus('error');
      return;
    }
    setConversations(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    if (!userId) return;
    const id = userId;
    queueMicrotask(() => {
      void fetchConversations(id);
    });
  }, [userId, fetchConversations]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setStatus('loading');
    setError(null);
    await fetchConversations(userId);
  }, [userId, fetchConversations]);

  return { conversations, status, error, refresh };
}
