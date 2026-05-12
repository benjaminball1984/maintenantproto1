import { useEffect, useState } from 'react';

import { checkIsAdmin } from '@/lib/admin';
import { useAuth } from '@/lib/auth';

export type IsAdminStatus = 'idle' | 'loading' | 'ready';

export interface UseIsAdminResult {
  isAdmin: boolean;
  status: IsAdminStatus;
}

/**
 * Vérifie si l'utilisateur courant est admin via la RPC `public.is_admin`.
 * Reste en `loading` tant que l'état d'authentification n'est pas connu, puis
 * passe en `ready` avec `isAdmin = false` pour les anonymes / utilisateurs
 * standards et `true` pour les admins.
 */
function deriveStatus(
  authStatus: 'loading' | 'authenticated' | 'anonymous',
  userId: string | undefined,
): IsAdminStatus {
  if (authStatus === 'loading') return 'loading';
  if (authStatus === 'anonymous' || !userId) return 'ready';
  return 'loading';
}

export function useIsAdmin(): UseIsAdminResult {
  const { user, status: authStatus } = useAuth();
  const userId = user?.id;
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [status, setStatus] = useState<IsAdminStatus>(() =>
    deriveStatus(authStatus, userId),
  );

  // Pattern « set state during render » : on resynchronise le status quand
  // (authStatus, userId) change, sans muter dans un effet.
  const trackedKey = `${authStatus}|${userId ?? ''}`;
  const [previousKey, setPreviousKey] = useState<string>(trackedKey);
  if (previousKey !== trackedKey) {
    setPreviousKey(trackedKey);
    setIsAdmin(false);
    setStatus(deriveStatus(authStatus, userId));
  }

  useEffect(() => {
    if (authStatus !== 'authenticated' || !userId) return;
    let cancelled = false;
    queueMicrotask(async () => {
      const result = await checkIsAdmin(userId);
      if (cancelled) return;
      setIsAdmin(result);
      setStatus('ready');
    });
    return () => {
      cancelled = true;
    };
  }, [authStatus, userId]);

  return { isAdmin, status };
}
