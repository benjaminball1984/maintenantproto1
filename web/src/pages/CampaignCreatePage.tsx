import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  IconArrowLeft,
  IconBarChart,
  IconCalendar,
  IconClose,
  IconMegaphone,
  IconPen,
  IconSearch,
} from '@/components/icons';
import { useAuth } from '@/lib/auth';
import {
  CAMPAIGN_ACTIONS_MAX_COUNT,
  CAMPAIGN_ACTIONS_MIN_COUNT,
  CAMPAIGN_BODY_MIN,
  CAMPAIGN_SUMMARY_MAX,
  CAMPAIGN_SUMMARY_MIN,
  CAMPAIGN_TITLE_MAX,
  CAMPAIGN_TITLE_MIN,
  createCampaign,
  validateCampaignInput,
  type CampaignActionRef,
  type CreateCampaignField,
  type CreateCampaignInput,
} from '@/lib/campaigns';
import { listMobilizations, type MobilizationRow } from '@/lib/mobilizations';
import { listPetitions, type PetitionRow } from '@/lib/petitions';
import { listPolls, type PollRow } from '@/lib/polls';
import { postgrestErrorMessage } from '@/lib/postgrestError';

type PickerKind = 'petition' | 'mobilization' | 'poll';

interface SelectedAction extends CampaignActionRef {
  uid: string;
  kind: PickerKind;
  label: string;
}

const pageStyle: CSSProperties = {
  maxWidth: 760,
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

const pickerWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  border: '1px dashed var(--mn-border)',
  borderRadius: 14,
  padding: 14,
  background: 'var(--mn-surface-2)',
};

const pickerTabsStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

const tabStyle: CSSProperties = {
  height: 36,
  padding: '0 14px',
  borderRadius: 999,
  border: '1.5px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-2)',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

const tabActiveStyle: CSSProperties = {
  ...tabStyle,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
  borderColor: 'var(--mn-brand)',
};

const searchRowStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const searchInputStyle: CSSProperties = {
  ...inputStyle,
  paddingLeft: 38,
  width: '100%',
};

const searchIconStyle: CSSProperties = {
  position: 'absolute',
  left: 12,
  color: 'var(--mn-text-3)',
  pointerEvents: 'none',
};

const resultsListStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  maxHeight: 220,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const resultButtonStyle: CSSProperties = {
  width: '100%',
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 10,
  padding: '10px 12px',
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--mn-text-1)',
  textAlign: 'left',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
};

const resultButtonDisabledStyle: CSSProperties = {
  ...resultButtonStyle,
  opacity: 0.6,
  cursor: 'not-allowed',
};

const selectedListStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const selectedItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  background: 'var(--mn-surface)',
  border: '1.5px solid var(--mn-border)',
  borderRadius: 12,
};

const selectedRemoveStyle: CSSProperties = {
  height: 36,
  width: 36,
  borderRadius: 8,
  border: '1px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-text-2)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'inherit',
  flexShrink: 0,
};

const kindBadgeStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--mn-brand-dark)',
  background: 'var(--mn-brand-light)',
  padding: '2px 8px',
  borderRadius: 999,
};

type FieldErrors = Partial<Record<CreateCampaignField, string>>;

function kindLabel(kind: PickerKind): string {
  switch (kind) {
    case 'petition':
      return 'Pétition';
    case 'mobilization':
      return 'Mobilisation';
    case 'poll':
      return 'Sondage';
  }
}

function toRef(item: SelectedAction): CampaignActionRef {
  const base: CampaignActionRef = {
    label: item.label,
  };
  if (item.kind === 'petition') return { ...base, petitionId: item.petitionId };
  if (item.kind === 'mobilization') return { ...base, mobilizationId: item.mobilizationId };
  return { ...base, pollId: item.pollId };
}

function isSelected(selected: SelectedAction[], kind: PickerKind, id: string): boolean {
  return selected.some((s) => {
    if (kind === 'petition') return s.petitionId === id;
    if (kind === 'mobilization') return s.mobilizationId === id;
    return s.pollId === id;
  });
}

export default function CampaignCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [selected, setSelected] = useState<SelectedAction[]>([]);
  const [pickerKind, setPickerKind] = useState<PickerKind>('petition');
  const [pickerSearch, setPickerSearch] = useState<string>('');
  const [petitions, setPetitions] = useState<PetitionRow[]>([]);
  const [mobilizations, setMobilizations] = useState<MobilizationRow[]>([]);
  const [polls, setPolls] = useState<PollRow[]>([]);
  const [busy, setBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    const term = pickerSearch.trim() || undefined;
    let cancelled = false;
    queueMicrotask(async () => {
      if (pickerKind === 'petition') {
        const { data } = await listPetitions({ search: term, limit: 8 });
        if (!cancelled) setPetitions(data);
      } else if (pickerKind === 'mobilization') {
        const { data } = await listMobilizations({ search: term, limit: 8 });
        if (!cancelled) setMobilizations(data);
      } else {
        const { data } = await listPolls({ search: term, limit: 8 });
        if (!cancelled) setPolls(data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pickerKind, pickerSearch]);

  const addPetition = (item: PetitionRow) => {
    if (selected.length >= CAMPAIGN_ACTIONS_MAX_COUNT) return;
    if (isSelected(selected, 'petition', item.id)) return;
    setSelected((prev) => [
      ...prev,
      {
        uid: `petition-${item.id}`,
        kind: 'petition',
        label: item.title,
        petitionId: item.id,
      },
    ]);
  };
  const addMobilization = (item: MobilizationRow) => {
    if (selected.length >= CAMPAIGN_ACTIONS_MAX_COUNT) return;
    if (isSelected(selected, 'mobilization', item.id)) return;
    setSelected((prev) => [
      ...prev,
      {
        uid: `mobilization-${item.id}`,
        kind: 'mobilization',
        label: item.title,
        mobilizationId: item.id,
      },
    ]);
  };
  const addPoll = (item: PollRow) => {
    if (selected.length >= CAMPAIGN_ACTIONS_MAX_COUNT) return;
    if (isSelected(selected, 'poll', item.id)) return;
    setSelected((prev) => [
      ...prev,
      {
        uid: `poll-${item.id}`,
        kind: 'poll',
        label: item.question,
        pollId: item.id,
      },
    ]);
  };

  const removeSelected = (uid: string) => {
    setSelected((prev) => prev.filter((s) => s.uid !== uid));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setErrors({});
    setGlobalError(null);

    const input: CreateCampaignInput = {
      authorId: user.id,
      title,
      summary,
      body: body.trim() ? body : null,
      actions: selected.map(toRef),
    };
    const issues = validateCampaignInput(input);
    if (issues.length > 0) {
      const nextErrors: FieldErrors = {};
      for (const issue of issues) {
        nextErrors[issue.field] = issue.message;
      }
      setErrors(nextErrors);
      setBusy(false);
      return;
    }

    const { data, error } = await createCampaign(input);
    if (error || !data) {
      setGlobalError(
        postgrestErrorMessage(error) ?? 'Impossible de créer la campagne. Réessayez plus tard.',
      );
      setBusy(false);
      return;
    }
    navigate(`/campaigns/${data.campaign.slug}`, { replace: true });
  };

  return (
    <main style={pageStyle}>
      <Link to="/campaigns" style={backLinkStyle}>
        <IconArrowLeft /> Retour aux campagnes
      </Link>
      <h1 style={titleStyle}>Lancer une campagne</h1>
      <p style={leadStyle}>
        Définissez un objectif clair, racontez la lutte, puis associez les actions concrètes —
        pétitions à signer, mobilisations à rejoindre, sondages à voter. Une campagne efficace
        oriente les soutiens, étape par étape.
      </p>

      <form
        onSubmit={handleSubmit}
        style={formStyle}
        aria-label="Création d'une campagne"
        noValidate
      >
        {globalError && (
          <div role="alert" style={errorBoxStyle}>
            {globalError}
          </div>
        )}

        <div style={fieldStyle}>
          <label htmlFor="campaign-title" style={labelStyle}>
            Titre de la campagne
          </label>
          <input
            id="campaign-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={CAMPAIGN_TITLE_MAX + 10}
            required
            style={inputStyle}
            aria-invalid={Boolean(errors.title)}
            aria-describedby="campaign-title-help"
          />
          <span id="campaign-title-help" style={helpStyle}>
            Entre {CAMPAIGN_TITLE_MIN} et {CAMPAIGN_TITLE_MAX} caractères.
          </span>
          {errors.title && <span style={errorTextStyle}>{errors.title}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="campaign-summary" style={labelStyle}>
            Résumé
          </label>
          <textarea
            id="campaign-summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            style={textareaStyle}
            aria-invalid={Boolean(errors.summary)}
            aria-describedby="campaign-summary-help"
          />
          <span id="campaign-summary-help" style={helpStyle}>
            Entre {CAMPAIGN_SUMMARY_MIN} et {CAMPAIGN_SUMMARY_MAX} caractères. Une promesse claire.
          </span>
          {errors.summary && <span style={errorTextStyle}>{errors.summary}</span>}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="campaign-body" style={labelStyle}>
            Manifeste détaillé (facultatif)
          </label>
          <textarea
            id="campaign-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            style={{ ...textareaStyle, minHeight: 180 }}
            aria-invalid={Boolean(errors.body)}
            aria-describedby="campaign-body-help"
          />
          <span id="campaign-body-help" style={helpStyle}>
            Si renseigné, au moins {CAMPAIGN_BODY_MIN} caractères. Le contexte long,
            l&apos;histoire, les revendications.
          </span>
          {errors.body && <span style={errorTextStyle}>{errors.body}</span>}
        </div>

        <div style={fieldStyle}>
          <span style={labelStyle}>Actions de la campagne</span>
          <span style={helpStyle}>
            Entre {CAMPAIGN_ACTIONS_MIN_COUNT} et {CAMPAIGN_ACTIONS_MAX_COUNT} actions. Recherchez
            puis cliquez pour ajouter.
          </span>

          {selected.length > 0 && (
            <ul aria-label="Actions sélectionnées" style={selectedListStyle}>
              {selected.map((item) => (
                <li key={item.uid} style={selectedItemStyle}>
                  <span style={kindBadgeStyle}>{kindLabel(item.kind)}</span>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{item.label}</span>
                  <button
                    type="button"
                    onClick={() => removeSelected(item.uid)}
                    aria-label={`Retirer ${item.label}`}
                    style={selectedRemoveStyle}
                  >
                    <IconClose />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div style={pickerWrapStyle}>
            <div style={pickerTabsStyle} role="tablist" aria-label="Type d'action">
              <button
                type="button"
                role="tab"
                aria-selected={pickerKind === 'petition'}
                onClick={() => setPickerKind('petition')}
                style={pickerKind === 'petition' ? tabActiveStyle : tabStyle}
              >
                <IconPen width={14} height={14} /> Pétitions
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={pickerKind === 'mobilization'}
                onClick={() => setPickerKind('mobilization')}
                style={pickerKind === 'mobilization' ? tabActiveStyle : tabStyle}
              >
                <IconCalendar width={14} height={14} /> Mobilisations
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={pickerKind === 'poll'}
                onClick={() => setPickerKind('poll')}
                style={pickerKind === 'poll' ? tabActiveStyle : tabStyle}
              >
                <IconBarChart width={14} height={14} /> Sondages
              </button>
            </div>

            <label style={searchRowStyle}>
              <span style={searchIconStyle} aria-hidden="true">
                <IconSearch />
              </span>
              <span style={{ position: 'absolute', left: -9999 }}>
                Rechercher {kindLabel(pickerKind).toLowerCase()}
              </span>
              <input
                type="search"
                value={pickerSearch}
                onChange={(event) => setPickerSearch(event.target.value)}
                placeholder={`Rechercher une ${kindLabel(pickerKind).toLowerCase()}…`}
                style={searchInputStyle}
                aria-label={`Rechercher une ${kindLabel(pickerKind).toLowerCase()}`}
              />
            </label>

            <ul
              aria-label={`Résultats ${kindLabel(pickerKind).toLowerCase()}s`}
              style={resultsListStyle}
            >
              {pickerKind === 'petition' &&
                petitions.map((item) => {
                  const already = isSelected(selected, 'petition', item.id);
                  const full = selected.length >= CAMPAIGN_ACTIONS_MAX_COUNT;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => addPetition(item)}
                        disabled={already || full}
                        aria-pressed={already}
                        style={already || full ? resultButtonDisabledStyle : resultButtonStyle}
                      >
                        <IconPen width={14} height={14} />
                        <span style={{ flex: 1 }}>{item.title}</span>
                        {already && <span style={kindBadgeStyle}>Sélectionnée</span>}
                      </button>
                    </li>
                  );
                })}
              {pickerKind === 'mobilization' &&
                mobilizations.map((item) => {
                  const already = isSelected(selected, 'mobilization', item.id);
                  const full = selected.length >= CAMPAIGN_ACTIONS_MAX_COUNT;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => addMobilization(item)}
                        disabled={already || full}
                        aria-pressed={already}
                        style={already || full ? resultButtonDisabledStyle : resultButtonStyle}
                      >
                        <IconCalendar width={14} height={14} />
                        <span style={{ flex: 1 }}>{item.title}</span>
                        {already && <span style={kindBadgeStyle}>Sélectionnée</span>}
                      </button>
                    </li>
                  );
                })}
              {pickerKind === 'poll' &&
                polls.map((item) => {
                  const already = isSelected(selected, 'poll', item.id);
                  const full = selected.length >= CAMPAIGN_ACTIONS_MAX_COUNT;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => addPoll(item)}
                        disabled={already || full}
                        aria-pressed={already}
                        style={already || full ? resultButtonDisabledStyle : resultButtonStyle}
                      >
                        <IconBarChart width={14} height={14} />
                        <span style={{ flex: 1 }}>{item.question}</span>
                        {already && <span style={kindBadgeStyle}>Sélectionné</span>}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>

          {errors.actions && <span style={errorTextStyle}>{errors.actions}</span>}
        </div>

        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          style={busy ? submitDisabledStyle : submitStyle}
        >
          <IconMegaphone />
          {busy ? 'Publication…' : 'Publier la campagne'}
        </button>
      </form>
    </main>
  );
}
