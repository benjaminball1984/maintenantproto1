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
  const deleteChain = {
    delete: vi.fn(),
    eq: vi.fn(),
    then: vi.fn(),
  };
  return { selectChain, insertChain, deleteChain };
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
      delete: (...args: unknown[]) => {
        mocks.deleteChain.delete(...args);
        return mocks.deleteChain;
      },
    })),
  },
}));

import {
  cancelRsvp,
  createMobilization,
  getMobilization,
  hasUserRsvp,
  listMobilizations,
  MOBILIZATION_SUMMARY_MIN,
  rsvpMobilization,
  validateMobilizationInput,
  type CreateMobilizationInput,
  type MobilizationRow,
} from '@/lib/mobilizations';
import { postgrestErrorMessage } from '@/lib/postgrestError';

const sampleMobilization: MobilizationRow = {
  id: 'm1',
  organizer_id: 'u1',
  title: 'Marche pour le climat',
  slug: 'marche-pour-le-climat',
  summary: 'a'.repeat(MOBILIZATION_SUMMARY_MIN),
  body: null,
  starts_at: '2026-06-01T14:00:00Z',
  ends_at: null,
  city: 'Paris',
  address: null,
  cover_url: null,
  status: 'published',
  participation_count: 42,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const validInput = (): CreateMobilizationInput => ({
  organizerId: 'u1',
  title: 'Marche pour le climat — Paris',
  summary:
    'Une mobilisation pacifique et inter-collectifs pour exiger des actions concrètes maintenant.',
  body: null,
  city: 'Paris',
  startsAt: '2026-06-01T14:00:00Z',
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

  mocks.deleteChain.delete.mockReturnValue(mocks.deleteChain);
  mocks.deleteChain.eq.mockReturnValue(mocks.deleteChain);
});

describe('validateMobilizationInput', () => {
  it('valide un input correct', () => {
    expect(validateMobilizationInput(validInput())).toEqual([]);
  });

  it('refuse un titre trop court', () => {
    const issues = validateMobilizationInput({ ...validInput(), title: 'court' });
    expect(issues.some((i) => i.field === 'title')).toBe(true);
  });

  it('refuse un résumé trop court', () => {
    const issues = validateMobilizationInput({ ...validInput(), summary: 'court' });
    expect(issues.some((i) => i.field === 'summary')).toBe(true);
  });

  it('refuse une ville vide', () => {
    const issues = validateMobilizationInput({ ...validInput(), city: '' });
    expect(issues.some((i) => i.field === 'city')).toBe(true);
  });

  it('refuse une date de début invalide', () => {
    const issues = validateMobilizationInput({ ...validInput(), startsAt: 'not-a-date' });
    expect(issues.some((i) => i.field === 'startsAt')).toBe(true);
  });

  it('refuse une date de fin antérieure à la date de début', () => {
    const issues = validateMobilizationInput({
      ...validInput(),
      startsAt: '2026-06-01T14:00:00Z',
      endsAt: '2026-05-31T14:00:00Z',
    });
    expect(issues.some((i) => i.field === 'endsAt')).toBe(true);
  });

  it('accepte un body vide', () => {
    expect(validateMobilizationInput({ ...validInput(), body: '' })).toEqual([]);
  });

  it('refuse un body non vide mais trop court', () => {
    const issues = validateMobilizationInput({ ...validInput(), body: 'court' });
    expect(issues.some((i) => i.field === 'body')).toBe(true);
  });
});

describe('listMobilizations', () => {
  it('renvoie la liste publique triée par starts_at ASC', async () => {
    const rows = [sampleMobilization, { ...sampleMobilization, id: 'm2' }];
    resolveChain(mocks.selectChain, { data: rows, error: null });
    const { data, error } = await listMobilizations();
    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('status', 'published');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('starts_at', { ascending: true });
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(50);
  });

  it('applique le filtre city via .ilike', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listMobilizations({ city: 'Paris' });
    expect(mocks.selectChain.ilike).toHaveBeenCalledWith('city', 'Paris');
  });

  it('applique le filtre startsAfter / startsBefore', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listMobilizations({
      startsAfter: '2026-06-01T00:00:00Z',
      startsBefore: '2026-12-31T23:59:59Z',
    });
    expect(mocks.selectChain.gte).toHaveBeenCalledWith('starts_at', '2026-06-01T00:00:00Z');
    expect(mocks.selectChain.lte).toHaveBeenCalledWith('starts_at', '2026-12-31T23:59:59Z');
  });

  it('applique le filtre search via .or(title|summary ilike)', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listMobilizations({ search: 'climat' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'title.ilike.%climat%,summary.ilike.%climat%',
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
    const { error } = await listMobilizations();
    expect(error).toMatchObject({ code: '42501' });
    expect(postgrestErrorMessage(error)).toBe(
      'Vous n’avez pas les droits pour effectuer cette action.',
    );
  });
});

describe('getMobilization', () => {
  it('renvoie la mobilisation correspondant au slug', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sampleMobilization, error: null });
    const { data, error } = await getMobilization('marche-pour-le-climat');
    expect(error).toBeNull();
    expect(data?.id).toBe('m1');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('slug', 'marche-pour-le-climat');
  });

  it('renvoie data: null si introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data, error } = await getMobilization('unknown');
    expect(error).toBeNull();
    expect(data).toBeNull();
  });
});

describe('createMobilization', () => {
  it('refuse un input invalide sans appeler Supabase', async () => {
    const { data, error } = await createMobilization({ ...validInput(), title: 'court' });
    expect(data).toBeNull();
    expect(error?.code).toBe('MOBILIZATION_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère une ligne avec slug stable depuis le titre', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: sampleMobilization,
      error: null,
    });
    const { data, error } = await createMobilization(validInput());
    expect(error).toBeNull();
    expect(data?.id).toBe('m1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        organizer_id: 'u1',
        title: 'Marche pour le climat — Paris',
        city: 'Paris',
        status: 'published',
        slug: 'marche-pour-le-climat-paris',
      }),
    );
  });

  it('retente avec suffixe en cas de collision (23505)', async () => {
    mocks.insertChain.maybeSingle
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'dup', details: '', hint: '', code: '23505', name: 'PostgrestError' },
      })
      .mockResolvedValueOnce({
        data: { ...sampleMobilization, slug: 'marche-pour-le-climat-paris-2' },
        error: null,
      });
    const { data, error } = await createMobilization(validInput());
    expect(error).toBeNull();
    expect(data?.slug).toBe('marche-pour-le-climat-paris-2');
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(2);
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
    const { data, error } = await createMobilization(validInput());
    expect(data).toBeNull();
    expect(error?.code).toBe('42501');
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(1);
  });
});

describe('rsvpMobilization', () => {
  it('insère une participation pour le user courant', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: { id: 'pa1', mobilization_id: 'm1', user_id: 'u1', created_at: '2026-05-01T00:00:00Z' },
      error: null,
    });
    const { data, error } = await rsvpMobilization('m1', 'u1');
    expect(error).toBeNull();
    expect(data?.id).toBe('pa1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith({
      mobilization_id: 'm1',
      user_id: 'u1',
    });
  });

  it('mappe le doublon (23505) — déjà inscrit', async () => {
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
    const { error } = await rsvpMobilization('m1', 'u1');
    expect(error?.code).toBe('23505');
    expect(postgrestErrorMessage(error)).toBe(
      'Cette valeur est déjà utilisée par un autre compte.',
    );
  });
});

describe('cancelRsvp', () => {
  it('supprime la participation du user courant', async () => {
    resolveChain(mocks.deleteChain, { data: null, error: null });
    const { error } = await cancelRsvp('m1', 'u1');
    expect(error).toBeNull();
    expect(mocks.deleteChain.eq).toHaveBeenNthCalledWith(1, 'mobilization_id', 'm1');
    expect(mocks.deleteChain.eq).toHaveBeenNthCalledWith(2, 'user_id', 'u1');
  });
});

describe('hasUserRsvp', () => {
  it('renvoie true quand une ligne existe', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'pa1' }, error: null });
    const { rsvp, error } = await hasUserRsvp('m1', 'u1');
    expect(error).toBeNull();
    expect(rsvp).toBe(true);
  });

  it('renvoie false quand aucune ligne', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { rsvp } = await hasUserRsvp('m1', 'u1');
    expect(rsvp).toBe(false);
  });
});
