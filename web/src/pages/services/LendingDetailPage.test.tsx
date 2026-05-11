import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as LendingModule from '@/lib/lending';

const lendingMocks = vi.hoisted(() => ({
  getLending: vi.fn(),
}));

vi.mock('@/lib/lending', async () => {
  const actual = await vi.importActual<typeof LendingModule>('@/lib/lending');
  return {
    ...actual,
    getLending: lendingMocks.getLending,
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
import LendingDetailPage from './LendingDetailPage';

const sample: LendingRow = {
  id: 'l1',
  owner_id: 'u1',
  title: 'Perceuse Bosch',
  description: 'Avec 5 mèches',
  category: 'Outillage',
  city: 'Paris',
  t99cp_cost: 5,
  is_available: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/services/lending/l1']}>
      <Routes>
        <Route path="/services/lending/:id" element={<LendingDetailPage />} />
        <Route path="/services/lending" element={<div data-testid="listing">Listing</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  lendingMocks.getLending.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('LendingDetailPage', () => {
  it('rend l’annonce avec titre, ville, coût et description', async () => {
    lendingMocks.getLending.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    expect(
      await screen.findByRole('heading', { name: /Perceuse Bosch/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Paris/)).toBeInTheDocument();
    expect(screen.getByText(/5 T99CP/)).toBeInTheDocument();
    expect(screen.getByText(/Avec 5 mèches/)).toBeInTheDocument();
  });

  it('redirige vers le listing si introuvable', async () => {
    lendingMocks.getLending.mockResolvedValueOnce({ data: null, error: null });
    renderDetail();
    expect(await screen.findByTestId('listing')).toBeInTheDocument();
  });

  it('expose un bouton Partager', async () => {
    lendingMocks.getLending.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    expect(await screen.findByRole('button', { name: /Partager/i })).toBeInTheDocument();
  });

  it('masque le CTA propriétaire si non-owner', async () => {
    lendingMocks.getLending.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    await screen.findByRole('heading', { name: /Perceuse Bosch/i, level: 1 });
    expect(screen.queryByText(/Vous êtes le propriétaire/i)).not.toBeInTheDocument();
  });
});
