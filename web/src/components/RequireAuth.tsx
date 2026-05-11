import type { CSSProperties, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/lib/auth';

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

export interface RequireAuthProps {
  children: ReactNode;
  /** URL de repli si l'utilisateur n'est pas authentifié. Défaut : `/?auth=login`. */
  redirectTo?: string;
}

/**
 * Wrapper de route : impose qu'une session Supabase soit ouverte avant de rendre
 * `children`. Tant que `useAuth()` est en `loading`, on affiche un spinner ; en
 * `anonymous`, on redirige vers `redirectTo` (par défaut `/?auth=login`, ce qui
 * ouvre la modale d'authentification dans `RootLayout`).
 */
export function RequireAuth({ children, redirectTo = '/?auth=login' }: RequireAuthProps) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div style={spinnerWrapStyle} role="status" aria-live="polite">
        <span style={spinnerTextStyle}>Chargement…</span>
      </div>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

export default RequireAuth;
