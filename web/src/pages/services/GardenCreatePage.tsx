import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IconArrowLeft, IconHome } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  GARDEN_CITY_MAX,
  GARDEN_CITY_MIN,
  GARDEN_DESCRIPTION_MAX,
  GARDEN_NAME_MAX,
  GARDEN_NAME_MIN,
  GARDEN_SIZE_MAX,
  GARDEN_SPOTS_MAX,
  createGarden,
  validateGardenInput,
  type CreateGardenField,
  type CreateGardenInput,
} from '@/lib/garden';
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

type FieldErrors = Partial<Record<CreateGardenField, string>>;

export default function GardenCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [sizeSqm, setSizeSqm] = useState<string>('');
  const [availableSpots, setAvailableSpots] = useState<string>('0');
  const [busy, setBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setErrors({});
    setGlobalError(null);

    const sizeValue = sizeSqm.trim() ? Number.parseInt(sizeSqm, 10) : null;
    const spotsValue = Number.parseInt(availableSpots, 10);

    const input: CreateGardenInput = {
      managerId: user.id,
      name,
      description: description.trim() ? description : null,
      city,
      sizeSqm: sizeValue !== null && Number.isFinite(sizeValue) ? sizeValue : null,
      availableSpots: Number.isFinite(spotsValue) ? spotsValue : Number.NaN,
    };
    const issues = validateGardenInput(input);
    if (issues.length > 0) {
      const nextErrors: FieldErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await createGarden(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ?? 'Impossible de référencer ce jardin. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    navigate(`/services/garden/${data.id}`, { replace: true });
  };

  return (
    <main style={pageStyle}>
      <Link to="/services/garden" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux jardins
      </Link>
      <h1 style={titleStyle}>Référencer un jardin partagé</h1>
      <p style={leadStyle}>
        Indiquez les informations du jardin : nom, ville, surface (facultatif), nombre de parcelles
        libres. Vous serez le responsable des contacts.
      </p>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
        aria-label="Création d’un jardin"
        noValidate
      >
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="garden-name" style={labelStyle}>
            Nom du jardin
          </label>
          <input
            id="garden-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.name)}
          />
          <span style={helpStyle}>
            Entre {GARDEN_NAME_MIN} et {GARDEN_NAME_MAX} caractères.
          </span>
          {errors.name && <span style={errorTextStyle}>{errors.name}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="garden-city" style={labelStyle}>
            Ville
          </label>
          <input
            id="garden-city"
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.city)}
          />
          <span style={helpStyle}>
            Entre {GARDEN_CITY_MIN} et {GARDEN_CITY_MAX} caractères.
          </span>
          {errors.city && <span style={errorTextStyle}>{errors.city}</span>}
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="garden-size" style={labelStyle}>
              Surface (m², facultatif)
            </label>
            <input
              id="garden-size"
              type="number"
              min={1}
              max={GARDEN_SIZE_MAX}
              step={1}
              value={sizeSqm}
              onChange={(event) => setSizeSqm(event.target.value)}
              style={inputStyle}
              aria-invalid={Boolean(errors.sizeSqm)}
            />
            {errors.sizeSqm && <span style={errorTextStyle}>{errors.sizeSqm}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="garden-spots" style={labelStyle}>
              Parcelles libres
            </label>
            <input
              id="garden-spots"
              type="number"
              min={0}
              max={GARDEN_SPOTS_MAX}
              step={1}
              value={availableSpots}
              onChange={(event) => setAvailableSpots(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.availableSpots)}
            />
            {errors.availableSpots && <span style={errorTextStyle}>{errors.availableSpots}</span>}
          </div>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="garden-description" style={labelStyle}>
            Description (facultatif)
          </label>
          <textarea
            id="garden-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            style={textareaStyle}
            aria-invalid={Boolean(errors.description)}
            maxLength={GARDEN_DESCRIPTION_MAX + 10}
          />
          <span style={helpStyle}>
            Jusqu’à {GARDEN_DESCRIPTION_MAX} caractères.
          </span>
          {errors.description && <span style={errorTextStyle}>{errors.description}</span>}
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          style={busy ? submitDisabledStyle : submitStyle}
        >
          <IconHome />
          {busy ? 'Publication…' : 'Référencer le jardin'}
        </button>
      </form>
    </main>
  );
}
