import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import { IconArrowLeft, IconCart, IconCheckCircle } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  CONTRIBUTION_AMOUNT_MAX,
  CONTRIBUTION_AMOUNT_MIN,
  contribute,
  validateContribution,
  type ContributeInput,
} from '@/lib/crowdfunding';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useCrowdfundingItem } from '@/hooks/useCrowdfundingItem';

const pageStyle: CSSProperties = {
  maxWidth: 600,
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
  margin: '0 0 8px',
  letterSpacing: '-0.02em',
  color: 'var(--mn-text-1)',
};

const subtitleStyle: CSSProperties = {
  fontSize: 15,
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
  height: 48,
  padding: '0 14px',
  borderRadius: 10,
  border: '1.5px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  fontSize: 16,
  color: 'var(--mn-text-1)',
  fontFamily: 'inherit',
};

const errorTextStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--mn-danger)',
};

const checkboxRowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
  color: 'var(--mn-text-2)',
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
  background: '#ecfdf5',
  borderRadius: 12,
  padding: '12px 16px',
  color: '#047857',
  border: '1px solid #a7f3d0',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};

export default function CrowdfundingContributePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { campaign, status, error: loadError } = useCrowdfundingItem(id);

  const [amount, setAmount] = useState<string>('10');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (status === 'notfound') {
    return <Navigate to="/services/crowdfunding" replace />;
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <main style={pageStyle}>
        <p role="status" aria-live="polite" style={{ color: 'var(--mn-text-3)' }}>
          Chargement de la cagnotte…
        </p>
      </main>
    );
  }

  if (status === 'error' || !campaign) {
    return (
      <main style={pageStyle}>
        <div role="alert" style={errorBoxStyle}>
          {postgrestErrorMessage(loadError) ?? 'Cagnotte introuvable.'}
        </div>
        <Link to="/services/crowdfunding" style={backLinkStyle}>
          <IconArrowLeft /> Retour aux cagnottes
        </Link>
      </main>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !campaign) return;
    setBusy(true);
    setFieldError(null);
    setGlobalError(null);

    const amountValue = Number.parseFloat(amount);
    const input: ContributeInput = {
      campaignId: campaign.id,
      contributorId: user.id,
      amountEur: Number.isFinite(amountValue) ? amountValue : Number.NaN,
      isAnonymous,
    };
    const issues = validateContribution(input);
    if (issues.length > 0) {
      setFieldError(issues[0]?.message ?? 'Montant invalide.');
      setBusy(false);
      return;
    }

    const { data, error } = await contribute(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ??
          'Impossible d’enregistrer la contribution. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    setSuccess(true);
    setBusy(false);
    setTimeout(() => {
      navigate(`/services/crowdfunding/${campaign.id}`, { replace: true });
    }, 1500);
  };

  return (
    <main style={pageStyle}>
      <Link to={`/services/crowdfunding/${campaign.id}`} style={backLinkStyle}>
        <IconArrowLeft /> Retour à la cagnotte
      </Link>
      <h1 style={titleStyle}>Contribuer</h1>
      <p style={subtitleStyle}>{campaign.title}</p>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
        aria-label="Formulaire de contribution"
        noValidate
      >
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}
        {success && (
          <div role="status" style={successBoxStyle}>
            <IconCheckCircle /> Merci pour votre contribution !
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="cf-amount" style={labelStyle}>
            Montant (€)
          </label>
          <input
            id="cf-amount"
            type="number"
            min={CONTRIBUTION_AMOUNT_MIN}
            max={CONTRIBUTION_AMOUNT_MAX}
            step="0.5"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            style={inputStyle}
            aria-invalid={Boolean(fieldError)}
          />
          <span style={helpStyle}>
            Entre {CONTRIBUTION_AMOUNT_MIN} et {CONTRIBUTION_AMOUNT_MAX} €.
          </span>
          {fieldError && <span style={errorTextStyle}>{fieldError}</span>}
        </div>

        <label style={checkboxRowStyle}>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(event) => setIsAnonymous(event.target.checked)}
          />
          Contribuer de manière anonyme
        </label>

        <button
          type="submit"
          disabled={busy || success}
          aria-busy={busy || undefined}
          style={busy || success ? submitDisabledStyle : submitStyle}
        >
          <IconCart />
          {busy ? 'Enregistrement…' : success ? 'Merci !' : 'Confirmer la contribution'}
        </button>
      </form>
    </main>
  );
}
