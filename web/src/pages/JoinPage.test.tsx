import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type * as MembershipModule from '@/lib/membership';

const membershipMocks = vi.hoisted(() => ({
  createFreeAdhesion: vi.fn(),
  createCheckoutSession: vi.fn(),
  getCurrentAdhesion: vi.fn(),
}));

vi.mock('@/lib/membership', async () => {
  const actual = await vi.importActual<typeof MembershipModule>('@/lib/membership');
  return {
    ...actual,
    createFreeAdhesion: membershipMocks.createFreeAdhesion,
    createCheckoutSession: membershipMocks.createCheckoutSession,
    getCurrentAdhesion: membershipMocks.getCurrentAdhesion,
  };
});

const authMocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signInWithOtp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: authMocks },
}));

import { useAuthStore } from '@/lib/auth';
import JoinPage from './JoinPage';

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u1', email: 'me@x.org', user_metadata: {} },
};

const sampleAdhesion = (tier: 'gratuit' | 'soutien' | 'engage') => ({
  id: 'a1',
  user_id: 'u1',
  tier,
  status: 'active' as const,
  amount_eur: tier === 'gratuit' ? 0 : tier === 'soutien' ? 5 : 15,
  stripe_subscription_id: tier === 'gratuit' ? null : 'sub_1',
  starts_on: '2026-01-01',
  ends_on: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
});

function renderJoin(initialEntries: string[] = ['/join']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <JoinPage />
    </MemoryRouter>,
  );
}

const originalLocation = window.location;
const assignSpy = vi.fn();

beforeEach(() => {
  membershipMocks.createFreeAdhesion.mockReset();
  membershipMocks.createCheckoutSession.mockReset();
  membershipMocks.getCurrentAdhesion.mockReset();
  membershipMocks.getCurrentAdhesion.mockResolvedValue({ data: null, error: null });

  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });

  assignSpy.mockReset();
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { ...originalLocation, assign: assignSpy },
  });
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: originalLocation,
  });
});

describe('JoinPage — rendu', () => {
  it('affiche les trois cartes d’adhésion', async () => {
    renderJoin();
    expect(
      await screen.findByRole('heading', { name: /Adhésion libre/i, level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Adhésion soutien/i, level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Adhésion engagée/i, level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Gratuit')).toBeInTheDocument();
    expect(screen.getByText('5 €')).toBeInTheDocument();
    expect(screen.getByText('15 €')).toBeInTheDocument();
  });

  it('affiche la bannière « Paiement annulé » quand ?canceled=1', async () => {
    renderJoin(['/join?canceled=1']);
    expect(await screen.findByText(/Paiement annulé/i)).toBeInTheDocument();
  });
});

describe('JoinPage — actions', () => {
  it('clic « Devenir adhérent·e » (tier gratuit) → appelle createFreeAdhesion + refresh', async () => {
    membershipMocks.createFreeAdhesion.mockResolvedValueOnce({
      data: sampleAdhesion('gratuit'),
      error: null,
    });
    renderJoin();
    const btn = await screen.findByRole('button', {
      name: /Devenir adhérent·e — formule Adhésion libre/i,
    });
    await act(async () => {
      fireEvent.click(btn);
    });
    await waitFor(() => expect(membershipMocks.createFreeAdhesion).toHaveBeenCalledWith('u1'));
    expect(await screen.findByText(/Bienvenue dans le mouvement/i)).toBeInTheDocument();
  });

  it('clic « Devenir soutien » → appelle createCheckoutSession + window.location.assign', async () => {
    membershipMocks.createCheckoutSession.mockResolvedValueOnce({
      url: 'https://checkout.stripe.com/sess_X',
      error: null,
    });
    renderJoin();
    const btn = await screen.findByRole('button', {
      name: /Devenir soutien — formule Adhésion soutien/i,
    });
    await act(async () => {
      fireEvent.click(btn);
    });
    await waitFor(() => {
      expect(membershipMocks.createCheckoutSession).toHaveBeenCalledWith('soutien');
    });
    expect(assignSpy).toHaveBeenCalledWith('https://checkout.stripe.com/sess_X');
  });

  it('si déjà adhérent·e en tier=soutien : gratuit + soutien sont lock, engage reste cliquable', async () => {
    membershipMocks.getCurrentAdhesion.mockResolvedValueOnce({
      data: sampleAdhesion('soutien'),
      error: null,
    });
    renderJoin();
    // Attendre que useAdhesion ait fini son chargement initial.
    const lockedFree = await screen.findByRole('button', {
      name: /Devenir adhérent·e — formule Adhésion libre/i,
    });
    const lockedSoutien = screen.getByRole('button', {
      name: /Devenir soutien — formule Adhésion soutien/i,
    });
    const engage = screen.getByRole('button', {
      name: /Devenir engagé·e — formule Adhésion engagée/i,
    });
    await waitFor(() => expect(lockedFree).toBeDisabled());
    expect(lockedSoutien).toBeDisabled();
    expect(engage).not.toBeDisabled();
    // Le badge « Tier actuel » apparaît sur la carte soutien.
    expect(screen.getAllByText(/Tier actuel/i).length).toBeGreaterThan(0);
  });

  it('createCheckoutSession en erreur Postgrest → affiche un message FR (pas de redirection)', async () => {
    membershipMocks.createCheckoutSession.mockResolvedValueOnce({
      url: null,
      error: {
        message: 'permission denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    renderJoin();
    const btn = await screen.findByRole('button', {
      name: /Devenir engagé·e — formule Adhésion engagée/i,
    });
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(await screen.findByText(/Vous n’avez pas les droits/i)).toBeInTheDocument();
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it('utilisateur anonyme : bandeau de connexion + clic gratuit refuse l’action', async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    renderJoin();
    expect(
      await screen.findByText(/Connectez-vous pour activer une adhésion/i),
    ).toBeInTheDocument();
    const btn = screen.getByRole('button', {
      name: /Devenir adhérent·e — formule Adhésion libre/i,
    });
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(membershipMocks.createFreeAdhesion).not.toHaveBeenCalled();
    expect(await screen.findByText(/Connectez-vous d’abord pour adhérer/i)).toBeInTheDocument();
  });
});
