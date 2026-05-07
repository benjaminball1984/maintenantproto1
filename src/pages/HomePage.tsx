import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { LeafIcon, FlagIcon, TriangleIcon } from '@/components/decor/Decor';
import SignatureCounter from '@/components/SignatureCounter';
import StickyCTA from '@/components/StickyCTA';
import {
  petitionIntro,
  petitionRecipients,
  petitionSections,
  petitionReferences,
} from '@/data/petitionText';

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-bca-green-dark text-bca-cream overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: "url('/images/home-hero.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bca-green-dark via-bca-green-dark/80 to-transparent" aria-hidden />

        <LeafIcon className="absolute top-6 left-4 w-16 h-16 md:w-24 md:h-24 opacity-90" aria-hidden />
        <TriangleIcon className="absolute top-10 right-10 w-12 h-12 md:w-16 md:h-16 opacity-80" aria-hidden />
        <FlagIcon className="absolute bottom-6 left-6 w-14 h-14 md:w-20 md:h-20 opacity-90" aria-hidden />

        <div className="relative container mx-auto px-4 py-16 md:py-28 max-w-4xl">
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
            <span className="block">PAS DE PESTICIDES</span>
            <span className="block text-bca-yellow mt-2">POUR NOS ENFANTS&nbsp;!</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg md:text-xl italic text-bca-cream/90 font-hand">
            Une petite signature pour vous, un grand pas pour leur santé.
          </p>

          <div className="mt-8">
            <Link to="/signer" className="btn-primary text-xl">
              Signer la pétition
              <ArrowRight size={22} />
            </Link>
            <SignatureCounter />
          </div>
        </div>
      </section>

      {/* PÉTITION TEXTE INTÉGRAL */}
      <section id="petition" className="bg-bca-cream py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-bca-orange font-semibold mb-2">
            Pétition
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-bca-green-dark mb-3">
            Pas de pesticides pour nos enfants
          </h2>
          <p className="text-ink-muted text-sm md:text-base italic mb-10">
            {petitionRecipients}
          </p>

          <div className="prose-petition text-base md:text-lg">{petitionIntro}</div>

          {petitionSections.map((s) => (
            <article key={s.id} id={s.id} className="prose-petition mt-10">
              <h2 className={s.appel ? 'appel' : ''}>{s.title}</h2>
              {s.body}
            </article>
          ))}

          <div className="mt-12 text-center">
            <Link to="/signer" className="btn-primary text-xl">
              Signer la pétition
              <ArrowRight size={22} />
            </Link>
          </div>

          <hr className="my-12 border-bca-green-dark/20" />

          <div>
            <h3 className="font-display text-xl text-bca-green-dark mb-3">Références</h3>
            {petitionReferences}
          </div>

          <p className="mt-12 text-center text-sm text-ink-muted">
            Pétition portée par <strong>Bio Consom'acteurs</strong> — 10 rue Beaumarchais,
            93100 Montreuil
          </p>
        </div>
      </section>

      <StickyCTA />
    </>
  );
}
