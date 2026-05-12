import { describe, it, expect } from 'vitest';
import type { PostgrestError } from '@supabase/supabase-js';

import { postgrestErrorMessage } from './postgrestError';

function err(partial: Partial<PostgrestError>): PostgrestError {
  return {
    name: 'PostgrestError',
    message: '',
    details: '',
    hint: '',
    code: '',
    ...partial,
  } as PostgrestError;
}

describe('postgrestErrorMessage', () => {
  it('renvoie null pour une erreur null', () => {
    expect(postgrestErrorMessage(null)).toBeNull();
  });

  it('mappe 23505 (unique violation) sur un message FR', () => {
    expect(postgrestErrorMessage(err({ code: '23505' }))).toContain('déjà utilisée');
  });

  it('mappe 23503 (foreign key violation)', () => {
    expect(postgrestErrorMessage(err({ code: '23503' }))).toContain('Référence invalide');
  });

  it('mappe 23502 (not null violation)', () => {
    expect(postgrestErrorMessage(err({ code: '23502' }))).toContain('obligatoire');
  });

  it('mappe 23514 (check violation)', () => {
    expect(postgrestErrorMessage(err({ code: '23514' }))).toContain('contraintes');
  });

  it('mappe 22001 (string truncation)', () => {
    expect(postgrestErrorMessage(err({ code: '22001' }))).toContain('longueur');
  });

  it('mappe 22P02 (invalid text representation)', () => {
    expect(postgrestErrorMessage(err({ code: '22P02' }))).toContain('Format');
  });

  it('mappe 42501 (insufficient privilege)', () => {
    expect(postgrestErrorMessage(err({ code: '42501' }))).toContain('droits');
  });

  it('mappe PGRST116 (no rows)', () => {
    expect(postgrestErrorMessage(err({ code: 'PGRST116' }))).toContain('Aucun résultat');
  });

  it('mappe PGRST301 (jwt expired)', () => {
    expect(postgrestErrorMessage(err({ code: 'PGRST301' }))).toContain('session');
  });

  it('mappe PGRST204 (no update)', () => {
    expect(postgrestErrorMessage(err({ code: 'PGRST204' }))).toContain('mise à jour');
  });

  it('retombe sur error.message si le code est inconnu', () => {
    expect(postgrestErrorMessage(err({ code: 'XXXXX', message: 'boom' }))).toBe('boom');
  });

  it('retombe sur un message générique si code et message sont vides', () => {
    expect(postgrestErrorMessage(err({}))).toMatch(/erreur/i);
  });
});
