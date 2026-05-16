import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import {
  IconClose,
  IconFlame,
  IconPen,
  IconSpark,
  IconUsers,
} from '@/components/icons';
import { hasSeenOnboarding, markOnboardingSeen } from '@/lib/onboarding';

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10, 10, 10, 0.55)',
  backdropFilter: 'blur(4px)',
  zIndex: 1050,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};

const dialogStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  borderRadius: 20,
  width: '100%',
  maxWidth: 480,
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 32px 80px rgba(0, 0, 0, 0.25)',
  border: '1px solid var(--mn-border)',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px 8px',
};

const titleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 18,
  fontWeight: 700,
  color: 'var(--mn-text-1)',
  margin: 0,
};

const closeBtnStyle: CSSProperties = {
  border: 'none',
  background: 'var(--mn-surface-2)',
  borderRadius: '50%',
  width: 32,
  height: 32,
  cursor: 'pointer',
  color: 'var(--mn-text-3)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const stepWrapStyle: CSSProperties = {
  padding: '8px 24px 24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 14,
  textAlign: 'center',
};

const stepIconWrap: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 56,
  height: 56,
  borderRadius: 16,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
};

const stepTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 22,
  fontWeight: 700,
  color: 'var(--mn-text-1)',
  margin: 0,
  letterSpacing: '-0.02em',
};

const stepDescStyle: CSSProperties = {
  color: 'var(--mn-text-2)',
  fontSize: 15,
  lineHeight: 1.55,
  margin: 0,
};

const dotsStyle: CSSProperties = {
  display: 'flex',
  gap: 6,
  alignItems: 'center',
  margin: '4px 0 0',
};

const dotStyle = (active: boolean): CSSProperties => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: active ? 'var(--mn-brand)' : 'var(--mn-border-dark)',
});

const footerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
  padding: '12px 20px 20px',
  borderTop: '1px solid var(--mn-border)',
};

const ghostBtnStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--mn-text-2)',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  padding: '8px 10px',
};

const primaryBtnStyle: CSSProperties = {
  border: 'none',
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 14,
  padding: '10px 18px',
  borderRadius: 10,
  cursor: 'pointer',
};

const primaryLinkStyle: CSSProperties = {
  ...primaryBtnStyle,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const STEPS: OnboardingStep[] = [
  {
    icon: <IconSpark width={24} height={24} />,
    title: 'Bienvenue sur Maintenant !',
    description:
      "Une plateforme citoyenne sans publicité ni pistage, qui rassemble les outils pour reprendre la main sur les décisions qui nous concernent.",
  },
  {
    icon: <IconPen width={24} height={24} />,
    title: 'Pèse sur les décisions',
    description:
      "Lance ou signe des pétitions, vote sur des sondages locaux, coordonne des campagnes : les compteurs publics montrent la dynamique en temps réel.",
  },
  {
    icon: <IconFlame width={24} height={24} />,
    title: 'Organise et entraide-toi',
    description:
      "Mobilisations, hébergement solidaire, covoiturage, prêt d'objets, jardins partagés : tout est gratuit et ouvert.",
  },
  {
    icon: <IconUsers width={24} height={24} />,
    title: 'Rejoins le mouvement',
    description:
      "L'adhésion est à prix libre, à partir de 0 €. Tu reçois 1 jeton T99CP par adhésion — sans valeur monétaire, juste un marqueur d'engagement.",
  },
];

export interface OnboardingModalProps {
  /** Affichage forcé (ex : depuis le profil). Si absent, lit le flag localStorage. */
  open?: boolean;
  /** Callback appelé à la fermeture (skip ou step final terminé). */
  onClose?: () => void;
}

/**
 * Modale d'onboarding première visite. Affichée si le flag
 * `mn-onboarding-seen` n'est pas en localStorage. Au close (skip ou
 * step final), pose le flag pour ne plus s'afficher.
 *
 * Pas de RGPD : flag purement technique, pas de donnée personnelle.
 */
export default function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof open === 'boolean') return open;
    return !hasSeenOnboarding();
  });
  const [stepIndex, setStepIndex] = useState(0);
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Synchronisation `open` prop ↔ state via pattern « set state during render »
  // (compatible règle react-hooks/set-state-in-effect — cf. RootLayout AuthModal).
  const [trackedOpenProp, setTrackedOpenProp] = useState<boolean | undefined>(open);
  if (trackedOpenProp !== open) {
    setTrackedOpenProp(open);
    if (typeof open === 'boolean') {
      setIsOpen(open);
    }
  }

  // Focus le dialog quand il s'ouvre (a11y clavier).
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  // Échap = fermeture comme skip (idem AuthModal).
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        markOnboardingSeen();
        setIsOpen(false);
        onClose?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [isOpen, onClose]);

  function handleClose() {
    markOnboardingSeen();
    setIsOpen(false);
    onClose?.();
  }

  if (!isOpen) return null;

  const step = STEPS[stepIndex];
  if (!step) return null;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  return (
    <div
      style={overlayStyle}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      data-testid="onboarding-overlay"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        style={dialogStyle}
        data-testid="onboarding-dialog"
      >
        <div style={headerStyle}>
          <p style={titleStyle} id={titleId}>
            Découverte
          </p>
          <button
            type="button"
            onClick={handleClose}
            style={closeBtnStyle}
            aria-label="Passer l'onboarding"
          >
            <IconClose width={14} height={14} />
          </button>
        </div>

        <div style={stepWrapStyle}>
          <span style={stepIconWrap} aria-hidden>
            {step.icon}
          </span>
          <h2 style={stepTitleStyle}>{step.title}</h2>
          <p id={descId} style={stepDescStyle}>
            {step.description}
          </p>
          <div
            style={dotsStyle}
            role="group"
            aria-label={`Étape ${stepIndex + 1} sur ${STEPS.length}`}
          >
            {STEPS.map((_, i) => (
              <span key={i} style={dotStyle(i === stepIndex)} />
            ))}
          </div>
        </div>

        <div style={footerStyle}>
          <button type="button" style={ghostBtnStyle} onClick={handleClose}>
            Passer
          </button>
          {isLast ? (
            <Link
              to="/join"
              style={primaryLinkStyle}
              onClick={() => {
                markOnboardingSeen();
                setIsOpen(false);
                onClose?.();
              }}
            >
              <IconSpark width={16} height={16} aria-hidden />
              S&rsquo;inscrire
            </Link>
          ) : (
            <button
              type="button"
              style={primaryBtnStyle}
              onClick={() => setStepIndex((s) => s + 1)}
            >
              Suivant
            </button>
          )}
        </div>

        {!isFirst && (
          <div style={{ padding: '0 20px 16px' }}>
            <button
              type="button"
              style={{ ...ghostBtnStyle, padding: 0, fontSize: 13 }}
              onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
            >
              ← Revenir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
