import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import { IconHome, IconPen, IconPin, IconSearch, IconUsers } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { type HousingRow } from '@/lib/housing';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useHousing } from '@/hooks/useHousing';

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
  gridTemplateColumns: 'minmax(200px, 1fr) minmax(140px, 200px) minmax(100px, 140px) auto',
  gap: 12,
  alignItems: 'center',
  marginBottom: 20,
};

const searchWrapStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const searchInputStyle: CSSProperties = {
  width: '100%',
  height: 46,
  paddingLeft: 42,
  paddingRight: 14,
  borderRadius: 12,
  border: '1.5px solid var(--mn-border)',
  fontSize: 14,
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-1)',
  fontFamily: 'inherit',
};

const searchIconStyle: CSSProperties = {
  position: 'absolute',
  left: 14,
  color: 'var(--mn-text-3)',
  pointerEvents: 'none',
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

const cardTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 18,
  fontWeight: 700,
  margin: 0,
  lineHeight: 1.3,
  color: 'var(--mn-text-1)',
};

const cardSummaryStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.5,
  color: 'var(--mn-text-2)',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const cardMetaStyle: CSSProperties = {
  marginTop: 'auto',
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

const emptyStyle: CSSProperties = {
  border: '1px dashed var(--mn-border)',
  borderRadius: 16,
  padding: '36px 20px',
  textAlign: 'center',
  color: 'var(--mn-text-3)',
  background: 'var(--mn-surface)',
};

const errorBoxStyle: CSSProperties = {
  background: '#fef2f2',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--mn-danger)',
  border: '1px solid #fecaca',
  marginBottom: 20,
};

function HousingCard({ housing }: { housing: HousingRow }) {
  return (
    <Link to={`/services/housing/${housing.id}`} style={cardStyle}>
      <span style={tagStyle}>
        <IconHome width={12} height={12} />
        Hébergement
      </span>
      <h2 style={cardTitleStyle}>{housing.title}</h2>
      <p style={cardSummaryStyle}>{housing.description}</p>
      <div style={cardMetaStyle}>
        <span style={cardMetaItemStyle}>
          <IconPin width={14} height={14} />
          {housing.city}
        </span>
        <span style={cardMetaItemStyle}>
          <IconUsers width={14} height={14} />
          {housing.capacity} place{housing.capacity > 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  );
}

export default function HousingPage() {
  const { status: authStatus } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [capacityInput, setCapacityInput] = useState<string>('');

  const params = useMemo(() => {
    const capacityValue = capacityInput.trim() ? Number.parseInt(capacityInput, 10) : NaN;
    return {
      search: search || undefined,
      city: city || undefined,
      capacityMin: Number.isFinite(capacityValue) && capacityValue > 0 ? capacityValue : undefined,
    };
  }, [search, city, capacityInput]);

  const { housing, status, error } = useHousing(params);
  const errorText = postgrestErrorMessage(error);

  const ctaDisabled = authStatus === 'loading';

  return (
    <main style={pageStyle}>
      <section style={heroStyle} aria-labelledby="housing-title">
        <h1 id="housing-title" style={heroTitleStyle}>
          Hébergement solidaire
        </h1>
        <p style={heroLeadStyle}>
          Trouvez ou proposez un toit le temps d&apos;une lutte, d&apos;une formation, d&apos;un
          déplacement militant. Une communauté entraide, pas une plateforme commerciale.
        </p>
      </section>

      <form
        role="search"
        aria-label="Rechercher un hébergement"
        style={toolbarStyle}
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(searchInput.trim());
        }}
      >
        <label style={searchWrapStyle}>
          <span style={searchIconStyle} aria-hidden="true">
            <IconSearch />
          </span>
          <span style={{ position: 'absolute', left: -9999 }}>Rechercher</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Titre, ville, mot-clé…"
            style={searchInputStyle}
            aria-label="Rechercher un hébergement"
          />
        </label>
        <input
          type="text"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Ville"
          aria-label="Filtrer par ville"
          style={inputStyle}
        />
        <input
          type="number"
          min={1}
          max={20}
          value={capacityInput}
          onChange={(event) => setCapacityInput(event.target.value)}
          placeholder="Places min."
          aria-label="Capacité minimum"
          style={inputStyle}
        />
        {ctaDisabled ? (
          <span style={ctaDisabledStyle} aria-disabled="true">
            <IconPen />
            Proposer un hébergement
          </span>
        ) : (
          <Link to="/services/housing/new" style={ctaStyle}>
            <IconPen />
            Proposer un hébergement
          </Link>
        )}
      </form>

      {errorText && (
        <div role="alert" style={errorBoxStyle}>
          {errorText}
        </div>
      )}

      {status === 'loading' && (
        <p style={{ color: 'var(--mn-text-3)' }} role="status" aria-live="polite">
          Chargement des hébergements…
        </p>
      )}

      {status === 'ready' && housing.length === 0 && (
        <div style={emptyStyle} role="note">
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--mn-text-1)' }}>
            Aucun hébergement trouvé
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 14 }}>
            Essayez d&apos;autres filtres, ou proposez le premier sur votre territoire.
          </p>
        </div>
      )}

      {status === 'ready' && housing.length > 0 && (
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
            <IconHome />
            <span>
              {housing.length} hébergement{housing.length > 1 ? 's' : ''}
              {city ? ` · ${city}` : ''}
            </span>
          </div>
          <ul
            aria-label="Liste des hébergements"
            style={{ ...gridStyle, listStyle: 'none', margin: 0, padding: 0 }}
          >
            {housing.map((item) => (
              <li key={item.id}>
                <HousingCard housing={item} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
