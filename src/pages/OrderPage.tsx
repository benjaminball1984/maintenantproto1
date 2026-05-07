import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, Mail, Truck } from 'lucide-react';
import {
  MATERIALS,
  TOTAL_UNITS_CAP,
  emptyCart,
  totalUnits,
  totalWeightGrams,
  type Cart,
  type MaterialKey,
} from '@/data/materials';
import { calculateShipping, formatEuros } from '@/lib/shipping';
import { loadSignatureLocally } from '@/lib/storage';
import { LeafIcon } from '@/components/decor/Decor';

type AddressForm = {
  street: string;
  complement: string;
  city: string;
  postalCode: string;
};

const emptyAddress: AddressForm = {
  street: '',
  complement: '',
  city: '',
  postalCode: '',
};

export default function OrderPage() {
  const [params] = useSearchParams();
  const fromDistribution = params.get('from') === 'distribution';

  const [cart, setCart] = useState<Cart>(emptyCart);
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signature = useMemo(() => loadSignatureLocally(), []);
  const units = totalUnits(cart);
  const weight = totalWeightGrams(cart);
  const shipping = calculateShipping(weight);
  const overCap = units > TOTAL_UNITS_CAP;
  const empty = units === 0;
  const addressFilled =
    address.street.trim().length >= 4 &&
    address.city.trim().length >= 2 &&
    /^\d{5}$/.test(address.postalCode.trim());

  useEffect(() => {
    document.title = 'Commander du matériel — c\'est gratuit';
  }, []);

  const updateQty = (key: MaterialKey, qty: number) => {
    setCart((c) => ({ ...c, [key]: qty }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!signature?.id) {
      setError(
        'Vous devez signer la pétition avant de commander. Merci de retourner sur la page de signature.',
      );
      return;
    }
    if (empty) {
      setError('Choisissez au moins un format avant de valider.');
      return;
    }
    if (overCap) {
      setError(
        `Plafond de ${TOTAL_UNITS_CAP} unités dépassé. Pour un volume plus important, contactez contact@bioconsomacteurs.org.`,
      );
      return;
    }
    if (!addressFilled) {
      setError('Renseignez une adresse de livraison complète.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signatureId: signature.id,
          cart,
          shipping_address: address.street.trim(),
          shipping_complement: address.complement.trim() || null,
          shipping_city: address.city.trim(),
          shipping_postal_code: address.postalCode.trim(),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(
          data.error ?? "Une erreur s'est produite. Réessayez dans un instant.",
        );
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError("Impossible de joindre le serveur. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-bca-cream py-12 md:py-16 relative overflow-hidden">
      <LeafIcon
        className="absolute top-8 right-4 w-20 h-20 md:w-28 md:h-28 opacity-30"
        aria-hidden
      />

      <div className="container mx-auto px-4 max-w-3xl relative">
        <p className="text-sm uppercase tracking-widest text-bca-orange font-semibold">
          Étape suivante
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-bca-green-dark mt-2">
          Commander du matériel
          <span className="block text-bca-yellow text-3xl md:text-4xl mt-1">
            — gratuitement
          </span>
        </h1>
        <p className="text-ink-muted mt-4 text-base md:text-lg">
          Recevez chez vous des flyers, des affiches et des pétitions papier. Vous ne
          payez que les frais d'envoi, au prix coûtant.
        </p>

        {fromDistribution && (
          <div
            role="status"
            className="mt-6 rounded-2xl bg-bca-yellow/30 border-2 border-bca-yellow px-5 py-4 text-bca-green-dark"
          >
            <p className="font-semibold">
              Votre distribution est enregistrée. Pour la réussir, il vous faut du
              matériel.
            </p>
            <p className="text-sm mt-1">
              Commandez vos flyers maintenant — c'est gratuit, vous ne payez que
              l'envoi.
            </p>
          </div>
        )}

        {!signature?.id && (
          <div
            role="alert"
            className="mt-6 rounded-2xl bg-alert/10 border border-alert px-5 py-4 text-alert"
          >
            <p className="font-semibold">Vous n'avez pas encore signé la pétition.</p>
            <p className="text-sm mt-1">
              <Link
                to="/signer?next=/commander"
                className="underline font-semibold"
              >
                Signer la pétition d'abord
              </Link>{' '}
              — quelques secondes, puis vous reviendrez ici pour commander.
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          {/* Catalogue */}
          <div className="bg-white rounded-2xl shadow-sm border border-bca-green-dark/10 overflow-hidden">
            <h2 className="font-display text-2xl text-bca-green-dark px-6 py-4 border-b border-bca-green-dark/10 flex items-center gap-3">
              <Package size={22} /> Choisir le matériel
            </h2>
            <ul className="divide-y divide-bca-green-dark/10">
              {MATERIALS.map((m) => (
                <li key={m.key} className="px-6 py-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink">{m.label}</p>
                      <p className="text-sm text-ink-muted">{m.format}</p>
                      <p className="text-sm text-ink-muted mt-1">{m.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor={`q-${m.key}`} className="sr-only">
                        Quantité {m.label}
                      </label>
                      <select
                        id={`q-${m.key}`}
                        value={cart[m.key]}
                        onChange={(e) =>
                          updateQty(m.key, Number.parseInt(e.target.value, 10))
                        }
                        className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-base focus:border-bca-green-dark focus:ring-2 focus:ring-bca-green-dark/20 outline-none"
                      >
                        {m.quantities.map((q) => (
                          <option key={q} value={q}>
                            {q === 0 ? '0 (rien)' : `${q} ex.`}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs text-ink-muted whitespace-nowrap">
                        {m.weightGrams} g/u
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {overCap && (
              <p className="bg-alert/10 text-alert text-sm px-6 py-3 border-t border-alert/30">
                Plafond global de {TOTAL_UNITS_CAP} unités dépassé. Pour des volumes plus
                importants, écrivez-nous à{' '}
                <a href="mailto:contact@bioconsomacteurs.org" className="underline">
                  contact@bioconsomacteurs.org
                </a>
                .
              </p>
            )}
          </div>

          {/* Adresse */}
          <div className="bg-white rounded-2xl shadow-sm border border-bca-green-dark/10 p-6">
            <h2 className="font-display text-2xl text-bca-green-dark mb-4 flex items-center gap-3">
              <Truck size={22} /> Adresse de livraison
            </h2>

            {signature && (
              <div className="mb-5 rounded-xl bg-bca-cream p-4 text-sm">
                <p className="text-ink-muted">Coordonnées issues de votre signature :</p>
                <p className="font-medium">
                  {signature.firstName} {signature.lastName}
                </p>
                <p className="text-ink-muted">{signature.email}</p>
              </div>
            )}

            <div className="grid gap-4">
              <Field
                label="Numéro et rue"
                autoComplete="street-address"
                required
                value={address.street}
                onChange={(v) => setAddress({ ...address, street: v })}
              />
              <Field
                label="Complément (étage, bâtiment…)"
                autoComplete="address-line2"
                value={address.complement}
                onChange={(v) => setAddress({ ...address, complement: v })}
              />
              <div className="grid md:grid-cols-[150px_1fr] gap-4">
                <Field
                  label="Code postal"
                  required
                  inputMode="numeric"
                  maxLength={5}
                  autoComplete="postal-code"
                  value={address.postalCode}
                  onChange={(v) =>
                    setAddress({
                      ...address,
                      postalCode: v.replace(/[^0-9]/g, '').slice(0, 5),
                    })
                  }
                />
                <Field
                  label="Ville"
                  autoComplete="address-level2"
                  required
                  value={address.city}
                  onChange={(v) => setAddress({ ...address, city: v })}
                />
              </div>
            </div>
          </div>

          {/* Récap prix */}
          <div className="bg-white rounded-2xl shadow-sm border border-bca-green-dark/10 p-6">
            <h2 className="font-display text-2xl text-bca-green-dark mb-4">
              Récapitulatif
            </h2>
            <dl className="text-base">
              <div className="flex justify-between py-2 border-b border-bca-green-dark/10">
                <dt>Matériel ({units} unité{units > 1 ? 's' : ''})</dt>
                <dd className="font-medium">{formatEuros(0)}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-bca-green-dark/10">
                <dt>Frais d'envoi (La Poste)</dt>
                <dd className="font-medium">{formatEuros(shipping)}</dd>
              </div>
              <div className="flex justify-between py-3 text-lg font-semibold text-bca-green-dark">
                <dt>Total à régler</dt>
                <dd>{formatEuros(shipping)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-ink-muted italic">
              Le matériel est offert par Bio Consom'acteurs. Seuls les frais d'envoi vous
              sont demandés, au prix coûtant.
            </p>
          </div>

          {error && (
            <div role="alert" className="rounded-lg bg-alert/10 text-alert px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || empty || overCap || !signature?.id || !addressFilled}
            className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? 'Création de la session…'
              : empty
                ? 'Choisissez au moins un format'
                : `Commander mon matériel — ${formatEuros(shipping)}`}
          </button>

          <p className="text-xs text-ink-muted text-center flex items-center justify-center gap-2">
            <Mail size={14} aria-hidden /> Paiement sécurisé via Stripe. Vous serez
            redirigé·e vers leur formulaire.
          </p>
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
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
};

const Field = ({ label, value, onChange, required, autoComplete, inputMode, maxLength }: FieldProps) => {
  const id = `addr-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <label htmlFor={id} className="block">
      <span className="block text-sm font-medium text-ink mb-1">
        {label} {required && <span className="text-alert">*</span>}
      </span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-base outline-none focus:border-bca-green-dark focus:ring-2 focus:ring-bca-green-dark/20"
      />
    </label>
  );
};
