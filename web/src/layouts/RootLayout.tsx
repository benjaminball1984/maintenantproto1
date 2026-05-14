import { Suspense, useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';

import AuthModal from '@/components/AuthModal';
import CookieBanner from '@/components/CookieBanner';
import Footer from '@/components/Footer';
import RouteErrorBoundary from '@/components/RouteErrorBoundary';
import { IconLogout, IconSearch, IconUser } from '@/components/icons';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/lib/auth';

const routeFallbackStyle: CSSProperties = {
  minHeight: '40vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--mn-text-3)',
  fontSize: 14,
};

const routeFallback = (
  <div role="status" aria-live="polite" style={routeFallbackStyle}>
    Chargement…
  </div>
);

const baseNavItems: { to: string; label: string }[] = [
  { to: '/', label: 'Accueil' },
  { to: '/petitions', label: 'Pétitions' },
  { to: '/mobilizations', label: 'Mobilisations' },
  { to: '/campaigns', label: 'Campagnes' },
  { to: '/services', label: 'Services' },
  { to: '/media', label: 'Média' },
  { to: '/reseau', label: 'Réseau' },
  { to: '/polls', label: 'Sondages' },
  { to: '/communes', label: 'Communes' },
  { to: '/join', label: 'Rejoindre' },
];

// Étape 38 — header sticky : `position: sticky; top: 0` + `z-index: 10`
// pour passer au-dessus des contenus de page sans bloquer les modales
// (AuthModal utilise un overlay plus haut). Le `backdrop-filter` adoucit
// la transition quand la page scroll sous le header.
const headerStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  borderBottom: '1px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  flexWrap: 'wrap',
  position: 'sticky',
  top: 0,
  zIndex: 10,
};

// Étape 38 — recherche globale (placeholder UI : navigation vers
// `/recherche?q=…`). La page `/recherche` reste à câbler (étape future) ;
// pour l'instant on tombe sur le `NotFoundPage` standard si l'utilisateur
// soumet. C'est volontaire — le placeholder cadre l'attente fonctionnelle
// sans déployer un index full-text incomplet.
const searchFormStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  borderRadius: 999,
  padding: '4px 4px 4px 12px',
  height: 36,
};

const searchInputStyle: CSSProperties = {
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 13,
  fontFamily: 'inherit',
  color: 'var(--mn-text-1)',
  width: 160,
};

const searchSubmitStyle: CSSProperties = {
  height: 28,
  width: 28,
  border: 'none',
  borderRadius: 999,
  background: 'var(--mn-brand)',
  color: '#ffffff',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const navListStyle: CSSProperties = {
  listStyle: 'none',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  margin: 0,
  padding: 0,
  flex: 1,
  minWidth: 0,
};

const loginBtnStyle: CSSProperties = {
  height: 40,
  padding: '0 16px',
  border: 'none',
  borderRadius: 10,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};

const userMenuStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 8px 0 12px',
  height: 40,
  borderRadius: 10,
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
};

const userNameStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--mn-text-1)',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const logoutBtnStyle: CSSProperties = {
  height: 28,
  padding: '0 10px',
  borderRadius: 8,
  border: '1px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-2)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};

function displayNameFromUser(user: { user_metadata?: { display_name?: string }; email?: string }) {
  const meta = user.user_metadata?.display_name;
  if (typeof meta === 'string' && meta.trim()) return meta.trim();
  if (user.email) return user.email.split('@')[0] ?? user.email;
  return 'Compte';
}

export default function RootLayout() {
  const { status, user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Synchronisation `?auth=login` ↔ modale (pattern « set state during render »
  // pour rester compatible avec la règle react-hooks/set-state-in-effect).
  const authQuery = searchParams.get('auth');
  const wantsAuthOpen = authQuery === 'login' && status !== 'authenticated';
  const [trackedKey, setTrackedKey] = useState(`${authQuery}|${status}`);
  const currentKey = `${authQuery}|${status}`;
  if (trackedKey !== currentKey) {
    setTrackedKey(currentKey);
    if (wantsAuthOpen) {
      setAuthOpen(true);
    } else if (status === 'authenticated' && authQuery) {
      setAuthOpen(false);
    }
  }

  // Une fois authentifié·e, on nettoie le query param `?auth=login` côté URL.
  useEffect(() => {
    if (status === 'authenticated' && searchParams.get('auth')) {
      const next = new URLSearchParams(searchParams);
      next.delete('auth');
      setSearchParams(next, { replace: true });
    }
  }, [status, searchParams, setSearchParams]);

  const handleSignOut = async () => {
    await signOut();
  };

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchSubmitting, setSearchSubmitting] = useState<boolean>(false);
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Janitor JAN38-R3 — gate sur le double-submit : un double-clic
    // rapide ou un Enter + clic rapproché déclencherait deux
    // navigate(). React Router déduplique en pratique, mais l'edge
    // case « query change entre les deux » existe. Reset après tick.
    if (searchSubmitting) return;
    const q = searchQuery.trim();
    if (!q) return;
    setSearchSubmitting(true);
    navigate(`/recherche?q=${encodeURIComponent(q)}`);
    // Reset au prochain tick — la navigation est synchrone côté
    // memory router, asynchrone côté browser, mais dans tous les cas
    // le re-render se fait avant la prochaine interaction utilisateur.
    queueMicrotask(() => setSearchSubmitting(false));
  };

  const navItems =
    status === 'authenticated'
      ? [
          ...baseNavItems,
          { to: '/profile', label: 'Profil' },
          ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
        ]
      : baseNavItems;

  return (
    <div>
      <header style={headerStyle}>
        <nav aria-label="Navigation principale" style={{ flex: 1, minWidth: 0 }}>
          <ul style={navListStyle}>
            {navItems.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--mn-brand)' : 'var(--mn-text-1)',
                    textDecoration: 'none',
                    fontWeight: isActive ? 600 : 400,
                  })}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <form
          role="search"
          aria-label="Recherche globale"
          onSubmit={handleSearchSubmit}
          style={searchFormStyle}
        >
          <label htmlFor="global-search" style={{ position: 'absolute', left: -9999 }}>
            Rechercher
          </label>
          <input
            id="global-search"
            type="search"
            placeholder="Rechercher…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInputStyle}
            autoComplete="off"
          />
          <button
            type="submit"
            style={searchSubmitStyle}
            aria-label="Lancer la recherche"
            disabled={searchQuery.trim().length === 0}
          >
            <IconSearch width={14} height={14} />
          </button>
        </form>

        {status === 'authenticated' && user ? (
          <div style={userMenuStyle}>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              style={{
                ...userNameStyle,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Ouvrir mon profil"
            >
              <IconUser width={16} height={16} />
              {displayNameFromUser(user)}
            </button>
            <button type="button" onClick={handleSignOut} style={logoutBtnStyle}>
              <IconLogout width={14} height={14} />
              Se déconnecter
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            style={loginBtnStyle}
            disabled={status === 'loading'}
          >
            Se connecter
          </button>
        )}
      </header>

      <RouteErrorBoundary>
        <Suspense fallback={routeFallback}>
          <Outlet />
        </Suspense>
      </RouteErrorBoundary>

      <Footer />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <CookieBanner />
    </div>
  );
}
