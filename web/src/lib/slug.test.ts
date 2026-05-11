import { describe, it, expect } from 'vitest';

import { slugify } from '@/lib/slug';

describe('slugify', () => {
  it('normalise titres accentués et ponctuation', () => {
    expect(slugify('Stop à la fermeture de la maternité de Cherbourg !')).toBe(
      'stop-a-la-fermeture-de-la-maternite-de-cherbourg',
    );
  });

  it('réduit les espaces multiples et trim les tirets', () => {
    expect(slugify('---HELLO---  WORLD  ---')).toBe('hello-world');
  });

  it('gère majuscules et chiffres', () => {
    expect(slugify('Élections 2026')).toBe('elections-2026');
  });

  it('renvoie une chaîne vide si rien à conserver', () => {
    expect(slugify('   !!! ???   ')).toBe('');
  });
});
