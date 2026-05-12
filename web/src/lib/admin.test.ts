import { describe, it, expect, beforeEach, vi } from 'vitest';

interface QueryResult<T> {
  data: T;
  error: unknown;
}

const mocks = vi.hoisted(() => {
  const selectChain = {
    select: vi.fn(),
    eq: vi.fn(),
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
    then: vi.fn(),
  };
  const deleteChain = {
    delete: vi.fn(),
    eq: vi.fn(),
    then: vi.fn(),
  };
  const rpc = vi.fn();
  const from = vi.fn();
  return { selectChain, insertChain, updateChain, deleteChain, rpc, from };
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
    from: (...args: unknown[]) => mocks.from(...args),
    rpc: (...args: unknown[]) => mocks.rpc(...args),
  },
}));

import {
  EMAIL_BODY_MIN,
  EMAIL_SUBJECT_MIN,
  checkIsAdmin,
  createEmailCampaign,
  deleteFlaggedItem,
  listAdminLogs,
  listEmailCampaigns,
  listFlaggedArticles,
  listFlaggedComments,
  listFlaggedPostComments,
  listFlaggedPosts,
  logAdminAction,
  unflagItem,
  updateEmailCampaignStatus,
  validateEmailCampaignInput,
  type CreateEmailCampaignInput,
} from '@/lib/admin';

const validCampaign = (): CreateEmailCampaignInput => ({
  authorId: 'u1',
  subject: 'Newsletter mensuelle',
  bodyHtml: '<p>Bonjour, voici les actualités du mois pour la communauté Maintenant.</p>',
  audience: 'members',
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.from.mockImplementation((_table: string) => ({
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
  }));
  mocks.selectChain.select.mockReturnValue(mocks.selectChain);
  mocks.selectChain.eq.mockReturnValue(mocks.selectChain);
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

describe('checkIsAdmin', () => {
  it('renvoie false sans uid', async () => {
    expect(await checkIsAdmin(undefined)).toBe(false);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('renvoie true si la RPC répond true', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: true, error: null });
    expect(await checkIsAdmin('u1')).toBe(true);
    expect(mocks.rpc).toHaveBeenCalledWith('is_admin', { uid: 'u1' });
  });

  it('renvoie false si la RPC répond false', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: false, error: null });
    expect(await checkIsAdmin('u1')).toBe(false);
  });

  it('renvoie false en cas d’erreur RPC (mode strict)', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: null, error: { code: '42501' } });
    expect(await checkIsAdmin('u1')).toBe(false);
  });
});

describe('validateEmailCampaignInput', () => {
  it('valide un input correct', () => {
    expect(validateEmailCampaignInput(validCampaign())).toEqual([]);
  });

  it('refuse un sujet trop court', () => {
    const issues = validateEmailCampaignInput({
      ...validCampaign(),
      subject: 'x'.repeat(EMAIL_SUBJECT_MIN - 1),
    });
    expect(issues.some((i) => i.field === 'subject')).toBe(true);
  });

  it('refuse un body trop court', () => {
    const issues = validateEmailCampaignInput({
      ...validCampaign(),
      bodyHtml: 'x'.repeat(EMAIL_BODY_MIN - 1),
    });
    expect(issues.some((i) => i.field === 'bodyHtml')).toBe(true);
  });

  it('refuse une audience vide', () => {
    const issues = validateEmailCampaignInput({ ...validCampaign(), audience: '  ' });
    expect(issues.some((i) => i.field === 'audience')).toBe(true);
  });

  it('refuse un statut invalide', () => {
    const issues = validateEmailCampaignInput({
      ...validCampaign(),
      // @ts-expect-error test invalid status
      status: 'flying',
    });
    expect(issues.some((i) => i.field === 'status')).toBe(true);
  });
});

describe('listFlaggedArticles', () => {
  it('cible status=flagged, tri DESC', async () => {
    resolveChain(mocks.selectChain, {
      data: [
        {
          id: 'a1',
          author_id: 'u1',
          title: 'T',
          slug: 't',
          body: 'body',
          created_at: '2026-05-01T00:00:00Z',
        },
      ],
      error: null,
    });
    const { data, error } = await listFlaggedArticles();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data[0]?.kind).toBe('article');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('status', 'flagged');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('propage l’erreur PostgREST', async () => {
    resolveChain(mocks.selectChain, {
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { data, error } = await listFlaggedArticles();
    expect(data).toEqual([]);
    expect(error?.code).toBe('42501');
  });
});

describe('listFlaggedPosts', () => {
  it('cible is_flagged=true', async () => {
    resolveChain(mocks.selectChain, {
      data: [{ id: 'p1', author_id: 'u2', body: 'b', created_at: 'c' }],
      error: null,
    });
    const { data } = await listFlaggedPosts();
    expect(data[0]?.kind).toBe('post');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('is_flagged', true);
  });
});

describe('listFlaggedPostComments', () => {
  it('cible post_comments avec post_id', async () => {
    resolveChain(mocks.selectChain, {
      data: [{ id: 'pc1', post_id: 'p1', author_id: 'u2', body: 'b', created_at: 'c' }],
      error: null,
    });
    const { data } = await listFlaggedPostComments();
    expect(data[0]?.kind).toBe('post_comment');
    expect(data[0]?.postId).toBe('p1');
    expect(mocks.from).toHaveBeenCalledWith('post_comments');
  });
});

describe('listFlaggedComments', () => {
  it('cible comments avec article_id', async () => {
    resolveChain(mocks.selectChain, {
      data: [{ id: 'c1', article_id: 'a1', author_id: 'u2', body: 'b', created_at: 'c' }],
      error: null,
    });
    const { data } = await listFlaggedComments();
    expect(data[0]?.kind).toBe('comment');
    expect(data[0]?.articleId).toBe('a1');
  });
});

describe('unflagItem', () => {
  it('repasse les articles en status=published', async () => {
    resolveChain(mocks.updateChain, { data: null, error: null });
    const { error } = await unflagItem('article', 'a1');
    expect(error).toBeNull();
    expect(mocks.from).toHaveBeenCalledWith('articles');
    expect(mocks.updateChain.update).toHaveBeenCalledWith({ status: 'published' });
    expect(mocks.updateChain.eq).toHaveBeenCalledWith('id', 'a1');
  });

  it('flip is_flagged=false sur posts', async () => {
    resolveChain(mocks.updateChain, { data: null, error: null });
    await unflagItem('post', 'p1');
    expect(mocks.from).toHaveBeenCalledWith('posts');
    expect(mocks.updateChain.update).toHaveBeenCalledWith({ is_flagged: false });
  });

  it('flip is_flagged=false sur post_comments', async () => {
    resolveChain(mocks.updateChain, { data: null, error: null });
    await unflagItem('post_comment', 'pc1');
    expect(mocks.from).toHaveBeenCalledWith('post_comments');
  });

  it('flip is_flagged=false sur comments d’article', async () => {
    resolveChain(mocks.updateChain, { data: null, error: null });
    await unflagItem('comment', 'c1');
    expect(mocks.from).toHaveBeenCalledWith('comments');
  });
});

describe('deleteFlaggedItem', () => {
  it('supprime un article', async () => {
    resolveChain(mocks.deleteChain, { data: null, error: null });
    const { error } = await deleteFlaggedItem('article', 'a1');
    expect(error).toBeNull();
    expect(mocks.from).toHaveBeenCalledWith('articles');
    expect(mocks.deleteChain.eq).toHaveBeenCalledWith('id', 'a1');
  });

  it('supprime un post', async () => {
    resolveChain(mocks.deleteChain, { data: null, error: null });
    await deleteFlaggedItem('post', 'p1');
    expect(mocks.from).toHaveBeenCalledWith('posts');
  });
});

describe('logAdminAction', () => {
  it('insère une ligne dans admin_logs avec payload vide par défaut', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: { id: 'l1' },
      error: null,
    });
    const { error } = await logAdminAction({ actorId: 'u1', action: 'moderate.unflag' });
    expect(error).toBeNull();
    expect(mocks.from).toHaveBeenCalledWith('admin_logs');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith({
      actor_id: 'u1',
      action: 'moderate.unflag',
      target_table: null,
      target_id: null,
      payload: {},
    });
  });

  it('propage la cible et le payload', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: { id: 'l2' }, error: null });
    await logAdminAction({
      actorId: 'u1',
      action: 'commune.create',
      targetTable: 'communes',
      targetId: 'co1',
      payload: { name: 'Commune des Lilas' },
    });
    expect(mocks.insertChain.insert).toHaveBeenCalledWith({
      actor_id: 'u1',
      action: 'commune.create',
      target_table: 'communes',
      target_id: 'co1',
      payload: { name: 'Commune des Lilas' },
    });
  });
});

describe('listAdminLogs', () => {
  it('renvoie les logs triés DESC', async () => {
    resolveChain(mocks.selectChain, { data: [{ id: 'l1' }], error: null });
    const { data, error } = await listAdminLogs(10);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.from).toHaveBeenCalledWith('admin_logs');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(10);
  });
});

describe('listEmailCampaigns', () => {
  it('renvoie la liste triée DESC', async () => {
    resolveChain(mocks.selectChain, { data: [{ id: 'ec1' }], error: null });
    const { data, error } = await listEmailCampaigns();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.from).toHaveBeenCalledWith('email_campaigns');
  });
});

describe('createEmailCampaign', () => {
  it('refuse un input invalide', async () => {
    const { error } = await createEmailCampaign({ ...validCampaign(), subject: 'x' });
    expect(error?.code).toBe('EMAIL_CAMPAIGN_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère un draft par défaut', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: { id: 'ec1', status: 'draft' },
      error: null,
    });
    const { data, error } = await createEmailCampaign(validCampaign());
    expect(error).toBeNull();
    expect(data?.id).toBe('ec1');
    const insertArg = mocks.insertChain.insert.mock.calls[0]?.[0] as { status: string };
    expect(insertArg.status).toBe('draft');
  });
});

describe('updateEmailCampaignStatus', () => {
  it('refuse un statut invalide', async () => {
    // @ts-expect-error test invalid status
    const { error } = await updateEmailCampaignStatus('ec1', 'flying');
    expect(error?.code).toBe('EMAIL_CAMPAIGN_STATUS');
    expect(mocks.updateChain.update).not.toHaveBeenCalled();
  });

  it('met à jour le statut queued', async () => {
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({
      data: { id: 'ec1', status: 'queued' },
      error: null,
    });
    const { data, error } = await updateEmailCampaignStatus('ec1', 'queued');
    expect(error).toBeNull();
    expect(data?.status).toBe('queued');
    expect(mocks.updateChain.update).toHaveBeenCalledWith({ status: 'queued' });
  });

  it('renseigne sent_at lors du passage en sent', async () => {
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({
      data: { id: 'ec1', status: 'sent' },
      error: null,
    });
    await updateEmailCampaignStatus('ec1', 'sent');
    const updateArg = mocks.updateChain.update.mock.calls[0]?.[0] as {
      status: string;
      sent_at: string;
    };
    expect(updateArg.status).toBe('sent');
    expect(typeof updateArg.sent_at).toBe('string');
    expect(updateArg.sent_at.length).toBeGreaterThan(0);
  });

  it('ne renseigne pas sent_at pour les autres statuts', async () => {
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({
      data: { id: 'ec1', status: 'failed' },
      error: null,
    });
    await updateEmailCampaignStatus('ec1', 'failed');
    const updateArg = mocks.updateChain.update.mock.calls[0]?.[0] as {
      status: string;
      sent_at?: string;
    };
    expect(updateArg.status).toBe('failed');
    expect(updateArg.sent_at).toBeUndefined();
  });
});

describe('validateEmailCampaignInput (audience)', () => {
  it('refuse une audience trop longue', () => {
    const issues = validateEmailCampaignInput({
      ...validCampaign(),
      audience: 'a'.repeat(200),
    });
    expect(issues.some((i) => i.field === 'audience')).toBe(true);
  });
});

describe('listEmailCampaigns (erreurs)', () => {
  it('propage l’erreur RLS', async () => {
    resolveChain(mocks.selectChain, {
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { data, error } = await listEmailCampaigns();
    expect(data).toEqual([]);
    expect(error?.code).toBe('42501');
  });
});

describe('listAdminLogs (erreurs)', () => {
  it('propage l’erreur RLS', async () => {
    resolveChain(mocks.selectChain, {
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { data, error } = await listAdminLogs();
    expect(data).toEqual([]);
    expect(error?.code).toBe('42501');
  });
});

describe('unflagItem (erreurs)', () => {
  it('propage l’erreur RLS sur articles', async () => {
    resolveChain(mocks.updateChain, {
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { error } = await unflagItem('article', 'a1');
    expect(error?.code).toBe('42501');
  });
});

describe('deleteFlaggedItem (erreurs)', () => {
  it('propage l’erreur RLS', async () => {
    resolveChain(mocks.deleteChain, {
      data: null,
      error: { code: '42501', message: 'denied' },
    });
    const { error } = await deleteFlaggedItem('post', 'p1');
    expect(error?.code).toBe('42501');
  });

  it('cible la bonne table pour les commentaires', async () => {
    resolveChain(mocks.deleteChain, { data: null, error: null });
    await deleteFlaggedItem('comment', 'c1');
    expect(mocks.from).toHaveBeenCalledWith('comments');
  });

  it('cible post_comments pour les commentaires de post', async () => {
    resolveChain(mocks.deleteChain, { data: null, error: null });
    await deleteFlaggedItem('post_comment', 'pc1');
    expect(mocks.from).toHaveBeenCalledWith('post_comments');
  });
});

describe('listFlaggedArticles (limite)', () => {
  it('propage le paramètre limit', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listFlaggedArticles(5);
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(5);
  });
});

describe('createEmailCampaign (status custom)', () => {
  it('propage le status si fourni', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: { id: 'ec1', status: 'queued' },
      error: null,
    });
    await createEmailCampaign({ ...validCampaign(), status: 'queued' });
    const insertArg = mocks.insertChain.insert.mock.calls[0]?.[0] as { status: string };
    expect(insertArg.status).toBe('queued');
  });
});
