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
  CONTRIBUTION_AMOUNT_MAX,
  contribute,
  createCrowdfunding,
  getCrowdfunding,
  listCrowdfunding,
  validateContribution,
  validateCrowdfundingInput,
  type ContributeInput,
  type CreateCrowdfundingInput,
  type CrowdfundingCampaignRow,
  type ContributionRow,
} from '@/lib/crowdfunding';

const sample: CrowdfundingCampaignRow = {
  id: 'cf1',
  organizer_id: 'u1',
  title: 'Caisse de grève intersyndicale',
  slug: 'caisse-de-greve-intersyndicale',
  summary:
    'Une caisse pour soutenir les grévistes pendant la mobilisation contre la réforme des retraites.',
  body: null,
  goal_eur: 5000,
  raised_eur: 0,
  cover_url: null,
  status: 'published',
  starts_at: '2026-05-01T00:00:00Z',
  ends_at: null,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
};

const validInput = (): CreateCrowdfundingInput => ({
  organizerId: 'u1',
  title: 'Caisse de grève intersyndicale',
  summary:
    'Une caisse pour soutenir les grévistes pendant la mobilisation contre la réforme des retraites.',
  goalEur: 5000,
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
});

describe('validateCrowdfundingInput', () => {
  it('valide un input correct', () => {
    expect(validateCrowdfundingInput(validInput())).toEqual([]);
  });

  it('refuse un titre trop court', () => {
    const issues = validateCrowdfundingInput({ ...validInput(), title: 'court' });
    expect(issues.some((i) => i.field === 'title')).toBe(true);
  });

  it('refuse un résumé trop court', () => {
    const issues = validateCrowdfundingInput({ ...validInput(), summary: 'court' });
    expect(issues.some((i) => i.field === 'summary')).toBe(true);
  });

  it('refuse un objectif à 0', () => {
    const issues = validateCrowdfundingInput({ ...validInput(), goalEur: 0 });
    expect(issues.some((i) => i.field === 'goalEur')).toBe(true);
  });

  it('refuse une date de fin passée', () => {
    const issues = validateCrowdfundingInput({
      ...validInput(),
      endsAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    });
    expect(issues.some((i) => i.field === 'endsAt')).toBe(true);
  });
});

describe('validateContribution', () => {
  const base: ContributeInput = {
    campaignId: 'cf1',
    contributorId: 'u2',
    amountEur: 10,
  };

  it('valide un montant correct', () => {
    expect(validateContribution(base)).toEqual([]);
  });

  it('refuse un montant à 0', () => {
    expect(validateContribution({ ...base, amountEur: 0 })[0]?.field).toBe('amountEur');
  });

  it('refuse un montant au-dessus du plafond', () => {
    expect(
      validateContribution({ ...base, amountEur: CONTRIBUTION_AMOUNT_MAX + 1 })[0]?.field,
    ).toBe('amountEur');
  });
});

describe('listCrowdfunding', () => {
  it('renvoie les cagnottes publiées triées par created_at DESC', async () => {
    resolveChain(mocks.selectChain, { data: [sample], error: null });
    const { data, error } = await listCrowdfunding();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('status', 'published');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('applique le filtre search via or() avec échappement', async () => {
    resolveChain(mocks.selectChain, { data: [], error: null });
    await listCrowdfunding({ search: '50%_,' });
    expect(mocks.selectChain.or).toHaveBeenCalledWith(
      'title.ilike.%50\\%\\_\\,%,summary.ilike.%50\\%\\_\\,%',
    );
  });
});

describe('getCrowdfunding', () => {
  it('renvoie la cagnotte par ID', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sample, error: null });
    const { data } = await getCrowdfunding('cf1');
    expect(data?.id).toBe('cf1');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('id', 'cf1');
  });

  it('renvoie data: null si introuvable', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data } = await getCrowdfunding('?');
    expect(data).toBeNull();
  });
});

describe('createCrowdfunding', () => {
  it('refuse un input invalide', async () => {
    const { error } = await createCrowdfunding({ ...validInput(), title: 'a' });
    expect(error?.code).toBe('CROWDFUNDING_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère une cagnotte valide avec slug généré', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({ data: sample, error: null });
    const { data, error } = await createCrowdfunding(validInput());
    expect(error).toBeNull();
    expect(data?.id).toBe('cf1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        organizer_id: 'u1',
        slug: 'caisse-de-greve-intersyndicale',
        goal_eur: 5000,
        status: 'published',
      }),
    );
  });

  it('retry sur collision de slug (23505)', async () => {
    mocks.insertChain.maybeSingle
      .mockResolvedValueOnce({
        data: null,
        error: {
          message: 'duplicate',
          details: '',
          hint: '',
          code: '23505',
          name: 'PostgrestError',
        },
      })
      .mockResolvedValueOnce({
        data: { ...sample, slug: 'caisse-de-greve-intersyndicale-2' },
        error: null,
      });
    const { data, error } = await createCrowdfunding(validInput());
    expect(error).toBeNull();
    expect(data?.slug).toBe('caisse-de-greve-intersyndicale-2');
    expect(mocks.insertChain.insert).toHaveBeenCalledTimes(2);
  });
});

describe('contribute', () => {
  it('refuse une contribution invalide', async () => {
    const { error } = await contribute({
      campaignId: 'cf1',
      contributorId: 'u2',
      amountEur: 0,
    });
    expect(error?.code).toBe('CONTRIBUTION_VALIDATION');
    expect(mocks.insertChain.insert).not.toHaveBeenCalled();
  });

  it('insère une contribution valide', async () => {
    const sampleContribution: ContributionRow = {
      id: 'c1',
      campaign_id: 'cf1',
      contributor_id: 'u2',
      amount_eur: 25,
      stripe_payment_intent: null,
      is_anonymous: false,
      created_at: '2026-05-01T00:00:00Z',
    };
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: sampleContribution,
      error: null,
    });
    const { data, error } = await contribute({
      campaignId: 'cf1',
      contributorId: 'u2',
      amountEur: 25,
    });
    expect(error).toBeNull();
    expect(data?.id).toBe('c1');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        campaign_id: 'cf1',
        contributor_id: 'u2',
        amount_eur: 25,
        is_anonymous: false,
      }),
    );
  });
});
