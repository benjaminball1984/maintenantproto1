import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

import {
  buildMonthsRange,
  fetchMonthlySignups,
  fetchTransparencyCounts,
  formatGoLiveDateFr,
  formatMonthShortFr,
  GO_LIVE_DATE_ISO,
} from './transparency';
import type { Database } from '@/types/database';

// =====================================================================================
// Tests des compteurs « transparence ».
//
// `fetchTransparencyCounts` accepte un client Supabase injectable — on stubbe
// directement la chaîne fluide `.from(table).select(...).eq(...)`, sans
// dépendre du client réel ni d'env vars. Aucune requête réseau n'est émise.
// =====================================================================================

interface CountResult {
  count: number | null;
  error: { message: string } | null;
}

interface ChainStub {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  then: ReturnType<typeof vi.fn>;
}

function buildClient(results: Record<string, CountResult>): SupabaseClient<Database> {
  const fromMock = vi.fn((table: string) => {
    const chain: ChainStub = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      then: vi.fn((onFulfilled: (v: CountResult) => unknown) => {
        const value = results[table] ?? { count: 0, error: null };
        return Promise.resolve(onFulfilled(value));
      }),
    };
    return chain;
  });
  return { from: fromMock } as unknown as SupabaseClient<Database>;
}

describe('formatGoLiveDateFr', () => {
  it('formatte la date par défaut (2026-05-12) en français', () => {
    const out = formatGoLiveDateFr();
    expect(out).toMatch(/12/);
    expect(out).toMatch(/mai/);
    expect(out).toMatch(/2026/);
  });

  it('formatte une ISO arbitraire', () => {
    expect(formatGoLiveDateFr('2025-01-03')).toMatch(/3 janvier 2025/);
  });

  it('renvoie l\'ISO brut en cas de format invalide', () => {
    expect(formatGoLiveDateFr('not-a-date')).toBe('not-a-date');
  });
});

describe('GO_LIVE_DATE_ISO', () => {
  it('est au format ISO 8601 (YYYY-MM-DD)', () => {
    expect(GO_LIVE_DATE_ISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('fetchTransparencyCounts', () => {
  it('agrège les compteurs publics par table', async () => {
    const client = buildClient({
      users: { count: 1234, error: null },
      petitions: { count: 12, error: null },
      mobilizations: { count: 5, error: null },
      campaigns: { count: 3, error: null },
      communes: { count: 2, error: null },
      signatures: { count: 56789, error: null },
    });
    const { data, error } = await fetchTransparencyCounts(client);
    expect(error).toBeNull();
    expect(data).toEqual({
      members: 1234,
      publishedPetitions: 12,
      publishedMobilizations: 5,
      publishedCampaigns: 3,
      publishedCommunes: 2,
      signatures: 56789,
    });
  });

  it('renvoie 0 quand le count est null (RLS sans accès)', async () => {
    const client = buildClient({
      users: { count: null, error: null },
      petitions: { count: null, error: null },
      mobilizations: { count: null, error: null },
      campaigns: { count: null, error: null },
      communes: { count: null, error: null },
      signatures: { count: null, error: null },
    });
    const { data, error } = await fetchTransparencyCounts(client);
    expect(error).toBeNull();
    expect(data?.members).toBe(0);
    expect(data?.signatures).toBe(0);
  });

  it('propage la première erreur rencontrée', async () => {
    const client = buildClient({
      users: { count: null, error: { message: 'rls_denied' } },
      petitions: { count: 1, error: null },
      mobilizations: { count: 1, error: null },
      campaigns: { count: 1, error: null },
      communes: { count: 1, error: null },
      signatures: { count: 1, error: null },
    });
    const { data, error } = await fetchTransparencyCounts(client);
    expect(data).toBeNull();
    expect(error?.message).toBe('rls_denied');
  });

  it('filtre les tables de contenu par status=published', async () => {
    const eqSpies: unknown[][] = [];
    const fromMock = vi.fn((_table: string) => {
      const chain: ChainStub = {
        select: vi.fn(() => chain),
        eq: vi.fn((col: string, val: string) => {
          eqSpies.push([col, val]);
          return chain;
        }),
        then: vi.fn((onFulfilled: (v: CountResult) => unknown) =>
          Promise.resolve(onFulfilled({ count: 0, error: null })),
        ),
      };
      return chain;
    });
    const client = { from: fromMock } as unknown as SupabaseClient<Database>;
    await fetchTransparencyCounts(client);
    const statusFilters = eqSpies.filter(([col]) => col === 'status');
    expect(statusFilters.length).toBe(4);
    for (const [, value] of statusFilters) {
      expect(value).toBe('published');
    }
  });
});

describe('buildMonthsRange', () => {
  it('retourne 12 mois croissants se terminant par le mois de la référence', () => {
    const ref = new Date(Date.UTC(2026, 4, 12)); // mai 2026
    const buckets = buildMonthsRange(ref, 12);
    expect(buckets).toHaveLength(12);
    expect(buckets[0]?.monthIso).toBe('2025-06-01');
    expect(buckets[buckets.length - 1]?.monthIso).toBe('2026-05-01');
    for (const b of buckets) expect(b.count).toBe(0);
  });

  it('gère le franchissement de l\'année (décembre → janvier)', () => {
    const ref = new Date(Date.UTC(2026, 0, 15)); // janvier 2026
    const buckets = buildMonthsRange(ref, 3);
    expect(buckets.map((b) => b.monthIso)).toEqual([
      '2025-11-01',
      '2025-12-01',
      '2026-01-01',
    ]);
  });

  it('renvoie [] quand monthsBack = 0', () => {
    const ref = new Date(Date.UTC(2026, 4, 12));
    expect(buildMonthsRange(ref, 0)).toEqual([]);
  });

  it('renvoie [] sur une Date invalide (NaN) plutôt que des NaN-NaN-01', () => {
    const invalid = new Date('not-a-date');
    expect(Number.isNaN(invalid.getTime())).toBe(true);
    expect(buildMonthsRange(invalid, 12)).toEqual([]);
  });
});

describe('formatMonthShortFr', () => {
  it('formate « mai 26 » pour 2026-05-01', () => {
    expect(formatMonthShortFr('2026-05-01')).toBe('mai 26');
  });

  it('formate « janv. 25 » pour 2025-01-01', () => {
    expect(formatMonthShortFr('2025-01-01')).toBe('janv. 25');
  });

  it('renvoie la chaîne brute en cas de format invalide', () => {
    expect(formatMonthShortFr('not-a-month')).toBe('not-a-month');
    expect(formatMonthShortFr('2026-13-01')).toBe('2026-13-01');
  });
});

interface RpcRow {
  month_iso: string;
  count: number;
}

interface RpcResult {
  data: RpcRow[] | null;
  error: { message: string } | null;
}

function buildRpcClient(result: RpcResult): {
  client: SupabaseClient<Database>;
  rpcMock: ReturnType<typeof vi.fn>;
} {
  const rpcMock = vi.fn((_fn: string, _args?: Record<string, unknown>) =>
    Promise.resolve(result),
  );
  const client = { rpc: rpcMock } as unknown as SupabaseClient<Database>;
  return { client, rpcMock };
}

describe('fetchMonthlySignups', () => {
  it('appelle la RPC users_signups_monthly avec p_months_back', async () => {
    const { client, rpcMock } = buildRpcClient({ data: [], error: null });
    await fetchMonthlySignups(client, 12);
    expect(rpcMock).toHaveBeenCalledWith('users_signups_monthly', { p_months_back: 12 });
  });

  it('passe la valeur monthsBack à la RPC', async () => {
    const { client, rpcMock } = buildRpcClient({ data: [], error: null });
    await fetchMonthlySignups(client, 6);
    expect(rpcMock).toHaveBeenCalledWith('users_signups_monthly', { p_months_back: 6 });
  });

  it('mappe les lignes RPC en MonthlySignupBucket', async () => {
    const { client } = buildRpcClient({
      data: [
        { month_iso: '2025-06-01', count: 1 },
        { month_iso: '2026-04-01', count: 1 },
        { month_iso: '2026-05-01', count: 2 },
      ],
      error: null,
    });
    const { data, error } = await fetchMonthlySignups(client, 12);
    expect(error).toBeNull();
    expect(data).toEqual([
      { monthIso: '2025-06-01', count: 1 },
      { monthIso: '2026-04-01', count: 1 },
      { monthIso: '2026-05-01', count: 2 },
    ]);
  });

  it('renvoie [] quand la RPC retourne null (cas défensif)', async () => {
    const { client } = buildRpcClient({ data: null, error: null });
    const { data, error } = await fetchMonthlySignups(client, 12);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('propage l\'erreur de la RPC', async () => {
    const { client } = buildRpcClient({
      data: null,
      error: { message: 'function_not_found' },
    });
    const { data, error } = await fetchMonthlySignups(client, 12);
    expect(data).toBeNull();
    expect(error?.message).toBe('function_not_found');
  });

  it('utilise 12 comme valeur par défaut de monthsBack', async () => {
    const { client, rpcMock } = buildRpcClient({ data: [], error: null });
    await fetchMonthlySignups(client);
    expect(rpcMock).toHaveBeenCalledWith('users_signups_monthly', { p_months_back: 12 });
  });
});
