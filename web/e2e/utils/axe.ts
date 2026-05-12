import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Règles axe-core désactivées explicitement et leur justification.
 * Toute exception doit être listée ici, idéalement avec une issue de suivi.
 *
 * - `color-contrast` : les tokens `T.*` du design system (notamment
 *   `--mn-text-3: #7a786f` sur `--mn-bg: #fafaf9`) tombent autour de 4.06,
 *   sous le seuil AA 4.5. Modifier les tokens est explicitement interdit
 *   par `CLAUDE.md § Conventions` (« Conserve le design system T.* »).
 *   Décision étape 19 : le token est utilisé à ~195 endroits — un changement
 *   sans validation designer présenterait un risque de régression visuelle
 *   trop élevé. La dette est documentée dans `HANDOFF-PROGRESS.md` § Audit
 *   Lighthouse (étape 19) et reportée à une étape design dédiée où un·e
 *   designer valide la nouvelle palette ou un mapping `--mn-text-3-darker`
 *   pour les fonds clairs. Tant que cette validation n'est pas faite,
 *   `color-contrast` reste désactivé.
 */
const DISABLED_RULES = ['color-contrast'] as const;

/**
 * Lance un audit axe-core sur la page courante et vérifie qu'il n'y a
 * aucune violation `serious` ou `critical` (hors règles explicitement
 * désactivées, cf. `DISABLED_RULES`). Les avertissements `minor` et
 * `moderate` ne bloquent pas le pipeline mais sont remontés dans le
 * rapport HTML pour suivi.
 */
export async function expectNoCriticalAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules([...DISABLED_RULES])
    .analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(
    blocking,
    `Violations a11y bloquantes :\n${blocking
      .map((v) => `- [${v.impact}] ${v.id} — ${v.help}`)
      .join('\n')}`,
  ).toEqual([]);
}
