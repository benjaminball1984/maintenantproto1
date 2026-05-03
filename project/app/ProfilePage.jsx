// ProfilePage.jsx — Profil unifié + Wallet T99CP
const { useState } = React;

function ProfilePage({ user, setUser, adminMode, setActivePage, onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [t99Open, setT99Open] = useState(false);
  const [profile, setProfile] = useState(user || AppData.defaultUser);

  if (!user) return (
    <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ fontSize:56, marginBottom:16 }}>👤</div>
      <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:COLORS.gray900, margin:'0 0 8px' }}>Connectez-vous</h2>
      <p style={{ color:COLORS.gray500, fontSize:15, maxWidth:320, lineHeight:1.6, margin:'0 0 24px' }}>Créez votre profil unifié pour accéder à tous les services de la plateforme.</p>
      <Btn variant="gradient" size="lg" onClick={onOpenAuth}>Se connecter / Créer un compte</Btn>
    </div>
  );

  const tabs = [
    { id:'overview', label:'Vue d\'ensemble', icon:'📊' },
    { id:'wallet', label:'Wallet T99CP', icon:'₮' },
    { id:'activity', label:'Activité', icon:'📋' },
    { id:'settings', label:'Paramètres', icon:'⚙️' },
  ];

  const activities = [
    { icon:'✍️', text:'Vous avez signé "Stop à la fermeture des urgences"', time:'il y a 2 heures', color:'red' },
    { icon:'₮', text:'Contribution 15 T99CP — Camp du Larzac', time:'il y a 1 jour', color:'blue' },
    { icon:'🤝', text:'Service SEL échangé : Cours de yoga (60 min)', time:'il y a 3 jours', color:'purple' },
    { icon:'📜', text:'Vous avez créé la pétition "Pour un RUB"', time:'il y a 1 semaine', color:'green' },
    { icon:'🏠', text:'Hébergement réservé — Lyon Croix-Rousse (3 nuits)', time:'il y a 2 semaines', color:'amber' },
    { icon:'🚗', text:'Covoiturage réservé Paris → Lyon', time:'il y a 3 semaines', color:'blue' },
  ];

  return (
    <PageWrap>
      {/* Profile Header */}
      <div style={{ background:'#fff', borderRadius:20, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', marginBottom:20, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ height:100, background:GRAD, position:'relative' }}>
          <div style={{ position:'absolute', bottom:-36, left:24, width:72, height:72, borderRadius:'50%', background:GRAD, border:'4px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:28, boxShadow:'0 4px 12px rgba(193,18,31,0.3)' }}>
            {profile.name?.charAt(0)?.toUpperCase()||'U'}
          </div>
          <div style={{ position:'absolute', top:12, right:12, display:'flex', gap:8 }}>
            <Btn variant="white" size="sm" onClick={()=>setEditOpen(true)}>✏️ Modifier</Btn>
            {adminMode && <Badge color="amber">⚙️ Admin</Badge>}
          </div>
        </div>
        <div style={{ padding:'44px 24px 20px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:COLORS.gray900, margin:'0 0 4px' }}>{profile.name}</h1>
              <p style={{ fontSize:13, color:COLORS.gray500, margin:'0 0 8px' }}>📍 {profile.location||'France'} · Membre depuis {new Date(profile.joined||'2025-01-01').toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</p>
              {profile.bio && <p style={{ fontSize:14, color:COLORS.gray700, margin:'0 0 10px', lineHeight:1.5, maxWidth:500 }}>{profile.bio}</p>}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {(profile.badges||[]).map(b=><Badge key={b} color="red">{b}</Badge>)}
              </div>
            </div>
            <div style={{ background:COLORS.gray50, borderRadius:14, padding:'14px 18px', border:`1px solid ${COLORS.gray200}`, textAlign:'center', minWidth:140 }}>
              <div style={{ fontSize:11, color:COLORS.gray400, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Solde Wallet</div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:28, fontWeight:800, color:COLORS.blue, lineHeight:1 }}>{profile.t99cp_balance}</div>
              <div style={{ fontSize:12, color:COLORS.blue, fontWeight:600 }}>T99CP</div>
              <div style={{ fontSize:11, color:COLORS.gray400, marginTop:2 }}>≈ {profile.t99cp_balance} €</div>
              <Btn variant="t99cp" size="sm" style={{ marginTop:10, width:'100%' }} onClick={()=>setT99Open(true)}>Gérer →</Btn>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:`1px solid ${COLORS.gray100}` }}>
          {[['📜','Pétitions signées', profile.petitions_signed||8],['✊','Mobilisations', 3],['🤝','Services SEL', profile.services_used||5],['💰','Contributions', 4]].map(([icon,label,val])=>(
            <div key={label} style={{ padding:'14px 10px', textAlign:'center', borderRight:`1px solid ${COLORS.gray100}` }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
              <div style={{ fontWeight:700, fontSize:18, color:COLORS.gray900 }}>{val}</div>
              <div style={{ fontSize:11, color:COLORS.gray400 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, background:COLORS.gray100, borderRadius:12, padding:4, marginBottom:20, overflowX:'auto' }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{ flex:'0 0 auto', padding:'9px 16px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', transition:'all 0.15s', background:activeTab===t.id?'#fff':COLORS.gray100, color:activeTab===t.id?COLORS.red:COLORS.gray500, boxShadow:activeTab===t.id?'0 2px 8px rgba(0,0,0,0.08)':'none' }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab==='overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
          {[
            { icon:'📜', title:'Mes pétitions', desc:'Gérez vos pétitions créées et signées', action:'petitions', color:COLORS.red },
            { icon:'📅', title:'Mes mobilisations', desc:'Événements auxquels vous participez', action:'mobilizations', color:COLORS.blue },
            { icon:'🤝', title:'Mes services SEL', desc:'Échanges en cours et historique', action:'sel', color:COLORS.purple },
            { icon:'🛒', title:'Mes achats', desc:'Historique marketplace et locations', action:'marketplace', color:COLORS.amber },
            { icon:'💰', title:'Mes cagnottes', desc:'Contributions et collectes créées', action:'crowdfunding', color:COLORS.green },
            { icon:'🔔', title:'Notifications', desc:'Messages et alertes en attente', action:'home', color:COLORS.gray700 },
          ].map(item=>(
            <Card key={item.title} onClick={()=>setActivePage(item.action)} style={{ padding:'16px 18px', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:46, height:46, borderRadius:14, background:`${item.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{item.icon}</div>
              <div><div style={{ fontWeight:700, fontSize:14, color:COLORS.gray900, marginBottom:2 }}>{item.title}</div><div style={{ fontSize:12, color:COLORS.gray500 }}>{item.desc}</div></div>
              <span style={{ marginLeft:'auto', color:COLORS.gray300, fontSize:18 }}>›</span>
            </Card>
          ))}
        </div>
      )}

      {activeTab==='wallet' && (
        <div>
          <div style={{ background:'linear-gradient(135deg,#1e3a5f,#1d4ed8,#3b82f6)', borderRadius:20, padding:'28px 24px', color:'#fff', marginBottom:20, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }}></div>
            <div style={{ fontSize:13, fontWeight:600, opacity:0.75, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>Wallet T99CP · Réseau Polygon</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:48, fontWeight:800, lineHeight:1, marginBottom:6 }}>{profile.t99cp_balance}</div>
            <div style={{ fontSize:16, opacity:0.8 }}>T99CP ≈ {profile.t99cp_balance} €</div>
            <div style={{ marginTop:6, fontSize:12, opacity:0.6 }}>1 T99CP = 1 € = 1 minute de travail</div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={()=>window.open('https://the99coinproject.org','_blank')} style={{ background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:12, padding:'10px 18px', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>🌐 Ouvrir le Wallet</button>
              <button style={{ background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:12, padding:'10px 18px', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>📤 Envoyer</button>
              <button style={{ background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:12, padding:'10px 18px', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>📥 Recevoir</button>
            </div>
          </div>
          <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${COLORS.gray200}`, padding:'16px 20px', marginBottom:16 }}>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:COLORS.gray900, margin:'0 0 14px' }}>Transactions récentes</h3>
            {[
              { icon:'💸', label:'Covoiturage Paris → Lyon', amount:-8, date:'Hier' },
              { icon:'📥', label:'Recharge wallet', amount:+50, date:'Il y a 3 jours' },
              { icon:'🏠', label:'Hébergement Lyon (3 nuits)', amount:-72, date:'Il y a 5 jours' },
              { icon:'🤲', label:'SEL — Cours de yoga reçu', amount:-60, date:'Il y a 1 semaine' },
              { icon:'🛒', label:'Vente baskets Nike', amount:+7, date:'Il y a 10 jours' },
            ].map((tx,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom: i<4?`1px solid ${COLORS.gray100}`:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ fontSize:22 }}>{tx.icon}</div>
                  <div><div style={{ fontWeight:600, fontSize:13, color:COLORS.gray900 }}>{tx.label}</div><div style={{ fontSize:11, color:COLORS.gray400 }}>{tx.date}</div></div>
                </div>
                <span style={{ fontWeight:700, fontSize:14, color:tx.amount>0?COLORS.green:'#EF4444' }}>{tx.amount>0?'+':''}{tx.amount} T99CP</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center' }}>
            <Btn variant="t99cp" onClick={()=>window.open('https://the99coinproject.org','_blank')}>🌐 Accéder au wallet complet sur The99CoinProject.org</Btn>
          </div>
        </div>
      )}

      {activeTab==='activity' && (
        <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${COLORS.gray200}`, padding:'16px 20px' }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:COLORS.gray900, margin:'0 0 14px' }}>Activité récente</h3>
          {activities.map((a,i)=>(
            <div key={i} style={{ display:'flex', gap:12, padding:'12px 0', borderBottom:i<activities.length-1?`1px solid ${COLORS.gray100}`:'none', alignItems:'flex-start' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:COLORS.gray100, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{a.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:COLORS.gray900, lineHeight:1.4, fontWeight:500 }}>{a.text}</div>
                <div style={{ fontSize:11, color:COLORS.gray400, marginTop:2 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab==='settings' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[
            { icon:'🔔', title:'Notifications', desc:'Gérer vos préférences de notification' },
            { icon:'🔒', title:'Sécurité & Confidentialité', desc:'Mot de passe, 2FA, données personnelles' },
            { icon:'📧', title:'Newsletter', desc:'Vos abonnements aux newsletters' },
            { icon:'🌐', title:'Langue', desc:'Français (défaut)' },
            { icon:'📄', title:'RGPD — Export de données', desc:'Télécharger toutes vos données' },
          ].map(s=>(
            <Card key={s.title} style={{ padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ fontSize:22 }}>{s.icon}</div>
              <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14, color:COLORS.gray900 }}>{s.title}</div><div style={{ fontSize:12, color:COLORS.gray500 }}>{s.desc}</div></div>
              <span style={{ color:COLORS.gray300, fontSize:18 }}>›</span>
            </Card>
          ))}
          <Btn variant="danger" onClick={()=>{ setUser(null); setActivePage('home'); }} style={{ marginTop:8 }}>🚪 Se déconnecter</Btn>
        </div>
      )}

      <EditModal open={editOpen} onClose={()=>setEditOpen(false)} title="Modifier mon profil" data={profile}
        onSave={f=>{setProfile(p=>({...p,...f}));setUser&&setUser(u=>({...u,...f}));}}
        fields={[{key:'name',label:'Nom complet'},{key:'location',label:'Ville'},{key:'bio',label:'Présentation',type:'textarea'}]} />
      <T99Modal open={t99Open} onClose={()=>setT99Open(false)} amount={0} item="Gestion Wallet T99CP" description="Accédez à votre wallet pour recharger, envoyer ou recevoir des T99CP." />
    </PageWrap>
  );
}
window.ProfilePage = ProfilePage;
