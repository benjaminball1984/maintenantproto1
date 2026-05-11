import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as CampaignsModule from '@/lib/campaigns';

const mocks = vi.hoisted(() => ({
  listCampaigns: vi.fn(),
}));

vi.mock('@/lib/campaigns', async () => {
  const actual = await vi.importActual<typeof CampaignsModule>('@/lib/campaigns');
  return {
    ...actual,
    listCampaigns: mocks.listCampaigns,
  };
});

import { useCampaigns } from '@/hooks/useCampaigns';
import type { CampaignRow } from '@/lib/campaigns';

const sampleCampaign: CampaignRow = {
  id: 'c1',
  author_id: 'u1',
  title: 'Sauvons la maternité',
  slug: 'sauvons-la-maternite',
  summary: 'Une campagne territoriale pour préserver l’accès aux soins.',
  body: null,
  cover_url: null,
  status: 'published',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

function Probe({ search }: { search?: string }) {
  const { campaigns, status, error } = useCampaigns({ search });
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{campaigns.length}</span>
      <span data-testid="error">{error?.code ?? 'none'}</span>
      <ul>
        {campaigns.map((c) => (
          <li key={c.id} data-testid="campaign">
            {c.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

beforeEach(() => {
  mocks.listCampaigns.mockReset();
});

describe('useCampaigns', () => {
  it('charge la liste au mount et passe en status=ready', async () => {
    mocks.listCampaigns.mockResolvedValueOnce({ data: [sampleCampaign], error: null });
    render(<Probe />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(mocks.listCampaigns).toHaveBeenCalledWith(
      expect.objectContaining({ search: undefined }),
    );
  });

  it('passe en status=error quand listCampaigns remonte une erreur', async () => {
    mocks.listCampaigns.mockResolvedValueOnce({
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
    expect(screen.getByTestId('error').textContent).toBe('42501');
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('relance la requête quand search change', async () => {
    mocks.listCampaigns.mockResolvedValueOnce({ data: [sampleCampaign], error: null });
    const { rerender } = render(<Probe search="cherbourg" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(mocks.listCampaigns).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'cherbourg' }),
    );

    mocks.listCampaigns.mockResolvedValueOnce({
      data: [{ ...sampleCampaign, id: 'c2', title: 'Autre campagne' }],
      error: null,
    });
    rerender(<Probe search="école" />);
    await waitFor(() =>
      expect(mocks.listCampaigns).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'école' }),
      ),
    );
  });
});
