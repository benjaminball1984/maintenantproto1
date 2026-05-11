import { describe, it, expect, beforeEach, vi } from 'vitest';

interface QueryResult<T> {
  data: T;
  error: unknown;
}

const mocks = vi.hoisted(() => {
  const selectChain = {
    select: vi.fn(),
    eq: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn(),
  };
  const insertChain = {
    insert: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const updateChain = {
    update: vi.fn(),
    eq: vi.fn(),
    then: vi.fn(),
  };
  return { selectChain, insertChain, updateChain };
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
      insert: (...args: unknown[]) => {
        mocks.insertChain.insert(...args);
        return mocks.insertChain;
      },
      update: (...args: unknown[]) => {
        mocks.updateChain.update(...args);
        return mocks.updateChain;
      },
    })),
  },
}));

import {
  MESSAGE_BODY_MAX,
  findOrCreateConversation,
  getConversation,
  listConversations,
  listMessages,
  otherParty,
  sendMessage,
  validateMessageInput,
  type ConversationRow,
  type MessageRow,
  type SendMessageInput,
} from '@/lib/messaging';

const sampleConv: ConversationRow = {
  id: 'c1',
  user_a: 'u1',
  user_b: 'u2',
  last_message_at: '2026-05-01T00:00:00Z',
  created_at: '2026-04-01T00:00:00Z',
};

const sampleMessage: MessageRow = {
  id: 'm1',
  conversation_id: 'c1',
  sender_id: 'u1',
  body: 'Salut !',
  read_at: null,
  created_at: '2026-05-01T00:00:00Z',
};

const validInput = (): SendMessageInput => ({
  conversationId: 'c1',
  senderId: 'u1',
  body: 'Salut !',
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.selectChain.select.mockReturnValue(mocks.selectChain);
  mocks.selectChain.eq.mockReturnValue(mocks.selectChain);
  mocks.selectChain.or.mockReturnValue(mocks.selectChain);
  mocks.selectChain.order.mockReturnValue(mocks.selectChain);
  mocks.selectChain.limit.mockReturnValue(mocks.selectChain);

  mocks.insertChain.insert.mockReturnValue(mocks.insertChain);
  mocks.insertChain.select.mockReturnValue(mocks.insertChain);

  mocks.updateChain.update.mockReturnValue(mocks.updateChain);
  mocks.updateChain.eq.mockReturnValue(mocks.updateChain);
});

describe('validateMessageInput', () => {
  it('valide un input correct', () => {
    expect(validateMessageInput(validInput())).toEqual([]);
  });

  it('refuse un body vide', () => {
    const issues = validateMessageInput({ ...validInput(), body: '   ' });
    expect(issues.some((i) => i.field === 'body')).toBe(true);
  });

  it('refuse un body trop long', () => {
    const issues = validateMessageInput({
      ...validInput(),
      body: 'a'.repeat(MESSAGE_BODY_MAX + 1),
    });
    expect(issues.some((i) => i.field === 'body')).toBe(true);
  });
});

describe('listConversations', () => {
  it('renvoie les conversations où auth est partie, tri last_message_at DESC', async () => {
    resolveChain(mocks.selectChain, { data: [sampleConv], error: null });
    const { data, error } = await listConversations('u1');
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.or).toHaveBeenCalledWith('user_a.eq.u1,user_b.eq.u1');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('last_message_at', {
      ascending: false,
      nullsFirst: false,
    });
  });
});

describe('getConversation', () => {
  it('renvoie la conversation par ID', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sampleConv, error: null });
    const { data } = await getConversation('c1');
    expect(data?.id).toBe('c1');
  });
});

describe('findOrCreateConversation', () => {
  it('refuse l’auto-conversation', async () => {
    const { error } = await findOrCreateConversation('u1', 'u1');
    expect(error?.code).toBe('CONVERSATION_SELF');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('réutilise la conversation existante', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sampleConv, error: null });
    const { data, error } = await findOrCreateConversation('u1', 'u2');
    expect(error).toBeNull();
    expect(data?.id).toBe('c1');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('crée la conversation si introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sampleConv, error: null });
    const { data, error } = await findOrCreateConversation('u1', 'u2');
    expect(error).toBeNull();
    expect(data?.id).toBe('c1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith({ user_a: 'u1', user_b: 'u2' });
  });
});

describe('listMessages', () => {
  it('renvoie les messages, tri ASC pour fil chronologique', async () => {
    resolveChain(mocks.selectChain, { data: [sampleMessage], error: null });
    const { data, error } = await listMessages('c1');
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('conversation_id', 'c1');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: true });
  });

  it('respecte la limite fournie', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listMessages('c1', 10);
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(10);
  });
});

describe('sendMessage', () => {
  it('refuse un message vide', async () => {
    const { error } = await sendMessage({ ...validInput(), body: '' });
    expect(error?.code).toBe('MESSAGE_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère un message valide et bumpe last_message_at', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sampleMessage, error: null });
    resolveChain(mocks.updateChain, { data: null, error: null });
    const { data, error } = await sendMessage(validInput());
    expect(error).toBeNull();
    expect(data?.id).toBe('m1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith({
      conversation_id: 'c1',
      sender_id: 'u1',
      body: 'Salut !',
    });
    expect(mocks.updateChain.update).toHaveBeenCalledWith({
      last_message_at: sampleMessage.created_at,
    });
    expect(mocks.updateChain.eq).toHaveBeenCalledWith('id', 'c1');
  });
});

describe('otherParty', () => {
  it('renvoie user_b si viewer est user_a', () => {
    expect(otherParty(sampleConv, 'u1')).toBe('u2');
  });

  it('renvoie user_a si viewer est user_b', () => {
    expect(otherParty(sampleConv, 'u2')).toBe('u1');
  });

  it('renvoie user_a si viewer n’est pas user_a (fallback)', () => {
    expect(otherParty(sampleConv, 'u3')).toBe('u1');
  });
});

describe('listConversations (edge cases)', () => {
  it('renvoie data: [] si Supabase renvoie null', async () => {
    resolveChain(mocks.selectChain, { data: null, error: null });
    const { data } = await listConversations('u1');
    expect(data).toEqual([]);
  });

  it('propage l’erreur PostgREST', async () => {
    resolveChain(mocks.selectChain, {
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { data, error } = await listConversations('u1');
    expect(data).toEqual([]);
    expect(error?.code).toBe('42501');
  });
});

describe('listMessages (edge cases)', () => {
  it('utilise une limite par défaut de 200', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listMessages('c1');
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(200);
  });
});
