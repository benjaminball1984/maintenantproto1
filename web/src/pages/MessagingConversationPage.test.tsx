import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as MessagingModule from '@/lib/messaging';

const msgMocks = vi.hoisted(() => ({
  getConversation: vi.fn(),
  listMessages: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock('@/lib/messaging', async () => {
  const actual = await vi.importActual<typeof MessagingModule>('@/lib/messaging');
  return {
    ...actual,
    getConversation: msgMocks.getConversation,
    listMessages: msgMocks.listMessages,
    sendMessage: msgMocks.sendMessage,
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
import type { ConversationRow, MessageRow } from '@/lib/messaging';
import MessagingConversationPage from './MessagingConversationPage';

const conv: ConversationRow = {
  id: 'c1',
  user_a: 'u1',
  user_b: 'u2-other-id',
  last_message_at: null,
  created_at: '2026-04-01T00:00:00Z',
};

const msg: MessageRow = {
  id: 'm1',
  conversation_id: 'c1',
  sender_id: 'u2-other-id',
  body: 'Salut, ça va ?',
  read_at: null,
  created_at: '2026-05-01T00:00:00Z',
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
    <MemoryRouter initialEntries={['/messaging/c1']}>
      <Routes>
        <Route path="/messaging/:conversationId" element={<MessagingConversationPage />} />
        <Route path="/messaging" element={<div data-testid="list">List</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  msgMocks.getConversation.mockReset();
  msgMocks.listMessages.mockReset();
  msgMocks.sendMessage.mockReset();
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  msgMocks.listMessages.mockResolvedValue({ data: [], error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('MessagingConversationPage', () => {
  it('affiche le fil et le formulaire d’envoi', async () => {
    msgMocks.getConversation.mockResolvedValueOnce({ data: conv, error: null });
    msgMocks.listMessages.mockResolvedValueOnce({ data: [msg], error: null });
    renderPage();
    expect(await screen.findByText('Salut, ça va ?')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /Envoyer un message/i })).toBeInTheDocument();
  });

  it('envoie un message via sendMessage', async () => {
    msgMocks.getConversation.mockResolvedValueOnce({ data: conv, error: null });
    msgMocks.listMessages.mockResolvedValue({ data: [msg], error: null });
    msgMocks.sendMessage.mockResolvedValueOnce({
      data: { ...msg, id: 'm2', sender_id: 'u1', body: 'Bien !' },
      error: null,
    });
    renderPage();
    const textarea = await screen.findByLabelText(/Votre message/i);
    fireEvent.change(textarea, { target: { value: 'Bien !' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('form', { name: /Envoyer un message/i }));
    });
    await waitFor(() => expect(msgMocks.sendMessage).toHaveBeenCalled());
    const arg = msgMocks.sendMessage.mock.calls[0]?.[0] as { body: string };
    expect(arg.body).toBe('Bien !');
  });

  it('redirige vers /messaging si conversation introuvable', async () => {
    msgMocks.getConversation.mockResolvedValueOnce({ data: null, error: null });
    msgMocks.listMessages.mockResolvedValue({ data: [], error: null });
    renderPage();
    expect(await screen.findByTestId('list')).toBeInTheDocument();
  });

  it('redirige les anonymes', () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    render(
      <MemoryRouter initialEntries={['/messaging/c1']}>
        <Routes>
          <Route path="/messaging/:conversationId" element={<MessagingConversationPage />} />
          <Route path="/" element={<div data-testid="home">Home</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(msgMocks.getConversation).not.toHaveBeenCalled();
  });
});
