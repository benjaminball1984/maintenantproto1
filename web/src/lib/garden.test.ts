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
    gt: vi.fn(),
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
  createGarden,
  getGarden,
  listGarden,
  validateGardenInput,
  type CreateGardenInput,
  type GardenPlotRow,
} from '@/lib/garden';

const sample: GardenPlotRow = {
  id: 'g1',
  manager_id: 'u1',
  name: 'Jardin de la République',
  description: 'Permaculture',
  city: 'Cherbourg',
  size_sqm: 200,
  available_spots: 4,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const validInput = (): CreateGardenInput => ({
  managerId: 'u1',
  name: 'Jardin de la République',
  description: 'Permaculture',
  city: 'Cherbourg',
  sizeSqm: 200,
  availableSpots: 4,
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.selectChain.select.mockReturnValue(mocks.selectChain);
  mocks.selectChain.eq.mockReturnValue(mocks.selectChain);
  mocks.selectChain.or.mockReturnValue(mocks.selectChain);
  mocks.selectChain.ilike.mockReturnValue(mocks.selectChain);
  mocks.selectChain.gt.mockReturnValue(mocks.selectChain);
  mocks.selectChain.order.mockReturnValue(mocks.selectChain);
  mocks.selectChain.limit.mockReturnValue(mocks.selectChain);

  mocks.insertChain.insert.mockReturnValue(mocks.insertChain);
  mocks.insertChain.select.mockReturnValue(mocks.insertChain);
});

describe('validateGardenInput', () => {
  it('valide un input correct', () => {
    expect(validateGardenInput(validInput())).toEqual([]);
  });

  it('valide sans size_sqm', () => {
    expect(validateGardenInput({ ...validInput(), sizeSqm: null })).toEqual([]);
  });

  it('refuse un nom trop court', () => {
    const issues = validateGardenInput({ ...validInput(), name: 'a' });
    expect(issues.some((i) => i.field === 'name')).toBe(true);
  });

  it('refuse une ville trop courte', () => {
    const issues = validateGardenInput({ ...validInput(), city: 'x' });
    expect(issues.some((i) => i.field === 'city')).toBe(true);
  });

  it('refuse availableSpots négatif', () => {
    const issues = validateGardenInput({ ...validInput(), availableSpots: -1 });
    expect(issues.some((i) => i.field === 'availableSpots')).toBe(true);
  });

  it('refuse sizeSqm à 0', () => {
    const issues = validateGardenInput({ ...validInput(), sizeSqm: 0 });
    expect(issues.some((i) => i.field === 'sizeSqm')).toBe(true);
  });
});

describe('listGarden', () => {
  it('renvoie la liste triée par created_at DESC', async () => {
    resolveChain(mocks.selectChain, { data: [sample], error: null });
    const { data, error } = await listGarden();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('applique le filtre withSpots via gt()', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listGarden({ withSpots: true });
    expect(mocks.selectChain.gt).toHaveBeenCalledWith('available_spots', 0);
  });

  it('applique le filtre search via or() avec échappement', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listGarden({ search: '50%_,' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'name.ilike.%50\\%\\_\\,%,city.ilike.%50\\%\\_\\,%,description.ilike.%50\\%\\_\\,%',
    );
  });
});

describe('getGarden', () => {
  it('renvoie le jardin par ID', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sample, error: null });
    const { data } = await getGarden('g1');
    expect(data?.id).toBe('g1');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('id', 'g1');
  });

  it('renvoie data: null si introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data } = await getGarden('?');
    expect(data).toBeNull();
  });
});

describe('createGarden', () => {
  it('refuse un input invalide', async () => {
    const { error } = await createGarden({ ...validInput(), name: 'a' });
    expect(error?.code).toBe('GARDEN_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère un jardin valide', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sample, error: null });
    const { data, error } = await createGarden(validInput());
    expect(error).toBeNull();
    expect(data?.id).toBe('g1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        manager_id: 'u1',
        name: 'Jardin de la République',
        city: 'Cherbourg',
        size_sqm: 200,
        available_spots: 4,
      }),
    );
  });
});
