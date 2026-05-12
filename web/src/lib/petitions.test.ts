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
  // rpc : appel direct supabase.rpc(name, args) → Promise<{ data, error }>.
  // Étape 24 — utilisé par getPetitionSignatureCount.
  const rpc = vi.fn();
  return { selectChain, insertChain, deleteChain, rpc };
});

/** Rend le chain « thenable » : `await chain` renvoie {data,error}. */
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
    rpc: (...args: unknown[]) => mocks.rpc(...args),
  },
}));

import {
  createPetition,
  getPetition,
  getPetitionSignatureCount,
  hasUserSigned,
  listPetitions,
  PETITION_BODY_MIN,
  PETITION_SUMMARY_MIN,
  signPetition,
  slugify,
  unsignPetition,
  validatePetitionInput,
  type CreatePetitionInput,
  type PetitionRow,
} from '@/lib/petitions';
import { postgrestErrorMessage } from '@/lib/postgrestError';

const samplePetition: PetitionRow = {
  id: 'p1',
  author_id: 'u1',
  title: 'Sauvons la maternité',
  slug: 'sauvons-la-maternite',
  summary: 'a'.repeat(PETITION_SUMMARY_MIN),
  body: 'b'.repeat(PETITION_BODY_MIN),
  target_count: 5000,
  cover_url: null,
  category: 'Santé',
  status: 'published',
  signature_count: 120,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const validInput = (): CreatePetitionInput => ({
  authorId: 'u1',
  title: 'Sauvons la maternité de Cherbourg',
  summary: 'Une cause urgente et concrète pour les habitant·es du Cotentin et au-delà.',
  body: 'b'.repeat(PETITION_BODY_MIN),
  category: 'Santé',
  targetCount: 5000,
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

describe('slugify', () => {
  it('normalise titres accentués et ponctuation', () => {
    expect(slugify('Stop à la fermeture de la maternité de Cherbourg !')).toBe(
      'stop-a-la-fermeture-de-la-maternite-de-cherbourg',
    );
  });

  it('réduit les espaces multiples et trim les tirets', () => {
    expect(slugify('---HELLO---  WORLD  ---')).toBe('hello-world');
  });

  it('gère majuscules et chiffres', () => {
    expect(slugify('Élections 2026')).toBe('elections-2026');
  });
});

describe('validatePetitionInput', () => {
  it('valide un input correct', () => {
    expect(validatePetitionInput(validInput())).toEqual([]);
  });

  it('refuse un titre trop court', () => {
    const issues = validatePetitionInput({ ...validInput(), title: 'court' });
    expect(issues.some((i) => i.field === 'title')).toBe(true);
  });

  it('refuse un résumé trop court', () => {
    const issues = validatePetitionInput({ ...validInput(), summary: 'court' });
    expect(issues.some((i) => i.field === 'summary')).toBe(true);
  });

  it('refuse un body sous le seuil', () => {
    const issues = validatePetitionInput({ ...validInput(), body: 'court' });
    expect(issues.some((i) => i.field === 'body')).toBe(true);
  });

  it('refuse une catégorie inconnue', () => {
    const issues = validatePetitionInput({ ...validInput(), category: 'Inconnue' });
    expect(issues.some((i) => i.field === 'category')).toBe(true);
  });
});

describe('listPetitions', () => {
  it('renvoie la liste publique triée par signature_count', async () => {
    const rows = [samplePetition, { ...samplePetition, id: 'p2', signature_count: 80 }];
    resolveChain(mocks.selectChain, { data: rows, error: null });
    const { data, error } = await listPetitions();
    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('status', 'published');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('signature_count', { ascending: false });
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(50);
  });

  it('applique le filtre search via .or(title|summary ilike)', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listPetitions({ search: 'cherbourg' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'title.ilike.%cherbourg%,summary.ilike.%cherbourg%',
    );
  });

  it('échappe les méta-caractères ilike dans search', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listPetitions({ search: '50%' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith('title.ilike.%50\\%%,summary.ilike.%50\\%%');
  });

  it('mappe une erreur Postgrest en FR', async () => {
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
    const { error } = await listPetitions();
    expect(error).toMatchObject({ code: '42501' });
    expect(postgrestErrorMessage(error)).toBe(
      'Vous n’avez pas les droits pour effectuer cette action.',
    );
  });
});

describe('getPetition', () => {
  it('renvoie la pétition correspondant au slug', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: samplePetition, error: null });
    const { data, error } = await getPetition('sauvons-la-maternite');
    expect(error).toBeNull();
    expect(data?.id).toBe('p1');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('slug', 'sauvons-la-maternite');
  });

  it('renvoie data: null si introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data, error } = await getPetition('unknown');
    expect(error).toBeNull();
    expect(data).toBeNull();
  });
});

describe('createPetition', () => {
  it('refuse un input invalide sans appeler Supabase', async () => {
    const { data, error } = await createPetition({ ...validInput(), title: 'court' });
    expect(data).toBeNull();
    expect(error?.code).toBe('PETITION_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère une ligne avec slug stable depuis le titre', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: samplePetition, error: null });
    const input = validInput();
    const { data, error } = await createPetition(input);
    expect(error).toBeNull();
    expect(data?.id).toBe('p1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        author_id: 'u1',
        category: 'Santé',
        target_count: 5000,
        status: 'published',
        slug: 'sauvons-la-maternite-de-cherbourg',
      }),
    );
  });

  it('retente avec un suffixe en cas de collision (23505)', async () => {
    mocks.insertChain.maybeSingle
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'dup', details: '', hint: '', code: '23505', name: 'PostgrestError' },
      })
      .mockResolvedValueOnce({
        data: { ...samplePetition, slug: 'sauvons-la-maternite-de-cherbourg-2' },
        error: null,
      });
    const { data, error } = await createPetition(validInput());
    expect(error).toBeNull();
    expect(data?.slug).toBe('sauvons-la-maternite-de-cherbourg-2');
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
    const { data, error } = await createPetition(validInput());
    expect(data).toBeNull();
    expect(error?.code).toBe('42501');
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(1);
  });
});

describe('signPetition', () => {
  it('insère une signature pour le user courant', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: { id: 's1', petition_id: 'p1', user_id: 'u1', created_at: '2026-05-01T00:00:00Z' },
      error: null,
    });
    const { data, error } = await signPetition('p1', 'u1');
    expect(error).toBeNull();
    expect(data?.id).toBe('s1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith({ petition_id: 'p1', user_id: 'u1' });
  });

  it('mappe le doublon (23505) — déjà signée', async () => {
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
    const { error } = await signPetition('p1', 'u1');
    expect(error?.code).toBe('23505');
    expect(postgrestErrorMessage(error)).toBe(
      'Cette valeur est déjà utilisée par un autre compte.',
    );
  });
});

describe('unsignPetition', () => {
  it('supprime la signature du user courant', async () => {
    resolveChain(mocks.deleteChain, { data: null, error: null });
    const { error } = await unsignPetition('p1', 'u1');
    expect(error).toBeNull();
    expect(mocks.deleteChain.eq).toHaveBeenNthCalledWith(1, 'petition_id', 'p1');
    expect(mocks.deleteChain.eq).toHaveBeenNthCalledWith(2, 'user_id', 'u1');
  });
});

describe('hasUserSigned', () => {
  it('renvoie true quand une ligne existe', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: { id: 's1' }, error: null });
    const { signed, error } = await hasUserSigned('p1', 'u1');
    expect(error).toBeNull();
    expect(signed).toBe(true);
  });

  it('renvoie false quand aucune ligne', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { signed } = await hasUserSigned('p1', 'u1');
    expect(signed).toBe(false);
  });
});

describe('getPetitionSignatureCount (M2-sec — RPC scalar)', () => {
  it('appelle la RPC signatures_count_for_petition avec p_petition', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: 42, error: null });
    const { count, error } = await getPetitionSignatureCount('p1');
    expect(error).toBeNull();
    expect(count).toBe(42);
    expect(mocks.rpc).toHaveBeenCalledWith('signatures_count_for_petition', { p_petition: 'p1' });
  });

  it('propage une erreur Postgrest sans masquer', async () => {
    const rpcError = { message: 'permission denied', code: '42501' };
    mocks.rpc.mockResolvedValueOnce({ data: null, error: rpcError });
    const { count, error } = await getPetitionSignatureCount('p2');
    expect(count).toBeNull();
    expect(error).toEqual(rpcError);
  });

  it('défaut à 0 si la RPC renvoie null sans erreur (best-effort)', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: null, error: null });
    const { count, error } = await getPetitionSignatureCount('p3');
    expect(error).toBeNull();
    expect(count).toBe(0);
  });

  it('défaut à 0 si la RPC renvoie une valeur non numérique (défensif)', async () => {
    // Bouclier : si PostgREST renvoie un body inattendu (string "42", NaN, etc.)
    // on borne à 0 plutôt que de propager une valeur invalide dans l'UI.
    mocks.rpc.mockResolvedValueOnce({ data: 'pas-un-nombre' as unknown as number, error: null });
    const { count } = await getPetitionSignatureCount('p4');
    expect(count).toBe(0);
  });
});
