import type { CSSProperties, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/lib/auth';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const spinnerWrapStyle: CSSProperties = {
  minHeight: '40vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 32,
};

const spinnerTextStyle: CSSProperties = {
  color: 'var(--mn-text-3)',
  fontSize: 14,
};

export interface RequireAdminProps {
  children: ReactNode;
  /** URL de repli pour les non-admins. Défaut : `/`. */
  redirectTo?: string;
}

/**
 * Wrapper de route : impose qu'une session Supabase soit ouverte ET que
 * l'utilisateur soit admin (via la RPC `public.is_admin`). En attendant la
 * réponse, on affiche un spinner. Si l'utilisateur n'est pas authentifié on
 * renvoie vers `/?auth=login`. S'il est authentifié mais non admin, on
 * renvoie vers `redirectTo` (par défaut `/`).
 *
 * Sécurité : ce wrapper masque l'UI côté front mais la RLS reste la
 * référence — toutes les écritures admin sont aussi gardées côté DB par
 * `public.is_admin(auth.uid())`.
 */
export function RequireAdmin({ children, redirectTo = '/' }: RequireAdminProps) {
  const { status: authStatus } = useAuth();
  const { isAdmin, status: adminStatus } = useIsAdmin();
  const location = useLocation();

  if (authStatus === 'loading' || adminStatus === 'loading') {
    return (
      <div style={spinnerWrapStyle} role="status" aria-live="polite">
        <span style={spinnerTextStyle}>Chargement…</span>
      </div>
    );
  }

  if (authStatus === 'anonymous') {
    return <Navigate to="/?auth=login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

export default RequireAdmin;
