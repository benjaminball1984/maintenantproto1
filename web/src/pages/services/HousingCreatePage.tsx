import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IconArrowLeft, IconHome } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  createHousing,
  HOUSING_CAPACITY_MAX,
  HOUSING_CAPACITY_MIN,
  HOUSING_CITY_MAX,
  HOUSING_CITY_MIN,
  HOUSING_DESCRIPTION_MAX,
  HOUSING_DESCRIPTION_MIN,
  HOUSING_TITLE_MAX,
  HOUSING_TITLE_MIN,
  validateHousingInput,
  type CreateHousingField,
  type CreateHousingInput,
} from '@/lib/housing';
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

type FieldErrors = Partial<Record<CreateHousingField, string>>;

export default function HousingCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('1');
  const [availableFrom, setAvailableFrom] = useState<string>('');
  const [availableTo, setAvailableTo] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setErrors({});
    setGlobalError(null);

    const capacityValue = Number.parseInt(capacity, 10);
    const input: CreateHousingInput = {
      hostId: user.id,
      title,
      description,
      city,
      capacity: Number.isFinite(capacityValue) ? capacityValue : Number.NaN,
      availableFrom: availableFrom || null,
      availableTo: availableTo || null,
    };
    const issues = validateHousingInput(input);
    if (issues.length > 0) {
      const nextErrors: FieldErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await createHousing(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ??
          'Impossible de publier l’hébergement. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    navigate(`/services/housing/${data.id}`, { replace: true });
  };

  return (
    <main style={pageStyle}>
      <Link to="/services/housing" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux hébergements
      </Link>
      <h1 style={titleStyle}>Proposer un hébergement</h1>
      <p style={leadStyle}>
        Décrivez l’espace que vous mettez à disposition. Une fiche claire — capacité, période,
        contexte — facilite la mise en relation.
      </p>

      <form onSubmit={handleSubmit} style={formStyle} aria-label="Création d'un hébergement" noValidate>
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="housing-title" style={labelStyle}>
            Titre de l’annonce
          </label>
          <input
            id="housing-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={HOUSING_TITLE_MAX + 10}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.title)}
            aria-describedby="housing-title-help"
          />
          <span id="housing-title-help" style={helpStyle}>
            Entre {HOUSING_TITLE_MIN} et {HOUSING_TITLE_MAX} caractères.
          </span>
          {errors.title && <span style={errorTextStyle}>{errors.title}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="housing-description" style={labelStyle}>
            Description
          </label>
          <textarea
            id="housing-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            style={textareaStyle}
            aria-invalid={Boolean(errors.description)}
            aria-describedby="housing-description-help"
          />
          <span id="housing-description-help" style={helpStyle}>
            Entre {HOUSING_DESCRIPTION_MIN} et {HOUSING_DESCRIPTION_MAX} caractères. Chambre, salon,
            équipements, accès, conditions…
          </span>
          {errors.description && <span style={errorTextStyle}>{errors.description}</span>}
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="housing-city" style={labelStyle}>
              Ville
            </label>
            <input
              id="housing-city"
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.city)}
            />
            <span style={helpStyle}>
              Entre {HOUSING_CITY_MIN} et {HOUSING_CITY_MAX} caractères.
            </span>
            {errors.city && <span style={errorTextStyle}>{errors.city}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="housing-capacity" style={labelStyle}>
              Capacité (places)
            </label>
            <input
              id="housing-capacity"
              type="number"
              min={HOUSING_CAPACITY_MIN}
              max={HOUSING_CAPACITY_MAX}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.capacity)}
            />
            <span style={helpStyle}>
              Entre {HOUSING_CAPACITY_MIN} et {HOUSING_CAPACITY_MAX} personnes.
            </span>
            {errors.capacity && <span style={errorTextStyle}>{errors.capacity}</span>}
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="housing-from" style={labelStyle}>
              Disponible à partir du (facultatif)
            </label>
            <input
              id="housing-from"
              type="date"
              value={availableFrom}
              onChange={(event) => setAvailableFrom(event.target.value)}
              style={inputStyle}
              aria-invalid={Boolean(errors.availableFrom)}
            />
            {errors.availableFrom && <span style={errorTextStyle}>{errors.availableFrom}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="housing-to" style={labelStyle}>
              Jusqu’au (facultatif)
            </label>
            <input
              id="housing-to"
              type="date"
              value={availableTo}
              onChange={(event) => setAvailableTo(event.target.value)}
              style={inputStyle}
              aria-invalid={Boolean(errors.availableTo)}
            />
            {errors.availableTo && <span style={errorTextStyle}>{errors.availableTo}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          style={busy ? submitDisabledStyle : submitStyle}
        >
          <IconHome />
          {busy ? 'Publication…' : 'Publier l’annonce'}
        </button>
      </form>
    </main>
  );
}
