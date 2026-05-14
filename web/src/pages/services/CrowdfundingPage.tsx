import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '@/components/EmptyState';
import { IconCart, IconFlame, IconPen, IconSearch, IconSpark } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { type CrowdfundingCampaignRow } from '@/lib/crowdfunding';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useCrowdfunding } from '@/hooks/useCrowdfunding';

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
  gridTemplateColumns: 'minmax(220px, 1fr) auto',
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

const progressBarStyle: CSSProperties = {
  height: 8,
  borderRadius: 6,
  background: 'var(--mn-surface-2)',
  overflow: 'hidden',
  marginTop: 'auto',
};

const progressFillStyle = (ratio: number): CSSProperties => ({
  width: `${Math.min(ratio * 100, 100)}%`,
  height: '100%',
  background: 'var(--mn-gradient)',
});

const progressLabelStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 12,
  color: 'var(--mn-text-3)',
  fontWeight: 600,
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

function formatEur(amount: number): string {
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function CrowdfundingCard({ campaign }: { campaign: CrowdfundingCampaignRow }) {
  const ratio = campaign.goal_eur > 0 ? campaign.raised_eur / campaign.goal_eur : 0;
  const percent = Math.round(Math.min(ratio, 1) * 100);
  return (
    <Link to={`/services/crowdfunding/${campaign.id}`} style={cardStyle} className="mn-listing-card">
      <span style={tagStyle}>
        <IconFlame width={12} height={12} />
        Cagnotte
      </span>
      <h2 style={cardTitleStyle}>{campaign.title}</h2>
      <p style={summaryStyle}>{campaign.summary}</p>
      <div style={progressBarStyle} role="presentation">
        <div style={progressFillStyle(ratio)} />
      </div>
      <div style={progressLabelStyle}>
        <span>{formatEur(campaign.raised_eur)} € collectés</span>
        <span>
          {percent}% sur {formatEur(campaign.goal_eur)} €
        </span>
      </div>
    </Link>
  );
}

export default function CrowdfundingPage() {
  const { status: authStatus } = useAuth();
  const [searchInput, setSearchInput] = useState<string>('');

  const params = useMemo(
    () => ({ search: searchInput.trim() || undefined }),
    [searchInput],
  );

  const { campaigns, status, error } = useCrowdfunding(params);
  const errorText = postgrestErrorMessage(error);
  const ctaDisabled = authStatus === 'loading';

  return (
    <main style={pageStyle}>
      <section style={heroStyle} aria-labelledby="crowdfunding-title">
        <h1 id="crowdfunding-title" style={heroTitleStyle}>
          Cagnottes solidaires
        </h1>
        <p style={heroLeadStyle}>
          Lancez ou soutenez une cagnotte pour financer une caisse de grève, du matériel
          militant, un projet de quartier. Transparence et reddition de comptes intégrées.
        </p>
      </section>

      <form
        role="search"
        aria-label="Rechercher une cagnotte"
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
            aria-label="Rechercher une cagnotte"
          />
        </label>
        {ctaDisabled ? (
          <span style={ctaDisabledStyle} aria-disabled="true">
            <IconPen />
            Lancer une cagnotte
          </span>
        ) : (
          <Link to="/services/crowdfunding/new" style={ctaStyle}>
            <IconPen />
            Lancer une cagnotte
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
          Chargement des cagnottes…
        </p>
      )}

      {status === 'ready' && campaigns.length === 0 && (
        <EmptyState
          icon={<IconSpark width={22} height={22} />}
          title="Aucune cagnotte en cours"
          description="Lancez la première cagnotte solidaire de la plateforme."
          cta={{ to: '/services/crowdfunding/new', label: 'Lancer une cagnotte' }}
          testId="crowdfunding-empty"
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
            <IconCart />
            <span>
              {campaigns.length} cagnotte{campaigns.length > 1 ? 's' : ''}
            </span>
          </div>
          <ul
            aria-label="Liste des cagnottes"
            style={{ ...gridStyle, listStyle: 'none', margin: 0, padding: 0 }}
          >
            {campaigns.map((c) => (
              <li key={c.id}>
                <CrowdfundingCard campaign={c} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
