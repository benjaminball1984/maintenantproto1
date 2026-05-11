import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IconArrowLeft, IconList } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  LENDING_CATEGORY_MAX,
  LENDING_CATEGORY_MIN,
  LENDING_CITY_MAX,
  LENDING_CITY_MIN,
  LENDING_DESCRIPTION_MAX,
  LENDING_T99CP_MAX,
  LENDING_TITLE_MAX,
  LENDING_TITLE_MIN,
  createLending,
  validateLendingInput,
  type CreateLendingField,
  type CreateLendingInput,
} from '@/lib/lending';
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

type FieldErrors = Partial<Record<CreateLendingField, string>>;

export default function LendingCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [t99cpCost, setT99cpCost] = useState<string>('0');
  const [busy, setBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setErrors({});
    setGlobalError(null);

    const costValue = Number.parseInt(t99cpCost, 10);
    const input: CreateLendingInput = {
      ownerId: user.id,
      title,
      description: description.trim() ? description : null,
      category,
      city,
      t99cpCost: Number.isFinite(costValue) ? costValue : Number.NaN,
    };
    const issues = validateLendingInput(input);
    if (issues.length > 0) {
      const nextErrors: FieldErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await createLending(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ?? 'Impossible de publier l’annonce. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    navigate(`/services/lending/${data.id}`, { replace: true });
  };

  return (
    <main style={pageStyle}>
      <Link to="/services/lending" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux annonces
      </Link>
      <h1 style={titleStyle}>Proposer un prêt</h1>
      <p style={leadStyle}>
        Décrivez l’objet à prêter et le coût en T99CP. RLS impose que vous soyez le propriétaire.
      </p>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
        aria-label="Création d’un prêt"
        noValidate
      >
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="lending-title" style={labelStyle}>
            Titre
          </label>
          <input
            id="lending-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.title)}
          />
          <span style={helpStyle}>
            Entre {LENDING_TITLE_MIN} et {LENDING_TITLE_MAX} caractères.
          </span>
          {errors.title && <span style={errorTextStyle}>{errors.title}</span>}
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="lending-category" style={labelStyle}>
              Catégorie
            </label>
            <input
              id="lending-category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.category)}
            />
            <span style={helpStyle}>
              Entre {LENDING_CATEGORY_MIN} et {LENDING_CATEGORY_MAX} caractères.
            </span>
            {errors.category && <span style={errorTextStyle}>{errors.category}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="lending-city" style={labelStyle}>
              Ville
            </label>
            <input
              id="lending-city"
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.city)}
            />
            <span style={helpStyle}>
              Entre {LENDING_CITY_MIN} et {LENDING_CITY_MAX} caractères.
            </span>
            {errors.city && <span style={errorTextStyle}>{errors.city}</span>}
          </div>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="lending-cost" style={labelStyle}>
            Coût en T99CP
          </label>
          <input
            id="lending-cost"
            type="number"
            min={0}
            max={LENDING_T99CP_MAX}
            step={1}
            value={t99cpCost}
            onChange={(event) => setT99cpCost(event.target.value)}
            style={inputStyle}
            aria-invalid={Boolean(errors.t99cpCost)}
          />
          <span style={helpStyle}>0 si gratuit, sinon coût symbolique en T99CP.</span>
          {errors.t99cpCost && <span style={errorTextStyle}>{errors.t99cpCost}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="lending-description" style={labelStyle}>
            Description (facultatif)
          </label>
          <textarea
            id="lending-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            style={textareaStyle}
            aria-invalid={Boolean(errors.description)}
            maxLength={LENDING_DESCRIPTION_MAX + 10}
          />
          <span style={helpStyle}>
            Jusqu’à {LENDING_DESCRIPTION_MAX} caractères.
          </span>
          {errors.description && <span style={errorTextStyle}>{errors.description}</span>}
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          style={busy ? submitDisabledStyle : submitStyle}
        >
          <IconList />
          {busy ? 'Publication…' : 'Publier l’annonce'}
        </button>
      </form>
    </main>
  );
}
