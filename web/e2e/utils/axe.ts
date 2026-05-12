import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Lance un audit axe-core sur la page courante et vérifie qu'il n'y a
 * aucune violation `serious` ou `critical`. Les avertissements `minor`
 * et `moderate` ne bloquent pas le pipeline mais sont remontés dans
 * le rapport HTML pour suivi.
 */
export async function expectNoCriticalAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
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
