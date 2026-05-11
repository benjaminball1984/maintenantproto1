import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IconArrowLeft, IconSpark } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  SEL_CATEGORY_MAX,
  SEL_CATEGORY_MIN,
  SEL_CITY_MAX,
  SEL_CITY_MIN,
  SEL_DESCRIPTION_MAX,
  SEL_RATE_MAX,
  SEL_TITLE_MAX,
  SEL_TITLE_MIN,
  createSelOffer,
  validateSelInput,
  type CreateSelField,
  type CreateSelInput,
} from '@/lib/sel';
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

type FieldErrors = Partial<Record<CreateSelField, string>>;

export default function SelCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [t99cpRate, setT99cpRate] = useState<string>('1');
  const [busy, setBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setErrors({});
    setGlobalError(null);

    const rateValue = Number.parseInt(t99cpRate, 10);
    const input: CreateSelInput = {
      userId: user.id,
      title,
      description: description.trim() ? description : null,
      category,
      city,
      t99cpRate: Number.isFinite(rateValue) ? rateValue : Number.NaN,
    };
    const issues = validateSelInput(input);
    if (issues.length > 0) {
      const nextErrors: FieldErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await createSelOffer(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ?? 'Impossible de publier l’offre. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    navigate(`/services/sel/${data.id}`, { replace: true });
  };

  return (
    <main style={pageStyle}>
      <Link to="/services/sel" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux offres SEL
      </Link>
      <h1 style={titleStyle}>Proposer une offre SEL</h1>
      <p style={leadStyle}>
        Décrivez votre offre, sa catégorie, votre ville et le tarif en T99CP. Vous échangez du
        temps et des savoirs, pas de l&apos;argent.
      </p>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
        aria-label="Création d’une offre SEL"
        noValidate
      >
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="sel-title" style={labelStyle}>
            Titre
          </label>
          <input
            id="sel-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.title)}
          />
          <span style={helpStyle}>
            Entre {SEL_TITLE_MIN} et {SEL_TITLE_MAX} caractères.
          </span>
          {errors.title && <span style={errorTextStyle}>{errors.title}</span>}
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="sel-category" style={labelStyle}>
              Catégorie
            </label>
            <input
              id="sel-category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.category)}
            />
            <span style={helpStyle}>
              Entre {SEL_CATEGORY_MIN} et {SEL_CATEGORY_MAX} caractères.
            </span>
            {errors.category && <span style={errorTextStyle}>{errors.category}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="sel-city" style={labelStyle}>
              Ville
            </label>
            <input
              id="sel-city"
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.city)}
            />
            <span style={helpStyle}>
              Entre {SEL_CITY_MIN} et {SEL_CITY_MAX} caractères.
            </span>
            {errors.city && <span style={errorTextStyle}>{errors.city}</span>}
          </div>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="sel-rate" style={labelStyle}>
            Tarif en T99CP par unité
          </label>
          <input
            id="sel-rate"
            type="number"
            min={0}
            max={SEL_RATE_MAX}
            step={1}
            value={t99cpRate}
            onChange={(event) => setT99cpRate(event.target.value)}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.t99cpRate)}
          />
          <span style={helpStyle}>
            Par heure, par séance, par prestation… à vous de définir l&apos;unité.
          </span>
          {errors.t99cpRate && <span style={errorTextStyle}>{errors.t99cpRate}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="sel-description" style={labelStyle}>
            Description (facultatif)
          </label>
          <textarea
            id="sel-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            style={textareaStyle}
            aria-invalid={Boolean(errors.description)}
            maxLength={SEL_DESCRIPTION_MAX + 10}
          />
          <span style={helpStyle}>
            Jusqu’à {SEL_DESCRIPTION_MAX} caractères.
          </span>
          {errors.description && <span style={errorTextStyle}>{errors.description}</span>}
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          style={busy ? submitDisabledStyle : submitStyle}
        >
          <IconSpark />
          {busy ? 'Publication…' : 'Publier l’offre'}
        </button>
      </form>
    </main>
  );
}
