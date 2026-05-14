import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '@/components/EmptyState';
import { IconList, IconPen, IconSearch, IconSpark } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import type { ArticleFormat, ArticleRow } from '@/lib/media';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useArticles } from '@/hooks/useArticles';

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
  gridTemplateColumns: 'minmax(180px, 1fr) minmax(140px, 1fr) auto',
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
};

const cardTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 18,
  fontWeight: 700,
  margin: 0,
  lineHeight: 1.3,
  color: 'var(--mn-text-1)',
};

const summaryStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.5,
  color: 'var(--mn-text-2)',
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
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

const metaStyle: CSSProperties = {
  marginTop: 'auto',
  fontSize: 12,
  color: 'var(--mn-text-3)',
};


const errorBoxStyle: CSSProperties = {
  background: '#fef2f2',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--mn-danger)',
  border: '1px solid #fecaca',
  marginBottom: 20,
};

const FORMAT_LABELS: Record<ArticleFormat, string> = {
  article: 'Article',
  video: 'Vidéo',
  podcast: 'Podcast',
  photo: 'Photo',
  enquete: 'Enquête',
};

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ArticleCard({ article }: { article: ArticleRow }) {
  return (
    <Link to={`/media/${article.slug}`} style={cardStyle} className="mn-listing-card">
      <span style={tagStyle}>
        <IconList width={12} height={12} />
        {FORMAT_LABELS[article.format as ArticleFormat] ?? article.format}
      </span>
      <h2 style={cardTitleStyle}>{article.title}</h2>
      <p style={summaryStyle}>{article.summary}</p>
      <span style={metaStyle}>{formatDate(article.published_at ?? article.created_at)}</span>
    </Link>
  );
}

export default function MediaPage() {
  const { status: authStatus } = useAuth();
  const [searchInput, setSearchInput] = useState<string>('');
  const [formatInput, setFormatInput] = useState<ArticleFormat | ''>('');

  const params = useMemo(
    () => ({
      search: searchInput.trim() || undefined,
      format: formatInput || undefined,
    }),
    [searchInput, formatInput],
  );

  const { articles, status, error } = useArticles(params);
  const errorText = postgrestErrorMessage(error);
  const ctaDisabled = authStatus === 'loading';

  return (
    <main style={pageStyle}>
      <section style={heroStyle} aria-labelledby="media-title">
        <h1 id="media-title" style={heroTitleStyle}>
          Média indépendant
        </h1>
        <p style={heroLeadStyle}>
          Articles, enquêtes, vidéos et podcasts produits par la communauté. Pas de
          publicité, pas de paywall — modération éditoriale collective.
        </p>
      </section>

      <form
        role="search"
        aria-label="Rechercher un article"
        style={toolbarStyle}
        onSubmit={(event) => event.preventDefault()}
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
            placeholder="Mot-clé, titre, résumé…"
            style={searchInputStyle}
            aria-label="Rechercher un article"
          />
        </label>
        <select
          value={formatInput}
          onChange={(event) => setFormatInput(event.target.value as ArticleFormat | '')}
          aria-label="Filtrer par format"
          style={inputStyle}
        >
          <option value="">Tous les formats</option>
          {(Object.keys(FORMAT_LABELS) as ArticleFormat[]).map((f) => (
            <option key={f} value={f}>
              {FORMAT_LABELS[f]}
            </option>
          ))}
        </select>
        {ctaDisabled ? (
          <span style={ctaDisabledStyle} aria-disabled="true">
            <IconPen />
            Proposer un article
          </span>
        ) : (
          <Link to="/media/new" style={ctaStyle}>
            <IconPen />
            Proposer un article
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
          Chargement des articles…
        </p>
      )}

      {status === 'ready' && articles.length === 0 && (
        <EmptyState
          icon={<IconPen width={22} height={22} />}
          title="Aucun article publié"
          description="Soyez le premier à proposer un article au média militant."
          cta={{ to: '/media/new', label: 'Proposer un article' }}
          testId="media-empty"
        />
      )}

      {status === 'ready' && articles.length > 0 && (
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
            <IconSpark />
            <span>
              {articles.length} article{articles.length > 1 ? 's' : ''}
            </span>
          </div>
          <ul
            aria-label="Liste des articles"
            style={{ ...gridStyle, listStyle: 'none', margin: 0, padding: 0 }}
          >
            {articles.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
