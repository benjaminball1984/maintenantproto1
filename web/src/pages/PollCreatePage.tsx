import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IconArrowLeft, IconBarChart, IconClose, IconPen } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  createPoll,
  POLL_DESCRIPTION_MAX,
  POLL_DESCRIPTION_MIN,
  POLL_OPTION_MAX,
  POLL_OPTION_MIN,
  POLL_OPTIONS_MAX_COUNT,
  POLL_OPTIONS_MIN_COUNT,
  POLL_QUESTION_MAX,
  POLL_QUESTION_MIN,
  validatePollInput,
  type CreatePollField,
  type CreatePollInput,
} from '@/lib/polls';
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
  minHeight: 100,
  padding: 12,
  resize: 'vertical',
  lineHeight: 1.55,
};

const errorTextStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--mn-danger)',
};

const optionsListStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const optionRowStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
};

const optionRemoveStyle: CSSProperties = {
  height: 44,
  width: 44,
  borderRadius: 10,
  border: '1.5px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-2)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'inherit',
};

const optionAddStyle: CSSProperties = {
  height: 44,
  borderRadius: 10,
  padding: '0 16px',
  border: '1.5px dashed var(--mn-border)',
  background: 'transparent',
  color: 'var(--mn-text-2)',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  alignSelf: 'flex-start',
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

const checkboxRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
  color: 'var(--mn-text-2)',
};

type FieldErrors = Partial<Record<CreatePollField, string>>;

export default function PollCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [membersOnly, setMembersOnly] = useState<boolean>(true);
  const [closesAt, setClosesAt] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const addOption = () => {
    if (options.length >= POLL_OPTIONS_MAX_COUNT) return;
    setOptions((prev) => [...prev, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= POLL_OPTIONS_MIN_COUNT) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setErrors({});
    setGlobalError(null);

    const input: CreatePollInput = {
      authorId: user.id,
      question,
      description,
      options,
      membersOnly,
      closesAt: closesAt ? new Date(closesAt).toISOString() : null,
    };
    const issues = validatePollInput(input);
    if (issues.length > 0) {
      const nextErrors: FieldErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await createPoll(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ?? 'Impossible de créer le sondage. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    navigate(`/polls/${data.poll.slug}`, { replace: true });
  };

  return (
    <main style={pageStyle}>
      <Link to="/polls" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux sondages
      </Link>
      <h1 style={titleStyle}>Lancer un sondage</h1>
      <p style={leadStyle}>
        Formulez une question claire et neutre, proposez des options distinctes. Un sondage
        Maintenant&nbsp;! est anonyme côté affichage des résultats — seul le compteur agrégé est
        visible.
      </p>

      <form onSubmit={handleSubmit} style={formStyle} aria-label="Création d'un sondage" noValidate>
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="poll-question" style={labelStyle}>
            Question
          </label>
          <input
            id="poll-question"
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={POLL_QUESTION_MAX + 10}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.question)}
            aria-describedby="poll-question-help"
          />
          <span id="poll-question-help" style={helpStyle}>
            Entre {POLL_QUESTION_MIN} et {POLL_QUESTION_MAX} caractères. Une question, neutre.
          </span>
          {errors.question && <span style={errorTextStyle}>{errors.question}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="poll-description" style={labelStyle}>
            Contexte (description)
          </label>
          <textarea
            id="poll-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            style={textareaStyle}
            aria-invalid={Boolean(errors.description)}
            aria-describedby="poll-description-help"
          />
          <span id="poll-description-help" style={helpStyle}>
            Entre {POLL_DESCRIPTION_MIN} et {POLL_DESCRIPTION_MAX} caractères. Précisez le cadre.
          </span>
          {errors.description && <span style={errorTextStyle}>{errors.description}</span>}
        </div>

        <div style={fieldStyle}>
          <span style={labelStyle}>Options de vote</span>
          <ul aria-label="Options du sondage" style={optionsListStyle}>
            {options.map((option, index) => (
              <li key={index} style={optionRowStyle}>
                <input
                  type="text"
                  value={option}
                  onChange={(event) => updateOption(index, event.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={POLL_OPTION_MAX + 10}
                  aria-label={`Option ${index + 1}`}
                  style={{ ...inputStyle, flex: 1 }}
                  aria-invalid={Boolean(errors.options)}
                />
                {options.length > POLL_OPTIONS_MIN_COUNT && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    aria-label={`Retirer l'option ${index + 1}`}
                    style={optionRemoveStyle}
                  >
                    <IconClose />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {options.length < POLL_OPTIONS_MAX_COUNT && (
            <button type="button" onClick={addOption} style={optionAddStyle}>
              <IconPen width={14} height={14} /> Ajouter une option
            </button>
          )}
          <span style={helpStyle}>
            Entre {POLL_OPTIONS_MIN_COUNT} et {POLL_OPTIONS_MAX_COUNT} options. Chaque option entre{' '}
            {POLL_OPTION_MIN} et {POLL_OPTION_MAX} caractères.
          </span>
          {errors.options && <span style={errorTextStyle}>{errors.options}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="poll-closes-at" style={labelStyle}>
            Date de clôture (facultatif)
          </label>
          <input
            id="poll-closes-at"
            type="datetime-local"
            value={closesAt}
            onChange={(event) => setClosesAt(event.target.value)}
            style={inputStyle}
            aria-invalid={Boolean(errors.closesAt)}
          />
          <span style={helpStyle}>
            Laissez vide pour un sondage ouvert sans limite. Doit être dans le futur.
          </span>
          {errors.closesAt && <span style={errorTextStyle}>{errors.closesAt}</span>}
        </div>

        <label style={checkboxRowStyle} htmlFor="poll-members-only">
          <input
            id="poll-members-only"
            type="checkbox"
            checked={membersOnly}
            onChange={(event) => setMembersOnly(event.target.checked)}
          />
          Réservé aux adhérent·es (recommandé)
        </label>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          style={busy ? submitDisabledStyle : submitStyle}
        >
          <IconBarChart />
          {busy ? 'Publication…' : 'Publier le sondage'}
        </button>
      </form>
    </main>
  );
}
