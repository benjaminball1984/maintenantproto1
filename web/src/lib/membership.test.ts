import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const selectChain = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const insertChain = {
    insert: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const functions = {
    invoke: vi.fn(),
  };
  return { selectChain, insertChain, functions };
});

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
    functions: mocks.functions,
  },
}));

import {
  createCheckoutSession,
  createFreeAdhesion,
  getCurrentAdhesion,
  isTierLockedFor,
  TIER_ORDER,
  TIER_RANK,
} from '@/lib/membership';
import { postgrestErrorMessage } from '@/lib/postgrestError';

const sampleAdhesion = {
  id: 'a1',
  user_id: 'u1',
  tier: 'soutien' as const,
  status: 'active' as const,
  amount_eur: 5,
  stripe_subscription_id: 'sub_123',
  starts_on: '2026-01-01',
  ends_on: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  // getCurrentAdhesion : .from('adhesions').select('*').eq(...).eq(...).order(...).limit(...).maybeSingle()
  mocks.selectChain.select.mockReturnValue(mocks.selectChain);
  mocks.selectChain.eq.mockReturnValue(mocks.selectChain);
  mocks.selectChain.order.mockReturnValue(mocks.selectChain);
  mocks.selectChain.limit.mockReturnValue(mocks.selectChain);
  // createFreeAdhesion : .from('adhesions').insert(...).select('*').maybeSingle()
  mocks.insertChain.insert.mockReturnValue(mocks.insertChain);
  mocks.insertChain.select.mockReturnValue(mocks.insertChain);
});

describe('TIER_ORDER / TIER_RANK', () => {
  it('ordonne les tiers du moins engageant au plus engageant', () => {
    expect(TIER_ORDER).toEqual(['gratuit', 'soutien', 'engage']);
    expect(TIER_RANK.gratuit).toBeLessThan(TIER_RANK.soutien);
    expect(TIER_RANK.soutien).toBeLessThan(TIER_RANK.engage);
  });
});

describe('isTierLockedFor', () => {
  it('aucun tier actuel → rien n’est lock', () => {
    expect(isTierLockedFor(null, 'gratuit')).toBe(false);
    expect(isTierLockedFor(null, 'engage')).toBe(false);
  });

  it('tier actuel = soutien → gratuit et soutien sont lock, engage reste accessible', () => {
    expect(isTierLockedFor('soutien', 'gratuit')).toBe(true);
    expect(isTierLockedFor('soutien', 'soutien')).toBe(true);
    expect(isTierLockedFor('soutien', 'engage')).toBe(false);
  });

  it('tier actuel = engage → tout est lock (tier maximal atteint)', () => {
    expect(isTierLockedFor('engage', 'gratuit')).toBe(true);
    expect(isTierLockedFor('engage', 'soutien')).toBe(true);
    expect(isTierLockedFor('engage', 'engage')).toBe(true);
  });
});

describe('getCurrentAdhesion', () => {
  it('renvoie l’adhésion active la plus récente', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sampleAdhesion, error: null });
    const { data, error } = await getCurrentAdhesion('u1');
    expect(error).toBeNull();
    expect(data?.tier).toBe('soutien');
    expect(mocks.selectChain.select).toHaveBeenCalledWith('*');
    expect(mocks.selectChain.eq).toHaveBeenNthCalledWith(1, 'user_id', 'u1');
    expect(mocks.selectChain.eq).toHaveBeenNthCalledWith(2, 'status', 'active');
    expect(mocks.selectChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mocks.selectChain.limit).toHaveBeenCalledWith(1);
  });

  it('renvoie data: null sans erreur si aucune adhésion active', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data, error } = await getCurrentAdhesion('u2');
    expect(data).toBeNull();
    expect(error).toBeNull();
  });

  it('remonte une erreur Postgrest mappée en FR', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    const { error } = await getCurrentAdhesion('u1');
    expect(error?.code).toBe('42501');
    expect(postgrestErrorMessage(error)).toBe(
      'Vous n’avez pas les droits pour effectuer cette action.',
    );
  });
});

describe('createFreeAdhesion', () => {
  it('insère un tier=gratuit, status=active et renvoie la ligne créée', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: { ...sampleAdhesion, tier: 'gratuit', amount_eur: 0, stripe_subscription_id: null },
      error: null,
    });
    const { data, error } = await createFreeAdhesion('u1');
    expect(error).toBeNull();
    expect(data?.tier).toBe('gratuit');
    expect(mocks.insertChain.insert).toHaveBeenCalledWith({
      user_id: 'u1',
      tier: 'gratuit',
      status: 'active',
      amount_eur: 0,
    });
  });

  it('mappe l’erreur RLS 42501 (utilisateur tente d’insérer pour un autre user_id)', async () => {
    mocks.insertChain.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'permission denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    const { data, error } = await createFreeAdhesion('u1');
    expect(data).toBeNull();
    expect(postgrestErrorMessage(error)).toBe(
      'Vous n’avez pas les droits pour effectuer cette action.',
    );
  });
});

describe('createCheckoutSession', () => {
  it('renvoie { url } après un invoke Edge réussi', async () => {
    mocks.functions.invoke.mockResolvedValueOnce({
      data: { url: 'https://checkout.stripe.com/sess_abc' },
      error: null,
    });
    const { url, error } = await createCheckoutSession('soutien');
    expect(error).toBeNull();
    expect(url).toBe('https://checkout.stripe.com/sess_abc');
    expect(mocks.functions.invoke).toHaveBeenCalledWith('create-checkout-session', {
      body: { tier: 'soutien' },
    });
  });

  it('mappe une erreur d’invoke en PostgrestError STRIPE_INVOKE_ERROR', async () => {
    mocks.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'network', name: 'FunctionsHttpError' },
    });
    const { url, error } = await createCheckoutSession('engage');
    expect(url).toBeNull();
    expect(error?.code).toBe('STRIPE_INVOKE_ERROR');
    expect(error?.message).toBe('network');
  });

  it('mappe une réponse sans url en STRIPE_NO_URL', async () => {
    mocks.functions.invoke.mockResolvedValueOnce({
      data: { error: 'price_not_configured' },
      error: null,
    });
    const { url, error } = await createCheckoutSession('soutien');
    expect(url).toBeNull();
    expect(error?.code).toBe('STRIPE_NO_URL');
    expect(error?.message).toBe('price_not_configured');
  });
});
