import type { CSSProperties, ReactElement } from 'react';
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

const pageStyle: CSSProperties = {
  maxWidth: 880,
  margin: '0 auto',
  padding: 'clamp(2.5rem, 5vw, 4rem) 1.5rem 4rem',
  color: 'var(--mn-text-1)',
  lineHeight: 1.65,
};

const eyebrowStyle: CSSProperties = {
  display: 'inline-block',
  padding: '0.4rem 0.85rem',
  borderRadius: 999,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.02em',
  margin: '0 0 1rem',
};

const h1Style: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(2rem, 5vw, 3rem)',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  margin: '0 0 1rem',
  color: 'var(--mn-text-1)',
};

const leadStyle: CSSProperties = {
  fontSize: 'clamp(1rem, 2vw, 1.15rem)',
  lineHeight: 1.6,
  color: 'var(--mn-text-2)',
  margin: '0 0 2.5rem',
};

const sectionStyle: CSSProperties = {
  marginTop: '3rem',
};

const h2Style: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  margin: '0 0 0.75rem',
  color: 'var(--mn-text-1)',
};

const paragraphStyle: CSSProperties = {
  fontSize: 16,
  lineHeight: 1.7,
  color: 'var(--mn-text-2)',
  margin: '0 0 1rem',
};

const stepsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1.25rem',
  margin: '1.5rem 0 0',
};

const stepCardStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 14,
  padding: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const stepBadgeStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--mn-brand-dark)',
};

const stepTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: '1.05rem',
  fontWeight: 700,
  margin: 0,
  color: 'var(--mn-text-1)',
};

const stepDescStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: 0,
};

const toolsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1rem',
  margin: '1.5rem 0 0',
};

const toolItemStyle: CSSProperties = {
  display: 'flex',
  gap: '0.85rem',
  alignItems: 'flex-start',
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  borderRadius: 12,
  padding: '1rem 1.1rem',
};

const toolIconWrapStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: 10,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
  flex: 'none',
};

const toolTextStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
};

const toolTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 15,
  fontWeight: 700,
  margin: 0,
  color: 'var(--mn-text-1)',
};

const toolDescStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.5,
  color: 'var(--mn-text-2)',
  margin: 0,
};

const testimonialBadgeStyle: CSSProperties = {
  display: 'inline-block',
  padding: '0.15rem 0.55rem',
  borderRadius: 6,
  background: 'var(--mn-surface-2)',
  border: '1px dashed var(--mn-border-dark)',
  color: 'var(--mn-text-3)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: '0.6rem',
};

const testimonialGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1.25rem',
  margin: '1.5rem 0 0',
};

const testimonialCardStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 14,
  padding: '1.25rem',
};

const testimonialQuoteStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.6,
  color: 'var(--mn-text-1)',
  margin: '0 0 0.85rem',
  fontStyle: 'italic',
};

const testimonialAuthorStyle: CSSProperties = {
  fontSize: 13,
  color: 'var(--mn-text-3)',
  margin: 0,
};

const roadmapListStyle: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '1.5rem 0 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.9rem',
};

const roadmapItemStyle: CSSProperties = {
  display: 'flex',
  gap: '0.85rem',
  alignItems: 'flex-start',
};

const roadmapDateStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--mn-brand-dark)',
  background: 'var(--mn-brand-light)',
  borderRadius: 6,
  padding: '0.25rem 0.55rem',
  flex: 'none',
  minWidth: 86,
  textAlign: 'center',
};

const roadmapBodyStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: 0,
};

const ctaSectionStyle: CSSProperties = {
  marginTop: '3.5rem',
  padding: '2rem 1.5rem',
  borderRadius: 16,
  background:
    'radial-gradient(ellipse at top, rgba(225, 29, 116, 0.08), transparent 60%), var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  textAlign: 'center',
};

const ctaTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
  fontWeight: 700,
  margin: '0 0 0.5rem',
  color: 'var(--mn-text-1)',
};

const ctaSubtitleStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: '0 0 1.25rem',
};

const ctaButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '0.85rem 1.6rem',
  borderRadius: 12,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 16,
  textDecoration: 'none',
};

interface StepDef {
  badge: string;
  title: string;
  description: string;
}

const STEPS: StepDef[] = [
  {
    badge: 'Étape 1',
    title: 'Tu rejoins',
    description:
      'Création de compte en moins d’une minute. Adhésion libre dès 1 € symbolique ou sans contribution si tu n’en as pas les moyens.',
  },
  {
    badge: 'Étape 2',
    title: 'Tu utilises les outils',
    description:
      'Pétitions, mobilisations, services d’entraide, communes libres. Les outils sont gratuits et ouverts à toutes et tous.',
  },
  {
    badge: 'Étape 3',
    title: 'Tu fais bouger les lignes',
    description:
      'Chaque action compte : signer, organiser, échanger. Les compteurs publics montrent la dynamique en temps réel.',
  },
];

interface ToolDef {
  to: string;
  title: string;
  description: string;
  icon: ReactElement;
}

const TOOLS: ToolDef[] = [
  {
    to: '/petitions',
    title: 'Pétitions',
    description: 'Pèse sur les décisions publiques avec des demandes citoyennes.',
    icon: <IconPen width={18} height={18} />,
  },
  {
    to: '/mobilizations',
    title: 'Mobilisations',
    description: 'Manifestations, AG, actions locales — trouve ou crée un événement.',
    icon: <IconFlame width={18} height={18} />,
  },
  {
    to: '/polls',
    title: 'Sondages citoyens',
    description: 'Mesure l’opinion sur les sujets qui comptent.',
    icon: <IconBarChart width={18} height={18} />,
  },
  {
    to: '/campaigns',
    title: 'Campagnes',
    description: 'Coordonne des actions à plus grande échelle.',
    icon: <IconMegaphone width={18} height={18} />,
  },
  {
    to: '/services',
    title: 'Services d’entraide',
    description: 'Hébergement, covoiturage, prêt, jardin partagé, SEL, cagnottes.',
    icon: <IconHome width={18} height={18} />,
  },
  {
    to: '/communes',
    title: 'Communes libres',
    description: 'Carte des collectifs locaux qui composent le mouvement.',
    icon: <IconUsers width={18} height={18} />,
  },
];

interface TestimonialDef {
  quote: string;
  author: string;
}

const TESTIMONIALS: TestimonialDef[] = [
  {
    quote:
      'Avec Maintenant !, j’ai lancé une pétition pour ma rue piétonne. En trois semaines, on a obtenu un rendez-vous en mairie.',
    author: 'Témoignage fictif — démo (remplacé à T+3 mois)',
  },
  {
    quote:
      'Le covoiturage solidaire m’a permis de monter chaque semaine à l’AG du collectif sans casser mon budget.',
    author: 'Témoignage fictif — démo (remplacé à T+3 mois)',
  },
  {
    quote:
      'On a publié notre commune libre la semaine dernière. Recevoir les premiers messages de voisin·es a tout changé.',
    author: 'Témoignage fictif — démo (remplacé à T+3 mois)',
  },
];

interface RoadmapItem {
  period: string;
  label: string;
}

const ROADMAP: RoadmapItem[] = [
  {
    period: '2026 S1',
    label:
      'Lancement public, ouverture du média militant, premières communes libres en France métropolitaine.',
  },
  {
    period: '2026 S2',
    label:
      'Extension communes libres outre-mer et frontaliers, paiements solidaires Stripe en pleine charge.',
  },
  {
    period: '2027',
    label:
      'API publique transparence + open data des compteurs, fédération de communes libres européennes.',
  },
  {
    period: '2028',
    label:
      'Pacte citoyen national co-construit via les pétitions/mobilisations à fort impact.',
  },
];

export default function DecouvrirPage() {
  return (
    <main style={pageStyle}>
      <p style={eyebrowStyle}>La voix des 99 %</p>
      <h1 style={h1Style}>Découvre le mouvement Maintenant&nbsp;!</h1>
      <p style={leadStyle}>
        Maintenant&nbsp;! est une plateforme citoyenne sans publicité ni pistage,
        qui rassemble les outils nécessaires pour reprendre la main sur les
        décisions qui nous concernent. Voici comment ça marche, ce que tu peux
        faire, et où on va.
      </p>

      <section style={sectionStyle} aria-labelledby="decouvrir-mission-title">
        <h2 id="decouvrir-mission-title" style={h2Style}>
          Notre mission
        </h2>
        <p style={paragraphStyle}>
          Nous sommes parti·es d’un constat simple&nbsp;: les outils
          numériques actuels concentrent l’attention et la donnée entre les
          mains de quelques plateformes publicitaires. Maintenant&nbsp;! propose
          des outils citoyens, gratuits, sans tracking, et gouvernés par
          l’association des adhérent·es. L’objectif&nbsp;: rééquilibrer
          le rapport de force entre les 99&nbsp;% et les décisions qui les
          concernent.
        </p>
        <p style={paragraphStyle}>
          Tous nos compteurs sont publics (cf.{' '}
          <Link to="/transparence" style={{ color: 'var(--mn-brand)', fontWeight: 600 }}>
            page Transparence
          </Link>
          ) et notre gouvernance est documentée dans les{' '}
          <Link
            to="/legal/notice"
            style={{ color: 'var(--mn-brand)', fontWeight: 600 }}
          >
            mentions légales
          </Link>
          .
        </p>
      </section>

      <section style={sectionStyle} aria-labelledby="decouvrir-how-title">
        <h2 id="decouvrir-how-title" style={h2Style}>
          Comment ça marche
        </h2>
        <p style={paragraphStyle}>
          Trois étapes pour rejoindre le mouvement et faire bouger les lignes.
        </p>
        <ol style={{ ...stepsGridStyle, listStyle: 'none', padding: 0 }}>
          {STEPS.map((step) => (
            <li key={step.badge} style={stepCardStyle}>
              <span style={stepBadgeStyle}>{step.badge}</span>
              <h3 style={stepTitleStyle}>{step.title}</h3>
              <p style={stepDescStyle}>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section style={sectionStyle} aria-labelledby="decouvrir-tools-title">
        <h2 id="decouvrir-tools-title" style={h2Style}>
          Les outils
        </h2>
        <p style={paragraphStyle}>
          Six familles d’outils, gratuites et ouvertes à toutes et tous.
        </p>
        <ul style={{ ...toolsGridStyle, listStyle: 'none', padding: 0 }}>
          {TOOLS.map((tool) => (
            <li key={tool.to} style={toolItemStyle}>
              <span style={toolIconWrapStyle} aria-hidden>
                {tool.icon}
              </span>
              <span style={toolTextStyle}>
                <Link
                  to={tool.to}
                  style={{
                    ...toolTitleStyle,
                    textDecoration: 'none',
                    color: 'var(--mn-brand)',
                  }}
                >
                  {tool.title} →
                </Link>
                <span style={toolDescStyle}>{tool.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section style={sectionStyle} aria-labelledby="decouvrir-vision-title">
        <h2 id="decouvrir-vision-title" style={h2Style}>
          Notre vision
        </h2>
        <p style={paragraphStyle}>
          Nous croyons qu’une démocratie vivante a besoin d’infrastructure
          partagée, indépendante des intérêts privés. Maintenant&nbsp;! veut
          devenir cette infrastructure pour les mouvements citoyens
          francophones, puis européens. Pas une plateforme de plus, mais un{' '}
          <em>bien commun numérique</em> — au sens où l’entendent les
          juristes spécialistes des communs.
        </p>
        <p style={paragraphStyle}>
          La gouvernance est associative (loi 1901), les choix techniques sont
          ouverts (open source progressif, cf. roadmap), et toute donnée
          publique est documentée et accessible.
        </p>

        <div style={testimonialGridStyle}>
          {TESTIMONIALS.map((t) => (
            <article key={t.quote} style={testimonialCardStyle}>
              <span style={testimonialBadgeStyle} data-testid="decouvrir-demo-badge">
                Témoignage démo
              </span>
              <p style={testimonialQuoteStyle}>« {t.quote} »</p>
              <p style={testimonialAuthorStyle}>{t.author}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={sectionStyle} aria-labelledby="decouvrir-roadmap-title">
        <h2 id="decouvrir-roadmap-title" style={h2Style}>
          Roadmap publique
        </h2>
        <p style={paragraphStyle}>
          Les grands jalons connus à date — la roadmap détaillée est
          documentée dans les outils internes de l’association.
        </p>
        <ul style={roadmapListStyle}>
          {ROADMAP.map((item) => (
            <li key={item.period} style={roadmapItemStyle}>
              <span style={roadmapDateStyle}>{item.period}</span>
              <p style={roadmapBodyStyle}>{item.label}</p>
            </li>
          ))}
        </ul>
      </section>

      <section style={ctaSectionStyle} aria-labelledby="decouvrir-cta-title">
        <h2 id="decouvrir-cta-title" style={ctaTitleStyle}>
          Prêt·e à rejoindre&nbsp;?
        </h2>
        <p style={ctaSubtitleStyle}>
          L’adhésion est libre. Choisis ce qui correspond à tes moyens du
          moment.
        </p>
        <Link to="/join" style={ctaButtonStyle} aria-label="Rejoindre le mouvement Maintenant !">
          <IconSpark width={18} height={18} aria-hidden />
          Rejoindre le mouvement
        </Link>
        <p style={{ ...ctaSubtitleStyle, marginTop: '1rem', marginBottom: 0, fontSize: 13 }}>
          Tu préfères explorer d’abord ?{' '}
          <Link to="/transparence" style={{ color: 'var(--mn-brand)', fontWeight: 600 }}>
            <IconShare width={14} height={14} aria-hidden /> Voir les compteurs
            publics
          </Link>
        </p>
      </section>
    </main>
  );
}
