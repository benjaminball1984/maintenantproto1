import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as CrowdfundingModule from '@/lib/crowdfunding';

const cfMocks = vi.hoisted(() => ({
  getCrowdfunding: vi.fn(),
}));

vi.mock('@/lib/crowdfunding', async () => {
  const actual = await vi.importActual<typeof CrowdfundingModule>('@/lib/crowdfunding');
  return {
    ...actual,
    getCrowdfunding: cfMocks.getCrowdfunding,
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
import type { CrowdfundingCampaignRow } from '@/lib/crowdfunding';
import CrowdfundingDetailPage from './CrowdfundingDetailPage';

const sample: CrowdfundingCampaignRow = {
  id: 'cf1',
  organizer_id: 'u1',
  title: 'Caisse de grève intersyndicale',
  slug: 'caisse-de-greve-intersyndicale',
  summary:
    'Une caisse pour soutenir les grévistes pendant la mobilisation contre la réforme des retraites.',
  body: 'Détails de la cagnotte',
  goal_eur: 5000,
  raised_eur: 1250,
  cover_url: null,
  status: 'published',
  starts_at: '2026-05-01T00:00:00Z',
  ends_at: null,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/services/crowdfunding/cf1']}>
      <Routes>
        <Route path="/services/crowdfunding/:id" element={<CrowdfundingDetailPage />} />
        <Route path="/services/crowdfunding" element={<div data-testid="listing">Listing</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  cfMocks.getCrowdfunding.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('CrowdfundingDetailPage', () => {
  it('rend la cagnotte avec titre, jauge, body et CTA Contribuer pour un non-organisateur', async () => {
    cfMocks.getCrowdfunding.mockResolvedValueOnce({ data: sample, error: null });
    renderDetail();
    expect(
      await screen.findByRole('heading', {
        name: /Caisse de grève intersyndicale/i,
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 250 € collectés/)).toBeInTheDocument();
    expect(screen.getByText(/Détails de la cagnotte/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Contribuer/i })).toBeInTheDocument();
  });

  it('masque le CTA Contribuer si l’utilisateur est l’organisateur', async () => {
    cfMocks.getCrowdfunding.mockResolvedValueOnce({ data: sample, error: null });
    const organizerSession = {
      access_token: 'a',
      refresh_token: 'r',
      expires_at: 0,
      expires_in: 3600,
      token_type: 'bearer',
      user: { id: 'u1', email: 'me@x.org', user_metadata: {} },
    };
    authMocks.getSession.mockReset();
    authMocks.getSession.mockResolvedValue({
      data: { session: organizerSession },
      error: null,
    });
    useAuthStore.setState({
      status: 'authenticated',
      user: organizerSession.user as never,
      session: organizerSession as never,
    });
    renderDetail();
    expect(
      await screen.findByText(/Vous êtes l’organisateur/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Contribuer/i })).not.toBeInTheDocument();
  });

  it('redirige vers le listing si introuvable', async () => {
    cfMocks.getCrowdfunding.mockResolvedValueOnce({ data: null, error: null });
    renderDetail();
    expect(await screen.findByTestId('listing')).toBeInTheDocument();
  });
});
