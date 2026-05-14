import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import PetitionsPage from './pages/PetitionsPage';
import { markOnboardingSeen } from './lib/onboarding';

beforeEach(() => {
  // Étape 40 — l'OnboardingModal s'auto-affiche au premier mount. On le
  // désactive pour ces tests de routing qui ne veulent pas le tester.
  window.localStorage.clear();
  markOnboardingSeen();
});

function SearchProbe() {
  // Page stub : utilise `useLocation` (createMemoryRouter ne touche pas
  // `window.location`). Affiche le pathname + query courant pour
  // permettre l'assertion sur la navigation déclenchée par le form de
  // recherche (RootLayout).
  const loc = useLocation();
  return <div data-testid="search-probe">{`${loc.pathname}${loc.search}`}</div>;
}

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <RootLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'petitions', element: <PetitionsPage /> },
          { path: 'recherche', element: <SearchProbe /> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

describe('routing skeleton', () => {
  it('renders the home page at /', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { name: /Maintenant !/i })).toBeInTheDocument();
  });

  it('renders the petitions page at /petitions', () => {
    renderAt('/petitions');
    expect(screen.getByRole('heading', { name: /Pétitions/i })).toBeInTheDocument();
  });
});

// Étape 38 — header sticky + recherche globale placeholder.
describe('RootLayout — header recherche globale (étape 38)', () => {
  it('expose un form role="search" avec input + bouton submit', () => {
    renderAt('/');
    const form = screen.getByRole('search', { name: /Recherche globale/i });
    expect(form).toBeInTheDocument();
    // L'input search a un placeholder « Rechercher… ».
    expect(screen.getByPlaceholderText(/Rechercher/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lancer la recherche/i })).toBeInTheDocument();
  });

  it('le bouton submit est disabled tant que la query est vide', () => {
    renderAt('/');
    const submit = screen.getByRole('button', { name: /Lancer la recherche/i });
    expect(submit).toBeDisabled();
  });

  it('submit avec une query non vide navigue vers /recherche?q=…', () => {
    renderAt('/');
    fireEvent.change(screen.getByPlaceholderText(/Rechercher/i), {
      target: { value: 'climat' },
    });
    const submit = screen.getByRole('button', { name: /Lancer la recherche/i });
    expect(submit).not.toBeDisabled();
    fireEvent.submit(submit.closest('form') as HTMLFormElement);
    // La SearchProbe est rendue avec le query échappé.
    expect(screen.getByTestId('search-probe')).toHaveTextContent('/recherche?q=climat');
  });
});
