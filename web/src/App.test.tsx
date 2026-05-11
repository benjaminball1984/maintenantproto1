import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import PetitionsPage from './pages/PetitionsPage';

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
