import { describe, it, expect, beforeEach, vi } from 'vitest';

interface QueryResult<T> {
  data: T;
  error: unknown;
  count?: number | null;
}

const mocks = vi.hoisted(() => {
  const selectChain = {
    select: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    then: vi.fn(),
  };
  const updateChain = {
    update: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn(),
  };
  const deleteChain = {
    delete: vi.fn(),
    eq: vi.fn(),
    then: vi.fn(),
  };
  return { selectChain, updateChain, deleteChain };
});

function resolveChain<T>(chain: { then: ReturnType<typeof vi.fn> }, result: QueryResult<T>): void {
  chain.then.mockImplementationOnce(
    (
      onFulfilled: (value: QueryResult<T>) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => {
      try {
        return Promise.resolve(onFulfilled(result));
      } catch (err) {
        if (onRejected) return Promise.resolve(onRejected(err));
        return Promise.reject(err);
      }
    },
  );
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((_table: string) => ({
      select: (...args: unknown[]) => {
        mocks.selectChain.select(...args);
        return mocks.selectChain;
      },
      update: (...args: unknown[]) => {
        mocks.updateChain.update(...args);
        return mocks.updateChain;
      },
      delete: (...args: unknown[]) => {
        mocks.deleteChain.delete(...args);
        return mocks.deleteChain;
      },
    })),
  },
}));

import {
  countUnread,
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  type NotificationRow,
} from '@/lib/notifications';

const sample: NotificationRow = {
  id: 'n1',
  recipient_id: 'u1',
  kind: 'system',
  payload: { title: 'Bienvenue' },
  read_at: null,
  created_at: '2026-05-01T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.selectChain.select.mockReturnValue(mocks.selectChain);
  mocks.selectChain.eq.mockReturnValue(mocks.selectChain);
  mocks.selectChain.is.mockReturnValue(mocks.selectChain);
  mocks.selectChain.order.mockReturnValue(mocks.selectChain);
  mocks.selectChain.limit.mockReturnValue(mocks.selectChain);

  mocks.updateChain.update.mockReturnValue(mocks.updateChain);
  mocks.updateChain.eq.mockReturnValue(mocks.updateChain);
  mocks.updateChain.is.mockReturnValue(mocks.updateChain);
  mocks.updateChain.select.mockReturnValue(mocks.updateChain);

  mocks.deleteChain.delete.mockReturnValue(mocks.deleteChain);
  mocks.deleteChain.eq.mockReturnValue(mocks.deleteChain);
});

describe('listNotifications', () => {
  it('filtre par recipient et trie created_at DESC', async () => {
    resolveChain(mocks.selectChain, { data: [sample], error: null });
    const { data, error } = await listNotifications('u1');
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('recipient_id', 'u1');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('applique unreadOnly via .is(read_at, null)', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listNotifications('u1', { unreadOnly: true });
    expect(mocks.selectChain.is).toHaveBeenCalledWith('read_at', null);
  });

  it('respecte la limite', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listNotifications('u1', { limit: 10 });
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(10);
  });
});

describe('countUnread', () => {
  it('renvoie le count', async () => {
    resolveChain(mocks.selectChain, { data: null, error: null, count: 3 });
    const { count, error } = await countUnread('u1');
    expect(error).toBeNull();
    expect(count).toBe(3);
    expect(mocks.selectChain.select).toHaveBeenCalledWith('id', { count: 'exact', head: true });
    expect(mocks.selectChain.is).toHaveBeenCalledWith('read_at', null);
  });

  it('renvoie 0 si count null', async () => {
    resolveChain(mocks.selectChain, { data: null, error: null, count: null });
    const { count } = await countUnread('u1');
    expect(count).toBe(0);
  });
});

describe('markNotificationRead', () => {
  it('met à jour read_at avec un timestamp', async () => {
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({
      data: { ...sample, read_at: '2026-05-02T00:00:00Z' },
      error: null,
    });
    const { data, error } = await markNotificationRead('n1');
    expect(error).toBeNull();
    expect(data?.read_at).not.toBeNull();
    const arg = mocks.updateChain.update.mock.calls[0]?.[0] as { read_at: string };
    expect(typeof arg.read_at).toBe('string');
    expect(mocks.updateChain.eq).toHaveBeenCalledWith('id', 'n1');
  });
});

describe('markNotificationUnread', () => {
  it('reset read_at à null', async () => {
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({ data: sample, error: null });
    await markNotificationUnread('n1');
    expect(mocks.updateChain.update).toHaveBeenCalledWith({ read_at: null });
    expect(mocks.updateChain.eq).toHaveBeenCalledWith('id', 'n1');
  });
});

describe('markAllNotificationsRead', () => {
  it('marque toutes les notifications non lues comme lues', async () => {
    resolveChain(mocks.updateChain, { data: null, error: null });
    const { error } = await markAllNotificationsRead('u1');
    expect(error).toBeNull();
    expect(mocks.updateChain.eq).toHaveBeenCalledWith('recipient_id', 'u1');
    expect(mocks.updateChain.is).toHaveBeenCalledWith('read_at', null);
  });
});

describe('deleteNotification', () => {
  it('supprime la notification', async () => {
    resolveChain(mocks.deleteChain, { data: null, error: null });
    const { error } = await deleteNotification('n1');
    expect(error).toBeNull();
    expect(mocks.deleteChain.eq).toHaveBeenCalledWith('id', 'n1');
  });

  it('propage l’erreur de RLS', async () => {
    resolveChain(mocks.deleteChain, {
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { error } = await deleteNotification('n1');
    expect(error?.code).toBe('42501');
  });
});

describe('listNotifications (edge cases)', () => {
  it('utilise la limite par défaut à 100', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listNotifications('u1');
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(100);
  });

  it('renvoie data: [] si Supabase renvoie null', async () => {
    resolveChain(mocks.selectChain, { data: null, error: null });
    const { data } = await listNotifications('u1');
    expect(data).toEqual([]);
  });

  it('propage l’erreur RLS', async () => {
    resolveChain(mocks.selectChain, {
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { data, error } = await listNotifications('u1');
    expect(data).toEqual([]);
    expect(error?.code).toBe('42501');
  });
});
