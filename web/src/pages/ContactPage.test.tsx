import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi
    .fn()
    .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: authMocks },
}));

import { useAuthStore } from '@/lib/auth';
import ContactPage from './ContactPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/legal/contact']}>
      <ContactPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('ContactPage', () => {
  it('rend le formulaire de contact', () => {
    renderPage();
    expect(screen.getByLabelText(/Sujet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Message$/i)).toBeInTheDocument();
  });

  it('bascule sur mailto pour un utilisateur anonymous', () => {
    renderPage();
    const cta = screen.getByText(/Envoyer par email/i).closest('a');
    expect(cta).not.toBeNull();
    expect(cta?.getAttribute('href') ?? '').toMatch(/^mailto:/);
  });

  it('affiche l’email support en fallback dans le lead', () => {
    renderPage();
    const links = screen.getAllByRole('link', { name: /contact@maintenant\.org/i });
    expect(links.length).toBeGreaterThan(0);
  });

  it('inclut le sujet saisi dans le href mailto', async () => {
    renderPage();
    const subjectInput = screen.getByLabelText(/Sujet/i);
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(subjectInput, { target: { value: 'Test sujet' } });
    const cta = screen.getByText(/Envoyer par email/i).closest('a');
    expect(cta?.getAttribute('href') ?? '').toMatch(/subject=Test\+sujet/);
  });

  it('expose un lien de retour vers les mentions légales', () => {
    renderPage();
    const backLink = screen.getByText(/Retour aux mentions légales/i).closest('a');
    expect(backLink?.getAttribute('href')).toBe('/legal/notice');
  });
});
