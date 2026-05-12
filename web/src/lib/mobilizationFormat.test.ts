import { describe, it, expect } from 'vitest';

import { formatMobilizationDate, formatMobilizationTime } from './mobilizationFormat';

describe('formatMobilizationDate', () => {
  it('renvoie une chaîne vide pour null/undefined', () => {
    expect(formatMobilizationDate(null)).toBe('');
    expect(formatMobilizationDate(undefined)).toBe('');
  });

  it('renvoie une chaîne vide pour une date invalide', () => {
    expect(formatMobilizationDate('not-a-date')).toBe('');
  });

  it('formate une date ISO en variante "short" par défaut', () => {
    const out = formatMobilizationDate('2026-05-12T10:00:00Z');
    expect(out).toMatch(/2026/);
    expect(out.length).toBeGreaterThan(0);
  });

  it('formate une date ISO en variante "long" avec jour de la semaine', () => {
    const out = formatMobilizationDate('2026-05-12T10:00:00Z', 'long');
    expect(out).toMatch(/2026/);
    expect(out.length).toBeGreaterThan(formatMobilizationDate('2026-05-12T10:00:00Z', 'short').length - 5);
  });
});

describe('formatMobilizationTime', () => {
  it('renvoie une chaîne vide pour null/undefined', () => {
    expect(formatMobilizationTime(null)).toBe('');
    expect(formatMobilizationTime(undefined)).toBe('');
  });

  it('renvoie une chaîne vide pour une date invalide', () => {
    expect(formatMobilizationTime('zzz')).toBe('');
  });

  it('formate une heure au format fr-FR (HH:mm)', () => {
    const out = formatMobilizationTime('2026-05-12T10:30:00Z');
    expect(out).toMatch(/\d{2}[:h ]\d{2}/);
  });
});
