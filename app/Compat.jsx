// Compat.jsx — Alias de compatibilité entre l'ancien UIKit et le nouveau Theme
// Permet aux anciens composants (CampaignPage, ReseauPage, AdminMessaging) de fonctionner
// sans être refactorisés

// ── Couleurs ───────────────────────────────────────────────
window.COLORS = {
  red:      T.brand,
  orange:   T.accent,
  redDark:  T.brandDark,
  gray50:   T.bg,
  gray100:  T.surface2,
  gray200:  T.border,
  gray400:  T.text4,
  gray500:  T.text3,
  gray700:  T.text2,
  gray900:  T.text1,
  white:    '#FFFFFF',
  green:    T.success,
  blue:     T.info,
  amber:    T.warning,
  purple:   '#7C3AED',
};

window.GRAD   = T.grad;
window.GRAD_R = T.gradR;

// ── Composants alias ───────────────────────────────────────

// Badge → Tag (avec mapping variant)
window.Badge = function Badge({ children, color='gray', style={} }) {
  const variantMap = { red:'brand', green:'success', blue:'info', amber:'warning', gray:'default', purple:'default', orange:'warning' };
  return React.createElement(Tag, { variant: variantMap[color]||'default', size:'xs', style }, children);
};

// Progress → ProgressBar
window.Progress = function Progress({ value, max }) {
  return React.createElement(ProgressBar, { value, max, height:5 });
};

// T99 → TokenDisplay
window.T99 = function T99({ value, size=14 }) {
  const sizeMap = { 10:'xs', 11:'xs', 12:'sm', 13:'sm', 14:'sm', 16:'md', 18:'lg', 22:'xl', 24:'xl' };
  const s = sizeMap[size] || 'sm';
  return React.createElement(TokenDisplay, { amount: value, size: s });
};

// AdminEdit → AdminBtn
window.AdminEdit = function AdminEdit({ onEdit, label, style={} }) {
  return React.createElement(AdminBtn, { onEdit, style });
};

// ImgPlaceholder → Photo
window.ImgPlaceholder = function ImgPlaceholder({ style={}, text='', icon='' }) {
  return React.createElement(Photo, { style, alt: text });
};

// PageWrap → PageContainer
window.PageWrap = function PageWrap({ children, title, subtitle, action }) {
  return React.createElement(PageContainer, { maxWidth: 1200 },
    (title || subtitle || action) ? React.createElement('div', null,
      React.createElement(SectionTitle, { title: title||'', action }),
      subtitle ? React.createElement('p', { style:{ fontSize:14, color:T.text3, marginBottom:24 } }, subtitle) : null,
      children
    ) : children
  );
};

// SectionHeader → SectionTitle
window.SectionHeader = function SectionHeader({ title, sub, action }) {
  return React.createElement(SectionTitle, { title, action },
    sub ? React.createElement('p', { style:{ fontSize:13, color:T.text3, marginTop:4 } }, sub) : null
  );
};

// SearchBar → SearchInput
window.SearchBar = function SearchBar({ value, onChange, placeholder }) {
  return React.createElement(SearchInput, { value, onChange, placeholder });
};

// FilterPills → FilterTabs
window.FilterPills = function FilterPills({ options, active, onChange }) {
  return React.createElement(FilterTabs, { options, active, onChange });
};

// T99Modal → PayModal
window.T99Modal = function T99Modal({ open, onClose, amount, item, description }) {
  return React.createElement(PayModal, { open, onClose, amount, item, description });
};

// inputSt — style d'input partagé
window.inputSt = {
  width:'100%', height:44, border:`1.5px solid ${T.border}`, borderRadius:12,
  padding:'0 14px', fontSize:14, fontFamily:'Inter,sans-serif', color:T.text1,
  background:T.bg, outline:'none', boxSizing:'border-box',
};

// Stars reste identique (même nom dans Theme)

// Dummy components pour les pages non encore migrées
window.MHomePage       = function() { return null; };
window.MHeader         = function() { return null; };
window.MBottomNav      = function() { return null; };
window.MFooter         = function() { return null; };
window.MPetitionCard   = function() { return null; };
window.MServicesPage   = function() { return null; };
window.MCreerPage      = function() { return null; };
window.MReseauPage     = function() { return null; };
window.MLoginPage      = function() { return null; };
