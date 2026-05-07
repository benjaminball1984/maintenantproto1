import { Link } from 'react-router-dom';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Pas de pesticides pour nos enfants — accueil"
      className={`group inline-flex flex-col leading-none ${className}`}
    >
      <span className="font-display text-2xl md:text-3xl text-bca-cream">
        PAS DE <span className="text-bca-cream">PESTICIDES</span>
      </span>
      <span className="font-display text-2xl md:text-3xl text-bca-yellow -mt-1">
        POUR NOS ENFANTS&nbsp;!
      </span>
    </Link>
  );
}
