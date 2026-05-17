// Placeholder post-reset (2026-05-17). Site applicatif effacé sur décision
// utilisateur — voir HANDOFF.md à la racine du repo pour le protocole de
// la prochaine session. Cette page démontre uniquement que la charte
// graphique (tokens CSS dans `web/src/index.css`) est chargée et
// fonctionnelle. Aucune route, aucun composant métier ne sera ajouté
// avant validation du périmètre par l'utilisateur.

import type { CSSProperties } from 'react';

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  background: 'var(--mn-bg)',
  color: 'var(--mn-text-1)',
  fontFamily: "'Sora', system-ui, sans-serif",
};

const cardStyle: CSSProperties = {
  maxWidth: 560,
  padding: '2.5rem',
  borderRadius: 16,
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  textAlign: 'center',
};

const badgeStyle: CSSProperties = {
  display: 'inline-block',
  padding: '0.4rem 0.85rem',
  borderRadius: 999,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.02em',
  marginBottom: '1.25rem',
};

const headingStyle: CSSProperties = {
  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
  margin: '0 0 1rem',
};

const paragraphStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.6,
  color: 'var(--mn-text-2)',
  margin: 0,
};

export default function App() {
  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <span style={badgeStyle}>Reset 2026-05-17</span>
        <h1 style={headingStyle}>Maintenant !</h1>
        <p style={paragraphStyle}>
          Site applicatif en attente de redéfinition. Voir{' '}
          <code>HANDOFF.md</code> pour le protocole de la prochaine session
          (description en langage naturel, validation par captures, plan
          de codage par étapes).
        </p>
      </div>
    </main>
  );
}
