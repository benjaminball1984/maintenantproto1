const KEY = 'pdp_signature_v1';

export type StoredSignature = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  postalCode: string;
  phone?: string | null;
};

export function saveSignatureLocally(s: StoredSignature) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // ignore quota / private mode
  }
}

export function loadSignatureLocally(): StoredSignature | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredSignature) : null;
  } catch {
    return null;
  }
}

export function clearSignatureLocally() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
