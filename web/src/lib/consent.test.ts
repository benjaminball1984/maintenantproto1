import { describe, it, expect, beforeEach } from 'vitest';
import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  clearConsent,
  readConsent,
  writeConsent,
} from './consent';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.has(key) ? (this.data.get(key) ?? null) : null;
  }
  key(index: number) {
    return Array.from(this.data.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

let storage: MemoryStorage;

beforeEach(() => {
  storage = new MemoryStorage();
});

describe('consent.readConsent', () => {
  it('retourne null quand rien n’est stocké', () => {
    expect(readConsent(storage)).toBeNull();
  });

  it('retourne null sur JSON invalide', () => {
    storage.setItem(CONSENT_STORAGE_KEY, 'not-json');
    expect(readConsent(storage)).toBeNull();
  });

  it('retourne null si la version ne correspond pas', () => {
    storage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: CONSENT_VERSION + 99,
        choice: 'all',
        categories: { analytics: true },
        at: new Date().toISOString(),
      }),
    );
    expect(readConsent(storage)).toBeNull();
  });

  it('retourne null si choice est inconnu', () => {
    storage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: CONSENT_VERSION,
        choice: 'bogus',
        categories: { analytics: true },
        at: new Date().toISOString(),
      }),
    );
    expect(readConsent(storage)).toBeNull();
  });

  it('retourne l’enregistrement valide', () => {
    const record = writeConsent('essential', { analytics: false }, storage);
    expect(readConsent(storage)).toEqual(record);
  });
});

describe('consent.writeConsent', () => {
  it('persiste l’enregistrement avec la version courante', () => {
    const record = writeConsent('all', { analytics: true }, storage);
    expect(record.version).toBe(CONSENT_VERSION);
    expect(record.choice).toBe('all');
    expect(record.categories).toEqual({ analytics: true });
    expect(typeof record.at).toBe('string');
    const raw = storage.getItem(CONSENT_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toEqual(record);
  });

  it('ne fait pas exploser quand le storage lève une exception', () => {
    const noop = (): void => undefined;
    const brokenStorage: Storage = {
      length: 0,
      clear: noop,
      getItem: () => null,
      key: () => null,
      removeItem: noop,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(() => writeConsent('all', { analytics: true }, brokenStorage)).not.toThrow();
  });
});

describe('consent.clearConsent', () => {
  it('supprime la clé', () => {
    writeConsent('all', { analytics: true }, storage);
    clearConsent(storage);
    expect(storage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
  });
});
