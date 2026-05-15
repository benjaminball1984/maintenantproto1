import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { ToastProvider } from '@/components/Toast';
import type * as CarpoolingModule from '@/lib/carpooling';

const carpoolingMocks = vi.hoisted(() => ({
  getCarpooling: vi.fn(),
}));

vi.mock('@/lib/carpooling', async () => {
  const actual = await vi.importActual<typeof CarpoolingModule>('@/lib/carpooling');
  return {
    ...actual,
    getCarpooling: carpoolingMocks.getCarpooling,
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
import type { CarpoolingRow } from '@/lib/carpooling';
import CarpoolingDetailPage from './CarpoolingDetailPage';

const sample: CarpoolingRow = {
  id: 'c1',
  driver_id: 'u1',
  origin_city: 'Paris',
  destination_city: 'Cherbourg',
  departs_at: '2026-06-15T08:00:00Z',
  seats: 3,
  price_eur: 12,
  notes: 'RDV gare Saint-Lazare 7h30',
  is_published: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/services/carpooling/c1']}>
      <ToastProvider>
        <Routes>
          <Route path="/services/carpooling/:id" element={<CarpoolingDetailPage />} />
          <Route path="/services/carpooling" element={<div data-testid="listing">Listing</div>} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  carpoolingMocks.getCarpooling.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('CarpoolingDetailPage', () => {
  it('rend le trajet avec villes, places, prix, notes', async () => {
    carpoolingMocks.getCarpooling.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    expect(
      await screen.findByRole('heading', { name: /Paris → Cherbourg/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/3 places/i)).toBeInTheDocument();
    expect(screen.getByText(/RDV gare Saint-Lazare/i)).toBeInTheDocument();
  });

  it('redirige vers le listing si introuvable', async () => {
    carpoolingMocks.getCarpooling.mockResolvedValueOnce({ data: null, error: null });
    renderDetail();
    expect(await screen.findByTestId('listing')).toBeInTheDocument();
  });

  it('expose un bouton Partager', async () => {
    carpoolingMocks.getCarpooling.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    expect(await screen.findByRole('button', { name: /Partager/i })).toBeInTheDocument();
  });

  it('affiche « Gratuit » pour price_eur=0', async () => {
    carpoolingMocks.getCarpooling.mockResolvedValueOnce({
      data: { ...sample, price_eur: 0 },
      error: null,
    });
    renderDetail();
    expect(await screen.findByText(/Gratuit/i)).toBeInTheDocument();
  });

  it('affiche le bouton « Contacter » pour un·e visiteur·euse authentifié·e non chauffeur', async () => {
    authMocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u2' }, access_token: 'tok' } },
      error: null,
    });
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'u2' } as never,
      session: null,
    });
    carpoolingMocks.getCarpooling.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    expect(await screen.findByRole('button', { name: /^Contacter/i })).toBeInTheDocument();
  });

  it('masque le bouton « Contacter » si le viewer est le chauffeur', async () => {
    authMocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1' }, access_token: 'tok' } },
      error: null,
    });
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'u1' } as never,
      session: null,
    });
    carpoolingMocks.getCarpooling.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    await screen.findByRole('heading', { name: /Paris → Cherbourg/i, level: 1 });
    expect(screen.queryByRole('button', { name: /^Contacter/i })).not.toBeInTheDocument();
  });
});
