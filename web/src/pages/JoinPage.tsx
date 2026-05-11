import { useMemo, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';

import { IconCart, IconCheckCircle, IconLock, IconSpark } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  createCheckoutSession,
  createFreeAdhesion,
  isTierLockedFor,
  TIER_ORDER,
  type AdhesionTier,
} from '@/lib/membership';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useAdhesion } from '@/hooks/useAdhesion';

interface TierCopy {
  tier: AdhesionTier;
  title: string;
  price: string;
  pricePeriod: string | null;
  blurb: string;
  perks: readonly string[];
  cta: string;
  highlight: boolean;
}

const TIERS: readonly TierCopy[] = [
  {
    tier: 'gratuit',
    title: 'Adhésion libre',
    price: 'Gratuit',
    pricePeriod: null,
    blurb: 'Rejoignez le mouvement sans contribuer financièrement.',
    perks: [
      'Accès à l’espace adhérent·e',
      'Vote aux sondages des Communes Libres',
      'Profil public Membre du mouvement',
    ],
    cta: 'Devenir adhérent·e',
    highlight: false,
  },
  {
    tier: 'soutien',
    title: 'Adhésion soutien',
    price: '5 €',
    pricePeriod: '/ mois',
    blurb: 'Financez la plateforme et recevez vos 60 T99CP mensuels.',
    perks: [
      'Tout le tier libre',
      '60 T99CP crédités chaque mois',
      'Accès aux Cagnottes et Marketplace solidaire',
    ],
    cta: 'Devenir soutien',
    highlight: true,
  },
  {
    tier: 'engage',
    title: 'Adhésion engagée',
    price: '15 €',
    pricePeriod: '/ mois',
    blurb: 'Pour les militant·es qui veulent porter le mouvement.',
    perks: [
      'Tout le tier soutien',
      '60 T99CP / mois + bonus de bienvenue',
      'Candidature à l’Assemblée Confédérale',
    ],
    cta: 'Devenir engagé·e',
    highlight: false,
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
  padding: '40px 28px',
  color: '#ffffff',
  marginBottom: 28,
  boxShadow: '0 12px 36px rgba(225, 29, 116, 0.18)',
};

const heroTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(26px, 4vw, 40px)',
  fontWeight: 800,
  margin: 0,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
};

const heroLeadStyle: CSSProperties = {
  marginTop: 14,
  fontSize: 'clamp(14px, 1.6vw, 17px)',
  lineHeight: 1.6,
  maxWidth: 640,
  color: 'rgba(255, 255, 255, 0.92)',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gap: 20,
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
};

function cardStyle(isHighlighted: boolean, isCurrent: boolean): CSSProperties {
  return {
    background: 'var(--mn-surface)',
    border: `2px solid ${isCurrent ? 'var(--mn-success)' : isHighlighted ? 'var(--mn-brand)' : 'var(--mn-border)'}`,
    borderRadius: 20,
    padding: 26,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    position: 'relative',
    boxShadow: isHighlighted ? '0 16px 36px rgba(225, 29, 116, 0.12)' : 'none',
  };
}

const ribbonStyle: CSSProperties = {
  position: 'absolute',
  top: -12,
  right: 20,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '4px 12px',
  borderRadius: 999,
};

const titleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 22,
  fontWeight: 700,
  color: 'var(--mn-text-1)',
  margin: 0,
};

const priceRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
};

const priceStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 32,
  fontWeight: 800,
  color: 'var(--mn-brand)',
  letterSpacing: '-0.02em',
};

const periodStyle: CSSProperties = {
  fontSize: 13,
  color: 'var(--mn-text-3)',
};

const blurbStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: 0,
};

const perksListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  color: 'var(--mn-text-2)',
  fontSize: 14,
};

const perkRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
};

const ctaButtonStyle: CSSProperties = {
  marginTop: 'auto',
  minHeight: 46,
  border: 'none',
  borderRadius: 12,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 700,
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '0 18px',
};

const ctaDisabledStyle: CSSProperties = {
  ...ctaButtonStyle,
  background: 'var(--mn-surface-2)',
  color: 'var(--mn-text-3)',
  cursor: 'not-allowed',
  border: '1px solid var(--mn-border)',
};

const currentTagStyle: CSSProperties = {
  position: 'absolute',
  top: -12,
  right: 20,
  background: 'var(--mn-success)',
  color: '#ffffff',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '4px 12px',
  borderRadius: 999,
};

const messageBaseStyle: CSSProperties = {
  borderRadius: 12,
  padding: '12px 16px',
  fontSize: 14,
  lineHeight: 1.5,
  marginBottom: 20,
  border: '1px solid transparent',
};

const errorMessageStyle: CSSProperties = {
  ...messageBaseStyle,
  background: '#fef2f2',
  color: 'var(--mn-danger)',
  borderColor: '#fecaca',
};

const successMessageStyle: CSSProperties = {
  ...messageBaseStyle,
  background: '#f0fdf4',
  color: 'var(--mn-success)',
  borderColor: '#bbf7d0',
};

const infoMessageStyle: CSSProperties = {
  ...messageBaseStyle,
  background: 'var(--mn-surface-2)',
  color: 'var(--mn-text-2)',
  borderColor: 'var(--mn-border)',
};

export default function JoinPage() {
  const { user, status: authStatus } = useAuth();
  const { adhesion, status: adhesionStatus, refresh } = useAdhesion(user?.id ?? null);
  const [searchParams] = useSearchParams();
  const [busyTier, setBusyTier] = useState<AdhesionTier | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const canceled = searchParams.get('canceled') === '1';

  const currentTier = useMemo<AdhesionTier | null>(
    () => (adhesion?.status === 'active' ? adhesion.tier : null),
    [adhesion],
  );

  const handleSelect = async (tier: AdhesionTier) => {
    if (busyTier) return;
    if (authStatus !== 'authenticated' || !user) {
      setErrorText('Connectez-vous d’abord pour adhérer au mouvement.');
      return;
    }
    setBusyTier(tier);
    setErrorText(null);
    setSuccessText(null);

    if (tier === 'gratuit') {
      const { error } = await createFreeAdhesion(user.id);
      if (error) {
        setErrorText(postgrestErrorMessage(error));
      } else {
        setSuccessText('Bienvenue dans le mouvement. Votre adhésion libre est active.');
        await refresh();
      }
      setBusyTier(null);
      return;
    }

    const { url, error } = await createCheckoutSession(tier);
    if (error || !url) {
      setErrorText(
        postgrestErrorMessage(error) ??
          'Impossible de lancer le paiement Stripe. Réessayez dans un instant.',
      );
      setBusyTier(null);
      return;
    }
    window.location.assign(url);
  };

  return (
    <main style={pageStyle}>
      <section style={heroStyle} aria-labelledby="join-title">
        <h1 id="join-title" style={heroTitleStyle}>
          Adhérez au mouvement Maintenant&nbsp;!
        </h1>
        <p style={heroLeadStyle}>
          L’adhésion donne accès à l’espace adhérent·es, aux Communes Libres et à l’Assemblée
          Confédérale. Choisissez la formule qui vous convient — les paiements sont sécurisés par
          Stripe, hébergés en zone&nbsp;UE.
        </p>
      </section>

      {canceled && (
        <div role="status" style={infoMessageStyle}>
          Paiement annulé. Aucun prélèvement n’a été effectué.
        </div>
      )}
      {errorText && (
        <div role="alert" style={errorMessageStyle}>
          {errorText}
        </div>
      )}
      {successText && (
        <div role="status" style={successMessageStyle}>
          {successText}
        </div>
      )}
      {authStatus === 'anonymous' && (
        <div role="note" style={infoMessageStyle}>
          Connectez-vous pour activer une adhésion. La création de compte est libre et
          gratuite&nbsp;; elle ne vous engage à rien.
        </div>
      )}

      <ul
        aria-label="Formules d’adhésion"
        style={{ ...gridStyle, listStyle: 'none', margin: 0, padding: 0 }}
      >
        {TIERS.map((card) => {
          const locked = isTierLockedFor(currentTier, card.tier);
          const isCurrent = currentTier === card.tier;
          const isLoading = busyTier === card.tier;
          const disabled =
            locked || isLoading || adhesionStatus === 'loading' || authStatus === 'loading';
          const labelId = `tier-${card.tier}-title`;
          return (
            <li key={card.tier}>
              <article aria-labelledby={labelId} style={cardStyle(card.highlight, isCurrent)}>
                {isCurrent ? (
                  <span style={currentTagStyle}>Tier actuel</span>
                ) : card.highlight ? (
                  <span style={ribbonStyle}>Recommandé</span>
                ) : null}
                <h2 id={labelId} style={titleStyle}>
                  {card.title}
                </h2>
                <div style={priceRowStyle}>
                  <span style={priceStyle}>{card.price}</span>
                  {card.pricePeriod && <span style={periodStyle}>{card.pricePeriod}</span>}
                </div>
                <p style={blurbStyle}>{card.blurb}</p>
                <ul style={perksListStyle}>
                  {card.perks.map((perk) => (
                    <li key={perk} style={perkRowStyle}>
                      <span
                        aria-hidden="true"
                        style={{ color: 'var(--mn-success)', flexShrink: 0 }}
                      >
                        <IconCheckCircle />
                      </span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleSelect(card.tier)}
                  disabled={disabled}
                  aria-label={`${card.cta} — formule ${card.title}`}
                  aria-busy={isLoading || undefined}
                  style={disabled ? ctaDisabledStyle : ctaButtonStyle}
                >
                  {locked ? (
                    <>
                      <IconLock />
                      Déjà adhérent·e
                    </>
                  ) : card.tier === 'gratuit' ? (
                    <>
                      <IconSpark />
                      {isLoading ? 'Activation…' : card.cta}
                    </>
                  ) : (
                    <>
                      <IconCart />
                      {isLoading ? 'Redirection Stripe…' : card.cta}
                    </>
                  )}
                </button>
              </article>
            </li>
          );
        })}
      </ul>

      <p
        style={{
          marginTop: 28,
          fontSize: 12,
          color: 'var(--mn-text-3)',
          maxWidth: 640,
          lineHeight: 1.6,
        }}
      >
        Les paiements transitent par Stripe (3D Secure obligatoire en zone&nbsp;UE). Vous pouvez
        résilier à tout moment depuis votre profil&nbsp;: l’adhésion reste active jusqu’à la fin de
        la période en cours. Les T99CP crédités à chaque renouvellement sont visibles dans votre
        portefeuille.
      </p>

      {/* Ordre canonique des tiers — exposé pour les tests E2E (DOM-based). */}
      <span data-testid="tier-order" hidden>
        {TIER_ORDER.join(',')}
      </span>
    </main>
  );
}
