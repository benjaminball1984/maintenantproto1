import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import LegalNoticePage from './LegalNoticePage';

function renderPage() {
  return render(
    <MemoryRouter>
      <LegalNoticePage />
    </MemoryRouter>,
  );
}

describe('LegalNoticePage', () => {
  it('affiche le titre principal', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /Mentions légales/i }),
    ).toBeInTheDocument();
  });

  it('mentionne éditeur et hébergeurs', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /Éditeur/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Hébergement/i })).toBeInTheDocument();
    expect(screen.getByText(/Vercel/)).toBeInTheDocument();
    expect(screen.getByText(/Supabase/)).toBeInTheDocument();
  });
});
