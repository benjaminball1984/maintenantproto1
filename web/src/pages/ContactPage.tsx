import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { IconArrowLeft, IconMail } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  findOrCreateConversation,
  MESSAGE_BODY_MAX,
  MESSAGE_BODY_MIN,
  sendMessage,
} from '@/lib/messaging';
import { postgrestErrorMessage } from '@/lib/postgrestError';

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

const titleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(22px, 3.5vw, 30px)',
  fontWeight: 800,
  margin: '0 0 12px',
  letterSpacing: '-0.02em',
  color: 'var(--mn-text-1)',
};

const leadStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: '0 0 24px',
};

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 20,
  padding: 24,
};

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const labelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--mn-text-2)',
};

const helpStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--mn-text-3)',
};

const inputStyle: CSSProperties = {
  height: 44,
  padding: '0 12px',
  borderRadius: 10,
  border: '1.5px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  fontSize: 14,
  color: 'var(--mn-text-1)',
  fontFamily: 'inherit',
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  height: 'auto',
  minHeight: 160,
  padding: 12,
  resize: 'vertical',
  lineHeight: 1.55,
};

const errorTextStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--mn-danger)',
};

const submitStyle: CSSProperties = {
  height: 48,
  border: 'none',
  borderRadius: 12,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
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

const successBoxStyle: CSSProperties = {
  background: '#ecfdf5',
  borderRadius: 12,
  padding: '12px 16px',
  color: '#065f46',
  border: '1px solid #a7f3d0',
};

const errorBoxStyle: CSSProperties = {
  background: '#fef2f2',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--mn-danger)',
  border: '1px solid #fecaca',
};

const mailtoBoxStyle: CSSProperties = {
  marginTop: 24,
  fontSize: 13,
  color: 'var(--mn-text-3)',
  borderTop: '1px solid var(--mn-border)',
  paddingTop: 16,
};

const SUPPORT_FALLBACK_EMAIL = 'contact@maintenant.org';

const supportUserId = ((import.meta.env.VITE_SUPPORT_USER_ID as string | undefined) ?? '').trim();
const supportEmail = (
  (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined) ?? SUPPORT_FALLBACK_EMAIL
).trim();

export default function ContactPage() {
  const { user, status: authStatus } = useAuth();
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const mailtoHref = (() => {
    const params = new URLSearchParams();
    if (subject.trim()) params.set('subject', subject.trim());
    if (body.trim()) params.set('body', body.trim());
    const query = params.toString();
    return query ? `mailto:${supportEmail}?${query}` : `mailto:${supportEmail}`;
  })();

  const canSendInApp = authStatus === 'authenticated' && Boolean(user) && Boolean(supportUserId);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !supportUserId) return;
    setBusy(true);
    setBodyError(null);
    setGlobalError(null);
    setSuccessText(null);

    const trimmedBody = body.trim();
    const trimmedSubject = subject.trim();
    const composed = trimmedSubject
      ? `${trimmedSubject}\n\n${trimmedBody}`
      : trimmedBody;
    if (composed.length < MESSAGE_BODY_MIN || composed.length > MESSAGE_BODY_MAX) {
      setBodyError(
        `Le message doit faire entre ${MESSAGE_BODY_MIN} et ${MESSAGE_BODY_MAX} caractères.`,
      );
      setBusy(false);
      return;
    }

    const { data: conversation, error: convError } = await findOrCreateConversation(
      user.id,
      supportUserId,
    );
    if (convError || !conversation) {
      setGlobalError(
        postgrestErrorMessage(convError) ??
          'Impossible d’ouvrir une conversation. Utilisez le lien email ci-dessous.',
      );
      setBusy(false);
      return;
    }
    const { error: sendError } = await sendMessage({
      conversationId: conversation.id,
      senderId: user.id,
      body: composed,
    });
    setBusy(false);
    if (sendError) {
      setGlobalError(
        postgrestErrorMessage(sendError) ??
          'Impossible d’envoyer le message. Utilisez le lien email ci-dessous.',
      );
      return;
    }
    setSubject('');
    setBody('');
    setSuccessText(
      'Message envoyé. Vous pouvez retrouver la conversation dans votre messagerie.',
    );
  };

  return (
    <main style={pageStyle}>
      <Link to="/legal/notice" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux mentions légales
      </Link>
      <h1 style={titleStyle}>Nous contacter</h1>
      <p style={leadStyle}>
        Une question, un signalement, une demande d’exercice de vos droits RGPD ?
        Écrivez-nous via le formulaire ci-dessous (transmis à l’équipe support) ou par
        email à <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
      </p>

      <form onSubmit={handleSubmit} style={formStyle} aria-label="Formulaire de contact" noValidate>
        {globalError ? (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        ) : null}
        {successText ? (
          <div role="status" style={successBoxStyle}>
            {successText}
          </div>
        ) : null}

        <div style={fieldStyle}>
          <label htmlFor="contact-subject" style={labelStyle}>
            Sujet (facultatif)
          </label>
          <input
            id="contact-subject"
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            style={inputStyle}
            placeholder="Sujet de votre message"
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="contact-body" style={labelStyle}>
            Message
          </label>
          <textarea
            id="contact-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
            style={textareaStyle}
            aria-invalid={Boolean(bodyError)}
            maxLength={MESSAGE_BODY_MAX + 50}
          />
          <span style={helpStyle}>
            Entre {MESSAGE_BODY_MIN} et {MESSAGE_BODY_MAX} caractères. Ne partagez aucun
            identifiant, mot de passe ou information bancaire dans ce formulaire.
          </span>
          {bodyError ? <span style={errorTextStyle}>{bodyError}</span> : null}
        </div>

        {canSendInApp ? (
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy || undefined}
            style={busy ? submitDisabledStyle : submitStyle}
          >
            <IconMail width={14} height={14} />
            {busy ? 'Envoi…' : 'Envoyer via la messagerie interne'}
          </button>
        ) : (
          <a href={mailtoHref} style={submitStyle}>
            <IconMail width={14} height={14} />
            Envoyer par email
          </a>
        )}
      </form>

      <p style={mailtoBoxStyle}>
        Vous préférez écrire directement par email ?{' '}
        <a href={mailtoHref}>{supportEmail}</a> répond en moins de 72 h ouvrées.
      </p>
    </main>
  );
}
