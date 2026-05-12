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

export interface InitSentryOptions {
  /** DSN Sentry (généralement `import.meta.env.VITE_SENTRY_DSN`). */
  dsn?: string | undefined;
  /** Environnement (`production`, `preview`, `development`). */
  environment?: string | undefined;
  /** Release / version pour le tracking. */
  release?: string | undefined;
  /** Callback exécuté quand le SDK est branché (utile pour les tests). */
  onReady?: ((api: { scrubEvent: typeof scrubEvent }) => void) | undefined;
}

let sentryInitialized = false;

/**
 * Branche Sentry côté front si un DSN est configuré, no-op sinon.
 *
 * Le SDK `@sentry/browser` est volontairement chargé en `import()` dynamique
 * pour ne pas alourdir le bundle initial. Si aucun DSN n'est fourni, on
 * retourne `false` immédiatement et la lib n'est pas téléchargée. Le chunk
 * Sentry pèse ~60 kB gzip — coût payé uniquement en environnement où le DSN
 * est configuré (preview / production).
 *
 * `beforeSend` est toujours connecté à `scrubEvent` pour garantir qu'aucun
 * email / ID utilisateur / cookie ne fuit vers Sentry.
 */
export function initSentry(options: InitSentryOptions = {}): boolean {
  if (sentryInitialized) return true;
  const dsn = options.dsn?.trim();
  if (!dsn) {
    return false;
  }
  // Init transactionnel : on ne marque `initialized` qu'après que `onReady`
  // ait passé sans jeter, sinon un appelant qui throw nous bloque dans un
  // état « marqué initialisé » sans avoir branché le SDK.
  try {
    options.onReady?.({ scrubEvent });
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      console.error('[initSentry] onReady threw, rolling back', error);
    }
    return false;
  }
  sentryInitialized = true;
  return true;
}

/**
 * Helper de wiring complet : charge `@sentry/browser` en import dynamique et
 * appelle `initSentry` avec un `onReady` qui exécute `Sentry.init` configuré
 * avec `beforeSend: scrubEvent`. Utilisé depuis `main.tsx` pour ne pas
 * embarquer la lib dans le chunk initial.
 *
 * Renvoie une promesse résolue `true` si Sentry est initialisé, `false` sinon
 * (DSN absent, SDK indisponible, erreur de chargement). N'expose jamais
 * l'erreur originale au caller — on logge en dev mais on ne casse pas le boot
 * de l'app si Sentry échoue.
 */
export async function loadAndInitSentry(options: InitSentryOptions): Promise<boolean> {
  const dsn = options.dsn?.trim();
  if (!dsn) return false;
  try {
    const Sentry = await import('@sentry/browser');
    return initSentry({
      ...options,
      onReady: () => {
        Sentry.init({
          dsn,
          ...(options.environment !== undefined ? { environment: options.environment } : {}),
          ...(options.release !== undefined ? { release: options.release } : {}),
          beforeSend: (event) =>
            scrubEvent(event as unknown as SentryEvent) as unknown as typeof event,
        });
      },
    });
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      console.error('[loadAndInitSentry] failed to load @sentry/browser', error);
    }
    return false;
  }
}

/** Réinitialise l'état d'`initSentry` — usage tests uniquement. */
export function resetSentryForTests(): void {
  sentryInitialized = false;
}
