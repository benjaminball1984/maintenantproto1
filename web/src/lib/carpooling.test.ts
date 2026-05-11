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
    gte: vi.fn(),
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
  CARPOOLING_PRICE_MAX,
  CARPOOLING_SEATS_MAX,
  createCarpooling,
  getCarpooling,
  listCarpooling,
  validateCarpoolingInput,
  type CarpoolingRow,
  type CreateCarpoolingInput,
} from '@/lib/carpooling';
import { postgrestErrorMessage } from '@/lib/postgrestError';

const futureIso = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
const pastIso = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

const sampleCarpooling: CarpoolingRow = {
  id: 'c1',
  driver_id: 'u1',
  origin_city: 'Paris',
  destination_city: 'Cherbourg',
  departs_at: futureIso,
  seats: 3,
  price_eur: 12,
  notes: null,
  is_published: true,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const validInput = (): CreateCarpoolingInput => ({
  driverId: 'u1',
  originCity: 'Paris',
  destinationCity: 'Cherbourg',
  departsAt: futureIso,
  seats: 3,
  priceEur: 12,
  notes: 'RDV gare Saint-Lazare 7h30',
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.selectChain.select.mockReturnValue(mocks.selectChain);
  mocks.selectChain.eq.mockReturnValue(mocks.selectChain);
  mocks.selectChain.or.mockReturnValue(mocks.selectChain);
  mocks.selectChain.ilike.mockReturnValue(mocks.selectChain);
  mocks.selectChain.gte.mockReturnValue(mocks.selectChain);
  mocks.selectChain.lte.mockReturnValue(mocks.selectChain);
  mocks.selectChain.order.mockReturnValue(mocks.selectChain);
  mocks.selectChain.limit.mockReturnValue(mocks.selectChain);

  mocks.insertChain.insert.mockReturnValue(mocks.insertChain);
  mocks.insertChain.select.mockReturnValue(mocks.insertChain);
});

describe('validateCarpoolingInput', () => {
  it('valide un input correct', () => {
    expect(validateCarpoolingInput(validInput())).toEqual([]);
  });

  it('refuse une origine trop courte', () => {
    const issues = validateCarpoolingInput({ ...validInput(), originCity: 'a' });
    expect(issues.some((i) => i.field === 'originCity')).toBe(true);
  });

  it('refuse une destination trop courte', () => {
    const issues = validateCarpoolingInput({ ...validInput(), destinationCity: 'a' });
    expect(issues.some((i) => i.field === 'destinationCity')).toBe(true);
  });

  it('refuse une date de départ passée', () => {
    const issues = validateCarpoolingInput({ ...validInput(), departsAt: pastIso });
    expect(issues.some((i) => i.field === 'departsAt')).toBe(true);
  });

  it('refuse un seats hors bornes', () => {
    const low = validateCarpoolingInput({ ...validInput(), seats: 0 });
    expect(low.some((i) => i.field === 'seats')).toBe(true);
    const high = validateCarpoolingInput({ ...validInput(), seats: CARPOOLING_SEATS_MAX + 1 });
    expect(high.some((i) => i.field === 'seats')).toBe(true);
  });

  it('refuse un tarif négatif et un tarif au-dessus du plafond', () => {
    const neg = validateCarpoolingInput({ ...validInput(), priceEur: -5 });
    expect(neg.some((i) => i.field === 'priceEur')).toBe(true);
    const high = validateCarpoolingInput({ ...validInput(), priceEur: CARPOOLING_PRICE_MAX + 1 });
    expect(high.some((i) => i.field === 'priceEur')).toBe(true);
  });

  it('accepte un tarif à 0 (gratuit)', () => {
    expect(validateCarpoolingInput({ ...validInput(), priceEur: 0 })).toEqual([]);
  });
});

describe('listCarpooling', () => {
  it('renvoie la liste publique triée par departs_at ASC', async () => {
    resolveChain(mocks.selectChain, { data: [sampleCarpooling], error: null });
    const { data, error } = await listCarpooling();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('is_published', true);
    expect(mocks.selectChain.order).toHaveBeenCalledWith('departs_at', { ascending: true });
  });

  it('applique les filtres from/to/departsAfter', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listCarpooling({
      from: 'Paris',
      to: 'Cherbourg',
      departsAfter: '2026-06-01T00:00:00Z',
    });
    expect(mocks.selectChain.ilike).toHaveBeenCalledWith('origin_city', 'Paris');
    expect(mocks.selectChain.ilike).toHaveBeenCalledWith('destination_city', 'Cherbourg');
    expect(mocks.selectChain.gte).toHaveBeenCalledWith('departs_at', '2026-06-01T00:00:00Z');
  });

  it('applique le filtre search via or() avec échappement', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listCarpooling({ search: '50%_,' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'origin_city.ilike.%50\\%\\_\\,%,destination_city.ilike.%50\\%\\_\\,%,notes.ilike.%50\\%\\_\\,%',
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
    const { error } = await listCarpooling();
    expect(postgrestErrorMessage(error)).toBe(
      'Vous n’avez pas les droits pour effectuer cette action.',
    );
  });
});

describe('getCarpooling', () => {
  it('renvoie le covoiturage par ID', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sampleCarpooling, error: null });
    const { data, error } = await getCarpooling('c1');
    expect(error).toBeNull();
    expect(data?.id).toBe('c1');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('id', 'c1');
  });

  it('renvoie data: null si introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data } = await getCarpooling('inconnu');
    expect(data).toBeNull();
  });
});

describe('createCarpooling', () => {
  it('refuse un input invalide', async () => {
    const { data, error } = await createCarpooling({ ...validInput(), seats: 0 });
    expect(data).toBeNull();
    expect(error?.code).toBe('CARPOOLING_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère un trajet valide', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sampleCarpooling, error: null });
    const { data, error } = await createCarpooling(validInput());
    expect(error).toBeNull();
    expect(data?.id).toBe('c1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        driver_id: 'u1',
        origin_city: 'Paris',
        destination_city: 'Cherbourg',
        seats: 3,
        price_eur: 12,
        is_published: true,
      }),
    );
  });

  it('remonte l’erreur Postgrest', async () => {
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
    const { data, error } = await createCarpooling(validInput());
    expect(data).toBeNull();
    expect(error?.code).toBe('42501');
  });
});
