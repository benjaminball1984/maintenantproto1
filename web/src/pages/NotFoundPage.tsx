import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <h1>404 — Page introuvable</h1>
      <p>Cette page n'existe pas ou a été déplacée.</p>
      <p>
        <Link to="/">Retour à l'accueil</Link>
      </p>
    </main>
  );
}
