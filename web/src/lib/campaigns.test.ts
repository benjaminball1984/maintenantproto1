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
    then: vi.fn(),
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
  addCampaignAction,
  CAMPAIGN_ACTIONS_MAX_COUNT,
  CAMPAIGN_BODY_MIN,
  CAMPAIGN_SUMMARY_MIN,
  CAMPAIGN_TITLE_MIN,
  createCampaign,
  getCampaign,
  listCampaigns,
  removeCampaignAction,
  validateCampaignInput,
  type CampaignActionRow,
  type CampaignRow,
  type CreateCampaignInput,
} from '@/lib/campaigns';
import { postgrestErrorMessage } from '@/lib/postgrestError';

const sampleCampaign: CampaignRow = {
  id: 'c1',
  author_id: 'u1',
  title: 'Sauvons la maternité',
  slug: 'sauvons-la-maternite',
  summary: 'a'.repeat(CAMPAIGN_SUMMARY_MIN),
  body: null,
  cover_url: null,
  status: 'published',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const sampleActions: CampaignActionRow[] = [
  {
    id: 'a1',
    campaign_id: 'c1',
    petition_id: 'p1',
    mobilization_id: null,
    poll_id: null,
    crowdfunding_id: null,
    label: 'Signer la pétition',
    position: 0,
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'a2',
    campaign_id: 'c1',
    petition_id: null,
    mobilization_id: 'm1',
    poll_id: null,
    crowdfunding_id: null,
    label: 'Rejoindre la mobilisation',
    position: 1,
    created_at: '2026-05-01T00:00:00Z',
  },
];

const validInput = (): CreateCampaignInput => ({
  authorId: 'u1',
  title: 'Sauvons la maternité de Cherbourg',
  summary:
    'Une campagne pour préserver la maternité du territoire et garantir un accès local aux soins.',
  actions: [{ petitionId: 'p1', label: 'Signer la pétition' }],
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

describe('validateCampaignInput', () => {
  it('valide un input correct', () => {
    expect(validateCampaignInput(validInput())).toEqual([]);
  });

  it('refuse un titre trop court', () => {
    const issues = validateCampaignInput({ ...validInput(), title: 'court' });
    expect(issues.some((i) => i.field === 'title')).toBe(true);
  });

  it('refuse un résumé sous le seuil', () => {
    const issues = validateCampaignInput({ ...validInput(), summary: 'court' });
    expect(issues.some((i) => i.field === 'summary')).toBe(true);
  });

  it('refuse un body non vide mais sous le minimum', () => {
    const issues = validateCampaignInput({ ...validInput(), body: 'trop court' });
    expect(issues.some((i) => i.field === 'body')).toBe(true);
  });

  it('accepte un body vide (facultatif)', () => {
    expect(validateCampaignInput({ ...validInput(), body: '' })).toEqual([]);
  });

  it('accepte un body au-delà du minimum', () => {
    expect(
      validateCampaignInput({ ...validInput(), body: 'b'.repeat(CAMPAIGN_BODY_MIN + 1) }),
    ).toEqual([]);
  });

  it('refuse 0 action', () => {
    const issues = validateCampaignInput({ ...validInput(), actions: [] });
    expect(issues.some((i) => i.field === 'actions')).toBe(true);
  });

  it(`refuse plus de ${CAMPAIGN_ACTIONS_MAX_COUNT} actions`, () => {
    const issues = validateCampaignInput({
      ...validInput(),
      actions: Array.from({ length: CAMPAIGN_ACTIONS_MAX_COUNT + 1 }, () => ({
        petitionId: 'p1',
      })),
    });
    expect(issues.some((i) => i.field === 'actions')).toBe(true);
  });

  it('refuse une action sans aucune FK renseignée', () => {
    const issues = validateCampaignInput({
      ...validInput(),
      actions: [{ label: 'Manque tout' }],
    });
    expect(issues.some((i) => i.field === 'actions')).toBe(true);
  });
});

describe('listCampaigns', () => {
  it('renvoie la liste publique triée par created_at DESC', async () => {
    const rows = [sampleCampaign, { ...sampleCampaign, id: 'c2', slug: 'c2' }];
    resolveChain(mocks.selectChain, { data: rows, error: null });
    const { data, error } = await listCampaigns();
    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('status', 'published');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(50);
  });

  it('applique le filtre search via .or(title|summary ilike)', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listCampaigns({ search: 'cherbourg' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'title.ilike.%cherbourg%,summary.ilike.%cherbourg%',
    );
  });

  it('échappe les méta-caractères ilike dans search', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listCampaigns({ search: '50%_' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'title.ilike.%50\\%\\_%,summary.ilike.%50\\%\\_%',
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
    const { error } = await listCampaigns();
    expect(error).toMatchObject({ code: '42501' });
    expect(postgrestErrorMessage(error)).toBe(
      'Vous n’avez pas les droits pour effectuer cette action.',
    );
  });
});

describe('getCampaign', () => {
  it('renvoie la campagne + ses actions triées par position', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sampleCampaign, error: null });
    resolveChain(mocks.selectChain, { data: sampleActions, error: null });
    const { data, error } = await getCampaign('sauvons-la-maternite');
    expect(error).toBeNull();
    expect(data?.campaign.id).toBe('c1');
    expect(data?.actions).toHaveLength(2);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('slug', 'sauvons-la-maternite');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('position', { ascending: true });
  });

  it('renvoie data: null si le slug est introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data, error } = await getCampaign('inconnu');
    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  it('remonte l’erreur si la requête actions échoue', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sampleCampaign, error: null });
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
    const { data, error } = await getCampaign('sauvons-la-maternite');
    expect(data).toBeNull();
    expect(error).toMatchObject({ code: '42501' });
  });
});

describe('createCampaign', () => {
  it('refuse un input invalide sans appeler Supabase', async () => {
    const { data, error } = await createCampaign({ ...validInput(), title: 'court' });
    expect(data).toBeNull();
    expect(error?.code).toBe('CAMPAIGN_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère une campagne + ses actions avec slug stable', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sampleCampaign, error: null });
    resolveChain(mocks.insertChain, { data: sampleActions, error: null });
    const { data, error } = await createCampaign({
      ...validInput(),
      actions: [
        { petitionId: 'p1', label: 'Signer la pétition' },
        { mobilizationId: 'm1', label: 'Rejoindre la mobilisation' },
      ],
    });
    expect(error).toBeNull();
    expect(data?.campaign.id).toBe('c1');
    expect(data?.actions).toHaveLength(2);
    expect(mocks.insertChain.insert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        author_id: 'u1',
        status: 'published',
        slug: 'sauvons-la-maternite-de-cherbourg',
      }),
    );
    expect(mocks.insertChain.insert).toHaveBeenNthCalledWith(
      2,
      expect.arrayContaining([
        expect.objectContaining({ campaign_id: 'c1', petition_id: 'p1', position: 0 }),
        expect.objectContaining({ campaign_id: 'c1', mobilization_id: 'm1', position: 1 }),
      ]),
    );
  });

  it('retente avec un suffixe en cas de collision (23505)', async () => {
    mocks.insertChain.maybeSingle
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'dup', details: '', hint: '', code: '23505', name: 'PostgrestError' },
      })
      .mockResolvedValueOnce({
        data: { ...sampleCampaign, slug: 'sauvons-la-maternite-de-cherbourg-2' },
        error: null,
      });
    resolveChain(mocks.insertChain, { data: sampleActions, error: null });
    const { data, error } = await createCampaign(validInput());
    expect(error).toBeNull();
    expect(data?.campaign.slug).toBe('sauvons-la-maternite-de-cherbourg-2');
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(3);
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
    const { data, error } = await createCampaign(validInput());
    expect(data).toBeNull();
    expect(error?.code).toBe('42501');
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(1);
  });

  it('rollback : supprime la campagne si l’insertion des actions échoue', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sampleCampaign, error: null });
    resolveChain(mocks.insertChain, {
      data: null,
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    resolveChain(mocks.deleteChain, { data: null, error: null });
    const { data, error } = await createCampaign(validInput());
    expect(data).toBeNull();
    expect(error).toMatchObject({ code: '42501' });
    expect(mocks.deleteChain.delete).toHaveBeenCalled();
    expect(mocks.deleteChain.eq).toHaveBeenCalledWith('id', 'c1');
  });
});

describe('addCampaignAction', () => {
  it('refuse une ref sans FK', async () => {
    const { data, error } = await addCampaignAction('c1', { label: 'Vide' });
    expect(data).toBeNull();
    expect(error?.code).toBe('CAMPAIGN_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère une action valide', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sampleActions[0], error: null });
    const { data, error } = await addCampaignAction('c1', { petitionId: 'p1', label: 'Signer' }, 2);
    expect(error).toBeNull();
    expect(data?.id).toBe('a1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        campaign_id: 'c1',
        petition_id: 'p1',
        position: 2,
        label: 'Signer',
      }),
    );
  });
});

describe('removeCampaignAction', () => {
  it('supprime l’action ciblée', async () => {
    resolveChain(mocks.deleteChain, { data: null, error: null });
    const { error } = await removeCampaignAction('a1');
    expect(error).toBeNull();
    expect(mocks.deleteChain.eq).toHaveBeenCalledWith('id', 'a1');
  });
});

describe('constantes exportées', () => {
  it('CAMPAIGN_TITLE_MIN > 0', () => {
    expect(CAMPAIGN_TITLE_MIN).toBeGreaterThan(0);
  });
});
