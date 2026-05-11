import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as SelModule from '@/lib/sel';

const selMocks = vi.hoisted(() => ({
  listSel: vi.fn(),
}));

vi.mock('@/lib/sel', async () => {
  const actual = await vi.importActual<typeof SelModule>('@/lib/sel');
  return {
    ...actual,
    listSel: selMocks.listSel,
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
import type { SelOfferRow } from '@/lib/sel';
import SelPage from './SelPage';

const sample = (overrides: Partial<SelOfferRow> = {}): SelOfferRow => ({
  id: 's1',
  user_id: 'u1',
  title: 'Cours de guitare',
  description: null,
  category: 'Musique',
  city: 'Paris',
  t99cp_rate: 5,
  is_active: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/services/sel']}>
      <SelPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  selMocks.listSel.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('SelPage', () => {
  it('rend le listing avec compteur', async () => {
    selMocks.listSel.mockResolvedValueOnce({
      data: [sample(), sample({ id: 's2', title: 'Aide jardinage' })],
      error: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
    expect(screen.getByText(/2 offres/i)).toBeInTheDocument();
  });

  it('affiche le tarif T99CP', async () => {
    selMocks.listSel.mockResolvedValueOnce({
      data: [sample({ t99cp_rate: 8 })],
      error: null,
    });
    renderPage();
    expect(await screen.findByText(/8 T99CP \/ unité/i)).toBeInTheDocument();
  });

  it('affiche l’état vide quand aucune offre', async () => {
    selMocks.listSel.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucune offre SEL disponible/i)).toBeInTheDocument();
  });
});
