import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
} from 'react';
import { Link } from 'react-router-dom';

import {
  IconBadge,
  IconCalendar,
  IconCheck,
  IconCheckCircle,
  IconClose,
  IconEdit,
  IconList,
  IconPen,
  IconUpload,
  IconUser,
} from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import {
  AVATAR_ACCEPTED_TYPES,
  AVATAR_MAX_BYTES,
  fetchProfileActivity,
  fetchProfileStats,
  uploadAvatar,
  type ProfileActivityItem,
  type ProfileActivityKind,
  type ProfileStats,
  type UserUpdate,
} from '@/lib/profile';
import { useProfile } from '@/hooks/useProfile';

const containerStyle: CSSProperties = {
  maxWidth: 920,
  margin: '0 auto',
  padding: '32px 20px 80px',
};

const headerCardStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 20,
  padding: '28px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 20,
  alignItems: 'center',
};

const avatarWrapperStyle: CSSProperties = {
  position: 'relative',
  width: 96,
  height: 96,
  borderRadius: '50%',
  background: 'var(--mn-gradient)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontWeight: 800,
  fontSize: 36,
  overflow: 'hidden',
  flexShrink: 0,
};

const avatarImgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const avatarLabelStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.4)',
  color: '#ffffff',
  cursor: 'pointer',
  opacity: 0,
  transition: 'opacity 0.15s',
  borderRadius: '50%',
};

const summaryStyle: CSSProperties = {
  flex: 1,
  minWidth: 220,
};

const nameStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 24,
  fontWeight: 800,
  color: 'var(--mn-text-1)',
  margin: '0 0 4px',
  letterSpacing: '-0.02em',
};

const emailStyle: CSSProperties = {
  fontSize: 14,
  color: 'var(--mn-text-3)',
  margin: 0,
};

const sectionStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 16,
  padding: 24,
  marginTop: 20,
};

const sectionTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--mn-text-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 14px',
};

const fieldsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 16,
};

const fieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--mn-text-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const valueStyle: CSSProperties = {
  fontSize: 15,
  color: 'var(--mn-text-1)',
  margin: 0,
  lineHeight: 1.5,
};

const inputStyle: CSSProperties = {
  width: '100%',
  minHeight: 44,
  border: '1.5px solid var(--mn-border)',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 15,
  fontFamily: 'Inter, sans-serif',
  color: 'var(--mn-text-1)',
  background: 'var(--mn-bg)',
  outline: 'none',
  boxSizing: 'border-box',
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 96,
  resize: 'vertical',
  padding: '12px',
};

const buttonRowStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  marginTop: 18,
};

const primaryBtnStyle: CSSProperties = {
  minHeight: 44,
  padding: '0 18px',
  border: 'none',
  borderRadius: 10,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

const secondaryBtnStyle: CSSProperties = {
  minHeight: 44,
  padding: '0 18px',
  border: '1.5px solid var(--mn-border)',
  borderRadius: 10,
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-1)',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

const messageBaseStyle: CSSProperties = {
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 13,
  lineHeight: 1.5,
  margin: '12px 0 0',
};

const errorBoxStyle: CSSProperties = {
  ...messageBaseStyle,
  background: '#FEF2F2',
  color: 'var(--mn-danger)',
  border: '1px solid #FECACA',
};

const successBoxStyle: CSSProperties = {
  ...messageBaseStyle,
  background: '#F0FDF4',
  color: 'var(--mn-success)',
  border: '1px solid #BBF7D0',
};

const walletStyle: CSSProperties = {
  ...sectionStyle,
  background: 'var(--mn-text-1)',
  color: '#ffffff',
  border: 'none',
};

const walletLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  margin: '0 0 8px',
  color: 'rgba(255,255,255,0.55)',
};

const walletBalanceStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 42,
  fontWeight: 800,
  lineHeight: 1,
  margin: 0,
};

const badgeListStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 12,
};

const badgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  borderRadius: 999,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
  fontSize: 12,
  fontWeight: 700,
};

// Étape 37 — Badges contribution + historique d'activité.
const statsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: 12,
  margin: 0,
  padding: 0,
  listStyle: 'none',
};

const statCardStyle: CSSProperties = {
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  borderRadius: 12,
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const statValueStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 24,
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: 'var(--mn-text-1)',
  margin: 0,
  lineHeight: 1.1,
};

const statLabelStyle: CSSProperties = {
  fontSize: 13,
  color: 'var(--mn-text-2)',
  margin: 0,
};

const activityListStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const activityItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: '12px 14px',
  borderRadius: 10,
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
};

const activityIconStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 8,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
  flexShrink: 0,
};

const activityBodyStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const activityKindStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--mn-text-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  margin: 0,
};

const activityLabelStyle: CSSProperties = {
  fontSize: 14,
  color: 'var(--mn-text-1)',
  margin: 0,
  lineHeight: 1.4,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const activityDateStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--mn-text-3)',
  margin: 0,
};

interface ProfileFormState {
  display_name: string;
  bio: string;
  city: string;
  postal_code: string;
}

const initialFormState: ProfileFormState = {
  display_name: '',
  bio: '',
  city: '',
  postal_code: '',
};

function formatMemberSince(value: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function badgesFromJson(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((entry): entry is string => typeof entry === 'string');
}

function formatActivityDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

const ACTIVITY_KIND_LABEL: Record<ProfileActivityKind, string> = {
  signature: 'Pétition signée',
  participation: 'Mobilisation rejointe',
  vote: 'Vote émis',
  post: 'Publication',
};

function ActivityKindIcon({ kind }: { kind: ProfileActivityKind }) {
  switch (kind) {
    case 'signature':
      return <IconCheckCircle width={16} height={16} />;
    case 'participation':
      return <IconCalendar width={16} height={16} />;
    case 'vote':
      return <IconList width={16} height={16} />;
    case 'post':
      return <IconPen width={16} height={16} />;
  }
}

function activityHref(item: ProfileActivityItem): string | null {
  if (!item.slug) return null;
  switch (item.kind) {
    case 'signature':
      return `/petitions/${item.slug}`;
    case 'participation':
      return `/mobilisations/${item.slug}`;
    case 'vote':
      return `/sondages/${item.slug}`;
    case 'post':
      return null;
  }
}

type StatsState =
  | { kind: 'loading' }
  | { kind: 'success'; stats: ProfileStats }
  | { kind: 'error' };

type ActivityState =
  | { kind: 'loading' }
  | { kind: 'success'; items: ProfileActivityItem[] }
  | { kind: 'error' };

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, status, error: loadError, update, refresh } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading'>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
  const formErrorId = useId();
  const [statsState, setStatsState] = useState<StatsState>({ kind: 'loading' });
  const [activityState, setActivityState] = useState<ActivityState>({ kind: 'loading' });

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchProfileStats(userId)
      .then((result) => {
        if (cancelled) return;
        if (result.error || !result.data) {
          setStatsState({ kind: 'error' });
        } else {
          setStatsState({ kind: 'success', stats: result.data });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setStatsState({ kind: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchProfileActivity(userId, 10)
      .then((result) => {
        if (cancelled) return;
        if (result.error || !result.data) {
          setActivityState({ kind: 'error' });
        } else {
          setActivityState({ kind: 'success', items: result.data });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setActivityState({ kind: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Synchronise le formulaire avec le profil en mode lecture (pattern
  // « set state during render » : compatible react-hooks/set-state-in-effect).
  const syncKey = `${editing ? '1' : '0'}|${profile?.id ?? ''}|${profile?.updated_at ?? ''}`;
  const [trackedSyncKey, setTrackedSyncKey] = useState(syncKey);
  if (!editing && profile && trackedSyncKey !== syncKey) {
    setTrackedSyncKey(syncKey);
    setForm({
      display_name: profile.display_name ?? '',
      bio: profile.bio ?? '',
      city: profile.city ?? '',
      postal_code: profile.postal_code ?? '',
    });
  }

  const badges = useMemo(() => badgesFromJson(profile?.badges), [profile?.badges]);

  if (status === 'loading' || status === 'idle') {
    return (
      <div style={containerStyle}>
        <p style={{ color: 'var(--mn-text-3)' }} role="status">
          Chargement du profil…
        </p>
      </div>
    );
  }

  if (status === 'error' && !profile) {
    return (
      <div style={containerStyle}>
        <div style={errorBoxStyle} role="alert">
          {postgrestErrorMessage(loadError) ?? 'Impossible de charger le profil.'}
        </div>
        <button type="button" style={secondaryBtnStyle} onClick={() => void refresh()}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div style={containerStyle}>
        <p style={{ color: 'var(--mn-text-3)' }}>Profil indisponible.</p>
      </div>
    );
  }

  const startEdit = () => {
    setForm({
      display_name: profile.display_name ?? '',
      bio: profile.bio ?? '',
      city: profile.city ?? '',
      postal_code: profile.postal_code ?? '',
    });
    setFormError(null);
    setFormSuccess(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setFormError(null);
    setFormSuccess(null);
    setPendingAvatarUrl(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const trimmed = form.display_name.trim();
    if (!trimmed) {
      setFormError('Le nom d’affichage est obligatoire.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    const patch: UserUpdate = {
      display_name: trimmed,
      bio: form.bio.trim() || null,
      city: form.city.trim() || null,
      postal_code: form.postal_code.trim() || null,
    };
    const { error: updateError } = await update(patch);
    setSubmitting(false);
    if (updateError) {
      setFormError(postgrestErrorMessage(updateError));
      return;
    }
    setFormSuccess('Profil mis à jour.');
    setEditing(false);
    setPendingAvatarUrl(null);
  };

  const triggerFilePicker = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFormError(null);
    setFormSuccess(null);
    setPendingAvatarUrl(URL.createObjectURL(file));
    setUploadStatus('uploading');
    const { data: uploadData, error: uploadError } = await uploadAvatar(user.id, file);
    if (uploadError || !uploadData) {
      setUploadStatus('idle');
      setPendingAvatarUrl(null);
      setFormError(postgrestErrorMessage(uploadError));
      return;
    }
    const { error: updateError } = await update({ avatar_url: uploadData.publicUrl });
    setUploadStatus('idle');
    if (updateError) {
      setFormError(postgrestErrorMessage(updateError));
      setPendingAvatarUrl(null);
      return;
    }
    setFormSuccess('Avatar mis à jour.');
    setPendingAvatarUrl(null);
  };

  const avatarSrc = pendingAvatarUrl ?? profile.avatar_url;
  const initial = (profile.display_name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase();

  return (
    <div style={containerStyle}>
      <div style={headerCardStyle}>
        <div
          style={avatarWrapperStyle}
          onMouseEnter={(e) => {
            const label = e.currentTarget.querySelector<HTMLLabelElement>('label');
            if (label) label.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            const label = e.currentTarget.querySelector<HTMLLabelElement>('label');
            if (label) label.style.opacity = '0';
          }}
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt="" style={avatarImgStyle} />
          ) : (
            <span aria-hidden="true">{initial}</span>
          )}
          <label
            htmlFor="profile-avatar-input"
            style={avatarLabelStyle}
            aria-label="Changer la photo de profil"
          >
            <IconUpload width={20} height={20} />
          </label>
          <input
            ref={fileInputRef}
            id="profile-avatar-input"
            type="file"
            accept={AVATAR_ACCEPTED_TYPES.join(',')}
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
            aria-describedby={formError ? formErrorId : undefined}
          />
        </div>
        <div style={summaryStyle}>
          <h1 style={nameStyle}>{profile.display_name}</h1>
          <p style={emailStyle}>
            <IconUser width={14} height={14} />
            <span style={{ marginLeft: 6 }}>{profile.email}</span>
          </p>
          {profile.bio ? <p style={{ ...valueStyle, marginTop: 12 }}>{profile.bio}</p> : null}
          {badges.length > 0 ? (
            <div style={badgeListStyle} aria-label="Badges">
              {badges.map((badge) => (
                <span key={badge} style={badgeStyle}>
                  <IconBadge width={12} height={12} />
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {!editing ? (
          <button
            type="button"
            style={primaryBtnStyle}
            onClick={startEdit}
            aria-label="Modifier le profil"
          >
            <IconEdit /> Modifier
          </button>
        ) : (
          <button
            type="button"
            style={secondaryBtnStyle}
            onClick={triggerFilePicker}
            disabled={uploadStatus === 'uploading'}
          >
            <IconUpload />
            {uploadStatus === 'uploading' ? 'Envoi…' : 'Changer l’avatar'}
          </button>
        )}
      </div>

      <section style={sectionStyle} aria-labelledby="profile-info-title">
        <h2 id="profile-info-title" style={sectionTitleStyle}>
          Informations
        </h2>
        {editing ? (
          <form onSubmit={handleSubmit} noValidate>
            <div style={fieldsGridStyle}>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="profile-display-name">
                  Nom d’affichage *
                </label>
                <input
                  id="profile-display-name"
                  style={inputStyle}
                  value={form.display_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, display_name: e.target.value }))}
                  required
                  aria-describedby={formError ? formErrorId : undefined}
                  autoComplete="name"
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="profile-city">
                  Ville
                </label>
                <input
                  id="profile-city"
                  style={inputStyle}
                  value={form.city}
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  autoComplete="address-level2"
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="profile-postal-code">
                  Code postal
                </label>
                <input
                  id="profile-postal-code"
                  style={inputStyle}
                  value={form.postal_code}
                  onChange={(e) => setForm((prev) => ({ ...prev, postal_code: e.target.value }))}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="postal-code"
                />
              </div>
            </div>
            <div style={{ ...fieldStyle, marginTop: 16 }}>
              <label style={labelStyle} htmlFor="profile-bio">
                Présentation
              </label>
              <textarea
                id="profile-bio"
                style={textareaStyle}
                value={form.bio}
                onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                rows={4}
              />
            </div>
            {formError ? (
              <div id={formErrorId} role="alert" style={errorBoxStyle}>
                {formError}
              </div>
            ) : null}
            {formSuccess ? (
              <div role="status" style={successBoxStyle}>
                {formSuccess}
              </div>
            ) : null}
            <div style={buttonRowStyle}>
              <button type="submit" style={primaryBtnStyle} disabled={submitting}>
                <IconCheck />
                {submitting ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button
                type="button"
                style={secondaryBtnStyle}
                onClick={cancelEdit}
                disabled={submitting}
              >
                <IconClose />
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <>
            <div style={fieldsGridStyle}>
              <div style={fieldStyle}>
                <span style={labelStyle}>Ville</span>
                <p style={valueStyle}>{profile.city ?? '—'}</p>
              </div>
              <div style={fieldStyle}>
                <span style={labelStyle}>Code postal</span>
                <p style={valueStyle}>{profile.postal_code ?? '—'}</p>
              </div>
              <div style={fieldStyle}>
                <span style={labelStyle}>Membre depuis</span>
                <p style={valueStyle}>{formatMemberSince(profile.created_at)}</p>
              </div>
            </div>
            {formSuccess ? (
              <div role="status" style={successBoxStyle}>
                {formSuccess}
              </div>
            ) : null}
            {formError ? (
              <div role="alert" style={errorBoxStyle}>
                {formError}
              </div>
            ) : null}
          </>
        )}
        <p style={{ fontSize: 12, color: 'var(--mn-text-4)', marginTop: 16 }}>
          La taille maximale d’un avatar est de {Math.round(AVATAR_MAX_BYTES / 1024 / 1024)} Mo
          (JPEG, PNG, WebP ou GIF).
        </p>
      </section>

      <section style={walletStyle} aria-labelledby="profile-wallet-title">
        <h2 id="profile-wallet-title" style={walletLabelStyle}>
          Wallet T99CP
        </h2>
        <p style={walletBalanceStyle}>{profile.t99cp_balance}</p>
        <p style={{ marginTop: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          T99CP — monnaie solidaire du mouvement.
        </p>
      </section>

      <section style={sectionStyle} aria-labelledby="profile-stats-title">
        <h2 id="profile-stats-title" style={sectionTitleStyle}>
          Contributions
        </h2>
        {statsState.kind === 'loading' && (
          <p style={{ color: 'var(--mn-text-3)', margin: 0 }} role="status">
            Chargement des compteurs…
          </p>
        )}
        {statsState.kind === 'error' && (
          <p style={{ color: 'var(--mn-text-3)', margin: 0 }} role="status">
            Compteurs indisponibles pour le moment.
          </p>
        )}
        {statsState.kind === 'success' && (
          <ul style={statsGridStyle} aria-label="Mes contributions">
            <li style={statCardStyle}>
              <p style={statValueStyle}>{statsState.stats.signatures}</p>
              <p style={statLabelStyle}>Pétitions signées</p>
            </li>
            <li style={statCardStyle}>
              <p style={statValueStyle}>{statsState.stats.participations}</p>
              <p style={statLabelStyle}>Mobilisations rejointes</p>
            </li>
            <li style={statCardStyle}>
              <p style={statValueStyle}>{statsState.stats.votes}</p>
              <p style={statLabelStyle}>Votes émis</p>
            </li>
            <li style={statCardStyle}>
              <p style={statValueStyle}>{statsState.stats.posts}</p>
              <p style={statLabelStyle}>Publications</p>
            </li>
          </ul>
        )}
      </section>

      <section style={sectionStyle} aria-labelledby="profile-activity-title">
        <h2 id="profile-activity-title" style={sectionTitleStyle}>
          Activité récente
        </h2>
        {activityState.kind === 'loading' && (
          <p style={{ color: 'var(--mn-text-3)', margin: 0 }} role="status">
            Chargement de l’historique…
          </p>
        )}
        {activityState.kind === 'error' && (
          <p style={{ color: 'var(--mn-text-3)', margin: 0 }} role="status">
            Historique indisponible pour le moment.
          </p>
        )}
        {activityState.kind === 'success' && activityState.items.length === 0 && (
          <p style={{ color: 'var(--mn-text-3)', margin: 0 }}>
            Aucune action enregistrée pour l’instant. Vos signatures, RSVP,
            votes et publications apparaîtront ici dès la première contribution.
          </p>
        )}
        {activityState.kind === 'success' && activityState.items.length > 0 && (
          <ul style={activityListStyle} aria-label="10 dernières actions">
            {activityState.items.map((item) => {
              const href = activityHref(item);
              return (
                <li key={`${item.kind}-${item.id}`} style={activityItemStyle}>
                  <span style={activityIconStyle} aria-hidden="true">
                    <ActivityKindIcon kind={item.kind} />
                  </span>
                  <div style={activityBodyStyle}>
                    <p style={activityKindStyle}>{ACTIVITY_KIND_LABEL[item.kind]}</p>
                    <p style={activityLabelStyle}>
                      {href ? <Link to={href}>{item.label}</Link> : item.label}
                    </p>
                    <p style={activityDateStyle}>{formatActivityDate(item.createdAt)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
