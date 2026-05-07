import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MapPin } from 'lucide-react';
import { LeafIcon, FlagIcon } from '@/components/decor/Decor';
import { formatEuros } from '@/lib/shipping';

type OrderInfo = {
  status: string;
  firstName: string | null;
  totalUnits: number;
  shippingEur: number;
  shippingCity: string | null;
};

export default function OrderConfirmationPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Commande confirmée — Pas de pesticides pour nos enfants';
    if (!sessionId) {
      setError('Identifiant de session manquant.');
      return;
    }
    let cancelled = false;
    (async () => {
      // Petit retry : le webhook peut prendre 1-2s pour marquer "paid"
      for (let i = 0; i < 5; i++) {
        try {
          const res = await fetch(
            `/.netlify/functions/get-order?session_id=${encodeURIComponent(sessionId)}`,
          );
          const data = (await res.json()) as OrderInfo & { error?: string };
          if (!res.ok) {
            if (i === 4) setError(data.error ?? 'Commande introuvable');
          } else {
            if (cancelled) return;
            setOrder(data);
            if (data.status === 'paid') return;
          }
        } catch (e) {
          console.error(e);
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <section className="bg-bca-cream min-h-[60vh] py-16 relative overflow-hidden">
      <LeafIcon
        className="absolute top-10 left-6 w-20 h-20 md:w-28 md:h-28 opacity-50"
        aria-hidden
      />
      <FlagIcon
        className="absolute bottom-10 right-6 w-16 h-16 md:w-24 md:h-24 opacity-50"
        aria-hidden
      />

      <div className="container mx-auto px-4 max-w-2xl relative">
        {error ? (
          <div className="text-center">
            <h1 className="font-display text-3xl text-alert mb-3">{error}</h1>
            <p className="text-ink-muted mb-6">
              Si vous avez bien reçu un mail de Stripe, votre commande est probablement
              enregistrée. Contactez-nous si besoin.
            </p>
            <Link to="/" className="btn-ghost">
              Retour à l'accueil
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <CheckCircle2
                size={56}
                className="mx-auto text-bca-green-light"
                aria-hidden
              />
              <h1 className="font-display text-4xl md:text-5xl text-bca-green-dark mt-4">
                {order?.firstName
                  ? `Merci ${order.firstName},`
                  : 'Merci pour votre commande,'}
              </h1>
              <p className="mt-3 text-lg text-ink-muted">
                {order
                  ? `votre commande de ${order.totalUnits} unité${order.totalUnits > 1 ? 's' : ''} est partie.`
                  : 'votre commande est en cours de validation…'}
              </p>
            </div>

            {order && (
              <div className="bg-white rounded-2xl shadow-sm border border-bca-green-dark/10 p-6 mb-8">
                <dl className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Statut</dt>
                    <dd className="font-semibold capitalize">
                      {order.status === 'paid' ? '✅ Paiement confirmé' : order.status}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Frais d'envoi</dt>
                    <dd className="font-semibold">{formatEuros(order.shippingEur)}</dd>
                  </div>
                  {order.shippingCity && (
                    <div className="flex justify-between">
                      <dt className="text-ink-muted">Livraison à</dt>
                      <dd className="font-semibold">{order.shippingCity}</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-4 text-sm text-ink-muted italic">
                  Vous recevrez votre matériel sous <strong>5 à 7 jours ouvrés</strong>.
                  Un mail de confirmation vient de vous être envoyé.
                </p>
              </div>
            )}

            <div className="text-center">
              <p className="text-lg text-ink mb-4">
                Maintenant, le plus important : <strong>où</strong> allez-vous le
                distribuer ?
              </p>
              <Link to="/organiser" className="btn-primary text-lg">
                <MapPin size={20} aria-hidden /> Organiser ma distribution maintenant
              </Link>
              <p className="mt-6">
                <Link
                  to="/"
                  className="text-sm text-ink-muted hover:text-bca-green-dark underline"
                >
                  Je le ferai plus tard, retour à l'accueil
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
