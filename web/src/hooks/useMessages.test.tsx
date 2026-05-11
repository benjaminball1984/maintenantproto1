import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as MessagingModule from '@/lib/messaging';

const mocks = vi.hoisted(() => ({
  listMessages: vi.fn(),
}));

vi.mock('@/lib/messaging', async () => {
  const actual = await vi.importActual<typeof MessagingModule>('@/lib/messaging');
  return {
    ...actual,
    listMessages: mocks.listMessages,
  };
});

import { useMessages } from '@/hooks/useMessages';
import type { MessageRow } from '@/lib/messaging';

const sample: MessageRow = {
  id: 'm1',
  conversation_id: 'c1',
  sender_id: 'u1',
  body: 'Salut !',
  read_at: null,
  created_at: '2026-05-01T00:00:00Z',
};

function Probe({ id }: { id: string | undefined }) {
  const { messages, status } = useMessages(id);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{messages.length}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listMessages.mockReset();
});

describe('useMessages', () => {
  it('charge les messages et passe en status=ready', async () => {
    mocks.listMessages.mockResolvedValueOnce({ data: [sample], error: null });
    render(<Probe id="c1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('reste idle si pas de conversation', () => {
    render(<Probe id={undefined} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });
});
