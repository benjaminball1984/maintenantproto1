import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from 'react';

import { authErrorMessage, useAuthStore } from '@/lib/auth';
import { IconClose, IconLock, IconMail, IconUser } from '@/components/icons';

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'signup' | 'forgot';

const titles: Record<Mode, string> = {
  login: 'Connexion',
  signup: 'Créer un compte',
  forgot: 'Réinitialiser le mot de passe',
};

const submitLabels: Record<Mode, string> = {
  login: 'Se connecter',
  signup: 'Créer mon compte',
  forgot: 'Envoyer le lien',
};

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10, 10, 10, 0.65)',
  backdropFilter: 'blur(6px)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};

const dialogStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  borderRadius: 20,
  width: '100%',
  maxWidth: 420,
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 32px 80px rgba(0, 0, 0, 0.25)',
  border: '1px solid var(--mn-border)',
};

const headerStyle: CSSProperties = {
  padding: '20px 24px 16px',
  borderBottom: '1px solid var(--mn-border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  background: 'var(--mn-surface)',
  zIndex: 1,
};

const titleStyle: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 18,
  fontWeight: 700,
  color: 'var(--mn-text-1)',
  margin: 0,
  letterSpacing: '-0.02em',
};

const closeBtnStyle: CSSProperties = {
  border: 'none',
  background: 'var(--mn-surface-2)',
  borderRadius: '50%',
  width: 32,
  height: 32,
  cursor: 'pointer',
  color: 'var(--mn-text-3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const bodyStyle: CSSProperties = {
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--mn-text-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 6,
  display: 'block',
};

const fieldWrapperStyle: CSSProperties = {
  position: 'relative',
};

const inputStyle: CSSProperties = {
  width: '100%',
  height: 46,
  border: '1.5px solid var(--mn-border)',
  borderRadius: 12,
  padding: '0 16px 0 44px',
  fontSize: 15,
  fontFamily: 'Inter, sans-serif',
  color: 'var(--mn-text-1)',
  background: 'var(--mn-bg)',
  outline: 'none',
  boxSizing: 'border-box',
};

const inputIconStyle: CSSProperties = {
  position: 'absolute',
  left: 14,
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--mn-text-4)',
  display: 'flex',
  pointerEvents: 'none',
};

const submitBtnStyle: CSSProperties = {
  width: '100%',
  minHeight: 48,
  border: 'none',
  borderRadius: 12,
  background: 'var(--mn-gradient)',
  color: '#ffffff',
  fontSize: 15,
  fontWeight: 700,
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  marginTop: 4,
};

const footerLinkStyle: CSSProperties = {
  textAlign: 'center',
  fontSize: 13,
  color: 'var(--mn-text-3)',
  marginTop: 4,
};

const linkBtnStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--mn-brand)',
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
  fontSize: 13,
};

const messageStyle: CSSProperties = {
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 13,
  lineHeight: 1.5,
};

const errorMessageStyle: CSSProperties = {
  ...messageStyle,
  background: '#FEF2F2',
  color: 'var(--mn-danger)',
  border: '1px solid #FECACA',
};

const successMessageStyle: CSSProperties = {
  ...messageStyle,
  background: '#F0FDF4',
  color: 'var(--mn-success)',
  border: '1px solid #BBF7D0',
};

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  // Reset des messages quand on rouvre la modale ou qu'on change d'écran.
  // Pattern « set state during render » : React garantit qu'aucun cycle infini
  // ne se produit puisqu'on garde la valeur en mémoire dans prevKey.
  const currentKey = `${open ? '1' : '0'}-${mode}`;
  const [prevKey, setPrevKey] = useState(currentKey);
  if (prevKey !== currentKey) {
    setPrevKey(currentKey);
    setErrorText(null);
    setSuccessText(null);
  }

  const titleId = useId();
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const signInWithPassword = useAuthStore((s) => s.signInWithPassword);
  const signUpWithPassword = useAuthStore((s) => s.signUpWithPassword);
  const resetPasswordForEmail = useAuthStore((s) => s.resetPasswordForEmail);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => firstInputRef.current?.focus(), 30);
    return () => window.clearTimeout(id);
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrorText(null);
    setSuccessText(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (mode === 'login') {
        const { error } = await signInWithPassword({ email, password });
        if (error) {
          setErrorText(authErrorMessage(error));
        } else {
          onClose();
        }
      } else if (mode === 'signup') {
        const fallbackName = displayName.trim() || email.split('@')[0] || 'Militant·e';
        const { error } = await signUpWithPassword({
          email,
          password,
          displayName: fallbackName,
        });
        if (error) {
          setErrorText(authErrorMessage(error));
        } else {
          setSuccessText('Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse.');
        }
      } else {
        const { error } = await resetPasswordForEmail(email);
        if (error) {
          setErrorText(authErrorMessage(error));
        } else {
          setSuccessText(
            'Si un compte existe avec cet email, un lien de réinitialisation vient de partir.',
          );
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={overlayStyle}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} style={dialogStyle}>
        <div style={headerStyle}>
          <h2 id={titleId} style={titleStyle}>
            {titles[mode]}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fermer" style={closeBtnStyle}>
            <IconClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={bodyStyle} noValidate>
          {errorText && (
            <div role="alert" style={errorMessageStyle}>
              {errorText}
            </div>
          )}
          {successText && (
            <div role="status" style={successMessageStyle}>
              {successText}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name" style={labelStyle}>
                Prénom & nom
              </label>
              <div style={fieldWrapperStyle}>
                <span style={inputIconStyle}>
                  <IconUser />
                </span>
                <input
                  id="auth-name"
                  ref={firstInputRef}
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Camille Dupont"
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" style={labelStyle}>
              Email
            </label>
            <div style={fieldWrapperStyle}>
              <span style={inputIconStyle}>
                <IconMail />
              </span>
              <input
                id="auth-email"
                ref={mode === 'signup' ? null : firstInputRef}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@email.fr"
                style={inputStyle}
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label htmlFor="auth-password" style={labelStyle}>
                Mot de passe
              </label>
              <div style={fieldWrapperStyle}>
                <span style={inputIconStyle}>
                  <IconLock />
                </span>
                <input
                  id="auth-password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={mode === 'signup' ? 8 : undefined}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...submitBtnStyle,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'progress' : 'pointer',
            }}
          >
            {submitting ? 'Veuillez patienter…' : submitLabels[mode]}
          </button>

          <div style={footerLinkStyle}>
            {mode === 'login' && (
              <>
                <button type="button" onClick={() => switchMode('signup')} style={linkBtnStyle}>
                  Créer un compte
                </button>
                {' · '}
                <button type="button" onClick={() => switchMode('forgot')} style={linkBtnStyle}>
                  Mot de passe oublié ?
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button type="button" onClick={() => switchMode('login')} style={linkBtnStyle}>
                Déjà inscrit·e ? Se connecter
              </button>
            )}
            {mode === 'forgot' && (
              <button type="button" onClick={() => switchMode('login')} style={linkBtnStyle}>
                Retour à la connexion
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
