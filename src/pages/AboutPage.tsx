import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import {
  CATEGORY_LABELS,
  firstSigners,
  type SignerCategory,
} from '@/data/firstSigners';
import { supportingOrgs } from '@/data/supportingOrgs';
import { LeafIcon } from '@/components/decor/Decor';

const CATEGORY_ORDER: SignerCategory[] = [
  'scientifique',
  'medical',
  'paysan',
  'culturel',
  'elu',
  'autre',
];

export default function AboutPage() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    signers: firstSigners.filter((s) => s.category === cat),
  })).filter((g) => g.signers.length > 0);

  return (
    <section className="bg-bca-cream py-12 md:py-16 relative overflow-hidden">
      <LeafIcon className="absolute top-8 right-6 w-20 h-20 md:w-28 md:h-28 opacity-30" aria-hidden />

      <div className="container mx-auto px-4 max-w-4xl relative">
        {/* BCA */}
        <p className="text-sm uppercase tracking-widest text-bca-orange font-semibold">
          Qui porte cette pétition
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-bca-green-dark mt-2 mb-3">
          Bio Consom'acteurs
        </h1>
        <div className="prose-petition text-base md:text-lg max-w-prose">
          <p>
            Bio Consom'acteurs est une association nationale créée en 2004 qui agit pour
            une alimentation et une agriculture <strong>respectueuses de l'humain et de
            la nature</strong>, accessibles à toutes et tous, de la fourche à la
            fourchette. Elle repose sur trois piliers : <strong>information</strong>,{' '}
            <strong>sensibilisation</strong>, <strong>mobilisation</strong>.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat number="30" label="antennes locales et ambassadeur·rices partout en France" />
          <Stat number="8 765" label="personnes touchées par nos actions de terrain en 2025" />
          <Stat number="2 000" label="adhérent·es donateur·rices" />
          <Stat number="29" label="partenaires à nos côtés" />
          <Stat number="5" label="outils pédagogiques d'éducation populaire" />
          <Stat number="20+" label="ans d'engagement pour la bio" />
        </div>

        <div className="mt-6">
          <a
            href="https://bioconsomacteurs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            En savoir plus sur Bio Consom'acteurs <ExternalLink size={16} />
          </a>
        </div>

        {/* Premiers signataires */}
        <hr className="my-12 border-bca-green-dark/15" />

        <h2 className="font-display text-3xl md:text-4xl text-bca-green-dark mb-2">
          Premier·ères signataires
        </h2>
        <p className="text-ink-muted mb-8">
          Personnalités du monde scientifique, médical, paysan, culturel et politique
          qui soutiennent publiquement cette pétition.
        </p>

        {grouped.length === 0 ? (
          <p className="rounded-2xl bg-white border border-bca-green-dark/10 p-6 text-ink-muted italic">
            La liste des premier·ères signataires sera publiée ici sous peu.
          </p>
        ) : (
          <div className="space-y-10">
            {grouped.map(({ cat, signers }) => (
              <section key={cat}>
                <h3 className="font-display text-xl text-bca-orange mb-4 uppercase tracking-wide">
                  {CATEGORY_LABELS[cat]}
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {signers.map((s) => (
                    <li
                      key={s.name}
                      className="bg-white rounded-2xl p-4 border border-bca-green-dark/10"
                    >
                      {s.photoUrl && (
                        <img
                          src={s.photoUrl}
                          alt={s.name}
                          className="w-16 h-16 rounded-full object-cover mb-3"
                          loading="lazy"
                        />
                      )}
                      <p className="font-semibold text-ink">{s.name}</p>
                      <p className="text-sm text-ink-muted">{s.role}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {/* Soutiens */}
        <hr className="my-12 border-bca-green-dark/15" />

        <h2 className="font-display text-3xl md:text-4xl text-bca-green-dark mb-6">
          Ils nous soutiennent
        </h2>
        {supportingOrgs.length === 0 ? (
          <p className="rounded-2xl bg-white border border-bca-green-dark/10 p-6 text-ink-muted italic">
            Les organisations partenaires apparaîtront ici. Vous représentez une
            association ou un collectif et souhaitez nous rejoindre ?{' '}
            <a
              href="mailto:contact@bioconsomacteurs.org"
              className="underline text-bca-green-dark"
            >
              contact@bioconsomacteurs.org
            </a>
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
            {supportingOrgs.map((o) => (
              <li
                key={o.name}
                className="bg-white rounded-2xl p-4 border border-bca-green-dark/10 flex items-center justify-center min-h-[100px]"
              >
                {o.url ? (
                  <a
                    href={o.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center"
                  >
                    {o.logoUrl ? (
                      <img
                        src={o.logoUrl}
                        alt={o.name}
                        className="max-h-12 mx-auto mb-2"
                        loading="lazy"
                      />
                    ) : null}
                    <span className="text-sm font-medium text-ink">{o.name}</span>
                  </a>
                ) : (
                  <span className="text-sm font-medium text-ink text-center">{o.name}</span>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 text-center">
          <Link to="/signer" className="btn-primary">
            Rejoindre les signataires
          </Link>
        </div>
      </div>
    </section>
  );
}

const Stat = ({ number, label }: { number: string; label: string }) => (
  <div className="rounded-2xl bg-white border border-bca-green-dark/10 p-4">
    <p className="font-display text-3xl text-bca-green-dark">{number}</p>
    <p className="text-sm text-ink-muted">{label}</p>
  </div>
);
