import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IconArrowLeft, IconPen } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  COMMUNE_CITY_MAX,
  COMMUNE_CITY_MIN,
  COMMUNE_DESCRIPTION_MAX,
  COMMUNE_NAME_MAX,
  COMMUNE_NAME_MIN,
  createCommune,
  validateCommuneInput,
  type CreateCommuneField,
  type CreateCommuneInput,
} from '@/lib/communes';
import { logAdminAction } from '@/lib/admin';
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

type FieldErrors = Partial<Record<CreateCommuneField, string>>;

export default function CommuneCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setErrors({});
    setGlobalError(null);

    const input: CreateCommuneInput = {
      name,
      city,
      description: description.trim() || null,
    };
    const issues = validateCommuneInput(input);
    if (issues.length > 0) {
      const nextErrors: FieldErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await createCommune(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ??
          'Impossible de créer la commune. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    await logAdminAction({
      actorId: user.id,
      action: 'commune.create',
      targetTable: 'communes',
      targetId: data.id,
      payload: { name: data.name, city: data.city },
    });
    navigate(`/communes/${data.slug}`, { replace: true });
  };

  return (
    <main style={pageStyle}>
      <Link to="/communes" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux communes
      </Link>
      <h1 style={titleStyle}>Créer une commune libre</h1>
      <p style={leadStyle}>
        Réservé aux administrateurs du mouvement. Une commune libre regroupe les
        adhérents d&apos;un même territoire. Toute création est historisée.
      </p>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
        aria-label="Création d'une commune"
        noValidate
      >
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="commune-name" style={labelStyle}>
            Nom de la commune
          </label>
          <input
            id="commune-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.name)}
          />
          <span style={helpStyle}>
            Entre {COMMUNE_NAME_MIN} et {COMMUNE_NAME_MAX} caractères.
          </span>
          {errors.name && <span style={errorTextStyle}>{errors.name}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="commune-city" style={labelStyle}>
            Ville
          </label>
          <input
            id="commune-city"
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.city)}
          />
          <span style={helpStyle}>
            Entre {COMMUNE_CITY_MIN} et {COMMUNE_CITY_MAX} caractères.
          </span>
          {errors.city && <span style={errorTextStyle}>{errors.city}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="commune-description" style={labelStyle}>
            Description (facultatif)
          </label>
          <textarea
            id="commune-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            style={textareaStyle}
            aria-invalid={Boolean(errors.description)}
            maxLength={COMMUNE_DESCRIPTION_MAX + 50}
          />
          <span style={helpStyle}>Jusqu&apos;à {COMMUNE_DESCRIPTION_MAX} caractères.</span>
          {errors.description && (
            <span style={errorTextStyle}>{errors.description}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          style={busy ? submitDisabledStyle : submitStyle}
        >
          <IconPen />
          {busy ? 'Création…' : 'Créer la commune'}
        </button>
      </form>
    </main>
  );
}
