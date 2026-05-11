import type { SVGProps } from 'react';

/**
 * Icônes SVG du design system Maintenant ! — portées depuis Theme.jsx::ICONS.
 * Toutes les icônes héritent de currentColor pour suivre la couleur texte du parent.
 * Pas d'emoji dans le code TS — cf. CLAUDE.md.
 */
type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function IconClose({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function IconMail({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function IconLock({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function IconUser({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IconLogout({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function IconEdit({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

export function IconCheck({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconUpload({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function IconCheckCircle({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12.5 11 15.5 16.5 9.5" />
    </svg>
  );
}

export function IconCart({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.6 12.3a2 2 0 0 0 2 1.7h8.6a2 2 0 0 0 2-1.6L22 7H6" />
    </svg>
  );
}

export function IconSpark({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  );
}

/**
 * IconGoogle / IconInstagram — exceptions à la règle currentColor :
 * les logos OAuth officiels utilisent des couleurs propres au branding
 * (politique de respect de la marque exigée par Google et Meta).
 * Les couleurs sont figées en dur dans le SVG et `currentColor` n'est pas
 * utilisé. Hauteur 18 px par défaut pour s'aligner sur la rangée d'inputs.
 */
export function IconGoogle({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export function IconInstagram({ width = 18, height = 18, ...props }: IconProps) {
  const gradientId = 'mn-instagram-gradient';
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <defs>
        <radialGradient id={gradientId} cx="0.3" cy="1" r="1.2">
          <stop offset="0%" stopColor="#FED576" />
          <stop offset="25%" stopColor="#F47133" />
          <stop offset="50%" stopColor="#BC3081" />
          <stop offset="75%" stopColor="#4C63D2" />
          <stop offset="100%" stopColor="#4C63D2" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill={`url(#${gradientId})`} />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="#ffffff" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="#ffffff" />
    </svg>
  );
}

export function IconLink({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}

export function IconFlame({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17a2.5 2.5 0 0 0 2.5-2.5c0-2.5-2.5-3-2-5.5-2 0-3 2.5-3 5.5z" />
      <path d="M14 4c0 2-2 4-4 6-2 2-3 4-3 6.5A5 5 0 0 0 12 21a5 5 0 0 0 5-5c0-3.5-3-7-3-12z" />
    </svg>
  );
}

export function IconPen({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <path d="M3 21v-4l11-11 4 4-11 11H3z" />
      <path d="M14 6l4 4" />
    </svg>
  );
}

export function IconSearch({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconArrowLeft({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function IconUsers({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M17 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconBadge({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.12" />
    </svg>
  );
}

export function IconCalendar({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function IconPin({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconBarChart({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <line x1="6" y1="20" x2="6" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="18" y1="20" x2="18" y2="14" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  );
}

export function IconShare({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export function IconMegaphone({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" />
      <path d="M15 8a4 4 0 0 1 0 8" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  );
}

export function IconList({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </svg>
  );
}

export function IconHome({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

export function IconCar({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...baseProps}
      {...props}
    >
      <path d="M5 17V11l2-5h10l2 5v6" />
      <path d="M3 17h18" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </svg>
  );
}
