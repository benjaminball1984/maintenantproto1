import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as SelModule from '@/lib/sel';

const selMocks = vi.hoisted(() => ({
  getSelOffer: vi.fn(),
}));

vi.mock('@/lib/sel', async () => {
  const actual = await vi.importActual<typeof SelModule>('@/lib/sel');
  return {
    ...actual,
    getSelOffer: selMocks.getSelOffer,
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
import SelDetailPage from './SelDetailPage';

const sample: SelOfferRow = {
  id: 's1',
  user_id: 'u1',
  title: 'Cours de guitare',
  description: 'Tous niveaux',
  category: 'Musique',
  city: 'Paris',
  t99cp_rate: 5,
  is_active: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/services/sel/s1']}>
      <Routes>
        <Route path="/services/sel/:id" element={<SelDetailPage />} />
        <Route path="/services/sel" element={<div data-testid="listing">Listing</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  selMocks.getSelOffer.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('SelDetailPage', () => {
  it('rend l’offre avec titre, ville, tarif et description', async () => {
    selMocks.getSelOffer.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    expect(
      await screen.findByRole('heading', { name: /Cours de guitare/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Paris/)).toBeInTheDocument();
    expect(screen.getByText(/5 T99CP \/ unité/i)).toBeInTheDocument();
    expect(screen.getByText(/Tous niveaux/)).toBeInTheDocument();
  });

  it('redirige vers le listing si introuvable', async () => {
    selMocks.getSelOffer.mockResolvedValueOnce({ data: null, error: null });
    renderDetail();
    expect(await screen.findByTestId('listing')).toBeInTheDocument();
  });
});
