import { useEffect, useState, type CSSProperties, type ReactElement } from 'react';
import { Link } from 'react-router-dom';

import {
  IconBarChart,
  IconFlame,
  IconHome,
  IconMegaphone,
  IconPen,
  IconShare,
  IconSpark,
  IconUsers,
} from '@/components/icons';
import {
  fetchT99cpTotal,
  fetchTransparencyCounts,
  type TransparencyCounts,
} from '@/lib/transparency';

type CountersState =
  | { kind: 'loading' }
  | { kind: 'success'; counts: TransparencyCounts }
  | { kind: 'error' };

type T99cpState =
  | { kind: 'loading' }
  | { kind: 'success'; total: number }
  | { kind: 'error' };

function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

const heroSectionStyle: CSSProperties = {
  position: 'relative',
  padding: 'clamp(3rem, 6vw, 5rem) 1.5rem 2.5rem',
  background:
    'radial-gradient(ellipse at top, rgba(225, 29, 116, 0.08), transparent 60%), var(--mn-bg)',
  textAlign: 'center',
};

const heroInnerStyle: CSSProperties = {
  maxWidth: 880,
  margin: '0 auto',
};

const heroEyebrowStyle: CSSProperties = {
  display: 'inline-block',
  padding: '0.4rem 0.85rem',
  borderRadius: 999,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.02em',
  margin: '0 0 1.25rem',
};

const heroH1Style: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(2.25rem, 6vw, 3.75rem)',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  lineHeight: 1.05,
  margin: '0 0 1rem',
  color: 'var(--mn-text-1)',
};

const heroSubStyle: CSSProperties = {
  fontSize: 'clamp(1rem, 2vw, 1.2rem)',
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: '0 auto 2rem',
  maxWidth: 640,
};

const ctaRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  justifyContent: 'center',
};

const primaryCtaStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '0.85rem 1.4rem',
  borderRadius: 12,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 16,
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
};

const secondaryCtaStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '0.85rem 1.4rem',
  borderRadius: 12,
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-1)',
  fontWeight: 600,
  fontSize: 16,
  textDecoration: 'none',
  border: '1px solid var(--mn-border-dark)',
  cursor: 'pointer',
};

const countersSectionStyle: CSSProperties = {
  padding: '0 1.5rem 3rem',
  background: 'var(--mn-bg)',
};

const countersGridStyle: CSSProperties = {
  maxWidth: 1080,
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1rem',
};

const counterCardStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 14,
  padding: '1.25rem 1.25rem 1rem',
  textAlign: 'left',
};

const counterValueStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(1.6rem, 3vw, 2rem)',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  margin: '0.4rem 0 0.25rem',
  lineHeight: 1.1,
  color: 'var(--mn-text-1)',
};

const counterLabelStyle: CSSProperties = {
  color: 'var(--mn-text-2)',
  fontSize: 14,
  margin: 0,
};

const counterIconWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 8,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
};

const counterPlaceholderStyle: CSSProperties = {
  display: 'inline-block',
  minWidth: '3.5ch',
  color: 'var(--mn-text-3)',
};

const actionsSectionStyle: CSSProperties = {
  padding: '3rem 1.5rem',
  background: 'var(--mn-surface-2)',
};

const sectionTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  textAlign: 'center',
  margin: '0 0 0.5rem',
  color: 'var(--mn-text-1)',
};

const sectionSubtitleStyle: CSSProperties = {
  textAlign: 'center',
  color: 'var(--mn-text-2)',
  fontSize: 16,
  margin: '0 auto 2rem',
  maxWidth: 600,
};

const actionsGridStyle: CSSProperties = {
  maxWidth: 1080,
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1.25rem',
};

const actionCardStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 16,
  padding: '1.5rem',
  textDecoration: 'none',
  color: 'inherit',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const actionIconWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 44,
  height: 44,
  borderRadius: 12,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
};

const actionTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: '1.25rem',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  margin: 0,
  color: 'var(--mn-text-1)',
};

const actionDescStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.5,
  color: 'var(--mn-text-2)',
  margin: 0,
  flex: 1,
};

const actionCtaStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--mn-brand)',
  marginTop: '0.25rem',
};

const missionSectionStyle: CSSProperties = {
  padding: '3.5rem 1.5rem',
  background: 'var(--mn-bg)',
};

const missionInnerStyle: CSSProperties = {
  maxWidth: 760,
  margin: '0 auto',
  textAlign: 'center',
};

const missionBodyStyle: CSSProperties = {
  fontSize: 17,
  lineHeight: 1.7,
  color: 'var(--mn-text-2)',
  margin: '0 auto 1.5rem',
};

interface CounterDef {
  key: string;
  label: string;
  testId: string;
  icon: (props: { width?: number; height?: number }) => ReactElement;
}

const COUNTER_DEFS: CounterDef[] = [
  {
    key: 'signatures',
    label: 'Signataires',
    testId: 'home-counter-signatures',
    icon: IconPen,
  },
  {
    key: 'mobilizations',
    label: 'Mobilisations en cours',
    testId: 'home-counter-mobilizations',
    icon: IconMegaphone,
  },
  {
    key: 'communes',
    label: 'Communes libres',
    testId: 'home-counter-communes',
    icon: IconUsers,
  },
  {
    key: 'T99CP',
    label: 'T99CP émis',
    testId: 'home-counter-t99cp',
    icon: IconBarChart,
  },
];

interface ActionDef {
  to: string;
  label: string;
  title: string;
  description: string;
  cta: string;
  icon: (props: { width?: number; height?: number }) => ReactElement;
}

const ACTIONS: ActionDef[] = [
  {
    to: '/petitions',
    label: 'Pétitions',
    title: 'Signer ou lancer une pétition',
    description:
      'Pèse sur les décisions publiques : porte une demande citoyenne, ajoute ta signature à celles qui te parlent.',
    cta: 'Voir les pétitions',
    icon: IconPen,
  },
  {
    to: '/mobilizations',
    label: 'Mobilisations',
    title: 'Rejoindre une mobilisation',
    description:
      'Manifestations, AG, actions locales : trouve un événement près de chez toi ou organise-le.',
    cta: 'Voir les mobilisations',
    icon: IconFlame,
  },
  {
    to: '/services',
    label: 'Services',
    title: "Échanger via les services d'entraide",
    description:
      'Hébergement, covoiturage, prêt, jardin partagé, SEL : des services pour s’entraider au quotidien.',
    cta: "Découvrir l'entraide",
    icon: IconHome,
  },
];

export default function HomePage() {
  const [countersState, setCountersState] = useState<CountersState>({ kind: 'loading' });
  const [t99cpState, setT99cpState] = useState<T99cpState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetchTransparencyCounts()
      .then((result) => {
        if (cancelled) return;
        if (result.error || !result.data) {
          setCountersState({ kind: 'error' });
        } else {
          setCountersState({ kind: 'success', counts: result.data });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setCountersState({ kind: 'error' });
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

  const valueFor = (key: string): string | null => {
    if (key === 'T99CP') {
      if (t99cpState.kind === 'success') return formatNumber(t99cpState.total);
      if (t99cpState.kind === 'error') return '—';
      return null;
    }
    if (countersState.kind !== 'success') {
      return countersState.kind === 'error' ? '—' : null;
    }
    const counts = countersState.counts;
    if (key === 'signatures') return formatNumber(counts.signatures);
    if (key === 'mobilizations') return formatNumber(counts.publishedMobilizations);
    if (key === 'communes') return formatNumber(counts.publishedCommunes);
    return null;
  };

  return (
    <main>
      <section style={heroSectionStyle} aria-labelledby="home-hero-title">
        <div style={heroInnerStyle}>
          <p style={heroEyebrowStyle}>La voix des 99 %</p>
          <h1 id="home-hero-title" style={heroH1Style}>
            Maintenant ! Le pouvoir citoyen, à portée de clic.
          </h1>
          <p style={heroSubStyle}>
            Pétitions, mobilisations, services d&rsquo;entraide, communes libres : la
            plateforme qui outille les citoyennes et citoyens pour peser ensemble.
          </p>
          <div style={ctaRowStyle}>
            <Link to="/join" style={primaryCtaStyle} aria-label="Adhérer au mouvement Maintenant !">
              <IconSpark width={18} height={18} aria-hidden />
              Adhérer
            </Link>
            <a href="#mission" style={secondaryCtaStyle} aria-label="Découvrir la mission">
              <IconShare width={18} height={18} aria-hidden />
              Découvrir
            </a>
          </div>
        </div>
      </section>

      <section style={countersSectionStyle} aria-labelledby="home-counters-title">
        <h2 id="home-counters-title" className="sr-only" style={{ position: 'absolute', left: -9999 }}>
          Compteurs publics en temps réel
        </h2>
        <ul style={countersGridStyle} aria-label="Compteurs publics en temps réel">
          {COUNTER_DEFS.map((def) => {
            const Icon = def.icon;
            const value = valueFor(def.key);
            return (
              <li key={def.key} style={counterCardStyle} data-testid={def.testId}>
                <span style={counterIconWrapStyle} aria-hidden>
                  <Icon width={18} height={18} />
                </span>
                <p style={counterValueStyle}>
                  {value === null ? (
                    <span style={counterPlaceholderStyle} aria-label="Chargement…">
                      …
                    </span>
                  ) : (
                    value
                  )}
                </p>
                <p style={counterLabelStyle}>{def.label}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section style={actionsSectionStyle} aria-labelledby="home-actions-title">
        <h2 id="home-actions-title" style={sectionTitleStyle}>
          Ce que tu peux faire dès maintenant
        </h2>
        <p style={sectionSubtitleStyle}>
          Trois manières d&rsquo;agir, ouvertes à toutes et tous, sans condition de
          revenu ni d&rsquo;adhésion.
        </p>
        <div style={actionsGridStyle}>
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                style={actionCardStyle}
                aria-label={action.title}
              >
                <span style={actionIconWrapStyle} aria-hidden>
                  <Icon width={22} height={22} />
                </span>
                <h3 style={actionTitleStyle}>{action.title}</h3>
                <p style={actionDescStyle}>{action.description}</p>
                <span style={actionCtaStyle}>{action.cta} →</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="mission" style={missionSectionStyle} aria-labelledby="home-mission-title">
        <div style={missionInnerStyle}>
          <h2 id="home-mission-title" style={sectionTitleStyle}>
            Notre mission
          </h2>
          <p style={missionBodyStyle}>
            Maintenant ! est un mouvement citoyen qui rassemble les outils nécessaires
            pour reprendre la main sur les décisions qui nous concernent. Sans
            publicité, sans pistage, sans intermédiaire — nos compteurs sont publics
            et la plateforme est ouverte à toutes et tous.
          </p>
          <p style={{ ...missionBodyStyle, marginBottom: 0 }}>
            <Link to="/transparence" style={{ color: 'var(--mn-brand)', fontWeight: 600 }}>
              Voir nos compteurs publics →
            </Link>
          </p>
        </div>
      </section>

    </main>
  );
}
