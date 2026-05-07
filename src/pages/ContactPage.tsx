import { useState } from 'react';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Nom trop court'),
  email: z.string().trim().email('Email invalide'),
  subject: z.string().trim().min(2, 'Sujet trop court'),
  message: z.string().trim().min(10, 'Message trop court').max(5000),
  hp: z.string().max(0).optional(),
});

type ContactValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof ContactValues, string>>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const values = Object.fromEntries(fd) as Record<string, string>;
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Partial<Record<keyof ContactValues, string>> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as keyof ContactValues] = i.message;
      });
      setErrors(errs);
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error('mail failed');
      setStatus('sent');
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="container mx-auto px-4 py-12 max-w-xl">
      <h1 className="font-display text-4xl text-bca-green-dark mb-3">Contact</h1>
      <p className="text-ink-muted mb-8">
        Une question, une proposition, un volume important de matériel à commander ? Nous
        vous répondons sous quelques jours.
      </p>

      {status === 'sent' ? (
        <div role="status" className="rounded-2xl bg-bca-green-light/30 text-bca-green-dark p-6">
          <p className="font-semibold">Merci, votre message a été transmis.</p>
          <p className="text-sm mt-2">L'équipe Bio Consom'acteurs vous répondra dès que possible.</p>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="space-y-4 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-bca-green-dark/10"
        >
          <Field label="Votre nom" name="name" required error={errors.name} />
          <Field label="Email" name="email" type="email" required error={errors.email} />
          <Field label="Sujet" name="subject" required error={errors.subject} />

          <label className="block">
            <span className="block text-sm font-medium text-ink mb-1">
              Message <span className="text-alert">*</span>
            </span>
            <textarea
              name="message"
              rows={6}
              required
              aria-invalid={!!errors.message}
              className={`w-full rounded-xl border px-4 py-3 text-base bg-white outline-none focus:border-bca-green-dark focus:ring-2 focus:ring-bca-green-dark/20 ${
                errors.message ? 'border-alert' : 'border-ink/15'
              }`}
            />
            {errors.message && (
              <span className="mt-1 block text-sm text-alert">{errors.message}</span>
            )}
          </label>

          <input type="text" name="hp" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

          {status === 'error' && (
            <div role="alert" className="rounded-lg bg-alert/10 text-alert px-4 py-3 text-sm">
              L'envoi a échoué. Vous pouvez aussi écrire à contact@bioconsomacteurs.org.
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="btn-primary w-full disabled:opacity-60"
          >
            {status === 'sending' ? 'Envoi…' : 'Envoyer'}
          </button>
        </form>
      )}
    </section>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const Field = ({ label, error, name, required, type = 'text', ...rest }: FieldProps) => (
  <label htmlFor={`c-${name}`} className="block">
    <span className="block text-sm font-medium text-ink mb-1">
      {label} {required && <span className="text-alert">*</span>}
    </span>
    <input
      id={`c-${name}`}
      name={name}
      type={type}
      required={required}
      aria-invalid={!!error}
      className={`w-full rounded-xl border px-4 py-3 text-base bg-white outline-none focus:border-bca-green-dark focus:ring-2 focus:ring-bca-green-dark/20 ${
        error ? 'border-alert' : 'border-ink/15'
      }`}
      {...rest}
    />
    {error && <span className="mt-1 block text-sm text-alert">{error}</span>}
  </label>
);
