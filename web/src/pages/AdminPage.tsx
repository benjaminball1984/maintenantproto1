import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { IconCheck, IconFlame, IconList, IconMail, IconUsers } from '@/components/icons';
import { useAdminFlagged } from '@/hooks/useAdminFlagged';
import { useEmailCampaigns } from '@/hooks/useEmailCampaigns';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAuth } from '@/lib/auth';
import {
  createEmailCampaign,
  deleteFlaggedItem,
  EMAIL_BODY_MIN,
  EMAIL_SUBJECT_MIN,
  logAdminAction,
  unflagItem,
  validateEmailCampaignInput,
  type CreateEmailCampaignField,
  type CreateEmailCampaignInput,
  type FlaggedItem,
} from '@/lib/admin';
import { postgrestErrorMessage } from '@/lib/postgrestError';

const pageStyle: CSSProperties = {
  maxWidth: 1080,
  margin: '0 auto',
  padding: '32px 20px 80px',
};

const headerStyle: CSSProperties = {
  marginBottom: 24,
};

const titleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(24px, 4vw, 32px)',
  fontWeight: 800,
  margin: '0 0 4px',
  letterSpacing: '-0.02em',
  color: 'var(--mn-text-1)',
};

const subtitleStyle: CSSProperties = {
  fontSize: 14,
  color: 'var(--mn-text-3)',
  margin: 0,
};

const tabBarStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  marginBottom: 20,
  borderBottom: '1px solid var(--mn-border)',
  paddingBottom: 6,
};

const tabBtnStyle: CSSProperties = {
  height: 38,
  padding: '0 14px',
  borderRadius: 10,
  border: '1px solid transparent',
  background: 'transparent',
  color: 'var(--mn-text-2)',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'inherit',
};

const tabBtnActiveStyle: CSSProperties = {
  ...tabBtnStyle,
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  color: 'var(--mn-text-1)',
};

const sectionStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
};

const itemStyle: CSSProperties = {
  padding: '14px 0',
  borderBottom: '1px solid var(--mn-border)',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const kindStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--mn-brand-dark)',
  background: 'var(--mn-brand-light)',
  padding: '2px 8px',
  borderRadius: 999,
  alignSelf: 'flex-start',
};

const bodyStyle: CSSProperties = {
  fontSize: 14,
  color: 'var(--mn-text-2)',
  margin: 0,
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
};

const actionRowStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

const smallBtnStyle: CSSProperties = {
  height: 32,
  padding: '0 12px',
  borderRadius: 8,
  border: '1px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-2)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'inherit',
};

const dangerBtnStyle: CSSProperties = {
  ...smallBtnStyle,
  color: 'var(--mn-danger)',
  borderColor: '#fecaca',
};

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
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
  height: 40,
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
  minHeight: 120,
  padding: 12,
  resize: 'vertical',
  lineHeight: 1.55,
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

const submitBtnStyle: CSSProperties = {
  height: 42,
  padding: '0 16px',
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
  alignSelf: 'flex-start',
};

type Tab = 'moderation' | 'communes' | 'email';

type CampaignErrors = Partial<Record<CreateEmailCampaignField, string>>;

function FlaggedRow({
  item,
  onAction,
}: {
  item: FlaggedItem;
  onAction: () => void;
}) {
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleUnflag = async () => {
    if (!user || busy) return;
    setBusy(true);
    setError(null);
    const { error: err } = await unflagItem(item.kind, item.id);
    if (err) {
      setError(postgrestErrorMessage(err) ?? 'Action impossible.');
      setBusy(false);
      return;
    }
    await logAdminAction({
      actorId: user.id,
      action: 'moderate.unflag',
      targetTable: item.kind === 'article' ? 'articles' : `${item.kind}s`,
      targetId: item.id,
    });
    setBusy(false);
    onAction();
  };

  const handleDelete = async () => {
    if (!user || busy) return;
    setBusy(true);
    setError(null);
    const { error: err } = await deleteFlaggedItem(item.kind, item.id);
    if (err) {
      setError(postgrestErrorMessage(err) ?? 'Action impossible.');
      setBusy(false);
      return;
    }
    await logAdminAction({
      actorId: user.id,
      action: 'moderate.delete',
      targetTable: item.kind === 'article' ? 'articles' : `${item.kind}s`,
      targetId: item.id,
    });
    setBusy(false);
    onAction();
  };

  return (
    <li style={itemStyle}>
      <span style={kindStyle}>{item.kind.replace('_', ' ')}</span>
      {item.title ? (
        <strong style={{ fontSize: 14, color: 'var(--mn-text-1)' }}>{item.title}</strong>
      ) : null}
      <p style={bodyStyle}>{item.body.slice(0, 600)}</p>
      <small style={{ fontSize: 11, color: 'var(--mn-text-3)' }}>
        {new Date(item.createdAt).toLocaleString('fr-FR')}
      </small>
      {error ? (
        <div role="alert" style={errorBoxStyle}>
          {error}
        </div>
      ) : null}
      <div style={actionRowStyle}>
        <button
          type="button"
          onClick={handleUnflag}
          disabled={busy}
          style={smallBtnStyle}
          aria-busy={busy || undefined}
        >
          <IconCheck width={12} height={12} />
          Lever le flag
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          style={dangerBtnStyle}
          aria-busy={busy || undefined}
        >
          Supprimer
        </button>
        {item.kind === 'article' && item.slug ? (
          <Link to={`/media/${item.slug}`} style={smallBtnStyle}>
            Voir l&apos;article
          </Link>
        ) : null}
      </div>
    </li>
  );
}

function ModerationPanel({ enabled }: { enabled: boolean }) {
  const { items, status, error, refresh } = useAdminFlagged(enabled);
  const errorText = postgrestErrorMessage(error);

  return (
    <section style={sectionStyle} aria-labelledby="moderation-title">
      <h2
        id="moderation-title"
        style={{ marginTop: 0, marginBottom: 12, fontFamily: "'Sora', sans-serif" }}
      >
        File de modération
      </h2>
      {errorText ? (
        <div role="alert" style={errorBoxStyle}>
          {errorText}
        </div>
      ) : null}
      {status === 'loading' ? (
        <p style={{ color: 'var(--mn-text-3)' }} role="status" aria-live="polite">
          Chargement…
        </p>
      ) : null}
      {status === 'ready' && items.length === 0 ? (
        <p style={{ color: 'var(--mn-text-3)', fontSize: 14 }}>
          Aucun contenu en attente de modération.
        </p>
      ) : null}
      {status === 'ready' && items.length > 0 ? (
        <ul
          aria-label="Contenus modérés"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {items.map((item) => (
            <FlaggedRow
              key={`${item.kind}:${item.id}`}
              item={item}
              onAction={() => {
                void refresh();
              }}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function CommunesPanel() {
  return (
    <section style={sectionStyle} aria-labelledby="admin-communes-title">
      <h2
        id="admin-communes-title"
        style={{
          marginTop: 0,
          marginBottom: 12,
          fontFamily: "'Sora', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <IconUsers width={18} height={18} />
        Communes libres
      </h2>
      <p style={{ fontSize: 14, color: 'var(--mn-text-2)', lineHeight: 1.55 }}>
        Vous pouvez créer une nouvelle commune ou consulter la liste publique pour
        gérer les membres existants.
      </p>
      <div style={actionRowStyle}>
        <Link to="/communes/new" style={submitBtnStyle}>
          Créer une commune
        </Link>
        <Link to="/communes" style={smallBtnStyle}>
          <IconList width={14} height={14} />
          Voir la liste
        </Link>
      </div>
    </section>
  );
}

function EmailCampaignForm({
  enabled,
  onCreated,
}: {
  enabled: boolean;
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const [subject, setSubject] = useState<string>('');
  const [audience, setAudience] = useState<string>('members');
  const [bodyHtml, setBodyHtml] = useState<string>('');
  const [errors, setErrors] = useState<CampaignErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !enabled) return;
    setBusy(true);
    setErrors({});
    setGlobalError(null);

    const input: CreateEmailCampaignInput = {
      authorId: user.id,
      subject,
      bodyHtml,
      audience,
    };
    const issues = validateEmailCampaignInput(input);
    if (issues.length > 0) {
      const nextErrors: CampaignErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await createEmailCampaign(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ?? 'Impossible de créer la campagne.',
      );
      setBusy(false);
      return;
    }
    await logAdminAction({
      actorId: user.id,
      action: 'email_campaign.create',
      targetTable: 'email_campaigns',
      targetId: data.id,
      payload: { subject: data.subject, audience: data.audience },
    });
    setSubject('');
    setBodyHtml('');
    setBusy(false);
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle} aria-label="Nouvelle campagne email">
      {globalError ? (
        <div role="alert" style={errorBoxStyle}>
          {globalError}
        </div>
      ) : null}
      <div style={fieldStyle}>
        <label htmlFor="campaign-subject" style={labelStyle}>
          Sujet
        </label>
        <input
          id="campaign-subject"
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          required
          style={inputStyle}
          aria-invalid={Boolean(errors.subject)}
        />
        <span style={helpStyle}>Au moins {EMAIL_SUBJECT_MIN} caractères.</span>
        {errors.subject ? <span style={errorTextStyle}>{errors.subject}</span> : null}
      </div>
      <div style={fieldStyle}>
        <label htmlFor="campaign-audience" style={labelStyle}>
          Audience
        </label>
        <input
          id="campaign-audience"
          type="text"
          value={audience}
          onChange={(event) => setAudience(event.target.value)}
          required
          style={inputStyle}
          aria-invalid={Boolean(errors.audience)}
        />
        <span style={helpStyle}>
          Étiquette d&apos;audience (ex. <code>members</code>, <code>adherents</code>).
        </span>
        {errors.audience ? <span style={errorTextStyle}>{errors.audience}</span> : null}
      </div>
      <div style={fieldStyle}>
        <label htmlFor="campaign-body" style={labelStyle}>
          Corps HTML
        </label>
        <textarea
          id="campaign-body"
          value={bodyHtml}
          onChange={(event) => setBodyHtml(event.target.value)}
          required
          style={textareaStyle}
          aria-invalid={Boolean(errors.bodyHtml)}
        />
        <span style={helpStyle}>Au moins {EMAIL_BODY_MIN} caractères.</span>
        {errors.bodyHtml ? <span style={errorTextStyle}>{errors.bodyHtml}</span> : null}
      </div>
      <button
        type="submit"
        disabled={busy || !enabled}
        style={submitBtnStyle}
        aria-busy={busy || undefined}
      >
        <IconMail width={14} height={14} />
        {busy ? 'Création…' : 'Créer le brouillon'}
      </button>
    </form>
  );
}

function EmailCampaignsPanel({ enabled }: { enabled: boolean }) {
  const { campaigns, status, error, refresh } = useEmailCampaigns(enabled);
  const errorText = postgrestErrorMessage(error);

  return (
    <section style={sectionStyle} aria-labelledby="email-title">
      <h2
        id="email-title"
        style={{
          marginTop: 0,
          marginBottom: 12,
          fontFamily: "'Sora', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <IconMail width={18} height={18} />
        Campagnes email
      </h2>
      <EmailCampaignForm
        enabled={enabled}
        onCreated={() => {
          void refresh();
        }}
      />
      <div style={{ marginTop: 18 }}>
        {errorText ? (
          <div role="alert" style={errorBoxStyle}>
            {errorText}
          </div>
        ) : null}
        {status === 'loading' ? (
          <p style={{ color: 'var(--mn-text-3)' }} role="status" aria-live="polite">
            Chargement des campagnes…
          </p>
        ) : null}
        {status === 'ready' && campaigns.length === 0 ? (
          <p style={{ color: 'var(--mn-text-3)', fontSize: 14 }}>
            Aucune campagne. Créez le premier brouillon ci-dessus.
          </p>
        ) : null}
        {status === 'ready' && campaigns.length > 0 ? (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {campaigns.map((campaign) => (
              <li key={campaign.id} style={itemStyle}>
                <strong style={{ fontSize: 14, color: 'var(--mn-text-1)' }}>
                  {campaign.subject}
                </strong>
                <span style={{ fontSize: 12, color: 'var(--mn-text-3)' }}>
                  {campaign.status} · audience {campaign.audience} ·{' '}
                  {new Date(campaign.created_at).toLocaleDateString('fr-FR')}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export default function AdminPage() {
  const { isAdmin, status: adminStatus } = useIsAdmin();
  const [tab, setTab] = useState<Tab>('moderation');
  const enabled = adminStatus === 'ready' && isAdmin;

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Panel admin</h1>
        <p style={subtitleStyle}>
          Modération des contenus signalés, gestion des communes et campagnes email.
          Toutes les actions sont historisées dans <code>admin_logs</code>.
        </p>
      </header>

      <nav aria-label="Sections admin" style={tabBarStyle}>
        <button
          type="button"
          onClick={() => setTab('moderation')}
          style={tab === 'moderation' ? tabBtnActiveStyle : tabBtnStyle}
        >
          <IconFlame width={14} height={14} />
          Modération
        </button>
        <button
          type="button"
          onClick={() => setTab('communes')}
          style={tab === 'communes' ? tabBtnActiveStyle : tabBtnStyle}
        >
          <IconUsers width={14} height={14} />
          Communes
        </button>
        <button
          type="button"
          onClick={() => setTab('email')}
          style={tab === 'email' ? tabBtnActiveStyle : tabBtnStyle}
        >
          <IconMail width={14} height={14} />
          Email
        </button>
      </nav>

      {tab === 'moderation' ? <ModerationPanel enabled={enabled} /> : null}
      {tab === 'communes' ? <CommunesPanel /> : null}
      {tab === 'email' ? <EmailCampaignsPanel enabled={enabled} /> : null}
    </main>
  );
}
