import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/components/Toast';
import type * as MessagingModule from '@/lib/messaging';

const messagingMocks = vi.hoisted(() => ({
  getOrCreateConversationWith: vi.fn(),
}));

vi.mock('@/lib/messaging', async () => {
  const actual = await vi.importActual<typeof MessagingModule>('@/lib/messaging');
  return {
    ...actual,
    getOrCreateConversationWith: messagingMocks.getOrCreateConversationWith,
  };
});

const authSupabaseMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: authSupabaseMocks },
}));

import { useAuthStore } from '@/lib/auth';
import ContactAuthorButton from './ContactAuthorButton';

function LocationProbe() {
  const loc = useLocation();
  return (
    <div data-testid="loc" data-pathname={loc.pathname} data-search={loc.search} />
  );
}

function renderButton(authorUserId = 'author1') {
  return render(
    <MemoryRouter initialEntries={['/services/carpooling/c1']}>
      <ToastProvider>
        <Routes>
          <Route
            path="/services/carpooling/:id"
            element={
              <>
                <ContactAuthorButton authorUserId={authorUserId} />
                <LocationProbe />
              </>
            }
          />
          <Route
            path="/messaging/:conversationId"
            element={
              <>
                <div data-testid="messaging-page">Messaging</div>
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  messagingMocks.getOrCreateConversationWith.mockReset();
  authSupabaseMocks.getSession.mockReset();
  authSupabaseMocks.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  });
  useAuthStore.setState({ status: 'anonymous', user: null, session: null });
});

describe('ContactAuthorButton', () => {
  it('rend la variante anonyme avec redirection ?auth=login si non authentifié·e', async () => {
    renderButton();
    const btn = await screen.findByRole('button', {
      name: /Se connecter pour contacter/i,
    });
    expect(btn).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(btn);
    });
    const probe = screen.getByTestId('loc');
    expect(probe.dataset.search).toContain('auth=login');
  });

  it('ne rend rien si l’utilisateur·rice courant·e est l’auteur·ice', () => {
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'author1' } as never,
      session: null,
    });
    renderButton('author1');
    expect(screen.queryByRole('button', { name: /Contacter/i })).not.toBeInTheDocument();
  });

  it('au clic, ouvre la conversation et redirige vers /messaging/:id', async () => {
    authSupabaseMocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1' }, access_token: 'tok' } },
      error: null,
    });
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'u1' } as never,
      session: null,
    });
    messagingMocks.getOrCreateConversationWith.mockResolvedValueOnce({
      data: { id: 'conv42' },
      error: null,
    });
    renderButton('author1');
    const btn = await screen.findByRole('button', { name: /^Contacter/i });
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(messagingMocks.getOrCreateConversationWith).toHaveBeenCalledWith('author1');
    expect(await screen.findByTestId('messaging-page')).toBeInTheDocument();
  });

  it('affiche un toast d’erreur si getOrCreateConversationWith échoue', async () => {
    authSupabaseMocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1' }, access_token: 'tok' } },
      error: null,
    });
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'u1' } as never,
      session: null,
    });
    messagingMocks.getOrCreateConversationWith.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'rls_denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    renderButton('author1');
    const btn = await screen.findByRole('button', { name: /^Contacter/i });
    await act(async () => {
      fireEvent.click(btn);
    });
    const toast = await screen.findByRole('alert');
    expect(toast).toBeInTheDocument();
    // Bouton réactivé après l'échec.
    expect(btn).not.toBeDisabled();
  });

  it('passe en aria-busy=true pendant le chargement', async () => {
    authSupabaseMocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1' }, access_token: 'tok' } },
      error: null,
    });
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: 'u1' } as never,
      session: null,
    });
    let resolveCall: ((value: {
      data: { id: string } | null;
      error: null;
    }) => void) | undefined;
    messagingMocks.getOrCreateConversationWith.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCall = resolve;
        }),
    );
    renderButton('author1');
    const btn = await screen.findByRole('button', { name: /^Contacter/i });
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
    await act(async () => {
      resolveCall?.({ data: { id: 'cX' }, error: null });
    });
  });
});
