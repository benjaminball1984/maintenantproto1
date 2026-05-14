import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database';

const mocks = vi.hoisted(() => {
  const updateChain = {
    update: vi.fn(),
    eq: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const selectChain = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const storage = {
    upload: vi.fn(),
    getPublicUrl: vi.fn(),
  };
  return { updateChain, selectChain, storage };
});

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((_table: string) => ({
      select: (...args: unknown[]) => {
        mocks.selectChain.select(...args);
        return mocks.selectChain;
      },
      update: (...args: unknown[]) => {
        mocks.updateChain.update(...args);
        return mocks.updateChain;
      },
    })),
    storage: {
      from: vi.fn((_bucket: string) => mocks.storage),
    },
  },
}));

import {
  AVATAR_MAX_BYTES,
  fetchProfileActivity,
  fetchProfileStats,
  getProfile,
  updateProfile,
  uploadAvatar,
} from '@/lib/profile';
import { postgrestErrorMessage } from '@/lib/postgrestError';

const sampleRow = {
  id: 'u1',
  email: 'me@x.org',
  display_name: 'Me',
  avatar_url: null,
  bio: null,
  city: null,
  postal_code: null,
  is_admin: false,
  t99cp_balance: 0,
  badges: [],
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
};

beforeEach(() => {
  vi.clearAllMocks();
  // chain getProfile : .from(...).select('*').eq('id', x).maybeSingle()
  mocks.selectChain.select.mockReturnValue(mocks.selectChain);
  mocks.selectChain.eq.mockReturnValue(mocks.selectChain);
  // chain updateProfile : .from(...).update(patch).eq('id', x).select('*').maybeSingle()
  mocks.updateChain.update.mockReturnValue(mocks.updateChain);
  mocks.updateChain.eq.mockReturnValue(mocks.updateChain);
  mocks.updateChain.select.mockReturnValue(mocks.updateChain);
});

describe('getProfile', () => {
  it('renvoie la ligne users quand elle existe', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sampleRow, error: null });
    const { data, error } = await getProfile('u1');
    expect(error).toBeNull();
    expect(data?.email).toBe('me@x.org');
    expect(mocks.selectChain.select).toHaveBeenCalledWith('*');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('id', 'u1');
  });

  it("renvoie data: null sans erreur quand la ligne n'existe pas encore", async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data, error } = await getProfile('missing');
    expect(data).toBeNull();
    expect(error).toBeNull();
  });
});

describe('updateProfile', () => {
  it('applique le patch et renvoie la ligne mise à jour', async () => {
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({
      data: { ...sampleRow, display_name: 'New' },
      error: null,
    });
    const { data, error } = await updateProfile('u1', { display_name: 'New' });
    expect(error).toBeNull();
    expect(data?.display_name).toBe('New');
    expect(mocks.updateChain.update).toHaveBeenCalledWith({ display_name: 'New' });
    expect(mocks.updateChain.eq).toHaveBeenCalledWith('id', 'u1');
  });

  it('remonte l’erreur RLS (42501) et le mapper la traduit en FR', async () => {
    const pgError = {
      message: 'permission denied',
      details: '',
      hint: '',
      code: '42501',
      name: 'PostgrestError',
    };
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({ data: null, error: pgError });
    const { error } = await updateProfile('u1', { display_name: 'X' });
    expect(error?.code).toBe('42501');
    expect(postgrestErrorMessage(error)).toBe(
      'Vous n’avez pas les droits pour effectuer cette action.',
    );
  });

  it('remonte l’erreur unique violation (23505) traduite', async () => {
    const pgError = {
      message: 'duplicate key',
      details: '',
      hint: '',
      code: '23505',
      name: 'PostgrestError',
    };
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({ data: null, error: pgError });
    const { error } = await updateProfile('u1', { display_name: 'X' });
    expect(postgrestErrorMessage(error)).toBe(
      'Cette valeur est déjà utilisée par un autre compte.',
    );
  });
});

function makeFile(name: string, type: string, sizeBytes: number): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], name, { type });
}

describe('uploadAvatar', () => {
  it('rejette les types MIME non autorisés', async () => {
    const file = makeFile('avatar.pdf', 'application/pdf', 1024);
    const { data, error } = await uploadAvatar('u1', file);
    expect(data).toBeNull();
    expect(error?.code).toBe('AVATAR_INVALID_TYPE');
    expect(postgrestErrorMessage(error)).toMatch(/Format invalide/);
  });

  it('rejette les fichiers > 2 Mo', async () => {
    const file = makeFile('big.jpg', 'image/jpeg', AVATAR_MAX_BYTES + 1);
    const { data, error } = await uploadAvatar('u1', file);
    expect(data).toBeNull();
    expect(error?.code).toBe('AVATAR_TOO_LARGE');
    expect(postgrestErrorMessage(error)).toMatch(/2 Mo/);
  });

  it('upload réussi : path sous <user_id>/ et publicUrl renvoyé', async () => {
    mocks.storage.upload.mockResolvedValueOnce({ data: { path: 'u1/x.jpg' }, error: null });
    mocks.storage.getPublicUrl.mockReturnValueOnce({
      data: { publicUrl: 'https://cdn/u1/x.jpg' },
    });
    const file = makeFile('me.jpg', 'image/jpeg', 1024);
    const { data, error } = await uploadAvatar('u1', file);
    expect(error).toBeNull();
    expect(data?.publicUrl).toBe('https://cdn/u1/x.jpg');
    expect(data?.path.startsWith('u1/avatar-')).toBe(true);
    expect(mocks.storage.upload).toHaveBeenCalledTimes(1);
  });

  it("remonte l'erreur du Storage en PostgrestError mappable", async () => {
    mocks.storage.upload.mockResolvedValueOnce({
      data: null,
      error: { name: 'StorageError', message: 'denied' },
    });
    const file = makeFile('me.png', 'image/png', 1024);
    const { data, error } = await uploadAvatar('u1', file);
    expect(data).toBeNull();
    expect(error?.code).toBe('42501');
    expect(postgrestErrorMessage(error)).toBe(
      'Vous n’avez pas les droits pour effectuer cette action.',
    );
  });
});

// =====================================================================================
// Tests pour `fetchProfileStats` et `fetchProfileActivity` (étape 37).
//
// On stubbe directement la chaîne fluide PostgREST par table — pattern
// identique à `transparency.test.ts` (`buildClient`). Chaque appel `.from(t)`
// renvoie sa propre chain (state isolé), pour que les 4 queries parallèles
// ne se polluent pas.
// =====================================================================================

interface CountStubResult {
  count: number | null;
  error: { message: string } | null;
}

interface ListStubResult {
  data: unknown[] | null;
  error: { message: string } | null;
}

interface FromStubConfig {
  count?: CountStubResult;
  list?: ListStubResult;
}

function buildProfileClient(
  perTable: Record<string, FromStubConfig>,
): SupabaseClient<Database> {
  const fromMock = vi.fn((table: string) => {
    const cfg = perTable[table] ?? {};
    // Branche "count" : .select(_, { count, head: true }).eq(col, val) thenable.
    // Branche "list"  : .select(...).eq(...).order(...).limit(...) thenable.
    interface Chain {
      select: (..._args: unknown[]) => Chain;
      eq: (..._args: unknown[]) => Chain;
      order: (..._args: unknown[]) => Chain;
      limit: (..._args: unknown[]) => Chain;
      then: (
        onFulfilled: (v: CountStubResult | ListStubResult) => unknown,
      ) => Promise<unknown>;
    }
    let mode: 'count' | 'list' = 'list';
    const chain: Chain = {
      select: (_cols: unknown, opts?: unknown) => {
        if (
          opts &&
          typeof opts === 'object' &&
          (opts as { head?: boolean }).head === true
        ) {
          mode = 'count';
        }
        return chain;
      },
      eq: (..._args: unknown[]) => chain,
      order: (..._args: unknown[]) => chain,
      limit: (..._args: unknown[]) => chain,
      then: (onFulfilled) => {
        const value =
          mode === 'count'
            ? cfg.count ?? { count: 0, error: null }
            : cfg.list ?? { data: [], error: null };
        return Promise.resolve(onFulfilled(value));
      },
    };
    return chain;
  });
  return { from: fromMock } as unknown as SupabaseClient<Database>;
}

describe('fetchProfileStats', () => {
  it('retourne les 4 compteurs (signatures, participations, votes, posts)', async () => {
    const client = buildProfileClient({
      signatures: { count: { count: 3, error: null } },
      participations: { count: { count: 2, error: null } },
      votes: { count: { count: 5, error: null } },
      posts: { count: { count: 1, error: null } },
    });
    const { data, error } = await fetchProfileStats('u1', client);
    expect(error).toBeNull();
    expect(data).toEqual({
      signatures: 3,
      participations: 2,
      votes: 5,
      posts: 1,
    });
  });

  it('normalise count: null → 0 (RLS sans accès)', async () => {
    const client = buildProfileClient({
      signatures: { count: { count: null, error: null } },
      participations: { count: { count: null, error: null } },
      votes: { count: { count: null, error: null } },
      posts: { count: { count: null, error: null } },
    });
    const { data, error } = await fetchProfileStats('u1', client);
    expect(error).toBeNull();
    expect(data).toEqual({
      signatures: 0,
      participations: 0,
      votes: 0,
      posts: 0,
    });
  });

  it('propage la première erreur rencontrée', async () => {
    const client = buildProfileClient({
      signatures: { count: { count: null, error: { message: 'rls_denied' } } },
      participations: { count: { count: 1, error: null } },
      votes: { count: { count: 1, error: null } },
      posts: { count: { count: 1, error: null } },
    });
    const { data, error } = await fetchProfileStats('u1', client);
    expect(data).toBeNull();
    expect(error?.message).toBe('rls_denied');
  });
});

describe('fetchProfileActivity', () => {
  it('merge et trie les 4 sources par created_at desc, limite à `limit`', async () => {
    const client = buildProfileClient({
      signatures: {
        list: {
          data: [
            {
              id: 's1',
              created_at: '2026-05-10T08:00:00Z',
              petitions: { title: 'Pétition A', slug: 'petition-a' },
            },
          ],
          error: null,
        },
      },
      participations: {
        list: {
          data: [
            {
              id: 'p1',
              created_at: '2026-05-12T10:00:00Z',
              mobilizations: { title: 'Mobilisation B', slug: 'mobilisation-b' },
            },
          ],
          error: null,
        },
      },
      votes: {
        list: {
          data: [
            {
              id: 'v1',
              created_at: '2026-05-09T09:00:00Z',
              polls: { question: 'Sondage C ?', slug: 'sondage-c' },
            },
          ],
          error: null,
        },
      },
      posts: {
        list: {
          data: [
            {
              id: 'po1',
              created_at: '2026-05-11T11:00:00Z',
              body: 'Mon premier post du mouvement',
            },
          ],
          error: null,
        },
      },
    });
    const { data, error } = await fetchProfileActivity('u1', 10, client);
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    // Ordre attendu : participation (12) > post (11) > signature (10) > vote (09).
    expect(data?.map((it) => it.kind)).toEqual([
      'participation',
      'post',
      'signature',
      'vote',
    ]);
    expect(data?.[0]?.label).toBe('Mobilisation B');
    expect(data?.[0]?.slug).toBe('mobilisation-b');
    expect(data?.[2]?.label).toBe('Pétition A');
  });

  it('limite à `limit` items après merge (5 sur 8 sources)', async () => {
    const sigRows = Array.from({ length: 4 }, (_, i) => ({
      id: `s${i}`,
      created_at: `2026-05-0${i + 1}T08:00:00Z`,
      petitions: { title: `P${i}`, slug: `p${i}` },
    }));
    const postRows = Array.from({ length: 4 }, (_, i) => ({
      id: `po${i}`,
      created_at: `2026-05-1${i}T08:00:00Z`,
      body: `Body ${i}`,
    }));
    const client = buildProfileClient({
      signatures: { list: { data: sigRows, error: null } },
      participations: { list: { data: [], error: null } },
      votes: { list: { data: [], error: null } },
      posts: { list: { data: postRows, error: null } },
    });
    const { data } = await fetchProfileActivity('u1', 5, client);
    expect(data?.length).toBe(5);
  });

  it('propage l\'erreur si une des 4 queries échoue', async () => {
    const client = buildProfileClient({
      signatures: {
        list: { data: null, error: { message: 'rls_denied' } },
      },
      participations: { list: { data: [], error: null } },
      votes: { list: { data: [], error: null } },
      posts: { list: { data: [], error: null } },
    });
    const { data, error } = await fetchProfileActivity('u1', 10, client);
    expect(data).toBeNull();
    expect(error?.message).toBe('rls_denied');
  });

  it('gère les embeds en forme tableau (FK 1-to-N PostgREST)', async () => {
    const client = buildProfileClient({
      signatures: {
        list: {
          data: [
            {
              id: 's1',
              created_at: '2026-05-10T08:00:00Z',
              // Forme tableau (FK indirect, ex. select non typé)
              petitions: [{ title: 'Pétition X', slug: 'petition-x' }],
            },
          ],
          error: null,
        },
      },
      participations: { list: { data: [], error: null } },
      votes: { list: { data: [], error: null } },
      posts: { list: { data: [], error: null } },
    });
    const { data } = await fetchProfileActivity('u1', 10, client);
    expect(data?.[0]?.label).toBe('Pétition X');
    expect(data?.[0]?.slug).toBe('petition-x');
  });

  it('tronque les bodies de post longs avec ellipse', async () => {
    const longBody = 'a'.repeat(200);
    const client = buildProfileClient({
      signatures: { list: { data: [], error: null } },
      participations: { list: { data: [], error: null } },
      votes: { list: { data: [], error: null } },
      posts: {
        list: {
          data: [
            { id: 'po1', created_at: '2026-05-10T08:00:00Z', body: longBody },
          ],
          error: null,
        },
      },
    });
    const { data } = await fetchProfileActivity('u1', 10, client);
    expect(data?.[0]?.kind).toBe('post');
    expect(data?.[0]?.label.length).toBeLessThan(longBody.length);
    expect(data?.[0]?.label.endsWith('…')).toBe(true);
  });
});
