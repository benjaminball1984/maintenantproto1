import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IconArrowLeft, IconPen } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  ARTICLE_BODY_MAX,
  ARTICLE_BODY_MIN,
  ARTICLE_SUMMARY_MAX,
  ARTICLE_SUMMARY_MIN,
  ARTICLE_TITLE_MAX,
  ARTICLE_TITLE_MIN,
  createArticle,
  validateArticleInput,
  type ArticleFormat,
  type CreateArticleField,
  type CreateArticleInput,
} from '@/lib/media';
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

const errorBoxStyle: CSSProperties = {
  background: '#fef2f2',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--mn-danger)',
  border: '1px solid #fecaca',
};

type FieldErrors = Partial<Record<CreateArticleField, string>>;

const FORMAT_OPTIONS: ArticleFormat[] = ['article', 'video', 'podcast', 'photo', 'enquete'];

export default function ArticleCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [format, setFormat] = useState<ArticleFormat>('article');
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setErrors({});
    setGlobalError(null);

    const input: CreateArticleInput = {
      authorId: user.id,
      title,
      summary,
      body,
      format,
      coverUrl: coverUrl.trim() ? coverUrl : null,
    };
    const issues = validateArticleInput(input);
    if (issues.length > 0) {
      const nextErrors: FieldErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await createArticle(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ??
          'Impossible de publier l’article. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    navigate(`/media/${data.slug}`, { replace: true });
  };

  return (
    <main style={pageStyle}>
      <Link to="/media" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux articles
      </Link>
      <h1 style={titleStyle}>Proposer un article</h1>
      <p style={leadStyle}>
        Articles, vidéos, podcasts ou enquêtes. La modération éditoriale collective peut
        ensuite mettre l&apos;article en avant ou demander des ajustements.
      </p>

      <form onSubmit={handleSubmit} style={formStyle} aria-label="Création d’article" noValidate>
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="article-title" style={labelStyle}>
            Titre
          </label>
          <input
            id="article-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.title)}
          />
          <span style={helpStyle}>
            Entre {ARTICLE_TITLE_MIN} et {ARTICLE_TITLE_MAX} caractères.
          </span>
          {errors.title && <span style={errorTextStyle}>{errors.title}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="article-format" style={labelStyle}>
            Format
          </label>
          <select
            id="article-format"
            value={format}
            onChange={(event) => setFormat(event.target.value as ArticleFormat)}
            style={inputStyle}
            aria-invalid={Boolean(errors.format)}
          >
            {FORMAT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          {errors.format && <span style={errorTextStyle}>{errors.format}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="article-summary" style={labelStyle}>
            Résumé
          </label>
          <textarea
            id="article-summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            required
            style={{ ...textareaStyle, minHeight: 100 }}
            aria-invalid={Boolean(errors.summary)}
            maxLength={ARTICLE_SUMMARY_MAX + 10}
          />
          <span style={helpStyle}>
            Entre {ARTICLE_SUMMARY_MIN} et {ARTICLE_SUMMARY_MAX} caractères.
          </span>
          {errors.summary && <span style={errorTextStyle}>{errors.summary}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="article-body" style={labelStyle}>
            Contenu
          </label>
          <textarea
            id="article-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
            style={textareaStyle}
            aria-invalid={Boolean(errors.body)}
            maxLength={ARTICLE_BODY_MAX + 50}
          />
          <span style={helpStyle}>
            Entre {ARTICLE_BODY_MIN} et {ARTICLE_BODY_MAX} caractères.
          </span>
          {errors.body && <span style={errorTextStyle}>{errors.body}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="article-cover" style={labelStyle}>
            URL d’illustration (facultatif)
          </label>
          <input
            id="article-cover"
            type="url"
            value={coverUrl}
            onChange={(event) => setCoverUrl(event.target.value)}
            placeholder="https://…"
            style={inputStyle}
            aria-invalid={Boolean(errors.coverUrl)}
          />
          {errors.coverUrl && <span style={errorTextStyle}>{errors.coverUrl}</span>}
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          style={busy ? submitDisabledStyle : submitStyle}
        >
          <IconPen />
          {busy ? 'Publication…' : 'Publier l’article'}
        </button>
      </form>
    </main>
  );
}
