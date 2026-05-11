import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as CampaignsModule from '@/lib/campaigns';

const campaignsMocks = vi.hoisted(() => ({
  getCampaign: vi.fn(),
}));

vi.mock('@/lib/campaigns', async () => {
  const actual = await vi.importActual<typeof CampaignsModule>('@/lib/campaigns');
  return {
    ...actual,
    getCampaign: campaignsMocks.getCampaign,
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
import type { CampaignActionRow, CampaignRow, CampaignWithActions } from '@/lib/campaigns';
import CampaignDetailPage from './CampaignDetailPage';

const sampleCampaign: CampaignRow = {
  id: 'c1',
  author_id: 'u1',
  title: 'Sauvons la maternité',
  slug: 'sauvons-la-maternite',
  summary: 'Préservons l’accès aux soins sur le territoire.',
  body: 'Manifeste détaillé.',
  cover_url: null,
  status: 'published',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const actions: CampaignActionRow[] = [
  {
    id: 'a1',
    campaign_id: 'c1',
    petition_id: 'p1',
    mobilization_id: null,
    poll_id: null,
    crowdfunding_id: null,
    label: 'Signer la pétition',
    position: 0,
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'a2',
    campaign_id: 'c1',
    petition_id: null,
    mobilization_id: 'm1',
    poll_id: null,
    crowdfunding_id: null,
    label: 'Rejoindre la marche',
    position: 1,
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'a3',
    campaign_id: 'c1',
    petition_id: null,
    mobilization_id: null,
    poll_id: 'po1',
    crowdfunding_id: null,
    label: 'Voter au sondage',
    position: 2,
    created_at: '2026-05-01T00:00:00Z',
  },
];

const sampleWithActions: CampaignWithActions = {
  campaign: sampleCampaign,
  actions,
};

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/campaigns/sauvons-la-maternite']}>
      <Routes>
        <Route path="/campaigns/:slug" element={<CampaignDetailPage />} />
        <Route path="/campaigns" element={<div data-testid="listing">Listing</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  campaignsMocks.getCampaign.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('CampaignDetailPage', () => {
  it('rend la fiche avec titre, résumé, body', async () => {
    campaignsMocks.getCampaign.mockResolvedValueOnce({ data: sampleWithActions, error: null });
    renderDetail();
    expect(
      await screen.findByRole('heading', { name: /Sauvons la maternité/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Préservons l’accès aux soins/i)).toBeInTheDocument();
    expect(screen.getByText(/Manifeste détaillé/i)).toBeInTheDocument();
  });

  it('rend les actions avec liens vers /petitions, /mobilizations, /polls', async () => {
    campaignsMocks.getCampaign.mockResolvedValueOnce({ data: sampleWithActions, error: null });
    renderDetail();
    const links = await screen.findAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/petitions/p1');
    expect(hrefs).toContain('/mobilizations/m1');
    expect(hrefs).toContain('/polls/po1');
  });

  it('expose un bouton Partager', async () => {
    campaignsMocks.getCampaign.mockResolvedValueOnce({ data: sampleWithActions, error: null });
    renderDetail();
    expect(await screen.findByRole('button', { name: /Partager/i })).toBeInTheDocument();
  });

  it('redirige vers /campaigns si la campagne est introuvable', async () => {
    campaignsMocks.getCampaign.mockResolvedValueOnce({ data: null, error: null });
    renderDetail();
    expect(await screen.findByTestId('listing')).toBeInTheDocument();
  });
});
