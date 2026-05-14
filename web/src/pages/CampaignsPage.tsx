import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '@/components/EmptyState';
import { SkeletonCardList } from '@/components/Skeleton';
import { IconMegaphone, IconPen, IconSearch } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { type CampaignRow, type CampaignStatus } from '@/lib/campaigns';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useCampaigns } from '@/hooks/useCampaigns';

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


const errorBoxStyle: CSSProperties = {
  background: '#fef2f2',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--mn-danger)',
  border: '1px solid #fecaca',
  marginBottom: 20,
};

function CampaignCard({ campaign }: { campaign: CampaignRow }) {
  return (
    <Link to={`/campaigns/${campaign.slug}`} style={cardStyle} className="mn-listing-card">
      <span style={tagStyle}>
        <IconMegaphone width={12} height={12} />
        Campagne
      </span>
      <h2 style={cardTitleStyle}>{campaign.title}</h2>
      <p style={cardSummaryStyle}>{campaign.summary}</p>
      <div style={cardFooterStyle}>
        <span>Voir le plan d&apos;action</span>
      </div>
    </Link>
  );
}

export default function CampaignsPage() {
  const { status: authStatus } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | ''>('');

  const [search, setSearch] = useState<string>('');

  const params = useMemo(
    () => ({
      search: search || undefined,
      status: filterStatus || undefined,
    }),
    [search, filterStatus],
  );

  const { campaigns, status, error } = useCampaigns(params);
  const errorText = postgrestErrorMessage(error);

  const ctaDisabled = authStatus === 'loading';

  return (
    <main style={pageStyle}>
      <section style={heroStyle} aria-labelledby="campaigns-title">
        <h1 id="campaigns-title" style={heroTitleStyle}>
          Campagnes citoyennes
        </h1>
        <p style={heroLeadStyle}>
          Agrégez en une seule page une pétition, une mobilisation, un sondage et une cagnotte pour
          porter une lutte. Une campagne Maintenant&nbsp;! orchestre jusqu&apos;à 12 actions
          concrètes — chacune cliquable, chacune mesurable.
        </p>
      </section>

      <form
        role="search"
        aria-label="Rechercher une campagne"
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
            placeholder="Titre, mot-clé, lutte..."
            style={searchInputStyle}
            aria-label="Rechercher une campagne"
          />
        </label>
        <select
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value as CampaignStatus | '')}
          style={selectStyle}
          aria-label="Filtrer par statut"
        >
          <option value="">Campagnes en cours</option>
          <option value="published">Publiées</option>
          <option value="archived">Archivées</option>
        </select>
        {ctaDisabled ? (
          <span style={ctaDisabledStyle} aria-disabled="true">
            <IconPen />
            Créer une campagne
          </span>
        ) : (
          <Link to="/campaigns/new" style={ctaStyle}>
            <IconPen />
            Créer une campagne
          </Link>
        )}
      </form>

      {errorText && (
        <div role="alert" style={errorBoxStyle}>
          {errorText}
        </div>
      )}

      {status === 'loading' && (
        <SkeletonCardList label="Chargement des campagnes…" testId="campaigns-loading" />
      )}

      {status === 'ready' && campaigns.length === 0 && (
        <EmptyState
          icon={<IconMegaphone width={22} height={22} />}
          title="Aucune campagne trouvée"
          description="Essayez d'autres filtres, ou lancez la première campagne sur ce sujet."
          cta={{ to: '/campaigns/new', label: 'Lancer une campagne' }}
          testId="campaigns-empty"
        />
      )}

      {status === 'ready' && campaigns.length > 0 && (
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
            <IconMegaphone />
            <span>
              {campaigns.length} campagne{campaigns.length > 1 ? 's' : ''}
            </span>
          </div>
          <ul
            aria-label="Liste des campagnes"
            style={{ ...gridStyle, listStyle: 'none', margin: 0, padding: 0 }}
          >
            {campaigns.map((campaign) => (
              <li key={campaign.id}>
                <CampaignCard campaign={campaign} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
