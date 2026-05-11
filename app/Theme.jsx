// Theme.jsx — Système de design moderne Maintenant! v2
// Design : Editorial · Photo-first · Professional · 2025
const { useState, useEffect, useRef, useCallback } = React;

// ── Design Tokens ──────────────────────────────────────────
const T = {
  // Colors
  bg: '#FAFAF9',
  surface: '#FFFFFF',
  surface2: '#F5F4F2',
  border: '#E8E6E1',
  borderDark: '#D4D1CA',
  // Text
  text1: '#1A1A18',
  text2: '#4A4840',
  text3: '#7A786F',
  text4: '#B0AEA7',
  // Brand — palette T99CP (magenta cœur du gradient violet → rose → rouge)
  brand: '#E11D74', // magenta vif (point central)
  brandDark: '#B91560',
  brandLight: '#FDE9F2',
  brandMid: '#FF3D7F',
  // Accent — violet (côté gauche du gradient)
  accent: '#7C3AED',
  accentLight: '#F3EBFE',
  // Hue — rouge framboise (côté droit du gradient)
  hue: '#DC2654',
  hueLight: '#FCE7EE',
  // Semantic
  success: '#16A34A',
  successLight: '#F0FDF4',
  info: '#0369A1',
  infoLight: '#EFF6FF',
  warning: '#D97706',
  warnLight: '#FFFBEB',
  // Service hues — différenciation légère par service dans le spectre violet→magenta→rouge
  hub: {
    petitions: '#E11D74', // magenta — pétitions = cœur
    mobilizations: '#7C3AED', // violet — mobilisations
    crowdfunding: '#A21CAF', // pourpre — cagnottes
    media: '#5B21B6', // violet profond — média
    sel: '#C026D3', // fuchsia — SEL
    marketplace: '#DC2654', // framboise — marketplace
    housing: '#9333EA', // violet vif — hébergement
    carpooling: '#BE185D', // rose foncé — covoit
    garden: '#F472B6', // rose tendre — jardin
    network: '#7E22CE', // violet — réseau
    communes: '#EC4899' // rose vif — communes
  },
  // Gradient signature T99CP — violet → magenta → rouge framboise
  grad: 'linear-gradient(135deg, #7C3AED 0%, #E11D74 50%, #DC2654 100%)',
  gradR: 'linear-gradient(to right, #7C3AED, #E11D74, #DC2654)',
  gradSoft: 'linear-gradient(135deg, #F3EBFE 0%, #FDE9F2 50%, #FCE7EE 100%)',
  gradDark: 'linear-gradient(135deg, #5B21B6 0%, #B91560 100%)'
};
window.T = T;

// ── SVG Icon System ────────────────────────────────────────
const ICONS = {
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  menu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  plus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  arrow_r: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>,
  arrow_l: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>,
  heart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  heartFill: <svg width="18" height="18" viewBox="0 0 24 24" fill="#E11D74" stroke="#E11D74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  starEmpty: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D0CA" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  pin: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  calendar: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  share: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
  chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  grid: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  filter: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
  wallet: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" /><circle cx="17" cy="13" r="1" fill="currentColor" /></svg>,
  send: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  photo: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
  car: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>,
  trending: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  sparkle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" /></svg>,
  users: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
};
window.ICONS = ICONS;

// ── Base Components ────────────────────────────────────────

// Button
function Btn({ children, onClick, variant = 'primary', size = 'md', full = false, style = {}, disabled = false, icon = null }) {
  const [hov, setHov] = useState(false);
  const sizes = {
    xs: { height: 28, padding: '0 12px', fontSize: 11, gap: 5, radius: 8 },
    sm: { height: 36, padding: '0 16px', fontSize: 13, gap: 6, radius: 10 },
    md: { height: 44, padding: '0 22px', fontSize: 14, gap: 7, radius: 12 },
    lg: { height: 52, padding: '0 28px', fontSize: 16, gap: 8, radius: 14 }
  };
  const s = sizes[size] || sizes.md;
  const base = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: s.gap, height: s.height, padding: s.padding, fontSize: s.fontSize, fontFamily: 'Inter,sans-serif', fontWeight: 600, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: s.radius, transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)', width: full ? '100%' : 'auto', opacity: disabled ? 0.45 : 1, letterSpacing: '-0.01em', whiteSpace: 'nowrap', position: 'relative', overflow: 'hidden' };
  const variants = {
    primary: { background: hov ? T.brandDark : T.brand, color: '#fff', boxShadow: hov ? '0 8px 24px rgba(225,29,116,0.35)' : '0 4px 14px rgba(225,29,116,0.2)', transform: hov && !disabled ? 'translateY(-1px)' : 'none' },
    gradient: { background: T.gradR, color: '#fff', boxShadow: hov ? '0 8px 28px rgba(225,29,116,0.38)' : '0 4px 16px rgba(225,29,116,0.22)', transform: hov && !disabled ? 'translateY(-1px)' : 'none' },
    outline: { background: hov ? T.brandLight : 'transparent', color: T.brand, border: `1.5px solid ${hov ? T.brand : T.border}`, boxShadow: 'none' },
    ghost: { background: hov ? T.surface2 : 'transparent', color: T.text2, boxShadow: 'none' },
    white: { background: hov ? '#F5F5F5' : '#fff', color: T.brand, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' },
    dark: { background: hov ? '#2A2A27' : T.text1, color: '#fff', boxShadow: hov ? '0 8px 20px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.15)' },
    success: { background: hov ? '#15803d' : T.success, color: '#fff', boxShadow: '0 4px 12px rgba(22,163,74,0.25)' },
    blue: { background: hov ? '#0284C7' : T.info, color: '#fff', boxShadow: '0 4px 12px rgba(3,105,161,0.25)' },
    surface: { background: hov ? T.surface2 : T.surface, color: T.text2, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }
  };
  const v = variants[variant] || variants.primary;
  return (
    <button onClick={disabled ? undefined : onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ ...base, ...v, ...style }}>
      {icon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>}
      {children}
    </button>);

}

// Card
function Card({ children, style = {}, hover = true, onClick, padding }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)', cursor: onClick ? 'pointer' : 'default', boxShadow: hover && hov ? '0 12px 40px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)', transform: hover && hov ? 'translateY(-3px)' : 'none', overflow: 'hidden', ...(padding ? { padding } : {}), ...style }}>
      {children}
    </div>);

}

// Badge / Tag
function Tag({ children, variant = 'default', size = 'sm', dot = false, style = {} }) {
  const variants = {
    default: { bg: T.surface2, color: T.text3, border: T.border },
    brand: { bg: T.brandLight, color: T.brand, border: '#FECACA' },
    success: { bg: T.successLight, color: T.success, border: '#BBF7D0' },
    info: { bg: T.infoLight, color: T.info, border: '#BFDBFE' },
    warning: { bg: T.warnLight, color: T.warning, border: '#FDE68A' },
    dark: { bg: T.text1, color: '#fff', border: 'transparent' },
    gradient: { bg: T.gradR, color: '#fff', border: 'transparent' }
  };
  const v = variants[variant] || variants.default;
  const s = size === 'xs' ? { fontSize: 10, padding: '2px 8px', radius: 6 } : { fontSize: 11, padding: '4px 10px', radius: 8 };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: s.padding, borderRadius: s.radius, fontSize: s.fontSize, fontWeight: 600, background: v.bg, color: v.color, border: `1px solid ${v.border}`, letterSpacing: '0.01em', ...style }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: v.color, flexShrink: 0 }}></span>}
      {children}
    </span>);

}

// Progress bar
function ProgressBar({ value, max, height = 5, animated = true }) {
  const pct = Math.min(Math.round(value / max * 100), 100);
  return (
    <div>
      <div style={{ height, background: T.surface2, borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: T.gradR, borderRadius: 9999, transition: animated ? 'width 1s ease-out' : 'none' }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: T.text3 }}>
        <span style={{ fontWeight: 700, color: T.brand }}>{pct}%</span>
        <span>{value.toLocaleString('fr-FR')} / {max.toLocaleString('fr-FR')}</span>
      </div>
    </div>);

}

// T99CP Token display
function TokenDisplay({ amount, size = 'md', showLabel = true }) {
  const sizes = { xs: 10, sm: 12, md: 14, lg: 18, xl: 24 };
  const fs = sizes[size] || 14;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 700, color: T.info, fontSize: fs }}>
      <span style={{ width: fs + 6, height: fs + 6, borderRadius: '50%', background: T.gradR, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: fs - 4, fontWeight: 800, flexShrink: 0, boxShadow: `0 2px 6px rgba(225,29,116,0.3)` }}>₮</span>
      {amount}{showLabel && <span style={{ fontSize: fs - 2, opacity: 0.7, fontWeight: 500 }}>T99CP</span>}
    </span>);

}

// Stars
function Stars({ rating, count }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i}>{i <= Math.round(rating) ? ICONS.star : ICONS.starEmpty}</span>)}
      <span style={{ fontSize: 12, color: T.text3, marginLeft: 3, fontWeight: 500 }}>{rating}{count !== undefined && <span style={{ color: T.text4 }}> ({count})</span>}</span>
    </span>);

}

// Avatar
function Avatar({ name = '', size = 36, gradient = T.gradR }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: Math.max(12, size * 0.38), flexShrink: 0, letterSpacing: '-0.02em' }}>
      {name.charAt(0).toUpperCase() || 'U'}
    </div>);

}

// Photo placeholder
function Photo({ src, style = {}, alt = '', overlay = false }) {
  const [err, setErr] = useState(false);
  if (err || !src) return (
    <div style={{ background: `linear-gradient(135deg,#1A1A18,#2A2A27)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.15)', ...style }}>
      <span style={{ display: 'flex' }}>{ICONS.photo}</span>
    </div>);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <img src={src} alt={alt} onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      {overlay && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 50%)' }}></div>}
    </div>);

}

// Modal
function Modal({ open, onClose, title, children, width = 520, noPad = false }) {
  useEffect(() => {document.body.style.overflow = open ? 'hidden' : '';return () => {document.body.style.overflow = '';};}, [open]);
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.65)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: T.surface, borderRadius: 20, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', border: `1px solid ${T.border}` }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: T.surface, zIndex: 1 }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: T.text1, margin: 0, letterSpacing: '-0.02em' }}>{title}</h3>
          <button onClick={onClose} style={{ border: 'none', background: T.surface2, borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: T.text3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ICONS.close}</button>
        </div>
        <div style={{ padding: noPad ? 0 : 24 }}>{children}</div>
      </div>
    </div>);

}

// ── Payment Modal — choix T99CP / Euros ────────────────────
// Pour le Marketplace : frais de port en Polygon si T99CP, en € si Euros.
// Vendeur : reçoit ses T99CP envoyés directement par la plateforme (back-office admin).
function PayModal({ open, onClose, amount, item, description, seller, shipping = false, hasShipping = false }) {
  const [method, setMethod] = useState('t99cp'); // 't99cp' | 'eur'
  const [submitted, setSubmitted] = useState(false);
  // Frais de port : Polygon (~0.05€ gas) si T99CP, sinon en € (forfait simulé)
  const shipT99 = hasShipping ? 0 : 0; // gas Polygon non comptabilisé en T99CP
  const shipEur = hasShipping ? 4.90 : 0;
  const totalT = amount + shipT99;
  const totalE = amount + shipEur;

  const submit = () => {
    // En réel : créer un PaymentOrder côté admin (statut: pending) avec method, vendeur, montant
    setSubmitted(true);
    setTimeout(() => {setSubmitted(false);onClose();}, 2400);
  };

  if (submitted) return (
    <Modal open={open} onClose={onClose} title="" width={400}>
      <div style={{ textAlign: 'center', padding: '12px 8px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.successLight, margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.success }}>{ICONS.check}</div>
        <h4 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: T.text1, margin: '0 0 8px' }}>Paiement enregistré</h4>
        <p style={{ fontSize: 13, color: T.text3, margin: 0, lineHeight: 1.6 }}>
          {method === 't99cp' ?
          <>Le vendeur recevra <strong>{totalT} T99CP</strong> envoyés par la plateforme sous 24h.</> :
          <>Votre commande de <strong>{totalE.toFixed(2)} €</strong> est en cours de traitement.</>}
        </p>
      </div>
    </Modal>);


  return (
    <Modal open={open} onClose={onClose} title="Choisir le mode de paiement" width={460}>
      <div>
        <h4 style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: T.text1, margin: '0 0 4px', lineHeight: 1.3 }}>{item}</h4>
        <p style={{ fontSize: 13, color: T.text3, margin: '0 0 18px', lineHeight: 1.5 }}>{description}</p>

        {/* Switch méthode */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setMethod('t99cp')} style={{ padding: '14px 12px', border: `2px solid ${method === 't99cp' ? T.brand : T.border}`, background: method === 't99cp' ? T.brandLight : T.surface, borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: T.gradR, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>₮</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: method === 't99cp' ? T.brand : T.text1 }}>Payer en T99CP</span>
            </div>
            <div style={{ fontSize: 11, color: T.text4 }}>Monnaie solidaire · Polygon</div>
          </button>
          <button onClick={() => setMethod('eur')} style={{ padding: '14px 12px', border: `2px solid ${method === 'eur' ? T.text1 : T.border}`, background: method === 'eur' ? T.surface2 : T.surface, borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: T.text1, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>€</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: T.text1 }}>Je préfère payer en euros</span>
            </div>
            <div style={{ fontSize: 11, color: T.text4 }}>CB · SEPA · Apple Pay</div>
          </button>
        </div>

        {/* Récap montant */}
        <div style={{ background: T.surface2, borderRadius: 14, padding: '16px 18px', marginBottom: 14, border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: hasShipping ? 6 : 0 }}>
            <span style={{ fontSize: 13, color: T.text3 }}>Montant</span>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: T.text1 }}>
              {method === 't99cp' ? `${amount} T99CP` : `${amount.toFixed(2)} €`}
            </span>
          </div>
          {hasShipping &&
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 6, marginBottom: 6, borderBottom: `1px dashed ${T.border}` }}>
              <span style={{ fontSize: 13, color: T.text3 }}>Frais de port</span>
              <span style={{ fontWeight: 600, fontSize: 13, color: T.text2 }}>
                {method === 't99cp' ? <>~0.05 € <span style={{ color: T.text4, fontWeight: 500 }}>(gas Polygon)</span></> : `${shipEur.toFixed(2)} €`}
              </span>
            </div>
          }
          {hasShipping &&
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text1 }}>Total</span>
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, color: method === 't99cp' ? T.brand : T.text1 }}>
                {method === 't99cp' ? <>{totalT} T99CP <span style={{ fontSize: 11, color: T.text4, fontWeight: 500 }}>+ gas</span></> : `${totalE.toFixed(2)} €`}
              </span>
            </div>
          }
        </div>

        {/* Mention vendeur */}
        {method === 't99cp' &&
        <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.55, padding: '10px 14px', background: T.brandLight, borderRadius: 10, borderLeft: `3px solid ${T.brand}`, marginBottom: 14 }}>
            {seller ? <>Le vendeur (<strong>{seller}</strong>) recevra ses T99CP envoyés directement par la plateforme sous 24h.</> : <>Le bénéficiaire recevra ses T99CP envoyés directement par la plateforme sous 24h.</>}
          </div>
        }
        {method === 'eur' &&
        <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.55, padding: '10px 14px', background: T.surface2, borderRadius: 10, borderLeft: `3px solid ${T.text2}`, marginBottom: 14 }}>
            Paiement en euros sécurisé. Le vendeur reçoit le montant en €, frais de port classiques.
          </div>
        }

        <Btn full variant={method === 't99cp' ? 'gradient' : 'primary'} size="lg" onClick={submit}>
          {method === 't99cp' ? `Confirmer · ${totalT} T99CP` : `Payer · ${totalE.toFixed(2)} €`}
        </Btn>
        <Btn full variant="ghost" size="sm" onClick={onClose} style={{ marginTop: 8 }}>Annuler</Btn>
      </div>
    </Modal>);

}
window.PayModal = PayModal;

// Auth Modal
function AuthModal({ open, onClose, onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const fakeLogin = (userData) => {
    setLoading(true);
    setTimeout(() => {onLogin(userData);setLoading(false);onClose();}, 700);
  };

  const inputCss = { width: '100%', height: 46, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '0 16px', fontSize: 15, fontFamily: 'Inter,sans-serif', color: T.text1, background: T.bg, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' };

  return (
    <Modal open={open} onClose={onClose} title={mode === 'login' ? 'Connexion' : mode === 'signup' ? 'Créer un compte' : 'Réinitialiser'} width={400}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Social */}
        <button onClick={() => fakeLogin({ name: 'Utilisateur Google', email: 'user@gmail.com', t99cp_balance: 50, is_admin: false, badges: ['Membre'], joined: '2026-04-25' })}
        style={{ width: '100%', height: 48, border: `1.5px solid ${T.border}`, borderRadius: 12, background: T.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: T.text2, fontFamily: 'Inter,sans-serif', transition: 'background 0.15s' }}
        onMouseEnter={(e) => e.target.style.background = T.surface2} onMouseLeave={(e) => e.target.style.background = T.surface}>
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
          Continuer avec Google
        </button>
        <button onClick={() => fakeLogin({ name: 'Utilisateur Instagram', email: 'user@insta.com', t99cp_balance: 30, is_admin: false, badges: ['Membre'], joined: '2026-04-25' })}
        style={{ width: '100%', height: 48, border: 'none', borderRadius: 12, background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: 'Inter,sans-serif' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
          Continuer avec Instagram
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
          <div style={{ flex: 1, height: 1, background: T.border }}></div>
          <span style={{ fontSize: 12, color: T.text4, fontWeight: 500 }}>ou avec un email</span>
          <div style={{ flex: 1, height: 1, background: T.border }}></div>
        </div>

        {mode === 'signup' && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom & Nom" style={inputCss} onFocus={(e) => e.target.style.borderColor = T.brand} onBlur={(e) => e.target.style.borderColor = T.border} />}
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="votre@email.fr" style={inputCss} onFocus={(e) => e.target.style.borderColor = T.brand} onBlur={(e) => e.target.style.borderColor = T.border} />
        {mode !== 'forgot' && <input value={pwd} onChange={(e) => setPwd(e.target.value)} type="password" placeholder="Mot de passe" style={inputCss} onFocus={(e) => e.target.style.borderColor = T.brand} onBlur={(e) => e.target.style.borderColor = T.border} />}

        <Btn full variant="gradient" size="lg" disabled={loading} onClick={() => fakeLogin({ name: name || email.split('@')[0] || 'Militant·e', email: email || 'user@maintenant.org', t99cp_balance: 50, is_admin: email.includes('admin'), badges: ['Nouveau membre'], joined: '2026-04-25' })}>
          {loading ? 'Connexion...' : mode === 'login' ? 'Se connecter' : mode === 'signup' ? 'Créer mon compte' : 'Envoyer le lien'}
        </Btn>

        <div style={{ textAlign: 'center', fontSize: 12, color: T.text4 }}>
          {mode === 'login' && <><span style={{ cursor: 'pointer', color: T.brand, fontWeight: 600 }} onClick={() => setMode('signup')}>Créer un compte</span> · <span style={{ cursor: 'pointer' }} onClick={() => setMode('forgot')}>Mot de passe oublié ?</span></>}
          {mode === 'signup' && <span style={{ cursor: 'pointer', color: T.brand, fontWeight: 600 }} onClick={() => setMode('login')}>Déjà inscrit ? Se connecter</span>}
          {mode === 'forgot' && <span style={{ cursor: 'pointer', color: T.brand, fontWeight: 600 }} onClick={() => setMode('login')}>← Retour</span>}
        </div>
      </div>
    </Modal>);

}
window.AuthModal = AuthModal;

// Edit Modal
function EditModal({ open, onClose, title, fields, data, onSave }) {
  const [form, setForm] = useState(data || {});
  useEffect(() => {if (data) setForm(data);}, [data, open]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const inputCss = { width: '100%', height: 44, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '0 14px', fontSize: 14, fontFamily: 'Inter,sans-serif', color: T.text1, background: T.bg, outline: 'none', boxSizing: 'border-box' };
  return (
    <Modal open={open} onClose={onClose} title={`Modifier · ${title}`} width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {fields.map((f) =>
        <div key={f.key}>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.text3, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</label>
            {f.type === 'textarea' ? <textarea value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} rows={4} style={{ ...inputCss, height: 'auto', padding: '12px 14px', resize: 'vertical', lineHeight: 1.5 }} /> :
          f.type === 'select' ? <select value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} style={inputCss}>{f.options.map((o) => <option key={o}>{o}</option>)}</select> :
          <input type={f.type || 'text'} value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} style={inputCss} />}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <Btn variant="gradient" full onClick={() => {onSave(form);onClose();}} icon={ICONS.check}>Enregistrer les modifications</Btn>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        </div>
      </div>
    </Modal>);

}
window.EditModal = EditModal;

// Admin Edit Button
function AdminBtn({ onEdit, style = {} }) {
  return (
    <button onClick={(e) => {e.stopPropagation();e.preventDefault();onEdit();}} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, border: `1px solid ${T.warning}`, background: T.warnLight, color: T.warning, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', ...style }}>
      {ICONS.edit} Modifier
    </button>);

}
window.AdminBtn = AdminBtn;

// Search Input
function SearchInput({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative', marginBottom: 20 }}>
      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused ? T.brand : T.text4, display: 'flex', transition: 'color 0.15s' }}>{ICONS.search}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || 'Rechercher...'} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ width: '100%', height: 48, border: `1.5px solid ${focused ? T.brand : T.border}`, borderRadius: 14, paddingLeft: 46, paddingRight: 16, fontSize: 15, fontFamily: 'Inter,sans-serif', color: T.text1, background: focused ? T.surface : T.bg, outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s', boxShadow: focused ? `0 0 0 3px ${T.brandLight}` : 'none' }} />
    </div>);

}
window.SearchInput = SearchInput;

// Filter Tabs
function FilterTabs({ options, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
      {options.map((o) =>
      <button key={o} onClick={() => onChange(o)} style={{ padding: '7px 16px', borderRadius: 9999, border: `1.5px solid ${active === o ? T.brand : T.border}`, background: active === o ? T.brand : T.surface, color: active === o ? '#fff' : T.text3, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s', boxShadow: active === o ? `0 4px 12px rgba(225,29,116,0.2)` : 'none' }}>{o}</button>
      )}
    </div>);

}
window.FilterTabs = FilterTabs;

// Section Title
function SectionTitle({ label, title, action, style = {} }) {
  return (
    <div className="mn-section-title" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12, ...style }}>
      <div>
        {label && <div style={{ fontSize: 11, fontWeight: 700, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</div>}
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(20px,3.5vw,28px)', fontWeight: 800, color: T.text1, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>);

}
window.SectionTitle = SectionTitle;

// Page Container
function PageContainer({ children, maxWidth = 1200 }) {
  return <div data-mn-page style={{ maxWidth, margin: '0 auto', padding: '28px 20px 100px' }}>{children}</div>;
}
window.PageContainer = PageContainer;

// Empty State
function EmptyState({ title, desc, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: T.text4 }}>{ICONS.search}</div>
      <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, color: T.text2, fontSize: 18, margin: '0 0 8px' }}>{title}</p>
      {desc && <p style={{ fontSize: 14, color: T.text4, margin: '0 0 20px' }}>{desc}</p>}
      {action}
    </div>);

}
window.EmptyState = EmptyState;

// Expose all
Object.assign(window, { T, ICONS, Btn, Card, Tag, ProgressBar, TokenDisplay, Stars, Avatar, Photo, Modal, AdminBtn, SearchInput, FilterTabs, SectionTitle, PageContainer, EmptyState });

// ════════════════════════════════════════════════════════════
//   Helpers : seedRandom, statusTag, share
// ════════════════════════════════════════════════════════════

// Génère N noms français déterministes à partir d'un seed (ex: id de pétition)
window.generateMockNames = function (seed, count) {
  const firstNames = ['Marie', 'Sophie', 'Léa', 'Camille', 'Emma', 'Léna', 'Manon', 'Inès', 'Anaïs', 'Sarah', 'Yasmine', 'Aïcha', 'Mariam', 'Fatou', 'Pierre', 'Jean', 'Lucas', 'Hugo', 'Théo', 'Antoine', 'Maxime', 'Karim', 'Mehdi', 'Adam', 'Yanis', 'Omar', 'Idriss', 'Thomas', 'Bastien', 'Léo', 'Clara', 'Anna', 'Julie', 'Margot', 'Romain', 'Nicolas', 'Olivier', 'Mathieu', 'Vincent', 'Fanny', 'Élise', 'Justine', 'Charlotte', 'Pauline'];
  const lastInitials = ['M.', 'D.', 'B.', 'R.', 'L.', 'P.', 'C.', 'F.', 'T.', 'N.', 'K.', 'V.', 'H.', 'S.', 'G.', 'A.', 'J.', 'O.'];
  const out = [];
  let s = (seed || 1) * 374761393 >>> 0;
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    const f = firstNames[Math.floor(s / 233280 * firstNames.length)];
    s = (s * 9301 + 49297) % 233280;
    const l = lastInitials[Math.floor(s / 233280 * lastInitials.length)];
    out.push(`${f} ${l}`);
  }
  return out;
};

// Mappe un status de pétition vers les props d'un Tag
window.getStatusTag = function (status) {
  switch (status) {
    case 'won':return { variant: 'gradient', label: '✨ Victoire', dot: false };
    case 'closed':return { variant: 'default', label: 'Clôturée', dot: false };
    case 'archived':return { variant: 'warning', label: 'Archivée', dot: false };
    case 'active':
    default:return { variant: 'success', label: 'Active', dot: true };
  }
};

// ────────────── ShareModal ──────────────
// Permalink + 5 boutons réseaux : X, Facebook, WhatsApp, Mastodon, Instagram (copie texte)
function ShareModal({ open, onClose, title, url, text }) {
  const link = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = text || title || '';
  const encodedUrl = encodeURIComponent(link);
  const encodedText = encodeURIComponent(shareText);

  const copy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        if (window.showToast) window.showToast('Lien copié — colle-le où tu veux', { type: 'success', icon: '🔗' });
      });
    }
  };

  const networks = [
  { id: 'x', label: 'X (Twitter)', color: '#000', url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
  { id: 'facebook', label: 'Facebook', color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z" /></svg> },
  { id: 'whatsapp', label: 'WhatsApp', color: '#25D366', url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.55 5.328l-.999 3.648 3.938-1.633z" /></svg> },
  { id: 'mastodon', label: 'Mastodon', color: '#6364FF', url: null,
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 13.913c-.29 1.469-2.592 3.121-5.238 3.396-1.379.165-2.737.32-4.185.255-2.368-.108-4.235-.567-4.235-.567 0 .234.014.456.043.665.307 2.348 2.319 2.488 4.226 2.554 1.925.066 3.64-.475 3.64-.475l.079 1.745s-1.347.724-3.749.857c-1.323.073-2.967-.034-4.881-.541-4.151-1.099-4.866-5.524-4.975-10.012-.034-1.334-.013-2.591-.013-3.643 0-4.589 3.005-5.935 3.005-5.935 1.515-.696 4.114-.989 6.815-1.011h.066c2.701.022 5.302.315 6.817 1.011 0 0 3.005 1.346 3.005 5.935 0 0 .038 3.388-.42 5.766z" /></svg> },
  { id: 'instagram', label: 'Instagram', color: '#E4405F', url: null,
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4z" /></svg> }];


  const handleShare = (n) => {
    if (n.url) {
      window.open(n.url, '_blank', 'noopener,noreferrer,width=600,height=540');
    } else {
      const blob = `${shareText}\n\n${link}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(blob).then(() => {
          if (window.showToast) window.showToast(`Texte copié — colle-le dans ${n.label}`, { type: 'info', icon: '📋' });
        });
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Partager" width={460}>
      <div>
        <p style={{ fontSize: 13, color: T.text3, margin: '0 0 16px', lineHeight: 1.55 }}>
          Plus on est nombreux·euses, plus on pèse. Diffuse autour de toi.
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, padding: '10px 12px', background: T.surface2, borderRadius: 12, border: `1px solid ${T.border}` }}>
          <span style={{ flex: 1, fontSize: 13, color: T.text2, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', alignSelf: 'center' }}>{link}</span>
          <Btn variant="surface" size="sm" onClick={copy}>Copier</Btn>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Réseaux sociaux</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8 }}>
          {networks.map((n) =>
          <button key={n.id} onClick={() => handleShare(n)} aria-label={`Partager sur ${n.label}`}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, color: T.text1, cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}
          onMouseEnter={(e) => {e.currentTarget.style.background = n.color;e.currentTarget.style.color = '#fff';e.currentTarget.style.borderColor = n.color;}}
          onMouseLeave={(e) => {e.currentTarget.style.background = T.surface;e.currentTarget.style.color = T.text1;e.currentTarget.style.borderColor = T.border;}}>
              <span style={{ display: 'flex', flexShrink: 0 }}>{n.svg}</span>
              <span>{n.label}</span>
            </button>
          )}
        </div>
      </div>
    </Modal>);

}
window.ShareModal = ShareModal;

// ────────────── SignAnonymousModal ──────────────
// Permet de signer une pétition sans créer de compte (email seulement).
function SignAnonymousModal({ open, onClose, onSign, petitionTitle }) {
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', code_postal: '', newsletter: true });
  const [errors, setErrors] = useState({});
  const inputCss = { width: '100%', height: 46, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '0 14px', fontSize: 14, fontFamily: 'Inter,sans-serif', color: T.text1, background: T.bg, outline: 'none', boxSizing: 'border-box' };

  const submit = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email invalide';
    if (!form.firstName.trim()) errs.firstName = 'Prénom requis';
    if (!form.lastName.trim()) errs.lastName = 'Nom requis';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSign({ ...form, anonymous: true, signed_at: new Date().toISOString() });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Signer la pétition" width={460}>
      <div>
        <p style={{ fontSize: 13, color: T.text3, margin: '0 0 6px', lineHeight: 1.55 }}>
          Vous signez : <strong style={{ color: T.text1 }}>{petitionTitle}</strong>
        </p>
        <p style={{ fontSize: 12, color: T.text4, margin: '0 0 18px', lineHeight: 1.55 }}>
          Pas besoin de créer un compte. Votre email sert uniquement à confirmer votre signature.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prénom *</label>
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={{ ...inputCss, borderColor: errors.firstName ? '#DC2626' : T.border }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nom *</label>
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={{ ...inputCss, borderColor: errors.lastName ? '#DC2626' : T.border }} />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email *</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ ...inputCss, borderColor: errors.email ? '#DC2626' : T.border }} />
          {errors.email && <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{errors.email}</div>}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Code postal (optionnel)</label>
          <input value={form.code_postal} onChange={(e) => setForm({ ...form, code_postal: e.target.value })} placeholder="75011" style={inputCss} />
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.newsletter} onChange={(e) => setForm({ ...form, newsletter: e.target.checked })} style={{ marginTop: 3 }} />
          <span style={{ fontSize: 12, color: T.text3, lineHeight: 1.5 }}>Je souhaite recevoir les actualités de Maintenant ! et les mobilisations à venir (désinscription en 1 clic).</span>
        </label>
        <Btn full variant="gradient" size="lg" onClick={submit} icon={ICONS.check}>Signer la pétition</Btn>
        <p style={{ fontSize: 11, color: T.text4, marginTop: 10, textAlign: 'center', lineHeight: 1.5 }}>
          En signant, vous acceptez notre <a href="#rgpd" style={{ color: T.brand, textDecoration: 'underline' }}>politique de confidentialité</a>. Aucun compte créé.
        </p>
      </div>
    </Modal>);

}
window.SignAnonymousModal = SignAnonymousModal;

// ────────────── ParticipateAnonymousModal ──────────────
// Inscription à une mobilisation sans création de compte (email seulement).
function ParticipateAnonymousModal({ open, onClose, onParticipate, mobTitle, mobDate }) {
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', code_postal: '', remind: true });
  const [errors, setErrors] = useState({});
  const inputCss = { width: '100%', height: 46, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '0 14px', fontSize: 14, fontFamily: 'Inter,sans-serif', color: T.text1, background: T.bg, outline: 'none', boxSizing: 'border-box' };

  const submit = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email invalide';
    if (!form.firstName.trim()) errs.firstName = 'Prénom requis';
    if (!form.lastName.trim()) errs.lastName = 'Nom requis';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onParticipate({ ...form, anonymous: true, joined_at: new Date().toISOString() });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Participer à la mobilisation" width={460}>
      <div>
        <p style={{ fontSize: 13, color: T.text3, margin: '0 0 6px', lineHeight: 1.55 }}>
          Tu t'inscris à : <strong style={{ color: T.text1 }}>{mobTitle}</strong>
          {mobDate && <> · <span style={{ color: T.text2 }}>{new Date(mobDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span></>}
        </p>
        <p style={{ fontSize: 12, color: T.text4, margin: '0 0 18px', lineHeight: 1.55 }}>
          Pas besoin de créer un compte. Ton email sert à recevoir les infos pratiques (lieu de RDV, dernière minute, annulation).
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prénom *</label>
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={{ ...inputCss, borderColor: errors.firstName ? '#DC2626' : T.border }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nom *</label>
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={{ ...inputCss, borderColor: errors.lastName ? '#DC2626' : T.border }} />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email *</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ ...inputCss, borderColor: errors.email ? '#DC2626' : T.border }} />
          {errors.email && <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{errors.email}</div>}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Code postal (optionnel)</label>
          <input value={form.code_postal} onChange={(e) => setForm({ ...form, code_postal: e.target.value })} placeholder="75011" style={inputCss} />
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.remind} onChange={(e) => setForm({ ...form, remind: e.target.checked })} style={{ marginTop: 3 }} />
          <span style={{ fontSize: 12, color: T.text3, lineHeight: 1.5 }}>M'envoyer un rappel la veille de la mobilisation et m'informer en cas d'annulation ou de changement de lieu.</span>
        </label>
        <Btn full variant="gradient" size="lg" onClick={submit} icon={ICONS.check}>Confirmer ma participation</Btn>
        <p style={{ fontSize: 11, color: T.text4, marginTop: 10, textAlign: 'center', lineHeight: 1.5 }}>
          En participant, tu acceptes notre <a href="#rgpd" style={{ color: T.brand, textDecoration: 'underline' }}>politique de confidentialité</a>. Aucun compte créé.
        </p>
      </div>
    </Modal>);

}
window.ParticipateAnonymousModal = ParticipateAnonymousModal;

// ────────────── exportICS ──────────────
// Génère un fichier .ics standard (RFC 5545) téléchargeable pour une mobilisation.
window.exportICS = function (mob) {
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (dateStr, timeStr) => {
    const d = new Date(`${dateStr}T${timeStr || '12:00'}:00`);
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z';
  };
  const escape = (s) => String(s || '').replace(/[\\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
  const startUtc = fmt(mob.date, mob.time);
  const endDate = new Date(`${mob.date}T${mob.time || '12:00'}:00`);
  endDate.setHours(endDate.getHours() + 3);
  const endUtc = endDate.getUTCFullYear() + pad(endDate.getUTCMonth() + 1) + pad(endDate.getUTCDate()) + 'T' + pad(endDate.getUTCHours()) + pad(endDate.getUTCMinutes()) + '00Z';
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const ics = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Maintenant//Mobilisations//FR',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'BEGIN:VEVENT',
  `UID:mob-${mob.id}@maintenant.fr`,
  `DTSTAMP:${stamp}`,
  `DTSTART:${startUtc}`,
  `DTEND:${endUtc}`,
  `SUMMARY:${escape(mob.title)}`,
  `DESCRIPTION:${escape(mob.description)}`,
  `LOCATION:${escape(mob.location)}`,
  `ORGANIZER;CN=${escape(mob.organizer)}:mailto:contact@maintenant.fr`,
  'END:VEVENT',
  'END:VCALENDAR'].
  join('\r\n');

  try {
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mobilisation-${mob.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (window.showToast) window.showToast('Événement ajouté à ton agenda', { type: 'success', icon: '📅' });
  } catch (e) {
    if (window.showToast) window.showToast('Impossible de générer le fichier agenda', { type: 'error' });
  }
};

// ════════════════════════════════════════════════════════════
//   useLocalStore — hook de persistance localStorage
//   Utilisé pour stocker les contributions de l'utilisateur·rice
//   (logements, articles, sondages, etc. créés depuis l'app).
// ════════════════════════════════════════════════════════════
function useLocalStore(key, initial = []) {
  const [value, setValue] = useState(() => {
    try {const v = localStorage.getItem(key);return v ? JSON.parse(v) : initial;} catch {return initial;}
  });
  const update = useCallback((next) => {
    const v = typeof next === 'function' ? next(value) : next;
    setValue(v);
    try {localStorage.setItem(key, JSON.stringify(v));} catch {}
  }, [key, value]);
  return [value, update];
}
window.useLocalStore = useLocalStore;

// Helper : ajouter une création utilisateur dans un store par domaine
// Utilisation : addUserCreation('housing', { title, ... }) → renvoie l'objet stocké
window.addUserCreation = function (domain, data) {
  const key = `mn_user_${domain}`;
  let arr = [];
  try {arr = JSON.parse(localStorage.getItem(key) || '[]');} catch {}
  const item = { id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, _userCreated: true, _createdAt: Date.now(), ...data };
  arr = [item, ...arr];
  try {localStorage.setItem(key, JSON.stringify(arr));} catch {}
  return item;
};

window.getUserCreations = function (domain) {
  try {return JSON.parse(localStorage.getItem(`mn_user_${domain}`) || '[]');} catch {return [];}
};

window.deleteUserCreation = function (domain, id) {
  try {
    const key = `mn_user_${domain}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]').filter((x) => x.id !== id);
    localStorage.setItem(key, JSON.stringify(arr));
    return arr;
  } catch {return [];}
};

// ════════════════════════════════════════════════════════════
//   Toast — notification non-bloquante en bas d'écran
//   Remplace les alert() de "succès" par une bannière temporaire.
// ════════════════════════════════════════════════════════════
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const remove = (id) => setToasts((ts) => ts.filter((t) => t.id !== id));
  const push = (msg, opts = {}) => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts, { id, msg, type: opts.type || 'success', icon: opts.icon }]);
    setTimeout(() => remove(id), opts.duration || 3500);
  };
  // Expose globalement
  useEffect(() => {window.showToast = push;return () => {delete window.showToast;};}, []);
  return (
    <>
      {children}
      <div className="mn-toast-wrap" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none', maxWidth: '92vw' }}>
        {toasts.map((t) => {
          const colors = {
            success: { bg: '#16A34A', icon: '✓' },
            info: { bg: T.info, icon: 'ℹ' },
            error: { bg: '#DC2626', icon: '✕' },
            warn: { bg: T.warning, icon: '⚠' }
          };
          const c = colors[t.type] || colors.success;
          return (
            <div key={t.id} onClick={() => remove(t.id)}
            style={{
              pointerEvents: 'auto',
              background: c.bg, color: '#fff',
              padding: '12px 20px', borderRadius: 12,
              fontSize: 14, fontWeight: 600,
              fontFamily: 'Inter,sans-serif', letterSpacing: '-0.01em',
              boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              animation: 'fadeUp 0.3s cubic-bezier(0.4,0,0.2,1)',
              cursor: 'pointer', minWidth: 200
            }}>
              <span style={{ fontSize: 16 }}>{t.icon || c.icon}</span>
              <span style={{ flex: 1 }}>{t.msg}</span>
            </div>);

        })}
      </div>
    </>);

}
window.ToastProvider = ToastProvider;

// ════════════════════════════════════════════════════════════
//   CreateModal — formulaire de création générique
//   Configurable : title, fields (id, label, type, options...), onSave
//   Sauvegarde automatiquement dans localStorage via addUserCreation().
// ════════════════════════════════════════════════════════════
//   field = {
//     id, label, type ('text'|'textarea'|'select'|'number'|'date'|'photo'),
//     options (pour select), placeholder, required, hint
//   }
function CreateModal({ open, onClose, title, subtitle, fields = [], submitLabel = 'Publier', onSubmit, domain, defaultPhoto, color }) {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const c = color || T.brand;

  useEffect(() => {if (open) {setForm({});setErrors({});}}, [open]);

  const set = (k, v) => {setForm((f) => ({ ...f, [k]: v }));if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));};

  const validate = () => {
    const errs = {};
    fields.forEach((f) => {
      if (f.required && !String(form[f.id] || '').trim()) errs[f.id] = 'Champ requis';
      if (f.type === 'number' && form[f.id] && isNaN(+form[f.id])) errs[f.id] = 'Doit être un nombre';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const data = {};
    fields.forEach((f) => {data[f.id] = form[f.id] !== undefined ? form[f.id] : f.default || '';});
    if (!data.image && defaultPhoto) data.image = defaultPhoto;
    let result;
    if (domain) {
      const stored = window.addUserCreation(domain, data);
      if (typeof onSubmit === 'function') result = onSubmit(stored);
    } else if (typeof onSubmit === 'function') {
      result = onSubmit(data);
    }
    // Si onSubmit retourne explicitement false → on garde la modal ouverte (validation custom échouée)
    if (result === false) return;
    if (window.showToast) window.showToast(`${title} : publié·e !`, { type: 'success', icon: '🎉' });
    onClose();
  };

  const inputStyle = (err) => ({
    width: '100%', minHeight: 44, border: `1.5px solid ${err ? '#DC2626' : T.border}`, borderRadius: 12,
    padding: '10px 14px', fontSize: 14, fontFamily: 'Inter,sans-serif', color: T.text1,
    background: T.bg, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s'
  });

  return (
    <Modal open={open} onClose={onClose} title={title} width={560}>
      {subtitle && <p style={{ fontSize: 13, color: T.text3, margin: '-4px 0 18px', lineHeight: 1.55 }}>{subtitle}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {fields.map((f) =>
        <div key={f.id}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.text2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {f.label}{f.required && <span style={{ color: '#DC2626', marginLeft: 4 }}>*</span>}
            </label>
            {f.type === 'textarea' ?
          <textarea value={form[f.id] || ''} onChange={(e) => set(f.id, e.target.value)} rows={f.rows || 3} placeholder={f.placeholder || ''}
          style={{ ...inputStyle(errors[f.id]), height: 'auto', padding: '12px 14px', resize: 'vertical', lineHeight: 1.5, minHeight: f.rows ? f.rows * 24 : 80 }}
          onFocus={(e) => !errors[f.id] && (e.target.style.borderColor = c)} onBlur={(e) => !errors[f.id] && (e.target.style.borderColor = T.border)} /> :
          f.type === 'select' ?
          <select value={form[f.id] || ''} onChange={(e) => set(f.id, e.target.value)} style={inputStyle(errors[f.id])}
          onFocus={(e) => !errors[f.id] && (e.target.style.borderColor = c)} onBlur={(e) => !errors[f.id] && (e.target.style.borderColor = T.border)}>
                <option value="">— Choisir —</option>
                {(f.options || []).map((o) => <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>{typeof o === 'string' ? o : o.label}</option>)}
              </select> :
          f.type === 'photo' ?
          <input type="text" value={form[f.id] || ''} onChange={(e) => set(f.id, e.target.value)} placeholder="https://images.unsplash.com/..."
          style={inputStyle(errors[f.id])}
          onFocus={(e) => !errors[f.id] && (e.target.style.borderColor = c)} onBlur={(e) => !errors[f.id] && (e.target.style.borderColor = T.border)} /> :

          <input type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
          value={form[f.id] || ''} onChange={(e) => set(f.id, e.target.value)}
          placeholder={f.placeholder || ''} min={f.min} max={f.max}
          style={inputStyle(errors[f.id])}
          onFocus={(e) => !errors[f.id] && (e.target.style.borderColor = c)} onBlur={(e) => !errors[f.id] && (e.target.style.borderColor = T.border)} />
          }
            {errors[f.id] && <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{errors[f.id]}</div>}
            {!errors[f.id] && f.hint && <div style={{ fontSize: 11, color: T.text4, marginTop: 4 }}>{f.hint}</div>}
          </div>
        )}

        <div style={{ background: T.surface2, borderRadius: 10, padding: '10px 14px', fontSize: 11, color: T.text3, lineHeight: 1.5 }}>
          <strong style={{ color: T.text2 }}>Mode prototype :</strong> ta contribution sera enregistrée dans le navigateur (localStorage) et apparaîtra dans la liste avec un badge <strong>« Vous »</strong>. Pas de back-office en prod ici, mais ça résiste à un rechargement de page.
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <Btn variant="gradient" full size="lg" onClick={submit} icon={ICONS.check}>{submitLabel}</Btn>
          <Btn variant="ghost" size="lg" onClick={onClose}>Annuler</Btn>
        </div>
      </div>
    </Modal>);

}
window.CreateModal = CreateModal;

// ── Badge "Vous" pour les créations de l'utilisateur·rice ───
function UserBadge({ style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 9999,
      background: 'linear-gradient(90deg, #7C3AED, #E11D74)',
      color: '#fff', fontSize: 10, fontWeight: 800,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      boxShadow: '0 2px 6px rgba(225,29,116,0.3)',
      ...style
    }}>
      ✨ Vous
    </span>);

}
window.UserBadge = UserBadge;

// ── Toggle « rejoint / quitté » pour mobilisations, groupes, etc.
//    Stocké dans localStorage sous mn_join_<domain> = [id1, id2, ...]
window.toggleUserJoin = function (domain, id) {
  const key = `mn_join_${domain}`;
  let arr = [];
  try {arr = JSON.parse(localStorage.getItem(key) || '[]');} catch {}
  const idx = arr.indexOf(id);
  if (idx >= 0) arr.splice(idx, 1);else arr.push(id);
  try {localStorage.setItem(key, JSON.stringify(arr));} catch {}
  return arr.includes(id);
};
window.isUserJoined = function (domain, id) {
  try {return JSON.parse(localStorage.getItem(`mn_join_${domain}`) || '[]').includes(id);} catch {return false;}
};
window.getUserJoined = function (domain) {
  try {return JSON.parse(localStorage.getItem(`mn_join_${domain}`) || '[]');} catch {return [];}
};