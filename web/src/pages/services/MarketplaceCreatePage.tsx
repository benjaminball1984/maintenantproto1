import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IconArrowLeft, IconCart } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  MARKETPLACE_CATEGORY_MAX,
  MARKETPLACE_CATEGORY_MIN,
  MARKETPLACE_CITY_MAX,
  MARKETPLACE_CITY_MIN,
  MARKETPLACE_DESCRIPTION_MAX,
  MARKETPLACE_PRICE_MAX,
  MARKETPLACE_T99CP_MAX,
  MARKETPLACE_TITLE_MAX,
  MARKETPLACE_TITLE_MIN,
  createMarketplaceItem,
  validateMarketplaceInput,
  type CreateMarketplaceField,
  type CreateMarketplaceInput,
} from '@/lib/marketplace';
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

type FieldErrors = Partial<Record<CreateMarketplaceField, string>>;

export default function MarketplaceCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [priceEur, setPriceEur] = useState<string>('');
  const [t99cpCost, setT99cpCost] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setErrors({});
    setGlobalError(null);

    const priceValue = priceEur.trim() ? Number.parseFloat(priceEur) : null;
    const costValue = t99cpCost.trim() ? Number.parseInt(t99cpCost, 10) : null;

    const input: CreateMarketplaceInput = {
      sellerId: user.id,
      title,
      description: description.trim() ? description : null,
      category,
      city,
      priceEur: priceValue !== null && Number.isFinite(priceValue) ? priceValue : null,
      t99cpCost: costValue !== null && Number.isFinite(costValue) ? costValue : null,
    };
    const issues = validateMarketplaceInput(input);
    if (issues.length > 0) {
      const nextErrors: FieldErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await createMarketplaceItem(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ?? 'Impossible de publier l’annonce. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    navigate(`/services/marketplace/${data.id}`, { replace: true });
  };

  return (
    <main style={pageStyle}>
      <Link to="/services/marketplace" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux annonces
      </Link>
      <h1 style={titleStyle}>Publier une annonce</h1>
      <p style={leadStyle}>
        Décrivez ce que vous vendez ou échangez. Renseignez un prix en euros, un coût en T99CP,
        ou les deux.
      </p>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
        aria-label="Création d’une annonce marketplace"
        noValidate
      >
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="market-title" style={labelStyle}>
            Titre
          </label>
          <input
            id="market-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.title)}
          />
          <span style={helpStyle}>
            Entre {MARKETPLACE_TITLE_MIN} et {MARKETPLACE_TITLE_MAX} caractères.
          </span>
          {errors.title && <span style={errorTextStyle}>{errors.title}</span>}
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="market-category" style={labelStyle}>
              Catégorie
            </label>
            <input
              id="market-category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.category)}
            />
            <span style={helpStyle}>
              Entre {MARKETPLACE_CATEGORY_MIN} et {MARKETPLACE_CATEGORY_MAX} caractères.
            </span>
            {errors.category && <span style={errorTextStyle}>{errors.category}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="market-city" style={labelStyle}>
              Ville
            </label>
            <input
              id="market-city"
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
              style={inputStyle}
              aria-invalid={Boolean(errors.city)}
            />
            <span style={helpStyle}>
              Entre {MARKETPLACE_CITY_MIN} et {MARKETPLACE_CITY_MAX} caractères.
            </span>
            {errors.city && <span style={errorTextStyle}>{errors.city}</span>}
          </div>
        </div>

        <div style={fieldRowStyle}>
          <div style={fieldStyle}>
            <label htmlFor="market-price" style={labelStyle}>
              Prix en euros (facultatif)
            </label>
            <input
              id="market-price"
              type="number"
              min={0}
              max={MARKETPLACE_PRICE_MAX}
              step="0.5"
              value={priceEur}
              onChange={(event) => setPriceEur(event.target.value)}
              style={inputStyle}
              aria-invalid={Boolean(errors.priceEur)}
            />
            <span style={helpStyle}>Renseignez au moins un prix en euros OU T99CP.</span>
            {errors.priceEur && <span style={errorTextStyle}>{errors.priceEur}</span>}
          </div>
          <div style={fieldStyle}>
            <label htmlFor="market-t99cp" style={labelStyle}>
              Coût en T99CP (facultatif)
            </label>
            <input
              id="market-t99cp"
              type="number"
              min={0}
              max={MARKETPLACE_T99CP_MAX}
              step={1}
              value={t99cpCost}
              onChange={(event) => setT99cpCost(event.target.value)}
              style={inputStyle}
              aria-invalid={Boolean(errors.t99cpCost)}
            />
            <span style={helpStyle}>Échange en T99CP plutôt qu’en euros.</span>
            {errors.t99cpCost && <span style={errorTextStyle}>{errors.t99cpCost}</span>}
          </div>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="market-description" style={labelStyle}>
            Description (facultatif)
          </label>
          <textarea
            id="market-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            style={textareaStyle}
            aria-invalid={Boolean(errors.description)}
            maxLength={MARKETPLACE_DESCRIPTION_MAX + 10}
          />
          <span style={helpStyle}>
            Jusqu’à {MARKETPLACE_DESCRIPTION_MAX} caractères.
          </span>
          {errors.description && <span style={errorTextStyle}>{errors.description}</span>}
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          style={busy ? submitDisabledStyle : submitStyle}
        >
          <IconCart />
          {busy ? 'Publication…' : 'Publier l’annonce'}
        </button>
      </form>
    </main>
  );
}
