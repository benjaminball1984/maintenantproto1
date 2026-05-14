import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '@/components/EmptyState';
import { IconCar, IconCalendar, IconPen, IconPin, IconSearch, IconUsers } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { type CarpoolingRow } from '@/lib/carpooling';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useCarpooling } from '@/hooks/useCarpooling';

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
  marginBottom: 24,
  boxShadow: '0 12px 36px rgba(225, 29, 116, 0.18)',
};

const heroTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(24px, 4vw, 36px)',
  fontWeight: 800,
  margin: 0,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
};

const heroLeadStyle: CSSProperties = {
  marginTop: 12,
  fontSize: 'clamp(14px, 1.5vw, 16px)',
  lineHeight: 1.55,
  maxWidth: 640,
  color: 'rgba(255, 255, 255, 0.92)',
};

const toolbarStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(140px, 1fr) minmax(140px, 1fr) minmax(140px, 200px) auto',
  gap: 12,
  alignItems: 'center',
  marginBottom: 20,
};

const inputStyle: CSSProperties = {
  height: 46,
  padding: '0 12px',
  borderRadius: 12,
  border: '1.5px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-1)',
  fontSize: 14,
  fontFamily: 'inherit',
};

const searchInputStyle: CSSProperties = {
  ...inputStyle,
  paddingLeft: 42,
  width: '100%',
};

const searchWrapStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const searchIconStyle: CSSProperties = {
  position: 'absolute',
  left: 14,
  color: 'var(--mn-text-3)',
  pointerEvents: 'none',
};

const ctaStyle: CSSProperties = {
  height: 46,
  border: 'none',
  borderRadius: 12,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  padding: '0 18px',
  fontWeight: 700,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: 'inherit',
};

const ctaDisabledStyle: CSSProperties = {
  ...ctaStyle,
  background: 'var(--mn-surface-2)',
  color: 'var(--mn-text-3)',
  border: '1px solid var(--mn-border)',
  cursor: 'not-allowed',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gap: 18,
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
};

const cardStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 16,
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  textDecoration: 'none',
  color: 'inherit',
  transition: 'transform 120ms ease, border-color 120ms ease',
};

const cardRouteStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 18,
  fontWeight: 700,
  margin: 0,
  lineHeight: 1.3,
  color: 'var(--mn-text-1)',
};

const cardMetaStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12,
  fontSize: 12,
  color: 'var(--mn-text-3)',
};

const cardMetaItemStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

const tagStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--mn-brand-dark)',
  background: 'var(--mn-brand-light)',
  padding: '4px 10px',
  borderRadius: 999,
  alignSelf: 'flex-start',
};

const priceTagStyle: CSSProperties = {
  ...tagStyle,
  background: 'var(--mn-surface-2)',
  color: 'var(--mn-text-2)',
  marginTop: 'auto',
};


const errorBoxStyle: CSSProperties = {
  background: '#fef2f2',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--mn-danger)',
  border: '1px solid #fecaca',
  marginBottom: 20,
};

function formatDeparture(value: string): string {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return value;
  return new Date(time).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(price: number): string {
  if (price <= 0) return 'Gratuit';
  return `${price.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
}

function CarpoolingCard({ carpooling }: { carpooling: CarpoolingRow }) {
  return (
    <Link to={`/services/carpooling/${carpooling.id}`} style={cardStyle} className="mn-listing-card">
      <span style={tagStyle}>
        <IconCalendar width={12} height={12} />
        {formatDeparture(carpooling.departs_at)}
      </span>
      <h2 style={cardRouteStyle}>
        {carpooling.origin_city} → {carpooling.destination_city}
      </h2>
      <div style={cardMetaStyle}>
        <span style={cardMetaItemStyle}>
          <IconUsers width={14} height={14} />
          {carpooling.seats} place{carpooling.seats > 1 ? 's' : ''}
        </span>
        <span style={cardMetaItemStyle}>
          <IconPin width={14} height={14} />
          {carpooling.destination_city}
        </span>
      </div>
      <span style={priceTagStyle}>
        <IconCar width={12} height={12} />
        {formatPrice(carpooling.price_eur)}
      </span>
    </Link>
  );
}

export default function CarpoolingPage() {
  const { status: authStatus } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [fromInput, setFromInput] = useState<string>('');
  const [toInput, setToInput] = useState<string>('');
  const [departsAfterInput, setDepartsAfterInput] = useState<string>('');

  const params = useMemo(
    () => ({
      from: fromInput.trim() || undefined,
      to: toInput.trim() || undefined,
      search: searchInput.trim() || undefined,
      departsAfter: departsAfterInput ? new Date(departsAfterInput).toISOString() : undefined,
    }),
    [fromInput, toInput, searchInput, departsAfterInput],
  );

  const { carpooling, status, error } = useCarpooling(params);
  const errorText = postgrestErrorMessage(error);

  const ctaDisabled = authStatus === 'loading';

  return (
    <main style={pageStyle}>
      <section style={heroStyle} aria-labelledby="carpooling-title">
        <h1 id="carpooling-title" style={heroTitleStyle}>
          Covoiturage citoyen
        </h1>
        <p style={heroLeadStyle}>
          Marche, AG, festival, manifestation… Partagez un trajet pour rejoindre la mobilisation
          près de chez vous. Réduction d&apos;empreinte carbone et lien militant en bonus.
        </p>
      </section>

      <form
        role="search"
        aria-label="Rechercher un covoiturage"
        style={toolbarStyle}
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          type="text"
          value={fromInput}
          onChange={(event) => setFromInput(event.target.value)}
          placeholder="Ville de départ"
          aria-label="Ville de départ"
          style={inputStyle}
        />
        <input
          type="text"
          value={toInput}
          onChange={(event) => setToInput(event.target.value)}
          placeholder="Destination"
          aria-label="Ville d'arrivée"
          style={inputStyle}
        />
        <label style={searchWrapStyle}>
          <span style={searchIconStyle} aria-hidden="true">
            <IconSearch />
          </span>
          <span style={{ position: 'absolute', left: -9999 }}>Rechercher</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Mot-clé, notes…"
            style={searchInputStyle}
            aria-label="Rechercher un covoiturage"
          />
        </label>
        {ctaDisabled ? (
          <span style={ctaDisabledStyle} aria-disabled="true">
            <IconPen />
            Proposer un trajet
          </span>
        ) : (
          <Link to="/services/carpooling/new" style={ctaStyle}>
            <IconPen />
            Proposer un trajet
          </Link>
        )}
      </form>

      <div style={{ ...toolbarStyle, gridTemplateColumns: 'minmax(140px, 200px) 1fr' }}>
        <input
          type="date"
          value={departsAfterInput}
          onChange={(event) => setDepartsAfterInput(event.target.value)}
          aria-label="À partir du"
          style={inputStyle}
        />
        <span style={{ fontSize: 12, color: 'var(--mn-text-3)' }}>
          Filtrez par date de départ minimum.
        </span>
      </div>

      {errorText && (
        <div role="alert" style={errorBoxStyle}>
          {errorText}
        </div>
      )}

      {status === 'loading' && (
        <p style={{ color: 'var(--mn-text-3)' }} role="status" aria-live="polite">
          Chargement des covoiturages…
        </p>
      )}

      {status === 'ready' && carpooling.length === 0 && (
        <EmptyState
          icon={<IconCar width={22} height={22} />}
          title="Aucun covoiturage trouvé"
          description="Essayez d'autres villes, ou proposez le premier trajet pour cette destination."
          cta={{ to: '/services/carpooling/new', label: 'Proposer un trajet' }}
          testId="carpooling-empty"
        />
      )}

      {status === 'ready' && carpooling.length > 0 && (
        <>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--mn-text-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <IconCar />
            <span>
              {carpooling.length} trajet{carpooling.length > 1 ? 's' : ''}
            </span>
          </div>
          <ul
            aria-label="Liste des covoiturages"
            style={{ ...gridStyle, listStyle: 'none', margin: 0, padding: 0 }}
          >
            {carpooling.map((item) => (
              <li key={item.id}>
                <CarpoolingCard carpooling={item} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
