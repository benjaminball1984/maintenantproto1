import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import type * as NotificationsModule from '@/lib/notifications';

const mocks = vi.hoisted(() => ({
  listNotifications: vi.fn(),
}));

vi.mock('@/lib/notifications', async () => {
  const actual = await vi.importActual<typeof NotificationsModule>('@/lib/notifications');
  return {
    ...actual,
    listNotifications: mocks.listNotifications,
  };
});

import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationRow } from '@/lib/notifications';

const sample: NotificationRow = {
  id: 'n1',
  recipient_id: 'u1',
  kind: 'system',
  payload: { title: 'Hello' },
  read_at: null,
  created_at: '2026-05-01T00:00:00Z',
};

function Probe({ id }: { id: string | undefined }) {
  const { notifications, status } = useNotifications(id);
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="count">{notifications.length}</span>
    </div>
  );
}

beforeEach(() => {
  mocks.listNotifications.mockReset();
});

describe('useNotifications', () => {
  it('charge les notifications et passe en status=ready', async () => {
    mocks.listNotifications.mockResolvedValueOnce({ data: [sample], error: null });
    render(<Probe id="u1" />);
    await waitFor(() => expect(screen.getByTestId('status').textContent).toBe('ready'));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('reste idle si pas d’utilisateur', () => {
    render(<Probe id={undefined} />);
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });

  it('passe en status=error sur erreur', async () => {
    mocks.listNotifications.mockResolvedValueOnce({
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
