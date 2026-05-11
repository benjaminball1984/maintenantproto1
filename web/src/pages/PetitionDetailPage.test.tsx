import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as PetitionsModule from '@/lib/petitions';

const petitionsMocks = vi.hoisted(() => ({
  getPetition: vi.fn(),
  hasUserSigned: vi.fn(),
  signPetition: vi.fn(),
  unsignPetition: vi.fn(),
}));

vi.mock('@/lib/petitions', async () => {
  const actual = await vi.importActual<typeof PetitionsModule>('@/lib/petitions');
  return {
    ...actual,
    getPetition: petitionsMocks.getPetition,
    hasUserSigned: petitionsMocks.hasUserSigned,
    signPetition: petitionsMocks.signPetition,
    unsignPetition: petitionsMocks.unsignPetition,
  };
});

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: authMocks },
}));

import { useAuthStore } from '@/lib/auth';
import type { PetitionRow } from '@/lib/petitions';
import PetitionDetailPage from './PetitionDetailPage';

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u1', email: 'me@x.org', user_metadata: {} },
};

const samplePetition: PetitionRow = {
  id: 'p1',
  author_id: 'u1',
  title: 'Sauvons la maternité',
  slug: 'sauvons-la-maternite',
  summary: 'Mobilisation contre la fermeture.',
  body: 'Détails de la cause.',
  target_count: 5000,
  cover_url: null,
  category: 'Santé',
  status: 'published',
  signature_count: 1234,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/petitions/sauvons-la-maternite']}>
      <Routes>
        <Route path="/petitions/:slug" element={<PetitionDetailPage />} />
        <Route path="/petitions" element={<div data-testid="listing">Listing</div>} />
        <Route path="/" element={<div data-testid="home">Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  petitionsMocks.getPetition.mockReset();
  petitionsMocks.hasUserSigned.mockReset();
  petitionsMocks.signPetition.mockReset();
  petitionsMocks.unsignPetition.mockReset();
  authMocks.getSession.mockReset();
});

describe('PetitionDetailPage', () => {
  it('rend la fiche complète avec compteur et progression', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    petitionsMocks.getPetition.mockResolvedValueOnce({ data: samplePetition, error: null });

    renderDetail();
    expect(
      await screen.findByRole('heading', { name: /Sauvons la maternité/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1\D234/)).toBeInTheDocument();
    expect(screen.getByText(/Détails de la cause/i)).toBeInTheDocument();
  });

  it('utilisateur anonyme : bouton « Se connecter pour signer » sans appel à signPetition', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    petitionsMocks.getPetition.mockResolvedValueOnce({ data: samplePetition, error: null });

    renderDetail();
    expect(
      await screen.findByRole('link', { name: /Se connecter pour signer/i }),
    ).toBeInTheDocument();
    expect(petitionsMocks.signPetition).not.toHaveBeenCalled();
  });

  it('utilisateur connecté non signataire : clic appelle signPetition et refresh', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
    useAuthStore.setState({
      status: 'authenticated',
      user: fakeSession.user as never,
      session: fakeSession as never,
    });
    petitionsMocks.getPetition
      .mockResolvedValueOnce({ data: samplePetition, error: null })
      .mockResolvedValueOnce({
        data: { ...samplePetition, signature_count: 1235 },
        error: null,
      });
    petitionsMocks.hasUserSigned
      .mockResolvedValueOnce({ signed: false, error: null })
      .mockResolvedValueOnce({ signed: true, error: null });
    petitionsMocks.signPetition.mockResolvedValueOnce({ data: { id: 's1' }, error: null });

    renderDetail();
    const btn = await screen.findByRole('button', { name: /Signer cette pétition/i });
    await act(async () => {
      fireEvent.click(btn);
    });
    await waitFor(() => expect(petitionsMocks.signPetition).toHaveBeenCalledWith('p1', 'u1'));
    expect(await screen.findByText(/1\D235/)).toBeInTheDocument();
  });

  it('utilisateur connecté signataire : clic appelle unsignPetition', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
    useAuthStore.setState({
      status: 'authenticated',
      user: fakeSession.user as never,
      session: fakeSession as never,
    });
    petitionsMocks.getPetition.mockResolvedValue({ data: samplePetition, error: null });
    petitionsMocks.hasUserSigned
      .mockResolvedValueOnce({ signed: true, error: null })
      .mockResolvedValueOnce({ signed: false, error: null });
    petitionsMocks.unsignPetition.mockResolvedValueOnce({ error: null });

    renderDetail();
    const btn = await screen.findByRole('button', { name: /Signée — retirer ma signature/i });
    await act(async () => {
      fireEvent.click(btn);
    });
    await waitFor(() => expect(petitionsMocks.unsignPetition).toHaveBeenCalledWith('p1', 'u1'));
  });

  it('redirige vers /petitions si la pétition est introuvable', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    petitionsMocks.getPetition.mockResolvedValueOnce({ data: null, error: null });

    renderDetail();
    expect(await screen.findByTestId('listing')).toBeInTheDocument();
  });
});
