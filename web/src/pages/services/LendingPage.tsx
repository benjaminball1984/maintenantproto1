import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '@/components/EmptyState';
import { IconBadge, IconList, IconPen, IconPin, IconSearch } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { type LendingRow } from '@/lib/lending';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useLending } from '@/hooks/useLending';

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
  gridTemplateColumns: 'minmax(140px, 1fr) minmax(140px, 1fr) minmax(140px, 1fr) auto',
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

const costTagStyle: CSSProperties = {
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

function formatCost(cost: number): string {
  if (cost <= 0) return 'Gratuit';
  return `${cost} T99CP`;
}

function LendingCard({ lending }: { lending: LendingRow }) {
  return (
    <Link to={`/services/lending/${lending.id}`} style={cardStyle} className="mn-listing-card">
      <span style={tagStyle}>
        <IconList width={12} height={12} />
        {lending.category}
      </span>
      <h2 style={cardTitleStyle}>{lending.title}</h2>
      <div style={cardMetaStyle}>
        <span style={cardMetaItemStyle}>
          <IconPin width={14} height={14} />
          {lending.city}
        </span>
      </div>
      <span style={costTagStyle}>
        <IconBadge width={12} height={12} />
        {formatCost(lending.t99cp_cost)}
      </span>
    </Link>
  );
}

export default function LendingPage() {
  const { status: authStatus } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [cityInput, setCityInput] = useState<string>('');
  const [categoryInput, setCategoryInput] = useState<string>('');

  const params = useMemo(
    () => ({
      city: cityInput.trim() || undefined,
      category: categoryInput.trim() || undefined,
      search: searchInput.trim() || undefined,
    }),
    [cityInput, categoryInput, searchInput],
  );

  const { lending, status, error } = useLending(params);
  const errorText = postgrestErrorMessage(error);
  const ctaDisabled = authStatus === 'loading';

  return (
    <main style={pageStyle}>
      <section style={heroStyle} aria-labelledby="lending-title">
        <h1 id="lending-title" style={heroTitleStyle}>
          Prêt d&apos;objets entre voisins
        </h1>
        <p style={heroLeadStyle}>
          Mutualisons l&apos;outillage, le matériel de manifestation, les livres… Empruntez en
          T99CP plutôt que de racheter. Économie circulaire et lien militant.
        </p>
      </section>

      <form
        role="search"
        aria-label="Rechercher un prêt"
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
        <input
          type="text"
          value={categoryInput}
          onChange={(event) => setCategoryInput(event.target.value)}
          placeholder="Catégorie"
          aria-label="Catégorie"
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
            aria-label="Rechercher un prêt"
          />
        </label>
        {ctaDisabled ? (
          <span style={ctaDisabledStyle} aria-disabled="true">
            <IconPen />
            Proposer un prêt
          </span>
        ) : (
          <Link to="/services/lending/new" style={ctaStyle}>
            <IconPen />
            Proposer un prêt
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
          Chargement des annonces…
        </p>
      )}

      {status === 'ready' && lending.length === 0 && (
        <EmptyState
          icon={<IconList width={22} height={22} />}
          title="Aucun prêt disponible"
          description="Soyez le premier à proposer un objet à emprunter."
          cta={{ to: '/services/lending/new', label: 'Proposer un prêt' }}
          testId="lending-empty"
        />
      )}

      {status === 'ready' && lending.length > 0 && (
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
            <IconList />
            <span>
              {lending.length} annonce{lending.length > 1 ? 's' : ''}
            </span>
          </div>
          <ul
            aria-label="Liste des prêts"
            style={{ ...gridStyle, listStyle: 'none', margin: 0, padding: 0 }}
          >
            {lending.map((item) => (
              <li key={item.id}>
                <LendingCard lending={item} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
