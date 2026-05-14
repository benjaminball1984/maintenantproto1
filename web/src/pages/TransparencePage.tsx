import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import MonthlySignupsChart from '@/components/MonthlySignupsChart';
import {
  GO_LIVE_DATE_ISO,
  fetchMonthlySignups,
  fetchT99cpTotal,
  fetchTransparencyCounts,
  formatGoLiveDateFr,
  type MonthlySignupBucket,
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

const cardHintStyle: CSSProperties = {
  color: 'var(--mn-text-3)',
  fontSize: 12,
  margin: '0.5rem 0 0',
  lineHeight: 1.4,
};

// La carte T99CP reçoit un fond légèrement contrasté pour la mettre en
// avant (cf. étape 37 — l'indicateur monnaie solidaire est la donnée la
// plus différenciante de la transparence Maintenant ! par rapport aux
// dashboards classiques d'asso).
const t99cpCardStyle: CSSProperties = {
  ...cardStyle,
  background: 'var(--mn-brand-light)',
  borderColor: 'var(--mn-brand)',
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
  /**
   * Microcopie « comment c'est calculé » affichée sous chaque valeur
   * (étape 37). Reflète la docstring `fetchTransparencyCounts` côté lib :
   * count(*) sur la table, RLS publique, pas de PII, filtre status='published'
   * pour les contenus éditoriaux.
   */
  hint: string;
}

const METRICS: MetricDef[] = [
  {
    key: 'members',
    label: 'Comptes créés',
    hint: 'count(*) sur public.users — RLS publique, aucune PII exposée.',
  },
  {
    key: 'publishedPetitions',
    label: 'Pétitions publiées',
    hint: 'count(*) sur public.petitions où status = « published ».',
  },
  {
    key: 'signatures',
    label: 'Signatures cumulées',
    hint: 'count(*) sur public.signatures — cumulé toutes pétitions.',
  },
  {
    key: 'publishedMobilizations',
    label: 'Mobilisations publiées',
    hint: 'count(*) sur public.mobilizations où status = « published ».',
  },
  {
    key: 'publishedCampaigns',
    label: 'Campagnes publiées',
    hint: 'count(*) sur public.campaigns où status = « published ».',
  },
  {
    key: 'publishedCommunes',
    label: 'Communes libres',
    hint: 'count(*) sur public.communes où status = « published ».',
  },
];

function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

type FetchState =
  | { kind: 'loading' }
  | { kind: 'success'; counts: TransparencyCounts }
  | { kind: 'error'; message: string };

type ChartState =
  | { kind: 'loading' }
  | { kind: 'success'; buckets: MonthlySignupBucket[] }
  | { kind: 'error' };

// Etat dédié au cumul T99CP. Sur erreur (RPC manquante en staging tant
// que la migration étape 30 n'est pas appliquée, ou rate limit), la
// carte est silencieusement masquée — ne pas casser l'affichage des
// autres compteurs publics qui restent corrects.
type T99cpState =
  | { kind: 'loading' }
  | { kind: 'success'; total: number }
  | { kind: 'error' };

export default function TransparencePage() {
  const [state, setState] = useState<FetchState>({ kind: 'loading' });
  const [chartState, setChartState] = useState<ChartState>({ kind: 'loading' });
  const [t99cpState, setT99cpState] = useState<T99cpState>({ kind: 'loading' });

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

  useEffect(() => {
    let cancelled = false;
    fetchMonthlySignups()
      .then((result) => {
        if (cancelled) return;
        if (result.error || !result.data) {
          setChartState({ kind: 'error' });
        } else {
          setChartState({ kind: 'success', buckets: result.data });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setChartState({ kind: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchT99cpTotal()
      .then((result) => {
        if (cancelled) return;
        if (result.error || result.data === null) {
          setT99cpState({ kind: 'error' });
        } else {
          setT99cpState({ kind: 'success', total: result.data });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setT99cpState({ kind: 'error' });
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
              <p style={cardHintStyle}>{metric.hint}</p>
            </li>
          ))}
          {t99cpState.kind === 'success' && (
            <li style={t99cpCardStyle} data-testid="t99cp-total-card">
              <p style={cardValueStyle}>{formatNumber(t99cpState.total)}</p>
              <p style={cardLabelStyle}>T99CP émis (cumulé)</p>
              <p style={cardHintStyle}>
                sum(amount) sur t99cp_transactions où kind = « credit » (RPC
                publique, SECURITY DEFINER).
              </p>
            </li>
          )}
        </ul>
      )}

      <h2 style={h2Style}>Inscriptions par mois (12 derniers mois)</h2>
      <p style={{ color: 'var(--mn-text-2)', fontSize: 14, margin: '0 0 0.5rem' }}>
        Évolution agrégée du nombre de comptes créés. Les données sont
        anonymisées (seule la date de création est utilisée).
      </p>

      {chartState.kind === 'loading' && (
        <div style={errorStyle} role="status" aria-live="polite">
          Chargement du graphique…
        </div>
      )}
      {chartState.kind === 'error' && (
        <div style={errorStyle} role="alert">
          Graphique indisponible pour le moment.
        </div>
      )}
      {chartState.kind === 'success' && (
        <MonthlySignupsChart buckets={chartState.buckets} minHeight={360} />
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
      <p style={{ marginTop: '0.75rem', fontSize: 14 }}>
        En savoir plus sur le mouvement →{' '}
        <Link to="/decouvrir">Découvrir Maintenant !</Link>
      </p>
    </main>
  );
}
