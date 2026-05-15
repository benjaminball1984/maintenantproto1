import { describe, expect, it, beforeAll } from 'vitest';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Étape 43 — audit beta-testeur F2 : balises SEO/OG/favicon ajoutées à
// `web/index.html` pour rendre les partages sociaux exploitables. Test
// runtime sur le fichier source — pas de jsdom requis, on lit le HTML
// pour confirmer la présence des meta clés.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const indexHtmlPath = resolve(repoRoot, 'index.html');

describe('web/index.html — SEO / OG / favicon (étape 43, F2)', () => {
  let html: string;

  beforeAll(async () => {
    html = await readFile(indexHtmlPath, 'utf8');
  });

  it('contient une <meta name="description"> non vide', () => {
    expect(html).toMatch(/<meta\s+name="description"\s+content="[^"]{40,}"/);
  });

  it('contient le bloc Open Graph (og:title + og:description + og:image + og:url + og:type)', () => {
    expect(html).toMatch(/property="og:title"/);
    expect(html).toMatch(/property="og:description"/);
    expect(html).toMatch(/property="og:image"/);
    expect(html).toMatch(/property="og:url"/);
    expect(html).toMatch(/property="og:type"\s+content="website"/);
  });

  it('contient une carte Twitter `summary_large_image`', () => {
    expect(html).toMatch(/name="twitter:card"\s+content="summary_large_image"/);
  });

  it('contient le favicon SVG et le theme-color', () => {
    expect(html).toMatch(/<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="\/favicon\.svg"/);
    expect(html).toMatch(/<meta\s+name="theme-color"\s+content="#e11d74"/);
  });

  it('contient un title descriptif (pas juste « Maintenant ! »)', () => {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    expect(titleMatch).not.toBeNull();
    expect(titleMatch?.[1]?.length ?? 0).toBeGreaterThan(15);
  });
});
