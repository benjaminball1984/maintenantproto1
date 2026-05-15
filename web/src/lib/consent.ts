/**
 * Gestion du consentement cookies conforme CNIL (lignes directrices 2020-091).
 *
 * Catégories :
 *   - strictement nécessaires (toujours actives — session auth, CSRF) : non consenties.
 *   - mesure d'audience anonymisée (analytics) : opt-in explicite. Pas de tracking
 *     publicitaire, pas de profilage cross-site (cf. CLAUDE.md, RGPD).
 *
 * Le choix est persisté en localStorage avec un numéro de version : tout
 * changement majeur (ajout d'une catégorie) incrémente CONSENT_VERSION et
 * la bannière réapparaît automatiquement.
 */

export const CONSENT_STORAGE_KEY = 'mn:cookie-consent';
export const CONSENT_VERSION = 1;
/** Event browser-natif émis après chaque `writeConsent`/`clearConsent` (étape 43). */
export const CONSENT_CHANGED_EVENT = 'mn:consent-changed';

export type ConsentChoice = 'all' | 'essential' | 'custom';

export interface ConsentCategories {
  analytics: boolean;
}

export interface ConsentRecord {
  version: number;
  choice: ConsentChoice;
  categories: ConsentCategories;
  at: string;
}

export const DEFAULT_CATEGORIES: ConsentCategories = { analytics: false };

function isStringRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseRecord(raw: string | null): ConsentRecord | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isStringRecord(parsed)) return null;
  const version = parsed.version;
  const choice = parsed.choice;
  const categories = parsed.categories;
  const at = parsed.at;
  if (typeof version !== 'number' || version !== CONSENT_VERSION) return null;
  if (choice !== 'all' && choice !== 'essential' && choice !== 'custom') return null;
  if (!isStringRecord(categories)) return null;
  if (typeof categories.analytics !== 'boolean') return null;
  if (typeof at !== 'string') return null;
  return {
    version,
    choice,
    categories: { analytics: categories.analytics },
    at,
  };
}

export function readConsent(storage: Storage = window.localStorage): ConsentRecord | null {
  try {
    return parseRecord(storage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

function dispatchConsentChanged() {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
    }
  } catch {
    /* environnements sans `Event` (SSR, anciens jsdom) — silencieux. */
  }
}

export function writeConsent(
  choice: ConsentChoice,
  categories: ConsentCategories,
  storage: Storage = window.localStorage,
): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    choice,
    categories: { analytics: categories.analytics },
    at: new Date().toISOString(),
  };
  try {
    storage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* localStorage indisponible (mode privé Safari) — silencieux côté UI. */
  }
  dispatchConsentChanged();
  return record;
}

export function clearConsent(storage: Storage = window.localStorage): void {
  try {
    storage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* idem */
  }
  dispatchConsentChanged();
}
