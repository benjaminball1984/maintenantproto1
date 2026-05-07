/**
 * Lit data/raw/cantines_scolaires_FR.csv (établissements ayant une cantine)
 * et produit public/data/etablissements.min.json — minimal pour autocomplétion.
 *
 * Champs gardés : uai, n (nom), t (type), s (status), cp (code postal), c (ville),
 *                 d (département), lat, lng.
 * Clés courtes pour minimiser la taille (gain ~25%).
 *
 * Lancement : `npm run build:establishments`
 */
import { readFileSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Papa from 'papaparse';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const SRC = resolve(root, 'data/raw/cantines_scolaires_FR.csv');
const OUT = resolve(root, 'public/data/etablissements.min.json');

type Row = {
  uai: string;
  nom_etablissement: string;
  type_etablissement: string;
  niveau_scolaire: string;
  statut_public_prive: string;
  code_postal: string;
  nom_commune: string;
  libelle_departement: string;
  code_departement: string;
  a_cantine: string;
  latitude: string;
  longitude: string;
};

// Format compact : tableau de tuples [uai, nom, type, statut, cp, ville, codeDept, lat, lng]
// type: 0=autre, 1=école, 2=collège, 3=lycée
// statut: 0=inconnu, 1=public, 2=privé
type Tuple = [string, string, number, number, string, string, string, number, number];

console.log(`[build-establishments] reading ${SRC}…`);
const csv = readFileSync(SRC, 'utf8');
const parsed = Papa.parse<Row>(csv, { header: true, skipEmptyLines: true });

if (parsed.errors.length) {
  console.warn(`[build-establishments] ${parsed.errors.length} parse warning(s)`);
}

const out: Tuple[] = [];
let skippedNoCanteen = 0;
let skippedNoGeo = 0;

for (const row of parsed.data) {
  if (!row.uai) continue;
  if ((row.a_cantine ?? '').toLowerCase() !== 'true') {
    skippedNoCanteen++;
    continue;
  }
  const lat = Number.parseFloat(row.latitude);
  const lng = Number.parseFloat(row.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    skippedNoGeo++;
    continue;
  }

  const typeRaw = (row.type_etablissement ?? '').toLowerCase();
  let t = 0;
  if (typeRaw.includes('ecole')) t = 1;
  else if (typeRaw.includes('coll')) t = 2;
  else if (typeRaw.includes('lyc')) t = 3;

  const s = row.statut_public_prive === 'Public' ? 1 : row.statut_public_prive === 'Privé' ? 2 : 0;

  out.push([
    row.uai,
    (row.nom_etablissement ?? '').trim(),
    t,
    s,
    row.code_postal,
    (row.nom_commune ?? '').trim(),
    row.code_departement ?? '',
    Number(lat.toFixed(5)),
    Number(lng.toFixed(5)),
  ]);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out));

const sizeMB = (statSync(OUT).size / 1024 / 1024).toFixed(2);
console.log(
  `[build-establishments] ${out.length.toLocaleString('fr-FR')} entries written → ${OUT} (${sizeMB} MB)`,
);
console.log(
  `[build-establishments] skipped: ${skippedNoCanteen} sans cantine, ${skippedNoGeo} sans géoloc`,
);
