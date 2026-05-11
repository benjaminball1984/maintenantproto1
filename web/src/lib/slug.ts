/**
 * Génère un slug stable à partir d'un titre. Reproduit en TS la fonction SQL
 * `public.slugify(text)` (cf. `db/schema.sql` §4.c) pour pouvoir l'utiliser
 * côté front sans round-trip réseau — la vérification d'unicité (avec retry
 * en cas de collision sur la contrainte UNIQUE) reste portée par Postgres.
 *
 * Règles : lower(unaccent simulé) → enlever tout sauf `[a-z0-9-]` →
 * collapse `--` → trim « - ». Pas de dépendance à l'extension `unaccent`
 * pour rester compatible avec une DB Supabase fraîche.
 */
export function slugify(input: string): string {
  const accents = 'àâäáãåçèéêëìîïíòôöóõùûüúýÿñÀÂÄÁÃÅÇÈÉÊËÌÎÏÍÒÔÖÓÕÙÛÜÚÝŸÑ';
  const plain = 'aaaaaaceeeeiiiioooooouuuuyynaaaaaaceeeeiiiioooooouuuuyyn';
  let out = '';
  for (const ch of input.toLowerCase()) {
    const idx = accents.indexOf(ch);
    out += idx >= 0 ? plain[idx] : ch;
  }
  return out
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}
