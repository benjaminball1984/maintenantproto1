#!/usr/bin/env node
// =====================================================================================
// gen-types.mjs — Génère web/src/types/database.ts depuis le schéma Postgres local.
//
// Pourquoi pas `supabase gen types typescript --local` ? Le CLI Supabase exige
// que le démon Docker tourne (il monte une image pg_meta). Dans la sandbox CI
// Docker n'est pas disponible ; ce script interroge pg_catalog en direct via
// `psql -At` et reconstruit le type `Database` au format attendu par
// `@supabase/supabase-js`.
//
// Usage : node db/gen-types.mjs --url postgres://... > web/src/types/database.ts
// Par défaut : postgres://maintenant:dev@localhost:5432/maintenant
// =====================================================================================
import { execFileSync } from 'node:child_process';
import process from 'node:process';

const argv = process.argv.slice(2);
const urlFlagIdx = argv.indexOf('--url');
const dbUrl = urlFlagIdx >= 0 ? argv[urlFlagIdx + 1] : 'postgres://maintenant:dev@localhost:5432/maintenant';

/**
 * Exécute une requête psql en mode tuples-only et renvoie un tableau de lignes
 * où chaque ligne est un tableau de colonnes (séparateur '\t').
 */
function psql(sql) {
  const out = execFileSync('psql', [dbUrl, '-At', '-F', '\t', '-c', sql], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  return out
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => line.split('\t'));
}

// Mapping PG → TS. Les enums sont inlinés en union de littéraux pour rester
// auto-suffisants (pas de référence avant déclaration).
function tsTypeFromPg(pgType, enumNames, enumValues) {
  if (enumNames.has(pgType)) {
    const values = enumValues.get(pgType);
    return values.map((v) => JSON.stringify(v)).join(' | ');
  }
  const base = pgType.replace(/\(.*\)$/, '').toLowerCase();
  switch (base) {
    case 'uuid':
    case 'text':
    case 'citext':
    case 'character varying':
    case 'character':
    case 'timestamp with time zone':
    case 'timestamp without time zone':
    case 'date':
    case 'time':
    case 'time without time zone':
    case 'inet':
    case 'cidr':
      return 'string';
    case 'smallint':
    case 'integer':
    case 'bigint':
    case 'real':
    case 'double precision':
    case 'numeric':
    case 'decimal':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'json':
    case 'jsonb':
      return 'Json';
    default:
      // tableaux text[], uuid[]…
      if (pgType.endsWith('[]')) {
        const inner = tsTypeFromPg(pgType.slice(0, -2), enumNames, enumValues);
        return `${inner}[]`;
      }
      return 'unknown';
  }
}

// 1. Enums --------------------------------------------------------------------
const enumRows = psql(`
  select t.typname, e.enumlabel
  from pg_type t
  join pg_enum e on e.enumtypid = t.oid
  where t.typnamespace = 'public'::regnamespace
  order by t.typname, e.enumsortorder;
`);

const enums = new Map();
for (const [name, label] of enumRows) {
  if (!enums.has(name)) enums.set(name, []);
  enums.get(name).push(label);
}
const enumNames = new Set(enums.keys());

// 2. Tables + colonnes --------------------------------------------------------
const colRows = psql(`
  select
    c.relname,
    a.attname,
    format_type(a.atttypid, a.atttypmod),
    case when a.attnotnull then '1' else '0' end,
    case when pg_get_expr(d.adbin, d.adrelid) is null then '0' else '1' end
  from pg_class c
  join pg_attribute a on a.attrelid = c.oid
  left join pg_attrdef d on d.adrelid = c.oid and d.adnum = a.attnum
  where c.relkind = 'r'
    and a.attnum > 0
    and not a.attisdropped
    and c.relnamespace = 'public'::regnamespace
  order by c.relname, a.attnum;
`);

const tables = new Map();
for (const [tbl, col, pgType, notNull, hasDefault] of colRows) {
  if (!tables.has(tbl)) tables.set(tbl, []);
  tables.get(tbl).push({
    name: col,
    pgType,
    tsType: tsTypeFromPg(pgType, enumNames, enums),
    notNull: notNull === '1',
    hasDefault: hasDefault === '1',
  });
}

// 3. Foreign keys -------------------------------------------------------------
const fkRows = psql(`
  select
    con.conname,
    src.relname,
    src_a.attname,
    tgt.relname,
    tgt_a.attname
  from pg_constraint con
  join pg_class src on src.oid = con.conrelid
  join pg_class tgt on tgt.oid = con.confrelid
  join pg_attribute src_a on src_a.attrelid = con.conrelid and src_a.attnum = any(con.conkey)
  join pg_attribute tgt_a on tgt_a.attrelid = con.confrelid and tgt_a.attnum = any(con.confkey)
  where con.contype = 'f'
    and src.relnamespace = 'public'::regnamespace
  order by src.relname, con.conname;
`);

const fks = new Map();
for (const [name, srcTbl, srcCol, tgtTbl, tgtCol] of fkRows) {
  if (!fks.has(srcTbl)) fks.set(srcTbl, []);
  fks.get(srcTbl).push({ name, srcCol, tgtTbl, tgtCol });
}

// 4. Render --------------------------------------------------------------------
function escapeIdent(name) {
  return /^[a-z_][a-z0-9_]*$/i.test(name) ? name : JSON.stringify(name);
}

function quoteEnum(values) {
  return values.map((v) => JSON.stringify(v)).join(' | ');
}

function renderRow(cols) {
  return cols
    .map((c) => {
      const optional = c.notNull ? '' : ' | null';
      return `          ${escapeIdent(c.name)}: ${c.tsType}${optional};`;
    })
    .join('\n');
}

function renderInsert(cols) {
  return cols
    .map((c) => {
      const optional = !c.notNull || c.hasDefault ? '?' : '';
      const nullable = c.notNull ? '' : ' | null';
      return `          ${escapeIdent(c.name)}${optional}: ${c.tsType}${nullable};`;
    })
    .join('\n');
}

function renderUpdate(cols) {
  return cols
    .map((c) => {
      const nullable = c.notNull ? '' : ' | null';
      return `          ${escapeIdent(c.name)}?: ${c.tsType}${nullable};`;
    })
    .join('\n');
}

function renderRelationships(tableName) {
  const list = fks.get(tableName) ?? [];
  if (list.length === 0) return '        Relationships: [];';
  const items = list
    .map(
      (fk) =>
        `          {\n` +
        `            foreignKeyName: ${JSON.stringify(fk.name)};\n` +
        `            columns: [${JSON.stringify(fk.srcCol)}];\n` +
        `            isOneToOne: false;\n` +
        `            referencedRelation: ${JSON.stringify(fk.tgtTbl)};\n` +
        `            referencedColumns: [${JSON.stringify(fk.tgtCol)}];\n` +
        `          }`,
    )
    .join(',\n');
  return `        Relationships: [\n${items},\n        ];`;
}

const tableNames = [...tables.keys()].sort();
const enumOrdered = [...enums.entries()].sort(([a], [b]) => a.localeCompare(b));

const lines = [];
lines.push('// =====================================================================================');
lines.push('// AUTO-GENERATED — do not edit manually.');
lines.push('// Source : db/schema.sql appliqué à un Postgres local, introspection via db/gen-types.mjs.');
lines.push('// Compatible avec `import type { Database } from \'@/types/database\'` côté front.');
lines.push('// Régénérer après chaque migration : `node db/gen-types.mjs > web/src/types/database.ts`.');
lines.push('// =====================================================================================');
lines.push('');
lines.push('export type Json =');
lines.push('  | string');
lines.push('  | number');
lines.push('  | boolean');
lines.push('  | null');
lines.push('  | { [key: string]: Json | undefined }');
lines.push('  | Json[];');
lines.push('');
lines.push('export interface Database {');
lines.push('  public: {');
lines.push('    Tables: {');

for (const tbl of tableNames) {
  const cols = tables.get(tbl);
  lines.push(`      ${escapeIdent(tbl)}: {`);
  lines.push('        Row: {');
  lines.push(renderRow(cols));
  lines.push('        };');
  lines.push('        Insert: {');
  lines.push(renderInsert(cols));
  lines.push('        };');
  lines.push('        Update: {');
  lines.push(renderUpdate(cols));
  lines.push('        };');
  lines.push(renderRelationships(tbl));
  lines.push('      };');
}

lines.push('    };');
lines.push('    Views: Record<string, never>;');
lines.push('    Functions: {');
lines.push('      is_admin: {');
lines.push('        Args: { uid: string };');
lines.push('        Returns: boolean;');
lines.push('      };');
lines.push('    };');
lines.push('    Enums: {');
for (const [name, values] of enumOrdered) {
  lines.push(`      ${escapeIdent(name)}: ${quoteEnum(values)};`);
}
lines.push('    };');
lines.push('    CompositeTypes: Record<string, never>;');
lines.push('  };');
lines.push('}');
lines.push('');
lines.push('export type Tables<T extends keyof Database[\'public\'][\'Tables\']> =');
lines.push('  Database[\'public\'][\'Tables\'][T][\'Row\'];');
lines.push('export type TablesInsert<T extends keyof Database[\'public\'][\'Tables\']> =');
lines.push('  Database[\'public\'][\'Tables\'][T][\'Insert\'];');
lines.push('export type TablesUpdate<T extends keyof Database[\'public\'][\'Tables\']> =');
lines.push('  Database[\'public\'][\'Tables\'][T][\'Update\'];');
lines.push('export type Enums<T extends keyof Database[\'public\'][\'Enums\']> =');
lines.push('  Database[\'public\'][\'Enums\'][T];');
lines.push('');

process.stdout.write(lines.join('\n'));
