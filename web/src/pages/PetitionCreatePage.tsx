import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IconArrowLeft, IconPen } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  createPetition,
  PETITION_BODY_MIN,
  PETITION_CATEGORIES,
  PETITION_SUMMARY_MAX,
  PETITION_SUMMARY_MIN,
  PETITION_TARGET_MAX,
  PETITION_TARGET_MIN,
  PETITION_TITLE_MAX,
  PETITION_TITLE_MIN,
  validatePetitionInput,
  type CreatePetitionInput,
} from '@/lib/petitions';
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
  minHeight: 140,
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

type FieldErrors = Partial<Record<keyof CreatePetitionInput, string>>;

export default function PetitionCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>(PETITION_CATEGORIES[0] ?? 'Autre');
  const [summary, setSummary] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [targetCount, setTargetCount] = useState<string>('1000');
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

    const parsedTarget = Number.parseInt(targetCount, 10);
    const input: CreatePetitionInput = {
      authorId: user.id,
      title,
      summary,
      body,
      category,
      targetCount: Number.isNaN(parsedTarget) ? undefined : parsedTarget,
      coverUrl: coverUrl.trim() ? coverUrl.trim() : null,
    };
    const issues = validatePetitionInput(input);
    if (issues.length > 0) {
      const nextErrors: FieldErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await createPetition(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ?? 'Impossible de créer la pétition. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    navigate(`/petitions/${data.slug}`, { replace: true });
  };

  return (
    <main style={pageStyle}>
      <Link to="/petitions" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux pétitions
      </Link>
      <h1 style={titleStyle}>Lancer une pétition</h1>
      <p style={leadStyle}>
        Décrivez la cause, l&apos;action demandée et le contexte local. Une pétition de qualité
        recueille en moyenne 3× plus de signatures qu&apos;un texte vague — soyez précis sur
        l&apos;objectif politique.
      </p>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
        aria-label="Création d'une pétition"
        noValidate
      >
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="petition-title" style={labelStyle}>
            Titre de la pétition
          </label>
          <input
            id="petition-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={PETITION_TITLE_MAX + 10}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.title)}
            aria-describedby="petition-title-help"
          />
          <span id="petition-title-help" style={helpStyle}>
            Entre {PETITION_TITLE_MIN} et {PETITION_TITLE_MAX} caractères.
          </span>
          {errors.title && <span style={errorTextStyle}>{errors.title}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="petition-category" style={labelStyle}>
            Catégorie
          </label>
          <select
            id="petition-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            style={inputStyle}
          >
            {PETITION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <span style={errorTextStyle}>{errors.category}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="petition-summary" style={labelStyle}>
            Résumé court
          </label>
          <textarea
            id="petition-summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            style={{ ...textareaStyle, minHeight: 80 }}
            aria-invalid={Boolean(errors.summary)}
            aria-describedby="petition-summary-help"
          />
          <span id="petition-summary-help" style={helpStyle}>
            Entre {PETITION_SUMMARY_MIN} et {PETITION_SUMMARY_MAX} caractères — c&apos;est ce qui
            apparaît dans la liste.
          </span>
          {errors.summary && <span style={errorTextStyle}>{errors.summary}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="petition-body" style={labelStyle}>
            Présentation détaillée
          </label>
          <textarea
            id="petition-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            style={textareaStyle}
            aria-invalid={Boolean(errors.body)}
            aria-describedby="petition-body-help"
          />
          <span id="petition-body-help" style={helpStyle}>
            Au moins {PETITION_BODY_MIN} caractères. Expliquez le contexte, les enjeux,
            l&apos;action demandée.
          </span>
          {errors.body && <span style={errorTextStyle}>{errors.body}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="petition-target" style={labelStyle}>
            Objectif de signatures
          </label>
          <input
            id="petition-target"
            type="number"
            min={PETITION_TARGET_MIN}
            max={PETITION_TARGET_MAX}
            value={targetCount}
            onChange={(event) => setTargetCount(event.target.value)}
            style={inputStyle}
            aria-invalid={Boolean(errors.targetCount)}
          />
          <span style={helpStyle}>
            Entre {PETITION_TARGET_MIN.toLocaleString('fr-FR')} et{' '}
            {PETITION_TARGET_MAX.toLocaleString('fr-FR')}.
          </span>
          {errors.targetCount && <span style={errorTextStyle}>{errors.targetCount}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="petition-cover" style={labelStyle}>
            Image de couverture (URL, facultatif)
          </label>
          <input
            id="petition-cover"
            type="url"
            value={coverUrl}
            onChange={(event) => setCoverUrl(event.target.value)}
            placeholder="https://…"
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          style={busy ? submitDisabledStyle : submitStyle}
        >
          <IconPen />
          {busy ? 'Publication…' : 'Publier la pétition'}
        </button>
      </form>
    </main>
  );
}
