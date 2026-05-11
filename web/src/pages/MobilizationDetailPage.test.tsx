import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as MobilizationsModule from '@/lib/mobilizations';

const mobilizationsMocks = vi.hoisted(() => ({
  getMobilization: vi.fn(),
  hasUserRsvp: vi.fn(),
  rsvpMobilization: vi.fn(),
  cancelRsvp: vi.fn(),
}));

vi.mock('@/lib/mobilizations', async () => {
  const actual = await vi.importActual<typeof MobilizationsModule>('@/lib/mobilizations');
  return {
    ...actual,
    getMobilization: mobilizationsMocks.getMobilization,
    hasUserRsvp: mobilizationsMocks.hasUserRsvp,
    rsvpMobilization: mobilizationsMocks.rsvpMobilization,
    cancelRsvp: mobilizationsMocks.cancelRsvp,
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
import type { MobilizationRow } from '@/lib/mobilizations';
import MobilizationDetailPage from './MobilizationDetailPage';

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u1', email: 'me@x.org', user_metadata: {} },
};

const sampleMobilization: MobilizationRow = {
  id: 'm1',
  organizer_id: 'u1',
  title: 'Marche pour le climat',
  slug: 'marche-pour-le-climat',
  summary: 'Mobilisation pacifique inter-collectifs.',
  body: 'Programme détaillé de la marche.',
  starts_at: '2030-06-01T14:00:00Z',
  ends_at: null,
  city: 'Paris',
  address: 'Place de la République',
  cover_url: null,
  status: 'published',
  participation_count: 42,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/mobilizations/marche-pour-le-climat']}>
      <Routes>
        <Route path="/mobilizations/:slug" element={<MobilizationDetailPage />} />
        <Route path="/mobilizations" element={<div data-testid="listing">Listing</div>} />
        <Route path="/" element={<div data-testid="home">Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mobilizationsMocks.getMobilization.mockReset();
  mobilizationsMocks.hasUserRsvp.mockReset();
  mobilizationsMocks.rsvpMobilization.mockReset();
  mobilizationsMocks.cancelRsvp.mockReset();
  authMocks.getSession.mockReset();
});

describe('MobilizationDetailPage', () => {
  it('rend la fiche avec dates formatées en FR et compteur', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    mobilizationsMocks.getMobilization.mockResolvedValueOnce({
      data: sampleMobilization,
      error: null,
    });

    renderDetail();
    expect(
      await screen.findByRole('heading', { name: /Marche pour le climat/i, level: 1 }),
    ).toBeInTheDocument();
    // Compteur 42
    expect(screen.getByText('42')).toBeInTheDocument();
    // Body
    expect(screen.getByText(/Programme détaillé de la marche/i)).toBeInTheDocument();
    // Date formatée FR (samedi 1 juin 2030 / 1 juin 2030)
    expect(screen.getByText(/juin 2030/i)).toBeInTheDocument();
  });

  it('utilisateur anonyme : bouton « Se connecter pour participer » sans appel à rsvpMobilization', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    mobilizationsMocks.getMobilization.mockResolvedValueOnce({
      data: sampleMobilization,
      error: null,
    });

    renderDetail();
    expect(
      await screen.findByRole('link', { name: /Se connecter pour participer/i }),
    ).toBeInTheDocument();
    expect(mobilizationsMocks.rsvpMobilization).not.toHaveBeenCalled();
  });

  it('utilisateur connecté non inscrit : clic appelle rsvpMobilization et refresh', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
    useAuthStore.setState({
      status: 'authenticated',
      user: fakeSession.user as never,
      session: fakeSession as never,
    });
    mobilizationsMocks.getMobilization
      .mockResolvedValueOnce({ data: sampleMobilization, error: null })
      .mockResolvedValueOnce({
        data: { ...sampleMobilization, participation_count: 43 },
        error: null,
      });
    mobilizationsMocks.hasUserRsvp
      .mockResolvedValueOnce({ rsvp: false, error: null })
      .mockResolvedValueOnce({ rsvp: true, error: null });
    mobilizationsMocks.rsvpMobilization.mockResolvedValueOnce({ data: { id: 'pa1' }, error: null });

    renderDetail();
    const btn = await screen.findByRole('button', { name: /Je participe/i });
    await act(async () => {
      fireEvent.click(btn);
    });
    await waitFor(() =>
      expect(mobilizationsMocks.rsvpMobilization).toHaveBeenCalledWith('m1', 'u1'),
    );
    expect(await screen.findByText('43')).toBeInTheDocument();
  });

  it('utilisateur connecté inscrit : clic appelle cancelRsvp', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
    useAuthStore.setState({
      status: 'authenticated',
      user: fakeSession.user as never,
      session: fakeSession as never,
    });
    mobilizationsMocks.getMobilization.mockResolvedValue({
      data: sampleMobilization,
      error: null,
    });
    mobilizationsMocks.hasUserRsvp
      .mockResolvedValueOnce({ rsvp: true, error: null })
      .mockResolvedValueOnce({ rsvp: false, error: null });
    mobilizationsMocks.cancelRsvp.mockResolvedValueOnce({ error: null });

    renderDetail();
    const btn = await screen.findByRole('button', { name: /me désinscrire/i });
    await act(async () => {
      fireEvent.click(btn);
    });
    await waitFor(() => expect(mobilizationsMocks.cancelRsvp).toHaveBeenCalledWith('m1', 'u1'));
  });

  it('redirige vers /mobilizations si la mobilisation est introuvable', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    mobilizationsMocks.getMobilization.mockResolvedValueOnce({ data: null, error: null });

    renderDetail();
    expect(await screen.findByTestId('listing')).toBeInTheDocument();
  });
});
