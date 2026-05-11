import { describe, it, expect } from 'vitest';
import { PII_KEY_PATTERN, REDACTED, scrubEvent } from './sentry';

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
