// UIKit.jsx — Composants partagés Maintenant!
// Header, BottomNav, T99CPModal, AuthModal, AdminBar, et utilitaires UI

const { useState, useEffect, useRef, useCallback } = React;

// ── Constantes ─────────────────────────────────────────────
const COLORS = {
  red: '#E11D74', orange: '#7C3AED', redDark: '#B91560',
  gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB',
  gray400: '#9CA3AF', gray500: '#6B7280', gray700: '#374151', gray900: '#111827',
  white: '#FFFFFF', green: '#16A34A', blue: '#2563EB', amber: '#D97706', purple: '#7C3AED',
};
const GRAD = 'linear-gradient(135deg,#E11D74,#7C3AED)';
const GRAD_R = 'linear-gradient(to right,#E11D74,#7C3AED)';
window.COLORS = COLORS; window.GRAD = GRAD; window.GRAD_R = GRAD_R;

// ── Btn ────────────────────────────────────────────────────
function Btn({ children, onClick, variant='primary', size='md', full=false, style={}, disabled=false }) {
  const [hov, setHov] = useState(false);
  const base = { display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
    fontFamily:'Inter,sans-serif', fontWeight:700, border:'none', cursor: disabled?'default':'pointer',
    transition:'all 0.18s', borderRadius:9999, width: full?'100%':'auto', opacity: disabled?0.5:1 };
  const sizes = { sm:{height:32,padding:'0 14px',fontSize:12}, md:{height:42,padding:'0 20px',fontSize:14}, lg:{height:50,padding:'0 28px',fontSize:16} };
  const variants = {
    primary: { background: hov?COLORS.redDark:COLORS.red, color:'#fff', boxShadow: hov?'0 6px 20px rgba(225,29,116,0.35)':'0 4px 14px rgba(225,29,116,0.25)', transform: hov?'translateY(-1px)':'none' },
    gradient: { background: GRAD_R, color:'#fff', boxShadow: hov?'0 8px 24px rgba(225,29,116,0.35)':'0 4px 14px rgba(225,29,116,0.2)', transform: hov?'scale(1.03)':'none' },
    outline: { background:'transparent', color:COLORS.red, border:`2px solid ${COLORS.red}`, boxShadow:'none' },
    ghost: { background: hov?COLORS.gray100:'transparent', color:COLORS.gray700 },
    white: { background: hov?'#F5F5F5':'#fff', color:COLORS.red, boxShadow:'0 4px 12px rgba(0,0,0,0.12)' },
    danger: { background: hov?'#b91c1c':'#EF4444', color:'#fff' },
    success: { background: hov?'#15803d':COLORS.green, color:'#fff' },
    t99cp: { background: hov?'#1d4ed8':COLORS.blue, color:'#fff', boxShadow:'0 4px 14px rgba(37,99,235,0.3)' },
  };
  return <button onClick={disabled?undefined:onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{...base,...sizes[size],...variants[variant],...style}}>{children}</button>;
}

// ── Card ───────────────────────────────────────────────────
function Card({ children, style={}, hover=true, onClick }) {
  const [hov, setHov] = useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ background:'#fff', borderRadius:16, border:`1px solid ${COLORS.gray200}`, transition:'all 0.2s', cursor: onClick?'pointer':'default', boxShadow: (hover&&hov)?'0 8px 30px rgba(0,0,0,0.09)':'0 1px 3px rgba(0,0,0,0.05)', transform: (hover&&hov)?'translateY(-2px)':'none', ...style }}>{children}</div>;
}

// ── Badge ──────────────────────────────────────────────────
function Badge({ children, color='gray', style={} }) {
  const colors = { red:{bg:'#FEE2E2',text:'#B91560'}, orange:{bg:'#FEF3C7',text:'#92400E'}, green:{bg:'#DCFCE7',text:'#166534'}, blue:{bg:'#DBEAFE',text:'#1e40af'}, gray:{bg:COLORS.gray100,text:COLORS.gray700}, purple:{bg:'#F3E8FF',text:'#6b21a8'}, amber:{bg:'#FEF9C3',text:'#854D0E'} };
  const c = colors[color] || colors.gray;
  return <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:9999, fontSize:11, fontWeight:600, background:c.bg, color:c.text, ...style }}>{children}</span>;
}

// ── Progress ───────────────────────────────────────────────
function Progress({ value, max, color='red' }) {
  const pct = Math.min(Math.round((value/max)*100),100);
  const colors = { red:GRAD_R, green:'linear-gradient(to right,#16A34A,#4ADE80)', blue:'linear-gradient(to right,#2563EB,#60A5FA)' };
  return (
    <div>
      <div style={{ height:6, background:COLORS.gray100, borderRadius:9999, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:colors[color]||colors.red, borderRadius:9999, transition:'width 0.8s ease' }}></div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, fontSize:11, color:COLORS.gray500 }}>
        <span style={{ fontWeight:700, color:COLORS.red }}>{pct}%</span>
        <span>{value.toLocaleString('fr-FR')} / {max.toLocaleString('fr-FR')}</span>
      </div>
    </div>
  );
}

// ── T99CP Icon ─────────────────────────────────────────────
function T99({ value, size=14 }) {
  return <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontWeight:700, color:COLORS.blue, fontSize:size }}>
    <span style={{ background:GRAD_R, borderRadius:'50%', width:size+4, height:size+4, display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:size-3, fontWeight:800, flexShrink:0 }}>₮</span>
    {value} T99CP
  </span>;
}

// ── Modal ──────────────────────────────────────────────────
function Modal({ open, onClose, title, children, width=480 }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:width, maxHeight:'90vh', overflow:'auto', boxShadow:'0 24px 60px rgba(0,0,0,0.2)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'20px 24px 16px', borderBottom:`1px solid ${COLORS.gray200}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:700, color:COLORS.gray900, margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ border:'none', background:COLORS.gray100, borderRadius:'50%', width:32, height:32, cursor:'pointer', fontSize:18, color:COLORS.gray500, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>
        <div style={{ padding:24 }}>{children}</div>
      </div>
    </div>
  );
}

// ── T99CP Payment Modal ────────────────────────────────────
function T99Modal({ open, onClose, amount, item, description }) {
  return (
    <Modal open={open} onClose={onClose} title="Paiement en T99CP" width={440}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:GRAD, margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(225,29,116,0.3)' }}>
          <span style={{ fontSize:32 }}>₮</span>
        </div>
        <h4 style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:700, color:COLORS.gray900, margin:'0 0 6px' }}>{item}</h4>
        <p style={{ fontSize:13, color:COLORS.gray500, margin:'0 0 20px', lineHeight:1.5 }}>{description}</p>
        <div style={{ background:COLORS.gray50, borderRadius:14, padding:'16px 20px', marginBottom:20, border:`1px solid ${COLORS.gray200}` }}>
          <div style={{ fontSize:12, color:COLORS.gray500, marginBottom:4 }}>Montant à payer</div>
          <div style={{ fontSize:32, fontWeight:800, fontFamily:"'Sora',sans-serif", color:COLORS.blue }}>{amount} T99CP</div>
          <div style={{ fontSize:12, color:COLORS.gray400, marginTop:4 }}>= {amount} € · = {amount} minutes de travail</div>
        </div>
        <div style={{ fontSize:12, color:COLORS.gray500, marginBottom:20, lineHeight:1.6, background:'#EFF6FF', padding:'10px 14px', borderRadius:10, border:'1px solid #BFDBFE' }}>
          <strong style={{ color:COLORS.blue }}>ℹ️ Wallet requis :</strong> Le paiement s'effectue via votre wallet T99CP sur Polygon. Vous allez être redirigé vers le site THE99COINPROJECT.
        </div>
        <Btn full variant="t99cp" onClick={() => { onClose(); window.open('https://the99coinproject.org', '_blank'); }} style={{ marginBottom:8 }}>
          🌐 Payer sur The99CoinProject.org
        </Btn>
        <Btn full variant="ghost" onClick={onClose} size="sm">Annuler</Btn>
      </div>
    </Modal>
  );
}
window.T99Modal = T99Modal;

// ── Auth Modal ─────────────────────────────────────────────
function AuthModal({ open, onClose, onLogin }) {
  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [email, setEmail] = useState(''); const [pwd, setPwd] = useState('');
  const [name, setName] = useState(''); const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({ name: name || email.split('@')[0] || 'Militant·e', email, t99cp_balance: 50, is_admin: email.includes('admin'), badges: ['Nouveau membre'], joined: new Date().toISOString().split('T')[0] });
      setLoading(false); onClose();
    }, 800);
  };

  const handleGoogle = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({ name: 'Utilisateur Google', email: 'user@gmail.com', t99cp_balance: 50, is_admin: false, badges: ['Nouveau membre'], joined: new Date().toISOString().split('T')[0] });
      setLoading(false); onClose();
    }, 600);
  };

  return (
    <Modal open={open} onClose={onClose} title={mode==='login'?'Connexion':mode==='signup'?'Créer un compte':'Mot de passe oublié'} width={420}>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {/* Social auth */}
        <button onClick={handleGoogle} style={{ width:'100%', height:46, border:`1.5px solid ${COLORS.gray200}`, borderRadius:12, background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontSize:14, fontWeight:600, color:COLORS.gray700, transition:'background 0.15s' }} onMouseEnter={e=>e.currentTarget.style.background=COLORS.gray50} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continuer avec Google
        </button>
        <button style={{ width:'100%', height:46, border:`1.5px solid ${COLORS.gray200}`, borderRadius:12, background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontSize:14, fontWeight:600, color:'#fff' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          Continuer avec Instagram
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:10, margin:'4px 0' }}>
          <div style={{ flex:1, height:1, background:COLORS.gray200 }}></div>
          <span style={{ fontSize:12, color:COLORS.gray400, fontWeight:500 }}>ou par email</span>
          <div style={{ flex:1, height:1, background:COLORS.gray200 }}></div>
        </div>

        {mode === 'signup' && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Votre prénom & nom" style={inputStyle} />}
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="votre@email.fr" style={inputStyle} />
        {mode !== 'forgot' && <input value={pwd} onChange={e=>setPwd(e.target.value)} type="password" placeholder="Mot de passe" style={inputStyle} />}

        <Btn full variant="gradient" onClick={handleSubmit} disabled={loading}>
          {loading ? '...' : mode==='login'?'Se connecter':mode==='signup'?'Créer mon compte':'Envoyer le lien'}
        </Btn>

        <div style={{ textAlign:'center', fontSize:12, color:COLORS.gray500 }}>
          {mode==='login' && <><span style={{ cursor:'pointer', color:COLORS.red }} onClick={()=>setMode('signup')}>Créer un compte</span> · <span style={{ cursor:'pointer', color:COLORS.gray400 }} onClick={()=>setMode('forgot')}>Mot de passe oublié ?</span></>}
          {mode==='signup' && <span style={{ cursor:'pointer', color:COLORS.red }} onClick={()=>setMode('login')}>Déjà inscrit ? Se connecter</span>}
          {mode==='forgot' && <span style={{ cursor:'pointer', color:COLORS.red }} onClick={()=>setMode('login')}>← Retour à la connexion</span>}
        </div>
      </div>
    </Modal>
  );
}
const inputStyle = { width:'100%', height:44, border:`1.5px solid #E5E7EB`, borderRadius:12, padding:'0 14px', fontSize:14, fontFamily:'Inter,sans-serif', outline:'none', boxSizing:'border-box' };
window.AuthModal = AuthModal;

// ── Admin Edit Button ──────────────────────────────────────
function AdminEdit({ onEdit, label='Modifier', style={} }) {
  return <button onClick={onEdit} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:9999, border:`1.5px solid #D97706`, background:'#FEF9C3', color:'#92400E', fontSize:11, fontWeight:700, cursor:'pointer', ...style }}>✏️ {label}</button>;
}
window.AdminEdit = AdminEdit;

// ── Edit Modal (générique) ─────────────────────────────────
function EditModal({ open, onClose, title, fields, data, onSave }) {
  const [form, setForm] = useState(data||{});
  useEffect(()=>{ if(data) setForm(data); },[data]);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <Modal open={open} onClose={onClose} title={`✏️ ${title}`} width={520}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {fields.map(f=>(
          <div key={f.key}>
            <label style={{ fontSize:12, fontWeight:600, color:COLORS.gray700, display:'block', marginBottom:4 }}>{f.label}</label>
            {f.type==='textarea'
              ? <textarea value={form[f.key]||''} onChange={e=>set(f.key,e.target.value)} rows={4} style={{...inputStyle,height:'auto',padding:'10px 14px',resize:'vertical'}} />
              : f.type==='select'
              ? <select value={form[f.key]||''} onChange={e=>set(f.key,e.target.value)} style={inputStyle}>{f.options.map(o=><option key={o}>{o}</option>)}</select>
              : <input type={f.type||'text'} value={form[f.key]||''} onChange={e=>set(f.key,e.target.value)} style={inputStyle} />
            }
          </div>
        ))}
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <Btn variant="gradient" full onClick={()=>{onSave(form);onClose();}}>💾 Enregistrer</Btn>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        </div>
      </div>
    </Modal>
  );
}
window.EditModal = EditModal;

// ── Header ─────────────────────────────────────────────────
function Header({ activePage, setActivePage, user, onOpenAuth, onLogout, adminMode, setAdminMode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if(profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  },[]);

  const navLinks = [
    { id:'home', label:'Accueil', icon:'🏠' },
    { id:'petitions', label:'Pétitions', icon:'📜' },
    { id:'mobilizations', label:'Mobilisations', icon:'📅' },
    { id:'crowdfunding', label:'Cagnottes', icon:'💰' },
    { id:'services', label:'Services', icon:'⚙️' },
    { id:'media', label:'Média', icon:'📰' },
  ];

  return (
    <header style={{ background:'rgba(255,255,255,0.97)', backdropFilter:'blur(12px)', borderBottom:`1px solid ${COLORS.gray200}`, position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
      {adminMode && <div style={{ background:'linear-gradient(to right,#D97706,#F59E0B)', padding:'4px 16px', textAlign:'center', fontSize:11, fontWeight:700, color:'#fff', letterSpacing:'0.04em' }}>⚙️ MODE ADMINISTRATEUR ACTIF — Les boutons Modifier sont visibles</div>}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>
        {/* Logo */}
        <div onClick={()=>setActivePage('home')} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
          <div style={{ width:36, height:36, borderRadius:10, background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 10px rgba(225,29,116,0.3)' }}>
            <span style={{ color:'#fff', fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14 }}>M!</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', lineHeight:1.1 }}>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, color:COLORS.red, letterSpacing:'-0.01em' }}>Maintenant !</span>
            <span style={{ fontSize:9, color:COLORS.gray400, fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase' }}>La voix des 99%</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav style={{ display:'flex', alignItems:'center', gap:2 }} className="mn-desktop-nav">
          {navLinks.map(l=>(
            <button key={l.id} onClick={()=>setActivePage(l.id)} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'Inter,sans-serif', transition:'all 0.15s', background: activePage===l.id ? GRAD_R : 'transparent', color: activePage===l.id ? '#fff' : COLORS.gray700, boxShadow: activePage===l.id ? '0 3px 10px rgba(225,29,116,0.2)' : 'none' }}>
              <span>{l.icon}</span><span>{l.label}</span>
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* T99CP balance */}
          {user && <div onClick={()=>setActivePage('profile')} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:9999, background:COLORS.gray100, cursor:'pointer', border:`1px solid ${COLORS.gray200}` }}>
            <span style={{ fontSize:14 }}>₮</span>
            <span style={{ fontWeight:700, fontSize:13, color:COLORS.blue }}>{user.t99cp_balance} T99CP</span>
          </div>}

          {user ? (
            <div style={{ position:'relative' }} ref={profileRef}>
              <div onClick={()=>setProfileOpen(!profileOpen)} style={{ width:36, height:36, borderRadius:'50%', background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', border:'2px solid #fff', boxShadow:'0 2px 8px rgba(225,29,116,0.25)' }}>
                {user.name?.charAt(0)?.toUpperCase()||'U'}
              </div>
              {profileOpen && (
                <div style={{ position:'absolute', right:0, top:'calc(100% + 8px)', width:220, background:'#fff', border:`1px solid ${COLORS.gray200}`, borderRadius:16, boxShadow:'0 8px 30px rgba(0,0,0,0.12)', overflow:'hidden', zIndex:200 }}>
                  <div style={{ padding:'12px 14px', borderBottom:`1px solid ${COLORS.gray100}` }}>
                    <div style={{ fontWeight:700, fontSize:13, color:COLORS.gray900 }}>{user.name}</div>
                    <div style={{ fontSize:11, color:COLORS.gray500 }}>{user.email}</div>
                    <div style={{ marginTop:4 }}><T99 value={user.t99cp_balance} size={12} /></div>
                  </div>
                  {[['👤','Mon profil','profile'],['➕','Créer','creer'],['🔔','Notifications','notifications']].map(([icon,label,page])=>(
                    <div key={page} onClick={()=>{setActivePage(page);setProfileOpen(false);}} style={{ padding:'10px 14px', fontSize:13, color:COLORS.gray700, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }} onMouseEnter={e=>e.currentTarget.style.background=COLORS.gray50} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      {icon} {label}
                    </div>
                  ))}
                  <div style={{ borderTop:`1px solid ${COLORS.gray100}`, padding:'6px 14px' }}>
                    <div onClick={()=>setAdminMode(!adminMode)} style={{ padding:'8px 0', fontSize:13, color: adminMode?COLORS.amber:COLORS.gray700, cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontWeight: adminMode?700:400 }}>
                      ⚙️ {adminMode?'Désactiver':'Activer'} mode admin
                    </div>
                    <div onClick={()=>{onLogout();setProfileOpen(false);}} style={{ padding:'8px 0', fontSize:13, color:'#EF4444', cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>🚪 Se déconnecter</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Btn variant="gradient" size="sm" onClick={onOpenAuth}>Se connecter</Btn>
          )}

          {/* Mobile menu btn */}
          <button onClick={()=>setMobileOpen(!mobileOpen)} className="mn-mobile-menu" style={{ display:'none', padding:8, border:'none', background:'transparent', cursor:'pointer', borderRadius:8, fontSize:20 }}>
            {mobileOpen?'✕':'☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ borderTop:`1px solid ${COLORS.gray200}`, background:'#fff', padding:'8px 16px 12px' }} className="mn-mobile-nav">
          {navLinks.map(l=>(
            <button key={l.id} onClick={()=>{setActivePage(l.id);setMobileOpen(false);}} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'12px 14px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:600, fontSize:14, fontFamily:'Inter,sans-serif', marginBottom:2, background: activePage===l.id ? GRAD_R : 'transparent', color: activePage===l.id ? '#fff' : COLORS.gray700 }}>
              <span style={{ fontSize:18 }}>{l.icon}</span>{l.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

// ── Bottom Nav ─────────────────────────────────────────────
function BottomNav({ activePage, setActivePage, user }) {
  const tabs = [
    { id:'home', icon:'🏠', label:'Accueil' },
    { id:'petitions', icon:'📜', label:'Pétitions' },
    null,
    { id:'services', icon:'⚙️', label:'Services' },
    { id:'profile', icon:'👤', label:'Profil' },
  ];
  return (
    <nav style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(255,255,255,0.97)', backdropFilter:'blur(12px)', borderTop:`1px solid ${COLORS.gray200}`, display:'flex', alignItems:'center', justifyContent:'space-around', padding:'6px 8px calc(6px + env(safe-area-inset-bottom))', boxShadow:'0 -4px 20px rgba(0,0,0,0.07)', zIndex:99 }} className="mn-bottom-nav">
      {tabs.map((t,i)=>{
        if(t===null) return (
          <div key="fab" style={{ flex:1, display:'flex', justifyContent:'center', position:'relative', top:-16 }}>
            <button onClick={()=>setActivePage('creer')} style={{ width:52, height:52, borderRadius:'50%', background:GRAD, border:'3px solid #F9FAFB', color:'#fff', fontSize:26, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 20px rgba(225,29,116,0.4)', cursor:'pointer' }}>+</button>
          </div>
        );
        const active = activePage===t.id;
        return (
          <button key={t.id} onClick={()=>setActivePage(t.id)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'4px 2px', border:'none', background:'transparent', cursor:'pointer', color: active?COLORS.red:COLORS.gray400, position:'relative' }}>
            {active && <div style={{ position:'absolute', top:0, width:20, height:3, background:GRAD_R, borderRadius:9999 }}></div>}
            <span style={{ fontSize:20, lineHeight:1 }}>{t.icon}</span>
            <span style={{ fontSize:10, fontWeight:600, fontFamily:'Inter,sans-serif' }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Page Wrapper ───────────────────────────────────────────
function PageWrap({ children, title, subtitle, action }) {
  return (
    <div style={{ maxWidth:1152, margin:'0 auto', padding:'24px 16px 100px' }}>
      {(title||subtitle||action) && (
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div>
            {title && <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(20px,4vw,28px)', fontWeight:800, color:COLORS.gray900, margin:'0 0 4px', letterSpacing:'-0.02em' }}>{title}</h1>}
            {subtitle && <p style={{ fontSize:14, color:COLORS.gray500, margin:0 }}>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Image Placeholder ──────────────────────────────────────
function ImgPlaceholder({ style={}, text='', icon='📷' }) {
  return <div style={{ background:`linear-gradient(135deg,#1F2937,#374151)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.3)', gap:6, ...style }}>
    <span style={{ fontSize:28 }}>{icon}</span>
    {text && <span style={{ fontSize:11, fontWeight:500 }}>{text}</span>}
  </div>;
}

// ── Star Rating ────────────────────────────────────────────
function Stars({ rating }) {
  return <span style={{ color:'#F59E0B', fontSize:12 }}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5-Math.round(rating))} <span style={{ color:COLORS.gray500, fontWeight:500 }}>{rating}</span></span>;
}

// ── Search Bar ─────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position:'relative', marginBottom:16 }}>
      <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16, color:COLORS.gray400 }}>🔍</span>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||'Rechercher...'} style={{ width:'100%', height:44, border:`1.5px solid ${COLORS.gray200}`, borderRadius:12, paddingLeft:42, paddingRight:14, fontSize:14, fontFamily:'Inter,sans-serif', color:COLORS.gray900, background:COLORS.gray50, outline:'none', boxSizing:'border-box', transition:'border-color 0.2s,background 0.2s' }} onFocus={e=>{e.target.style.borderColor=COLORS.red;e.target.style.background='#fff';}} onBlur={e=>{e.target.style.borderColor=COLORS.gray200;e.target.style.background=COLORS.gray50;}} />
    </div>
  );
}

// ── Filter Pills ───────────────────────────────────────────
function FilterPills({ options, active, onChange }) {
  return (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
      {options.map(o=>(
        <button key={o} onClick={()=>onChange(o)} style={{ padding:'6px 14px', borderRadius:9999, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'Inter,sans-serif', transition:'all 0.15s', background: active===o ? GRAD_R : COLORS.gray100, color: active===o ? '#fff' : COLORS.gray700, boxShadow: active===o ? '0 3px 10px rgba(225,29,116,0.2)' : 'none' }}>{o}</button>
      ))}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────
function EmptyState({ icon, title, desc }) {
  return <div style={{ textAlign:'center', padding:'60px 20px', color:COLORS.gray400 }}>
    <div style={{ fontSize:48, marginBottom:12 }}>{icon}</div>
    <p style={{ fontWeight:700, color:COLORS.gray700, fontSize:16, margin:'0 0 6px' }}>{title}</p>
    {desc && <p style={{ fontSize:14, color:COLORS.gray500, margin:0 }}>{desc}</p>}
  </div>;
}

// ── Section Header ─────────────────────────────────────────
function SectionHeader({ icon, iconBg, title, sub, action }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:42, height:42, borderRadius:12, background:iconBg||GRAD, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:'0 4px 12px rgba(225,29,116,0.2)', flexShrink:0 }}>{icon}</div>
        <div><h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(16px,3vw,22px)', fontWeight:700, color:COLORS.gray900, margin:'0 0 2px', letterSpacing:'-0.01em' }}>{title}</h2>{sub&&<p style={{ fontSize:13, color:COLORS.gray500, margin:0 }}>{sub}</p>}</div>
      </div>
      {action}
    </div>
  );
}

// Expose everything
Object.assign(window, { Btn, Card, Badge, Progress, T99, Modal, AdminEdit, EditModal, Header, BottomNav, PageWrap, ImgPlaceholder, Stars, SearchBar, FilterPills, EmptyState, SectionHeader });
