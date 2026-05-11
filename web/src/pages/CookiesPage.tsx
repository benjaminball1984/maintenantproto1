import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import { clearConsent, readConsent, type ConsentRecord } from '@/lib/consent';

const pageStyle: CSSProperties = {
  maxWidth: 800,
  margin: '0 auto',
  padding: '2.5rem 1.5rem 4rem',
  color: 'var(--mn-text-1)',
  lineHeight: 1.65,
};

const h1Style: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
  letterSpacing: '-0.02em',
  margin: '0 0 0.5rem',
};

const h2Style: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: '1.25rem',
  marginTop: '2rem',
  marginBottom: '0.5rem',
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '0.5rem',
};

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '0.5rem 0.75rem',
  borderBottom: '2px solid var(--mn-border)',
  background: 'var(--mn-surface-2)',
  fontSize: 13,
};

const tdStyle: CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid var(--mn-border)',
  fontSize: 14,
  verticalAlign: 'top',
};

const summaryBoxStyle: CSSProperties = {
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  borderRadius: 12,
  padding: '1rem 1.25rem',
  margin: '1rem 0 1.5rem',
  fontSize: 14,
};

const primaryBtnStyle: CSSProperties = {
  height: 40,
  padding: '0 18px',
  borderRadius: 10,
  border: 'none',
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};

function formatChoice(record: ConsentRecord | null): string {
  if (!record) return 'Aucun choix enregistré pour le moment.';
  switch (record.choice) {
    case 'all':
      return 'Vous avez accepté tous les cookies (essentiels + audience).';
    case 'essential':
      return 'Vous avez refusé la mesure d’audience. Seuls les cookies essentiels sont actifs.';
    case 'custom':
      return record.categories.analytics
        ? 'Choix personnalisé : audience activée.'
        : 'Choix personnalisé : audience désactivée.';
  }
}

export default function CookiesPage() {
  const [record, setRecord] = useState<ConsentRecord | null>(() => {
    if (typeof window === 'undefined') return null;
    return readConsent();
  });
  const [reset, setReset] = useState(false);

  function handleReset() {
    clearConsent();
    setRecord(null);
    setReset(true);
  }

  return (
    <main style={pageStyle}>
      <h1 style={h1Style}>Cookies</h1>
      <p>
        Cette page détaille les cookies déposés par Maintenant ! et la manière de modifier votre
        choix.
      </p>

      <section aria-labelledby="cookies-current">
        <h2 id="cookies-current" style={h2Style}>
          Votre choix actuel
        </h2>
        <div style={summaryBoxStyle}>
          <p style={{ margin: 0 }}>{formatChoice(record)}</p>
          {record ? (
            <p style={{ margin: '0.5rem 0 0', color: 'var(--mn-text-3)', fontSize: 13 }}>
              Choix enregistré le {new Date(record.at).toLocaleDateString('fr-FR')}.
            </p>
          ) : null}
        </div>
        <button type="button" style={primaryBtnStyle} onClick={handleReset}>
          Modifier mes choix
        </button>
        {reset ? (
          <p
            role="status"
            style={{ marginTop: '0.75rem', color: 'var(--mn-success)', fontSize: 14 }}
          >
            Choix réinitialisé. La bannière de consentement réapparaîtra au prochain chargement.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="cookies-list">
        <h2 id="cookies-list" style={h2Style}>
          Liste des cookies
        </h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Nom</th>
              <th style={thStyle}>Finalité</th>
              <th style={thStyle}>Durée</th>
              <th style={thStyle}>Catégorie</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>sb-auth-token</td>
              <td style={tdStyle}>Session d’authentification Supabase.</td>
              <td style={tdStyle}>1 heure (rafraîchi automatiquement).</td>
              <td style={tdStyle}>Strictement nécessaire</td>
            </tr>
            <tr>
              <td style={tdStyle}>mn:cookie-consent</td>
              <td style={tdStyle}>Mémorisation de votre choix de consentement.</td>
              <td style={tdStyle}>12 mois.</td>
              <td style={tdStyle}>Strictement nécessaire</td>
            </tr>
            <tr>
              <td style={tdStyle}>_mn_audience</td>
              <td style={tdStyle}>
                Mesure d’audience anonymisée (visites agrégées, sans identifiant publicitaire).
              </td>
              <td style={tdStyle}>13 mois.</td>
              <td style={tdStyle}>Soumis à consentement</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 style={h2Style}>En savoir plus</h2>
        <p>
          Pour le détail des traitements, consultez la{' '}
          <Link to="/legal/privacy">politique de confidentialité</Link>.
        </p>
      </section>
    </main>
  );
}
