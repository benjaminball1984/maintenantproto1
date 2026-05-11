import { describe, it, expect, beforeEach, vi } from 'vitest';

interface QueryResult<T> {
  data: T;
  error: unknown;
}

const mocks = vi.hoisted(() => {
  // selectChain : .from().select().eq().order().limit() — thenable (await query)
  // ou terminé par .maybeSingle() pour les single-row.
  const selectChain = {
    select: vi.fn(),
    eq: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn(),
  };
  // insertChain : .from().insert(...).select('*').maybeSingle() pour la fiche
  // poll/poll_options. La fonction createPoll réutilise ce même chain pour
  // insérer d'abord le poll puis le tableau d'options, donc on garde des
  // helpers `then` (poll_options.insert(arr).select('*') sans maybeSingle).
  const insertChain = {
    insert: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn(),
  };
  const deleteChain = {
    delete: vi.fn(),
    eq: vi.fn(),
    then: vi.fn(),
  };
  return { selectChain, insertChain, deleteChain };
});

/** Rend un chain « thenable » : `await chain` renvoie {data,error}. */
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
      delete: (...args: unknown[]) => {
        mocks.deleteChain.delete(...args);
        return mocks.deleteChain;
      },
    })),
  },
}));

import {
  createPoll,
  getPoll,
  getUserVote,
  hasUserVoted,
  listPolls,
  POLL_DESCRIPTION_MIN,
  POLL_OPTIONS_MAX_COUNT,
  POLL_OPTIONS_MIN_COUNT,
  POLL_QUESTION_MIN,
  unvotePoll,
  validatePollInput,
  votePoll,
  type CreatePollInput,
  type PollOptionRow,
  type PollRow,
} from '@/lib/polls';
import { postgrestErrorMessage } from '@/lib/postgrestError';

const samplePoll: PollRow = {
  id: 'p1',
  author_id: 'u1',
  slug: 'climat-2026',
  question: 'Quel objectif climat pour 2026 ?',
  description: 'd'.repeat(POLL_DESCRIPTION_MIN),
  members_only: true,
  closes_at: null,
  status: 'published',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const sampleOptions: PollOptionRow[] = [
  {
    id: 'o1',
    poll_id: 'p1',
    label: '−40% net CO₂',
    position: 0,
    vote_count: 10,
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'o2',
    poll_id: 'p1',
    label: '−60% net CO₂',
    position: 1,
    vote_count: 25,
    created_at: '2026-05-01T00:00:00Z',
  },
];

const validInput = (): CreatePollInput => ({
  authorId: 'u1',
  question: 'Quel objectif climat pour la commune en 2026 ?',
  description: 'Choisissez la trajectoire que vous souhaitez voir portée par le conseil municipal.',
  options: ['−40% net CO₂', '−60% net CO₂', 'Statu quo'],
  membersOnly: true,
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

  mocks.deleteChain.delete.mockReturnValue(mocks.deleteChain);
  mocks.deleteChain.eq.mockReturnValue(mocks.deleteChain);
});

describe('validatePollInput', () => {
  it('valide un input correct', () => {
    expect(validatePollInput(validInput())).toEqual([]);
  });

  it('refuse une question trop courte', () => {
    const issues = validatePollInput({ ...validInput(), question: 'court' });
    expect(issues.some((i) => i.field === 'question')).toBe(true);
  });

  it('refuse une description sous le seuil', () => {
    const issues = validatePollInput({ ...validInput(), description: 'court' });
    expect(issues.some((i) => i.field === 'description')).toBe(true);
  });

  it(`refuse moins de ${POLL_OPTIONS_MIN_COUNT} options`, () => {
    const issues = validatePollInput({ ...validInput(), options: ['une seule'] });
    expect(issues.some((i) => i.field === 'options')).toBe(true);
  });

  it(`refuse plus de ${POLL_OPTIONS_MAX_COUNT} options`, () => {
    const issues = validatePollInput({
      ...validInput(),
      options: Array.from({ length: POLL_OPTIONS_MAX_COUNT + 1 }, (_, i) => `Option ${i + 1}`),
    });
    expect(issues.some((i) => i.field === 'options')).toBe(true);
  });

  it('refuse une option trop courte (sous le seuil)', () => {
    const issues = validatePollInput({ ...validInput(), options: ['A', 'Très bien'] });
    expect(issues.some((i) => i.field === 'options')).toBe(true);
  });

  it('refuse des options doublonnées', () => {
    const issues = validatePollInput({
      ...validInput(),
      options: ['Option A', 'option a', 'Option B'],
    });
    expect(issues.some((i) => i.field === 'options')).toBe(true);
  });

  it('refuse une closes_at dans le passé', () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    const issues = validatePollInput({ ...validInput(), closesAt: past });
    expect(issues.some((i) => i.field === 'closesAt')).toBe(true);
  });

  it('accepte une closes_at future', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(validatePollInput({ ...validInput(), closesAt: future })).toEqual([]);
  });
});

describe('listPolls', () => {
  it('renvoie la liste publique triée par created_at DESC', async () => {
    const rows = [samplePoll, { ...samplePoll, id: 'p2', slug: 'p2' }];
    resolveChain(mocks.selectChain, { data: rows, error: null });
    const { data, error } = await listPolls();
    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('status', 'published');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(50);
  });

  it('applique le filtre search via .or(question|description ilike)', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listPolls({ search: 'climat' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'question.ilike.%climat%,description.ilike.%climat%',
    );
  });

  it('échappe les méta-caractères ilike dans search', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listPolls({ search: '50%_' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'question.ilike.%50\\%\\_%,description.ilike.%50\\%\\_%',
    );
  });

  it('mappe une erreur Postgrest 42501 en FR', async () => {
    resolveChain(mocks.selectChain, {
      data: null,
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    const { error } = await listPolls();
    expect(error).toMatchObject({ code: '42501' });
    expect(postgrestErrorMessage(error)).toBe(
      'Vous n’avez pas les droits pour effectuer cette action.',
    );
  });
});

describe('getPoll', () => {
  it('renvoie le poll + ses options triées par position', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: samplePoll, error: null });
    resolveChain(mocks.selectChain, { data: sampleOptions, error: null });
    const { data, error } = await getPoll('climat-2026');
    expect(error).toBeNull();
    expect(data?.poll.id).toBe('p1');
    expect(data?.options).toHaveLength(2);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('slug', 'climat-2026');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('position', { ascending: true });
  });

  it('renvoie data: null si le slug est introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data, error } = await getPoll('inconnu');
    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  it('remonte l’erreur si la requête options échoue', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: samplePoll, error: null });
    resolveChain(mocks.selectChain, {
      data: null,
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    const { data, error } = await getPoll('climat-2026');
    expect(data).toBeNull();
    expect(error).toMatchObject({ code: '42501' });
  });
});

describe('createPoll', () => {
  it('refuse un input invalide sans appeler Supabase', async () => {
    const { data, error } = await createPoll({ ...validInput(), question: 'court' });
    expect(data).toBeNull();
    expect(error?.code).toBe('POLL_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère un poll + ses options avec slug stable', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: samplePoll, error: null });
    resolveChain(mocks.insertChain, { data: sampleOptions, error: null });
    const { data, error } = await createPoll(validInput());
    expect(error).toBeNull();
    expect(data?.poll.id).toBe('p1');
    expect(data?.options).toHaveLength(2);
    expect(mocks.insertChain.insert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        author_id: 'u1',
        members_only: true,
        status: 'published',
        slug: 'quel-objectif-climat-pour-la-commune-en-2026',
      }),
    );
    // 2nd call insert: tableau d'options (avec position incrémentale)
    expect(mocks.insertChain.insert).toHaveBeenNthCalledWith(
      2,
      expect.arrayContaining([
        expect.objectContaining({ poll_id: 'p1', label: '−40% net CO₂', position: 0 }),
        expect.objectContaining({ poll_id: 'p1', label: '−60% net CO₂', position: 1 }),
        expect.objectContaining({ poll_id: 'p1', label: 'Statu quo', position: 2 }),
      ]),
    );
  });

  it('retente avec un suffixe en cas de collision (23505)', async () => {
    mocks.insertChain.maybeSingle
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'dup', details: '', hint: '', code: '23505', name: 'PostgrestError' },
      })
      .mockResolvedValueOnce({
        data: { ...samplePoll, slug: 'quel-objectif-climat-pour-la-commune-en-2026-2' },
        error: null,
      });
    resolveChain(mocks.insertChain, { data: sampleOptions, error: null });
    const { data, error } = await createPoll(validInput());
    expect(error).toBeNull();
    expect(data?.poll.slug).toBe('quel-objectif-climat-pour-la-commune-en-2026-2');
    // 2 inserts pour le poll + 1 pour les options
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(3);
  });

  it('remonte une erreur Postgrest non-23505 sans retry', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    const { data, error } = await createPoll(validInput());
    expect(data).toBeNull();
    expect(error?.code).toBe('42501');
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(1);
  });

  it('rollback : supprime le poll si l’insertion des options échoue', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: samplePoll, error: null });
    resolveChain(mocks.insertChain, {
      data: null,
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    resolveChain(mocks.deleteChain, { data: null, error: null });
    const { data, error } = await createPoll(validInput());
    expect(data).toBeNull();
    expect(error).toMatchObject({ code: '42501' });
    expect(mocks.deleteChain.delete).toHaveBeenCalled();
    expect(mocks.deleteChain.eq).toHaveBeenCalledWith('id', 'p1');
  });
});

describe('votePoll', () => {
  it('insère un vote pour le user courant', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: {
        id: 'v1',
        poll_id: 'p1',
        option_id: 'o2',
        user_id: 'u1',
        created_at: '2026-05-01T00:00:00Z',
      },
      error: null,
    });
    const { data, error } = await votePoll('p1', 'o2', 'u1');
    expect(error).toBeNull();
    expect(data?.id).toBe('v1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith({
      poll_id: 'p1',
      option_id: 'o2',
      user_id: 'u1',
    });
  });

  it('mappe le doublon (23505) — déjà voté', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'duplicate key',
        details: '',
        hint: '',
        code: '23505',
        name: 'PostgrestError',
      },
    });
    const { error } = await votePoll('p1', 'o2', 'u1');
    expect(error?.code).toBe('23505');
    expect(postgrestErrorMessage(error)).toBe(
      'Cette valeur est déjà utilisée par un autre compte.',
    );
  });
});

describe('unvotePoll', () => {
  it('supprime le vote du user courant', async () => {
    resolveChain(mocks.deleteChain, { data: null, error: null });
    const { error } = await unvotePoll('p1', 'u1');
    expect(error).toBeNull();
    expect(mocks.deleteChain.eq).toHaveBeenNthCalledWith(1, 'poll_id', 'p1');
    expect(mocks.deleteChain.eq).toHaveBeenNthCalledWith(2, 'user_id', 'u1');
  });
});

describe('hasUserVoted', () => {
  it('renvoie true quand une ligne existe', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'v1' }, error: null });
    const { voted, error } = await hasUserVoted('p1', 'u1');
    expect(error).toBeNull();
    expect(voted).toBe(true);
  });

  it('renvoie false quand aucune ligne', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { voted } = await hasUserVoted('p1', 'u1');
    expect(voted).toBe(false);
  });
});

describe('getUserVote', () => {
  it('renvoie l’option votée par le user', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({
      data: { option_id: 'o2' },
      error: null,
    });
    const { optionId, error } = await getUserVote('p1', 'u1');
    expect(error).toBeNull();
    expect(optionId).toBe('o2');
  });

  it('renvoie null quand le user n’a pas voté', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { optionId } = await getUserVote('p1', 'u1');
    expect(optionId).toBeNull();
  });
});

// Sanity check : POLL_QUESTION_MIN est exporté et > 0 (sert dans les tests UI).
describe('constantes exportées', () => {
  it('POLL_QUESTION_MIN > 0', () => {
    expect(POLL_QUESTION_MIN).toBeGreaterThan(0);
  });
});
