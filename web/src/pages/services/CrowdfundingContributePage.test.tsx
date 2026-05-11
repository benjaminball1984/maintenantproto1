import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as CrowdfundingModule from '@/lib/crowdfunding';

const cfMocks = vi.hoisted(() => ({
  getCrowdfunding: vi.fn(),
  contribute: vi.fn(),
}));

vi.mock('@/lib/crowdfunding', async () => {
  const actual = await vi.importActual<typeof CrowdfundingModule>('@/lib/crowdfunding');
  return {
    ...actual,
    getCrowdfunding: cfMocks.getCrowdfunding,
    contribute: cfMocks.contribute,
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
import CrowdfundingContributePage from './CrowdfundingContributePage';

const sample: CrowdfundingCampaignRow = {
  id: 'cf1',
  organizer_id: 'u1',
  title: 'Caisse de grève',
  slug: 'caisse-de-greve',
  summary:
    'Une caisse pour soutenir les grévistes pendant la mobilisation contre la réforme des retraites.',
  body: null,
  goal_eur: 5000,
  raised_eur: 0,
  cover_url: null,
  status: 'published',
  starts_at: '2026-05-01T00:00:00Z',
  ends_at: null,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u2', email: 'contrib@x.org', user_metadata: {} },
};

function renderContribute() {
  return render(
    <MemoryRouter initialEntries={['/services/crowdfunding/cf1/contribute']}>
      <Routes>
        <Route
          path="/services/crowdfunding/:id/contribute"
          element={<CrowdfundingContributePage />}
        />
        <Route
          path="/services/crowdfunding/:id"
          element={<div data-testid="detail">Detail</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  cfMocks.getCrowdfunding.mockReset();
  cfMocks.contribute.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('CrowdfundingContributePage', () => {
  it('rend le formulaire de contribution avec le titre de la cagnotte', async () => {
    cfMocks.getCrowdfunding.mockResolvedValueOnce({ data: sample, error: null });
    renderContribute();
    expect(
      await screen.findByRole('heading', { name: /Contribuer/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Caisse de grève/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Montant/i)).toBeInTheDocument();
  });

  it('refuse une contribution à 0', async () => {
    cfMocks.getCrowdfunding.mockResolvedValueOnce({ data: sample, error: null });
    renderContribute();
    const amountInput = await screen.findByLabelText(/Montant/i);
    fireEvent.change(amountInput, { target: { value: '0' } });
    const submit = screen.getByRole('button', { name: /Confirmer la contribution/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(screen.getByText(/Le montant doit être compris/i)).toBeInTheDocument();
    expect(cfMocks.contribute).not.toHaveBeenCalled();
  });

  it('insère une contribution valide et affiche le succès', async () => {
    cfMocks.getCrowdfunding.mockResolvedValueOnce({ data: sample, error: null });
    cfMocks.contribute.mockResolvedValueOnce({
      data: {
        id: 'c1',
        campaign_id: 'cf1',
        contributor_id: 'u2',
        amount_eur: 25,
        stripe_payment_intent: null,
        is_anonymous: false,
        created_at: '2026-05-01T00:00:00Z',
      },
      error: null,
    });
    renderContribute();
    const amountInput = await screen.findByLabelText(/Montant/i);
    fireEvent.change(amountInput, { target: { value: '25' } });
    const submit = screen.getByRole('button', { name: /Confirmer la contribution/i });
    await act(async () => {
      fireEvent.click(submit);
    });
    await waitFor(() => expect(cfMocks.contribute).toHaveBeenCalled());
    expect(
      await screen.findByText(/Merci pour votre contribution/i),
    ).toBeInTheDocument();
  });

  it('redirige vers le listing si cagnotte introuvable', async () => {
    cfMocks.getCrowdfunding.mockResolvedValueOnce({ data: null, error: null });
    render(
      <MemoryRouter initialEntries={['/services/crowdfunding/cf1/contribute']}>
        <Routes>
          <Route
            path="/services/crowdfunding/:id/contribute"
            element={<CrowdfundingContributePage />}
          />
          <Route
            path="/services/crowdfunding"
            element={<div data-testid="listing">Listing</div>}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByTestId('listing')).toBeInTheDocument();
  });
});
