/// <reference types="node" />
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

// =====================================================================================
// H4-deploy (étape 24) — deploy-time integrity check pour stripe-webhook.
//
// Contexte (dette ajoutée janitor post-step 23) : le bootstrap Deno
// `supabase/functions/stripe-webhook/index.ts` importe le handler via
// `./handler.ts`, qui est lui-même un re-export `export *` vers
// `../../../web/src/lib/stripeWebhookHandler.ts` (canonique depuis l'étape 23,
// dette H2-arch clôturée).
//
// Risque : si quelqu'un déplace / renomme / supprime
// `web/src/lib/stripeWebhookHandler.ts` ou modifie le chemin relatif dans le
// re-export, les checks vitest restent verts (ils importent intra-package)
// mais `supabase functions deploy` casse silencieusement et on déploie une
// version stale (ou pas du tout). Aucun job CI ne valide actuellement le
// chemin de bundling.
//
// Ce test pallie la dette sans nouvelle dépendance / outillage CI :
//   1. Vérifie que `supabase/functions/stripe-webhook/handler.ts` existe.
//   2. Vérifie qu'il contient bien un `export *` (pas de divergence
//      accidentelle vers une duplication).
//   3. Extrait le chemin relatif cible, le résout depuis le répertoire du
//      fichier, et vérifie que le fichier cible existe ET correspond bien à
//      `web/src/lib/stripeWebhookHandler.ts`.
//   4. Smoke check sur le contenu de la cible : présence de la fonction
//      `handle` exportée (le contrat public que le bootstrap Deno consomme).
//
// Cette logique ne remplace pas un vrai `supabase functions deploy --dry-run`
// (qui validerait aussi la résolution Deno des imports `esm.sh`), mais elle
// attrape la régression la plus probable (déplacement du handler canonique).
// =====================================================================================

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const supabaseHandlerPath = resolve(
  repoRoot,
  'supabase',
  'functions',
  'stripe-webhook',
  'handler.ts',
);
const expectedCanonicalPath = resolve(repoRoot, 'web', 'src', 'lib', 'stripeWebhookHandler.ts');

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

describe('stripe-webhook deploy integrity (H4-deploy)', () => {
  it('le thin re-export Deno existe', async () => {
    expect(await fileExists(supabaseHandlerPath)).toBe(true);
  });

  it('contient bien un export * (pas de duplication de handler)', async () => {
    const content = await readFile(supabaseHandlerPath, 'utf8');
    // Tolère les espaces multiples et une éventuelle clause `type` ou destructuration.
    expect(content).toMatch(/export\s+\*\s+from\s+['"][^'"]+['"]/);
  });

  it('le chemin relatif résolu pointe sur web/src/lib/stripeWebhookHandler.ts', async () => {
    const content = await readFile(supabaseHandlerPath, 'utf8');
    const match = content.match(/export\s+\*\s+from\s+['"]([^'"]+)['"]/);
    expect(match).not.toBeNull();
    const relativePath = match![1]!;
    const resolved = resolve(dirname(supabaseHandlerPath), relativePath);
    expect(resolved).toBe(expectedCanonicalPath);
    expect(await fileExists(resolved)).toBe(true);
  });

  it('le handler canonique expose toujours `handle` (contrat public)', async () => {
    const content = await readFile(expectedCanonicalPath, 'utf8');
    expect(content).toMatch(/export\s+async\s+function\s+handle\s*\(/);
  });
});
