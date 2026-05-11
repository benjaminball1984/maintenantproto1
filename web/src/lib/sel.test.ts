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
    ilike: vi.fn(),
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
  return { selectChain, insertChain };
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
    })),
  },
}));

import {
  SEL_RATE_MAX,
  createSelOffer,
  getSelOffer,
  listSel,
  validateSelInput,
  type CreateSelInput,
  type SelOfferRow,
} from '@/lib/sel';

const sample: SelOfferRow = {
  id: 's1',
  user_id: 'u1',
  title: 'Cours de guitare',
  description: 'Tous niveaux',
  category: 'Musique',
  city: 'Paris',
  t99cp_rate: 5,
  is_active: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const validInput = (): CreateSelInput => ({
  userId: 'u1',
  title: 'Cours de guitare',
  description: 'Tous niveaux',
  category: 'Musique',
  city: 'Paris',
  t99cpRate: 5,
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.selectChain.select.mockReturnValue(mocks.selectChain);
  mocks.selectChain.eq.mockReturnValue(mocks.selectChain);
  mocks.selectChain.or.mockReturnValue(mocks.selectChain);
  mocks.selectChain.ilike.mockReturnValue(mocks.selectChain);
  mocks.selectChain.order.mockReturnValue(mocks.selectChain);
  mocks.selectChain.limit.mockReturnValue(mocks.selectChain);

  mocks.insertChain.insert.mockReturnValue(mocks.insertChain);
  mocks.insertChain.select.mockReturnValue(mocks.insertChain);
});

describe('validateSelInput', () => {
  it('valide un input correct', () => {
    expect(validateSelInput(validInput())).toEqual([]);
  });

  it('refuse un titre trop court', () => {
    const issues = validateSelInput({ ...validInput(), title: 'a' });
    expect(issues.some((i) => i.field === 'title')).toBe(true);
  });

  it('refuse une ville trop courte', () => {
    const issues = validateSelInput({ ...validInput(), city: 'x' });
    expect(issues.some((i) => i.field === 'city')).toBe(true);
  });

  it('refuse une catégorie trop courte', () => {
    const issues = validateSelInput({ ...validInput(), category: 'x' });
    expect(issues.some((i) => i.field === 'category')).toBe(true);
  });

  it('refuse un tarif T99CP négatif', () => {
    const issues = validateSelInput({ ...validInput(), t99cpRate: -1 });
    expect(issues.some((i) => i.field === 't99cpRate')).toBe(true);
  });

  it('refuse un tarif T99CP au-dessus du plafond', () => {
    const issues = validateSelInput({ ...validInput(), t99cpRate: SEL_RATE_MAX + 1 });
    expect(issues.some((i) => i.field === 't99cpRate')).toBe(true);
  });
});

describe('listSel', () => {
  it('renvoie la liste active triée par created_at DESC', async () => {
    resolveChain(mocks.selectChain, { data: [sample], error: null });
    const { data, error } = await listSel();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('is_active', true);
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('applique le filtre search via or() avec échappement', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listSel({ search: '50%_,' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'title.ilike.%50\\%\\_\\,%,city.ilike.%50\\%\\_\\,%,category.ilike.%50\\%\\_\\,%,description.ilike.%50\\%\\_\\,%',
    );
  });

  it('applique les filtres city / category', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listSel({ city: 'Paris', category: 'Musique' });
    expect(mocks.selectChain.ilike).toHaveBeenCalledWith('city', 'Paris');
    expect(mocks.selectChain.ilike).toHaveBeenCalledWith('category', 'Musique');
  });
});

describe('getSelOffer', () => {
  it('renvoie l’offre par ID', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sample, error: null });
    const { data } = await getSelOffer('s1');
    expect(data?.id).toBe('s1');
  });

  it('renvoie data: null si introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data } = await getSelOffer('?');
    expect(data).toBeNull();
  });
});

describe('createSelOffer', () => {
  it('refuse un input invalide', async () => {
    const { error } = await createSelOffer({ ...validInput(), title: 'a' });
    expect(error?.code).toBe('SEL_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère une offre valide', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sample, error: null });
    const { data, error } = await createSelOffer(validInput());
    expect(error).toBeNull();
    expect(data?.id).toBe('s1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'u1',
        title: 'Cours de guitare',
        category: 'Musique',
        city: 'Paris',
        t99cp_rate: 5,
        is_active: true,
      }),
    );
  });
});
