import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import RouteErrorBoundary from './RouteErrorBoundary';

function ThrowingChild({ message }: { message: string }): never {
  throw new Error(message);
}

describe('RouteErrorBoundary', () => {
  // React Error Boundaries logguent l'erreur sur console.error via React lui-même.
  // On la mute pour ne pas polluer la sortie de tests.
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('rend les children quand aucune erreur n’est levée', () => {
    render(
      <RouteErrorBoundary>
        <div>contenu enfant OK</div>
      </RouteErrorBoundary>,
    );
    expect(screen.getByText('contenu enfant OK')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('affiche le message générique pour une erreur runtime inconnue', () => {
    render(
      <RouteErrorBoundary>
        <ThrowingChild message="boom" />
      </RouteErrorBoundary>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Une erreur est survenue/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recharger/i })).toBeInTheDocument();
  });

  it('détecte un ChunkLoadError (par le nom) et affiche le message « Mise à jour »', () => {
    class ChunkErrorChild extends Error {
      constructor() {
        super('Loading chunk 42 failed.');
        this.name = 'ChunkLoadError';
      }
    }
    function Throw(): never {
      throw new ChunkErrorChild();
    }
    render(
      <RouteErrorBoundary>
        <Throw />
      </RouteErrorBoundary>,
    );
    expect(screen.getByRole('heading', { name: /Mise à jour disponible/i })).toBeInTheDocument();
  });

  it('détecte un échec d’import dynamique par le message', () => {
    function Throw(): never {
      throw new Error('Failed to fetch dynamically imported module: /assets/page.js');
    }
    render(
      <RouteErrorBoundary>
        <Throw />
      </RouteErrorBoundary>,
    );
    expect(screen.getByRole('heading', { name: /Mise à jour disponible/i })).toBeInTheDocument();
  });

  it('le bouton « Recharger » appelle window.location.reload', () => {
    const reloadSpy = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { ...originalLocation, reload: reloadSpy },
    });

    render(
      <RouteErrorBoundary>
        <ThrowingChild message="boom" />
      </RouteErrorBoundary>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Recharger/i }));
    expect(reloadSpy).toHaveBeenCalledTimes(1);

    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
  });
});
