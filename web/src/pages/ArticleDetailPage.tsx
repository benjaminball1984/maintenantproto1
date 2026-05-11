import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { IconArrowLeft, IconList, IconPen, IconSpark } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  COMMENT_BODY_MAX,
  createComment,
  listComments,
  listReactions,
  react,
  validateCommentInput,
  type ArticleFormat,
  type CommentRow,
  type ReactionKind,
  type ReactionRow,
} from '@/lib/media';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useArticle } from '@/hooks/useArticle';

const pageStyle: CSSProperties = {
  maxWidth: 880,
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

const heroStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 24,
  padding: '32px 28px',
  marginBottom: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const tagStyle: CSSProperties = {
  display: 'inline-flex',
  alignSelf: 'flex-start',
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

const titleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(22px, 3.5vw, 32px)',
  fontWeight: 800,
  margin: 0,
  letterSpacing: '-0.02em',
  lineHeight: 1.2,
  color: 'var(--mn-text-1)',
};

const summaryStyle: CSSProperties = {
  fontSize: 17,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: 0,
};

const metaStyle: CSSProperties = {
  fontSize: 13,
  color: 'var(--mn-text-3)',
};

const bodyStyle: CSSProperties = {
  fontSize: 16,
  lineHeight: 1.7,
  color: 'var(--mn-text-1)',
  margin: 0,
  whiteSpace: 'pre-wrap',
};

const sectionTitleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 18,
  fontWeight: 700,
  margin: '24px 0 12px',
  color: 'var(--mn-text-1)',
};

const reactionBarStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 20,
};

const reactionBtnStyle: CSSProperties = {
  height: 36,
  padding: '0 12px',
  borderRadius: 999,
  border: '1.5px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-2)',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'inherit',
};

const commentListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const commentCardStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 12,
  padding: 14,
};

const commentMetaStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--mn-text-3)',
  marginBottom: 6,
};

const commentBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.55,
  color: 'var(--mn-text-1)',
  whiteSpace: 'pre-wrap',
};

const formStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 14,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  marginTop: 16,
};

const textareaStyle: CSSProperties = {
  width: '100%',
  minHeight: 80,
  padding: 12,
  borderRadius: 12,
  border: '1.5px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  fontSize: 14,
  fontFamily: 'inherit',
  color: 'var(--mn-text-1)',
  resize: 'vertical',
};

const submitStyle: CSSProperties = {
  alignSelf: 'flex-end',
  height: 36,
  padding: '0 14px',
  border: 'none',
  borderRadius: 10,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'inherit',
};

const submitDisabledStyle: CSSProperties = {
  ...submitStyle,
  background: 'var(--mn-surface-2)',
  color: 'var(--mn-text-3)',
  border: '1px solid var(--mn-border)',
  cursor: 'not-allowed',
};

const errorBoxStyle: CSSProperties = {
  background: '#fef2f2',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--mn-danger)',
  border: '1px solid #fecaca',
  margin: '12px 0',
};

const errorTextStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--mn-danger)',
};

const FORMAT_LABELS: Record<ArticleFormat, string> = {
  article: 'Article',
  video: 'Vidéo',
  podcast: 'Podcast',
  photo: 'Photo',
  enquete: 'Enquête',
};

const REACTION_LABELS: Record<ReactionKind, string> = {
  like: 'J’aime',
  support: 'Soutien',
  disagree: 'Pas d’accord',
  curious: 'Curieux',
  outrage: 'Indignation',
};

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function CommentCard({ comment }: { comment: CommentRow }) {
  return (
    <li style={commentCardStyle}>
      <div style={commentMetaStyle}>
        <span>{comment.author_id.slice(0, 8)}…</span>
        <span aria-hidden="true"> · </span>
        <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
      </div>
      <p style={commentBodyStyle}>{comment.body}</p>
    </li>
  );
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { article, status, error } = useArticle(slug);

  const [comments, setComments] = useState<CommentRow[]>([]);
  const [reactions, setReactions] = useState<ReactionRow[]>([]);
  const [commentBody, setCommentBody] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (!article) return;
    const articleId = article.id;
    let cancelled = false;
    void (async () => {
      const [{ data: c }, { data: r }] = await Promise.all([
        listComments(articleId),
        listReactions(articleId),
      ]);
      if (cancelled) return;
      setComments(c);
      setReactions(r);
    })();
    return () => {
      cancelled = true;
    };
  }, [article]);

  if (status === 'notfound') {
    return <Navigate to="/media" replace />;
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <main style={pageStyle}>
        <p role="status" aria-live="polite" style={{ color: 'var(--mn-text-3)' }}>
          Chargement de l&apos;article…
        </p>
      </main>
    );
  }

  if (status === 'error' || !article) {
    return (
      <main style={pageStyle}>
        <div role="alert" style={errorBoxStyle}>
          {postgrestErrorMessage(error) ?? 'Article introuvable.'}
        </div>
        <Link to="/media" style={backLinkStyle}>
          <IconArrowLeft /> Retour aux articles
        </Link>
      </main>
    );
  }

  const reactionCounts: Record<ReactionKind, number> = {
    like: 0,
    support: 0,
    disagree: 0,
    curious: 0,
    outrage: 0,
  };
  for (const r of reactions) {
    if (r.kind in reactionCounts) {
      reactionCounts[r.kind as ReactionKind] += 1;
    }
  }

  const handleReact = async (kind: ReactionKind) => {
    if (!user) return;
    const { data } = await react(article.id, user.id, kind);
    if (data) {
      setReactions((prev) => [...prev, data]);
    }
  };

  const handleSubmitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !article) return;
    setBusy(true);
    setFieldError(null);
    setGlobalError(null);
    const input = {
      articleId: article.id,
      authorId: user.id,
      body: commentBody,
    };
    const issues = validateCommentInput(input);
    if (issues.length > 0) {
      setFieldError(issues[0]?.message ?? 'Commentaire invalide.');
      setBusy(false);
      return;
    }
    const { data, error: postError } = await createComment(input);
    if (postError) {
      setGlobalError(
        postgrestErrorMessage(postError) ??
          'Impossible de poster le commentaire. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    if (data) {
      setComments((prev) => [...prev, data]);
    }
    setCommentBody('');
    setBusy(false);
  };

  return (
    <main style={pageStyle}>
      <Link to="/media" style={backLinkStyle}>
        <IconArrowLeft /> Tous les articles
      </Link>

      <header style={heroStyle}>
        <span style={tagStyle}>
          <IconList width={12} height={12} />
          {FORMAT_LABELS[article.format as ArticleFormat] ?? article.format}
        </span>
        <h1 style={titleStyle}>{article.title}</h1>
        <p style={summaryStyle}>{article.summary}</p>
        <p style={metaStyle}>
          Publié le {formatDate(article.published_at ?? article.created_at)} · par{' '}
          {article.author_id.slice(0, 8)}…
        </p>
        <p style={bodyStyle}>{article.body}</p>
      </header>

      <h2 style={sectionTitleStyle}>Réactions</h2>
      <div role="group" aria-label="Réactions" style={reactionBarStyle}>
        {(Object.keys(REACTION_LABELS) as ReactionKind[]).map((kind) => (
          <button
            type="button"
            key={kind}
            onClick={() => {
              void handleReact(kind);
            }}
            disabled={!user}
            style={reactionBtnStyle}
            aria-label={`${REACTION_LABELS[kind]} (${reactionCounts[kind]})`}
          >
            <IconSpark width={14} height={14} />
            {REACTION_LABELS[kind]} · {reactionCounts[kind]}
          </button>
        ))}
      </div>

      <h2 style={sectionTitleStyle}>
        Commentaires ({comments.length})
      </h2>
      {comments.length === 0 ? (
        <p style={{ color: 'var(--mn-text-3)', fontSize: 14 }}>
          Aucun commentaire pour l&apos;instant.
        </p>
      ) : (
        <ul style={commentListStyle}>
          {comments.map((c) => (
            <CommentCard key={c.id} comment={c} />
          ))}
        </ul>
      )}

      {user ? (
        <form onSubmit={handleSubmitComment} style={formStyle} aria-label="Poster un commentaire">
          <label
            htmlFor="comment-body"
            style={{ fontSize: 13, fontWeight: 700, color: 'var(--mn-text-2)' }}
          >
            Votre commentaire
          </label>
          <textarea
            id="comment-body"
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            maxLength={COMMENT_BODY_MAX}
            style={textareaStyle}
            required
            placeholder="Partagez votre réaction…"
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
            <IconPen />
            {busy ? 'Envoi…' : 'Publier'}
          </button>
        </form>
      ) : (
        <p style={{ color: 'var(--mn-text-3)', fontSize: 13, marginTop: 16 }}>
          Connectez-vous pour réagir ou commenter.
        </p>
      )}
    </main>
  );
}
