import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

// =====================================================================================
// Compteurs publics « transparence »
//
// Toutes les requêtes utilisent `head: true, count: 'exact'` afin de ne
// transférer aucune ligne — seul le compteur est retourné. RLS publique
// (cf. `db/schema.sql` policies `*_select_public`) garantit qu'aucun
// contenu privé n'est exposé : un anonyme ne compte que ce qu'il aurait pu
// lire en `select *`.
//
// Les counts dépendent du contexte RLS :
//   * users : compte tout le monde (policy `users_select_public` for select (true)).
//   * petitions / mobilizations / campaigns / communes : seuls les contenus
//     `status = 'published'` sont visibles aux anonymes, donc le count(*)
//     retourné est exactement « publié et non archivé ».
//   * signatures : public, donc total cumulé.
//
// Le compteur « signalements traités » est volontairement omis : la donnée
// (`is_flagged = true`) est filtrée hors lecture publique pour les
// commentaires/posts (`select using (not is_flagged or auth.uid() = author_id)`),
// elle n'est donc pas comptable depuis le front anonyme sans casser RLS. À
// reporter sur une page admin dédiée si on veut une stat de modération.
// =====================================================================================

export interface TransparencyCounts {
  members: number;
  publishedPetitions: number;
  publishedMobilizations: number;
  publishedCampaigns: number;
  publishedCommunes: number;
  signatures: number;
}

export interface TransparencyResult {
  data: TransparencyCounts | null;
  error: PostgrestError | null;
}

type Client = SupabaseClient<Database>;

async function countTable(
  client: Client,
  table:
    | 'users'
    | 'petitions'
    | 'mobilizations'
    | 'campaigns'
    | 'communes'
    | 'signatures',
  filters: { column: string; value: string }[] = [],
): Promise<{ count: number; error: PostgrestError | null }> {
  // `head: true` => aucune ligne n'est transférée, seul le `count` revient.
  // On projette `id` (et pas `*`) par convention — cf. notifications.ts.
  let query = client.from(table).select('id', { count: 'exact', head: true });
  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }
  const { count, error } = await query;
  return { count: count ?? 0, error };
}

export async function fetchTransparencyCounts(
  client: Client = supabase,
): Promise<TransparencyResult> {
  const results = await Promise.all([
    countTable(client, 'users'),
    countTable(client, 'petitions', [{ column: 'status', value: 'published' }]),
    countTable(client, 'mobilizations', [{ column: 'status', value: 'published' }]),
    countTable(client, 'campaigns', [{ column: 'status', value: 'published' }]),
    countTable(client, 'communes', [{ column: 'status', value: 'published' }]),
    countTable(client, 'signatures'),
  ]);

  const firstError = results.find((r) => r.error !== null)?.error ?? null;
  if (firstError) {
    return { data: null, error: firstError };
  }

  const [
    members,
    publishedPetitions,
    publishedMobilizations,
    publishedCampaigns,
    publishedCommunes,
    signatures,
  ] = results;

  return {
    data: {
      members: members?.count ?? 0,
      publishedPetitions: publishedPetitions?.count ?? 0,
      publishedMobilizations: publishedMobilizations?.count ?? 0,
      publishedCampaigns: publishedCampaigns?.count ?? 0,
      publishedCommunes: publishedCommunes?.count ?? 0,
      signatures: signatures?.count ?? 0,
    },
    error: null,
  };
}

/**
 * Date publique de mise en production (étape 19 du handoff). Sert d'en-tête
 * sur la page Transparence et de point d'ancrage pour les futures stats
 * cumulatives. Format ISO 8601 (YYYY-MM-DD), interprété en UTC pour éviter
 * les décalages de timezone côté client.
 */
export const GO_LIVE_DATE_ISO = '2026-05-12';

export function formatGoLiveDateFr(iso: string = GO_LIVE_DATE_ISO): string {
  const [year, month, day] = iso.split('-').map((n) => Number.parseInt(n, 10));
  if (!year || !month || !day) return iso;
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

// =====================================================================================
// Stats publiques agrégées — inscriptions par mois (12 derniers).
//
// Lecture côté anon via la policy `users_select_public for select using (true)`
// (cf. schema.sql §3). On ne projette QUE `created_at` pour ne transférer
// aucune colonne potentiellement sensible (email, display_name, etc.) côté
// front public. RGPD : `created_at` est un timestamp non-identifiant en
// agrégé.
//
// Limite pratique : la projection retourne toutes les lignes <= now() AND
// >= since. Tant que `users` reste < ~50k lignes, le transfert est
// négligeable (~8 octets ISO × N). Au-delà : matérialiser une vue
// `users_signups_monthly` côté DB (RPC publique stable) — listé en dette
// `M5 robustesse — count: 'exact' sur signatures` étape 20 jusqu'à
// remplacement.
// =====================================================================================

export interface MonthlySignupBucket {
  /** Premier jour du mois en ISO 8601 (`YYYY-MM-01`, UTC). */
  monthIso: string;
  /** Nombre de comptes créés ce mois-ci. */
  count: number;
}

export interface MonthlySignupsResult {
  data: MonthlySignupBucket[] | null;
  error: PostgrestError | null;
}

/**
 * Retourne la liste des mois (premier jour UTC) `monthsBack` mois en arrière
 * jusqu'à `reference` inclus, dans l'ordre chronologique croissant.
 */
export function buildMonthsRange(
  reference: Date,
  monthsBack: number,
): MonthlySignupBucket[] {
  // Garde défensive : `new Date('invalid')` retourne un Date dont
  // `getTime() === NaN`, ce qui propagerait des `NaN-NaN-01` dans les
  // buckets. Tous les appelants actuels passent `new Date()` ou
  // `new Date(Date.UTC(...))`, mais on protège l'API publique.
  if (Number.isNaN(reference.getTime())) return [];
  const buckets: MonthlySignupBucket[] = [];
  const startYear = reference.getUTCFullYear();
  const startMonth = reference.getUTCMonth();
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const month = new Date(Date.UTC(startYear, startMonth - i, 1));
    const iso = month.toISOString().slice(0, 10);
    buckets.push({ monthIso: iso, count: 0 });
  }
  return buckets;
}

/**
 * Charge les `created_at` des `monthsBack` derniers mois et les agrège en
 * buckets mensuels UTC. Les mois sans inscription apparaissent à 0 pour
 * conserver une échelle stable côté UI.
 *
 * @param client Supabase client (injectable pour tests).
 * @param monthsBack Nombre de mois à fenêtrer (défaut 12).
 * @param now Référence temporelle (défaut `new Date()`). Injectable pour
 *            les tests.
 */
export async function fetchMonthlySignups(
  client: Client = supabase,
  monthsBack = 12,
  now: Date = new Date(),
): Promise<MonthlySignupsResult> {
  const buckets = buildMonthsRange(now, monthsBack);
  const since = buckets[0]?.monthIso;
  if (!since) {
    return { data: [], error: null };
  }
  const { data, error } = await client
    .from('users')
    .select('created_at')
    .gte('created_at', since);
  if (error) {
    return { data: null, error };
  }
  const indexByMonth = new Map<string, number>();
  buckets.forEach((bucket, idx) => indexByMonth.set(bucket.monthIso, idx));
  for (const row of data ?? []) {
    const createdAt = row.created_at;
    if (typeof createdAt !== 'string') continue;
    const monthKey = monthKeyFromIso(createdAt);
    const idx = monthKey ? indexByMonth.get(monthKey) : undefined;
    if (idx === undefined) continue;
    const bucket = buckets[idx];
    if (bucket) bucket.count += 1;
  }
  return { data: buckets, error: null };
}

function monthKeyFromIso(iso: string): string | null {
  // `2026-05-12T13:42:00Z` → `2026-05-01`. Pas de `new Date()` ici pour
  // éviter les décalages de timezone : on prend littéralement les 7
  // premiers caractères et on ajoute `-01`.
  //
  // INVARIANT IMPORTANT : repose sur le fait que PostgREST sérialise les
  // colonnes `timestamptz` en UTC par défaut (suffixe `Z` ou offset
  // `+00:00`). Si le projet Supabase change `pgrst.db_tz` ou applique
  // un offset local côté PostgREST, ce slice retournera un mois local
  // — l'agrégation côté chart deviendrait silencieusement biaisée.
  // À ré-évaluer si la config DB change.
  if (iso.length < 7) return null;
  const yyyyMm = iso.slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(yyyyMm)) return null;
  return `${yyyyMm}-01`;
}

const MONTH_LABELS_FR = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
] as const;

/**
 * « 2026-05-01 » → « mai 26 ». Format court, idéal pour les axes de
 * graphique où la place est comptée.
 */
export function formatMonthShortFr(monthIso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(monthIso)) return monthIso;
  const year = Number.parseInt(monthIso.slice(0, 4), 10);
  const month = Number.parseInt(monthIso.slice(5, 7), 10);
  if (!year || month < 1 || month > 12) return monthIso;
  const label = MONTH_LABELS_FR[month - 1] ?? '';
  return `${label} ${String(year).slice(-2)}`;
}
