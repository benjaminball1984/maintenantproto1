import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="container mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-5xl text-bca-green-dark mb-4">Page introuvable</h1>
      <p className="text-ink-muted mb-8">
        Cette adresse n'existe pas — ou plus. Retour à l'essentiel.
      </p>
      <Link to="/" className="btn-primary">
        Retour à l'accueil
      </Link>
    </section>
  );
}
