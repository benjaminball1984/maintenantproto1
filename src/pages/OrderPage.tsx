import { Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import { LeafIcon, FlagIcon } from '@/components/decor/Decor';

export default function OrderPage() {
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

      <div className="container mx-auto px-4 max-w-2xl relative text-center">
        <Clock size={48} className="mx-auto text-bca-orange mb-4" aria-hidden />

        <h1 className="font-display text-4xl md:text-5xl text-bca-green-dark">
          Commande de matériel
          <span className="block text-bca-orange mt-2">bientôt disponible</span>
        </h1>

        <p className="mt-6 text-lg text-ink-muted">
          Nous mettons la dernière main au système de commande de flyers, affiches et
          pétitions papier. Encore un peu de patience.
        </p>

        <p className="mt-3 text-base text-ink-muted">
          En attendant, vous pouvez déjà <strong>organiser une distribution</strong> :
          c'est ce qui fait vraiment bouger les choses.
        </p>

        <div className="mt-10 flex flex-col md:flex-row gap-3 md:gap-4 justify-center items-stretch">
          <Link to="/organiser" className="btn-primary text-lg">
            <MapPin size={20} aria-hidden /> Organiser une distribution
          </Link>
          <Link to="/" className="btn-ghost">
            Retour à l'accueil
          </Link>
        </div>

        <p className="mt-10 text-sm text-ink-muted">
          Vous voulez être prévenu·e dès l'ouverture des commandes ? Écrivez-nous à{' '}
          <a
            href="mailto:contact@bioconsomacteurs.org?subject=Commander%20du%20mat%C3%A9riel"
            className="underline text-bca-green-dark"
          >
            contact@bioconsomacteurs.org
          </a>
          .
        </p>
      </div>
    </section>
  );
}
