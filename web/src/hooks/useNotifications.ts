import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

import {
  listNotifications,
  type ListNotificationsParams,
  type NotificationRow,
} from '@/lib/notifications';

export type NotificationsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseNotificationsResult {
  notifications: NotificationRow[];
  status: NotificationsStatus;
  error: PostgrestError | null;
  refresh: () => Promise<void>;
}

export function useNotifications(
  recipientId: string | undefined,
  params: ListNotificationsParams = {},
): UseNotificationsResult {
  const { unreadOnly, limit } = params;
  const filterKey = JSON.stringify({ recipientId, unreadOnly, limit });

  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [status, setStatus] = useState<NotificationsStatus>(recipientId ? 'loading' : 'idle');
  const [error, setError] = useState<PostgrestError | null>(null);

  const [trackedKey, setTrackedKey] = useState<string>(filterKey);
  if (trackedKey !== filterKey) {
    setTrackedKey(filterKey);
    setNotifications([]);
    setError(null);
    setStatus(recipientId ? 'loading' : 'idle');
  }

  const fetchNotifications = useCallback(
    async (currentId: string, current: ListNotificationsParams) => {
      const { data, error: err } = await listNotifications(currentId, current);
      if (err) {
        setNotifications([]);
        setError(err);
        setStatus('error');
        return;
      }
      setNotifications(data);
      setError(null);
      setStatus('ready');
    },
    [],
  );

  useEffect(() => {
    if (!recipientId) return;
    const id = recipientId;
    queueMicrotask(() => {
      void fetchNotifications(id, { unreadOnly, limit });
    });
  }, [recipientId, unreadOnly, limit, fetchNotifications]);

  const refresh = useCallback(async () => {
    if (!recipientId) return;
    setStatus('loading');
    setError(null);
    await fetchNotifications(recipientId, { unreadOnly, limit });
  }, [recipientId, unreadOnly, limit, fetchNotifications]);

  return { notifications, status, error, refresh };
}
