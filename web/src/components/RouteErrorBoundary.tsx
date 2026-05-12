import { Component, type ErrorInfo, type ReactNode, type CSSProperties } from 'react';

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  error: Error | null;
}

const wrapperStyle: CSSProperties = {
  minHeight: '60vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  padding: 24,
  textAlign: 'center',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontFamily: "'Sora', sans-serif",
  fontSize: 20,
  fontWeight: 700,
  color: 'var(--mn-text-1)',
};

const messageStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: 'var(--mn-text-2)',
  maxWidth: 420,
};

const buttonStyle: CSSProperties = {
  height: 40,
  padding: '0 16px',
  border: 'none',
  borderRadius: 10,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
};

/**
 * Filet de sécurité pour les erreurs runtime des routes — en particulier les
 * `ChunkLoadError` de `React.lazy()` (déploiement intermédiaire qui invalide
 * les hashs de chunks, ou perte réseau pendant la navigation). Sans cela,
 * le `<Suspense>` rejoue la promesse en boucle et l'utilisateur reste bloqué
 * sur le fallback de chargement.
 *
 * Le boundary affiche un écran de récupération minimal avec un bouton qui
 * recharge la page (action triviale qui re-fetch les chunks à jour).
 */
export default class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  override state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Le scrubbing PII passe par `scrubEvent` dans Sentry (cf. lib/sentry.ts).
    // Ici on consigne uniquement le nom et le message — pas de stack trace
    // côté console en prod pour éviter d'exposer la structure interne.
    if (import.meta.env.DEV) {
      console.error('[RouteErrorBoundary]', error, info);
    }
  }

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;
    const isChunkLoadError =
      this.state.error.name === 'ChunkLoadError' ||
      /loading chunk \d+ failed/i.test(this.state.error.message) ||
      /failed to fetch dynamically imported module/i.test(this.state.error.message);
    return (
      <div role="alert" style={wrapperStyle}>
        <h1 style={titleStyle}>
          {isChunkLoadError ? 'Mise à jour disponible' : 'Une erreur est survenue'}
        </h1>
        <p style={messageStyle}>
          {isChunkLoadError
            ? 'La page n’a pas pu être chargée car une nouvelle version a été déployée pendant votre navigation. Rechargez pour récupérer la dernière version.'
            : 'Une erreur inattendue est survenue. Rechargez la page pour réessayer.'}
        </p>
        <button type="button" onClick={this.handleReload} style={buttonStyle}>
          Recharger
        </button>
      </div>
    );
  }
}
