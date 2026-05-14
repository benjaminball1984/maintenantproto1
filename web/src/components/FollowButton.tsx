import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { IconCheck, IconUsers } from '@/components/icons';
import { followUser, unfollowUser } from '@/lib/social';

/**
 * Bouton « Suivre / Suivi·e » réutilisable (étape 38).
 *
 * Câble `followUser` / `unfollowUser` (cf. `lib/social.ts`) avec UI
 * optimiste : le state local bascule avant la résolution réseau, et
 * revient si la RPC échoue. RLS `follows_insert_self` / `follows_delete_self`
 * (auth.uid() = follower_id) garantit qu'aucun client ne peut suivre /
 * unfollow pour un autre user.
 *
 * Le composant ne lit pas `useAuth` lui-même — le caller passe
 * `followerId` explicitement pour faciliter les tests unitaires et
 * éviter l'appel hook si la prop n'est pas connue au render.
 *
 * @param followerId  uid de l'utilisateur courant. Si vide, le bouton
 *                    est rendu mais désactivé (caller responsable du
 *                    redirect vers `/?auth=login` au clic, ou de ne
 *                    pas rendre le bouton du tout).
 * @param followeeId  uid de la personne à suivre.
 * @param initiallyFollowing  état initial connu via lookup côté caller.
 * @param onChange    callback optionnel quand le state local bascule
 *                    (utile pour refetch un compteur followers côté
 *                    parent ou un toast). **Janitor JAN38-A10** :
 *                    `onChange` est rappelé deux fois en cas de
 *                    rollback erreur (1× avec le state optimiste,
 *                    1× avec le state final après rollback). Le caller
 *                    doit donc gérer l'idempotence s'il déclenche un
 *                    side-effect (ex. refresh d'un compteur).
 */
export interface FollowButtonProps {
  followerId: string | null;
  followeeId: string;
  initiallyFollowing: boolean;
  onChange?: (following: boolean) => void;
}

const baseStyle: CSSProperties = {
  height: 36,
  padding: '0 16px',
  borderRadius: 999,
  border: '1.5px solid var(--mn-brand)',
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  transition: 'background-color 0.15s, color 0.15s, opacity 0.15s',
};

const followingStyle: CSSProperties = {
  ...baseStyle,
  background: 'var(--mn-brand)',
  color: '#ffffff',
};

const notFollowingStyle: CSSProperties = {
  ...baseStyle,
  background: 'transparent',
  color: 'var(--mn-brand)',
};

const disabledStyle: CSSProperties = {
  cursor: 'not-allowed',
  opacity: 0.55,
};

export default function FollowButton({
  followerId,
  followeeId,
  initiallyFollowing,
  onChange,
}: FollowButtonProps) {
  const [following, setFollowing] = useState<boolean>(initiallyFollowing);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Janitor JAN38-R1 — garde de unmount : si le composant est démonté
  // pendant la RPC (parent re-render, changement de tab, refresh feed),
  // les setState ci-dessous sont skippés pour éviter un warning React +
  // memory leak léger.
  const mountedRef = useRef<boolean>(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleClick = async () => {
    if (busy || !followerId) return;
    const next = !following;
    setBusy(true);
    setError(null);
    // UI optimiste : bascule immédiatement, rollback sur échec.
    setFollowing(next);
    onChange?.(next);
    const { error: opError } = next
      ? await followUser(followerId, followeeId)
      : await unfollowUser(followerId, followeeId);
    if (!mountedRef.current) return;
    setBusy(false);
    if (opError) {
      // Rollback du state local + onChange — l'utilisateur voit revenir
      // le bouton à son état précédent et un message d'erreur ARIA-live.
      setFollowing(!next);
      onChange?.(!next);
      setError(opError.message || 'Impossible de mettre à jour le suivi.');
    }
  };

  const isDisabled = !followerId || busy || followerId === followeeId;
  const style: CSSProperties = following
    ? { ...followingStyle, ...(isDisabled ? disabledStyle : null) }
    : { ...notFollowingStyle, ...(isDisabled ? disabledStyle : null) };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        style={style}
        disabled={isDisabled}
        aria-pressed={following}
        aria-busy={busy || undefined}
        aria-label={following ? 'Ne plus suivre' : 'Suivre'}
      >
        {following ? <IconCheck width={14} height={14} /> : <IconUsers width={14} height={14} />}
        {following ? 'Suivi·e' : 'Suivre'}
      </button>
      {error && (
        <span
          role="alert"
          style={{ marginLeft: 8, fontSize: 12, color: 'var(--mn-danger)' }}
        >
          {error}
        </span>
      )}
    </>
  );
}
