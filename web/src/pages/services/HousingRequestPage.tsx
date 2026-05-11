import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import { IconArrowLeft, IconCalendar, IconCheckCircle, IconHome, IconPin } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  HOUSING_REQUEST_MESSAGE_MAX,
  HOUSING_REQUEST_MESSAGE_MIN,
  requestHousing,
  validateRequestInput,
  type RequestHousingField,
  type RequestHousingInput,
} from '@/lib/housing';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useHousingItem } from '@/hooks/useHousingItem';

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

const summaryCardStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 16,
  padding: 18,
  marginBottom: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const summaryRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 14,
  fontSize: 13,
  color: 'var(--mn-text-2)',
};

const summaryItemStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontWeight: 600,
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

const successBoxStyle: CSSProperties = {
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  borderRadius: 16,
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

type FieldErrors = Partial<Record<RequestHousingField, string>>;

export default function HousingRequestPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { housing, status, error: loadError } = useHousingItem(id);

  const [message, setMessage] = useState<string>('');
  const [startsOn, setStartsOn] = useState<string>('');
  const [endsOn, setEndsOn] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (status === 'notfound') {
    return <Navigate to="/services/housing" replace />;
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <main style={pageStyle}>
        <p role="status" aria-live="polite" style={{ color: 'var(--mn-text-3)' }}>
          Chargement de l’hébergement…
        </p>
      </main>
    );
  }

  if (status === 'error' || !housing) {
    return (
      <main style={pageStyle}>
        <div role="alert" style={errorBoxStyle}>
          {postgrestErrorMessage(loadError) ?? 'Hébergement introuvable.'}
        </div>
        <Link to="/services/housing" style={backLinkStyle}>
          <IconArrowLeft /> Retour à la liste
        </Link>
      </main>
    );
  }

  if (user && user.id === housing.host_id) {
    return <Navigate to={`/services/housing/${housing.id}`} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setErrors({});
    setGlobalError(null);

    const input: RequestHousingInput = {
      housingId: housing.id,
      requesterId: user.id,
      message,
      startsOn,
      endsOn,
    };
    const issues = validateRequestInput(input);
    if (issues.length > 0) {
      const nextErrors: FieldErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await requestHousing(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ??
          'Impossible d’envoyer la demande. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    setSubmitted(true);
    setBusy(false);
  };

  if (submitted) {
    return (
      <main style={pageStyle}>
        <Link to={`/services/housing/${housing.id}`} style={backLinkStyle}>
          <IconArrowLeft /> Retour à l’annonce
        </Link>
        <h1 style={titleStyle}>Demande envoyée</h1>
        <div role="status" style={successBoxStyle}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <IconCheckCircle />
            <span>Votre demande a bien été transmise à l’hôte.</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--mn-text-2)' }}>
            Vous serez notifié dès que l’hôte accepte ou refuse. En attendant, vous pouvez consulter
            d’autres hébergements.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate(`/services/housing/${housing.id}`)}
              style={submitStyle}
            >
              Retour à l’annonce
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <Link to={`/services/housing/${housing.id}`} style={backLinkStyle}>
        <IconArrowLeft /> Retour à l’annonce
      </Link>
      <h1 style={titleStyle}>Faire une demande</h1>

      <section style={summaryCardStyle} aria-label="Hébergement ciblé">
        <span style={{ fontWeight: 700, color: 'var(--mn-text-1)' }}>{housing.title}</span>
        <div style={summaryRowStyle}>
          <span style={summaryItemStyle}>
            <IconHome width={14} height={14} />
            Hébergement solidaire
          </span>
          <span style={summaryItemStyle}>
            <IconPin width={14} height={14} />
            {housing.city}
          </span>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
        aria-label="Demande d'hébergement"
        noValidate
      >
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="housing-req-message" style={labelStyle}>
            Message à l’hôte
          </label>
          <textarea
            id="housing-req-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            style={textareaStyle}
            aria-invalid={Boolean(errors.message)}
            aria-describedby="housing-req-message-help"
          />
          <span id="housing-req-message-help" style={helpStyle}>
            Entre {HOUSING_REQUEST_MESSAGE_MIN} et {HOUSING_REQUEST_MESSAGE_MAX} caractères. Qui vous
            êtes, pour quel projet militant, combien de personnes…
          </span>
          {errors.message && <span style={errorTextStyle}>{errors.message}</span>}
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="housing-req-from" style={labelStyle}>
              Date d’arrivée
            </label>
            <input
              id="housing-req-from"
              type="date"
              value={startsOn}
              onChange={(event) => setStartsOn(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.startsOn)}
            />
            {errors.startsOn && <span style={errorTextStyle}>{errors.startsOn}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="housing-req-to" style={labelStyle}>
              Date de départ
            </label>
            <input
              id="housing-req-to"
              type="date"
              value={endsOn}
              onChange={(event) => setEndsOn(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.endsOn)}
            />
            {errors.endsOn && <span style={errorTextStyle}>{errors.endsOn}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          style={busy ? submitDisabledStyle : submitStyle}
        >
          <IconCalendar />
          {busy ? 'Envoi…' : 'Envoyer la demande'}
        </button>
      </form>
    </main>
  );
}
