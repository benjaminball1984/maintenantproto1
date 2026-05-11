import { useState, type CSSProperties } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { IconBadge, IconCheckCircle, IconMegaphone, IconSpark } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  type NotificationKind,
  type NotificationRow,
} from '@/lib/notifications';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useNotifications } from '@/hooks/useNotifications';

const pageStyle: CSSProperties = {
  maxWidth: 760,
  margin: '0 auto',
  padding: '32px 20px 80px',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
  gap: 12,
  marginBottom: 20,
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
  margin: '6px 0 0',
};

const actionStyle: CSSProperties = {
  height: 40,
  padding: '0 14px',
  border: '1.5px solid var(--mn-border)',
  borderRadius: 10,
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-2)',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

const tabsStyle: CSSProperties = {
  display: 'inline-flex',
  gap: 6,
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 999,
  padding: 4,
  marginBottom: 16,
};

const tabStyle = (active: boolean): CSSProperties => ({
  padding: '8px 16px',
  borderRadius: 999,
  border: 'none',
  background: active ? 'var(--mn-gradient)' : 'transparent',
  color: active ? '#ffffff' : 'var(--mn-text-2)',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
});

const cardStyle = (read: boolean): CSSProperties => ({
  display: 'flex',
  gap: 14,
  padding: 16,
  borderRadius: 14,
  background: read ? 'var(--mn-surface)' : 'var(--mn-brand-light)',
  border: `1px solid ${read ? 'var(--mn-border)' : 'var(--mn-brand)'}`,
});

const cardBodyStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const cardTitleStyle: CSSProperties = {
  fontWeight: 700,
  color: 'var(--mn-text-1)',
  fontSize: 14,
  margin: 0,
};

const cardMetaStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  fontSize: 12,
  color: 'var(--mn-text-3)',
  alignItems: 'center',
};

const toggleStyle: CSSProperties = {
  height: 32,
  padding: '0 12px',
  border: '1.5px solid var(--mn-border)',
  borderRadius: 8,
  background: 'transparent',
  color: 'var(--mn-text-2)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
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

const KIND_LABELS: Record<NotificationKind, string> = {
  petition_signed: 'Pétition',
  mobilization_rsvp: 'Mobilisation',
  message: 'Message',
  comment: 'Commentaire',
  reaction: 'Réaction',
  campaign: 'Campagne',
  system: 'Système',
  admin: 'Admin',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function notificationTitle(n: NotificationRow): string {
  const payload = n.payload;
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const titleValue = (payload as { title?: unknown }).title;
    if (typeof titleValue === 'string' && titleValue.trim()) {
      return titleValue;
    }
  }
  return KIND_LABELS[n.kind];
}

export default function NotificationsPage() {
  const { user, status: authStatus } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const { notifications, status, error, refresh } = useNotifications(user?.id, {
    unreadOnly: tab === 'unread',
  });
  const errorText = postgrestErrorMessage(error);

  if (authStatus === 'anonymous') {
    return <Navigate to={`/?auth=login`} state={{ from: location.pathname }} replace />;
  }

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.id);
    await refresh();
  };

  const handleToggleRead = async (n: NotificationRow) => {
    if (n.read_at) {
      await markNotificationUnread(n.id);
    } else {
      await markNotificationRead(n.id);
    }
    await refresh();
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Notifications</h1>
          <p style={subtitleStyle}>
            {unreadCount > 0
              ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}.`
              : 'Vous êtes à jour.'}
          </p>
        </div>
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={() => {
              void handleMarkAllRead();
            }}
            style={actionStyle}
            disabled={unreadCount === 0}
          >
            <IconCheckCircle width={14} height={14} /> Tout marquer comme lu
          </button>
        )}
      </header>

      <div role="tablist" aria-label="Filtre des notifications" style={tabsStyle}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'all'}
          onClick={() => setTab('all')}
          style={tabStyle(tab === 'all')}
        >
          Toutes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'unread'}
          onClick={() => setTab('unread')}
          style={tabStyle(tab === 'unread')}
        >
          Non lues
        </button>
      </div>

      {errorText && (
        <div role="alert" style={errorBoxStyle}>
          {errorText}
        </div>
      )}

      {(status === 'loading' || status === 'idle') && (
        <p style={{ color: 'var(--mn-text-3)' }} role="status" aria-live="polite">
          Chargement des notifications…
        </p>
      )}

      {status === 'ready' && notifications.length === 0 && (
        <div style={emptyStyle} role="note">
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--mn-text-1)' }}>
            {tab === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 14 }}>
            {tab === 'unread'
              ? 'Tout est lu, beau travail.'
              : 'Vos alertes de pétitions, mobilisations et messages s’afficheront ici.'}
          </p>
        </div>
      )}

      {status === 'ready' && notifications.length > 0 && (
        <ul
          aria-label="Liste des notifications"
          style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}
        >
          {notifications.map((n) => {
            const read = Boolean(n.read_at);
            return (
              <li key={n.id}>
                <article style={cardStyle(read)}>
                  <span aria-hidden="true" style={{ color: 'var(--mn-brand-dark)' }}>
                    {n.kind === 'message' ? (
                      <IconMegaphone />
                    ) : n.kind === 'reaction' ? (
                      <IconSpark />
                    ) : (
                      <IconBadge />
                    )}
                  </span>
                  <div style={cardBodyStyle}>
                    <p style={cardTitleStyle}>{notificationTitle(n)}</p>
                    <div style={cardMetaStyle}>
                      <span>{KIND_LABELS[n.kind]}</span>
                      <span aria-hidden="true">·</span>
                      <time dateTime={n.created_at}>{formatDate(n.created_at)}</time>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={toggleStyle}
                    onClick={() => {
                      void handleToggleRead(n);
                    }}
                  >
                    {read ? 'Marquer non lu' : 'Marquer lu'}
                  </button>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
