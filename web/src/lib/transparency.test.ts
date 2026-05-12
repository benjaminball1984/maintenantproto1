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

interface SignupRow {
  created_at: string;
}

interface SignupsResult {
  data: SignupRow[] | null;
  error: { message: string } | null;
}

function buildSignupsClient(result: SignupsResult): SupabaseClient<Database> {
  const fromMock = vi.fn((_table: string) => {
    const chain = {
      select: vi.fn(() => chain),
      gte: vi.fn(() => chain),
      then: vi.fn((onFulfilled: (v: SignupsResult) => unknown) =>
        Promise.resolve(onFulfilled(result)),
      ),
    };
    return chain;
  });
  return { from: fromMock } as unknown as SupabaseClient<Database>;
}

describe('fetchMonthlySignups', () => {
  const NOW = new Date(Date.UTC(2026, 4, 12, 10, 0, 0)); // 2026-05-12

  it('agrège les inscriptions par mois UTC', async () => {
    const client = buildSignupsClient({
      data: [
        { created_at: '2026-05-01T00:00:00Z' },
        { created_at: '2026-05-31T23:59:59Z' },
        { created_at: '2026-04-15T12:00:00Z' },
        { created_at: '2025-06-02T00:00:00Z' },
      ],
      error: null,
    });
    const { data, error } = await fetchMonthlySignups(client, 12, NOW);
    expect(error).toBeNull();
    expect(data).toHaveLength(12);
    const may = data?.find((b) => b.monthIso === '2026-05-01');
    expect(may?.count).toBe(2);
    const april = data?.find((b) => b.monthIso === '2026-04-01');
    expect(april?.count).toBe(1);
    const june25 = data?.find((b) => b.monthIso === '2025-06-01');
    expect(june25?.count).toBe(1);
  });

  it('renvoie tous les mois à zéro quand aucune inscription', async () => {
    const client = buildSignupsClient({ data: [], error: null });
    const { data, error } = await fetchMonthlySignups(client, 6, NOW);
    expect(error).toBeNull();
    expect(data).toHaveLength(6);
    expect(data?.every((b) => b.count === 0)).toBe(true);
  });

  it('propage une erreur PostgREST', async () => {
    const client = buildSignupsClient({
      data: null,
      error: { message: 'rls_denied' },
    });
    const { data, error } = await fetchMonthlySignups(client, 12, NOW);
    expect(data).toBeNull();
    expect(error?.message).toBe('rls_denied');
  });

  it('ignore les created_at hors fenêtre (antérieurs au premier mois)', async () => {
    const client = buildSignupsClient({
      data: [
        { created_at: '2024-01-01T00:00:00Z' }, // hors fenêtre
        { created_at: '2026-05-01T00:00:00Z' },
      ],
      error: null,
    });
    const { data } = await fetchMonthlySignups(client, 12, NOW);
    const total = (data ?? []).reduce((s, b) => s + b.count, 0);
    expect(total).toBe(1);
  });

  it('ignore les valeurs created_at non-string', async () => {
    const client = buildSignupsClient({
      data: [
        { created_at: null as unknown as string },
        { created_at: '2026-05-01T00:00:00Z' },
      ],
      error: null,
    });
    const { data } = await fetchMonthlySignups(client, 12, NOW);
    const total = (data ?? []).reduce((s, b) => s + b.count, 0);
    expect(total).toBe(1);
  });
});
