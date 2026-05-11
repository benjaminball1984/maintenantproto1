import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const updateChain = {
    update: vi.fn(),
    eq: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const selectChain = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const storage = {
    upload: vi.fn(),
    getPublicUrl: vi.fn(),
  };
  return { updateChain, selectChain, storage };
});

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((_table: string) => ({
      select: (...args: unknown[]) => {
        mocks.selectChain.select(...args);
        return mocks.selectChain;
      },
      update: (...args: unknown[]) => {
        mocks.updateChain.update(...args);
        return mocks.updateChain;
      },
    })),
    storage: {
      from: vi.fn((_bucket: string) => mocks.storage),
    },
  },
}));

import { AVATAR_MAX_BYTES, getProfile, updateProfile, uploadAvatar } from '@/lib/profile';
import { postgrestErrorMessage } from '@/lib/postgrestError';

const sampleRow = {
  id: 'u1',
  email: 'me@x.org',
  display_name: 'Me',
  avatar_url: null,
  bio: null,
  city: null,
  postal_code: null,
  is_admin: false,
  t99cp_balance: 0,
  badges: [],
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
};

beforeEach(() => {
  vi.clearAllMocks();
  // chain getProfile : .from(...).select('*').eq('id', x).maybeSingle()
  mocks.selectChain.select.mockReturnValue(mocks.selectChain);
  mocks.selectChain.eq.mockReturnValue(mocks.selectChain);
  // chain updateProfile : .from(...).update(patch).eq('id', x).select('*').maybeSingle()
  mocks.updateChain.update.mockReturnValue(mocks.updateChain);
  mocks.updateChain.eq.mockReturnValue(mocks.updateChain);
  mocks.updateChain.select.mockReturnValue(mocks.updateChain);
});

describe('getProfile', () => {
  it('renvoie la ligne users quand elle existe', async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: sampleRow, error: null });
    const { data, error } = await getProfile('u1');
    expect(error).toBeNull();
    expect(data?.email).toBe('me@x.org');
    expect(mocks.selectChain.select).toHaveBeenCalledWith('*');
    expect(mocks.selectChain.eq).toHaveBeenCalledWith('id', 'u1');
  });

  it("renvoie data: null sans erreur quand la ligne n'existe pas encore", async () => {
    mocks.selectChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const { data, error } = await getProfile('missing');
    expect(data).toBeNull();
    expect(error).toBeNull();
  });
});

describe('updateProfile', () => {
  it('applique le patch et renvoie la ligne mise à jour', async () => {
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({
      data: { ...sampleRow, display_name: 'New' },
      error: null,
    });
    const { data, error } = await updateProfile('u1', { display_name: 'New' });
    expect(error).toBeNull();
    expect(data?.display_name).toBe('New');
    expect(mocks.updateChain.update).toHaveBeenCalledWith({ display_name: 'New' });
    expect(mocks.updateChain.eq).toHaveBeenCalledWith('id', 'u1');
  });

  it('remonte l’erreur RLS (42501) et le mapper la traduit en FR', async () => {
    const pgError = {
      message: 'permission denied',
      details: '',
      hint: '',
      code: '42501',
      name: 'PostgrestError',
    };
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({ data: null, error: pgError });
    const { error } = await updateProfile('u1', { display_name: 'X' });
    expect(error?.code).toBe('42501');
    expect(postgrestErrorMessage(error)).toBe(
      'Vous n’avez pas les droits pour effectuer cette action.',
    );
  });

  it('remonte l’erreur unique violation (23505) traduite', async () => {
    const pgError = {
      message: 'duplicate key',
      details: '',
      hint: '',
      code: '23505',
      name: 'PostgrestError',
    };
    mocks.updateChain.maybeSingle.mockResolvedValueOnce({ data: null, error: pgError });
    const { error } = await updateProfile('u1', { display_name: 'X' });
    expect(postgrestErrorMessage(error)).toBe(
      'Cette valeur est déjà utilisée par un autre compte.',
    );
  });
});

function makeFile(name: string, type: string, sizeBytes: number): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], name, { type });
}

describe('uploadAvatar', () => {
  it('rejette les types MIME non autorisés', async () => {
    const file = makeFile('avatar.pdf', 'application/pdf', 1024);
    const { data, error } = await uploadAvatar('u1', file);
    expect(data).toBeNull();
    expect(error?.code).toBe('AVATAR_INVALID_TYPE');
    expect(postgrestErrorMessage(error)).toMatch(/Format invalide/);
  });

  it('rejette les fichiers > 2 Mo', async () => {
    const file = makeFile('big.jpg', 'image/jpeg', AVATAR_MAX_BYTES + 1);
    const { data, error } = await uploadAvatar('u1', file);
    expect(data).toBeNull();
    expect(error?.code).toBe('AVATAR_TOO_LARGE');
    expect(postgrestErrorMessage(error)).toMatch(/2 Mo/);
  });

  it('upload réussi : path sous <user_id>/ et publicUrl renvoyé', async () => {
    mocks.storage.upload.mockResolvedValueOnce({ data: { path: 'u1/x.jpg' }, error: null });
    mocks.storage.getPublicUrl.mockReturnValueOnce({
      data: { publicUrl: 'https://cdn/u1/x.jpg' },
    });
    const file = makeFile('me.jpg', 'image/jpeg', 1024);
    const { data, error } = await uploadAvatar('u1', file);
    expect(error).toBeNull();
    expect(data?.publicUrl).toBe('https://cdn/u1/x.jpg');
    expect(data?.path.startsWith('u1/avatar-')).toBe(true);
    expect(mocks.storage.upload).toHaveBeenCalledTimes(1);
  });

  it("remonte l'erreur du Storage en PostgrestError mappable", async () => {
    mocks.storage.upload.mockResolvedValueOnce({
      data: null,
      error: { name: 'StorageError', message: 'denied' },
    });
    const file = makeFile('me.png', 'image/png', 1024);
    const { data, error } = await uploadAvatar('u1', file);
    expect(data).toBeNull();
    expect(error?.code).toBe('42501');
    expect(postgrestErrorMessage(error)).toBe(
      'Vous n’avez pas les droits pour effectuer cette action.',
    );
  });
});
