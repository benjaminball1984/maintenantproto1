/**
 * Lazy-load + recherche dans public/data/etablissements.min.json.
 * Format compact : tableau de tuples [uai, nom, type, statut, cp, ville, codeDept, lat, lng]
 *   type   : 0=autre, 1=école, 2=collège, 3=lycée
 *   statut : 0=inconnu, 1=public, 2=privé
 */

export type EstablishmentTuple = [
  string, // 0 uai
  string, // 1 nom
  number, // 2 type
  number, // 3 statut
  string, // 4 code postal
  string, // 5 ville
  string, // 6 code département
  number, // 7 latitude
  number, // 8 longitude
];

export type Establishment = {
  uai: string;
  name: string;
  type: 'autre' | 'ecole' | 'college' | 'lycee';
  status: 'public' | 'prive' | 'inconnu';
  postalCode: string;
  city: string;
  departmentCode: string;
  latitude: number;
  longitude: number;
};

const TYPE_MAP = ['autre', 'ecole', 'college', 'lycee'] as const;
const STATUS_MAP = ['inconnu', 'public', 'prive'] as const;

let cache: EstablishmentTuple[] | null = null;
let loadingPromise: Promise<EstablishmentTuple[]> | null = null;

export async function loadEstablishments(): Promise<EstablishmentTuple[]> {
  if (cache) return cache;
  if (!loadingPromise) {
    loadingPromise = fetch('/data/etablissements.min.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<EstablishmentTuple[]>;
      })
      .then((data) => {
        cache = data;
        return data;
      })
      .catch((err) => {
        loadingPromise = null;
        throw err;
      });
  }
  return loadingPromise;
}

export function tupleToEstablishment(t: EstablishmentTuple): Establishment {
  return {
    uai: t[0],
    name: t[1],
    type: TYPE_MAP[t[2]] ?? 'autre',
    status: STATUS_MAP[t[3]] ?? 'inconnu',
    postalCode: t[4],
    city: t[5],
    departmentCode: t[6],
    latitude: t[7],
    longitude: t[8],
  };
}

const WORD_RE = /[^a-z0-9]+/g;

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(WORD_RE, ' ')
    .trim();
}

export function searchEstablishments(
  data: EstablishmentTuple[],
  query: string,
  limit = 12,
): Establishment[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const tokens = q.split(' ').filter(Boolean);
  if (tokens.length === 0) return [];

  const results: { e: EstablishmentTuple; score: number }[] = [];

  for (const t of data) {
    const haystack = normalize(`${t[1]} ${t[4]} ${t[5]}`);
    let score = 0;
    let allMatch = true;
    for (const tok of tokens) {
      if (haystack.includes(tok)) {
        score += tok.length;
        if (haystack.startsWith(tok)) score += 5;
      } else {
        allMatch = false;
        break;
      }
    }
    if (allMatch) {
      results.push({ e: t, score });
      if (results.length > limit * 4) {
        // tri partiel régulier pour limiter la mémoire
        results.sort((a, b) => b.score - a.score);
        results.length = limit * 2;
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map(({ e }) => tupleToEstablishment(e));
}

export const ESTABLISHMENT_TYPE_LABEL: Record<Establishment['type'], string> = {
  ecole: 'École',
  college: 'Collège',
  lycee: 'Lycée',
  autre: 'Autre',
};
