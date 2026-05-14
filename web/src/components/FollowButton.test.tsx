import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

import type * as SocialModule from '@/lib/social';

const socialMocks = vi.hoisted(() => ({
  followUser: vi.fn(),
  unfollowUser: vi.fn(),
}));

vi.mock('@/lib/social', async () => {
  const actual = await vi.importActual<typeof SocialModule>('@/lib/social');
  return {
    ...actual,
    followUser: socialMocks.followUser,
    unfollowUser: socialMocks.unfollowUser,
  };
});

import FollowButton from './FollowButton';

beforeEach(() => {
  socialMocks.followUser.mockReset();
  socialMocks.unfollowUser.mockReset();
});

describe('FollowButton', () => {
  it('rend « Suivre » + aria-pressed="false" quand initiallyFollowing=false', () => {
    render(
      <FollowButton followerId="u1" followeeId="u2" initiallyFollowing={false} />,
    );
    const btn = screen.getByRole('button', { name: /^Suivre$/i });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('rend « Suivi·e » + aria-pressed="true" quand initiallyFollowing=true', () => {
    render(
      <FollowButton followerId="u1" followeeId="u2" initiallyFollowing />,
    );
    const btn = screen.getByRole('button', { name: /Ne plus suivre/i });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('clic « Suivre » → appelle followUser(followerId, followeeId)', async () => {
    socialMocks.followUser.mockResolvedValueOnce({ data: { id: 'f1' }, error: null });
    render(
      <FollowButton followerId="u1" followeeId="u2" initiallyFollowing={false} />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Suivre$/i }));
    });
    expect(socialMocks.followUser).toHaveBeenCalledWith('u1', 'u2');
    expect(
      screen.getByRole('button', { name: /Ne plus suivre/i }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('clic « Suivi·e » → appelle unfollowUser et bascule à aria-pressed="false"', async () => {
    socialMocks.unfollowUser.mockResolvedValueOnce({ error: null });
    render(
      <FollowButton followerId="u1" followeeId="u2" initiallyFollowing />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Ne plus suivre/i }));
    });
    expect(socialMocks.unfollowUser).toHaveBeenCalledWith('u1', 'u2');
    expect(
      screen.getByRole('button', { name: /^Suivre$/i }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('rollback du state local si followUser retourne une erreur', async () => {
    socialMocks.followUser.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'rls_denied',
        details: '',
        hint: '',
        code: '42501',
        name: 'PostgrestError',
      },
    });
    render(
      <FollowButton followerId="u1" followeeId="u2" initiallyFollowing={false} />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Suivre$/i }));
    });
    // Rollback : retour à l'état initial (« Suivre »).
    expect(
      screen.getByRole('button', { name: /^Suivre$/i }),
    ).toHaveAttribute('aria-pressed', 'false');
    // Message d'erreur exposé en aria-live.
    expect(screen.getByRole('alert')).toHaveTextContent(/rls_denied/i);
  });

  it('désactive le bouton si followerId est null (anonyme)', () => {
    render(
      <FollowButton followerId={null} followeeId="u2" initiallyFollowing={false} />,
    );
    expect(screen.getByRole('button', { name: /Suivre/i })).toBeDisabled();
  });

  it('désactive le bouton en auto-suivi (followerId === followeeId)', () => {
    render(
      <FollowButton followerId="u1" followeeId="u1" initiallyFollowing={false} />,
    );
    expect(screen.getByRole('button', { name: /Suivre/i })).toBeDisabled();
  });

  it('notifie onChange avec le nouveau state au clic réussi', async () => {
    socialMocks.followUser.mockResolvedValueOnce({ data: { id: 'f1' }, error: null });
    const onChange = vi.fn();
    render(
      <FollowButton
        followerId="u1"
        followeeId="u2"
        initiallyFollowing={false}
        onChange={onChange}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Suivre$/i }));
    });
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
