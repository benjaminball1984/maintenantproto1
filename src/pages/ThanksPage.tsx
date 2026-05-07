import { Link } from 'react-router-dom';
import { Package, MapPin } from 'lucide-react';
import { LeafIcon, FlagIcon } from '@/components/decor/Decor';

export default function ThanksPage() {
  return (
    <section className="bg-bca-cream min-h-[60vh] flex items-center py-16 relative overflow-hidden">
      <LeafIcon
        className="absolute top-10 left-6 w-20 h-20 md:w-28 md:h-28 opacity-60"
        aria-hidden
      />
      <FlagIcon
        className="absolute bottom-10 right-6 w-16 h-16 md:w-24 md:h-24 opacity-60"
        aria-hidden
      />

      <div className="container mx-auto px-4 max-w-2xl text-center relative">
        <h1 className="font-display text-4xl md:text-6xl text-bca-green-dark leading-tight">
          Merci, votre signature compte.
        </h1>
        <p className="mt-6 text-lg text-ink-muted max-w-xl mx-auto">
          Pour faire vraiment bouger les choses, une signature ne suffit pas. Voici
          comment aller plus loin.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
          <Link
            to="/commander"
            className="group rounded-2xl bg-bca-green-dark text-bca-cream p-6 md:p-8 shadow-cta transition-transform hover:-translate-y-0.5 text-left"
          >
            <Package size={36} className="text-bca-yellow mb-3" aria-hidden />
            <span className="block font-display text-2xl md:text-3xl">
              Commander du matériel
            </span>
            <span className="block text-bca-yellow font-semibold mt-1">
              c'est gratuit
            </span>
            <span className="block text-sm mt-3 text-bca-cream/80">
              Flyers, affiches, pétitions papier — vous ne payez que les frais d'envoi.
            </span>
          </Link>

          <Link
            to="/organiser"
            className="group rounded-2xl bg-bca-green-light text-bca-green-dark p-6 md:p-8 shadow-cta transition-transform hover:-translate-y-0.5 text-left"
          >
            <MapPin size={36} className="text-bca-green-dark mb-3" aria-hidden />
            <span className="block font-display text-2xl md:text-3xl">
              Organiser une distribution
            </span>
            <span className="block text-sm mt-3 text-bca-green-dark/80">
              Tenez une table de signature devant un établissement scolaire ou un
              événement.
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
