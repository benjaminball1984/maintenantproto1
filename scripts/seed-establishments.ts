/**
 * Seed la table Supabase `establishments` avec le CSV cantines_scolaires_FR.csv.
 *
 * Prérequis :
 *  - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY dans l'environnement (depuis .env)
 *  - data/raw/cantines_scolaires_FR.csv présent
 *  - Migration 0001_init.sql exécutée
 *
 * Lancement :
 *   export SUPABASE_URL=...
 *   export SUPABASE_SERVICE_ROLE_KEY=...
 *   npm run seed:establishments
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const SRC = resolve(root, 'data/raw/cantines_scolaires_FR.csv');
const BATCH = 1000;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

type Row = {
  uai: string;
  nom_etablissement: string;
  type_etablissement: string;
  niveau_scolaire: string;
  statut_public_prive: string;
  adresse_1: string;
  adresse_2: string;
  adresse_3: string;
  code_postal: string;
  nom_commune: string;
  code_commune: string;
  libelle_departement: string;
  code_departement: string;
  libelle_region: string;
  code_region: string;
  a_cantine: string;
  latitude: string;
  longitude: string;
};

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const csv = readFileSync(SRC, 'utf8');
const parsed = Papa.parse<Row>(csv, { header: true, skipEmptyLines: true });
console.log(`[seed] ${parsed.data.length} rows parsed`);

const records = parsed.data
  .filter((r) => r.uai)
  .map((r) => ({
    uai: r.uai,
    name: (r.nom_etablissement ?? '').trim(),
    type: r.type_etablissement || null,
    level: r.niveau_scolaire || null,
    status: r.statut_public_prive || null,
    address: [r.adresse_1, r.adresse_2].filter(Boolean).join(', ').trim() || null,
    postal_code: r.code_postal || null,
    city: r.nom_commune || null,
    department_code: r.code_departement || null,
    department_name: r.libelle_departement || null,
    region_code: r.code_region || null,
    region_name: r.libelle_region || null,
    has_canteen: (r.a_cantine ?? '').toLowerCase() === 'true',
    latitude: Number.parseFloat(r.latitude) || null,
    longitude: Number.parseFloat(r.longitude) || null,
  }));

console.log(`[seed] ${records.length} valid records to upsert`);

let done = 0;
for (let i = 0; i < records.length; i += BATCH) {
  const batch = records.slice(i, i + BATCH);
  const { error } = await sb.from('establishments').upsert(batch, { onConflict: 'uai' });
  if (error) {
    console.error(`[seed] batch ${i}-${i + batch.length} failed`, error.message);
    process.exit(1);
  }
  done += batch.length;
  console.log(
    `[seed] ${done.toLocaleString('fr-FR')} / ${records.length.toLocaleString('fr-FR')}`,
  );
}

console.log('[seed] done');
