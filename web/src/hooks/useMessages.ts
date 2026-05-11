import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import { listMessages, type MessageRow } from '@/lib/messaging';

export type MessagesStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseMessagesResult {
  messages: MessageRow[];
  status: MessagesStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useMessages(conversationId: string | undefined): UseMessagesResult {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [status, setStatus] = useState<MessagesStatus>(conversationId ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [previousId, setPreviousId] = useState<string | undefined>(conversationId);
  if (previousId !== conversationId) {
    setPreviousId(conversationId);
    setMessages([]);
    setError(null);
    setStatus(conversationId ? 'loading' : 'idle');
  }

  const fetchMessages = useCallback(async (currentId: string) => {
    const { data, error: err } = await listMessages(currentId);
    if (err) {
      setMessages([]);
      setError(err);
      setStatus('error');
      return;
    }
    setMessages(data);
    setError(null);
    setStatus('ready');
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    const id = conversationId;
    queueMicrotask(() => {
      void fetchMessages(id);
    });
  }, [conversationId, fetchMessages]);

  const refresh = useCallback(async () => {
    if (!conversationId) return;
    setStatus('loading');
    setError(null);
    await fetchMessages(conversationId);
  }, [conversationId, fetchMessages]);

  return { messages, status, error, refresh };
}
