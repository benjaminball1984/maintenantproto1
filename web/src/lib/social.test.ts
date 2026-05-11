import { describe, it, expect, beforeEach, vi } from 'vitest';

interface QueryResult<T> {
  data: T;
  error: unknown;
}

const mocks = vi.hoisted(() => {
  const selectChain = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
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
  POST_BODY_MAX,
  POST_MEDIA_MAX,
  createPost,
  followUser,
  getPost,
  listFollowers,
  listFollowing,
  listPosts,
  unfollowUser,
  validatePostInput,
  type CreatePostInput,
  type FollowRow,
  type PostRow,
} from '@/lib/social';

const samplePost: PostRow = {
  id: 'p1',
  author_id: 'u1',
  body: 'On y va !',
  media_urls: [],
  visibility: 'public',
  is_flagged: false,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const sampleFollow: FollowRow = {
  id: 'f1',
  follower_id: 'u1',
  followee_id: 'u2',
  created_at: '2026-05-01T00:00:00Z',
};

const validInput = (): CreatePostInput => ({
  authorId: 'u1',
  body: 'On y va !',
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.selectChain.select.mockReturnValue(mocks.selectChain);
  mocks.selectChain.eq.mockReturnValue(mocks.selectChain);
  mocks.selectChain.in.mockReturnValue(mocks.selectChain);
  mocks.selectChain.ilike.mockReturnValue(mocks.selectChain);
  mocks.selectChain.order.mockReturnValue(mocks.selectChain);
  mocks.selectChain.limit.mockReturnValue(mocks.selectChain);

  mocks.insertChain.insert.mockReturnValue(mocks.insertChain);
  mocks.insertChain.select.mockReturnValue(mocks.insertChain);

  mocks.deleteChain.delete.mockReturnValue(mocks.deleteChain);
  mocks.deleteChain.eq.mockReturnValue(mocks.deleteChain);
});

describe('validatePostInput', () => {
  it('valide un input correct', () => {
    expect(validatePostInput(validInput())).toEqual([]);
  });

  it('refuse un body vide', () => {
    const issues = validatePostInput({ ...validInput(), body: '   ' });
    expect(issues.some((i) => i.field === 'body')).toBe(true);
  });

  it('refuse un body trop long', () => {
    const issues = validatePostInput({ ...validInput(), body: 'a'.repeat(POST_BODY_MAX + 1) });
    expect(issues.some((i) => i.field === 'body')).toBe(true);
  });

  it('refuse plus de N médias', () => {
    const issues = validatePostInput({
      ...validInput(),
      mediaUrls: Array.from({ length: POST_MEDIA_MAX + 1 }, (_, i) => `https://x/${i}`),
    });
    expect(issues.some((i) => i.field === 'mediaUrls')).toBe(true);
  });

  it('refuse une visibilité invalide', () => {
    const issues = validatePostInput({
      ...validInput(),
      // @ts-expect-error test invalid value
      visibility: 'world',
    });
    expect(issues.some((i) => i.field === 'visibility')).toBe(true);
  });
});

describe('listPosts', () => {
  it('renvoie les posts non flaggés triés DESC', async () => {
    resolveChain(mocks.selectChain, { data: [samplePost], error: null });
    const { data, error } = await listPosts();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('is_flagged', false);
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('applique le filtre authorIds via in()', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listPosts({ authorIds: ['u1', 'u2'] });
    expect(mocks.selectChain.in).toHaveBeenCalledWith('author_id', ['u1', 'u2']);
  });

  it('renvoie [] sans interroger Supabase si authorIds est vide', async () => {
    const { data, error } = await listPosts({ authorIds: [] });
    expect(error).toBeNull();
    expect(data).toEqual([]);
    expect(mocks.selectChain.select).not.toHaveBeenCalled();
  });

  it('applique le filtre visibility', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listPosts({ visibility: 'members' });
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('visibility', 'members');
  });

  it('échappe les méta-caractères dans search', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listPosts({ search: '50%_,' });
    expect(mocks.selectChain.ilike).toHaveBeenCalledWith('body', '%50\\%\\_\\,%');
  });
});

describe('getPost', () => {
  it('renvoie le post par ID', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: samplePost, error: null });
    const { data } = await getPost('p1');
    expect(data?.id).toBe('p1');
  });

  it('renvoie null si introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data } = await getPost('?');
    expect(data).toBeNull();
  });
});

describe('createPost', () => {
  it('refuse un input invalide', async () => {
    const { error } = await createPost({ ...validInput(), body: '' });
    expect(error?.code).toBe('POST_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère un post valide', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: samplePost, error: null });
    const { data, error } = await createPost(validInput());
    expect(error).toBeNull();
    expect(data?.id).toBe('p1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        author_id: 'u1',
        body: 'On y va !',
        visibility: 'public',
        media_urls: [],
      }),
    );
  });

  it('utilise la visibilité fournie', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: samplePost, error: null });
    await createPost({ ...validInput(), visibility: 'members' });
    expect(mocks.insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ visibility: 'members' }),
    );
  });
});

describe('followUser', () => {
  it('refuse l’auto-follow côté front', async () => {
    const { error } = await followUser('u1', 'u1');
    expect(error?.code).toBe('FOLLOW_SELF');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('crée le lien follower -> followee', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sampleFollow, error: null });
    const { data, error } = await followUser('u1', 'u2');
    expect(error).toBeNull();
    expect(data?.id).toBe('f1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith({
      follower_id: 'u1',
      followee_id: 'u2',
    });
  });
});

describe('unfollowUser', () => {
  it('supprime le lien follower -> followee', async () => {
    resolveChain(mocks.deleteChain, { data: null, error: null });
    const { error } = await unfollowUser('u1', 'u2');
    expect(error).toBeNull();
    expect(mocks.deleteChain.eq).toHaveBeenCalledWith('follower_id', 'u1');
    expect(mocks.deleteChain.eq).toHaveBeenCalledWith('followee_id', 'u2');
  });
});

describe('listFollowing / listFollowers', () => {
  it('liste les abonnements de followerId', async () => {
    resolveChain(mocks.selectChain, { data: [sampleFollow], error: null });
    const { data } = await listFollowing('u1');
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('follower_id', 'u1');
  });

  it('liste les abonnés de followeeId', async () => {
    resolveChain(mocks.selectChain, { data: [sampleFollow], error: null });
    const { data } = await listFollowers('u2');
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('followee_id', 'u2');
  });

  it('renvoie data: [] si liste vide null', async () => {
    resolveChain(mocks.selectChain, { data: null, error: null });
    const { data } = await listFollowing('u1');
    expect(data).toEqual([]);
  });

  it('renvoie l’erreur si Supabase renvoie une erreur', async () => {
    resolveChain(mocks.selectChain, {
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { data, error } = await listFollowers('u1');
    expect(data).toEqual([]);
    expect(error?.code).toBe('42501');
  });
});

describe('listPosts (edge cases)', () => {
  it('utilise la limite par défaut à 50', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listPosts();
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(50);
  });

  it('respecte la limite explicite', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listPosts({ limit: 10 });
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(10);
  });

  it('renvoie data: [] si Supabase renvoie data null', async () => {
    resolveChain(mocks.selectChain, { data: null, error: null });
    const { data } = await listPosts();
    expect(data).toEqual([]);
  });
});
