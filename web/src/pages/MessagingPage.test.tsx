import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as MessagingModule from '@/lib/messaging';

const msgMocks = vi.hoisted(() => ({
  listConversations: vi.fn(),
}));

vi.mock('@/lib/messaging', async () => {
  const actual = await vi.importActual<typeof MessagingModule>('@/lib/messaging');
  return {
    ...actual,
    listConversations: msgMocks.listConversations,
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
import type { ConversationRow } from '@/lib/messaging';
import MessagingPage from './MessagingPage';

const sample: ConversationRow = {
  id: 'c1',
  user_a: 'u1',
  user_b: 'u2-other-id',
  last_message_at: '2026-05-01T00:00:00Z',
  created_at: '2026-04-01T00:00:00Z',
};

const fakeSession = {
  access_token: 'a',
  refresh_token: 'r',
  expires_at: 0,
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'u1', email: 'me@x.org', user_metadata: {} },
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/messaging']}>
      <Routes>
        <Route path="/messaging" element={<MessagingPage />} />
        <Route path="/" element={<div data-testid="home">Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  msgMocks.listConversations.mockReset();
  msgMocks.listConversations.mockResolvedValue({ data: [], error: null });
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('MessagingPage', () => {
  it('liste les conversations de l’utilisateur', async () => {
    msgMocks.listConversations.mockResolvedValueOnce({ data: [sample], error: null });
    renderPage();
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));
    expect(screen.getByText(/1 conversation/i)).toBeInTheDocument();
  });

  it('affiche le bandeau RGPD', async () => {
    msgMocks.listConversations.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Données personnelles/i)).toBeInTheDocument();
  });

  it('affiche l’état vide', async () => {
    msgMocks.listConversations.mockResolvedValueOnce({ data: [], error: null });
    renderPage();
    expect(await screen.findByText(/Aucune conversation/i)).toBeInTheDocument();
  });

  it('redirige les anonymes', () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    renderPage();
    expect(msgMocks.listConversations).not.toHaveBeenCalled();
  });
});
