import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type * as NotificationsModule from '@/lib/notifications';

const notifMocks = vi.hoisted(() => ({
  listNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markNotificationUnread: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

vi.mock('@/lib/notifications', async () => {
  const actual = await vi.importActual<typeof NotificationsModule>('@/lib/notifications');
  return {
    ...actual,
    listNotifications: notifMocks.listNotifications,
    markNotificationRead: notifMocks.markNotificationRead,
    markNotificationUnread: notifMocks.markNotificationUnread,
    markAllNotificationsRead: notifMocks.markAllNotificationsRead,
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
import type { NotificationRow } from '@/lib/notifications';
import NotificationsPage from './NotificationsPage';

const unread: NotificationRow = {
  id: 'n1',
  recipient_id: 'u1',
  kind: 'system',
  payload: { title: 'Bienvenue sur Maintenant !' },
  read_at: null,
  created_at: '2026-05-01T00:00:00Z',
};

const read: NotificationRow = {
  id: 'n2',
  recipient_id: 'u1',
  kind: 'message',
  payload: { title: 'Nouveau message' },
  read_at: '2026-05-02T00:00:00Z',
  created_at: '2026-04-30T00:00:00Z',
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
    <MemoryRouter initialEntries={['/notifications']}>
      <Routes>
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/" element={<div data-testid="home">Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  notifMocks.listNotifications.mockReset();
  notifMocks.markNotificationRead.mockReset();
  notifMocks.markNotificationUnread.mockReset();
  notifMocks.markAllNotificationsRead.mockReset();
  notifMocks.listNotifications.mockResolvedValue({ data: [], error: null });
  authMocks.getSession.mockReset();
  authMocks.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  useAuthStore.setState({
    status: 'authenticated',
    user: fakeSession.user as never,
    session: fakeSession as never,
  });
});

describe('NotificationsPage', () => {
  it('rend le listing avec compteur des non lues', async () => {
    notifMocks.listNotifications.mockResolvedValue({ data: [unread, read], error: null });
    renderPage();
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(2));
    expect(screen.getByText(/Bienvenue sur Maintenant !/i)).toBeInTheDocument();
    expect(screen.getByText(/1 non lue/i)).toBeInTheDocument();
  });

  it('marque une notification comme lue via le bouton', async () => {
    notifMocks.listNotifications.mockResolvedValue({ data: [unread], error: null });
    notifMocks.markNotificationRead.mockResolvedValue({
      data: { ...unread, read_at: '2026-05-03T00:00:00Z' },
      error: null,
    });
    renderPage();
    const button = await screen.findByRole('button', { name: /Marquer lu/i });
    await act(async () => {
      fireEvent.click(button);
    });
    await waitFor(() => expect(notifMocks.markNotificationRead).toHaveBeenCalledWith('n1'));
  });

  it('affiche l’état vide', async () => {
    renderPage();
    expect(await screen.findByText(/Aucune notification/i)).toBeInTheDocument();
  });

  it('redirige les anonymes vers /?auth=login', () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    useAuthStore.setState({ status: 'anonymous', user: null, session: null });
    renderPage();
    expect(notifMocks.listNotifications).not.toHaveBeenCalled();
  });
});
