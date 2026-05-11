import { NavLink, Outlet } from 'react-router-dom';

const navItems: { to: string; label: string }[] = [
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
  { to: '/profile', label: 'Profil' },
];

export default function RootLayout() {
  return (
    <div>
      <header
        style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid #E8E6E1',
          background: '#FFFFFF',
        }}
      >
        <nav aria-label="Navigation principale">
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              margin: 0,
              padding: 0,
            }}
          >
            {navItems.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  style={({ isActive }) => ({
                    color: isActive ? '#E11D74' : '#1A1A18',
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
      </header>
      <Outlet />
    </div>
  );
}
