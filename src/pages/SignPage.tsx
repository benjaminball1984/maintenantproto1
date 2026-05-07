import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signatureSchema, type SignatureFormValues } from '@/lib/validation';
import { supabase } from '@/lib/supabase';
import { saveSignatureLocally } from '@/lib/storage';
import { LeafIcon } from '@/components/decor/Decor';

type FieldErrors = Partial<Record<keyof SignatureFormValues, { message?: string }>>;

export default function SignPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignatureFormValues>({
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      postalCode: '',
      phone: '',
      consentCampaign: true,
      consentNewsletter: false,
      hp: '',
    },
  });

  const fieldErrors = errors as FieldErrors;

  useEffect(() => {
    document.title = 'Signer la pétition — Pas de pesticides pour nos enfants';
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const utm = {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
      };

      const { data, error } = await supabase
        .from('signatures')
        .insert({
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          postal_code: values.postalCode,
          phone: values.phone ?? null,
          consent_campaign: values.consentCampaign,
          consent_newsletter: values.consentNewsletter,
          ...utm,
        })
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') {
          setError('email', {
            message: 'Cette adresse a déjà signé la pétition. Merci !',
          });
        } else {
          setSubmitError("Une erreur s'est produite. Réessayez dans un instant.");
        }
        return;
      }

      const signatureId = (data as { id: string } | null)?.id;

      saveSignatureLocally({
        id: signatureId,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        postalCode: values.postalCode,
        phone: values.phone ?? null,
      });

      // fire-and-forget : email transactionnel via Netlify Function
      if (signatureId) {
        fetch('/.netlify/functions/send-confirmation-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signatureId }),
        }).catch(() => {
          /* on ne bloque pas l'utilisateur si l'envoi échoue, le webhook BDD pourra rattraper */
        });
      }

      const next = params.get('next');
      navigate(next ?? '/merci', { replace: true });
    } catch (err) {
      console.error(err);
      setSubmitError("Une erreur s'est produite. Réessayez dans un instant.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <section className="bg-bca-cream py-12 md:py-16 relative overflow-hidden">
      <LeafIcon
        className="absolute top-8 right-4 w-20 h-20 md:w-28 md:h-28 opacity-40"
        aria-hidden
      />
      <div className="container mx-auto px-4 max-w-xl relative">
        <p className="text-sm uppercase tracking-widest text-bca-orange font-semibold">
          Pétition
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-bca-green-dark mt-2 mb-3">
          Je signe la pétition
        </h1>
        <p className="text-ink-muted mb-8">
          Quelques secondes suffisent. Vos coordonnées ne seront utilisées que pour cette
          campagne.
        </p>

        <form onSubmit={onSubmit} noValidate className="space-y-5 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-bca-green-dark/10">
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Prénom"
              required
              error={fieldErrors.firstName?.message}
              {...register('firstName')}
            />
            <Field
              label="Nom"
              required
              error={fieldErrors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <Field
            label="Email"
            type="email"
            autoComplete="email"
            required
            error={fieldErrors.email?.message}
            {...register('email')}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Code postal"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              required
              error={fieldErrors.postalCode?.message}
              {...register('postalCode')}
            />
            <Field
              label="Téléphone"
              type="tel"
              autoComplete="tel"
              placeholder="Pour se mobiliser localement (facultatif)"
              error={fieldErrors.phone?.message}
              {...register('phone')}
            />
          </div>

          {/* Honeypot anti-bot */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
            {...register('hp')}
          />

          <fieldset className="space-y-3 pt-2">
            <legend className="sr-only">Consentements</legend>

            <Checkbox
              label="J'accepte d'être recontacté·e par Bio Consom'acteurs dans le cadre de cette campagne."
              {...register('consentCampaign')}
            />

            <Checkbox
              label="Je m'inscris à la newsletter Bio Consom'infos pour rester informé·e des actions de Bio Consom'acteurs au-delà de cette pétition."
              {...register('consentNewsletter')}
            />
          </fieldset>

          <p className="text-xs text-ink-muted leading-relaxed">
            Vos données sont collectées par Bio Consom'acteurs (10 rue Beaumarchais, 93100
            Montreuil) pour les seules fins de cette pétition et, si vous l'acceptez, de
            sa newsletter. Vous pouvez à tout moment exercer vos droits d'accès, de
            rectification et de suppression à{' '}
            <a
              href="mailto:contact@bioconsomacteurs.org"
              className="underline text-bca-green-dark"
            >
              contact@bioconsomacteurs.org
            </a>
            . Plus d'informations dans notre{' '}
            <Link
              to="/politique-confidentialite"
              className="underline text-bca-green-dark"
            >
              politique de confidentialité
            </Link>
            .
          </p>

          {submitError && (
            <div role="alert" className="rounded-lg bg-alert/10 text-alert px-4 py-3 text-sm">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full text-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Envoi…' : 'Je signe la pétition'}
          </button>
        </form>
      </div>
    </section>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const Field = ({ label, error, required, id, ...rest }: FieldProps) => {
  const inputId = id ?? `f-${rest.name}`;
  return (
    <label htmlFor={inputId} className="block">
      <span className="block text-sm font-medium text-ink mb-1">
        {label} {required && <span className="text-alert">*</span>}
      </span>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-err` : undefined}
        className={`w-full rounded-xl border px-4 py-3 text-base bg-white outline-none transition-colors focus:border-bca-green-dark focus:ring-2 focus:ring-bca-green-dark/20 ${
          error ? 'border-alert' : 'border-ink/15'
        }`}
        {...rest}
      />
      {error && (
        <span id={`${inputId}-err`} className="mt-1 block text-sm text-alert">
          {error}
        </span>
      )}
    </label>
  );
};

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

const Checkbox = ({ label, id, ...rest }: CheckboxProps) => {
  const inputId = id ?? `c-${rest.name}`;
  return (
    <label htmlFor={inputId} className="flex gap-3 items-start cursor-pointer text-sm">
      <input
        type="checkbox"
        id={inputId}
        className="mt-0.5 h-5 w-5 rounded border-ink/30 text-bca-green-dark focus:ring-bca-green-dark/30"
        {...rest}
      />
      <span className="text-ink leading-snug">{label}</span>
    </label>
  );
};
