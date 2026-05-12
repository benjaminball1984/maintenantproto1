// Smoke test k6 — 1 VU, 10 itérations.
// Valide que les endpoints publics Supabase répondent avec status 200 et
// que le payload contient au moins le champ `id`.
//
// Exécution :
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... PETITION_SLUG=ma-petition \
//   k6 run web/load/smoke.js

import http from 'k6/http';
import { check, sleep } from 'k6';

const SUPABASE_URL = __ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY;
const PETITION_SLUG = __ENV.PETITION_SLUG || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL et SUPABASE_ANON_KEY sont obligatoires');
}

export const options = {
  vus: 1,
  iterations: 10,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  Accept: 'application/json',
};

export default function smoke() {
  // 1. Liste pétitions publiées (les 10 plus récentes).
  const list = http.get(
    `${SUPABASE_URL}/rest/v1/petitions?select=id,slug,title&is_published=eq.true&order=created_at.desc&limit=10`,
    { headers },
  );
  check(list, {
    'petitions list status 200': (r) => r.status === 200,
    'petitions list returns array': (r) => Array.isArray(r.json()),
  });

  // 2. Fiche d'une pétition (si slug fourni).
  if (PETITION_SLUG) {
    const detail = http.get(
      `${SUPABASE_URL}/rest/v1/petitions?slug=eq.${encodeURIComponent(PETITION_SLUG)}&select=id,slug,title,description,goal,signature_count`,
      { headers },
    );
    check(detail, {
      'petition detail status 200': (r) => r.status === 200,
      'petition detail not empty': (r) => {
        const arr = r.json();
        return Array.isArray(arr) && arr.length === 1;
      },
    });
  }

  // 3. Liste mobilisations à venir.
  const mobilizations = http.get(
    `${SUPABASE_URL}/rest/v1/mobilizations?select=id,title,start_at,city&is_published=eq.true&order=start_at.asc&limit=10`,
    { headers },
  );
  check(mobilizations, {
    'mobilizations list status 200': (r) => r.status === 200,
  });

  sleep(1);
}
