import type { CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';

const footerStyle: CSSProperties = {
  marginTop: '3rem',
  padding: '2.5rem 1.5rem 2rem',
  borderTop: '1px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-3)',
  fontSize: 14,
};

const innerStyle: CSSProperties = {
  maxWidth: 1100,
  margin: '0 auto',
};

const columnsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '2rem 2.5rem',
  marginBottom: '1.5rem',
};

const columnTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--mn-text-2)',
  margin: '0 0 0.75rem',
};

const columnListStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const missionTextStyle: CSSProperties = {
  margin: '0 0 0.75rem',
  color: 'var(--mn-text-2)',
  lineHeight: 1.55,
};

const linkStyle: CSSProperties = {
  color: 'var(--mn-text-2)',
  textDecoration: 'none',
};

const baselineStyle: CSSProperties = {
  borderTop: '1px solid var(--mn-border)',
  paddingTop: '1rem',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem 1.5rem',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: 13,
  color: 'var(--mn-text-3)',
};

const TOOL_LINKS: { to: string; label: string }[] = [
  { to: '/petitions', label: 'Pétitions' },
  { to: '/mobilizations', label: 'Mobilisations' },
  { to: '/campaigns', label: 'Campagnes' },
  { to: '/polls', label: 'Sondages' },
  { to: '/services', label: 'Services entraide' },
  { to: '/media', label: 'Média' },
  { to: '/communes', label: 'Communes libres' },
];

const LEGAL_LINKS: { to: string; label: string }[] = [
  { to: '/legal/privacy', label: 'Confidentialité' },
  { to: '/legal/notice', label: 'Mentions légales' },
  { to: '/legal/cookies', label: 'Cookies' },
  { to: '/legal/contact', label: 'Contact' },
  { to: '/transparence', label: 'Transparence' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={footerStyle} aria-label="Pied de page">
      <div style={innerStyle}>
        <div style={columnsStyle}>
          <section aria-labelledby="footer-mission-title">
            <h2 id="footer-mission-title" style={columnTitleStyle}>
              Mission
            </h2>
            <p style={missionTextStyle}>
              Maintenant&nbsp;! rassemble les outils citoyens pour peser ensemble
              sur les décisions publiques&nbsp;: pétitions, mobilisations,
              services d&rsquo;entraide, communes libres.
            </p>
            <NavLink to="/join" style={{ ...linkStyle, fontWeight: 600, color: 'var(--mn-brand)' }}>
              Rejoindre le mouvement →
            </NavLink>
          </section>

          <nav aria-labelledby="footer-tools-title">
            <h2 id="footer-tools-title" style={columnTitleStyle}>
              Outils
            </h2>
            <ul style={columnListStyle}>
              {TOOL_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to} style={linkStyle}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Liens légaux">
            <h2 style={columnTitleStyle}>Légal</h2>
            <ul style={columnListStyle}>
              {LEGAL_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to} style={linkStyle}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div style={baselineStyle}>
          <span>Maintenant&nbsp;! — {year}</span>
          <span>Plateforme citoyenne, sans publicité ni pistage.</span>
        </div>
      </div>
    </footer>
  );
}
