import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '@/components/EmptyState';
import { IconHome, IconPen, IconPin, IconSearch, IconSpark, IconUsers } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { type GardenPlotRow } from '@/lib/garden';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useGarden } from '@/hooks/useGarden';

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
  gridTemplateColumns: 'minmax(140px, 1fr) minmax(140px, 1fr) auto auto',
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

const filterToggleStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 13,
  color: 'var(--mn-text-2)',
  fontWeight: 600,
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
};

const cardTitleStyle: CSSProperties = {
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

const spotsTagStyle: CSSProperties = {
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

function GardenCard({ garden }: { garden: GardenPlotRow }) {
  return (
    <Link to={`/services/garden/${garden.id}`} style={cardStyle} className="mn-listing-card">
      <span style={tagStyle}>
        <IconHome width={12} height={12} />
        Jardin partagé
      </span>
      <h2 style={cardTitleStyle}>{garden.name}</h2>
      <div style={cardMetaStyle}>
        <span style={cardMetaItemStyle}>
          <IconPin width={14} height={14} />
          {garden.city}
        </span>
        {garden.size_sqm !== null && (
          <span style={cardMetaItemStyle}>
            <IconHome width={14} height={14} />
            {garden.size_sqm} m²
          </span>
        )}
      </div>
      <span style={spotsTagStyle}>
        <IconUsers width={12} height={12} />
        {garden.available_spots} parcelle{garden.available_spots > 1 ? 's' : ''} libre
        {garden.available_spots > 1 ? 's' : ''}
      </span>
    </Link>
  );
}

export default function GardenPage() {
  const { status: authStatus } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [cityInput, setCityInput] = useState<string>('');
  const [withSpots, setWithSpots] = useState<boolean>(false);

  const params = useMemo(
    () => ({
      city: cityInput.trim() || undefined,
      search: searchInput.trim() || undefined,
      withSpots: withSpots || undefined,
    }),
    [cityInput, searchInput, withSpots],
  );

  const { gardens, status, error } = useGarden(params);
  const errorText = postgrestErrorMessage(error);
  const ctaDisabled = authStatus === 'loading';

  return (
    <main style={pageStyle}>
      <section style={heroStyle} aria-labelledby="garden-title">
        <h1 id="garden-title" style={heroTitleStyle}>
          Jardins partagés
        </h1>
        <p style={heroLeadStyle}>
          Rejoignez un jardin partagé près de chez vous : permaculture, autonomie alimentaire,
          lien social autour de la terre. Cultivons ensemble la souveraineté.
        </p>
      </section>

      <form
        role="search"
        aria-label="Rechercher un jardin"
        style={toolbarStyle}
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          type="text"
          value={cityInput}
          onChange={(event) => setCityInput(event.target.value)}
          placeholder="Ville"
          aria-label="Ville"
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
            placeholder="Mot-clé…"
            style={searchInputStyle}
            aria-label="Rechercher un jardin"
          />
        </label>
        <label style={filterToggleStyle}>
          <input
            type="checkbox"
            checked={withSpots}
            onChange={(event) => setWithSpots(event.target.checked)}
          />
          Parcelles libres
        </label>
        {ctaDisabled ? (
          <span style={ctaDisabledStyle} aria-disabled="true">
            <IconPen />
            Référencer un jardin
          </span>
        ) : (
          <Link to="/services/garden/new" style={ctaStyle}>
            <IconPen />
            Référencer un jardin
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
          Chargement des jardins…
        </p>
      )}

      {status === 'ready' && gardens.length === 0 && (
        <EmptyState
          icon={<IconSpark width={22} height={22} />}
          title="Aucun jardin référencé"
          description="Soyez le premier à référencer un jardin partagé."
          cta={{ to: '/services/garden/new', label: 'Référencer un jardin' }}
          testId="garden-empty"
        />
      )}

      {status === 'ready' && gardens.length > 0 && (
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
              {gardens.length} jardin{gardens.length > 1 ? 's' : ''}
            </span>
          </div>
          <ul
            aria-label="Liste des jardins"
            style={{ ...gridStyle, listStyle: 'none', margin: 0, padding: 0 }}
          >
            {gardens.map((g) => (
              <li key={g.id}>
                <GardenCard garden={g} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
