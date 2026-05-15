import { type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import {
  IconCar,
  IconClock,
  IconCoin,
  IconHome,
  IconLeaf,
  IconStore,
  IconTool,
} from '@/components/icons';

interface ServiceCard {
  slug: string;
  title: string;
  pitch: string;
  icon: ReactNode;
}

const services: ServiceCard[] = [
  {
    slug: 'housing',
    title: 'Hébergement solidaire',
    pitch: 'Offrez ou trouvez un toit le temps d’une lutte, d’une formation, d’un déplacement militant.',
    icon: <IconHome width={28} height={28} />,
  },
  {
    slug: 'carpooling',
    title: 'Covoiturage citoyen',
    pitch: 'Partagez vos trajets pour rejoindre une manif, une AG ou une mobilisation locale.',
    icon: <IconCar width={28} height={28} />,
  },
  {
    slug: 'marketplace',
    title: 'Marketplace locale',
    pitch: 'Achetez, vendez ou donnez près de chez vous, sans commission et sans intermédiaire.',
    icon: <IconStore width={28} height={28} />,
  },
  {
    slug: 'lending',
    title: 'Prêt entre voisin·es',
    pitch: 'Empruntez un outil, un objet, un équipement — payez en T99CP ou gratuitement.',
    icon: <IconTool width={28} height={28} />,
  },
  {
    slug: 'garden',
    title: 'Jardins partagés',
    pitch: 'Proposez ou rejoignez un jardin collectif, partagez parcelles, semences et savoir-faire.',
    icon: <IconLeaf width={28} height={28} />,
  },
  {
    slug: 'sel',
    title: 'SEL — Services d’échange local',
    pitch: 'Échangez vos heures et compétences en T99CP : cours, bricolage, garde, traduction.',
    icon: <IconClock width={28} height={28} />,
  },
  {
    slug: 'crowdfunding',
    title: 'Crowdfunding solidaire',
    pitch: 'Soutenez ou lancez une cagnotte pour un projet local, une lutte, une initiative citoyenne.',
    icon: <IconCoin width={28} height={28} />,
  },
];

const pageStyle: CSSProperties = {
  maxWidth: 1080,
  margin: '0 auto',
  padding: '32px 20px 80px',
};

const heroStyle: CSSProperties = {
  background: 'var(--mn-gradient)',
  borderRadius: 24,
  padding: '36px 28px',
  color: '#ffffff',
  marginBottom: 32,
  boxShadow: '0 12px 36px rgba(225, 29, 116, 0.18)',
};

const heroTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(26px, 4vw, 38px)',
  fontWeight: 800,
  margin: 0,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
};

const heroLeadStyle: CSSProperties = {
  marginTop: 14,
  fontSize: 'clamp(14px, 1.6vw, 17px)',
  lineHeight: 1.55,
  maxWidth: 720,
  color: 'rgba(255, 255, 255, 0.94)',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gap: 18,
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const cardStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 16,
  padding: 22,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  textDecoration: 'none',
  color: 'inherit',
  height: '100%',
};

const iconWrapStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 12,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const cardTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 18,
  fontWeight: 700,
  margin: 0,
  lineHeight: 1.3,
  color: 'var(--mn-text-1)',
};

const cardPitchStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
};

const cardCtaStyle: CSSProperties = {
  marginTop: 'auto',
  paddingTop: 6,
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--mn-brand)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

const trustSectionStyle: CSSProperties = {
  marginTop: 32,
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  borderRadius: 16,
  padding: '20px 22px',
};

const trustTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 15,
  fontWeight: 700,
  margin: '0 0 8px',
  color: 'var(--mn-text-1)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const trustTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.6,
  color: 'var(--mn-text-2)',
};

export default function ServicesHubPage() {
  return (
    <main style={pageStyle}>
      <section style={heroStyle} aria-labelledby="services-hub-title">
        <h1 id="services-hub-title" style={heroTitleStyle}>
          Services solidaires
        </h1>
        <p style={heroLeadStyle}>
          Hébergement, covoiturage, marketplace, prêt, jardins, SEL, crowdfunding. Sans
          commission, sans pub, entre voisin·es engagé·es.
        </p>
      </section>

      <ul aria-label="Liste des services solidaires" style={gridStyle}>
        {services.map((service) => {
          const titleId = `service-card-title-${service.slug}`;
          return (
            <li key={service.slug}>
              <Link
                to={`/services/${service.slug}`}
                style={cardStyle}
                className="mn-listing-card"
                data-testid={`service-card-${service.slug}`}
                aria-labelledby={titleId}
              >
                <span style={iconWrapStyle} aria-hidden="true">
                  {service.icon}
                </span>
                <h2 id={titleId} style={cardTitleStyle}>
                  {service.title}
                </h2>
                <p style={cardPitchStyle}>{service.pitch}</p>
                <span style={cardCtaStyle}>Accéder →</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <section style={trustSectionStyle} aria-labelledby="services-trust-title">
        <h2 id="services-trust-title" style={trustTitleStyle}>
          Confiance & RGPD
        </h2>
        <p style={trustTextStyle}>
          Tous les échanges sont privés. Le T99CP est utilisable comme monnaie locale
          (jamais obligatoire). Aucune commission, aucune publicité — Maintenant ! est
          financé par les adhésions.
        </p>
      </section>
    </main>
  );
}
