import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IconArrowLeft, IconPen } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  createMobilization,
  MOBILIZATION_BODY_MIN,
  MOBILIZATION_CITY_MAX,
  MOBILIZATION_CITY_MIN,
  MOBILIZATION_SUMMARY_MAX,
  MOBILIZATION_SUMMARY_MIN,
  MOBILIZATION_TITLE_MAX,
  MOBILIZATION_TITLE_MIN,
  validateMobilizationInput,
  type CreateMobilizationInput,
} from '@/lib/mobilizations';
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

type FieldErrors = Partial<Record<keyof CreateMobilizationInput, string>>;

export default function MobilizationCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [startsAtDate, setStartsAtDate] = useState<string>('');
  const [startsAtTime, setStartsAtTime] = useState<string>('');
  const [endsAtDate, setEndsAtDate] = useState<string>('');
  const [endsAtTime, setEndsAtTime] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const combineDateTime = (date: string, time: string): string => {
    if (!date) return '';
    const isoTime = time ? `${time}:00` : '00:00:00';
    const parsed = new Date(`${date}T${isoTime}`);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setErrors({});
    setGlobalError(null);

    const startsAt = combineDateTime(startsAtDate, startsAtTime);
    const endsAt = endsAtDate ? combineDateTime(endsAtDate, endsAtTime) : undefined;

    const trimmedBody = body.trim();
    const trimmedAddress = address.trim();
    const trimmedCover = coverUrl.trim();

    const input: CreateMobilizationInput = {
      organizerId: user.id,
      title,
      summary,
      body: trimmedBody ? trimmedBody : null,
      city,
      address: trimmedAddress ? trimmedAddress : null,
      startsAt,
      endsAt: endsAt ? endsAt : null,
      coverUrl: trimmedCover ? trimmedCover : null,
    };
    const issues = validateMobilizationInput(input);
    if (issues.length > 0) {
      const nextErrors: FieldErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await createMobilization(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ?? 'Impossible de créer la mobilisation. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    navigate(`/mobilizations/${data.slug}`, { replace: true });
  };

  return (
    <main style={pageStyle}>
      <Link to="/mobilizations" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux mobilisations
      </Link>
      <h1 style={titleStyle}>Créer un événement</h1>
      <p style={leadStyle}>
        Annoncez votre marche, AG, camp militant ou festival. Une fiche bien renseignée rassemble
        plus de monde : précisez la date, le lieu et le contexte.
      </p>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
        aria-label="Création d'une mobilisation"
        noValidate
      >
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="mob-title" style={labelStyle}>
            Titre de la mobilisation
          </label>
          <input
            id="mob-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={MOBILIZATION_TITLE_MAX + 10}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.title)}
            aria-describedby="mob-title-help"
          />
          <span id="mob-title-help" style={helpStyle}>
            Entre {MOBILIZATION_TITLE_MIN} et {MOBILIZATION_TITLE_MAX} caractères.
          </span>
          {errors.title && <span style={errorTextStyle}>{errors.title}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="mob-summary" style={labelStyle}>
            Résumé court
          </label>
          <textarea
            id="mob-summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            style={{ ...textareaStyle, minHeight: 80 }}
            aria-invalid={Boolean(errors.summary)}
            aria-describedby="mob-summary-help"
          />
          <span id="mob-summary-help" style={helpStyle}>
            Entre {MOBILIZATION_SUMMARY_MIN} et {MOBILIZATION_SUMMARY_MAX} caractères — visible dans
            la liste.
          </span>
          {errors.summary && <span style={errorTextStyle}>{errors.summary}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="mob-body" style={labelStyle}>
            Présentation détaillée (facultatif)
          </label>
          <textarea
            id="mob-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            style={textareaStyle}
            aria-invalid={Boolean(errors.body)}
            aria-describedby="mob-body-help"
          />
          <span id="mob-body-help" style={helpStyle}>
            Au moins {MOBILIZATION_BODY_MIN} caractères si renseigné. Programme, mot d&apos;ordre,
            parcours…
          </span>
          {errors.body && <span style={errorTextStyle}>{errors.body}</span>}
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="mob-city" style={labelStyle}>
              Ville
            </label>
            <input
              id="mob-city"
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.city)}
            />
            <span style={helpStyle}>
              Entre {MOBILIZATION_CITY_MIN} et {MOBILIZATION_CITY_MAX} caractères.
            </span>
            {errors.city && <span style={errorTextStyle}>{errors.city}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="mob-address" style={labelStyle}>
              Adresse précise (facultatif)
            </label>
            <input
              id="mob-address"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              style={inputStyle}
              placeholder="Place de la République"
            />
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="mob-starts-date" style={labelStyle}>
              Date de début
            </label>
            <input
              id="mob-starts-date"
              type="date"
              value={startsAtDate}
              onChange={(event) => setStartsAtDate(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.startsAt)}
            />
            {errors.startsAt && <span style={errorTextStyle}>{errors.startsAt}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="mob-starts-time" style={labelStyle}>
              Heure de début
            </label>
            <input
              id="mob-starts-time"
              type="time"
              value={startsAtTime}
              onChange={(event) => setStartsAtTime(event.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="mob-ends-date" style={labelStyle}>
              Date de fin (facultatif)
            </label>
            <input
              id="mob-ends-date"
              type="date"
              value={endsAtDate}
              onChange={(event) => setEndsAtDate(event.target.value)}
              style={inputStyle}
              aria-invalid={Boolean(errors.endsAt)}
            />
            {errors.endsAt && <span style={errorTextStyle}>{errors.endsAt}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="mob-ends-time" style={labelStyle}>
              Heure de fin
            </label>
            <input
              id="mob-ends-time"
              type="time"
              value={endsAtTime}
              onChange={(event) => setEndsAtTime(event.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="mob-cover" style={labelStyle}>
            Image de couverture (URL, facultatif)
          </label>
          <input
            id="mob-cover"
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
          {busy ? 'Publication…' : 'Publier la mobilisation'}
        </button>
      </form>
    </main>
  );
}
