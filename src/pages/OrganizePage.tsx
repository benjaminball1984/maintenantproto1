import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Eye, ArrowRight } from 'lucide-react';
import EstablishmentAutocomplete from '@/components/EstablishmentAutocomplete';
import { LeafIcon, FlagIcon } from '@/components/decor/Decor';
import { supabase } from '@/lib/supabase';
import { loadSignatureLocally } from '@/lib/storage';
import type { Establishment } from '@/lib/establishments';

type CustomLocation = {
  name: string;
  postalCode: string;
  city: string;
};

const today = new Date().toISOString().slice(0, 10);
const maxDateIso = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().slice(0, 10);
})();

export default function OrganizePage() {
  const navigate = useNavigate();
  const signature = useMemo(() => loadSignatureLocally(), []);

  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [customLocation, setCustomLocation] = useState<CustomLocation>({
    name: '',
    postalCode: '',
    city: '',
  });

  const [date, setDate] = useState('');
  const [start, setStart] = useState('16:30');
  const [end, setEnd] = useState('17:30');

  const [phone, setPhone] = useState(signature?.phone ?? '');
  const [publicVisible, setPublicVisible] = useState(true);
  const [contactable, setContactable] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Organiser une distribution — Pas de pesticides pour nos enfants';
  }, []);

  // Garde-fou : pas de signature → on redirige vers /signer en gardant la cible
  useEffect(() => {
    if (!signature?.id) {
      // pas de redirection auto, on affiche juste le bandeau d'invitation
    }
  }, [signature]);

  const locationValid = customMode
    ? customLocation.name.trim().length >= 2 &&
      /^\d{5}$/.test(customLocation.postalCode.trim()) &&
      customLocation.city.trim().length >= 2
    : !!establishment;

  const dateValid = date >= today && date <= maxDateIso;
  const timeValid = start < end;
  const formValid = locationValid && dateValid && timeValid;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!signature?.id) {
      setError('Vous devez signer la pétition avant d\'organiser une distribution.');
      return;
    }
    if (!formValid) {
      setError('Renseignez le lieu, la date et les horaires (heure de fin > début).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        signature_id: signature.id,
        establishment_uai: customMode ? null : establishment?.uai ?? null,
        custom_location: customMode ? customLocation.name.trim() : null,
        custom_postal_code: customMode ? customLocation.postalCode.trim() : null,
        custom_city: customMode ? customLocation.city.trim() : null,
        custom_latitude: null,
        custom_longitude: null,
        date,
        start_time: `${start}:00`,
        end_time: `${end}:00`,
        organizer_first_name: signature.firstName,
        organizer_email: signature.email,
        organizer_phone: phone || null,
        is_public_visible: publicVisible,
        is_organizer_contactable: contactable,
      };

      const { data, error: dbErr } = await supabase
        .from('distributions')
        .insert(payload)
        .select('id')
        .single();

      if (dbErr || !data) {
        console.error(dbErr);
        setError("Une erreur s'est produite. Réessayez dans un instant.");
        return;
      }

      const distributionId = (data as { id: string }).id;

      // mail de confirmation (fire-and-forget)
      fetch('/.netlify/functions/send-distribution-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distributionId }),
      }).catch(() => undefined);

      navigate(`/organiser/confirmation?id=${distributionId}`, { replace: true });
    } catch (err) {
      console.error(err);
      setError("Impossible de joindre le serveur.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-bca-cream py-12 md:py-16 relative overflow-hidden">
      <LeafIcon className="absolute top-8 right-4 w-20 h-20 md:w-28 md:h-28 opacity-30" aria-hidden />
      <FlagIcon className="absolute bottom-12 left-4 w-16 h-16 md:w-20 md:h-20 opacity-30" aria-hidden />

      <div className="container mx-auto px-4 max-w-2xl relative">
        <p className="text-sm uppercase tracking-widest text-bca-orange font-semibold">
          Action sur le terrain
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-bca-green-dark mt-2">
          Organiser une distribution
        </h1>
        <p className="text-ink-muted mt-3 md:text-lg">
          Tenez une table de signature devant un établissement scolaire ou sur un
          événement local. Voici comment, étape par étape.
        </p>

        {!signature?.id && (
          <div
            role="alert"
            className="mt-6 rounded-2xl bg-alert/10 border border-alert px-5 py-4 text-alert"
          >
            <p className="font-semibold">Vous n'avez pas encore signé la pétition.</p>
            <p className="text-sm mt-1">
              <Link to="/signer?next=/organiser" className="underline font-semibold">
                Signer la pétition d'abord
              </Link>{' '}
              — quelques secondes, puis vous reviendrez ici.
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          {/* OÙ */}
          <div className="bg-white rounded-2xl shadow-sm border border-bca-green-dark/10 p-6">
            <h2 className="font-display text-2xl text-bca-green-dark mb-4">
              1. Où ?
            </h2>

            {!customMode ? (
              <EstablishmentAutocomplete
                value={establishment}
                onChange={setEstablishment}
                onUseCustom={() => {
                  setEstablishment(null);
                  setCustomMode(true);
                }}
              />
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-ink-muted">Lieu personnalisé</p>
                  <button
                    type="button"
                    onClick={() => setCustomMode(false)}
                    className="text-sm underline text-bca-green-dark"
                  >
                    Rechercher un établissement
                  </button>
                </div>
                <Field
                  label="Nom du lieu"
                  required
                  placeholder="ex. Marché de Belleville, Place de la mairie…"
                  value={customLocation.name}
                  onChange={(v) => setCustomLocation({ ...customLocation, name: v })}
                />
                <div className="grid md:grid-cols-[150px_1fr] gap-3">
                  <Field
                    label="Code postal"
                    required
                    inputMode="numeric"
                    maxLength={5}
                    value={customLocation.postalCode}
                    onChange={(v) =>
                      setCustomLocation({
                        ...customLocation,
                        postalCode: v.replace(/\D/g, '').slice(0, 5),
                      })
                    }
                  />
                  <Field
                    label="Ville"
                    required
                    value={customLocation.city}
                    onChange={(v) => setCustomLocation({ ...customLocation, city: v })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* QUAND */}
          <div className="bg-white rounded-2xl shadow-sm border border-bca-green-dark/10 p-6">
            <h2 className="font-display text-2xl text-bca-green-dark mb-4">
              2. Quand ?
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="block text-sm font-medium text-ink mb-1">
                  Date <span className="text-alert">*</span>
                </span>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
                    aria-hidden
                  />
                  <input
                    type="date"
                    required
                    min={today}
                    max={maxDateIso}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-ink/15 bg-white pl-9 pr-3 py-3 text-base outline-none focus:border-bca-green-dark focus:ring-2 focus:ring-bca-green-dark/20"
                  />
                </div>
              </label>
              <TimeField label="Début" value={start} onChange={setStart} />
              <TimeField label="Fin" value={end} onChange={setEnd} />
            </div>
            {!timeValid && (
              <p className="text-sm text-alert mt-2">
                L'heure de fin doit être après l'heure de début.
              </p>
            )}
          </div>

          {/* QUI */}
          <div className="bg-white rounded-2xl shadow-sm border border-bca-green-dark/10 p-6">
            <h2 className="font-display text-2xl text-bca-green-dark mb-4 flex items-center gap-2">
              <Users size={22} aria-hidden /> 3. Qui ?
            </h2>
            {signature ? (
              <>
                <div className="rounded-xl bg-bca-cream p-4 text-sm">
                  <p className="font-medium">
                    {signature.firstName} {signature.lastName}
                  </p>
                  <p className="text-ink-muted">{signature.email}</p>
                </div>
                <div className="mt-4">
                  <Field
                    label="Téléphone (facultatif)"
                    placeholder="Pour qu'on vous contacte si besoin"
                    type="tel"
                    value={phone ?? ''}
                    onChange={setPhone}
                  />
                </div>
              </>
            ) : (
              <p className="text-ink-muted text-sm">
                Vous serez identifié·e via votre signature de la pétition.
              </p>
            )}
          </div>

          {/* VISIBILITÉ */}
          <div className="bg-white rounded-2xl shadow-sm border border-bca-green-dark/10 p-6">
            <h2 className="font-display text-2xl text-bca-green-dark mb-4 flex items-center gap-2">
              <Eye size={22} aria-hidden /> 4. Visibilité
            </h2>

            <Checkbox
              checked={publicVisible}
              onChange={setPublicVisible}
              label="Mon point de distribution apparaît sur la carte publique pour que d'autres mobilisé·es puissent me rejoindre."
            />
            <Checkbox
              checked={contactable}
              onChange={setContactable}
              label="Mon prénom et mon contact sont visibles aux autres mobilisé·es du secteur (sinon, ils me contactent via un formulaire interne anonymisé)."
            />
            <p className="text-xs text-ink-muted mt-3 italic">
              Par défaut, votre événement apparaît de manière anonyme — vos coordonnées
              ne sont jamais publiques sans votre consentement explicite.
            </p>
          </div>

          {error && (
            <div role="alert" className="rounded-lg bg-alert/10 text-alert px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!signature?.id || !formValid || submitting}
            className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Enregistrement…' : 'Enregistrer ma distribution'}
            <ArrowRight size={20} aria-hidden />
          </button>
        </form>
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
};

const Field = ({ label, value, onChange, required, type = 'text', placeholder, inputMode, maxLength }: FieldProps) => {
  const id = `f-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <label htmlFor={id} className="block">
      <span className="block text-sm font-medium text-ink mb-1">
        {label} {required && <span className="text-alert">*</span>}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-base outline-none focus:border-bca-green-dark focus:ring-2 focus:ring-bca-green-dark/20"
      />
    </label>
  );
};

const TimeField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const id = `t-${label.toLowerCase()}`;
  return (
    <label htmlFor={id} className="block">
      <span className="block text-sm font-medium text-ink mb-1">
        {label} <span className="text-alert">*</span>
      </span>
      <div className="relative">
        <Clock
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
          aria-hidden
        />
        <input
          id={id}
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full rounded-xl border border-ink/15 bg-white pl-9 pr-3 py-3 text-base outline-none focus:border-bca-green-dark focus:ring-2 focus:ring-bca-green-dark/20"
        />
      </div>
    </label>
  );
};

const Checkbox = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) => (
  <label className="flex gap-3 items-start cursor-pointer text-sm py-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 h-5 w-5 rounded border-ink/30 text-bca-green-dark focus:ring-bca-green-dark/30"
    />
    <span className="text-ink leading-snug">{label}</span>
  </label>
);
