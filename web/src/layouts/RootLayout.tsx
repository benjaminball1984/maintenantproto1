import { useEffect, useState, type CSSProperties } from 'react';
import { NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';

import AuthModal from '@/components/AuthModal';
import { IconLogout, IconUser } from '@/components/icons';
import { useAuth } from '@/lib/auth';

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

const headerStyle: CSSProperties = {
  padding: '0.75rem 1rem',
  borderBottom: '1px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  flexWrap: 'wrap',
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

  const navItems =
    status === 'authenticated'
      ? [...baseNavItems, { to: '/profile', label: 'Profil' }]
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

      <Outlet />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
