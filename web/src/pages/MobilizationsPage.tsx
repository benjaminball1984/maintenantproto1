import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import { IconCalendar, IconPen, IconPin, IconSearch, IconUsers } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { formatMobilizationDate } from '@/lib/mobilizationFormat';
import { type MobilizationRow } from '@/lib/mobilizations';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useMobilizations } from '@/hooks/useMobilizations';

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
  gridTemplateColumns: 'minmax(200px, 1fr) minmax(140px, 200px) minmax(140px, 200px) auto',
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

function MobilizationCard({ mobilization }: { mobilization: MobilizationRow }) {
  return (
    <Link to={`/mobilizations/${mobilization.slug}`} style={cardStyle}>
      <span style={tagStyle}>
        <IconCalendar width={14} height={14} />
        {formatMobilizationDate(mobilization.starts_at, 'short')}
      </span>
      <h2 style={cardTitleStyle}>{mobilization.title}</h2>
      <p style={cardSummaryStyle}>{mobilization.summary}</p>
      <div style={cardMetaStyle}>
        <span style={cardMetaItemStyle}>
          <IconPin width={14} height={14} />
          {mobilization.city}
        </span>
        <span style={cardMetaItemStyle}>
          <IconUsers width={14} height={14} />
          {mobilization.participation_count.toLocaleString('fr-FR')} inscrit
          {mobilization.participation_count > 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  );
}

export default function MobilizationsPage() {
  const { status: authStatus } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [startsAfter, setStartsAfter] = useState<string>('');

  const params = useMemo(
    () => ({
      search: search || undefined,
      city: city || undefined,
      startsAfter: startsAfter ? new Date(startsAfter).toISOString() : undefined,
    }),
    [search, city, startsAfter],
  );

  const { mobilizations, status, error } = useMobilizations(params);
  const errorText = postgrestErrorMessage(error);

  const ctaDisabled = authStatus === 'loading';

  return (
    <main style={pageStyle}>
      <section style={heroStyle} aria-labelledby="mobilizations-title">
        <h1 id="mobilizations-title" style={heroTitleStyle}>
          Mobilisations &amp; événements
        </h1>
        <p style={heroLeadStyle}>
          Marches, AG, camps militants, festivals… Trouvez la prochaine mobilisation dans votre
          commune ou organisez la vôtre.
        </p>
      </section>

      <form
        role="search"
        aria-label="Rechercher une mobilisation"
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
            placeholder="Titre, mot-clé…"
            style={searchInputStyle}
            aria-label="Rechercher une mobilisation"
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
          type="date"
          value={startsAfter}
          onChange={(event) => setStartsAfter(event.target.value)}
          aria-label="À partir du"
          style={inputStyle}
        />
        {ctaDisabled ? (
          <span style={ctaDisabledStyle} aria-disabled="true">
            <IconPen />
            Créer un événement
          </span>
        ) : (
          <Link to="/mobilizations/new" style={ctaStyle}>
            <IconPen />
            Créer un événement
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
          Chargement des mobilisations…
        </p>
      )}

      {status === 'ready' && mobilizations.length === 0 && (
        <div style={emptyStyle} role="note">
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--mn-text-1)' }}>
            Aucune mobilisation trouvée
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 14 }}>
            Essayez d&apos;autres filtres, ou organisez la première sur ce sujet.
          </p>
        </div>
      )}

      {status === 'ready' && mobilizations.length > 0 && (
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
            <IconCalendar />
            <span>
              {mobilizations.length} mobilisation
              {mobilizations.length > 1 ? 's' : ''}
              {city ? ` · ${city}` : ''}
            </span>
          </div>
          <ul
            aria-label="Liste des mobilisations"
            style={{ ...gridStyle, listStyle: 'none', margin: 0, padding: 0 }}
          >
            {mobilizations.map((mobilization) => (
              <li key={mobilization.id}>
                <MobilizationCard mobilization={mobilization} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
