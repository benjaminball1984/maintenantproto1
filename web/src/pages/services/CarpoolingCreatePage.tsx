import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IconArrowLeft, IconCar } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  CARPOOLING_CITY_MAX,
  CARPOOLING_CITY_MIN,
  CARPOOLING_NOTES_MAX,
  CARPOOLING_PRICE_MAX,
  CARPOOLING_SEATS_MAX,
  CARPOOLING_SEATS_MIN,
  createCarpooling,
  validateCarpoolingInput,
  type CreateCarpoolingField,
  type CreateCarpoolingInput,
} from '@/lib/carpooling';
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

type FieldErrors = Partial<Record<CreateCarpoolingField, string>>;

function combineDateTime(date: string, time: string): string {
  if (!date) return '';
  const localPart = time ? `${date}T${time}:00` : `${date}T08:00:00`;
  const parsed = new Date(localPart);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString();
}

export default function CarpoolingCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [originCity, setOriginCity] = useState<string>('');
  const [destinationCity, setDestinationCity] = useState<string>('');
  const [departsDate, setDepartsDate] = useState<string>('');
  const [departsTime, setDepartsTime] = useState<string>('08:00');
  const [seats, setSeats] = useState<string>('3');
  const [priceEur, setPriceEur] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setErrors({});
    setGlobalError(null);

    const seatsValue = Number.parseInt(seats, 10);
    const priceValue = Number.parseFloat(priceEur);
    const departsAt = combineDateTime(departsDate, departsTime);

    const input: CreateCarpoolingInput = {
      driverId: user.id,
      originCity,
      destinationCity,
      departsAt: departsAt || departsDate,
      seats: Number.isFinite(seatsValue) ? seatsValue : Number.NaN,
      priceEur: Number.isFinite(priceValue) ? priceValue : 0,
      notes: notes.trim() ? notes : null,
    };
    const issues = validateCarpoolingInput(input);
    if (issues.length > 0) {
      const nextErrors: FieldErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await createCarpooling(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ?? 'Impossible de publier le trajet. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    navigate(`/services/carpooling/${data.id}`, { replace: true });
  };

  return (
    <main style={pageStyle}>
      <Link to="/services/carpooling" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux covoiturages
      </Link>
      <h1 style={titleStyle}>Proposer un trajet</h1>
      <p style={leadStyle}>
        Indiquez votre itinéraire et la date de départ. Précisez le tarif (gratuit ou contribution
        carburant) et les détails utiles dans les notes.
      </p>

      <form onSubmit={handleSubmit} style={formStyle} aria-label="Création d'un covoiturage" noValidate>
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="carpool-origin" style={labelStyle}>
              Ville de départ
            </label>
            <input
              id="carpool-origin"
              type="text"
              value={originCity}
              onChange={(event) => setOriginCity(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.originCity)}
            />
            <span style={helpStyle}>
              Entre {CARPOOLING_CITY_MIN} et {CARPOOLING_CITY_MAX} caractères.
            </span>
            {errors.originCity && <span style={errorTextStyle}>{errors.originCity}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="carpool-destination" style={labelStyle}>
              Ville d’arrivée
            </label>
            <input
              id="carpool-destination"
              type="text"
              value={destinationCity}
              onChange={(event) => setDestinationCity(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.destinationCity)}
            />
            <span style={helpStyle}>
              Entre {CARPOOLING_CITY_MIN} et {CARPOOLING_CITY_MAX} caractères.
            </span>
            {errors.destinationCity && (
              <span style={errorTextStyle}>{errors.destinationCity}</span>
            )}
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="carpool-date" style={labelStyle}>
              Date de départ
            </label>
            <input
              id="carpool-date"
              type="date"
              value={departsDate}
              onChange={(event) => setDepartsDate(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.departsAt)}
            />
            {errors.departsAt && <span style={errorTextStyle}>{errors.departsAt}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="carpool-time" style={labelStyle}>
              Heure de départ
            </label>
            <input
              id="carpool-time"
              type="time"
              value={departsTime}
              onChange={(event) => setDepartsTime(event.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="carpool-seats" style={labelStyle}>
              Places disponibles
            </label>
            <input
              id="carpool-seats"
              type="number"
              min={CARPOOLING_SEATS_MIN}
              max={CARPOOLING_SEATS_MAX}
              value={seats}
              onChange={(event) => setSeats(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.seats)}
            />
            <span style={helpStyle}>
              Entre {CARPOOLING_SEATS_MIN} et {CARPOOLING_SEATS_MAX} places.
            </span>
            {errors.seats && <span style={errorTextStyle}>{errors.seats}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="carpool-price" style={labelStyle}>
              Tarif (€ par passager)
            </label>
            <input
              id="carpool-price"
              type="number"
              min={0}
              max={CARPOOLING_PRICE_MAX}
              step="0.5"
              value={priceEur}
              onChange={(event) => setPriceEur(event.target.value)}
              style={inputStyle}
              aria-invalid={Boolean(errors.priceEur)}
            />
            <span style={helpStyle}>0 € si gratuit, sinon contribution carburant.</span>
            {errors.priceEur && <span style={errorTextStyle}>{errors.priceEur}</span>}
          </div>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="carpool-notes" style={labelStyle}>
            Notes (facultatif)
          </label>
          <textarea
            id="carpool-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            style={textareaStyle}
            aria-invalid={Boolean(errors.notes)}
            aria-describedby="carpool-notes-help"
            maxLength={CARPOOLING_NOTES_MAX + 10}
          />
          <span id="carpool-notes-help" style={helpStyle}>
            Détails utiles : point de rendez-vous, événement ciblé, contraintes…
          </span>
          {errors.notes && <span style={errorTextStyle}>{errors.notes}</span>}
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          style={busy ? submitDisabledStyle : submitStyle}
        >
          <IconCar />
          {busy ? 'Publication…' : 'Publier le trajet'}
        </button>
      </form>
    </main>
  );
}
