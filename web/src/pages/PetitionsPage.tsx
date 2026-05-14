import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '@/components/EmptyState';
import { IconFlame, IconPen, IconSearch } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { PETITION_CATEGORIES, type PetitionRow } from '@/lib/petitions';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { usePetitions } from '@/hooks/usePetitions';

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
  gridTemplateColumns: 'minmax(200px, 1fr) auto auto',
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

const selectStyle: CSSProperties = {
  height: 46,
  padding: '0 12px',
  borderRadius: 12,
  border: '1.5px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-1)',
  fontSize: 14,
  fontFamily: 'inherit',
  fontWeight: 600,
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

const cardFooterStyle: CSSProperties = {
  marginTop: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  fontSize: 12,
  color: 'var(--mn-text-3)',
};

const tagStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--mn-brand-dark)',
  background: 'var(--mn-brand-light)',
  padding: '4px 10px',
  borderRadius: 999,
};

const progressBarStyle: CSSProperties = {
  height: 6,
  borderRadius: 999,
  background: 'var(--mn-surface-2)',
  overflow: 'hidden',
};

const progressFillStyle: CSSProperties = {
  height: '100%',
  background: 'var(--mn-gradient)',
};


const errorBoxStyle: CSSProperties = {
  background: '#fef2f2',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--mn-danger)',
  border: '1px solid #fecaca',
  marginBottom: 20,
};

function PetitionCard({ petition }: { petition: PetitionRow }) {
  const ratio = Math.min(100, Math.round((petition.signature_count / petition.target_count) * 100));
  return (
    <Link to={`/petitions/${petition.slug}`} style={cardStyle} className="mn-listing-card">
      <span style={tagStyle}>{petition.category}</span>
      <h2 style={cardTitleStyle}>{petition.title}</h2>
      <p style={cardSummaryStyle}>{petition.summary}</p>
      <div style={progressBarStyle} aria-hidden="true">
        <div style={{ ...progressFillStyle, width: `${ratio}%` }} />
      </div>
      <div style={cardFooterStyle}>
        <span>
          <strong style={{ color: 'var(--mn-text-1)' }}>
            {petition.signature_count.toLocaleString('fr-FR')}
          </strong>{' '}
          / {petition.target_count.toLocaleString('fr-FR')} signatures
        </span>
        <span>{ratio}%</span>
      </div>
    </Link>
  );
}

export default function PetitionsPage() {
  const { status: authStatus } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState<string>('');

  // search est appliqué avec un debounce manuel : on ne déclenche pas la
  // requête sur chaque frappe (sinon refetch en boucle). L'utilisateur valide
  // par Entrée ou par le bouton de recherche.
  const [search, setSearch] = useState<string>('');

  const params = useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
    }),
    [search, category],
  );

  const { petitions, status, error } = usePetitions(params);
  const errorText = postgrestErrorMessage(error);

  const ctaDisabled = authStatus === 'loading';

  return (
    <main style={pageStyle}>
      <section style={heroStyle} aria-labelledby="petitions-title">
        <h1 id="petitions-title" style={heroTitleStyle}>
          Pétitions citoyennes
        </h1>
        <p style={heroLeadStyle}>
          Mobilisez votre commune autour d&apos;une cause concrète. Signer une pétition
          Maintenant&nbsp;! est gratuit et engage le mouvement à porter le sujet auprès des élu·es
          local·es.
        </p>
      </section>

      <form
        role="search"
        aria-label="Rechercher une pétition"
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
          <span className="visually-hidden" style={{ position: 'absolute', left: -9999 }}>
            Rechercher
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Titre, cause, lieu..."
            style={searchInputStyle}
            aria-label="Rechercher une pétition"
          />
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          style={selectStyle}
          aria-label="Filtrer par catégorie"
        >
          <option value="">Toutes les catégories</option>
          {PETITION_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {ctaDisabled ? (
          <span style={ctaDisabledStyle} aria-disabled="true">
            <IconPen />
            Créer une pétition
          </span>
        ) : (
          <Link to="/petitions/new" style={ctaStyle}>
            <IconPen />
            Créer une pétition
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
          Chargement des pétitions…
        </p>
      )}

      {status === 'ready' && petitions.length === 0 && (
        <EmptyState
          icon={<IconPen width={22} height={22} />}
          title="Aucune pétition trouvée"
          description="Essayez d'autres filtres, ou lancez la première sur ce sujet."
          cta={{ to: '/petitions/new', label: 'Créer une pétition' }}
          testId="petitions-empty"
        />
      )}

      {status === 'ready' && petitions.length > 0 && (
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
            <IconFlame />
            <span>
              {petitions.length} pétition{petitions.length > 1 ? 's' : ''}
              {category ? ` · ${category}` : ''}
            </span>
          </div>
          <ul
            aria-label="Liste des pétitions"
            style={{ ...gridStyle, listStyle: 'none', margin: 0, padding: 0 }}
          >
            {petitions.map((petition) => (
              <li key={petition.id}>
                <PetitionCard petition={petition} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
