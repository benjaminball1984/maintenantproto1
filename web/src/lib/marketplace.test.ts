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
  MARKETPLACE_PRICE_MAX,
  createMarketplaceItem,
  getMarketplaceItem,
  listMarketplace,
  validateMarketplaceInput,
  type CreateMarketplaceInput,
  type MarketplaceItemRow,
} from '@/lib/marketplace';

const sample: MarketplaceItemRow = {
  id: 'm1',
  seller_id: 'u1',
  title: 'Vélo cargo',
  description: 'État neuf',
  category: 'Vélo',
  city: 'Paris',
  price_eur: 250,
  t99cp_cost: null,
  is_sold: false,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const validInput = (): CreateMarketplaceInput => ({
  sellerId: 'u1',
  title: 'Vélo cargo',
  description: 'État neuf',
  category: 'Vélo',
  city: 'Paris',
  priceEur: 250,
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

describe('validateMarketplaceInput', () => {
  it('valide un input avec prix euros', () => {
    expect(validateMarketplaceInput(validInput())).toEqual([]);
  });

  it('valide un input avec T99CP seul', () => {
    expect(
      validateMarketplaceInput({ ...validInput(), priceEur: null, t99cpCost: 50 }),
    ).toEqual([]);
  });

  it('refuse aucun moyen d’échange', () => {
    const issues = validateMarketplaceInput({
      ...validInput(),
      priceEur: null,
      t99cpCost: null,
    });
    expect(issues.some((i) => i.field === 'priceEur')).toBe(true);
  });

  it('refuse un prix au-dessus du plafond', () => {
    const issues = validateMarketplaceInput({ ...validInput(), priceEur: MARKETPLACE_PRICE_MAX + 1 });
    expect(issues.some((i) => i.field === 'priceEur')).toBe(true);
  });

  it('refuse un titre trop court', () => {
    const issues = validateMarketplaceInput({ ...validInput(), title: 'a' });
    expect(issues.some((i) => i.field === 'title')).toBe(true);
  });

  it('refuse une ville trop courte', () => {
    const issues = validateMarketplaceInput({ ...validInput(), city: 'x' });
    expect(issues.some((i) => i.field === 'city')).toBe(true);
  });
});

describe('listMarketplace', () => {
  it('renvoie la liste triée avec is_sold=false', async () => {
    resolveChain(mocks.selectChain, { data: [sample], error: null });
    const { data, error } = await listMarketplace();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('is_sold', false);
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('applique le filtre maxPriceEur', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listMarketplace({ maxPriceEur: 300 });
    expect(mocks.selectChain.lte).toHaveBeenCalledWith('price_eur', 300);
  });

  it('applique le filtre search via or() avec échappement', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listMarketplace({ search: '50%_,' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'title.ilike.%50\\%\\_\\,%,city.ilike.%50\\%\\_\\,%,category.ilike.%50\\%\\_\\,%,description.ilike.%50\\%\\_\\,%',
    );
  });
});

describe('getMarketplaceItem', () => {
  it('renvoie l’annonce par ID', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sample, error: null });
    const { data } = await getMarketplaceItem('m1');
    expect(data?.id).toBe('m1');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('id', 'm1');
  });

  it('renvoie data: null si introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data } = await getMarketplaceItem('?');
    expect(data).toBeNull();
  });
});

describe('createMarketplaceItem', () => {
  it('refuse un input invalide', async () => {
    const { data, error } = await createMarketplaceItem({
      ...validInput(),
      priceEur: null,
      t99cpCost: null,
    });
    expect(data).toBeNull();
    expect(error?.code).toBe('MARKETPLACE_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère une annonce valide', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sample, error: null });
    const { data, error } = await createMarketplaceItem(validInput());
    expect(error).toBeNull();
    expect(data?.id).toBe('m1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        seller_id: 'u1',
        title: 'Vélo cargo',
        category: 'Vélo',
        city: 'Paris',
        price_eur: 250,
        t99cp_cost: null,
      }),
    );
  });
});
