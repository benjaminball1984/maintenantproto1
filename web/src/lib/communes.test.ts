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
    select: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const deleteChain = {
    delete: vi.fn(),
    eq: vi.fn(),
    then: vi.fn(),
  };
  return { selectChain, insertChain, updateChain, deleteChain };
});

function resolveChain<T>(
  chain: { then: ReturnType<typeof vi.fn> },
  result: QueryResult<T>,
): void {
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
      delete: (...args: unknown[]) => {
        mocks.deleteChain.delete(...args);
        return mocks.deleteChain;
      },
    })),
  },
}));

import {
  COMMUNE_CITY_MIN,
  COMMUNE_DESCRIPTION_MAX,
  COMMUNE_NAME_MIN,
  createCommune,
  getCommuneBySlug,
  getCommuneMembership,
  joinCommune,
  leaveCommune,
  listCommuneMembers,
  listCommunes,
  updateCommuneMemberRole,
  validateCommuneInput,
  type CommuneMemberRow,
  type CommuneRow,
  type CreateCommuneInput,
} from '@/lib/communes';

const sampleCommune: CommuneRow = {
  id: 'co1',
  name: 'Commune des Lilas',
  slug: 'commune-des-lilas',
  city: 'Les Lilas',
  description: 'Une commune libre engagée dans la transition écologique.',
  treasurer_id: 'u1',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const sampleMember: CommuneMemberRow = {
  id: 'cm1',
  commune_id: 'co1',
  user_id: 'u2',
  role: 'member',
  joined_at: '2026-05-02T00:00:00Z',
};

const validInput = (): CreateCommuneInput => ({
  name: 'Commune des Lilas',
  city: 'Les Lilas',
  description: 'Une commune libre engagée dans la transition écologique.',
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
  mocks.updateChain.select.mockReturnValue(mocks.updateChain);

  mocks.deleteChain.delete.mockReturnValue(mocks.deleteChain);
  mocks.deleteChain.eq.mockReturnValue(mocks.deleteChain);
});

describe('validateCommuneInput', () => {
  it('valide un input correct', () => {
    expect(validateCommuneInput(validInput())).toEqual([]);
  });

  it('refuse un nom trop court', () => {
    const issues = validateCommuneInput({
      ...validInput(),
      name: 'x'.repeat(COMMUNE_NAME_MIN - 1),
    });
    expect(issues.some((i) => i.field === 'name')).toBe(true);
  });

  it('refuse une ville trop courte', () => {
    const issues = validateCommuneInput({
      ...validInput(),
      city: 'x'.repeat(COMMUNE_CITY_MIN - 1),
    });
    expect(issues.some((i) => i.field === 'city')).toBe(true);
  });

  it('refuse une description trop longue', () => {
    const issues = validateCommuneInput({
      ...validInput(),
      description: 'a'.repeat(COMMUNE_DESCRIPTION_MAX + 1),
    });
    expect(issues.some((i) => i.field === 'description')).toBe(true);
  });

  it('accepte une description vide', () => {
    expect(validateCommuneInput({ ...validInput(), description: '' })).toEqual([]);
  });
});

describe('listCommunes', () => {
  it('renvoie les communes triées par created_at DESC', async () => {
    resolveChain(mocks.selectChain, { data: [sampleCommune], error: null });
    const { data, error } = await listCommunes();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('applique le filtre city', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listCommunes({ city: 'Les Lilas' });
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('city', 'Les Lilas');
  });

  it('échappe les méta-caractères du search', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listCommunes({ search: '50%_,' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'name.ilike.%50\\%\\_\\,%,city.ilike.%50\\%\\_\\,%,description.ilike.%50\\%\\_\\,%',
    );
  });

  it('propage l’erreur PostgREST', async () => {
    resolveChain(mocks.selectChain, {
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { data, error } = await listCommunes();
    expect(data).toEqual([]);
    expect(error?.code).toBe('42501');
  });
});

describe('getCommuneBySlug', () => {
  it('renvoie la commune par slug', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({
      data: sampleCommune,
      error: null,
    });
    const { data } = await getCommuneBySlug(sampleCommune.slug);
    expect(data?.id).toBe('co1');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('slug', sampleCommune.slug);
  });

  it('renvoie null si introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data } = await getCommuneBySlug('?');
    expect(data).toBeNull();
  });
});

describe('createCommune', () => {
  it('refuse un input invalide', async () => {
    const { error } = await createCommune({ ...validInput(), name: 'x' });
    expect(error?.code).toBe('COMMUNE_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère une commune avec slug dérivé', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: sampleCommune,
      error: null,
    });
    const { data, error } = await createCommune(validInput());
    expect(error).toBeNull();
    expect(data?.id).toBe('co1');
    const insertArg = mocks.insertChain.insert.mock.calls[0]?.[0] as { slug: string };
    expect(insertArg.slug).toBe('commune-des-lilas');
  });

  it('retente avec un suffixe sur collision 23505', async () => {
    mocks.insertChain.maybeSingle
      .mockResolvedValueOnce({ data: null, error: { code: '23505' } })
      .mockResolvedValueOnce({ data: sampleCommune, error: null });
    const { data, error } = await createCommune(validInput());
    expect(error).toBeNull();
    expect(data?.id).toBe('co1');
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(2);
    const second = mocks.insertChain.insert.mock.calls[1]?.[0] as { slug: string };
    expect(second.slug).toBe('commune-des-lilas-2');
  });

  it('abandonne après 5 tentatives', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'unique' },
    });
    const { data, error } = await createCommune(validInput());
    expect(data).toBeNull();
    expect(error?.code).toBe('COMMUNE_SLUG_COLLISION');
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(5);
  });

  it('propage l’erreur RLS non-collision', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { data, error } = await createCommune(validInput());
    expect(data).toBeNull();
    expect(error?.code).toBe('42501');
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(1);
  });
});

describe('listCommuneMembers', () => {
  it('renvoie la liste triée ASC', async () => {
    resolveChain(mocks.selectChain, { data: [sampleMember], error: null });
    const { data, error } = await listCommuneMembers('co1');
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('commune_id', 'co1');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('joined_at', { ascending: true });
  });
});

describe('getCommuneMembership', () => {
  it('renvoie la ligne si présente', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({
      data: sampleMember,
      error: null,
    });
    const { data } = await getCommuneMembership('co1', 'u2');
    expect(data?.id).toBe('cm1');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('commune_id', 'co1');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('user_id', 'u2');
  });

  it('renvoie null si l’utilisateur n’est pas membre', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data } = await getCommuneMembership('co1', 'u3');
    expect(data).toBeNull();
  });
});

describe('joinCommune', () => {
  it('insère un membre rôle "member"', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: sampleMember,
      error: null,
    });
    const { data, error } = await joinCommune('co1', 'u2');
    expect(error).toBeNull();
    expect(data?.id).toBe('cm1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith({
      commune_id: 'co1',
      user_id: 'u2',
      role: 'member',
    });
  });
});

describe('leaveCommune', () => {
  it('supprime le lien d’appartenance', async () => {
    resolveChain(mocks.deleteChain, { data: null, error: null });
    const { error } = await leaveCommune('co1', 'u2');
    expect(error).toBeNull();
    expect(mocks.deleteChain.eq).toHaveBeenCalledWith('commune_id', 'co1');
    expect(mocks.deleteChain.eq).toHaveBeenCalledWith('user_id', 'u2');
  });

  it('propage l’erreur RLS', async () => {
    resolveChain(mocks.deleteChain, {
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { error } = await leaveCommune('co1', 'u2');
    expect(error?.code).toBe('42501');
  });
});

describe('updateCommuneMemberRole', () => {
  it('refuse un rôle invalide', async () => {
    // @ts-expect-error test invalid role
    const { error } = await updateCommuneMemberRole('cm1', 'overlord');
    expect(error?.code).toBe('COMMUNE_ROLE_INVALID');
    expect(mocks.updateChain.update).not.toHaveBeenCalled();
  });

  it('met à jour le rôle quand valide', async () => {
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({
      data: { ...sampleMember, role: 'referent' },
      error: null,
    });
    const { data, error } = await updateCommuneMemberRole('cm1', 'referent');
    expect(error).toBeNull();
    expect(data?.role).toBe('referent');
    expect(mocks.updateChain.update).toHaveBeenCalledWith({ role: 'referent' });
    expect(mocks.updateChain.eq).toHaveBeenCalledWith('id', 'cm1');
  });

  it('accepte le rôle treasurer', async () => {
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({
      data: { ...sampleMember, role: 'treasurer' },
      error: null,
    });
    const { data } = await updateCommuneMemberRole('cm1', 'treasurer');
    expect(data?.role).toBe('treasurer');
  });

  it('accepte le rôle admin', async () => {
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({
      data: { ...sampleMember, role: 'admin' },
      error: null,
    });
    const { data } = await updateCommuneMemberRole('cm1', 'admin');
    expect(data?.role).toBe('admin');
  });

  it('propage une erreur RLS', async () => {
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { data, error } = await updateCommuneMemberRole('cm1', 'referent');
    expect(data).toBeNull();
    expect(error?.code).toBe('42501');
  });
});

describe('validateCommuneInput (cas limites)', () => {
  it('valide pile à la borne min', () => {
    expect(
      validateCommuneInput({
        name: 'x'.repeat(COMMUNE_NAME_MIN),
        city: 'x'.repeat(COMMUNE_CITY_MIN),
      }),
    ).toEqual([]);
  });

  it('refuse un nom trop long', () => {
    const issues = validateCommuneInput({
      name: 'a'.repeat(81),
      city: 'Les Lilas',
    });
    expect(issues.some((i) => i.field === 'name')).toBe(true);
  });
});

describe('createCommune (treasurer)', () => {
  it('passe treasurer_id quand fourni', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: sampleCommune,
      error: null,
    });
    await createCommune({ ...validInput(), treasurerId: 'u-tres' });
    const insertArg = mocks.insertChain.insert.mock.calls[0]?.[0] as {
      treasurer_id: string | null;
    };
    expect(insertArg.treasurer_id).toBe('u-tres');
  });

  it('met treasurer_id à null si absent', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: sampleCommune,
      error: null,
    });
    await createCommune(validInput());
    const insertArg = mocks.insertChain.insert.mock.calls[0]?.[0] as {
      treasurer_id: string | null;
    };
    expect(insertArg.treasurer_id).toBeNull();
  });
});

describe('joinCommune (erreurs)', () => {
  it('propage l’erreur RLS', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { data, error } = await joinCommune('co1', 'u2');
    expect(data).toBeNull();
    expect(error?.code).toBe('42501');
  });
});
