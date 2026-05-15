import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
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

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <RootLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'petitions', element: <PetitionsPage /> },
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

// Étape 43 — audit beta-testeur F5 : la barre de recherche globale du
// header doit avoir disparu (route /recherche pas câblée, soumettait sur
// 404). Dette `L11-recherche-fulltext` documentée dans RootLayout.
describe('RootLayout — recherche globale retirée (étape 43 / audit F5)', () => {
  it('ne rend plus de form role="search" dans le header', () => {
    renderAt('/');
    expect(screen.queryByRole('search', { name: /Recherche globale/i })).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Rechercher/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Lancer la recherche/i })).not.toBeInTheDocument();
  });
});
