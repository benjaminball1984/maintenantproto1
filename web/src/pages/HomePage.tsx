import { useEffect, useState, type CSSProperties, type ReactElement } from 'react';
import { Link } from 'react-router-dom';

import {
  IconBarChart,
  IconBadge,
  IconHome,
  IconMail,
  IconMegaphone,
  IconPen,
  IconSpark,
  IconUsers,
} from '@/components/icons';
import {
  fetchNewsletterCount,
  fetchTransparencyCounts,
  type NewsletterCountResult,
  type TransparencyCounts,
} from '@/lib/transparency';

type CountersState =
  | { kind: 'loading' }
  | { kind: 'success'; counts: TransparencyCounts }
  | { kind: 'error' };

type NewsletterState =
  | { kind: 'loading' }
  | { kind: 'success'; total: number }
  | { kind: 'error' };

function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

const heroSectionStyle: CSSProperties = {
  position: 'relative',
  padding: 'clamp(3rem, 6vw, 5rem) 1.5rem 1.5rem',
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
  maxWidth: 720,
  whiteSpace: 'normal',
  lineHeight: 1.4,
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

// Compteurs : nouvel encart compact sous le hero, fond dégradé (cf. D-007).
const countersSectionStyle: CSSProperties = {
  padding: '0 1.5rem 3rem',
  background: 'var(--mn-bg)',
};

const countersBandStyle: CSSProperties = {
  maxWidth: 880,
  margin: '0 auto',
  background: 'var(--mn-gradient)',
  borderRadius: 16,
  padding: '1rem 1.25rem',
};

const countersGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '0.75rem',
  margin: 0,
  padding: 0,
  listStyle: 'none',
};

const counterCardStyle: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.22)',
  borderRadius: 12,
  padding: '0.75rem 0.9rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.7rem',
};

const counterIconWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 8,
  background: 'rgba(255, 255, 255, 0.18)',
  color: '#ffffff',
  flex: 'none',
};

const counterTextWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
};

const counterValueStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: '1.15rem',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  lineHeight: 1.1,
  color: '#ffffff',
  margin: 0,
};

const counterLabelStyle: CSSProperties = {
  color: 'rgba(255, 255, 255, 0.92)',
  fontSize: 12,
  margin: 0,
  marginTop: 2,
};

const counterPlaceholderStyle: CSSProperties = {
  display: 'inline-block',
  minWidth: '3.5ch',
  color: 'rgba(255, 255, 255, 0.65)',
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
  margin: '0 0 1.5rem',
  color: 'var(--mn-text-1)',
};

const actionsGridStyle: CSSProperties = {
  maxWidth: 1080,
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
  gap: '0.65rem',
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
  fontSize: 14,
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

interface CounterDef {
  key: 'signatures' | 'newsletter' | 'members';
  label: string;
  testId: string;
  icon: (props: { width?: number; height?: number }) => ReactElement;
}

// D-007 : 3 compteurs (Signataires / Abonnées newsletter / Membres). Le bloc
// T99CP émis reste sur /transparence. Les compteurs Mobilisations / Communes
// sont retirés (D-009) — l'objectif est de mettre en avant les volumes
// d'audience, pas la production de contenu.
const COUNTER_DEFS: CounterDef[] = [
  {
    key: 'signatures',
    label: 'Signataires',
    testId: 'home-counter-signatures',
    icon: IconPen,
  },
  {
    key: 'newsletter',
    label: 'Abonné·es à la newsletter',
    testId: 'home-counter-newsletter',
    icon: IconMail,
  },
  {
    key: 'members',
    label: 'Membres',
    testId: 'home-counter-members',
    icon: IconUsers,
  },
];

interface ActionDef {
  to: string;
  testId: string;
  title: string;
  description: string;
  cta: string;
  icon: (props: { width?: number; height?: number }) => ReactElement;
}

// D-012 : refonte 3 cartes par feature → 4 cartes thématiques (S'informer /
// Mobiliser / S'entraider / Agir). Chaque carte mène vers une route existante
// représentative du thème, en attendant les pages d'index thématiques (cf.
// TODO_PROD futur dans HANDOFF-PROGRESS).
const ACTIONS: ActionDef[] = [
  {
    to: '/media',
    testId: 'home-action-informer',
    title: 'S’informer',
    description:
      'Média militant, sondages publics, réseau social interne : comprendre, débattre, partager.',
    cta: 'Explorer S’informer',
    icon: IconBarChart,
  },
  {
    to: '/petitions',
    testId: 'home-action-mobiliser',
    title: 'Mobiliser',
    description:
      'Campagnes, pétitions, mobilisations locales : porter une demande citoyenne et agir ensemble.',
    cta: 'Explorer Mobiliser',
    icon: IconMegaphone,
  },
  {
    to: '/services',
    testId: 'home-action-entraider',
    title: 'S’entraider',
    description:
      'Marketplace solidaire, prêt, SEL, jardins, hébergement, covoiturage : des services concrets entre voisin·es.',
    cta: 'Explorer S’entraider',
    icon: IconHome,
  },
  {
    to: '/join',
    testId: 'home-action-agir',
    title: 'Agir',
    description:
      'Adhérer, créer une commune libre, organiser des moments solidaires : prendre une part durable au mouvement.',
    cta: 'Explorer Agir',
    icon: IconBadge,
  },
];

export default function HomePage() {
  const [countersState, setCountersState] = useState<CountersState>({ kind: 'loading' });
  const [newsletterState, setNewsletterState] = useState<NewsletterState>({ kind: 'loading' });

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
    fetchNewsletterCount()
      .then((result: NewsletterCountResult) => {
        if (cancelled) return;
        if (result.error || result.data === null) {
          setNewsletterState({ kind: 'error' });
        } else {
          setNewsletterState({ kind: 'success', total: result.data });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setNewsletterState({ kind: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const valueFor = (key: CounterDef['key']): string | null => {
    if (key === 'newsletter') {
      if (newsletterState.kind === 'success') return formatNumber(newsletterState.total);
      if (newsletterState.kind === 'error') return '—';
      return null;
    }
    if (countersState.kind !== 'success') {
      return countersState.kind === 'error' ? '—' : null;
    }
    const counts = countersState.counts;
    if (key === 'signatures') return formatNumber(counts.signatures);
    if (key === 'members') return formatNumber(counts.members);
    return null;
  };

  return (
    <main>
      <section style={heroSectionStyle} aria-labelledby="home-hero-title">
        <div style={heroInnerStyle}>
          <p style={heroEyebrowStyle}>
            S’informer, s’outiller, s’organiser, mobiliser, agir, s’entre aider,
            résister, ensemble.
          </p>
          <h1 id="home-hero-title" style={heroH1Style}>
            Maintenant ! La voix des 99%
          </h1>
          <p style={heroSubStyle}>
            Pour une vie digne et heureuse pour toutes et tous dans un monde
            vivable. Face aux oppressions systémiques nos luttes doivent devenir
            systémiques.
          </p>
          <div style={ctaRowStyle}>
            <Link to="/join" style={primaryCtaStyle} aria-label="Adhérer au mouvement Maintenant !">
              <IconSpark width={18} height={18} aria-hidden />
              Adhérer
            </Link>
          </div>
        </div>
      </section>

      <section style={countersSectionStyle} aria-labelledby="home-counters-title">
        <h2
          id="home-counters-title"
          className="sr-only"
          style={{ position: 'absolute', left: -9999 }}
        >
          Compteurs publics : signataires, abonné·es à la newsletter, membres
        </h2>
        <div style={countersBandStyle}>
          <ul
            style={countersGridStyle}
            aria-label="Compteurs publics en temps réel"
          >
            {COUNTER_DEFS.map((def) => {
              const Icon = def.icon;
              const value = valueFor(def.key);
              return (
                <li key={def.key} style={counterCardStyle} data-testid={def.testId}>
                  <span style={counterIconWrapStyle} aria-hidden>
                    <Icon width={16} height={16} />
                  </span>
                  <div style={counterTextWrapStyle}>
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
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section style={actionsSectionStyle} aria-labelledby="home-actions-title">
        <h2 id="home-actions-title" style={sectionTitleStyle}>
          Ce que tu peux faire dès maintenant
        </h2>
        <div style={actionsGridStyle}>
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                style={actionCardStyle}
                aria-label={action.title}
                data-testid={action.testId}
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

      {/* D-014 : bloc Mission supprimé. La transparence reste accessible via le
          footer (lien Transparence) et la navigation principale. */}
      <section style={{ ...actionsSectionStyle, background: 'var(--mn-bg)' }} aria-labelledby="home-trust-title">
        <h2 id="home-trust-title" style={sectionTitleStyle}>
          Une plateforme citoyenne, sans publicité ni pistage
        </h2>
        <p style={{ ...heroSubStyle, maxWidth: 720 }}>
          Hébergement en Europe, données minimales, compteurs publics et code
          source ouvert au fil des étapes. Le détail est sur la page{' '}
          <Link to="/transparence" style={{ color: 'var(--mn-brand)', fontWeight: 600 }}>
            Transparence
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
