import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import {
  GO_LIVE_DATE_ISO,
  fetchTransparencyCounts,
  formatGoLiveDateFr,
  type TransparencyCounts,
} from '@/lib/transparency';

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

const subtitleStyle: CSSProperties = {
  color: 'var(--mn-text-3)',
  fontSize: 14,
  margin: '0 0 2rem',
};

const h2Style: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: '1.25rem',
  marginTop: '2.5rem',
  marginBottom: '0.75rem',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1rem',
  margin: '1rem 0 0',
};

const cardStyle: CSSProperties = {
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  borderRadius: 12,
  padding: '1.25rem',
};

const cardValueStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: '1.75rem',
  fontWeight: 600,
  letterSpacing: '-0.02em',
  margin: '0',
  lineHeight: 1.1,
};

const cardLabelStyle: CSSProperties = {
  color: 'var(--mn-text-2)',
  fontSize: 14,
  margin: '0.25rem 0 0',
};

const errorStyle: CSSProperties = {
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  borderRadius: 12,
  padding: '1rem 1.25rem',
  color: 'var(--mn-text-2)',
  margin: '1rem 0 0',
};

interface MetricDef {
  key: keyof TransparencyCounts;
  label: string;
}

const METRICS: MetricDef[] = [
  { key: 'members', label: 'Comptes créés' },
  { key: 'publishedPetitions', label: 'Pétitions publiées' },
  { key: 'signatures', label: 'Signatures cumulées' },
  { key: 'publishedMobilizations', label: 'Mobilisations publiées' },
  { key: 'publishedCampaigns', label: 'Campagnes publiées' },
  { key: 'publishedCommunes', label: 'Communes libres' },
];

function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

type FetchState =
  | { kind: 'loading' }
  | { kind: 'success'; counts: TransparencyCounts }
  | { kind: 'error'; message: string };

export default function TransparencePage() {
  const [state, setState] = useState<FetchState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetchTransparencyCounts()
      .then((result) => {
        if (cancelled) return;
        if (result.error || !result.data) {
          setState({
            kind: 'error',
            message: result.error?.message ?? 'Erreur de chargement des compteurs',
          });
        } else {
          setState({ kind: 'success', counts: result.data });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Erreur inconnue',
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={pageStyle}>
      <h1 style={h1Style}>Transparence</h1>
      <p style={subtitleStyle}>
        Plateforme mise en service le {formatGoLiveDateFr(GO_LIVE_DATE_ISO)}.
        Les compteurs ci-dessous sont calculés en temps réel depuis la base de
        données, sans tracking ni publicité.
      </p>

      <h2 style={h2Style}>Activité de la plateforme</h2>

      {state.kind === 'loading' && (
        <div style={errorStyle} role="status" aria-live="polite">
          Chargement des compteurs…
        </div>
      )}

      {state.kind === 'error' && (
        <div style={errorStyle} role="alert">
          Impossible de charger les compteurs ({state.message}). Réessayez plus tard.
        </div>
      )}

      {state.kind === 'success' && (
        <ul style={gridStyle} aria-label="Compteurs publics">
          {METRICS.map((metric) => (
            <li key={metric.key} style={cardStyle}>
              <p style={cardValueStyle}>{formatNumber(state.counts[metric.key])}</p>
              <p style={cardLabelStyle}>{metric.label}</p>
            </li>
          ))}
        </ul>
      )}

      <h2 style={h2Style}>Ce que vous ne verrez pas ici</h2>
      <p>
        Conformément à notre politique de confidentialité, aucune donnée
        nominative, aucune adresse IP, aucun pixel publicitaire n'est exposé sur
        cette page. Les compteurs ne donnent qu'une vue agrégée. Consultez la
        <Link to="/legal/privacy"> politique de confidentialité</Link> pour le
        détail des sous-traitants et durées de conservation.
      </p>

      <h2 style={h2Style}>Modération</h2>
      <p>
        Les signalements ouverts par les adhérent·es ne sont pas comptabilisés
        publiquement pour préserver la confidentialité des dossiers en cours
        (procédure détaillée dans le document de modération interne, accessible
        sur demande à l'équipe). Un rapport annuel agrégé sera publié.
      </p>

      <p style={{ marginTop: '2.5rem', fontSize: 14, color: 'var(--mn-text-3)' }}>
        Vous voyez une donnée qui vous semble incorrecte ?
        {' '}
        <Link to="/legal/contact">Contactez-nous</Link>.
      </p>
    </main>
  );
}
