import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';

import { IconMegaphone, IconPen, IconSpark, IconUsers } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import {
  POST_BODY_MAX,
  POST_BODY_MIN,
  createPost,
  validatePostInput,
  type PostRow,
  type PostVisibility,
} from '@/lib/social';
import { usePosts } from '@/hooks/usePosts';
import { useFollowing } from '@/hooks/useFollowing';

const pageStyle: CSSProperties = {
  maxWidth: 760,
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
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'inherit',
});

const composerStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const composerLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--mn-text-2)',
};

const composerTextareaStyle: CSSProperties = {
  width: '100%',
  minHeight: 100,
  padding: 12,
  borderRadius: 12,
  border: '1.5px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  fontSize: 15,
  fontFamily: 'inherit',
  color: 'var(--mn-text-1)',
  resize: 'vertical',
};

const composerActionsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 12,
};

const selectStyle: CSSProperties = {
  height: 40,
  padding: '0 10px',
  borderRadius: 10,
  border: '1.5px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-1)',
  fontSize: 13,
  fontFamily: 'inherit',
};

const submitStyle: CSSProperties = {
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
  marginBottom: 16,
};

const cardStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 16,
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const cardHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 12,
  color: 'var(--mn-text-3)',
};

const cardBodyStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.55,
  color: 'var(--mn-text-1)',
  margin: 0,
  whiteSpace: 'pre-wrap',
};

const badgeStyle: CSSProperties = {
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
};

const emptyStyle: CSSProperties = {
  border: '1px dashed var(--mn-border)',
  borderRadius: 16,
  padding: '36px 20px',
  textAlign: 'center',
  color: 'var(--mn-text-3)',
  background: 'var(--mn-surface)',
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function PostCard({ post }: { post: PostRow }) {
  return (
    <article style={cardStyle}>
      <header style={cardHeaderStyle}>
        <span style={badgeStyle}>{post.visibility}</span>
        <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
      </header>
      <p style={cardBodyStyle}>{post.body}</p>
    </article>
  );
}

type FeedTab = 'all' | 'following';

export default function ReseauPage() {
  const { user, status: authStatus } = useAuth();
  const [tab, setTab] = useState<FeedTab>('all');
  const [composerBody, setComposerBody] = useState<string>('');
  const [composerVisibility, setComposerVisibility] = useState<PostVisibility>('public');
  const [composerError, setComposerError] = useState<string | null>(null);
  const [composerGlobalError, setComposerGlobalError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const { following } = useFollowing(user?.id);
  const followingIds = useMemo(
    () => (tab === 'following' ? following.map((f) => f.followee_id) : undefined),
    [tab, following],
  );

  const { posts, status, error, refresh } = usePosts({ authorIds: followingIds });
  const errorText = postgrestErrorMessage(error);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setComposerError(null);
    setComposerGlobalError(null);

    const input = {
      authorId: user.id,
      body: composerBody,
      visibility: composerVisibility,
    };
    const issues = validatePostInput(input);
    if (issues.length > 0) {
      setComposerError(issues[0]?.message ?? 'Post invalide.');
      setBusy(false);
      return;
    }

    const { error: createError } = await createPost(input);
    if (createError) {
      setComposerGlobalError(
        postgrestErrorMessage(createError) ??
          'Impossible de publier le post. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    setComposerBody('');
    setBusy(false);
    await refresh();
  };

  return (
    <main style={pageStyle}>
      <section style={heroStyle} aria-labelledby="reseau-title">
        <h1 id="reseau-title" style={heroTitleStyle}>
          Réseau militant
        </h1>
        <p style={heroLeadStyle}>
          Le fil interne du mouvement : annonces, témoignages, idées d&apos;action. Pas de
          publicité, pas de tracking, modération communautaire.
        </p>
      </section>

      <div role="tablist" aria-label="Filtre du feed" style={tabsStyle}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'all'}
          onClick={() => setTab('all')}
          style={tabStyle(tab === 'all')}
        >
          <IconMegaphone width={14} height={14} /> Tout
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'following'}
          onClick={() => setTab('following')}
          disabled={authStatus !== 'authenticated'}
          style={tabStyle(tab === 'following')}
        >
          <IconUsers width={14} height={14} /> Suivis
        </button>
      </div>

      {user && (
        <form onSubmit={handleSubmit} style={composerStyle} aria-label="Publier un post">
          <label htmlFor="post-body" style={composerLabelStyle}>
            Publier
          </label>
          <textarea
            id="post-body"
            value={composerBody}
            onChange={(event) => setComposerBody(event.target.value)}
            placeholder="Quoi de neuf ?"
            maxLength={POST_BODY_MAX}
            minLength={POST_BODY_MIN}
            style={composerTextareaStyle}
            required
            aria-invalid={Boolean(composerError)}
          />
          {composerError && <span style={errorTextStyle}>{composerError}</span>}
          {composerGlobalError && (
            <div role="alert" style={errorBoxStyle}>
              {composerGlobalError}
            </div>
          )}
          <div style={composerActionsStyle}>
            <label
              style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 13 }}
            >
              <span style={{ color: 'var(--mn-text-3)' }}>Visibilité</span>
              <select
                value={composerVisibility}
                onChange={(event) =>
                  setComposerVisibility(event.target.value as PostVisibility)
                }
                style={selectStyle}
                aria-label="Visibilité du post"
              >
                <option value="public">Publique</option>
                <option value="members">Adhérents</option>
                <option value="private">Privée (moi)</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={busy}
              aria-busy={busy || undefined}
              style={busy ? submitDisabledStyle : submitStyle}
            >
              <IconPen />
              {busy ? 'Publication…' : 'Publier'}
            </button>
          </div>
        </form>
      )}

      {errorText && (
        <div role="alert" style={errorBoxStyle}>
          {errorText}
        </div>
      )}

      {(status === 'loading' || status === 'idle') && (
        <p style={{ color: 'var(--mn-text-3)' }} role="status" aria-live="polite">
          Chargement du feed…
        </p>
      )}

      {status === 'ready' && posts.length === 0 && (
        <div style={emptyStyle} role="note">
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--mn-text-1)' }}>
            Aucun post pour le moment
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 14 }}>
            {tab === 'following'
              ? 'Suivez d’autres militants pour voir leurs posts ici.'
              : 'Soyez le premier à publier sur le réseau.'}
          </p>
        </div>
      )}

      {status === 'ready' && posts.length > 0 && (
        <>
          <div style={countStyle}>
            <IconSpark />
            <span>
              {posts.length} post{posts.length > 1 ? 's' : ''}
            </span>
          </div>
          <ul aria-label="Fil de posts" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {posts.map((post) => (
              <li key={post.id} style={{ marginBottom: 14 }}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
