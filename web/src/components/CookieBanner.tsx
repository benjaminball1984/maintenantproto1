import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import {
  DEFAULT_CATEGORIES,
  readConsent,
  writeConsent,
  type ConsentCategories,
  type ConsentChoice,
} from '@/lib/consent';

/**
 * Bannière de consentement aux cookies — conforme aux lignes directrices CNIL.
 * Catégories distinctes : strictement nécessaires (toujours actives) et mesure
 * d'audience anonymisée (opt-in). Pas de tracking publicitaire. Refus aussi
 * facile que l'acceptation. Choix persisté en localStorage (cf. `lib/consent`).
 */
const wrapperStyle: CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 900,
  display: 'flex',
  justifyContent: 'center',
  padding: '12px 16px 16px',
};

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: 720,
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 16,
  boxShadow: '0 24px 64px rgba(10, 10, 10, 0.18)',
  padding: 20,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  fontFamily: "'Sora', sans-serif",
  color: 'var(--mn-text-1)',
};

const paragraphStyle: CSSProperties = {
  margin: '8px 0 16px',
  fontSize: 14,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
};

const actionsRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
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

const secondaryBtnStyle: CSSProperties = {
  height: 40,
  padding: '0 18px',
  borderRadius: 10,
  border: '1px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-1)',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};

const ghostBtnStyle: CSSProperties = {
  height: 40,
  padding: '0 12px',
  borderRadius: 10,
  border: 'none',
  background: 'transparent',
  color: 'var(--mn-text-2)',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  textDecoration: 'underline',
};

const customizePanelStyle: CSSProperties = {
  marginTop: 16,
  padding: 16,
  background: 'var(--mn-surface-2)',
  borderRadius: 12,
  border: '1px solid var(--mn-border)',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const categoryRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
};

const categoryTextStyle: CSSProperties = {
  fontSize: 13,
  color: 'var(--mn-text-2)',
  lineHeight: 1.5,
};

interface CookieBannerProps {
  /**
   * Si fourni, court-circuite le store de consentement initial pour les tests.
   * Sinon, la bannière lit `localStorage` au montage.
   */
  initialOpen?: boolean;
}

export default function CookieBanner({ initialOpen }: CookieBannerProps = {}) {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof initialOpen === 'boolean') return initialOpen;
    if (typeof window === 'undefined') return false;
    return readConsent() === null;
  });
  const [customize, setCustomize] = useState(false);
  const [categories, setCategories] = useState<ConsentCategories>(DEFAULT_CATEGORIES);
  const titleId = useId();
  const descriptionId = useId();
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !customize) return;
    cardRef.current?.querySelector<HTMLButtonElement>('button[data-cookie-save]')?.focus();
  }, [open, customize]);

  if (!open) return null;

  function persist(choice: ConsentChoice, cats: ConsentCategories) {
    writeConsent(choice, cats);
    setOpen(false);
  }

  function handleAcceptAll() {
    persist('all', { analytics: true });
  }

  function handleRefuseAll() {
    persist('essential', { analytics: false });
  }

  function handleSaveCustom() {
    persist('custom', categories);
  }

  function toggleAnalytics() {
    setCategories((prev) => ({ ...prev, analytics: !prev.analytics }));
  }

  return (
    <div style={wrapperStyle}>
      <div
        ref={cardRef}
        role="region"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        style={cardStyle}
      >
        <h2 id={titleId} style={titleStyle}>
          Cookies et confidentialité
        </h2>
        <p id={descriptionId} style={paragraphStyle}>
          Nous utilisons des cookies strictement nécessaires au fonctionnement du site (session,
          sécurité) et, sur consentement, une mesure d&apos;audience anonymisée. Aucun cookie
          publicitaire, aucun profilage. Vous pouvez modifier votre choix à tout moment depuis la
          page <Link to="/legal/cookies">cookies</Link>.
        </p>

        <div style={actionsRowStyle}>
          <button type="button" style={primaryBtnStyle} onClick={handleAcceptAll}>
            Tout accepter
          </button>
          <button type="button" style={secondaryBtnStyle} onClick={handleRefuseAll}>
            Tout refuser
          </button>
          <button
            type="button"
            style={ghostBtnStyle}
            aria-expanded={customize}
            aria-controls={`${titleId}-customize`}
            onClick={() => setCustomize((v) => !v)}
          >
            Personnaliser
          </button>
        </div>

        {customize ? (
          <div id={`${titleId}-customize`} style={customizePanelStyle}>
            <div style={categoryRowStyle}>
              <input
                id={`${titleId}-essential`}
                type="checkbox"
                checked
                disabled
                aria-describedby={`${titleId}-essential-desc`}
              />
              <label htmlFor={`${titleId}-essential`} style={{ flex: 1 }}>
                <strong style={{ display: 'block', color: 'var(--mn-text-1)' }}>
                  Strictement nécessaires
                </strong>
                <span id={`${titleId}-essential-desc`} style={categoryTextStyle}>
                  Indispensables : session d&apos;authentification, sécurité CSRF. Toujours actifs.
                </span>
              </label>
            </div>

            <div style={categoryRowStyle}>
              <input
                id={`${titleId}-analytics`}
                type="checkbox"
                checked={categories.analytics}
                onChange={toggleAnalytics}
                aria-describedby={`${titleId}-analytics-desc`}
              />
              <label htmlFor={`${titleId}-analytics`} style={{ flex: 1 }}>
                <strong style={{ display: 'block', color: 'var(--mn-text-1)' }}>
                  Mesure d&apos;audience anonymisée
                </strong>
                <span id={`${titleId}-analytics-desc`} style={categoryTextStyle}>
                  Comptage agrégé des visites (pages vues, durée moyenne). Pas d&apos;identifiant
                  publicitaire, pas de partage avec des tiers.
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                data-cookie-save
                style={primaryBtnStyle}
                onClick={handleSaveCustom}
              >
                Enregistrer mes choix
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
