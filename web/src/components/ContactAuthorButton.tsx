import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

import { IconMail } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { getOrCreateConversationWith } from '@/lib/messaging';
import { postgrestErrorMessage } from '@/lib/postgrestError';
import { useToast } from '@/lib/toast';

/**
 * Bouton « Contacter » réutilisable (étape 44 — F8/F13).
 *
 * Au clic, ouvre ou retrouve la conversation 1-1 avec `authorUserId`
 * puis redirige vers `/messaging/:convId`. Câble `getOrCreateConversationWith`
 * (cf. `lib/messaging.ts`) qui repose sur la RLS `conv_select_party` /
 * `conv_insert_party` (auth.uid() obligatoire = user_a ou user_b).
 *
 * Variantes d'affichage :
 * - Anonyme : redirige vers `?auth=login` (pattern RootLayout).
 * - Auteur·ice du contenu : non rendu (cas géré par le parent via
 *   isOwner — ce composant ne le sait pas).
 * - Authentifié·e : bouton primaire « Contacter ».
 */
export interface ContactAuthorButtonProps {
  authorUserId: string;
  authorDisplayName?: string;
}

const baseStyle: CSSProperties = {
  height: 48,
  border: 'none',
  borderRadius: 12,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  padding: '0 22px',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: 'inherit',
};

const disabledStyle: CSSProperties = {
  ...baseStyle,
  cursor: 'not-allowed',
  opacity: 0.6,
};

const anonymousStyle: CSSProperties = {
  height: 48,
  borderRadius: 12,
  padding: '0 18px',
  border: '1.5px solid var(--mn-brand)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-brand-dark)',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};

export default function ContactAuthorButton({
  authorUserId,
  authorDisplayName,
}: ContactAuthorButtonProps) {
  const { status, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState<boolean>(false);

  if (status === 'loading') {
    return (
      <span style={disabledStyle} aria-disabled="true">
        <IconMail width={16} height={16} />
        Contacter
      </span>
    );
  }

  if (status === 'anonymous' || !user) {
    return (
      <button
        type="button"
        style={anonymousStyle}
        onClick={() => navigate('?auth=login')}
        aria-label={
          authorDisplayName
            ? `Se connecter pour contacter ${authorDisplayName}`
            : 'Se connecter pour contacter cette personne'
        }
      >
        <IconMail width={16} height={16} />
        Se connecter pour contacter
      </button>
    );
  }

  if (user.id === authorUserId) {
    return null;
  }

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    const { data, error } = await getOrCreateConversationWith(authorUserId);
    if (error || !data) {
      setLoading(false);
      toast.show({
        message:
          postgrestErrorMessage(error) ?? 'Impossible d’ouvrir la conversation. Réessayez.',
        variant: 'error',
      });
      return;
    }
    navigate(`/messaging/${data.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-busy={loading || undefined}
      style={loading ? disabledStyle : baseStyle}
      aria-label={
        authorDisplayName ? `Contacter ${authorDisplayName}` : 'Contacter l’auteur·ice'
      }
    >
      <IconMail width={16} height={16} />
      {loading ? 'Ouverture…' : 'Contacter'}
    </button>
  );
}
