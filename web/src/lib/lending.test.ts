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
    lte: vi.fn(),
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
  LENDING_T99CP_MAX,
  createLending,
  getLending,
  listLending,
  validateLendingInput,
  type CreateLendingInput,
  type LendingRow,
} from '@/lib/lending';
import { postgrestErrorMessage } from '@/lib/postgrestError';

const sample: LendingRow = {
  id: 'l1',
  owner_id: 'u1',
  title: 'Perceuse Bosch',
  description: 'Avec 5 mèches',
  category: 'Outillage',
  city: 'Paris',
  t99cp_cost: 5,
  is_available: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const validInput = (): CreateLendingInput => ({
  ownerId: 'u1',
  title: 'Perceuse Bosch',
  description: 'Avec 5 mèches',
  category: 'Outillage',
  city: 'Paris',
  t99cpCost: 5,
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.selectChain.select.mockReturnValue(mocks.selectChain);
  mocks.selectChain.eq.mockReturnValue(mocks.selectChain);
  mocks.selectChain.or.mockReturnValue(mocks.selectChain);
  mocks.selectChain.ilike.mockReturnValue(mocks.selectChain);
  mocks.selectChain.lte.mockReturnValue(mocks.selectChain);
  mocks.selectChain.order.mockReturnValue(mocks.selectChain);
  mocks.selectChain.limit.mockReturnValue(mocks.selectChain);

  mocks.insertChain.insert.mockReturnValue(mocks.insertChain);
  mocks.insertChain.select.mockReturnValue(mocks.insertChain);
});

describe('validateLendingInput', () => {
  it('valide un input correct', () => {
    expect(validateLendingInput(validInput())).toEqual([]);
  });

  it('refuse un titre trop court', () => {
    const issues = validateLendingInput({ ...validInput(), title: 'ab' });
    expect(issues.some((i) => i.field === 'title')).toBe(true);
  });

  it('refuse une catégorie trop courte', () => {
    const issues = validateLendingInput({ ...validInput(), category: 'a' });
    expect(issues.some((i) => i.field === 'category')).toBe(true);
  });

  it('refuse une ville trop courte', () => {
    const issues = validateLendingInput({ ...validInput(), city: 'x' });
    expect(issues.some((i) => i.field === 'city')).toBe(true);
  });

  it('refuse un coût T99CP négatif', () => {
    const issues = validateLendingInput({ ...validInput(), t99cpCost: -1 });
    expect(issues.some((i) => i.field === 't99cpCost')).toBe(true);
  });

  it('refuse un coût T99CP au-dessus du plafond', () => {
    const issues = validateLendingInput({ ...validInput(), t99cpCost: LENDING_T99CP_MAX + 1 });
    expect(issues.some((i) => i.field === 't99cpCost')).toBe(true);
  });

  it('accepte un coût T99CP à 0 (gratuit)', () => {
    expect(validateLendingInput({ ...validInput(), t99cpCost: 0 })).toEqual([]);
  });
});

describe('listLending', () => {
  it('renvoie la liste triée par created_at DESC', async () => {
    resolveChain(mocks.selectChain, { data: [sample], error: null });
    const { data, error } = await listLending();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('is_available', true);
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('applique les filtres city/category/maxCost', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listLending({ city: 'Paris', category: 'Outillage', maxCost: 10 });
    expect(mocks.selectChain.ilike).toHaveBeenCalledWith('city', 'Paris');
    expect(mocks.selectChain.ilike).toHaveBeenCalledWith('category', 'Outillage');
    expect(mocks.selectChain.lte).toHaveBeenCalledWith('t99cp_cost', 10);
  });

  it('applique le filtre search via or() avec échappement', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listLending({ search: '50%_,' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'title.ilike.%50\\%\\_\\,%,city.ilike.%50\\%\\_\\,%,category.ilike.%50\\%\\_\\,%,description.ilike.%50\\%\\_\\,%',
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
    const { error } = await listLending();
    expect(postgrestErrorMessage(error)).toBe(
      'Vous n’avez pas les droits pour effectuer cette action.',
    );
  });
});

describe('getLending', () => {
  it('renvoie l’annonce par ID', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sample, error: null });
    const { data, error } = await getLending('l1');
    expect(error).toBeNull();
    expect(data?.id).toBe('l1');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('id', 'l1');
  });

  it('renvoie data: null si introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data } = await getLending('inconnu');
    expect(data).toBeNull();
  });
});

describe('createLending', () => {
  it('refuse un input invalide', async () => {
    const { data, error } = await createLending({ ...validInput(), title: 'a' });
    expect(data).toBeNull();
    expect(error?.code).toBe('LENDING_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère une annonce valide', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sample, error: null });
    const { data, error } = await createLending(validInput());
    expect(error).toBeNull();
    expect(data?.id).toBe('l1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        owner_id: 'u1',
        title: 'Perceuse Bosch',
        category: 'Outillage',
        city: 'Paris',
        t99cp_cost: 5,
        is_available: true,
      }),
    );
  });
});
