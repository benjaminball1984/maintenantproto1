import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PII_KEY_PATTERN,
  REDACTED,
  scrubEvent,
  initSentry,
  loadAndInitSentry,
  resetSentryForTests,
} from './sentry';

describe('sentry.PII_KEY_PATTERN', () => {
  it('matche les clés sensibles', () => {
    expect(PII_KEY_PATTERN.test('email')).toBe(true);
    expect(PII_KEY_PATTERN.test('userEmail')).toBe(true);
    expect(PII_KEY_PATTERN.test('phone_number')).toBe(true);
    expect(PII_KEY_PATTERN.test('streetAddress')).toBe(true);
    expect(PII_KEY_PATTERN.test('AuthorizationHeader')).toBe(true);
    expect(PII_KEY_PATTERN.test('Token')).toBe(true);
  });

  it('ne matche pas les clés non-PII', () => {
    expect(PII_KEY_PATTERN.test('count')).toBe(false);
    expect(PII_KEY_PATTERN.test('slug')).toBe(false);
    expect(PII_KEY_PATTERN.test('campaignId')).toBe(false);
  });
});

describe('sentry.scrubEvent', () => {
  it('strippe event.user complètement', () => {
    const out = scrubEvent({ user: { id: 'abc', email: 'me@example.com' } });
    expect(out.user).toBe(REDACTED);
  });

  it('strippe event.request.cookies', () => {
    const out = scrubEvent({
      request: { cookies: 'sid=secret', url: 'https://example.test/foo' },
    });
    expect(out.request).toBeDefined();
    expect(out.request?.cookies).toBe(REDACTED);
    expect(out.request?.url).toBe('https://example.test/foo');
  });

  it('strippe event.request.headers contenant authorization', () => {
    const out = scrubEvent({
      request: {
        headers: {
          Authorization: 'Bearer xyz',
          'User-Agent': 'Mozilla/5.0',
        },
      },
    });
    const headers = out.request?.headers as Record<string, unknown> | undefined;
    expect(headers?.Authorization).toBe(REDACTED);
    expect(headers?.['User-Agent']).toBe('Mozilla/5.0');
  });

  it('strippe les clés PII dans extra de manière profonde', () => {
    const out = scrubEvent({
      extra: {
        ok: 'visible',
        email: 'leak@example.com',
        nested: {
          phone: '+33600000000',
          shippingAddress: '1 rue X',
          fine: 'kept',
        },
      },
    });
    expect(out.extra?.ok).toBe('visible');
    expect(out.extra?.email).toBe(REDACTED);
    const nested = out.extra?.nested as Record<string, unknown> | undefined;
    expect(nested?.phone).toBe(REDACTED);
    expect(nested?.shippingAddress).toBe(REDACTED);
    expect(nested?.fine).toBe('kept');
  });

  it('strippe les breadcrumbs', () => {
    const out = scrubEvent({
      breadcrumbs: [
        { category: 'auth', message: 'ok' },
        { category: 'http', data: { url: '/api', email: 'b@b.fr' } },
      ],
    });
    const second = out.breadcrumbs?.[1] as { data?: Record<string, unknown> } | undefined;
    expect(second?.data?.email).toBe(REDACTED);
  });

  it('ne mute pas l’événement d’origine', () => {
    const event = { user: { id: 'a' }, extra: { email: 'x@y.z' } };
    const out = scrubEvent(event);
    expect(event.user).toEqual({ id: 'a' });
    expect(event.extra.email).toBe('x@y.z');
    expect(out.user).toBe(REDACTED);
    expect(out.extra?.email).toBe(REDACTED);
  });
});

describe('sentry.initSentry', () => {
  beforeEach(() => {
    resetSentryForTests();
  });

  it('renvoie false quand aucun DSN n’est fourni', () => {
    expect(initSentry({})).toBe(false);
  });

  it('renvoie false quand le DSN est une chaîne vide', () => {
    expect(initSentry({ dsn: '' })).toBe(false);
    expect(initSentry({ dsn: '   ' })).toBe(false);
  });

  it('renvoie true quand un DSN valide est fourni', () => {
    expect(initSentry({ dsn: 'https://abc@sentry.io/1' })).toBe(true);
  });

  it('appelle onReady avec scrubEvent quand le DSN est valide', () => {
    const onReady = vi.fn();
    initSentry({ dsn: 'https://abc@sentry.io/1', onReady });
    expect(onReady).toHaveBeenCalledTimes(1);
    const arg = onReady.mock.calls[0]?.[0] as { scrubEvent: typeof scrubEvent };
    expect(typeof arg.scrubEvent).toBe('function');
    expect(arg.scrubEvent({ user: 'leak' })).toEqual({ user: REDACTED });
  });

  it('est idempotent — second appel renvoie true sans réinitialiser', () => {
    const onReady = vi.fn();
    expect(initSentry({ dsn: 'https://abc@sentry.io/1', onReady })).toBe(true);
    expect(initSentry({ dsn: 'https://abc@sentry.io/1', onReady })).toBe(true);
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('résout proprement après resetSentryForTests', () => {
    expect(initSentry({ dsn: 'https://abc@sentry.io/1' })).toBe(true);
    resetSentryForTests();
    const onReady = vi.fn();
    initSentry({ dsn: 'https://def@sentry.io/2', onReady });
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('roll back si onReady throw — pas marqué initialisé, reste réessayable', () => {
    const throwingOnReady = vi.fn(() => {
      throw new Error('boom');
    });
    expect(initSentry({ dsn: 'https://abc@sentry.io/1', onReady: throwingOnReady })).toBe(false);
    expect(throwingOnReady).toHaveBeenCalledTimes(1);

    // Le second appel doit pouvoir réessayer (état non corrompu).
    const okOnReady = vi.fn();
    expect(initSentry({ dsn: 'https://abc@sentry.io/1', onReady: okOnReady })).toBe(true);
    expect(okOnReady).toHaveBeenCalledTimes(1);
  });
});

describe('sentry.loadAndInitSentry', () => {
  beforeEach(() => {
    resetSentryForTests();
    vi.resetModules();
  });

  it('renvoie false quand aucun DSN n’est fourni (SDK non chargé)', async () => {
    expect(await loadAndInitSentry({})).toBe(false);
  });

  it('renvoie false quand le DSN est vide ou whitespace', async () => {
    expect(await loadAndInitSentry({ dsn: '' })).toBe(false);
    expect(await loadAndInitSentry({ dsn: '   ' })).toBe(false);
  });

  it('charge @sentry/browser et init avec beforeSend wired à scrubEvent', async () => {
    const initSpy = vi.fn();
    vi.doMock('@sentry/browser', () => ({ init: initSpy }));

    const fresh = await import('./sentry');
    fresh.resetSentryForTests();
    const ok = await fresh.loadAndInitSentry({
      dsn: 'https://abc@sentry.io/1',
      environment: 'production',
      release: 'app@1.2.3',
    });
    expect(ok).toBe(true);
    expect(initSpy).toHaveBeenCalledTimes(1);
    const firstCall = initSpy.mock.calls[0] as [Record<string, unknown>];
    const initArg = firstCall[0];
    expect(initArg.dsn).toBe('https://abc@sentry.io/1');
    expect(initArg.environment).toBe('production');
    expect(initArg.release).toBe('app@1.2.3');
    expect(typeof initArg.beforeSend).toBe('function');

    const beforeSend = initArg.beforeSend as (event: Record<string, unknown>) => Record<string, unknown>;
    const scrubbed = beforeSend({ user: { id: 'x' }, extra: { email: 'a@b.fr' } });
    expect(scrubbed.user).toBe(REDACTED);
    const extra = scrubbed.extra as Record<string, unknown>;
    expect(extra.email).toBe(REDACTED);

    vi.doUnmock('@sentry/browser');
  });

  it('renvoie false silencieusement si @sentry/browser plante au load', async () => {
    // Simule un chunk introuvable (404) / erreur d'import dynamique.
    vi.doMock('@sentry/browser', () => {
      throw new Error('chunk_load_failed');
    });

    const fresh = await import('./sentry');
    fresh.resetSentryForTests();
    const ok = await fresh.loadAndInitSentry({
      dsn: 'https://abc@sentry.io/1',
      environment: 'production',
    });
    expect(ok).toBe(false);

    vi.doUnmock('@sentry/browser');
  });

  it('renvoie false si Sentry.init throw — pas marqué initialisé', async () => {
    const initSpy = vi.fn(() => {
      throw new Error('boot fail');
    });
    vi.doMock('@sentry/browser', () => ({ init: initSpy }));

    const fresh = await import('./sentry');
    fresh.resetSentryForTests();
    const ok = await fresh.loadAndInitSentry({
      dsn: 'https://abc@sentry.io/1',
      environment: 'production',
    });
    // L'init Sentry throw → la garde transactionnelle dans `initSentry`
    // (try/catch autour de onReady) renvoie false.
    expect(ok).toBe(false);
    expect(initSpy).toHaveBeenCalledTimes(1);

    vi.doUnmock('@sentry/browser');
  });
});
