// Charge k6 — 50 VUs pendant 2 minutes.
// Simule un pic de trafic (annonce médiatique / push notif) sur la liste
// pétitions + fiche détaillée. Tous les appels sont en lecture (RLS
// `is_published=true` filtre côté serveur).
//
// Exécution :
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... PETITION_SLUG=ma-petition \
//   k6 run web/load/petitions-read.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const SUPABASE_URL = __ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY;
const PETITION_SLUG = __ENV.PETITION_SLUG;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !PETITION_SLUG) {
  throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY et PETITION_SLUG sont obligatoires');
}

const listLatency = new Trend('petitions_list_duration');
const detailLatency = new Trend('petitions_detail_duration');

export const options = {
  scenarios: {
    surge: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.005'],
    'petitions_list_duration': ['p(95)<500'],
    'petitions_detail_duration': ['p(95)<300'],
  },
};

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  Accept: 'application/json',
};

export default function load() {
  const list = http.get(
    `${SUPABASE_URL}/rest/v1/petitions?select=id,slug,title,goal,signature_count&is_published=eq.true&order=created_at.desc&limit=20`,
    { headers, tags: { endpoint: 'petitions_list' } },
  );
  listLatency.add(list.timings.duration);
  check(list, { 'list 200': (r) => r.status === 200 });

  const detail = http.get(
    `${SUPABASE_URL}/rest/v1/petitions?slug=eq.${encodeURIComponent(PETITION_SLUG)}&select=id,slug,title,description,goal,signature_count`,
    { headers, tags: { endpoint: 'petitions_detail' } },
  );
  detailLatency.add(detail.timings.duration);
  check(detail, { 'detail 200': (r) => r.status === 200 });

  sleep(Math.random() * 2 + 1);
}
