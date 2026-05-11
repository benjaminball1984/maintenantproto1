import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as CrowdfundingModule from '@/lib/crowdfunding';

const mocks = vi.hoisted(() => ({
  listCrowdfunding: vi.fn(),
}));

vi.mock('@/lib/crowdfunding', async () => {
  const actual = await vi.importActual<typeof CrowdfundingModule>('@/lib/crowdfunding');
  return {
    ...actual,
    listCrowdfunding: mocks.listCrowdfunding,
  };
});

import { useCrowdfunding } from '@/hooks/useCrowdfunding';
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

function Probe() {
  const { campaigns, status } = useCrowdfunding();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{campaigns.length}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listCrowdfunding.mockReset();
});

describe('useCrowdfunding', () => {
  it('charge la liste et passe en status=ready', async () => {
    mocks.listCrowdfunding.mockResolvedValueOnce({ data: [sample], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('passe en status=error sur erreur', async () => {
    mocks.listCrowdfunding.mockResolvedValueOnce({
      data: [],
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('error'));
  });
});
