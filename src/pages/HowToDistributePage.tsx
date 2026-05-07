import { Link } from 'react-router-dom';
import { MapPin, Smile, AlertTriangle, Users, Ban, CheckCircle2 } from 'lucide-react';
import { LeafIcon } from '@/components/decor/Decor';

export default function HowToDistributePage() {
  return (
    <section className="bg-bca-cream py-12 md:py-16 relative overflow-hidden">
      <LeafIcon className="absolute top-8 right-4 w-20 h-20 md:w-28 md:h-28 opacity-30" aria-hidden />

      <div className="container mx-auto px-4 max-w-3xl relative">
        <p className="text-sm uppercase tracking-widest text-bca-orange font-semibold">
          Fiche pratique
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-bca-green-dark mt-2 mb-3">
          Comment réussir ta distribution
        </h1>
        <p className="text-ink-muted text-base md:text-lg mb-10">
          Quelques règles simples pour une mobilisation efficace, sereine et bienveillante.
        </p>

        <div className="space-y-6">
          <Card icon={<MapPin />} title="Où se placer">
            Sur le <strong>trottoir public</strong> ou la place attenante à
            l'établissement, jamais à l'intérieur. Devant les écoles primaires, viser
            les heures de sortie (16h30-17h). Pour les collèges et lycées : sortie midi
            et fin d'après-midi.
          </Card>

          <Card icon={<Smile />} title="Comment aborder">
            Sourire, message court (« Bonjour, on fait signer une pétition pour des
            cantines sans pesticides — c'est rapide ? »). Privilégier les{' '}
            <strong>parents qui attendent</strong>, les marchés, les fêtes de quartier.
          </Card>

          <Card icon={<AlertTriangle />} title="Si on vous demande de partir">
            Rester courtois·e, expliquer le caractère public de l'espace et la nature
            non-commerciale de l'action. Si insistance : se déplacer de quelques mètres
            (autre trottoir, place attenante).
          </Card>

          <Card icon={<Ban />} title="Pas de contact direct avec les enfants">
            On s'adresse aux <strong>adultes uniquement</strong>. Si un enfant pose une
            question, on l'oriente vers un parent.
          </Card>

          <Card icon={<CheckCircle2 />} title="Ce qui marche">
            QR code visible, plusieurs personnes (jamais seul·e plus de 2h), table
            pliante avec affiche A3, sourires, eau pour soi.
          </Card>

          <Card icon={<Users />} title="Ce qu'il vaut mieux éviter">
            Argumenter avec quelqu'un d'opposé·e (ça décourage les autres), rester
            seul·e plus de 2 heures, distribuer sans support (pétition papier ou QR).
          </Card>
        </div>

        <div className="mt-10 rounded-2xl bg-bca-green-dark text-bca-cream p-6 md:p-8 text-center">
          <p className="font-display text-2xl md:text-3xl mb-2">
            Vous êtes prêt·e ?
          </p>
          <p className="text-bca-cream/85 mb-5">
            Inscrivez votre distribution pour qu'on puisse vous envoyer un rappel et
            que d'autres mobilisé·es puissent vous rejoindre.
          </p>
          <Link to="/organiser" className="btn-primary">
            Organiser ma distribution
          </Link>
        </div>
      </div>
    </section>
  );
}

const Card = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <article className="bg-white rounded-2xl shadow-sm border border-bca-green-dark/10 p-6">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-bca-yellow/20 text-bca-green-dark flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="font-display text-xl text-bca-green-dark mb-2">{title}</h2>
        <p className="text-ink leading-relaxed">{children}</p>
      </div>
    </div>
  </article>
);
