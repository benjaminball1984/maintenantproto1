import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type * as CampaignsModule from '@/lib/campaigns';

const mocks = vi.hoisted(() => ({
  getCampaign: vi.fn(),
}));

vi.mock('@/lib/campaigns', async () => {
  const actual = await vi.importActual<typeof CampaignsModule>('@/lib/campaigns');
  return {
    ...actual,
    getCampaign: mocks.getCampaign,
  };
});

import { useCampaign } from '@/hooks/useCampaign';
import type { CampaignActionRow, CampaignRow, CampaignWithActions } from '@/lib/campaigns';

const sampleCampaign: CampaignRow = {
  id: 'c1',
  author_id: 'u1',
  title: 'Sauvons la maternité',
  slug: 'sauvons-la-maternite',
  summary: 'Une campagne territoriale.',
  body: null,
  cover_url: null,
  status: 'published',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const sampleActions: CampaignActionRow[] = [
  {
    id: 'a1',
    campaign_id: 'c1',
    petition_id: 'p1',
    mobilization_id: null,
    poll_id: null,
    crowdfunding_id: null,
    label: 'Signer',
    position: 0,
    created_at: '2026-05-01T00:00:00Z',
  },
];

const sampleWithActions: CampaignWithActions = {
  campaign: sampleCampaign,
  actions: sampleActions,
};

function Probe({ slug }: { slug: string | undefined }) {
  const { campaign, actions, status, refresh } = useCampaign(slug);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="title">{campaign?.title ?? 'none'}</span>
      <span data-testid="actions">{actions.length}</span>
      <button type="button" onClick={() => void refresh()}>
        refresh
      </button>
    </div>
  );
}

beforeEach(() => {
  mocks.getCampaign.mockReset();
});

describe('useCampaign', () => {
  it('charge la campagne + actions et passe en status=ready', async () => {
    mocks.getCampaign.mockResolvedValueOnce({ data: sampleWithActions, error: null });
    render(<Probe slug="sauvons-la-maternite" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('title').textContent).toBe('Sauvons la maternité');
    expect(screen.getByTestId('actions').textContent).toBe('1');
  });

  it('renvoie status=notfound quand getCampaign renvoie data: null', async () => {
    mocks.getCampaign.mockResolvedValueOnce({ data: null, error: null });
    render(<Probe slug="inconnue" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('notfound'));
  });

  it('refresh rejoue getCampaign', async () => {
    mocks.getCampaign
      .mockResolvedValueOnce({ data: sampleWithActions, error: null })
      .mockResolvedValueOnce({
        data: {
          campaign: sampleCampaign,
          actions: [...sampleActions, { ...sampleActions[0]!, id: 'a2', position: 1 }],
        },
        error: null,
      });
    render(<Probe slug="sauvons-la-maternite" />);
    await waitFor(() => expect(screen.getByTestId('actions').textContent).toBe('1'));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'refresh' }));
    });
    await waitFor(() => expect(screen.getByTestId('actions').textContent).toBe('2'));
    expect(mocks.getCampaign).toHaveBeenCalledTimes(2);
  });
});
