// Pages_Home.jsx — Accueil + Navigation redesignés
const { useState, useEffect, useRef } = React;

// ── NAVIGATION ─────────────────────────────────────────────
function AppNav({ page, setPage, user, onAuth, onLogout, adminMode, setAdminMode }) {
  const [mob, setMob] = useState(false);
  const [prof, setProf] = useState(false);
  const [commerceOpen, setCommerceOpen] = useState(false);
  const profRef = useRef(null);
  const commerceRef = useRef(null);

  useEffect(() => {
    const h = e => {
      if (profRef.current && !profRef.current.contains(e.target)) setProf(false);
      if (commerceRef.current && !commerceRef.current.contains(e.target)) setCommerceOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const go = p => { setPage(p); setMob(false); setProf(false); setCommerceOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // ── Nav séparée en 2 groupes : INFORMATION (mobilisation) / COMMERCE (entraide)
  const navInfo = [
    { id: 'home', label: 'Accueil' },
    { id: 'petitions', label: 'Pétitions' },
    { id: 'mobilizations', label: 'Mobilisations' },
    { id: 'campaigns', label: 'Campagnes' },
    { id: 'media', label: 'Média' },
    { id: 'polls', label: 'Sondages' },
    { id: 'reseau', label: 'Réseau' },
  ];
  const navCommerce = [
    { id: 'services', label: 'Tous les services', desc: 'Hub avec tous les services solidaires' },
    { id: 'sel', label: 'SEL', desc: 'Système d\'échange local — temps & compétences' },
    { id: 'marketplace', label: 'Marketplace', desc: 'Achats solidaires en T99CP' },
    { id: 'lending', label: 'Ki Prête Tout', desc: 'Objets à emprunter entre voisins' },
    { id: 'carpooling', label: 'Covoiturage', desc: 'Trajets partagés style BlaBlaCar' },
    { id: 'housing', label: 'Hébergement', desc: 'Logement solidaire style Airbnb' },
    { id: 'garden', label: 'Surplus Jardin', desc: 'Fruits, légumes, plants, miel' },
  ];

  const navLinkStyle = (id) => ({
    display: 'flex', alignItems: 'center', padding: '20px 12px', border: 'none',
    cursor: 'pointer', fontWeight: page === id ? 700 : 500, fontSize: 13, fontFamily: 'Inter,sans-serif',
    background: page === id ? T.brandLight : 'transparent',
    color: page === id ? T.brand : T.text2,
    transition: 'all 0.15s', letterSpacing: '-0.01em',
    borderBottom: page === id ? `2px solid ${T.brand}` : '2px solid transparent',
  });

  const commerceActive = navCommerce.some(c => c.id === page);

  return (
    <header style={{ background: 'rgba(250,250,249,0.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, zIndex: 200 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <div onClick={() => go('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0, paddingRight: 24, borderRight: `1px solid ${T.border}` }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: T.gradR, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(225,29,116,0.3)' }}>
            <span style={{ color: '#fff', fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13 }}>M!</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: T.brand, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Maintenant !</div>
            <div style={{ fontSize: 9, color: T.text4, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>La voix des 99%</div>
          </div>
        </div>

        {/* Desktop Nav — INFORMATION | COMMERCE (mega-menu) | COMMUNES */}
        <nav className="mn-desk" style={{ display: 'flex', alignItems: 'stretch', gap: 0, flex: 1, paddingLeft: 8, overflowX: 'auto' }}>
          <div style={{ display:'flex', position:'relative', paddingLeft:6 }}>
            <span style={{ position:'absolute', top:6, left:8, fontSize:8, fontWeight:800, color:T.text4, letterSpacing:'0.12em' }}>INFORMATION</span>
            {navInfo.map(l => <button key={l.id} onClick={() => go(l.id)} style={navLinkStyle(l.id)}>{l.label}</button>)}
          </div>
          <div style={{ width:1, background:T.border, margin:'10px 12px' }}></div>
          <div ref={commerceRef} style={{ display:'flex', position:'relative', paddingLeft:6 }}>
            <span style={{ position:'absolute', top:6, left:8, fontSize:8, fontWeight:800, color:T.text4, letterSpacing:'0.12em' }}>COMMERCE</span>
            <button onClick={() => setCommerceOpen(!commerceOpen)} aria-haspopup="menu" aria-expanded={commerceOpen} style={{ ...navLinkStyle(commerceActive ? page : 'services'), gap: 6 }}>
              {navCommerce[0].label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: commerceOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {commerceOpen && (
              <div role="menu" style={{ position: 'absolute', top: 'calc(100% - 1px)', left: 0, width: 540, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 300, padding: 12 }}>
                <button role="menuitem" onClick={() => go('services')} style={{ width:'100%', textAlign:'left', padding:'12px 14px', borderRadius:12, border:'none', background: T.brandLight, cursor:'pointer', marginBottom: 8, fontFamily:'Inter,sans-serif' }}>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14, color:T.brand }}>Tous les services →</div>
                  <div style={{ fontSize:11, color:T.text3, marginTop:2 }}>Hub avec tous les services solidaires</div>
                </button>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 6 }}>
                  {navCommerce.slice(1).map(s => (
                    <button key={s.id} role="menuitem" onClick={() => go(s.id)} style={{ textAlign:'left', padding:'10px 12px', borderRadius:10, border:'none', background: page === s.id ? T.brandLight : 'transparent', cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'background 0.15s' }}
                      onMouseEnter={e => page !== s.id && (e.currentTarget.style.background = T.surface2)} onMouseLeave={e => page !== s.id && (e.currentTarget.style.background = 'transparent')}>
                      <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:13, color: page === s.id ? T.brand : T.text1 }}>{s.label}</div>
                      <div style={{ fontSize:11, color:T.text4, marginTop:2 }}>{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ width:1, background:T.border, margin:'10px 12px' }}></div>
          <button onClick={() => go('communes')} style={{ ...navLinkStyle('communes'), color: page==='communes' ? '#fff' : T.text1, fontWeight:800, background: page==='communes' ? T.gradR : 'transparent', borderBottom: page==='communes' ? '2px solid transparent' : '2px solid transparent', boxShadow: page==='communes' ? '0 4px 14px rgba(225,29,116,0.25)' : 'none', borderRadius: page==='communes' ? 9 : 0, margin: page==='communes' ? '12px 0' : 0 }}>
            ★ Communes Libres {!user?.is_member && <span style={{ marginLeft:6, fontSize:9, padding:'2px 7px', background: page==='communes' ? 'rgba(255,255,255,0.25)' : T.gradR, color:'#fff', letterSpacing:'0.06em', borderRadius:9999, fontWeight:700 }}>ADHÉRENT·ES</span>}
          </button>
        </nav>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16, borderLeft: `1px solid ${T.border}` }}>
          {adminMode && (
            <div aria-label="Mode admin actif" title="Mode admin actif — les contrôles d'édition sont visibles" style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:9999, background:T.warnLight, color:T.warning, border:`1px solid ${T.warning}`, fontSize:11, fontWeight:700, letterSpacing:'0.04em' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:T.warning, display:'inline-block' }}></span>
              ADMIN
            </div>
          )}
          {user && (
            <>
              <a href="https://the99coinproject.org" target="_blank" rel="noopener noreferrer" aria-label={`Wallet T99CP — ${user.t99cp_balance} T99CP — ouvre dans un nouvel onglet`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 9, background: T.infoLight, cursor: 'pointer', border: `1px solid #BFDBFE`, textDecoration: 'none' }}>
                <span style={{ color: T.info, display: 'flex' }}>{ICONS.wallet}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: T.info }}>{user.t99cp_balance} T99CP</span>
              </a>
              <button onClick={() => go('notifications')} aria-label="Notifications" style={{ position: 'relative', border: 'none', background: 'transparent', cursor: 'pointer', padding: 12, borderRadius: 10, color: T.text3, display: 'flex', alignItems: 'center' }}>
                {ICONS.bell}
                <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: T.brand, border: `2px solid ${T.bg}` }}></div>
              </button>
              <button onClick={() => go('messaging')} aria-label="Messagerie" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 12, borderRadius: 10, color: T.text3, display: 'flex', alignItems: 'center' }}>
                {ICONS.chat}
              </button>
            </>
          )}

          {user && !user.is_member && (
            <Btn variant="outline" size="sm" onClick={() => go('join')} style={{ marginRight: 4, fontWeight: 700 }}>★ Adhérer au mouvement</Btn>
          )}
          {user?.is_member && (
            <div onClick={() => go('communes')} aria-label="Vous êtes adhérent·e — accéder aux Communes Libres" style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 11px', borderRadius:9999, background:T.gradR, cursor:'pointer', boxShadow:'0 2px 8px rgba(225,29,116,0.25)' }}>
              <span style={{ fontSize:11, fontWeight:800, color:'#fff', letterSpacing:'0.04em' }}>★ ADHÉRENT·E</span>
            </div>
          )}
          {user ? (
            <div ref={profRef} style={{ position: 'relative' }}>
              <div onClick={() => setProf(!prof)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 5px', borderRadius: 9999, border: `1px solid ${T.border}`, cursor: 'pointer', background: T.surface, transition: 'all 0.15s' }}>
                <Avatar name={user.name} size={28} />
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>{user.name?.split(' ')[0]}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.text4} strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {prof && (
                <div role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 220, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 300 }}>
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.text1 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: T.text4 }}>{user.email}</div>
                    <TokenDisplay amount={user.t99cp_balance} size="sm" style={{ marginTop: 4 }} />
                  </div>
                  {[
                    ['Profil', 'profile'],
                    ['Messagerie', 'messaging'],
                    ...(user.is_admin ? [['Admin', 'admin']] : []),
                  ].map(([label, pg]) => (
                    <div key={pg} role="menuitem" onClick={() => go(pg)} style={{ padding: '11px 16px', fontSize: 14, color: T.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surface2} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {label}
                    </div>
                  ))}
                  <div style={{ borderTop: `1px solid ${T.border}`, padding: '8px 0' }}>
                    <div role="menuitem" onClick={() => { onLogout(); setProf(false); }} style={{ padding: '9px 16px', fontSize: 13, color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {ICONS.logout} Se déconnecter
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Btn variant="gradient" size="sm" onClick={onAuth}>Connexion / Inscription</Btn>
          )}

          <button onClick={() => setMob(!mob)} className="mn-mob-btn" aria-label={mob ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={mob} style={{ display: 'none', border: 'none', background: 'transparent', cursor: 'pointer', color: T.text2, padding: 8, borderRadius: 10 }}>
            {mob ? ICONS.close : ICONS.menu}
          </button>
        </div>
      </div>

      {/* Mobile nav backdrop (click outside to close) */}
      {mob && (
        <div onClick={() => setMob(false)} style={{ position: 'fixed', inset: 0, top: 64, background: 'rgba(0,0,0,0.25)', zIndex: -1 }} aria-hidden="true"></div>
      )}

      {/* Mobile nav */}
      {mob && (
        <div role="menu" style={{ borderTop: `1px solid ${T.border}`, background: T.surface, padding: '12px 20px 20px' }}>
          <div style={{ fontSize:9, fontWeight:800, color:T.text4, letterSpacing:'0.14em', padding:'8px 4px 4px', textTransform:'uppercase' }}>━ Information & Mobilisation</div>
          {navInfo.map(l => (
            <button key={l.id} role="menuitem" onClick={() => go(l.id)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15, fontFamily: 'Inter,sans-serif', marginBottom: 4, background: page === l.id ? T.brandLight : 'transparent', color: page === l.id ? T.brand : T.text2 }}>
              {l.label}
            </button>
          ))}
          <div style={{ fontSize:9, fontWeight:800, color:T.text4, letterSpacing:'0.14em', padding:'14px 4px 4px', textTransform:'uppercase' }}>━ Commerce & Entraide</div>
          {navCommerce.map(l => (
            <button key={l.id} role="menuitem" onClick={() => go(l.id)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15, fontFamily: 'Inter,sans-serif', marginBottom: 4, background: page === l.id ? T.brandLight : 'transparent', color: page === l.id ? T.brand : T.text2 }}>
              {l.label}
            </button>
          ))}
          <div style={{ fontSize:9, fontWeight:800, color:T.text4, letterSpacing:'0.14em', padding:'14px 4px 4px', textTransform:'uppercase' }}>━ Espace adhérent·es</div>
          <button role="menuitem" onClick={() => go('communes')} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 15, fontFamily: 'Inter,sans-serif', marginBottom: 4, background: T.gradR, color: '#fff', boxShadow: '0 4px 14px rgba(225,29,116,0.25)' }}>
            ★ Communes Libres {!user?.is_member && <span style={{ marginLeft:'auto', fontSize:10, padding:'2px 7px', background:'rgba(255,255,255,0.25)', color:'#fff', letterSpacing:'0.06em', borderRadius:9999, fontWeight:700 }}>ADHÉRENT·ES</span>}
          </button>
          {user && [['Messagerie', 'messaging'], ['Notifications', 'notifications'], ['Profil', 'profile']].map(([label, pg]) => (
            <button key={pg} role="menuitem" onClick={() => go(pg)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 15, fontFamily: 'Inter,sans-serif', marginBottom: 4, background: 'transparent', color: T.text3 }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
window.AppNav = AppNav;

// ── BOTTOM NAV ─────────────────────────────────────────────
function BottomNav({ page, setPage, user }) {
  const tabs = [
    { id: 'home', icon: ICONS.home, label: 'Accueil' },
    { id: 'petitions', icon: ICONS.trending, label: 'Pétitions' },
    null,
    { id: 'reseau', icon: ICONS.users, label: 'Réseau' },
    { id: 'profile', icon: ICONS.user, label: 'Profil' },
  ];
  // Mock notifs non-lues : pour le proto, on suppose qu'un user connecté en a
  const hasUnread = !!user;
  return (
    <nav className="mn-bot" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(250,250,249,0.97)', backdropFilter: 'blur(16px)', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: `8px 8px calc(8px + env(safe-area-inset-bottom))`, zIndex: 200 }}>
      {tabs.map((t, i) => {
        if (!t) return (
          <div key="fab" style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative', top: -16 }}>
            <button onClick={() => setPage('creer')} aria-label="Créer une action" style={{ width: 52, height: 52, borderRadius: '50%', background: T.gradR, border: `3px solid ${T.bg}`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(225,29,116,0.4)', cursor: 'pointer' }}>
              {ICONS.plus}
            </button>
          </div>
        );
        const active = page === t.id;
        const showDot = t.id === 'profile' && hasUnread;
        return (
          <button key={t.id} onClick={() => setPage(t.id)} aria-current={active ? 'page' : undefined} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 4px', border: 'none', background: 'transparent', cursor: 'pointer', color: active ? T.brand : T.text4, fontFamily: 'Inter,sans-serif', position: 'relative' }}>
            {active && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 3, background: T.gradR, borderRadius: 9999 }}></div>}
            <span style={{ display: 'flex', color: active ? T.brand : T.text4, position: 'relative' }}>
              {t.icon}
              {showDot && <span aria-label="Notifications non lues" style={{ position: 'absolute', top: -3, right: -5, width: 8, height: 8, borderRadius: '50%', background: T.brand, border: `1.5px solid rgba(250,250,249,0.97)` }}></span>}
            </span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
window.BottomNav = BottomNav;

// ── HOME PAGE ──────────────────────────────────────────────
function HomePage({ setPage, user, onAuth }) {
  // ── Stats live (calculées depuis AppData) ────────────────
  const totalSigs = AppData.petitions.reduce((a, p) => a + p.signatures, 0);
  const activePetitions = AppData.petitions.filter(p => p.status === 'active');
  const stats = [
    { value: '946', label: 'Membres du mouvement', icon: ICONS.users, hint: 'adhérent·es actif·ves' },
    { value: '10 583', label: 'Abonnés newsletter', icon: ICONS.bell, hint: 'rendez-vous hebdomadaire' },
    { value: totalSigs.toLocaleString('fr-FR'), label: 'Signatures cumulées', icon: ICONS.heart, hint: `sur ${activePetitions.length} pétitions actives` },
  ];

  // ── Services avec icône + couleur (palette T.hub.*) ──────
  const services = [
    { id: 'petitions',     label: 'Pétitions',      desc: 'Signez et créez des pétitions citoyennes',      icon: ICONS.trending, color: T.hub.petitions },
    { id: 'mobilizations', label: 'Mobilisations',  desc: 'Marches, assemblées, actions directes',         icon: ICONS.users,    color: T.hub.mobilizations },
    { id: 'crowdfunding',  label: 'Cagnottes',      desc: 'Collectes solidaires et caisses de lutte',      icon: ICONS.heart,    color: T.hub.crowdfunding },
    { id: 'housing',       label: 'Hébergement',    desc: 'Logement solidaire · style Airbnb',             icon: ICONS.home,     color: T.hub.housing },
    { id: 'carpooling',    label: 'Covoiturage',    desc: 'Trajets partagés · style BlaBlaCar',            icon: ICONS.car,      color: T.hub.carpooling },
    { id: 'lending',       label: 'Ki Prête Tout',  desc: 'Objets à emprunter entre voisins',              icon: ICONS.grid,     color: T.accent },
    { id: 'marketplace',   label: 'Marketplace',    desc: 'Achats solidaires en T99CP',                    icon: ICONS.wallet,   color: T.hub.marketplace },
    { id: 'sel',           label: 'SEL',            desc: '1 heure = 60 T99CP · compétences & temps',      icon: ICONS.clock,    color: T.hub.sel },
    { id: 'garden',        label: 'Surplus Jardin', desc: 'Fruits, légumes, plants, miel',                 icon: ICONS.sparkle,  color: T.hub.garden },
    { id: 'media',         label: 'Média',          desc: 'Journalisme militant indépendant',              icon: ICONS.photo,    color: T.hub.media },
  ];

  // ── Sélections featured (avec fallback robuste) ──────────
  const featuredPetitions = (() => {
    const f = AppData.petitions.filter(p => p.featured);
    return (f.length >= 3 ? f : AppData.petitions).slice(0, 3);
  })();
  const featuredMobs = (() => {
    const arr = [...AppData.mobilizations];
    arr.sort((a, b) => new Date(a.date) - new Date(b.date)); // prochaines en tête
    return arr.slice(0, 3);
  })();
  const featuredCagnottes = (() => {
    const f = AppData.crowdfunding.filter(c => c.featured);
    return (f.length >= 3 ? f : AppData.crowdfunding).slice(0, 3);
  })();
  const sortedMedia = [...AppData.media]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  // ── CTA secondaire (déconnecté → /join, connecté → /creer) ─
  const ctaSecondary = user
    ? { label: 'Créer une action', onClick: () => setPage('creer') }
    : { label: '★ Adhérer au mouvement', onClick: () => setPage('join') };

  // ── Newsletter form state ────────────────────────────────
  const [nlEmail, setNlEmail] = useState('');
  const [nlSent, setNlSent] = useState(false);
  const submitNewsletter = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nlEmail)) return;
    setNlSent(true);
    if (window.showToast) window.showToast(`Inscription confirmée à la newsletter`, { type: 'success' });
    setNlEmail('');
  };

  // ── Helper : photo card avec fallback gradient + opacity ──
  const cardPhoto = (src, height = 180) => (
    <div style={{ height, background: T.text1, position: 'relative', overflow: 'hidden' }}>
      {src && <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} onError={e => e.target.style.display = 'none'} />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%)' }}></div>
    </div>
  );

  // ── Style commun pour cards <a> hoverable ────────────────
  const cardLinkStyle = {
    background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`,
    overflow: 'hidden', cursor: 'pointer', transition: 'all 0.22s',
    textDecoration: 'none', color: 'inherit', display: 'block',
  };

  return (
    <div style={{ background: T.bg }}>
      {/* ───────── HERO — 70vh, T99CP pur sur fond noir ─────────── */}
      <section data-mn-hero style={{ position: 'relative', overflow: 'hidden', background: T.text1, color: '#fff', minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
        {/* Halos lumineux T99CP */}
        <div aria-hidden="true" style={{ position: 'absolute', bottom: -140, right: -140, width: 520, height: 520, background: `radial-gradient(circle, ${T.brand}33 0%, transparent 70%)`, pointerEvents: 'none', filter: 'blur(10px)' }}></div>
        <div aria-hidden="true" style={{ position: 'absolute', top: -120, left: -120, width: 420, height: 420, background: `radial-gradient(circle, ${T.accent}33 0%, transparent 70%)`, pointerEvents: 'none', filter: 'blur(10px)' }}></div>
        {/* Photo de fond + overlay gradient T99CP pur */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
          <img src="https://images.unsplash.com/photo-1591848478625-de43268e6fb8?w=1600&q=80" alt="" loading="eager" fetchpriority="high" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 }} onError={e => e.target.style.display = 'none'} />
          <div style={{ position: 'absolute', inset: 0, background: T.grad, opacity: 0.78 }}></div>
        </div>

        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: 'clamp(48px,8vw,96px) 24px', width: '100%' }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9999, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24 }}>
              {ICONS.sparkle} Plateforme de mobilisation citoyenne
            </div>

            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(36px,6vw,76px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.04em', margin: '0 0 18px', color: '#fff' }}>
              Maintenant !<br />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(22px,3.5vw,46px)', fontWeight: 700 }}>La voix des 99%</span>
            </h1>

            <p style={{ fontSize: 'clamp(15px,2vw,19px)', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: 620, fontWeight: 500 }}>
              Pour une vie digne et heureuse pour toutes et tous, face aux oppressions systémiques nos luttes doivent devenir systémiques.
            </p>
            <p style={{ fontSize: 'clamp(14px,1.7vw,17px)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: '0 0 32px', maxWidth: 560 }}>
              La plateforme citoyenne et solidaire pour mobiliser, s'informer, échanger, partager, s'organiser, agir.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Btn variant="white" size="lg" onClick={() => setPage('petitions')} icon={ICONS.trending}>Découvrir les pétitions</Btn>
              <Btn variant="outline" size="lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', background: 'rgba(255,255,255,0.08)' }} onClick={ctaSecondary.onClick} icon={user ? ICONS.plus : null}>
                {ctaSecondary.label}
              </Btn>
            </div>
          </div>

          {/* 3 stats live */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginTop: 48, maxWidth: 720 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, color: 'rgba(255,255,255,0.5)' }}>{s.icon} <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span></div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(22px,2.6vw,30px)', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{s.hint}</div>
              </div>
            ))}
          </div>
        </div>

        <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, background: `linear-gradient(to bottom, transparent, ${T.bg})` }}></div>
      </section>

      {/* ───────── PÉTITIONS À LA UNE ───────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 0' }}>
        <SectionTitle label="En ce moment" title="Pétitions qui mobilisent" action={<Btn variant="outline" size="sm" onClick={() => setPage('petitions')}>Toutes les pétitions {ICONS.arrow_r}</Btn>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
          {featuredPetitions.map(p => (
            <a key={p.id} href={`#petitions/${p.id}`} onClick={e => { e.preventDefault(); setPage('petitions'); }} className="mn-card-hover" style={cardLinkStyle}>
              {cardPhoto(p.image)}
              <div style={{ padding: '16px 20px 20px' }}>
                <Tag variant="brand" size="xs" style={{ marginBottom: 10 }}>{p.category}</Tag>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: T.text1, margin: '0 0 12px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</h3>
                <ProgressBar value={p.signatures} max={p.goal} height={4} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.brand }}>{p.signatures.toLocaleString('fr-FR')} signatures</span>
                  <Btn variant="gradient" size="xs" onClick={e => { e.stopPropagation(); e.preventDefault(); setPage('petitions'); }}>Signer</Btn>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ───────── MOBILISATIONS À VENIR ───────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 0' }}>
        <SectionTitle label="À l'agenda" title="Prochaines mobilisations" action={<Btn variant="outline" size="sm" onClick={() => setPage('mobilizations')}>Toutes les mobilisations {ICONS.arrow_r}</Btn>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
          {featuredMobs.map(m => (
            <a key={m.id} href={`#mobs/${m.id}`} onClick={e => { e.preventDefault(); setPage('mobilizations'); }} className="mn-card-hover" style={cardLinkStyle}>
              {cardPhoto(m.image, 160)}
              <div style={{ padding: '16px 20px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Tag variant="info" size="xs">{m.type}</Tag>
                  <span style={{ fontSize: 12, color: T.text3, display: 'flex', alignItems: 'center', gap: 4 }}>{ICONS.calendar} {new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {m.time}</span>
                </div>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: T.text1, margin: '0 0 8px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.text4 }}>
                  {ICONS.pin} <span>{m.location}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 12, color: T.text3 }}>par <strong style={{ color: T.text2 }}>{m.organizer}</strong></span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.brand }}>{m.participants?.toLocaleString('fr-FR') || 0} participant·es</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ───────── CAGNOTTES EN COURS ───────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 0' }}>
        <SectionTitle label="Solidarité" title="Cagnottes en cours" action={<Btn variant="outline" size="sm" onClick={() => setPage('crowdfunding')}>Toutes les cagnottes {ICONS.arrow_r}</Btn>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
          {featuredCagnottes.map(c => (
            <a key={c.id} href={`#cagnottes/${c.id}`} onClick={e => { e.preventDefault(); setPage('crowdfunding'); }} className="mn-card-hover" style={cardLinkStyle}>
              {cardPhoto(c.cover, 160)}
              <div style={{ padding: '16px 20px 20px' }}>
                <Tag variant="brand" size="xs" style={{ marginBottom: 10 }}>{c.category}</Tag>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: T.text1, margin: '0 0 10px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.title}</h3>
                <ProgressBar value={c.raised_t99cp} max={c.goal_t99cp} height={4} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 12 }}>
                  <span style={{ color: T.text3 }}>{c.contributors?.toLocaleString('fr-FR')} contributeur·rices</span>
                  <span style={{ fontWeight: 700, color: T.warning }}>{c.days_left}j restants</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ───────── SERVICES GRID — icônes colorées (T.hub.*) ───────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px 0' }}>
        <SectionTitle label="Plateforme" title="Tous les services solidaires" action={<Btn variant="outline" size="sm" onClick={() => setPage('services')}>Voir tous les services {ICONS.arrow_r}</Btn>} />
        <div data-mn-grid="services" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
          {services.map(s => (
            <a key={s.id} href={`#${s.id}`} onClick={e => { e.preventDefault(); setPage(s.id); }} className="mn-card-hover" style={{ ...cardLinkStyle, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div aria-hidden="true" style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}1A`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: T.text1, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.45 }}>{s.desc}</div>
              </div>
              <div aria-hidden="true" style={{ color: T.border, flexShrink: 0, marginTop: 10 }}>{ICONS.arrow_r}</div>
            </a>
          ))}
        </div>
      </section>

      {/* ───────── DERNIÈRES ACTUALITÉS ───────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 0' }}>
        <SectionTitle label="Média militant" title="Dernières actualités" action={<Btn variant="outline" size="sm" onClick={() => setPage('media')}>Lire tout {ICONS.arrow_r}</Btn>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {sortedMedia.map(a => (
            <a key={a.id} href={`#media/${a.id}`} onClick={e => { e.preventDefault(); setPage('media'); }} className="mn-card-hover" style={cardLinkStyle}>
              {cardPhoto(a.image, 160)}
              <div style={{ padding: '16px 18px 18px' }}>
                <Tag variant="brand" size="xs" style={{ marginBottom: 8 }}>{a.category}</Tag>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: T.text1, margin: '0 0 8px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: T.text4 }}>
                  <span>{a.author}</span>
                  {a.reading_time && <><span>·</span><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{ICONS.clock} {a.reading_time} min</span></>}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ───────── BANDEAU NEWSLETTER (mi-page) ───────── */}
      <section style={{ maxWidth: 1200, margin: '72px auto 0', padding: '0 24px' }}>
        <div style={{ background: T.gradSoft, border: `1px solid ${T.border}`, borderRadius: 24, padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 28, alignItems: 'center' }} className="mn-newsletter">
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Newsletter hebdomadaire</div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: T.text1, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Restez informé·e du mouvement</h2>
            <p style={{ fontSize: 14, color: T.text3, margin: 0, lineHeight: 1.55, maxWidth: 520 }}>
              Chaque dimanche : les pétitions, mobilisations et actualités qui comptent. Pas de spam, désinscription en 1 clic.
            </p>
          </div>
          {nlSent ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderRadius: 14, background: T.successLight, border: `1px solid ${T.success}`, color: T.success, fontWeight: 700 }}>
              {ICONS.check} Inscription confirmée
            </div>
          ) : (
            <form onSubmit={submitNewsletter} style={{ display: 'flex', gap: 8, minWidth: 320 }}>
              <input type="email" required placeholder="votre@email.fr" value={nlEmail} onChange={e => setNlEmail(e.target.value)}
                style={{ flex: 1, height: 48, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '0 14px', fontSize: 14, fontFamily: 'Inter,sans-serif', color: T.text1, background: T.surface, outline: 'none', boxSizing: 'border-box' }} />
              <Btn variant="gradient" size="md" onClick={submitNewsletter}>S'abonner</Btn>
            </form>
          )}
        </div>
      </section>

      {/* ───────── T99CP SECTION — blanc + accents gradient ───────── */}
      <section style={{ maxWidth: 1200, margin: '60px auto 0', padding: '0 24px 80px' }}>
        <div className="mn-wallet-card" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 24, padding: 'clamp(32px,5vw,56px)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Halo gradient subtil top-right */}
          <div aria-hidden="true" style={{ position: 'absolute', top: -100, right: -100, width: 360, height: 360, background: `radial-gradient(circle, ${T.brand}1A 0%, transparent 70%)`, pointerEvents: 'none', filter: 'blur(8px)' }}></div>
          <div>
            <Tag variant="gradient" style={{ marginBottom: 16 }}>₮ Écosystème T99CP · Réseau Polygon</Tag>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(22px,4vw,38px)', fontWeight: 800, color: T.text1, margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              1 T99CP = <span style={{ background: T.gradR, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>1 €</span> = <span style={{ background: T.gradR, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>1 minute</span> de travail
            </h2>
            <p style={{ fontSize: 15, color: T.text3, lineHeight: 1.65, margin: '0 0 28px', maxWidth: 560 }}>
              La monnaie solidaire du mouvement. Tous les échanges de services, locations, achats et dons se font en T99CP sur le réseau Polygon. Chaque transaction valorise équitablement le temps humain.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Btn variant="gradient" size="md" onClick={() => window.open('https://the99coinproject.org', '_blank')} icon={ICONS.wallet}>Accéder au Wallet ↗</Btn>
              {!user && <Btn variant="outline" size="md" onClick={() => setPage('join')}>★ Adhérer au mouvement</Btn>}
            </div>
          </div>
          <div style={{ flexShrink: 0 }} className="mn-desk">
            <div style={{ textAlign: 'center', background: T.gradSoft, borderRadius: 20, padding: '24px 28px', border: `1px solid ${T.border}` }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.gradR, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: '0 8px 24px rgba(225,29,116,0.3)' }}>
                <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>₮</span>
              </div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: T.text1, lineHeight: 1, marginBottom: 4 }}>450 000</div>
              <div style={{ fontSize: 11, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>T99CP en circulation</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
window.HomePage = HomePage;

// ── SERVICES HUB ──────────────────────────────────────────
function ServicesHub({ setPage, user, onAuth }) {
  const [search, setSearch] = useState('');

  // ─── STATS LIVE depuis AppData (calculées, pas mockées) ───
  const ad = window.AppData || {};
  const userCreations = (k) => (window.getUserCreations?.(k) || []).length;
  const liveStats = {
    petitions:     (ad.petitions || []).filter(p => p.status === 'active').length + userCreations('petitions'),
    petitionSigs:  (ad.petitions || []).reduce((s, p) => s + (p.signatures || 0), 0),
    mobs:          (ad.mobilizations || []).length + userCreations('mobilizations'),
    crowdfunding:  (ad.crowdfunding || []).length + userCreations('crowdfunding'),
    cfRaised:      (ad.crowdfunding || []).reduce((s, c) => s + (c.raised_t99cp || 0), 0),
    cfContrib:     (ad.crowdfunding || []).reduce((s, c) => s + (c.contributors || 0), 0),
    sel:           (ad.sel || []).length + userCreations('sel'),
    housing:       (ad.housing || []).length + userCreations('housing'),
    carpooling:    (ad.carpooling_offers || []).length + userCreations('carpool_offers'),
    lending:       (ad.lending || []).length + userCreations('lending'),
    garden:        (ad.garden || []).length + userCreations('garden'),
    marketplace:   (ad.marketplace || []).length + userCreations('marketplace'),
    media:         (ad.media || []).length + userCreations('media'),
    polls:         (ad.polls || []).filter(p => new Date(p.closes) > new Date()).length,
    members:       946,
    t99cpCirc:     450000,
  };

  // ─── DÉTECTE LES SERVICES UTILISÉS PAR L'UTILISATEUR ───
  const userServiceUsage = user ? {
    petitions:     userCreations('petitions'),
    mobilizations: userCreations('mobilizations'),
    crowdfunding:  userCreations('crowdfunding'),
    sel:           userCreations('sel'),
    housing:       userCreations('housing'),
    carpooling:    userCreations('carpool_offers') + userCreations('carpool_requests'),
    lending:       userCreations('lending'),
    garden:        userCreations('garden'),
    marketplace:   userCreations('marketplace'),
    media:         userCreations('media'),
  } : {};
  const myServices = Object.entries(userServiceUsage).filter(([_, n]) => n > 0).sort(([,a],[,b]) => b - a);

  const groups = [
    { label: 'Mobilisation', desc: 'Faire entendre les voix du peuple', services: [
      { id: 'petitions',     title: 'Pétitions',      desc: 'Signez et lancez des pétitions citoyennes',          color: T.hub.petitions,    icon:'📜', stat:`${liveStats.petitions} actives · ${liveStats.petitionSigs.toLocaleString('fr-FR')} signatures`, kw:'pétition signer signature' },
      { id: 'mobilizations', title: 'Mobilisations',  desc: 'Marches, assemblées, camps militants',                color: T.hub.mobilizations,icon:'📅', stat:`${liveStats.mobs} mobilisations en cours`, kw:'manifestation marche action' },
      { id: 'crowdfunding',  title: 'Cagnottes',      desc: 'Caisses solidaires et budget participatif',           color: T.hub.crowdfunding, icon:'💰', stat:`${liveStats.cfRaised.toLocaleString('fr-FR')} T99CP collectés`, kw:'cagnotte don financement' },
      { id: 'campaigns',     title: 'Campagnes',      desc: 'Agrégez 12 services en une seule page',                color: '#9D174D',          icon:'🎯', stat:'6 campagnes en cours', kw:'campagne builder' },
    ]},
    { label: 'Services solidaires', desc: 'L\'entraide au quotidien · paiement T99CP ou €', services: [
      { id: 'sel',           title: 'SEL',                  desc: '1 minute de service = 1 T99CP',                  color: T.hub.sel,          icon:'🤲', stat:`${liveStats.sel} services proposés`, kw:'sel échange compétence service' },
      { id: 'housing',       title: 'Hébergement',          desc: 'Logement solidaire et temporaire',               color: T.hub.housing,      icon:'🏠', stat:`${liveStats.housing} hébergements`, kw:'logement chambre studio' },
      { id: 'carpooling',    title: 'Covoiturage',          desc: 'Trajets partagés entre militants',               color: T.hub.carpooling,   icon:'🚗', stat:`${liveStats.carpooling} trajets disponibles`, kw:'covoit voiture trajet' },
      { id: 'lending',       title: 'Ki Prête Tout',        desc: 'Empruntez des objets de votre réseau',           color: '#A21CAF',          icon:'🔧', stat:`${liveStats.lending} objets disponibles`, kw:'prêt outil emprunt' },
      { id: 'garden',        title: 'Surplus de Jardin',    desc: 'Légumes, fruits, plants, miel',                  color: T.hub.garden,       icon:'🌱', stat:`${liveStats.garden} surplus partagés`, kw:'jardin légume fruit' },
    ]},
    { label: 'Commerce solidaire', desc: 'Acheter local, acheter juste', services: [
      { id: 'marketplace',   title: 'Marketplace',          desc: 'Seconde main · ports en € ou Polygon',            color: T.hub.marketplace,  icon:'🛍️', stat:`${liveStats.marketplace} articles en vente`, kw:'achat vendre vente' },
    ]},
    { label: 'Information & Réseau', desc: 'Sortir des bulles algorithmiques', services: [
      { id: 'media',         title: 'Média',                desc: 'Journalisme militant et analyses',                color: T.hub.media,        icon:'📰', stat:`${liveStats.media} articles publiés`, kw:'média article info presse' },
      { id: 'polls',         title: 'Sondages',             desc: 'Élections, société, pronostics — votre voix',     color: '#0891B2',          icon:'📊', stat:`${liveStats.polls} sondages actifs`, kw:'sondage vote consultation' },
      { id: 'reseau',        title: 'Réseau Social',        desc: 'Sans pub ni algorithme commercial',               color: T.hub.network,      icon:'💬', stat:`${liveStats.members.toLocaleString('fr-FR')} membres connecté·es`, kw:'réseau ami fil' },
    ]},
    { label: 'Espace adhérent·es', desc: 'Réservé aux membres certifié·es de la Confédération', services: [
      { id: 'communes',      title: 'Communes Libres',      desc: 'Quartiers, communes, ZAD, tiers-lieux confédérés', color: T.hub.communes,     icon:'★', stat:'238 communes fondées', locked:true, kw:'commune confédération adhérent' },
    ]},
  ];

  // Index aplati pour la recherche
  const allServices = groups.flatMap(g => g.services.map(s => ({ ...s, _group: g.label })));
  const matchSearch = (s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (s.title + ' ' + s.desc + ' ' + (s.kw || '') + ' ' + s._group).toLowerCase().includes(q);
  };

  // ─── PARCOURS RAPIDES (entrée pour les nouveaux visiteurs) ───
  const quickPaths = [
    { icon:'✍️', label:'Je signe',      desc:'une pétition citoyenne', color:T.hub.petitions,    page:'petitions',    time:'30 sec' },
    { icon:'💰', label:'Je donne',      desc:'à une caisse solidaire', color:T.hub.crowdfunding, page:'crowdfunding', time:'1 min' },
    { icon:'🤝', label:'J\'échange',    desc:'un service en SEL',       color:T.hub.sel,          page:'sel',          time:'2 min' },
    { icon:'🚀', label:'J\'organise',  desc:'une campagne',            color:'#9D174D',          page:'campaigns',    time:'10 min' },
  ];

  // ─── ÉCOSYSTÈME — comment les services s'enchainent (parcours type) ───
  const ecosystem = [
    { step:'01', label:'Une pétition naît', icon:'📜', color:T.hub.petitions,    desc:'Tu identifies un problème, tu lances une pétition.', page:'petitions' },
    { step:'02', label:'On la fait grandir', icon:'💬', color:T.hub.network,     desc:'Le réseau social la diffuse à tes contacts et leurs ami·es.', page:'reseau' },
    { step:'03', label:'On se mobilise',     icon:'📅', color:T.hub.mobilizations,desc:'Une mobilisation s\'organise autour de la cause.', page:'mobilizations' },
    { step:'04', label:'On finance la lutte',icon:'💰', color:T.hub.crowdfunding,desc:'Une cagnotte solidaire couvre les frais.', page:'crowdfunding' },
    { step:'05', label:'On agrège tout',     icon:'🎯', color:'#9D174D',         desc:'Une campagne réunit pétitions, cagnottes, mobs, articles.', page:'campaigns' },
    { step:'06', label:'On documente',       icon:'📰', color:T.hub.media,       desc:'Le média militant relaie la victoire.', page:'media' },
  ];

  // Filtre les groupes selon recherche
  const visibleGroups = search
    ? [{ label: `Résultats pour « ${search} »`, desc: `${allServices.filter(matchSearch).length} service(s) trouvé(s)`, services: allServices.filter(matchSearch) }]
    : groups;

  // Helper trouver service par id (pour Mes services)
  const findService = (id) => allServices.find(s => s.id === id);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* HERO valorisé avec stats live */}
      <div style={{ position:'relative', borderRadius:24, overflow:'hidden', marginBottom:32, background:T.grad, padding:'48px 36px 40px', color:'#fff' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,0.10)', filter:'blur(40px)' }}></div>
        <div style={{ position:'absolute', bottom:-40, left:-40, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.08)', filter:'blur(30px)' }}></div>
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
            <div style={{ flex:'1 1 460px', maxWidth:680 }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', opacity:0.75, marginBottom:14 }}>━━ La voix des 99%</div>
              <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(28px,4.5vw,44px)', fontWeight:800, margin:'0 0 14px', letterSpacing:'-0.03em', lineHeight:1.05 }}>
                Tous les services solidaires de la plateforme
              </h1>
              <p style={{ fontSize:16, opacity:0.92, lineHeight:1.55, margin:'0 0 22px', maxWidth:600 }}>
                Mobilisation, entraide, commerce, information. Une plateforme unique au service du peuple, payable en T99CP ou en euros — sans publicité, sans algorithme commercial.
              </p>
            </div>
            {/* Stats live calculées */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10, minWidth:240 }}>
              {[
                { label:'Services', value:'12' },
                { label:'Pétitions', value:liveStats.petitionSigs >= 1000 ? `${(liveStats.petitionSigs/1000).toFixed(1)}k` : liveStats.petitionSigs, sub:'signatures' },
                { label:'T99CP', value:`${(liveStats.t99cpCirc/1000).toFixed(0)}k`, sub:'en circulation' },
                { label:'Membres', value:liveStats.members.toLocaleString('fr-FR') },
              ].map(s => (
                <div key={s.label} style={{ background:'rgba(255,255,255,0.12)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:14, padding:'14px 16px' }}>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:24, lineHeight:1, letterSpacing:'-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize:10, opacity:0.85, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginTop:6 }}>{s.label}{s.sub && <span style={{ display:'block', opacity:0.7, marginTop:2, textTransform:'none', letterSpacing:'normal' }}>{s.sub}</span>}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recherche */}
          <div style={{ marginTop:28, position:'relative', maxWidth:520 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Cherche un service : pétition, covoit, SEL, T99CP…"
              style={{ width:'100%', height:48, padding:'0 18px', borderRadius:9999, border:'2px solid rgba(255,255,255,0.25)', background:'rgba(255,255,255,0.95)', color:T.text1, fontSize:14, fontFamily:'Inter,sans-serif', outline:'none', boxSizing:'border-box', boxShadow:'0 6px 20px rgba(0,0,0,0.15)' }} />
            {search && <button onClick={() => setSearch('')} style={{ position:'absolute', right:10, top:10, width:28, height:28, border:'none', borderRadius:'50%', background:T.surface2, color:T.text3, cursor:'pointer', fontSize:14, fontWeight:700 }}>×</button>}
          </div>
        </div>
      </div>

      {/* PARCOURS RAPIDES — visible si pas de recherche active */}
      {!search && (
        <div style={{ marginBottom:48 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:16 }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, margin:0, letterSpacing:'-0.02em' }}>Comment commencer ?</h2>
            <span style={{ fontSize:12, color:T.text3, fontStyle:'italic' }}>4 actions pour rejoindre le mouvement</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12 }}>
            {quickPaths.map(p => (
              <button key={p.label} onClick={() => setPage(p.page)}
                style={{ position:'relative', textAlign:'left', background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:'20px 22px', cursor:'pointer', transition:'all 0.2s', fontFamily:'Inter,sans-serif', overflow:'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 14px 36px ${p.color}25`; e.currentTarget.querySelector('[data-arrow]').style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.querySelector('[data-arrow]').style.transform = 'none'; }}>
                <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:`${p.color}10`, pointerEvents:'none' }}></div>
                <div style={{ position:'relative' }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:`${p.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:14 }}>{p.icon}</div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, letterSpacing:'-0.01em', marginBottom:4 }}>{p.label}</div>
                  <div style={{ fontSize:13, color:T.text3, marginBottom:12, lineHeight:1.5 }}>{p.desc}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:9999, background:`${p.color}15`, color:p.color, letterSpacing:'0.04em' }}>⏱ {p.time}</span>
                    <span data-arrow style={{ fontSize:18, color:p.color, fontWeight:800, transition:'transform 0.18s' }}>→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MES SERVICES — visible si user connecté avec créations */}
      {!search && user && myServices.length > 0 && (
        <div style={{ marginBottom:48, padding:'24px 26px', background:'linear-gradient(135deg, #FDE9F2 0%, #F3EBFE 100%)', borderRadius:16, border:`1px solid ${T.border}` }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:14, flexWrap:'wrap' }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, margin:0, letterSpacing:'-0.02em' }}>★ Mes services</h2>
            <span style={{ fontSize:12, color:T.text3, fontStyle:'italic' }}>les outils que tu utilises déjà</span>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {myServices.slice(0, 6).map(([sid, count]) => {
              const s = findService(sid);
              if (!s) return null;
              return (
                <button key={sid} onClick={() => setPage(s.id)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px 10px 10px', background:'#fff', border:`1.5px solid ${s.color}40`, borderRadius:9999, cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${s.color}40`; e.currentTarget.style.transform = 'none'; }}>
                  <span style={{ width:30, height:30, borderRadius:'50%', background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{s.icon}</span>
                  <span style={{ fontWeight:700, fontSize:13, color:T.text1 }}>{s.title}</span>
                  <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:9999, background:s.color, color:'#fff' }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GROUPES DE SERVICES — la grille existante (filtre par recherche) */}
      {visibleGroups.map((g, gi) => g.services.length > 0 && (
        <div key={g.label} style={{ marginBottom: 48 }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', flexWrap:'wrap', gap:8, marginBottom: 18, paddingBottom:14, borderBottom:`2px solid ${T.text1}` }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:T.text1, margin:0, letterSpacing:'-0.02em' }}>
              {!search && <span style={{ color: T.brand, marginRight:10, fontFamily:'monospace', fontSize:18 }}>0{gi+1}</span>}{g.label}
            </h2>
            <span style={{ fontSize:13, color:T.text3, fontStyle:'italic' }}>{g.desc}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {g.services.map(s => {
              const isMine = user && userServiceUsage[s.id] > 0;
              return (
                <div key={s.id} onClick={() => setPage(s.id)}
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderTop: `4px solid ${s.color}`,
                    borderRadius: 14,
                    padding: '20px 22px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = s.color;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 12px 32px ${s.color}22`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  {/* Halo couleur */}
                  <div style={{ position:'absolute', top:-30, right:-30, width:90, height:90, borderRadius:'50%', background:`${s.color}12`, pointerEvents:'none' }}></div>

                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14, position:'relative' }}>
                    <div style={{ width:42, height:42, borderRadius:12, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, color:s.color, flexShrink:0 }}>
                      {s.icon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: T.text1, lineHeight:1.2 }}>{s.title}</div>
                    </div>
                    {isMine && <span style={{ fontSize:9, fontWeight:800, padding:'3px 6px', background:s.color, color:'#fff', letterSpacing:'0.06em', borderRadius:4 }}>★ MIEN</span>}
                    {s.locked && <span style={{ fontSize:9, fontWeight:800, padding:'3px 6px', background:T.text1, color:'#FFD93D', letterSpacing:'0.06em' }}>ADHÉRENT·ES</span>}
                  </div>

                  <div style={{ fontSize: 13, color: T.text3, lineHeight: 1.5, marginBottom: 14, position:'relative' }}>{s.desc}</div>

                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:`1px solid ${T.border}`, position:'relative' }}>
                    <span style={{ fontSize:11, fontWeight:600, color:T.text4, letterSpacing:'0.04em' }}>{s.stat}</span>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, fontWeight:700, color:s.color }}>
                      Ouvrir <span style={{ display:'inline-flex' }}>{ICONS.arrow_r}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* ÉCOSYSTÈME — comment les services s'enchaînent (parcours type) */}
      {!search && (
        <div style={{ marginBottom:48, padding:'32px 28px', background:T.text1, color:'#fff', borderRadius:20, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-50, right:-50, width:200, height:200, borderRadius:'50%', background:`${T.brand}18`, filter:'blur(40px)' }}></div>
          <div style={{ position:'relative' }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'#FFD93D', marginBottom:10 }}>━━ L'écosystème en action</div>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(22px,3vw,30px)', fontWeight:800, margin:'0 0 8px', letterSpacing:'-0.02em', lineHeight:1.1 }}>Comment les services s'enchaînent ?</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', margin:'0 0 28px', maxWidth:680, lineHeight:1.55 }}>
              Chaque outil renforce les autres. Un parcours type d'une lutte qui démarre, prend de l'ampleur, se finance et se documente.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:14 }}>
              {ecosystem.map((e, i) => (
                <div key={e.step} onClick={() => setPage(e.page)}
                  style={{ position:'relative', padding:'18px 20px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, cursor:'pointer', transition:'all 0.18s' }}
                  onMouseEnter={ev => { ev.currentTarget.style.background = `${e.color}25`; ev.currentTarget.style.borderColor = e.color; ev.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(255,255,255,0.06)'; ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; ev.currentTarget.style.transform = 'none'; }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:800, color:e.color, padding:'2px 7px', background:`${e.color}25`, borderRadius:4, letterSpacing:'0.06em' }}>{e.step}</span>
                    <span style={{ fontSize:18 }}>{e.icon}</span>
                  </div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, marginBottom:6, letterSpacing:'-0.01em' }}>{e.label}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)', lineHeight:1.5 }}>{e.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BANDEAU T99CP / Modèle économique */}
      {!search && (
        <div style={{ marginBottom:48, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:14 }}>
          {[
            { icon:'₮', title:'T99CP — la monnaie du commun', desc:'Adossée à l\'euro et au temps de travail (1 T99CP = 1€ = 1 minute). Sans frais de transaction, indexée sur la valeur réelle.', color:'#0891B2', cta:'En savoir plus', page:'creer' },
            { icon:'🚫', title:'Zéro publicité, zéro algorithme commercial', desc:'Ton fil n\'est pas optimisé pour ton temps d\'écran. Il sert tes engagements, pas ceux d\'annonceurs.', color:'#7C3AED' },
            { icon:'🤝', title:'Auto-géré, démocratiquement', desc:'Pas d\'actionnaire, pas de patron. Les Communes Libres et leur Assemblée Confédérale décident.', color:T.brand, cta:'Devenir adhérent·e', page:'communes' },
          ].map(b => (
            <div key={b.title} style={{ background:T.surface, border:`1px solid ${T.border}`, borderTop:`4px solid ${b.color}`, borderRadius:16, padding:'22px 24px' }}>
              <div style={{ width:42, height:42, borderRadius:12, background:`${b.color}18`, color:b.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, marginBottom:14 }}>{b.icon}</div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:T.text1, marginBottom:6, lineHeight:1.3, letterSpacing:'-0.01em' }}>{b.title}</div>
              <div style={{ fontSize:13, color:T.text3, lineHeight:1.55, marginBottom: b.cta ? 14 : 0 }}>{b.desc}</div>
              {b.cta && <button onClick={() => setPage(b.page)} style={{ background:'transparent', border:'none', color:b.color, fontWeight:800, fontSize:12, cursor:'pointer', padding:0, fontFamily:'Inter,sans-serif' }}>{b.cta} →</button>}
            </div>
          ))}
        </div>
      )}

      {/* CTA fin de page */}
      <div style={{ padding:'32px 28px', background:T.surface, borderRadius:20, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:280 }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, margin:'0 0 6px' }}>Une idée de service à ajouter ?</h3>
          <p style={{ fontSize:14, color:T.text3, margin:0, lineHeight:1.55 }}>La plateforme évolue avec ses membres. Proposez un nouveau service, signalez un besoin.</p>
        </div>
        <Btn variant="outline" size="md" onClick={()=> user ? setPage('reseau') : onAuth?.()}>{user ? 'Proposer un service' : 'Rejoindre le mouvement'}</Btn>
      </div>
    </div>
  );
}
window.ServicesHub = ServicesHub;

// ── CREER PAGE ─────────────────────────────────────────────
function CreerPage({ setPage, user, onAuth }) {
  const tiles = [
    { id: 'petitions', title: 'Pétition', desc: 'Mobiliser autour d\'une cause' },
    { id: 'mobilizations', title: 'Événement', desc: 'Marche, assemblée, rassemblement' },
    { id: 'crowdfunding', title: 'Cagnotte', desc: 'Collecte solidaire ou caisse de lutte' },
    { id: 'media', title: 'Article', desc: 'Publication sur le média militant' },
    { id: 'lending', title: 'Prêt d\'objet', desc: 'Proposer quelque chose à emprunter' },
    { id: 'sel', title: 'Service SEL', desc: 'Offrir une compétence ou du temps' },
    { id: 'housing', title: 'Hébergement', desc: 'Logement solidaire temporaire' },
    { id: 'carpooling', title: 'Trajet', desc: 'Covoiturage entre militants' },
    { id: 'garden', title: 'Surplus', desc: 'Partager fruits, légumes, plants' },
    { id: 'marketplace', title: 'Article à vendre', desc: 'Seconde main en T99CP' },
    { id: 'campaigns', title: 'Campagne', desc: 'Agréger jusqu\'à 12 services' },
  ];
  const [hov, setHov] = useState(null);
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 0 100px' }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => setPage('home')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: T.text3, display: 'flex', padding: 6, borderRadius: 8 }}>{ICONS.arrow_l}</button>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: T.text1, margin: 0, letterSpacing: '-0.02em' }}>Que souhaitez-vous créer ?</h1>
      </div>
      <div style={{ padding: '20px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {tiles.map((t, i) => (
            <button key={t.id} onClick={() => user ? setPage(t.id) : onAuth()} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{ background: hov === i ? T.brandLight : T.surface, border: `1.5px solid ${hov === i ? T.brand : T.border}`, borderRadius: 14, padding: '16px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, transition: 'all 0.15s', textAlign: 'left', fontFamily: 'Inter,sans-serif', boxShadow: hov === i ? '0 4px 16px rgba(225,29,116,0.12)' : 'none' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: hov === i ? T.brand : T.text1, lineHeight: 1.2 }}>{t.title}</div>
              <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.35 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
window.CreerPage = CreerPage;
