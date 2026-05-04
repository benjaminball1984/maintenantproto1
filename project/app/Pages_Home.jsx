// Pages_Home.jsx — Accueil + Navigation redesignés
const { useState, useEffect, useRef } = React;

// ── NAVIGATION ─────────────────────────────────────────────
function AppNav({ page, setPage, user, onAuth, onLogout, adminMode, setAdminMode }) {
  const [mob, setMob] = useState(false);
  const [prof, setProf] = useState(false);
  const profRef = useRef(null);

  useEffect(() => {
    const h = e => { if (profRef.current && !profRef.current.contains(e.target)) setProf(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const go = p => { setPage(p); setMob(false); setProf(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

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
    { id: 'services', label: 'Tous les services' },
    { id: 'sel', label: 'SEL' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'lending', label: 'Ki Prête Tout' },
    { id: 'carpooling', label: 'Covoiturage' },
    { id: 'housing', label: 'Hébergement' },
  ];
  const navLinks = [...navInfo, { id: 'communes', label: 'Communes Libres', highlight: true, locked: !user?.is_member }];

  const navLinkStyle = (id) => ({
    display: 'flex', alignItems: 'center', padding: '6px 12px', borderRadius: 9, border: 'none',
    cursor: 'pointer', fontWeight: page === id ? 700 : 500, fontSize: 13, fontFamily: 'Inter,sans-serif',
    background: page === id ? T.brandLight : 'transparent',
    color: page === id ? T.brand : T.text2,
    transition: 'all 0.15s', letterSpacing: '-0.01em',
    borderBottom: page === id ? `2px solid ${T.brand}` : '2px solid transparent',
    borderRadius: 0, padding: '20px 12px',
  });

  return (
    <header style={{ background: 'rgba(250,250,249,0.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, zIndex: 200 }}>
      {adminMode && (
        <div style={{ background: T.warning, padding: '5px 0', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>
          MODE ADMIN — Les contrôles d'édition sont visibles sur tous les contenus
        </div>
      )}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', height: adminMode ? 'auto' : 64 }}>
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

        {/* Desktop Nav — INFORMATION | COMMERCE séparés */}
        <nav className="mn-desk" style={{ display: 'flex', alignItems: 'stretch', gap: 0, flex: 1, paddingLeft: 8, overflowX: 'auto' }}>
          <div style={{ display:'flex', position:'relative', paddingLeft:6 }}>
            <span style={{ position:'absolute', top:6, left:8, fontSize:8, fontWeight:800, color:T.text4, letterSpacing:'0.12em' }}>INFORMATION</span>
            {navInfo.map(l => <button key={l.id} onClick={() => go(l.id)} style={navLinkStyle(l.id)}>{l.label}</button>)}
          </div>
          <div style={{ width:1, background:T.border, margin:'10px 12px' }}></div>
          <div style={{ display:'flex', position:'relative', paddingLeft:6 }}>
            <span style={{ position:'absolute', top:6, left:8, fontSize:8, fontWeight:800, color:T.text4, letterSpacing:'0.12em' }}>COMMERCE</span>
            <button onClick={() => go('services')} style={navLinkStyle('services')}>Services</button>
          </div>
          <div style={{ width:1, background:T.border, margin:'10px 12px' }}></div>
          <button onClick={() => go('communes')} style={{ ...navLinkStyle('communes'), color: page==='communes'?T.brand:'#FFD93D'==='#FFD93D'?T.text1:T.text2, fontWeight:800, background:page==='communes'?'#FFD93D':'transparent', borderBottom:page==='communes'?`2px solid ${T.text1}`:'2px solid transparent' }}>
            ★ Communes Libres {!user?.is_member && <span style={{ marginLeft:6, fontSize:9, padding:'2px 5px', background:T.text1, color:'#FFD93D', letterSpacing:'0.06em' }}>ADHÉRENT·ES</span>}
          </button>
        </nav>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16, borderLeft: `1px solid ${T.border}` }}>
          {user && (
            <>
              <div onClick={() => go('profile')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 9, background: T.infoLight, cursor: 'pointer', border: `1px solid #BFDBFE` }}>
                <span style={{ color: T.info, display: 'flex' }}>{ICONS.wallet}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: T.info }}>{user.t99cp_balance} T99CP</span>
              </div>
              <button onClick={() => go('notifications')} style={{ position: 'relative', border: 'none', background: 'transparent', cursor: 'pointer', padding: 8, borderRadius: 10, color: T.text3, display: 'flex', alignItems: 'center' }}>
                {ICONS.bell}
                <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: T.brand, border: `2px solid ${T.bg}` }}></div>
              </button>
              <button onClick={() => go('messaging')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 8, borderRadius: 10, color: T.text3, display: 'flex', alignItems: 'center' }}>
                {ICONS.chat}
              </button>
            </>
          )}

          {user && !user.is_member && (
            <Btn variant="gradient" size="sm" onClick={() => go('join')} style={{ marginRight: 4 }}>Adhérer</Btn>
          )}
          {user?.is_member && (
            <div onClick={() => go('communes')} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:9, background:'#FEF3C7', border:'1px solid #FDE68A', cursor:'pointer' }}>
              <span style={{ fontSize:11, fontWeight:800, color:'#B45309', letterSpacing:'0.04em' }}>★ ADHÉRENT·E</span>
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
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 220, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 300 }}>
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.text1 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: T.text4 }}>{user.email}</div>
                    <TokenDisplay amount={user.t99cp_balance} size="sm" style={{ marginTop: 4 }} />
                  </div>
                  {[['Profil', 'profile'], ['Campagnes', 'campaigns'], ['Messages', 'messaging'], ['Notifications', 'notifications'], ['Admin', 'admin']].map(([label, pg]) => (
                    <div key={pg} onClick={() => go(pg)} style={{ padding: '11px 16px', fontSize: 14, color: T.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surface2} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {label}
                    </div>
                  ))}
                  <div style={{ borderTop: `1px solid ${T.border}`, padding: '8px 0' }}>
                    <div onClick={() => setAdminMode(!adminMode)} style={{ padding: '9px 16px', fontSize: 13, color: adminMode ? T.warning : T.text3, cursor: 'pointer', fontWeight: adminMode ? 700 : 400 }}
                      onMouseEnter={e => e.currentTarget.style.background = T.surface2} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {adminMode ? '⚙ Désactiver mode admin' : '⚙ Mode admin'}
                    </div>
                    <div onClick={() => { onLogout(); setProf(false); }} style={{ padding: '9px 16px', fontSize: 13, color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {ICONS.logout} Se déconnecter
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Btn variant="gradient" size="sm" onClick={onAuth}>Se connecter</Btn>
          )}

          <button onClick={() => setMob(!mob)} className="mn-mob-btn" style={{ display: 'none', border: 'none', background: 'transparent', cursor: 'pointer', color: T.text2, padding: 8, borderRadius: 10 }}>
            {mob ? ICONS.close : ICONS.menu}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mob && (
        <div style={{ borderTop: `1px solid ${T.border}`, background: T.surface, padding: '12px 20px 20px' }}>
          <div style={{ fontSize:9, fontWeight:800, color:T.text4, letterSpacing:'0.14em', padding:'8px 4px 4px', textTransform:'uppercase' }}>━ Information & Mobilisation</div>
          {navInfo.map(l => (
            <button key={l.id} onClick={() => go(l.id)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15, fontFamily: 'Inter,sans-serif', marginBottom: 4, background: page === l.id ? T.brandLight : 'transparent', color: page === l.id ? T.brand : T.text2 }}>
              {l.label}
            </button>
          ))}
          <div style={{ fontSize:9, fontWeight:800, color:T.text4, letterSpacing:'0.14em', padding:'14px 4px 4px', textTransform:'uppercase' }}>━ Commerce & Entraide</div>
          {navCommerce.map(l => (
            <button key={l.id} onClick={() => go(l.id)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15, fontFamily: 'Inter,sans-serif', marginBottom: 4, background: page === l.id ? T.brandLight : 'transparent', color: page === l.id ? T.brand : T.text2 }}>
              {l.label}
            </button>
          ))}
          <div style={{ fontSize:9, fontWeight:800, color:T.text4, letterSpacing:'0.14em', padding:'14px 4px 4px', textTransform:'uppercase' }}>━ Espace adhérent·es</div>
          <button onClick={() => go('communes')} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '12px 14px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 15, fontFamily: 'Inter,sans-serif', marginBottom: 4, background:'#FFD93D', color: T.text1 }}>
            ★ Communes Libres {!user?.is_member && <span style={{ marginLeft:'auto', fontSize:10, padding:'2px 6px', background:T.text1, color:'#FFD93D' }}>VERROUILLÉ</span>}
          </button>
          {user && [['Messages', 'messaging'], ['Notifications', 'notifications'], ['Profil', 'profile']].map(([label, pg]) => (
            <button key={pg} onClick={() => go(pg)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 15, fontFamily: 'Inter,sans-serif', marginBottom: 4, background: 'transparent', color: T.text3 }}>
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
function BottomNav({ page, setPage }) {
  const tabs = [
    { id: 'home', icon: ICONS.home, label: 'Accueil' },
    { id: 'petitions', icon: ICONS.trending, label: 'Pétitions' },
    null,
    { id: 'reseau', icon: ICONS.users, label: 'Réseau' },
    { id: 'profile', icon: ICONS.user, label: 'Profil' },
  ];
  return (
    <nav className="mn-bot" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(250,250,249,0.97)', backdropFilter: 'blur(16px)', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: `8px 8px calc(8px + env(safe-area-inset-bottom))`, zIndex: 200 }}>
      {tabs.map((t, i) => {
        if (!t) return (
          <div key="fab" style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative', top: -16 }}>
            <button onClick={() => setPage('creer')} style={{ width: 52, height: 52, borderRadius: '50%', background: T.gradR, border: `3px solid ${T.bg}`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(225,29,116,0.4)', cursor: 'pointer' }}>
              {ICONS.plus}
            </button>
          </div>
        );
        const active = page === t.id;
        return (
          <button key={t.id} onClick={() => setPage(t.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 4px', border: 'none', background: 'transparent', cursor: 'pointer', color: active ? T.brand : T.text4, fontFamily: 'Inter,sans-serif', position: 'relative' }}>
            {active && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 3, background: T.gradR, borderRadius: 9999 }}></div>}
            <span style={{ display: 'flex', color: active ? T.brand : T.text4 }}>{t.icon}</span>
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
  const totalSigs = AppData.petitions.reduce((a, p) => a + p.signatures, 0);
  const stats = [
    { value: AppData.petitions.length, label: 'Pétitions actives', icon: ICONS.trending },
    { value: totalSigs.toLocaleString('fr-FR'), label: 'Signatures', icon: ICONS.users },
    { value: '10 583', label: 'Abonnés', icon: ICONS.bell },
    { value: '946', label: 'Membres', icon: ICONS.heart },
  ];

  const services = [
    { id: 'petitions', label: 'Pétitions', desc: 'Signez et créez des pétitions citoyennes' },
    { id: 'mobilizations', label: 'Mobilisations', desc: 'Marches, assemblées, actions directes' },
    { id: 'crowdfunding', label: 'Cagnottes', desc: 'Collectes solidaires et caisses de lutte' },
    { id: 'housing', label: 'Hébergement', desc: 'Logement solidaire · style Airbnb' },
    { id: 'carpooling', label: 'Covoiturage', desc: 'Trajets partagés · style BlaBlaCar' },
    { id: 'lending', label: 'Ki Prête Tout', desc: 'Objets à emprunter entre voisins' },
    { id: 'marketplace', label: 'Marketplace', desc: 'Achats solidaires en T99CP' },
    { id: 'sel', label: 'SEL', desc: '1 heure = 60 T99CP · compétences & temps' },
    { id: 'garden', label: 'Surplus Jardin', desc: 'Fruits, légumes, plants, miel' },
    { id: 'media', label: 'Média', desc: 'Journalisme militant indépendant' },
  ];

  const featuredPetitions = AppData.petitions.filter(p => p.featured).slice(0, 3);
  const latestMedia = AppData.media.slice(0, 3);

  return (
    <div style={{ background: T.bg }}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1a0535 0%, #3b0a28 40%, #4a1408 100%)', color: '#fff', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
        {/* Halos lumineux flous */}
        <div style={{ position: 'absolute', bottom: -120, right: -120, width: 480, height: 480, background: 'radial-gradient(circle, rgba(244,114,30,0.22) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(8px)' }}></div>
        <div style={{ position: 'absolute', top: -100, left: -100, width: 360, height: 360, background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(8px)' }}></div>
        {/* Background photo */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="https://images.unsplash.com/photo-1591848478625-de43268e6fb8?w=1600&q=80" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(91,33,182,0.82) 0%, rgba(225,29,116,0.78) 52%, rgba(234,78,27,0.84) 100%)' }}></div>
        </div>

        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: 'clamp(60px,10vw,120px) 24px', width: '100%' }}>
          <div style={{ maxWidth: 700 }}>
            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9999, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 28 }}>
              {ICONS.sparkle} Plateforme de mobilisation citoyenne
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(36px,6vw,80px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.04em', margin: '0 0 20px', color: '#fff' }}>
              Maintenant !<br />
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(22px,3.5vw,48px)', fontWeight: 700 }}>La voix des 99%</span>
            </h1>

            <p style={{ fontSize: 'clamp(15px,2vw,19px)', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, margin: '0 0 18px', maxWidth: 620, fontWeight: 500 }}>
              Pour une vie digne et heureuse pour toutes et tous, face aux oppressions systémiques nos luttes doivent devenir systémiques.
            </p>
            <p style={{ fontSize: 'clamp(14px,1.7vw,17px)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: '0 0 36px', maxWidth: 560 }}>
              La plateforme citoyenne et solidaire pour mobiliser, s'informer, échanger, partager, s'organiser, agir.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Btn variant="white" size="lg" onClick={() => setPage('petitions')} icon={ICONS.trending}>Découvrir les pétitions</Btn>
              <Btn variant="outline" size="lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', background: 'rgba(255,255,255,0.08)' }} onClick={() => user ? setPage('creer') : onAuth()} icon={ICONS.plus}>
                {user ? 'Créer une action' : 'Rejoindre le mouvement'}
              </Btn>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginTop: 60, maxWidth: 640 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '18px 16px', textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to bottom, transparent, ${T.bg})` }}></div>
      </section>

      {/* ── Services Grid ─────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 0' }}>
        <SectionTitle label="Plateforme" title="Tous les services solidaires" action={<Btn variant="outline" size="sm" onClick={() => setPage('services')}>Voir tout</Btn>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
          {services.map(s => (
            <div key={s.id} onClick={() => setPage(s.id)}
              style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'flex-start', gap: 14 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.boxShadow = '0 8px 28px rgba(225,29,116,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: T.text1, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.45 }}>{s.desc}</div>
              </div>
              <div style={{ color: T.border, flexShrink: 0, marginTop: 2 }}>{ICONS.arrow_r}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Petitions ─────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 0' }}>
        <SectionTitle label="En ce moment" title="Pétitions qui mobilisent" action={<Btn variant="outline" size="sm" onClick={() => setPage('petitions')}>Toutes les pétitions {ICONS.arrow_r}</Btn>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
          {featuredPetitions.map((p, i) => (
            <div key={p.id} onClick={() => setPage('petitions')} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.22s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ height: 180, background: `linear-gradient(135deg,${['#1A1A18','#2A1518','#182018'][i]},${['#2A2A27','#3A2020','#203020'][i]})`, position: 'relative', overflow: 'hidden' }}>
                <img src={`https://images.unsplash.com/photo-${['1529156069898-49953e39b3ac','1584515933487-779824d29309','1571019613454-1cb2f99b2d8b'][i]}?w=600&q=70`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} onError={e => e.target.style.display = 'none'} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.7),transparent)' }}></div>
                <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
                  <Tag variant="brand" size="xs">{p.category}</Tag>
                </div>
              </div>
              <div style={{ padding: '16px 20px 20px' }}>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: T.text1, margin: '0 0 10px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</h3>
                <ProgressBar value={p.signatures} max={p.goal} height={4} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.brand }}>{p.signatures.toLocaleString('fr-FR')} signatures</span>
                  <Btn variant="gradient" size="xs" onClick={() => setPage('petitions')}>Signer</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Latest Media (déplacé AVANT le bloc T99CP) ────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 0' }}>
        <SectionTitle label="Média militant" title="Dernières actualités" action={<Btn variant="outline" size="sm" onClick={() => setPage('media')}>Lire tout {ICONS.arrow_r}</Btn>} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {latestMedia.map(a => (
            <div key={a.id} onClick={() => setPage('media')} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                <img src={`https://picsum.photos/seed/media${a.id}/600/300`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.4),transparent)' }}></div>
                <Tag variant="brand" size="xs" style={{ position: 'absolute', top: 12, left: 12 }}>{a.category}</Tag>
              </div>
              <div style={{ padding: '16px 18px 18px' }}>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: T.text1, margin: '0 0 8px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: T.text4 }}>
                  <span>{a.author}</span>
                  <span>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{ICONS.clock} {a.reading_time} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── T99CP Section (déplacé APRÈS les actualités) ───── */}
      <section style={{ maxWidth: 1200, margin: '60px auto 0', padding: '0 24px 80px' }}>
        <div className="mn-wallet-card" style={{ background: 'linear-gradient(135deg, #1a0535 0%, #3b0a28 40%, #4a1408 100%)', borderRadius: 24, padding: 'clamp(32px,5vw,56px)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: -120, right: -120, width: 480, height: 480, background: 'radial-gradient(circle, rgba(244,114,30,0.22) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(8px)' }}></div>
          <div style={{ position: 'absolute', top: -100, left: -100, width: 360, height: 360, background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(8px)' }}></div>
          <div>
            <Tag variant="gradient" style={{ marginBottom: 16 }}>₮ Écosystème T99CP · Réseau Polygon</Tag>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(22px,4vw,38px)', fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              1 T99CP = 1 € = 1 minute de travail
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: '0 0 28px', maxWidth: 520 }}>
              La monnaie solidaire du mouvement. Tous les échanges de services, locations, achats et dons se font en T99CP sur le réseau Polygon. Chaque transaction valorise équitablement le temps humain.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Btn variant="white" size="md" onClick={() => window.open('https://the99coinproject.org', '_blank')} icon={ICONS.wallet}>Accéder au Wallet</Btn>
              {!user && <Btn variant="ghost" size="md" style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }} onClick={onAuth}>Créer un compte</Btn>}
            </div>
          </div>
          <div style={{ flexShrink: 0 }} className="mn-desk">
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '24px 28px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 52, fontWeight: 800, color: '#fff', lineHeight: 1 }}>₮</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>T99CP</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
window.HomePage = HomePage;

// ── SERVICES HUB ──────────────────────────────────────────
function ServicesHub({ setPage }) {
  const groups = [
    { label: 'Mobilisation', desc: 'Faire entendre les voix du peuple', services: [
      { id: 'petitions',     title: 'Pétitions',      desc: 'Signez et lancez des pétitions citoyennes',          color: T.hub.petitions,    icon:'📜', stat:'2 340 actives' },
      { id: 'mobilizations', title: 'Mobilisations',  desc: 'Marches, assemblées, camps militants',                color: T.hub.mobilizations,icon:'📅', stat:'186 cette semaine' },
      { id: 'crowdfunding',  title: 'Cagnottes',      desc: 'Caisses solidaires et budget participatif',           color: T.hub.crowdfunding, icon:'💰', stat:'12 450 T99CP versés' },
      { id: 'campaigns',     title: 'Campagnes',      desc: 'Agrégez 12 services en une seule page',                color: '#9D174D',          icon:'🎯', stat:'24 campagnes en cours' },
    ]},
    { label: 'Services solidaires', desc: 'L\'entraide au quotidien · paiement T99CP ou €', services: [
      { id: 'sel',           title: 'SEL',                  desc: '1 minute de service = 1 T99CP',                  color: T.hub.sel,          icon:'🤲', stat:'946 services échangés' },
      { id: 'housing',       title: 'Hébergement',          desc: 'Logement solidaire et temporaire',               color: T.hub.housing,      icon:'🏠', stat:'412 hôtes inscrits' },
      { id: 'carpooling',    title: 'Covoiturage',          desc: 'Trajets partagés entre militants',               color: T.hub.carpooling,   icon:'🚗', stat:'3 200 km cette semaine' },
      { id: 'lending',       title: 'Ki Prête Tout',        desc: 'Empruntez des objets de votre réseau',           color: '#A21CAF',          icon:'🔧', stat:'1 280 objets disponibles' },
      { id: 'garden',        title: 'Surplus de Jardin',    desc: 'Légumes, fruits, plants, miel',                  color: T.hub.garden,       icon:'🌱', stat:'89 producteurs' },
    ]},
    { label: 'Commerce solidaire', desc: 'Acheter local, acheter juste', services: [
      { id: 'marketplace',   title: 'Marketplace',          desc: 'Seconde main · ports en € ou Polygon',            color: T.hub.marketplace,  icon:'🛍️', stat:'2 105 articles' },
    ]},
    { label: 'Information & Réseau', desc: 'Sortir des bulles algorithmiques', services: [
      { id: 'media',         title: 'Média',                desc: 'Journalisme militant et analyses',                color: T.hub.media,        icon:'📰', stat:'67 articles ce mois' },
      { id: 'polls',         title: 'Sondages',             desc: 'Élections, société, pronostics — votre voix',     color: '#0891B2',          icon:'📊', stat:'5 sondages actifs' },
      { id: 'reseau',        title: 'Réseau Social',        desc: 'Sans pub ni algorithme commercial',               color: T.hub.network,      icon:'💬', stat:'14 200 membres' },
    ]},
    { label: 'Espace adhérent·es', desc: 'Réservé aux membres certifié·es de la Confédération', services: [
      { id: 'communes',      title: 'Communes Libres',      desc: 'Quartiers, communes, ZAD, tiers-lieux confédérés', color: T.hub.communes,     icon:'★', stat:'238 communes fondées', locked:true },
    ]},
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Hero compact */}
      <div style={{ position:'relative', borderRadius:24, overflow:'hidden', marginBottom:48, background:T.grad, padding:'48px 36px', color:'#fff' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,0.10)', filter:'blur(40px)' }}></div>
        <div style={{ position:'absolute', bottom:-40, left:-40, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.08)', filter:'blur(30px)' }}></div>
        <div style={{ position:'relative', maxWidth:760 }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', opacity:0.75, marginBottom:14 }}>━━ La voix des 99%</div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(28px,4.5vw,44px)', fontWeight:800, margin:'0 0 14px', letterSpacing:'-0.03em', lineHeight:1.05 }}>
            Tous les services solidaires de la plateforme
          </h1>
          <p style={{ fontSize:16, opacity:0.92, lineHeight:1.55, margin:'0 0 24px', maxWidth:600 }}>
            Mobilisation, entraide, commerce, information. Une plateforme unique au service du peuple, payable en T99CP ou en euros.
          </p>
          <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            {[['12','Services'],['89k','Membres'],['450k','T99CP en circulation']].map(([n,l])=>(
              <div key={l}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:24, lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:11, opacity:0.75, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Groupes de services */}
      {groups.map((g, gi) => (
        <div key={g.label} style={{ marginBottom: 56 }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', flexWrap:'wrap', gap:8, marginBottom: 18, paddingBottom:14, borderBottom:`2px solid ${T.text1}` }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:T.text1, margin:0, letterSpacing:'-0.02em' }}>
              <span style={{ color: T.brand, marginRight:10, fontFamily:'monospace', fontSize:18 }}>0{gi+1}</span>{g.label}
            </h2>
            <span style={{ fontSize:13, color:T.text3, fontStyle:'italic' }}>{g.desc}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {g.services.map(s => (
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
                  {s.locked && (
                    <span style={{ fontSize:9, fontWeight:800, padding:'3px 6px', background:T.text1, color:'#FFD93D', letterSpacing:'0.06em' }}>ADHÉRENT·ES</span>
                  )}
                </div>

                <div style={{ fontSize: 13, color: T.text3, lineHeight: 1.5, marginBottom: 14, position:'relative' }}>{s.desc}</div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:`1px solid ${T.border}`, position:'relative' }}>
                  <span style={{ fontSize:11, fontWeight:600, color:T.text4, letterSpacing:'0.04em' }}>{s.stat}</span>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, fontWeight:700, color:s.color }}>
                    Ouvrir <span style={{ display:'inline-flex' }}>{ICONS.arrow_r}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* CTA fin de page */}
      <div style={{ marginTop:40, padding:'32px 28px', background:T.surface, borderRadius:20, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:280 }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, margin:'0 0 6px' }}>Une idée de service à ajouter ?</h3>
          <p style={{ fontSize:14, color:T.text3, margin:0, lineHeight:1.55 }}>La plateforme évolue avec ses membres. Proposez un nouveau service, signalez un besoin.</p>
        </div>
        <Btn variant="outline" size="md" onClick={()=>setPage('reseau')}>Proposer un service</Btn>
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
