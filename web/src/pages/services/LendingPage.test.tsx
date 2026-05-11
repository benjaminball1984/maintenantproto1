import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as LendingModule from '@/lib/lending';

const lendingMocks = vi.hoisted(() => ({
  listLending: vi.fn(),
}));

vi.mock('@/lib/lending', async () => {
  const actual = await vi.importActual<typeof LendingModule>('@/lib/lending');
  return {
    ...actual,
    listLending: lendingMocks.listLending,
  };
});

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: authMocks },
}));

import { useAuthStore } from '@/lib/auth';
import type { LendingRow } from '@/lib/lending';
import LendingPage from './LendingPage';

const sample = (overrides: Partial<LendingRow> = {}): LendingRow => ({
  id: 'l1',
  owner_id: 'u1',
  title: 'Perceuse Bosch',
  description: null,
  category: 'Outillage',
  city: 'Paris',
  t99cp_cost: 5,
  is_available: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/services/lending']}>
      <LendingPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  lendingMocks.listLending.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('LendingPage', () => {
  it('rend le listing avec compteur', async () => {
    lendingMocks.listLending.mockResolvedValueOnce({
      data: [sample(), sample({ id: 'l2', title: 'Scie sauteuse' })],
      error: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
    expect(screen.getByText(/2 annonces/i)).toBeInTheDocument();
  });

  it('affiche « Gratuit » pour un coût à 0', async () => {
    lendingMocks.listLending.mockResolvedValueOnce({
      data: [sample({ t99cp_cost: 0 })],
      error: null,
    });
    renderPage();
    expect(await screen.findByText(/Gratuit/i)).toBeInTheDocument();
  });

  it('affiche l’état vide quand aucune annonce', async () => {
    lendingMocks.listLending.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucun prêt disponible/i)).toBeInTheDocument();
  });

  it('affiche l’erreur Postgrest mappée en FR', async () => {
    lendingMocks.listLending.mockResolvedValueOnce({
      data: [],
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    renderPage();
    expect(
      await screen.findByText(/Vous n’avez pas les droits pour effectuer cette action/i),
    ).toBeInTheDocument();
  });
});
