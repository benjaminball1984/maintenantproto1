/**
 * Scaffold Sentry no-PII — RGPD strict.
 *
 * Le SDK Sentry n'est pas encore branché côté projet. Ce fichier expose :
 *   - `scrubEvent(event)` : la fonction `beforeSend` à passer à `Sentry.init`
 *     quand l'intégration sera ajoutée. Elle masque tout PII (email, téléphone,
 *     adresse, cookies, user identifiant).
 *   - les listes de clés sensibles (`PII_KEY_PATTERN`) si on a besoin
 *     d'élargir le scrub ailleurs (logs custom, etc.).
 *
 * Pas de dépendance `@sentry/browser` ici tant qu'on n'a pas la clé DSN —
 * on garde la lib autonome et 100 % testable.
 */

const PII_KEYS = ['email', 'phone', 'address', 'token', 'password', 'authorization'];

export const PII_KEY_PATTERN = new RegExp(`(${PII_KEYS.join('|')})`, 'i');
export const REDACTED = '[Filtered]';

interface SentryRequest {
  cookies?: unknown;
  headers?: Record<string, unknown> | undefined;
  [key: string]: unknown;
}

export interface SentryEvent {
  user?: unknown;
  request?: SentryRequest;
  extra?: Record<string, unknown>;
  contexts?: Record<string, unknown>;
  breadcrumbs?: Record<string, unknown>[] | undefined;
  tags?: Record<string, unknown>;
  [key: string]: unknown;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function scrubRecord(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (PII_KEY_PATTERN.test(key)) {
      out[key] = REDACTED;
      continue;
    }
    if (isObject(value)) {
      out[key] = scrubRecord(value);
    } else if (Array.isArray(value)) {
      out[key] = value.map((item) => (isObject(item) ? scrubRecord(item) : item));
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * `beforeSend` Sentry — strippe les clés PII de l'événement avant l'envoi
 * au serveur. Conservée pure (pas d'I/O) → testable sans réseau.
 */
export function scrubEvent(event: SentryEvent): SentryEvent {
  const clone: SentryEvent = { ...event };
  // Identifiant utilisateur : on ne renvoie strictement rien à Sentry.
  // Si un id pseudonymisé devient nécessaire, on l'ajoutera explicitement
  // côté front avant init plutôt que via event.user.
  if (clone.user !== undefined) clone.user = REDACTED;

  if (clone.request && isObject(clone.request)) {
    const request: Record<string, unknown> = { ...(clone.request as Record<string, unknown>) };
    if (request.cookies !== undefined) request.cookies = REDACTED;
    if (isObject(request.headers)) request.headers = scrubRecord(request.headers);
    clone.request = request;
  }

  if (isObject(clone.extra)) clone.extra = scrubRecord(clone.extra);
  if (isObject(clone.contexts)) clone.contexts = scrubRecord(clone.contexts);
  if (isObject(clone.tags)) clone.tags = scrubRecord(clone.tags);

  if (Array.isArray(clone.breadcrumbs)) {
    clone.breadcrumbs = clone.breadcrumbs.map((b) => (isObject(b) ? scrubRecord(b) : b));
  }

  return clone;
}
