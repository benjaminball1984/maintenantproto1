import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as AdminModule from '@/lib/admin';

const mocks = vi.hoisted(() => ({
  listEmailCampaigns: vi.fn(),
}));

vi.mock('@/lib/admin', async () => {
  const actual = await vi.importActual<typeof AdminModule>('@/lib/admin');
  return {
    ...actual,
    listEmailCampaigns: mocks.listEmailCampaigns,
  };
});

import { useEmailCampaigns } from '@/hooks/useEmailCampaigns';

function Probe({ enabled }: { enabled: boolean }) {
  const { campaigns, status } = useEmailCampaigns(enabled);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{campaigns.length}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listEmailCampaigns.mockReset();
});

describe('useEmailCampaigns', () => {
  it('reste idle quand enabled=false', () => {
    render(<Probe enabled={false} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
    expect(mocks.listEmailCampaigns).not.toHaveBeenCalled();
  });

  it('charge la liste et passe en ready', async () => {
    mocks.listEmailCampaigns.mockResolvedValueOnce({
      data: [
        {
          id: 'ec1',
          author_id: 'u1',
          subject: 'S',
          body_html: '<p>B</p>',
          audience: 'all',
          status: 'draft',
          scheduled_for: null,
          sent_at: null,
          created_at: 'c',
          updated_at: 'u',
        },
      ],
      error: null,
    });
    render(<Probe enabled={true} />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('passe en error', async () => {
    mocks.listEmailCampaigns.mockResolvedValueOnce({
      data: [],
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    render(<Probe enabled={true} />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('error'));
  });
});
