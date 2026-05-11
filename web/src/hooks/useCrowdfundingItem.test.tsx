import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as CrowdfundingModule from '@/lib/crowdfunding';

const mocks = vi.hoisted(() => ({
  getCrowdfunding: vi.fn(),
}));

vi.mock('@/lib/crowdfunding', async () => {
  const actual = await vi.importActual<typeof CrowdfundingModule>('@/lib/crowdfunding');
  return {
    ...actual,
    getCrowdfunding: mocks.getCrowdfunding,
  };
});

import { useCrowdfundingItem } from '@/hooks/useCrowdfundingItem';
import type { CrowdfundingCampaignRow } from '@/lib/crowdfunding';

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

function Probe({ id }: { id: string | undefined }) {
  const { campaign, status } = useCrowdfundingItem(id);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="title">{campaign?.title ?? '-'}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.getCrowdfunding.mockReset();
});

describe('useCrowdfundingItem', () => {
  it('renvoie idle quand id est undefined', () => {
    render(<Probe id={undefined} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('charge la cagnotte et passe en ready', async () => {
    mocks.getCrowdfunding.mockResolvedValueOnce({ data: sample, error: null });
    render(<Probe id="cf1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('title').textContent).toBe('Caisse de grève');
  });

  it('passe en notfound si data: null', async () => {
    mocks.getCrowdfunding.mockResolvedValueOnce({ data: null, error: null });
    render(<Probe id="cf1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('notfound'));
  });
});
