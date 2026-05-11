import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as MessagingModule from '@/lib/messaging';

const mocks = vi.hoisted(() => ({
  listConversations: vi.fn(),
}));

vi.mock('@/lib/messaging', async () => {
  const actual = await vi.importActual<typeof MessagingModule>('@/lib/messaging');
  return {
    ...actual,
    listConversations: mocks.listConversations,
  };
});

import { useConversations } from '@/hooks/useConversations';
import type { ConversationRow } from '@/lib/messaging';

const sample: ConversationRow = {
  id: 'c1',
  user_a: 'u1',
  user_b: 'u2',
  last_message_at: '2026-05-01T00:00:00Z',
  created_at: '2026-04-01T00:00:00Z',
};

function Probe({ id }: { id: string | undefined }) {
  const { conversations, status } = useConversations(id);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{conversations.length}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listConversations.mockReset();
});

describe('useConversations', () => {
  it('charge les conversations et passe en status=ready', async () => {
    mocks.listConversations.mockResolvedValueOnce({ data: [sample], error: null });
    render(<Probe id="u1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('reste idle si pas d’utilisateur', () => {
    render(<Probe id={undefined} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('passe en status=error sur erreur', async () => {
    mocks.listConversations.mockResolvedValueOnce({
      data: [],
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    render(<Probe id="u1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('error'));
  });
});
