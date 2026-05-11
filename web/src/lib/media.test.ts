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
  ARTICLE_BODY_MIN,
  ARTICLE_SUMMARY_MIN,
  ARTICLE_TITLE_MIN,
  COMMENT_BODY_MAX,
  createArticle,
  createComment,
  getArticleBySlug,
  listArticles,
  listComments,
  listReactions,
  react,
  unreact,
  validateArticleInput,
  validateCommentInput,
  type ArticleRow,
  type CommentRow,
  type CreateArticleInput,
  type CreateCommentInput,
  type ReactionRow,
} from '@/lib/media';

const sampleArticle: ArticleRow = {
  id: 'a1',
  author_id: 'u1',
  title: 'Mobilisation pour la justice fiscale',
  slug: 'mobilisation-pour-la-justice-fiscale',
  summary:
    'Tour d’horizon des actions citoyennes contre l’évasion fiscale et pour la transparence.',
  body: 'a'.repeat(ARTICLE_BODY_MIN + 10),
  cover_url: null,
  format: 'article',
  status: 'published',
  published_at: '2026-05-01T00:00:00Z',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const sampleComment: CommentRow = {
  id: 'c1',
  article_id: 'a1',
  author_id: 'u2',
  body: 'Excellent article !',
  is_flagged: false,
  created_at: '2026-05-02T00:00:00Z',
  updated_at: '2026-05-02T00:00:00Z',
};

const sampleReaction: ReactionRow = {
  id: 'r1',
  article_id: 'a1',
  user_id: 'u2',
  kind: 'support',
  created_at: '2026-05-02T00:00:00Z',
};

const validArticle = (): CreateArticleInput => ({
  authorId: 'u1',
  title: 'Mobilisation pour la justice fiscale',
  summary:
    'Tour d’horizon des actions citoyennes contre l’évasion fiscale et pour la transparence.',
  body: 'a'.repeat(ARTICLE_BODY_MIN + 10),
  format: 'article',
});

const validComment = (): CreateCommentInput => ({
  articleId: 'a1',
  authorId: 'u2',
  body: 'Excellent article !',
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

describe('validateArticleInput', () => {
  it('valide un input correct', () => {
    expect(validateArticleInput(validArticle())).toEqual([]);
  });

  it('refuse un titre trop court', () => {
    const issues = validateArticleInput({
      ...validArticle(),
      title: 'x'.repeat(ARTICLE_TITLE_MIN - 1),
    });
    expect(issues.some((i) => i.field === 'title')).toBe(true);
  });

  it('refuse un résumé trop court', () => {
    const issues = validateArticleInput({
      ...validArticle(),
      summary: 'x'.repeat(ARTICLE_SUMMARY_MIN - 1),
    });
    expect(issues.some((i) => i.field === 'summary')).toBe(true);
  });

  it('refuse un body trop court', () => {
    const issues = validateArticleInput({
      ...validArticle(),
      body: 'x'.repeat(ARTICLE_BODY_MIN - 1),
    });
    expect(issues.some((i) => i.field === 'body')).toBe(true);
  });

  it('refuse un format invalide', () => {
    const issues = validateArticleInput({
      ...validArticle(),
      // @ts-expect-error test invalid format
      format: 'tweet',
    });
    expect(issues.some((i) => i.field === 'format')).toBe(true);
  });
});

describe('validateCommentInput', () => {
  it('valide un commentaire correct', () => {
    expect(validateCommentInput(validComment())).toEqual([]);
  });

  it('refuse un commentaire vide', () => {
    const issues = validateCommentInput({ ...validComment(), body: '  ' });
    expect(issues.some((i) => i.field === 'body')).toBe(true);
  });

  it('refuse un commentaire trop long', () => {
    const issues = validateCommentInput({
      ...validComment(),
      body: 'a'.repeat(COMMENT_BODY_MAX + 1),
    });
    expect(issues.some((i) => i.field === 'body')).toBe(true);
  });
});

describe('listArticles', () => {
  it('renvoie les articles publiés, tri published_at DESC NULLS LAST', async () => {
    resolveChain(mocks.selectChain, { data: [sampleArticle], error: null });
    const { data, error } = await listArticles();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('status', 'published');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('published_at', {
      ascending: false,
      nullsFirst: false,
    });
  });

  it('applique le filtre format', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listArticles({ format: 'enquete' });
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('format', 'enquete');
  });

  it('échappe les méta-caractères du search', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listArticles({ search: '50%_,' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'title.ilike.%50\\%\\_\\,%,summary.ilike.%50\\%\\_\\,%,body.ilike.%50\\%\\_\\,%',
    );
  });
});

describe('getArticleBySlug', () => {
  it('renvoie l’article par slug', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sampleArticle, error: null });
    const { data } = await getArticleBySlug(sampleArticle.slug);
    expect(data?.id).toBe('a1');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('slug', sampleArticle.slug);
  });

  it('renvoie null si introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data } = await getArticleBySlug('?');
    expect(data).toBeNull();
  });
});

describe('createArticle', () => {
  it('refuse un input invalide', async () => {
    const { error } = await createArticle({ ...validArticle(), title: 'x' });
    expect(error?.code).toBe('ARTICLE_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère un article avec slug dérivé', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sampleArticle, error: null });
    const { data, error } = await createArticle(validArticle());
    expect(error).toBeNull();
    expect(data?.id).toBe('a1');
    const insertArg = mocks.insertChain.insert.mock.calls[0]?.[0] as { slug: string };
    expect(insertArg.slug).toBe('mobilisation-pour-la-justice-fiscale');
  });

  it('retente avec un suffixe sur collision 23505', async () => {
    mocks.insertChain.maybeSingle
      .mockResolvedValueOnce({ data: null, error: { code: '23505' } })
      .mockResolvedValueOnce({ data: sampleArticle, error: null });
    const { data, error } = await createArticle(validArticle());
    expect(error).toBeNull();
    expect(data?.id).toBe('a1');
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(2);
    const second = mocks.insertChain.insert.mock.calls[1]?.[0] as { slug: string };
    expect(second.slug).toBe('mobilisation-pour-la-justice-fiscale-2');
  });
});

describe('listComments', () => {
  it('renvoie les commentaires non flaggés ordre ASC', async () => {
    resolveChain(mocks.selectChain, { data: [sampleComment], error: null });
    const { data, error } = await listComments('a1');
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('article_id', 'a1');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('is_flagged', false);
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: true });
  });
});

describe('createComment', () => {
  it('refuse un commentaire vide', async () => {
    const { error } = await createComment({ ...validComment(), body: '' });
    expect(error?.code).toBe('COMMENT_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère un commentaire valide', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sampleComment, error: null });
    const { data, error } = await createComment(validComment());
    expect(error).toBeNull();
    expect(data?.id).toBe('c1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith({
      article_id: 'a1',
      author_id: 'u2',
      body: 'Excellent article !',
    });
  });
});

describe('listReactions', () => {
  it('renvoie les réactions de l’article', async () => {
    resolveChain(mocks.selectChain, { data: [sampleReaction], error: null });
    const { data, error } = await listReactions('a1');
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('article_id', 'a1');
  });
});

describe('react', () => {
  it('refuse un kind invalide', async () => {
    // @ts-expect-error test invalid kind
    const { error } = await react('a1', 'u2', 'meh');
    expect(error?.code).toBe('REACTION_KIND');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère une réaction valide', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sampleReaction, error: null });
    const { data, error } = await react('a1', 'u2', 'support');
    expect(error).toBeNull();
    expect(data?.id).toBe('r1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith({
      article_id: 'a1',
      user_id: 'u2',
      kind: 'support',
    });
  });
});

describe('unreact', () => {
  it('supprime la réaction ciblée', async () => {
    resolveChain(mocks.deleteChain, { data: null, error: null });
    const { error } = await unreact('a1', 'u2', 'support');
    expect(error).toBeNull();
    expect(mocks.deleteChain.eq).toHaveBeenCalledWith('article_id', 'a1');
    expect(mocks.deleteChain.eq).toHaveBeenCalledWith('user_id', 'u2');
    expect(mocks.deleteChain.eq).toHaveBeenCalledWith('kind', 'support');
  });

  it('propage l’erreur RLS', async () => {
    resolveChain(mocks.deleteChain, {
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { error } = await unreact('a1', 'u2', 'like');
    expect(error?.code).toBe('42501');
  });
});

describe('createArticle (slug collision)', () => {
  it('abandonne après 5 tentatives de slug', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'unique' },
    });
    const { data, error } = await createArticle(validArticle());
    expect(data).toBeNull();
    expect(error?.code).toBe('ARTICLE_SLUG_COLLISION');
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(5);
  });

  it('propage les autres erreurs sans retry', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { error } = await createArticle(validArticle());
    expect(error?.code).toBe('42501');
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(1);
  });
});

describe('listArticles (edge cases)', () => {
  it('utilise la limite par défaut à 50', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listArticles();
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(50);
  });

  it('renvoie data: [] si Supabase renvoie null', async () => {
    resolveChain(mocks.selectChain, { data: null, error: null });
    const { data } = await listArticles();
    expect(data).toEqual([]);
  });
});
