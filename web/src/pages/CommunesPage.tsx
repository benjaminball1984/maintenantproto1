import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '@/components/EmptyState';
import { SkeletonCardList } from '@/components/Skeleton';
import { IconPen, IconPin, IconSearch, IconUsers } from '@/components/icons';
import { useCommunes } from '@/hooks/useCommunes';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import type { CommuneRow } from '@/lib/communes';
import { postgrestErrorMessage } from '@/lib/postgrestError';

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
  gridTemplateColumns: 'minmax(180px, 1fr) auto',
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

const cityStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--mn-brand-dark)',
  background: 'var(--mn-brand-light)',
  padding: '4px 10px',
  borderRadius: 999,
  alignSelf: 'flex-start',
};

const descStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.5,
  color: 'var(--mn-text-2)',
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};


const errorBoxStyle: CSSProperties = {
  background: '#fef2f2',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--mn-danger)',
  border: '1px solid #fecaca',
  marginBottom: 20,
};

function CommuneCard({ commune }: { commune: CommuneRow }) {
  return (
    <Link to={`/communes/${commune.slug}`} style={cardStyle} className="mn-listing-card">
      <span style={cityStyle}>
        <IconPin width={12} height={12} />
        {commune.city}
      </span>
      <h2 style={cardTitleStyle}>{commune.name}</h2>
      {commune.description ? <p style={descStyle}>{commune.description}</p> : null}
    </Link>
  );
}

export default function CommunesPage() {
  const [searchInput, setSearchInput] = useState<string>('');
  const params = useMemo(
    () => ({ search: searchInput.trim() || undefined }),
    [searchInput],
  );
  const { communes, status, error } = useCommunes(params);
  const { isAdmin } = useIsAdmin();
  const errorText = postgrestErrorMessage(error);

  return (
    <main style={pageStyle}>
      <section style={heroStyle} aria-labelledby="communes-title">
        <h1 id="communes-title" style={heroTitleStyle}>
          Communes libres
        </h1>
        <p style={heroLeadStyle}>
          Cellules locales du mouvement Maintenant ! Une commune libre regroupe les
          adhérents d&apos;un même territoire pour s&apos;organiser, mobiliser et porter
          des actions concrètes.
        </p>
      </section>

      <form
        role="search"
        aria-label="Rechercher une commune"
        style={toolbarStyle}
        onSubmit={(event) => event.preventDefault()}
      >
        <label style={searchWrapStyle}>
          <span style={searchIconStyle} aria-hidden="true">
            <IconSearch />
          </span>
          <span style={{ position: 'absolute', left: -9999 }}>Rechercher une commune</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Nom, ville, description…"
            style={searchInputStyle}
            aria-label="Rechercher une commune"
          />
        </label>
        {isAdmin ? (
          <Link to="/communes/new" style={ctaStyle}>
            <IconPen />
            Créer une commune
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
      </form>

      {errorText && (
        <div role="alert" style={errorBoxStyle}>
          {errorText}
        </div>
      )}

      {status === 'loading' && (
        <SkeletonCardList label="Chargement des communes…" testId="communes-loading" />
      )}

      {status === 'ready' && communes.length === 0 && (
        <EmptyState
          icon={<IconUsers width={22} height={22} />}
          title="Aucune commune publiée"
          description="La carte des communes libres se construira progressivement. Revenez plus tard."
          testId="communes-empty"
        />
      )}

      {status === 'ready' && communes.length > 0 && (
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
            <IconUsers width={14} height={14} />
            <span>
              {communes.length} commune{communes.length > 1 ? 's' : ''}
            </span>
          </div>
          <ul
            aria-label="Liste des communes libres"
            style={{ ...gridStyle, listStyle: 'none', margin: 0, padding: 0 }}
          >
            {communes.map((commune) => (
              <li key={commune.id}>
                <CommuneCard commune={commune} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
