import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IconArrowLeft, IconFlame } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  CROWDFUNDING_BODY_MAX,
  CROWDFUNDING_GOAL_MAX,
  CROWDFUNDING_GOAL_MIN,
  CROWDFUNDING_SUMMARY_MAX,
  CROWDFUNDING_SUMMARY_MIN,
  CROWDFUNDING_TITLE_MAX,
  CROWDFUNDING_TITLE_MIN,
  createCrowdfunding,
  validateCrowdfundingInput,
  type CreateCrowdfundingField,
  type CreateCrowdfundingInput,
} from '@/lib/crowdfunding';
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

const fieldRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
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
  minHeight: 120,
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

type FieldErrors = Partial<Record<CreateCrowdfundingField, string>>;

export default function CrowdfundingCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [goalEur, setGoalEur] = useState<string>('1000');
  const [endsAt, setEndsAt] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setErrors({});
    setGlobalError(null);

    const goalValue = Number.parseFloat(goalEur);
    const endsAtIso = endsAt ? new Date(`${endsAt}T23:59:59`).toISOString() : null;

    const input: CreateCrowdfundingInput = {
      organizerId: user.id,
      title,
      summary,
      body: body.trim() ? body : null,
      goalEur: Number.isFinite(goalValue) ? goalValue : Number.NaN,
      endsAt: endsAtIso,
    };
    const issues = validateCrowdfundingInput(input);
    if (issues.length > 0) {
      const nextErrors: FieldErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await createCrowdfunding(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ?? 'Impossible de lancer la cagnotte. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    navigate(`/services/crowdfunding/${data.id}`, { replace: true });
  };

  return (
    <main style={pageStyle}>
      <Link to="/services/crowdfunding" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux cagnottes
      </Link>
      <h1 style={titleStyle}>Lancer une cagnotte</h1>
      <p style={leadStyle}>
        Décrivez votre cagnotte (titre, résumé, objectif). Les contributions seront acceptées dès
        la publication. La fonctionnalité de paiement Stripe sera branchée prochainement —
        l’enregistrement actuel est manuel via la table contributions.
      </p>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
        aria-label="Création d’une cagnotte"
        noValidate
      >
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="cf-title" style={labelStyle}>
            Titre
          </label>
          <input
            id="cf-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.title)}
          />
          <span style={helpStyle}>
            Entre {CROWDFUNDING_TITLE_MIN} et {CROWDFUNDING_TITLE_MAX} caractères.
          </span>
          {errors.title && <span style={errorTextStyle}>{errors.title}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="cf-summary" style={labelStyle}>
            Résumé
          </label>
          <textarea
            id="cf-summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            required
            style={{ ...textareaStyle, minHeight: 80 }}
            aria-invalid={Boolean(errors.summary)}
            maxLength={CROWDFUNDING_SUMMARY_MAX + 10}
          />
          <span style={helpStyle}>
            Entre {CROWDFUNDING_SUMMARY_MIN} et {CROWDFUNDING_SUMMARY_MAX} caractères.
          </span>
          {errors.summary && <span style={errorTextStyle}>{errors.summary}</span>}
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="cf-goal" style={labelStyle}>
              Objectif (€)
            </label>
            <input
              id="cf-goal"
              type="number"
              min={CROWDFUNDING_GOAL_MIN}
              max={CROWDFUNDING_GOAL_MAX}
              step={50}
              value={goalEur}
              onChange={(event) => setGoalEur(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.goalEur)}
            />
            {errors.goalEur && <span style={errorTextStyle}>{errors.goalEur}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="cf-ends" style={labelStyle}>
              Date de fin (facultatif)
            </label>
            <input
              id="cf-ends"
              type="date"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
              style={inputStyle}
              aria-invalid={Boolean(errors.endsAt)}
            />
            {errors.endsAt && <span style={errorTextStyle}>{errors.endsAt}</span>}
          </div>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="cf-body" style={labelStyle}>
            Contenu détaillé (facultatif)
          </label>
          <textarea
            id="cf-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            style={textareaStyle}
            aria-invalid={Boolean(errors.body)}
            maxLength={CROWDFUNDING_BODY_MAX + 50}
          />
          <span style={helpStyle}>
            Jusqu’à {CROWDFUNDING_BODY_MAX} caractères.
          </span>
          {errors.body && <span style={errorTextStyle}>{errors.body}</span>}
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          style={busy ? submitDisabledStyle : submitStyle}
        >
          <IconFlame />
          {busy ? 'Publication…' : 'Lancer la cagnotte'}
        </button>
      </form>
    </main>
  );
}
