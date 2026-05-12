import type { CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';

const footerStyle: CSSProperties = {
  marginTop: '3rem',
  padding: '1.5rem 1rem 2rem',
  borderTop: '1px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-3)',
  fontSize: 13,
};

const innerStyle: CSSProperties = {
  maxWidth: 1100,
  margin: '0 auto',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem 1.5rem',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const navStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem 1.25rem',
};

const linkStyle: CSSProperties = {
  color: 'var(--mn-text-2)',
  textDecoration: 'none',
};

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={footerStyle} aria-label="Pied de page">
      <div style={innerStyle}>
        <span>Maintenant ! — {year}</span>
        <nav aria-label="Liens légaux" style={navStyle}>
          <NavLink to="/legal/privacy" style={linkStyle}>
            Confidentialité
          </NavLink>
          <NavLink to="/legal/notice" style={linkStyle}>
            Mentions légales
          </NavLink>
          <NavLink to="/legal/cookies" style={linkStyle}>
            Cookies
          </NavLink>
          <NavLink to="/legal/contact" style={linkStyle}>
            Contact
          </NavLink>
          <NavLink to="/transparence" style={linkStyle}>
            Transparence
          </NavLink>
        </nav>
      </div>
    </footer>
  );
}
