import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';

import { IconArrowLeft, IconMail } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  MESSAGE_BODY_MAX,
  getConversation,
  otherParty,
  sendMessage,
  validateMessageInput,
  type ConversationRow,
} from '@/lib/messaging';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useMessages } from '@/hooks/useMessages';

const pageStyle: CSSProperties = {
  maxWidth: 720,
  margin: '0 auto',
  padding: '24px 20px 80px',
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
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  marginBottom: 20,
};

const avatarStyle: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: '50%',
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: 16,
  flexShrink: 0,
};

const titleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 20,
  fontWeight: 800,
  margin: 0,
  color: 'var(--mn-text-1)',
};

const subtitleStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--mn-text-3)',
  margin: '2px 0 0',
};

const threadStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  marginBottom: 20,
};

const bubbleSelfStyle: CSSProperties = {
  alignSelf: 'flex-end',
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  borderRadius: '14px 14px 4px 14px',
  padding: '10px 14px',
  maxWidth: '80%',
  whiteSpace: 'pre-wrap',
  fontSize: 14,
  lineHeight: 1.5,
};

const bubbleOtherStyle: CSSProperties = {
  alignSelf: 'flex-start',
  background: 'var(--mn-surface-2)',
  color: 'var(--mn-text-1)',
  borderRadius: '14px 14px 14px 4px',
  padding: '10px 14px',
  maxWidth: '80%',
  whiteSpace: 'pre-wrap',
  fontSize: 14,
  lineHeight: 1.5,
};

const bubbleMetaStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--mn-text-3)',
  marginTop: 4,
};

const formStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 16,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const textareaStyle: CSSProperties = {
  width: '100%',
  minHeight: 70,
  padding: 12,
  borderRadius: 12,
  border: '1.5px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  fontSize: 15,
  fontFamily: 'inherit',
  color: 'var(--mn-text-1)',
  resize: 'vertical',
};

const submitStyle: CSSProperties = {
  alignSelf: 'flex-end',
  height: 40,
  padding: '0 18px',
  border: 'none',
  borderRadius: 10,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: 'inherit',
};

const submitDisabledStyle: CSSProperties = {
  ...submitStyle,
  background: 'var(--mn-surface-2)',
  color: 'var(--mn-text-3)',
  border: '1px solid var(--mn-border)',
  cursor: 'not-allowed',
};

const errorTextStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--mn-danger)',
};

const errorBoxStyle: CSSProperties = {
  background: '#fef2f2',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--mn-danger)',
  border: '1px solid #fecaca',
};

function formatDate(iso: string): string {
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

export default function MessagingConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user, status: authStatus } = useAuth();
  const location = useLocation();
  const { messages, status, error, refresh } = useMessages(conversationId);

  const [conversation, setConversation] = useState<ConversationRow | null>(null);
  const [convStatus, setConvStatus] = useState<'loading' | 'ready' | 'notfound' | 'error'>(
    'loading',
  );
  const [body, setBody] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    if (authStatus !== 'authenticated') return;
    let cancelled = false;
    void (async () => {
      const { data, error: err } = await getConversation(conversationId);
      if (cancelled) return;
      if (err) {
        setConvStatus('error');
        return;
      }
      if (!data) {
        setConvStatus('notfound');
        return;
      }
      setConversation(data);
      setConvStatus('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId, authStatus]);

  if (authStatus === 'anonymous') {
    return <Navigate to="/?auth=login" state={{ from: location.pathname }} replace />;
  }

  if (convStatus === 'notfound') {
    return <Navigate to="/messaging" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !conversation) return;
    setBusy(true);
    setFieldError(null);
    setGlobalError(null);

    const input = {
      conversationId: conversation.id,
      senderId: user.id,
      body,
    };
    const issues = validateMessageInput(input);
    if (issues.length > 0) {
      setFieldError(issues[0]?.message ?? 'Message invalide.');
      setBusy(false);
      return;
    }

    const { error: sendError } = await sendMessage(input);
    if (sendError) {
      setGlobalError(
        postgrestErrorMessage(sendError) ??
          'Impossible d’envoyer le message. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    setBody('');
    setBusy(false);
    await refresh();
  };

  const errorText = postgrestErrorMessage(error);
  const otherId = conversation && user ? otherParty(conversation, user.id) : '';

  return (
    <main style={pageStyle}>
      <Link to="/messaging" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux conversations
      </Link>

      {convStatus === 'loading' && (
        <p style={{ color: 'var(--mn-text-3)' }} role="status" aria-live="polite">
          Chargement de la conversation…
        </p>
      )}

      {convStatus === 'error' && (
        <div role="alert" style={errorBoxStyle}>
          Conversation inaccessible. Réessayez plus tard.
        </div>
      )}

      {convStatus === 'ready' && conversation && user && (
        <>
          <header style={headerStyle}>
            <span aria-hidden="true" style={avatarStyle}>
              {initials(otherId)}
            </span>
            <div>
              <h1 style={titleStyle}>Conversation avec {otherId.slice(0, 8)}…</h1>
              <p style={subtitleStyle}>Échanges privés — RLS stricte côté serveur.</p>
            </div>
          </header>

          {errorText && (
            <div role="alert" style={errorBoxStyle}>
              {errorText}
            </div>
          )}

          {status === 'loading' && (
            <p style={{ color: 'var(--mn-text-3)' }} role="status" aria-live="polite">
              Chargement des messages…
            </p>
          )}

          {status === 'ready' && messages.length === 0 && (
            <p style={{ color: 'var(--mn-text-3)', textAlign: 'center', margin: '20px 0' }}>
              Aucun message pour l&apos;instant. Lancez la discussion !
            </p>
          )}

          {status === 'ready' && messages.length > 0 && (
            <ul
              aria-label="Fil des messages"
              style={{
                ...threadStyle,
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              {messages.map((message) => {
                const self = message.sender_id === user.id;
                return (
                  <li
                    key={message.id}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <div style={self ? bubbleSelfStyle : bubbleOtherStyle}>{message.body}</div>
                    <div
                      style={{
                        ...bubbleMetaStyle,
                        textAlign: self ? 'right' : 'left',
                      }}
                    >
                      {formatDate(message.created_at)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <form onSubmit={handleSubmit} style={formStyle} aria-label="Envoyer un message">
            <label
              htmlFor="message-body"
              style={{ fontSize: 13, fontWeight: 700, color: 'var(--mn-text-2)' }}
            >
              Votre message
            </label>
            <textarea
              id="message-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Tapez votre message…"
              maxLength={MESSAGE_BODY_MAX}
              style={textareaStyle}
              required
              aria-invalid={Boolean(fieldError)}
            />
            {fieldError && <span style={errorTextStyle}>{fieldError}</span>}
            {globalError && (
              <div role="alert" style={errorBoxStyle}>
                {globalError}
              </div>
            )}
            <button
              type="submit"
              disabled={busy}
              aria-busy={busy || undefined}
              style={busy ? submitDisabledStyle : submitStyle}
            >
              <IconMail width={14} height={14} />
              {busy ? 'Envoi…' : 'Envoyer'}
            </button>
          </form>
        </>
      )}
    </main>
  );
}
