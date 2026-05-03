// HomePage.jsx + ServicesHub.jsx + CreerPage.jsx
const { useState } = React;

// ── HOME PAGE ─────────────────────────────────────────────
function HomePage({ setActivePage, user, onOpenAuth }) {
  const totalSigs = AppData.petitions.reduce((a,p)=>a+p.signatures,0);
  const stats = [
    { value: AppData.petitions.length, label:'Pétitions' },
    { value: totalSigs.toLocaleString('fr-FR'), label:'Signatures' },
    { value: '10 583', label:'Abonnés' },
    { value: '946', label:'Membres' },
  ];

  const quickServices = [
    { icon:'📜', label:'Pétitions', page:'petitions', color:'#E11D74' },
    { icon:'📅', label:'Mobilisations', page:'mobilizations', color:'#7C3AED' },
    { icon:'💰', label:'Cagnottes', page:'crowdfunding', color:'#A21CAF' },
    { icon:'🏠', label:'Logement', page:'housing', color:'#BE185D' },
    { icon:'🚗', label:'Covoiturage', page:'carpooling', color:'#0284C7' },
    { icon:'🔧', label:'Ki Prête Tout', page:'lending', color:'#0891B2' },
    { icon:'🛒', label:'Marketplace', page:'marketplace', color:'#9333EA' },
    { icon:'🤲', label:'SEL', page:'sel', color:'#16A34A' },
    { icon:'🥬', label:'Jardin', page:'garden', color:'#9333EA' },
    { icon:'📰', label:'Média', page:'media', color:'#5B21B6' },
  ];

  const featuredPetitions = AppData.petitions.filter(p=>p.featured).slice(0,3);
  const latestArticles = AppData.media.slice(0,3);

  return (
    <div style={{ background:COLORS.gray50, minHeight:'100vh' }}>
      {/* Hero */}
      <section style={{ position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#E11D74 0%,#FF3D7F 50%,#7C3AED 100%)', color:'#fff', padding:'clamp(32px,6vw,64px) 20px clamp(60px,8vw,90px)' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:250, height:250, borderRadius:'50%', background:'rgba(255,255,255,0.05)', filter:'blur(40px)', pointerEvents:'none' }}></div>
        <div style={{ position:'absolute', bottom:-40, left:-40, width:200, height:200, borderRadius:'50%', background:'rgba(255,165,0,0.15)', filter:'blur(32px)', pointerEvents:'none' }}></div>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center', position:'relative' }}>
          {!user && <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:9999, padding:'5px 14px', fontSize:12, fontWeight:600, marginBottom:16 }}>
            ✨ Rejoignez 946 membres actifs
          </div>}
          {user && <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:9999, padding:'6px 16px', fontSize:13, fontWeight:700, marginBottom:16 }}>
            👋 Bienvenue, {user.name} · <span style={{ opacity:0.8 }}><T99 value={user.t99cp_balance} size={12} /></span>
          </div>}
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(28px,6vw,64px)', fontWeight:800, lineHeight:1.05, letterSpacing:'-0.02em', margin:'0 0 12px' }}>
            Maintenant !<br />
            <span style={{ fontSize:'clamp(18px,4vw,44px)', color:'rgba(255,255,255,0.80)', fontWeight:700 }}>La voix des 99%</span>
          </h1>
          <p style={{ fontSize:'clamp(13px,2vw,17px)', color:'rgba(255,255,255,0.82)', marginBottom:28, lineHeight:1.65, maxWidth:580, margin:'0 auto 28px' }}>
            Pétitions · Mobilisations · Services solidaires · Réseau militant.<br />
            Ensemble, construisons une société plus juste.
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginBottom:36 }}>
            <Btn variant="white" size="lg" onClick={()=>setActivePage('petitions')}>📜 Signer une pétition</Btn>
            <Btn variant="outline" size="lg" style={{ borderColor:'rgba(255,255,255,0.4)', color:'#fff' }} onClick={()=>{ if(!user)onOpenAuth(); else setActivePage('creer'); }}>+ Créer une action</Btn>
          </div>
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, maxWidth:560, margin:'0 auto' }}>
            {stats.map(s=>(
              <div key={s.label} style={{ background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:14, padding:'10px 8px', textAlign:'center' }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(16px,2.5vw,24px)', fontWeight:800, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.65)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, color:COLORS.gray50, lineHeight:0 }}>
          <svg viewBox="0 0 1440 48" fill="none" style={{ display:'block', width:'100%' }}>
            <path d="M0 48L60 42C120 36 240 24 360 21C480 18 600 24 720 27C840 30 960 30 1080 25C1200 20 1320 8 1380 3L1440 0V48H0Z" fill="currentColor"/>
          </svg>
        </div>
      </section>

      {/* Quick Services Grid */}
      <section style={{ maxWidth:1152, margin:'0 auto', padding:'0 16px' }}>
        <div style={{ background:'#fff', borderRadius:20, boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:`1px solid ${COLORS.gray200}`, padding:'18px 20px', marginTop:-20, position:'relative', zIndex:10 }}>
          <div style={{ fontSize:12, fontWeight:600, color:COLORS.gray400, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>Services de la plateforme</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))', gap:8 }}>
            {quickServices.map(s=>(
              <button key={s.page} onClick={()=>setActivePage(s.page)} style={{ background:'transparent', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'10px 6px', borderRadius:12, transition:'background 0.15s' }} onMouseEnter={e=>e.currentTarget.style.background=COLORS.gray50} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ width:44, height:44, borderRadius:14, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{s.icon}</div>
                <span style={{ fontSize:11, fontWeight:600, color:COLORS.gray700, textAlign:'center', lineHeight:1.2 }}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Petitions */}
      <section style={{ maxWidth:1152, margin:'0 auto', padding:'32px 16px 16px' }}>
        <SectionHeader icon="📜" iconBg="linear-gradient(135deg,#E11D74,#7C3AED)" title="Pétitions en cours" sub="Signez et partagez" action={<Btn variant="outline" size="sm" onClick={()=>setActivePage('petitions')}>Voir tout →</Btn>} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {featuredPetitions.map(p=>(
            <Card key={p.id} onClick={()=>setActivePage('petitions')} style={{ overflow:'hidden' }}>
              <ImgPlaceholder style={{ height:110, borderRadius:'12px 12px 0 0' }} icon="✊" />
              <div style={{ padding:'12px 14px' }}>
                <Badge color="red" style={{ marginBottom:6, fontSize:10 }}>{p.category}</Badge>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:COLORS.gray900, margin:'0 0 8px', lineHeight:1.35, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.title}</h3>
                <Progress value={p.signatures} max={p.goal} />
                <div style={{ marginTop:6, fontSize:11, fontWeight:700, color:COLORS.red }}>{p.signatures.toLocaleString('fr-FR')} signatures</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Latest Media */}
      <section style={{ maxWidth:1152, margin:'0 auto', padding:'24px 16px' }}>
        <SectionHeader icon="📰" iconBg="linear-gradient(135deg,#374151,#6B7280)" title="Derniers articles" sub="Journalisme militant" action={<Btn variant="outline" size="sm" onClick={()=>setActivePage('media')}>Voir tout →</Btn>} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
          {latestArticles.map(a=>(
            <Card key={a.id} onClick={()=>setActivePage('media')} style={{ overflow:'hidden' }}>
              <ImgPlaceholder style={{ height:100, borderRadius:'12px 12px 0 0' }} icon="📰" />
              <div style={{ padding:'10px 12px 12px' }}>
                <Badge color="red" style={{ fontSize:10, marginBottom:6 }}>{a.category}</Badge>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:COLORS.gray900, margin:'0 0 4px', lineHeight:1.35, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{a.title}</h3>
                <div style={{ fontSize:11, color:COLORS.gray400 }}>✍️ {a.author} · ⏱ {a.reading_time} min</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Join CTA */}
      {!user && (
        <section style={{ maxWidth:1152, margin:'0 auto', padding:'24px 16px 100px' }}>
          <div style={{ background:GRAD, borderRadius:20, padding:'32px 28px', textAlign:'center', color:'#fff', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }}></div>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(18px,3vw,28px)', fontWeight:800, margin:'0 0 10px' }}>Rejoignez le mouvement</h2>
            <p style={{ fontSize:15, opacity:0.85, margin:'0 0 24px', lineHeight:1.5 }}>Créez votre profil gratuit et accédez à tous les services solidaires.</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <Btn variant="white" size="lg" onClick={onOpenAuth}>Créer mon compte</Btn>
              <Btn variant="outline" size="lg" style={{ borderColor:'rgba(255,255,255,0.4)', color:'#fff' }} onClick={()=>window.open('https://the99coinproject.org','_blank')}>🌐 THE99COINPROJECT</Btn>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
window.HomePage = HomePage;

// ── SERVICES HUB ──────────────────────────────────────────
function ServicesHub({ setActivePage }) {
  const services = [
    { icon:'📜', label:'Pétitions', desc:'Lancer et signer des pétitions citoyennes. Style Change.org.', page:'petitions', color:'#E11D74' },
    { icon:'📅', label:'Mobilisations', desc:'Événements, marches, assemblées, camps militants.', page:'mobilizations', color:'#7C3AED' },
    { icon:'💰', label:'Cagnottes', desc:'Collectes solidaires, caisses de lutte, budget participatif.', page:'crowdfunding', color:'#A21CAF' },
    { icon:'🏠', label:'Hébergement', desc:'Logement solidaire et temporaire, style Airbnb.', page:'housing', color:'#BE185D' },
    { icon:'🚗', label:'Covoiturage', desc:'Trajets partagés entre militant·es, style BlaBlaCar.', page:'carpooling', color:'#0284C7' },
    { icon:'🔧', label:'Ki Prête Tout', desc:'Prêt d\'objets entre voisin·es : outils, appareils, jeux.', page:'lending', color:'#0891B2' },
    { icon:'🛒', label:'Marketplace', desc:'Vente et achat solidaire — prix réduits en T99CP.', page:'marketplace', color:'#9333EA' },
    { icon:'🤲', label:'SEL', desc:'Système d\'échange local : 1 heure = 60 T99CP.', page:'sel', color:'#16A34A' },
    { icon:'🥬', label:'Surplus de Jardin', desc:'Légumes, fruits, plants, miel — dons et petits prix.', page:'garden', color:'#9333EA' },
    { icon:'📰', label:'Média', desc:'Journalisme militant et analyses approfondies.', page:'media', color:'#5B21B6' },
    { icon:'👥', label:'Réseau Social', desc:'Réseau militant sans publicité ni algorithme commercial.', page:'reseau', color:'#7C3AED' },
    { icon:'➕', label:'Créer', desc:'Publiez une pétition, un événement, une annonce...', page:'creer', color:COLORS.red },
  ];
  const [hov, setHov] = useState(null);
  return (
    <PageWrap title="⚙️ Tous les Services" subtitle="Chaque service est une application à part entière">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
        {services.map((s,i)=>(
          <div key={s.page} onClick={()=>setActivePage(s.page)} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
            style={{ background:'#fff', borderRadius:16, border:`1px solid ${COLORS.gray200}`, padding:'18px 18px 16px', cursor:'pointer', transition:'all 0.2s', boxShadow:hov===i?'0 8px 28px rgba(0,0,0,0.10)':'0 1px 3px rgba(0,0,0,0.05)', transform:hov===i?'translateY(-2px)':'none' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
              <div style={{ width:46, height:46, borderRadius:14, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{s.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:COLORS.gray900, marginBottom:3 }}>{s.label}</div>
                <div style={{ fontSize:12, color:COLORS.gray500, lineHeight:1.4 }}>{s.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageWrap>
  );
}
window.ServicesHub = ServicesHub;

// ── CREER PAGE ─────────────────────────────────────────────
function CreerPage({ setActivePage, user, onOpenAuth }) {
  const tiles = [
    { icon:'📜', label:'Pétition', desc:'Lancer une pétition', page:'petitions', color:'#E11D74' },
    { icon:'📅', label:'Événement', desc:'Organiser un rassemblement', page:'mobilizations', color:'#7C3AED' },
    { icon:'💰', label:'Cagnotte', desc:'Ouvrir une collecte', page:'crowdfunding', color:'#A21CAF' },
    { icon:'📰', label:'Article', desc:'Publier sur le média', page:'media', color:'#5B21B6' },
    { icon:'🔧', label:'Prêt objet', desc:'Prêter quelque chose', page:'lending', color:'#0891B2' },
    { icon:'🤲', label:'Service SEL', desc:'Proposer du temps', page:'sel', color:'#16A34A' },
    { icon:'🏠', label:'Hébergement', desc:'Offrir un logement', page:'housing', color:'#BE185D' },
    { icon:'🚗', label:'Covoiturage', desc:'Proposer un trajet', page:'carpooling', color:'#0284C7' },
    { icon:'🥬', label:'Surplus', desc:'Partager des fruits/légumes', page:'garden', color:'#9333EA' },
    { icon:'🛒', label:'Vente', desc:'Vendre sur la marketplace', page:'marketplace', color:'#9333EA' },
    { icon:'🚀', label:'Campagne', desc:'Lancer une campagne', page:'home', color:'#7C3AED' },
  ];
  const [hov, setHov] = useState(null);
  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'0 0 100px' }}>
      <div style={{ background:'#fff', borderBottom:`1px solid ${COLORS.gray200}`, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:60, zIndex:50 }}>
        <button onClick={()=>setActivePage('home')} style={{ border:'none', background:'transparent', cursor:'pointer', color:COLORS.gray500, fontSize:20, padding:4, borderRadius:8 }}>←</button>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:800, color:COLORS.gray900, margin:0 }}>Que voulez-vous créer ?</h2>
      </div>
      <div style={{ padding:'20px 16px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {tiles.map((t,i)=>(
            <button key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
              onClick={()=>{ if(!user){onOpenAuth();}else{setActivePage(t.page);} }}
              style={{ background:hov===i?`${t.color}12`:'#fff', border:hov===i?`1.5px solid ${t.color}50`:`1px solid ${COLORS.gray200}`, borderRadius:14, padding:'16px 10px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:6, transition:'all 0.18s', textAlign:'center', boxShadow:hov===i?`0 4px 16px ${t.color}20`:'none', fontFamily:'Inter,sans-serif' }}>
              <div style={{ fontSize:28 }}>{t.icon}</div>
              <div style={{ fontWeight:700, fontSize:12, color:COLORS.gray900 }}>{t.label}</div>
              <div style={{ fontSize:10, color:COLORS.gray400, lineHeight:1.3 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
window.CreerPage = CreerPage;
