import { useMemo, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';

import Breadcrumbs from '@/components/Breadcrumbs';
import { IconArrowLeft, IconCheckCircle, IconPin, IconUsers } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { joinCommune, leaveCommune } from '@/lib/communes';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useCommune } from '@/hooks/useCommune';

const pageStyle: CSSProperties = {
  maxWidth: 900,
  margin: '0 auto',
  padding: '32px 20px 80px',
};

const backLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
  color: 'var(--mn-text-2)',
  textDecoration: 'none',
  fontWeight: 600,
  marginBottom: 20,
};

const headerStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 20,
  padding: 28,
  marginBottom: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const titleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(24px, 4vw, 32px)',
  fontWeight: 800,
  margin: 0,
  letterSpacing: '-0.02em',
  color: 'var(--mn-text-1)',
};

const cityStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  color: 'var(--mn-text-3)',
};

const descStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.6,
  color: 'var(--mn-text-2)',
};

const actionRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  alignItems: 'center',
};

const primaryBtnStyle: CSSProperties = {
  height: 44,
  padding: '0 18px',
  border: 'none',
  borderRadius: 12,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: 'inherit',
};

const secondaryBtnStyle: CSSProperties = {
  ...primaryBtnStyle,
  background: 'var(--mn-surface-2)',
  color: 'var(--mn-text-2)',
  border: '1px solid var(--mn-border)',
};

const disabledBtnStyle: CSSProperties = {
  ...secondaryBtnStyle,
  cursor: 'not-allowed',
  color: 'var(--mn-text-3)',
};

const sectionStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 16,
  padding: 24,
  marginBottom: 20,
};

const sectionTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 18,
  fontWeight: 700,
  margin: '0 0 12px',
  color: 'var(--mn-text-1)',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const errorBoxStyle: CSSProperties = {
  background: '#fef2f2',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--mn-danger)',
  border: '1px solid #fecaca',
  marginBottom: 20,
};

const memberStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 0',
  borderBottom: '1px solid var(--mn-border)',
  fontSize: 14,
  color: 'var(--mn-text-2)',
};

const ROLE_LABELS: Record<string, string> = {
  member: 'Membre',
  referent: 'Référent·e',
  treasurer: 'Trésorier·e',
  admin: 'Admin',
};

export default function CommuneDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, status: authStatus } = useAuth();
  const { commune, members, status, error, refresh } = useCommune(slug);
  const [busy, setBusy] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const userId = user?.id;
  const membership = useMemo(
    () => (userId ? members.find((m) => m.user_id === userId) ?? null : null),
    [members, userId],
  );

  // Reset l'erreur d'action quand le slug change (set state during render).
  const [trackedSlug, setTrackedSlug] = useState<string | undefined>(slug);
  if (trackedSlug !== slug) {
    setTrackedSlug(slug);
    if (actionError !== null) {
      setActionError(null);
    }
  }

  const errorText = actionError ?? postgrestErrorMessage(error);

  if (status === 'idle' || status === 'loading') {
    return (
      <main style={pageStyle}>
        <p style={{ color: 'var(--mn-text-3)' }} role="status" aria-live="polite">
          Chargement de la commune…
        </p>
      </main>
    );
  }

  if (status === 'notfound' || !commune) {
    return (
      <main style={pageStyle}>
        <Link to="/communes" style={backLinkStyle}>
          <IconArrowLeft /> Retour aux communes
        </Link>
        <h1 style={titleStyle}>Commune introuvable</h1>
        <p style={descStyle}>
          Cette commune n&apos;existe pas ou a été retirée. Consultez la liste pour
          repartir.
        </p>
      </main>
    );
  }

  const handleJoin = async () => {
    if (!userId || busy) return;
    setBusy(true);
    setActionError(null);
    const { error: joinError } = await joinCommune(commune.id, userId);
    setBusy(false);
    if (joinError) {
      setActionError(postgrestErrorMessage(joinError) ?? 'Impossible de rejoindre.');
      return;
    }
    await refresh();
  };

  const handleLeave = async () => {
    if (!userId || busy) return;
    setBusy(true);
    setActionError(null);
    const { error: leaveError } = await leaveCommune(commune.id, userId);
    setBusy(false);
    if (leaveError) {
      setActionError(postgrestErrorMessage(leaveError) ?? 'Impossible de quitter.');
      return;
    }
    await refresh();
  };

  return (
    <main style={pageStyle}>
      <Breadcrumbs
        items={[
          { label: 'Accueil', to: '/' },
          { label: 'Communes', to: '/communes' },
          { label: commune.name },
        ]}
      />
      <Link to="/communes" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux communes
      </Link>

      <section style={headerStyle} aria-labelledby="commune-title">
        <span style={cityStyle}>
          <IconPin width={14} height={14} />
          {commune.city}
        </span>
        <h1 id="commune-title" style={titleStyle}>
          {commune.name}
        </h1>
        {commune.description ? <p style={descStyle}>{commune.description}</p> : null}

        {errorText && (
          <div role="alert" style={errorBoxStyle}>
            {errorText}
          </div>
        )}

        <div style={actionRowStyle}>
          {authStatus === 'authenticated' && userId ? (
            membership ? (
              <button
                type="button"
                onClick={handleLeave}
                disabled={busy}
                style={busy ? disabledBtnStyle : secondaryBtnStyle}
                aria-busy={busy || undefined}
              >
                <IconCheckCircle />
                {busy ? '...' : 'Quitter cette commune'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleJoin}
                disabled={busy}
                style={busy ? disabledBtnStyle : primaryBtnStyle}
                aria-busy={busy || undefined}
              >
                <IconUsers width={16} height={16} />
                {busy ? 'En cours…' : 'Rejoindre cette commune'}
              </button>
            )
          ) : (
            <Link to="/?auth=login" style={primaryBtnStyle}>
              Se connecter pour rejoindre
            </Link>
          )}
        </div>
      </section>

      <section style={sectionStyle} aria-labelledby="commune-members-title">
        <h2 id="commune-members-title" style={sectionTitleStyle}>
          <IconUsers width={18} height={18} />
          {members.length} membre{members.length > 1 ? 's' : ''}
        </h2>
        {members.length === 0 ? (
          <p style={{ ...descStyle, fontSize: 13 }}>
            Soyez le ou la première à rejoindre cette commune.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {members.map((member) => (
              <li key={member.id} style={memberStyle}>
                <span>
                  {ROLE_LABELS[member.role] ?? member.role} ·{' '}
                  {new Date(member.joined_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
