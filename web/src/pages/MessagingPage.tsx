import { type CSSProperties } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';

import { IconMail, IconSpark } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { otherParty, type ConversationRow } from '@/lib/messaging';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useConversations } from '@/hooks/useConversations';

const pageStyle: CSSProperties = {
  maxWidth: 720,
  margin: '0 auto',
  padding: '32px 20px 80px',
};

const titleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(22px, 3.5vw, 30px)',
  fontWeight: 800,
  margin: 0,
  letterSpacing: '-0.02em',
  color: 'var(--mn-text-1)',
};

const subtitleStyle: CSSProperties = {
  fontSize: 14,
  color: 'var(--mn-text-3)',
  margin: '6px 0 20px',
};

const noticeStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 14,
  padding: 16,
  fontSize: 13,
  color: 'var(--mn-text-2)',
  marginBottom: 20,
};

const cardStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: 16,
  borderRadius: 14,
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  color: 'inherit',
  textDecoration: 'none',
};

const avatarStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: 14,
  flexShrink: 0,
};

const cardBodyStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minWidth: 0,
};

const cardTitleStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: 14,
  color: 'var(--mn-text-1)',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const cardMetaStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--mn-text-3)',
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

const countStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--mn-text-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 14,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function initials(id: string): string {
  return id.slice(0, 2).toUpperCase();
}

function ConversationCard({
  conversation,
  viewerId,
}: {
  conversation: ConversationRow;
  viewerId: string;
}) {
  const other = otherParty(conversation, viewerId);
  return (
    <Link to={`/messaging/${conversation.id}`} style={cardStyle}>
      <span aria-hidden="true" style={avatarStyle}>
        {initials(other)}
      </span>
      <div style={cardBodyStyle}>
        <p style={cardTitleStyle}>Conversation avec {other.slice(0, 8)}…</p>
        <span style={cardMetaStyle}>
          Dernier message : {formatDate(conversation.last_message_at)}
        </span>
      </div>
      <IconMail aria-hidden="true" />
    </Link>
  );
}

export default function MessagingPage() {
  const { user, status: authStatus } = useAuth();
  const location = useLocation();
  const { conversations, status, error } = useConversations(user?.id);
  const errorText = postgrestErrorMessage(error);

  if (authStatus === 'anonymous') {
    return <Navigate to="/?auth=login" state={{ from: location.pathname }} replace />;
  }

  return (
    <main style={pageStyle}>
      <h1 style={titleStyle}>Messagerie</h1>
      <p style={subtitleStyle}>Échanges directs entre adhérents. Strictement privés.</p>

      <div style={noticeStyle} role="note">
        <strong>Données personnelles.</strong> Les messages directs sont privés et chiffrés
        en transit. Seul·e·s les deux personnes membres de la conversation y ont accès. La
        modération admin n&apos;intervient qu&apos;en cas de signalement.
      </div>

      {errorText && (
        <div role="alert" style={errorBoxStyle}>
          {errorText}
        </div>
      )}

      {(status === 'loading' || status === 'idle') && (
        <p style={{ color: 'var(--mn-text-3)' }} role="status" aria-live="polite">
          Chargement des conversations…
        </p>
      )}

      {status === 'ready' && conversations.length === 0 && (
        <div style={emptyStyle} role="note">
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--mn-text-1)' }}>
            Aucune conversation
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 14 }}>
            Les messages échangés avec d&apos;autres adhérent·e·s apparaîtront ici.
          </p>
        </div>
      )}

      {status === 'ready' && conversations.length > 0 && user && (
        <>
          <div style={countStyle}>
            <IconSpark />
            <span>
              {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
            </span>
          </div>
          <ul
            aria-label="Liste des conversations"
            style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}
          >
            {conversations.map((conv) => (
              <li key={conv.id}>
                <ConversationCard conversation={conv} viewerId={user.id} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
