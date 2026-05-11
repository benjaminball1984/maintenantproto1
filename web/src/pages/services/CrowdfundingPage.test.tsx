import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as CrowdfundingModule from '@/lib/crowdfunding';

const cfMocks = vi.hoisted(() => ({
  listCrowdfunding: vi.fn(),
}));

vi.mock('@/lib/crowdfunding', async () => {
  const actual = await vi.importActual<typeof CrowdfundingModule>('@/lib/crowdfunding');
  return {
    ...actual,
    listCrowdfunding: cfMocks.listCrowdfunding,
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
import CrowdfundingPage from './CrowdfundingPage';

const sample = (overrides: Partial<CrowdfundingCampaignRow> = {}): CrowdfundingCampaignRow => ({
  id: 'cf1',
  organizer_id: 'u1',
  title: 'Caisse de grève',
  slug: 'caisse-de-greve',
  summary:
    'Une caisse pour soutenir les grévistes pendant la mobilisation contre la réforme des retraites.',
  body: null,
  goal_eur: 5000,
  raised_eur: 1250,
  cover_url: null,
  status: 'published',
  starts_at: '2026-05-01T00:00:00Z',
  ends_at: null,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/services/crowdfunding']}>
      <CrowdfundingPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  cfMocks.listCrowdfunding.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('CrowdfundingPage', () => {
  it('rend le listing avec compteur', async () => {
    cfMocks.listCrowdfunding.mockResolvedValueOnce({
      data: [sample(), sample({ id: 'cf2', title: 'Matériel manif' })],
      error: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
    expect(screen.getByText(/2 cagnottes/i)).toBeInTheDocument();
  });

  it('affiche le pourcentage atteint', async () => {
    cfMocks.listCrowdfunding.mockResolvedValueOnce({
      data: [sample({ raised_eur: 1250, goal_eur: 5000 })],
      error: null,
    });
    renderPage();
    expect(await screen.findByText(/25% sur 5 000 €/i)).toBeInTheDocument();
  });

  it('affiche l’état vide quand aucune cagnotte', async () => {
    cfMocks.listCrowdfunding.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucune cagnotte en cours/i)).toBeInTheDocument();
  });
});
