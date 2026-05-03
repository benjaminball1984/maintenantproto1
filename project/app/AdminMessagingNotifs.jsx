// MessagingPage.jsx + NotificationsPage.jsx + AdminDashboard.jsx
const { useState, useRef, useEffect } = React;

// ── MESSAGERIE ────────────────────────────────────────────
const SAMPLE_CONVOS = [
  { id:1, with:'Thomas Rivière', lastMsg:'Parfait, je serai là à 14h !', time:'14:32', unread:2, online:true },
  { id:2, with:'Aisha Rahman', lastMsg:'Merci pour le cours de yoga 🙏', time:'hier', unread:0, online:false },
  { id:3, with:'Collectif DAL', lastMsg:'La réunion est confirmée pour jeudi', time:'hier', unread:1, online:true },
  { id:4, with:'Omar Benzara', lastMsg:'As-tu lu mon article sur T99CP ?', time:'lun.', unread:0, online:false },
  { id:5, with:'Léa Martin', lastMsg:'Je t\'apporte les courgettes ce soir', time:'dim.', unread:0, online:true },
];

const SAMPLE_MESSAGES = {
  1: [
    { id:1, from:'them', text:'Salut ! Tu seras à la manif de samedi ?', time:'10:12' },
    { id:2, from:'me', text:'Oui bien sûr ! On se retrouve où ?', time:'10:15' },
    { id:3, from:'them', text:'Place de la République à 14h. Il y aura un cortège syndical dès 14h30.', time:'10:18' },
    { id:4, from:'me', text:'Super, je viens avec 3 copains. On peut apporter des banderoles ?', time:'10:20' },
    { id:5, from:'them', text:'Parfait, je serai là à 14h !', time:'14:32' },
  ],
  2: [
    { id:1, from:'them', text:'Bonjour ! Je cherche un cours de yoga accessible à Paris 10e', time:'9:00' },
    { id:2, from:'me', text:'Je propose des cours via le SEL ! 60 T99CP la séance d\'1h', time:'9:30' },
    { id:3, from:'them', text:'Merci pour le cours de yoga 🙏', time:'11:20' },
  ],
};

function MessagingPage({ user, onOpenAuth }) {
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState(SAMPLE_MESSAGES);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  if (!user) return (
    <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ fontSize:56, marginBottom:16 }}>💬</div>
      <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:COLORS.gray900, margin:'0 0 8px' }}>Messagerie</h2>
      <p style={{ color:COLORS.gray500, fontSize:14, margin:'0 0 24px' }}>Connectez-vous pour accéder à vos messages.</p>
      <Btn variant="gradient" onClick={onOpenAuth}>Se connecter</Btn>
    </div>
  );

  const sendMessage = () => {
    if (!input.trim() || !activeConvo) return;
    const convoMsgs = messages[activeConvo.id] || [];
    setMessages(m=>({ ...m, [activeConvo.id]: [...convoMsgs, { id:Date.now(), from:'me', text:input, time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) }] }));
    setInput('');
    setTimeout(()=>messagesEndRef.current?.scrollIntoView({behavior:'smooth'}), 50);
  };

  const convoMsgs = activeConvo ? (messages[activeConvo.id] || []) : [];

  return (
    <div style={{ maxWidth:1000, margin:'0 auto', padding:'20px 16px 100px' }}>
      <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:COLORS.gray900, margin:'0 0 16px' }}>💬 Messages</h1>
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:0, background:'#fff', borderRadius:20, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', minHeight:520 }} className="mn-messaging-grid">
        {/* Conversations list */}
        <div style={{ borderRight:`1px solid ${COLORS.gray200}`, overflowY:'auto' }}>
          <div style={{ padding:'14px 16px', borderBottom:`1px solid ${COLORS.gray100}` }}>
            <input placeholder="Rechercher..." style={{ width:'100%', height:36, border:`1.5px solid ${COLORS.gray200}`, borderRadius:10, padding:'0 12px', fontSize:13, fontFamily:'Inter,sans-serif', outline:'none', boxSizing:'border-box' }} />
          </div>
          {SAMPLE_CONVOS.map(c=>(
            <div key={c.id} onClick={()=>setActiveConvo(c)} style={{ padding:'12px 16px', cursor:'pointer', background:activeConvo?.id===c.id?COLORS.gray50:'transparent', borderBottom:`1px solid ${COLORS.gray100}`, display:'flex', alignItems:'center', gap:10, transition:'background 0.15s' }}
              onMouseEnter={e=>{if(activeConvo?.id!==c.id)e.currentTarget.style.background=COLORS.gray50}} onMouseLeave={e=>{if(activeConvo?.id!==c.id)e.currentTarget.style.background='transparent'}}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:42, height:42, borderRadius:'50%', background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:16 }}>{c.with.charAt(0)}</div>
                {c.online && <div style={{ position:'absolute', bottom:1, right:1, width:10, height:10, borderRadius:'50%', background:'#22C55E', border:'2px solid #fff' }}></div>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                  <span style={{ fontWeight:700, fontSize:13, color:COLORS.gray900 }}>{c.with}</span>
                  <span style={{ fontSize:10, color:COLORS.gray400 }}>{c.time}</span>
                </div>
                <div style={{ fontSize:12, color:c.unread?COLORS.gray900:COLORS.gray500, fontWeight:c.unread?600:400, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.lastMsg}</div>
              </div>
              {c.unread > 0 && <div style={{ width:18, height:18, borderRadius:'50%', background:COLORS.red, color:'#fff', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{c.unread}</div>}
            </div>
          ))}
        </div>

        {/* Chat area */}
        {activeConvo ? (
          <div style={{ display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'12px 16px', borderBottom:`1px solid ${COLORS.gray100}`, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14 }}>{activeConvo.with.charAt(0)}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:COLORS.gray900 }}>{activeConvo.with}</div>
                <div style={{ fontSize:11, color:activeConvo.online?'#22C55E':COLORS.gray400 }}>{activeConvo.online?'En ligne':'Hors ligne'}</div>
              </div>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:8, minHeight:300, maxHeight:400 }}>
              {convoMsgs.map(m=>(
                <div key={m.id} style={{ display:'flex', justifyContent:m.from==='me'?'flex-end':'flex-start' }}>
                  <div style={{ maxWidth:'75%', padding:'8px 14px', borderRadius:m.from==='me'?'18px 18px 4px 18px':'18px 18px 18px 4px', background:m.from==='me'?GRAD_R:COLORS.gray100, color:m.from==='me'?'#fff':COLORS.gray900, fontSize:13, lineHeight:1.5 }}>
                    {m.text}
                    <div style={{ fontSize:10, opacity:0.6, marginTop:3, textAlign:'right' }}>{m.time}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding:'12px 16px', borderTop:`1px solid ${COLORS.gray100}`, display:'flex', gap:8 }}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder="Votre message..." style={{ flex:1, height:42, border:`1.5px solid ${COLORS.gray200}`, borderRadius:12, padding:'0 14px', fontSize:14, fontFamily:'Inter,sans-serif', outline:'none' }} />
              <button onClick={sendMessage} style={{ width:42, height:42, borderRadius:12, background:GRAD_R, border:'none', color:'#fff', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>↑</button>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:COLORS.gray400, padding:40 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>💬</div>
            <div style={{ fontWeight:600, fontSize:15, color:COLORS.gray600 }}>Sélectionnez une conversation</div>
            <div style={{ fontSize:13, marginTop:4 }}>ou commencez une nouvelle discussion</div>
          </div>
        )}
      </div>
    </div>
  );
}
window.MessagingPage = MessagingPage;

// ── NOTIFICATIONS ─────────────────────────────────────────
const SAMPLE_NOTIFS = [
  { id:1, icon:'✍️', title:'Nouvelle signature', desc:'Jean-Marc a signé votre pétition "Pour un RUB"', time:'il y a 5 min', read:false, color:'red' },
  { id:2, icon:'💬', title:'Nouveau message', desc:'Thomas Rivière vous a envoyé un message', time:'il y a 20 min', read:false, color:'blue' },
  { id:3, icon:'👥', title:'Nouveau follower', desc:'Aisha Rahman suit maintenant votre activité', time:'il y a 1h', read:false, color:'purple' },
  { id:4, icon:'📅', title:'Rappel événement', desc:'La marche pour le climat a lieu demain à 14h — Place de la République', time:'il y a 2h', read:true, color:'green' },
  { id:5, icon:'₮', title:'Transaction T99CP', desc:'Vous avez reçu 15 T99CP pour votre service SEL (Yoga)', time:'il y a 3h', read:true, color:'blue' },
  { id:6, icon:'🔥', title:'Pétition tendance', desc:'Votre pétition sur les urgences est en tête des tendances', time:'hier', read:true, color:'red' },
  { id:7, icon:'🤝', title:'Demande SEL', desc:'Léa Martin souhaite échangerd un service de jardinage', time:'hier', read:true, color:'green' },
  { id:8, icon:'💰', title:'Objectif cagnotte atteint', desc:'La cagnotte "Camp du Larzac" vient d\'atteindre 62% !', time:'avant-hier', read:true, color:'amber' },
];

function NotificationsPage({ user, onOpenAuth }) {
  const [notifs, setNotifs] = useState(SAMPLE_NOTIFS);
  const [filter, setFilter] = useState('Toutes');
  const unread = notifs.filter(n=>!n.read).length;

  if (!user) return (
    <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ fontSize:56, marginBottom:16 }}>🔔</div>
      <Btn variant="gradient" onClick={onOpenAuth}>Se connecter</Btn>
    </div>
  );

  const markAllRead = () => setNotifs(ns=>ns.map(n=>({...n,read:true})));
  const markRead = (id) => setNotifs(ns=>ns.map(n=>n.id===id?{...n,read:true}:n));
  const filtered = filter==='Non lues' ? notifs.filter(n=>!n.read) : notifs;

  return (
    <PageWrap title="🔔 Notifications" subtitle={`${unread} non lue${unread!==1?'s':''}`}
      action={unread>0&&<Btn variant="ghost" size="sm" onClick={markAllRead}>Tout marquer comme lu</Btn>}>
      <FilterPills options={['Toutes','Non lues']} active={filter} onChange={setFilter} />
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.map(n=>(
          <div key={n.id} onClick={()=>markRead(n.id)} style={{ background:'#fff', borderRadius:14, border:`1px solid ${n.read?COLORS.gray200:'#BFDBFE'}`, padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start', cursor:'pointer', transition:'all 0.15s', position:'relative', boxShadow:n.read?'none':'0 2px 8px rgba(37,99,235,0.08)' }}>
            {!n.read && <div style={{ position:'absolute', top:14, right:14, width:8, height:8, borderRadius:'50%', background:COLORS.red }}></div>}
            <div style={{ width:42, height:42, borderRadius:'50%', background:`${COLORS[n.color]||COLORS.gray500}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{n.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:13, color:COLORS.gray900, marginBottom:2 }}>{n.title}</div>
              <div style={{ fontSize:13, color:COLORS.gray600, lineHeight:1.4 }}>{n.desc}</div>
              <div style={{ fontSize:11, color:COLORS.gray400, marginTop:4 }}>{n.time}</div>
            </div>
          </div>
        ))}
        {filtered.length===0 && <EmptyState icon="🔔" title="Aucune notification" desc="Vous êtes à jour !" />}
      </div>
    </PageWrap>
  );
}
window.NotificationsPage = NotificationsPage;

// ── ADMIN DASHBOARD ───────────────────────────────────────
function AdminDashboard({ user, setActivePage }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingItem, setEditingItem] = useState(null);

  if (!user?.is_admin) return (
    <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ fontSize:56, marginBottom:16 }}>🔒</div>
      <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:COLORS.gray900, margin:'0 0 8px' }}>Accès refusé</h2>
      <p style={{ color:COLORS.gray500, fontSize:14, margin:'0 0 20px' }}>Vous devez être administrateur pour accéder à ce panneau.</p>
      <Btn variant="gradient" onClick={()=>setActivePage('home')}>← Retour</Btn>
    </div>
  );

  const stats = [
    { icon:'👥', label:'Membres', value:'946', trend:'+12 ce mois', color:'#7C3AED' },
    { icon:'📧', label:'Abonnés newsletter', value:'10 583', trend:'+234 ce mois', color:'#16A34A' },
    { icon:'📜', label:'Pétitions actives', value:'10', trend:'3 nouvelles', color:'#E11D74' },
    { icon:'✍️', label:'Signatures totales', value: AppData.petitions.reduce((a,p)=>a+p.signatures,0).toLocaleString('fr-FR'), trend:'+1 2k cette semaine', color:'#A21CAF' },
    { icon:'₮', label:'T99CP échangés', value:'12 450', trend:'+890 ce mois', color:'#7C3AED' },
    { icon:'🤝', label:'Services SEL', value:'20', trend:'5 nouveaux', color:'#0891B2' },
  ];

  const tabs = [['overview','📊 Vue d\'ensemble'],['petitions','📜 Pétitions'],['members','👥 Membres'],['payments','₮ Versements T99CP'],['emails','📧 Emailings'],['api','🔌 API & Connexions'],['content','📦 Contenus'],['settings','⚙️ Paramètres']];

  // Pending T99CP payouts (verseront mensuellement)
  const PENDING_PAYOUTS = [
    { id:1, member:'Camille Dubreuil', role:'Modérateur·rice forum', month:'Janvier 2026', amount:240, status:'pending', wallet:'0x4f2a...8b3c' },
    { id:2, member:'Karim Belkacem',   role:'Journaliste Média',     month:'Janvier 2026', amount:560, status:'pending', wallet:'0x8d1e...2f9a' },
    { id:3, member:'Léa Martin',        role:'Coordinatrice SEL',     month:'Janvier 2026', amount:180, status:'pending', wallet:'0x2c7b...4e10' },
    { id:4, member:'Thomas Rivière',    role:'Dev plateforme',        month:'Janvier 2026', amount:820, status:'pending', wallet:'0x6a3d...91f2' },
    { id:5, member:'Aisha Rahman',      role:'Animatrice ateliers',   month:'Janvier 2026', amount:120, status:'pending', wallet:'0x9b4c...5d8e' },
  ];
  const PAST_PAYOUTS = [
    { id:101, member:'Camille Dubreuil', role:'Modérateur·rice forum', month:'Décembre 2025', amount:240, status:'paid', tx:'0xab12...cf90', date:'2025-12-31' },
    { id:102, member:'Karim Belkacem',   role:'Journaliste Média',     month:'Décembre 2025', amount:520, status:'paid', tx:'0xfe34...12d8', date:'2025-12-31' },
    { id:103, member:'Léa Martin',        role:'Coordinatrice SEL',     month:'Décembre 2025', amount:180, status:'paid', tx:'0x7c9a...4b21', date:'2025-12-31' },
    { id:104, member:'Thomas Rivière',    role:'Dev plateforme',        month:'Décembre 2025', amount:820, status:'paid', tx:'0x3e8f...9c66', date:'2025-12-31' },
  ];

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 16px 100px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#D97706,#F59E0B)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>⚙️</div>
        <div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:COLORS.gray900, margin:0 }}>Panneau d'administration</h1>
          <p style={{ fontSize:13, color:COLORS.gray500, margin:0 }}>Bienvenue, {user.name} · Accès complet</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, background:COLORS.gray100, borderRadius:12, padding:4, marginBottom:24, overflowX:'auto' }}>
        {tabs.map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{ flex:'0 0 auto', padding:'9px 16px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', background:activeTab===id?'#fff':COLORS.gray100, color:activeTab===id?COLORS.red:COLORS.gray500, boxShadow:activeTab===id?'0 2px 8px rgba(0,0,0,0.08)':'none', transition:'all 0.15s' }}>{label}</button>
        ))}
      </div>

      {/* Overview */}
      {activeTab==='overview' && <>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12, marginBottom:24 }}>
          {stats.map(s=>(
            <Card key={s.label} style={{ padding:'16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
                <span style={{ fontSize:12, fontWeight:600, color:COLORS.gray600 }}>{s.label}</span>
              </div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:COLORS.gray900 }}>{s.value}</div>
              <div style={{ fontSize:11, color:COLORS.green, marginTop:3, fontWeight:600 }}>↑ {s.trend}</div>
            </Card>
          ))}
        </div>

        {/* Recent activity */}
        <Card style={{ padding:'16px 20px' }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:COLORS.gray900, margin:'0 0 14px' }}>Activité récente</h3>
          {[
            { icon:'📜', text:'Nouvelle pétition créée : "Pour un revenu universel"', time:'il y a 2h', badge:{label:'Pétition',color:'red'} },
            { icon:'👤', text:'Nouveau membre : Clara Fontaine (Paris)', time:'il y a 3h', badge:{label:'Membre',color:'blue'} },
            { icon:'₮', text:'Transaction T99CP : 45 T99CP échangés (SEL)', time:'il y a 4h', badge:{label:'T99CP',color:'purple'} },
            { icon:'💰', text:'Cagnotte "Camp du Larzac" : objectif 60% atteint', time:'il y a 5h', badge:{label:'Cagnotte',color:'amber'} },
            { icon:'🔔', text:'12 nouveaux abonnés newsletter ce matin', time:'il y a 6h', badge:{label:'Newsletter',color:'green'} },
          ].map((a,i)=>(
            <div key={i} style={{ display:'flex', gap:10, padding:'10px 0', borderBottom:i<4?`1px solid ${COLORS.gray100}`:'none', alignItems:'center' }}>
              <div style={{ fontSize:20 }}>{a.icon}</div>
              <div style={{ flex:1, fontSize:13, color:COLORS.gray700 }}>{a.text}</div>
              <Badge color={a.badge.color} style={{ flexShrink:0, fontSize:10 }}>{a.badge.label}</Badge>
              <span style={{ fontSize:11, color:COLORS.gray400, flexShrink:0 }}>{a.time}</span>
            </div>
          ))}
        </Card>
      </>}

      {/* Petitions admin */}
      {activeTab==='petitions' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:18, color:COLORS.gray900, margin:0 }}>Gestion des pétitions</h2>
            <Btn variant="success" size="sm">+ Nouvelle pétition</Btn>
          </div>
          <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${COLORS.gray200}`, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:COLORS.gray50 }}>
                  {['Titre','Catégorie','Signatures','Objectif','%','Statut','Actions'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:COLORS.gray500, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AppData.petitions.map((p,i)=>{
                  const pct = Math.round((p.signatures/p.goal)*100);
                  return (
                    <tr key={p.id} style={{ borderTop:`1px solid ${COLORS.gray100}` }} onMouseEnter={e=>e.currentTarget.style.background=COLORS.gray50} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:COLORS.gray900, maxWidth:200 }}><div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div></td>
                      <td style={{ padding:'10px 14px' }}><Badge color="red" style={{ fontSize:10 }}>{p.category}</Badge></td>
                      <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:COLORS.gray900 }}>{p.signatures.toLocaleString('fr-FR')}</td>
                      <td style={{ padding:'10px 14px', fontSize:13, color:COLORS.gray500 }}>{p.goal.toLocaleString('fr-FR')}</td>
                      <td style={{ padding:'10px 14px' }}><div style={{ width:60 }}><div style={{ height:4, background:COLORS.gray100, borderRadius:9999, overflow:'hidden' }}><div style={{ height:'100%', width:`${pct}%`, background:GRAD_R, borderRadius:9999 }}></div></div><div style={{ fontSize:10, color:COLORS.gray400, marginTop:2 }}>{pct}%</div></div></td>
                      <td style={{ padding:'10px 14px' }}><Badge color={p.status==='active'?'green':'gray'}>{p.status==='active'?'Active':'Fermée'}</Badge></td>
                      <td style={{ padding:'10px 14px' }}>
                        <div style={{ display:'flex', gap:4 }}>
                          <button style={{ padding:'4px 8px', border:`1px solid ${COLORS.amber}`, background:'#FEF9C3', color:'#92400E', borderRadius:8, fontSize:11, cursor:'pointer', fontWeight:600, fontFamily:'Inter,sans-serif' }}>✏️</button>
                          <button style={{ padding:'4px 8px', border:`1px solid ${COLORS.gray200}`, background:COLORS.gray50, color:COLORS.gray600, borderRadius:8, fontSize:11, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>👁️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Members admin */}
      {activeTab==='members' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:18, color:COLORS.gray900, margin:0 }}>Gestion des membres</h2>
            <Btn variant="success" size="sm">+ Inviter un membre</Btn>
          </div>
          <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${COLORS.gray200}`, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:COLORS.gray50 }}>
                {['Membre','Rôle','Localisation','Solde T99CP','Badges','Actions'].map(h=>(
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:COLORS.gray500, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {[...SAMPLE_MEMBERS, { id:7, name:'Sophie Laurent', role:'Militante', location:'Toulouse', joined:'2026-01', t99cp:42, badges:['Nouvelle membre'] }].map((m,i)=>(
                  <tr key={m.id} style={{ borderTop:`1px solid ${COLORS.gray100}` }} onMouseEnter={e=>e.currentTarget.style.background=COLORS.gray50} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13, flexShrink:0 }}>{m.name.charAt(0)}</div>
                        <span style={{ fontSize:13, fontWeight:600, color:COLORS.gray900 }}>{m.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:13, color:COLORS.gray600 }}>{m.role}</td>
                    <td style={{ padding:'10px 14px', fontSize:13, color:COLORS.gray600 }}>📍 {m.location}</td>
                    <td style={{ padding:'10px 14px' }}><T99 value={m.t99cp} size={12} /></td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>{m.badges.slice(0,2).map(b=><Badge key={b} color="blue" style={{ fontSize:9 }}>{b}</Badge>)}</div>
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', gap:4 }}>
                        <button style={{ padding:'4px 8px', border:`1px solid ${COLORS.amber}`, background:'#FEF9C3', color:'#92400E', borderRadius:8, fontSize:11, cursor:'pointer', fontWeight:600, fontFamily:'Inter,sans-serif' }}>✏️ Rôle</button>
                        <button style={{ padding:'4px 8px', border:`1px solid #FCA5A5`, background:'#FEE2E2', color:'#991B1B', borderRadius:8, fontSize:11, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>🚫</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Versements T99CP */}
      {activeTab==='payments' && (() => {
        const totalPending = PENDING_PAYOUTS.reduce((a,p)=>a+p.amount,0);
        const totalPaid = PAST_PAYOUTS.reduce((a,p)=>a+p.amount,0);
        return (
          <div>
            {/* Header info */}
            <div style={{ background:'linear-gradient(135deg,#FEF3C7 0%,#FDE68A 100%)', border:`1px solid #FCD34D`, borderRadius:14, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'flex-start', gap:12 }}>
              <div style={{ fontSize:22, flexShrink:0 }}>💡</div>
              <div style={{ flex:1, fontSize:13, color:'#78350F', lineHeight:1.5 }}>
                <strong>Versements mensuels en T99CP.</strong> Les contributeur·rices régulier·es (modération, journalisme, dev, animation) sont rémunéré·es en T99CP via Polygon. Le versement collectif se déclenche le dernier jour du mois après validation par le conseil d'administration.
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12, marginBottom:20 }}>
              <Card style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:COLORS.gray500, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>À verser ce mois</div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:'#7C3AED' }}>{totalPending.toLocaleString('fr-FR')} <span style={{ fontSize:14 }}>T99CP</span></div>
                <div style={{ fontSize:11, color:COLORS.gray500, marginTop:3 }}>{PENDING_PAYOUTS.length} contributeur·rices</div>
              </Card>
              <Card style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:COLORS.gray500, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Versé le mois dernier</div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:COLORS.gray900 }}>{totalPaid.toLocaleString('fr-FR')} <span style={{ fontSize:14 }}>T99CP</span></div>
                <div style={{ fontSize:11, color:COLORS.green, marginTop:3, fontWeight:600 }}>✓ Décembre 2025 payé</div>
              </Card>
              <Card style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:COLORS.gray500, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Trésor T99CP</div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:COLORS.gray900 }}>48 320 <span style={{ fontSize:14 }}>T99CP</span></div>
                <div style={{ fontSize:11, color:COLORS.gray500, marginTop:3 }}>~ 14 mois de couverture</div>
              </Card>
              <Card style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:COLORS.gray500, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Frais Polygon estimés</div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:COLORS.gray900 }}>0,12 €</div>
                <div style={{ fontSize:11, color:COLORS.gray500, marginTop:3 }}>pour 5 transactions</div>
              </Card>
            </div>

            {/* Pending table */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:17, color:COLORS.gray900, margin:0 }}>Versements en attente · Janvier 2026</h2>
              <div style={{ display:'flex', gap:8 }}>
                <Btn variant="outline" size="sm">📥 Exporter CSV</Btn>
                <Btn variant="gradient" size="sm" onClick={()=>alert(`Versement collectif de ${totalPending} T99CP\n\n→ Confirmation conseil d'administration requise\n→ Multisig 3/5 signatures\n→ Transaction Polygon en lot`)}>⚡ Lancer le versement</Btn>
              </div>
            </div>
            <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', marginBottom:24 }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:COLORS.gray50 }}>
                  {['Bénéficiaire','Rôle','Période','Wallet Polygon','Montant','Statut','Actions'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:COLORS.gray500, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {PENDING_PAYOUTS.map(p=>(
                    <tr key={p.id} style={{ borderTop:`1px solid ${COLORS.gray100}` }} onMouseEnter={e=>e.currentTarget.style.background=COLORS.gray50} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'10px 14px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:32, height:32, borderRadius:'50%', background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13, flexShrink:0 }}>{p.member.charAt(0)}</div>
                          <span style={{ fontSize:13, fontWeight:600, color:COLORS.gray900 }}>{p.member}</span>
                        </div>
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:13, color:COLORS.gray600 }}>{p.role}</td>
                      <td style={{ padding:'10px 14px', fontSize:13, color:COLORS.gray600 }}>{p.month}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <code style={{ fontSize:11, fontFamily:'monospace', background:COLORS.gray100, padding:'3px 6px', borderRadius:4, color:COLORS.gray700 }}>{p.wallet}</code>
                      </td>
                      <td style={{ padding:'10px 14px' }}><T99 value={p.amount} size={13} /></td>
                      <td style={{ padding:'10px 14px' }}><Badge color="amber" style={{ fontSize:10 }}>⏳ En attente</Badge></td>
                      <td style={{ padding:'10px 14px' }}>
                        <div style={{ display:'flex', gap:4 }}>
                          <button style={{ padding:'4px 8px', border:`1px solid #86EFAC`, background:'#DCFCE7', color:'#166534', borderRadius:8, fontSize:11, cursor:'pointer', fontWeight:600, fontFamily:'Inter,sans-serif' }}>✓ Approuver</button>
                          <button style={{ padding:'4px 8px', border:`1px solid ${COLORS.gray200}`, background:COLORS.gray50, color:COLORS.gray600, borderRadius:8, fontSize:11, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>✏️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* History */}
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:17, color:COLORS.gray900, margin:'0 0 12px' }}>Historique des versements</h2>
            <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${COLORS.gray200}`, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ background:COLORS.gray50 }}>
                  {['Bénéficiaire','Période','Montant','Date versement','Hash Polygon','Statut'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:COLORS.gray500, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {PAST_PAYOUTS.map(p=>(
                    <tr key={p.id} style={{ borderTop:`1px solid ${COLORS.gray100}` }} onMouseEnter={e=>e.currentTarget.style.background=COLORS.gray50} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:COLORS.gray900 }}>{p.member}</td>
                      <td style={{ padding:'10px 14px', fontSize:13, color:COLORS.gray600 }}>{p.month}</td>
                      <td style={{ padding:'10px 14px' }}><T99 value={p.amount} size={13} /></td>
                      <td style={{ padding:'10px 14px', fontSize:13, color:COLORS.gray600 }}>{p.date}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <code style={{ fontSize:11, fontFamily:'monospace', background:'#F0F9FF', padding:'3px 6px', borderRadius:4, color:'#0369A1' }}>{p.tx}</code>
                      </td>
                      <td style={{ padding:'10px 14px' }}><Badge color="green" style={{ fontSize:10 }}>✓ Versé</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Emailings (Resend) */}
      {activeTab==='emails' && <EmailingsPanel />}

      {/* API & Connexions */}
      {activeTab==='api' && <ApiConnectionsPanel />}

      {/* Content */}
      {activeTab==='content' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
          {[
            { icon:'📜', label:'Pétitions', count:AppData.petitions.length, page:'petitions' },
            { icon:'📅', label:'Mobilisations', count:AppData.mobilizations.length, page:'mobilizations' },
            { icon:'💰', label:'Cagnottes', count:AppData.crowdfunding.length, page:'crowdfunding' },
            { icon:'🏠', label:'Hébergements', count:AppData.housing.length, page:'housing' },
            { icon:'🚗', label:'Trajets', count:AppData.carpooling_offers.length+AppData.carpooling_requests.length, page:'carpooling' },
            { icon:'🔧', label:'Objets à prêter', count:AppData.lending.length, page:'lending' },
            { icon:'🛒', label:'Articles marketplace', count:AppData.marketplace.length, page:'marketplace' },
            { icon:'🤲', label:'Services SEL', count:AppData.sel.length, page:'sel' },
            { icon:'🥬', label:'Surplus jardin', count:AppData.garden.length, page:'garden' },
            { icon:'📰', label:'Articles média', count:AppData.media.length, page:'media' },
          ].map(item=>(
            <Card key={item.label} onClick={()=>setActivePage(item.page)} style={{ padding:'16px', cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ fontSize:28 }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:COLORS.gray900 }}>{item.label}</div>
                <div style={{ fontSize:12, color:COLORS.gray500 }}>{item.count} entrées</div>
              </div>
              <Btn variant="outline" size="sm" style={{ marginLeft:'auto' }}>Gérer</Btn>
            </Card>
          ))}
        </div>
      )}

      {/* Settings */}
      {activeTab==='settings' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12, maxWidth:600 }}>
          {[
            { icon:'🎨', title:'Apparence & Branding', desc:'Logo, couleurs, police de la plateforme' },
            { icon:'📧', title:'Emails & Notifications', desc:'Modèles d\'email, fréquence des notifications' },
            { icon:'🔒', title:'Sécurité', desc:'2FA, gestion des sessions, audit log' },
            { icon:'₮', title:'Paramètres T99CP', desc:'Taux de change, frais de port Polygon, limites' },
            { icon:'📊', title:'Analytics', desc:'Statistiques avancées et exports CSV' },
            { icon:'🌐', title:'SEO & Réseaux sociaux', desc:'Méta-tags, Open Graph, sitemap' },
          ].map(s=>(
            <Card key={s.title} style={{ padding:'14px 18px', display:'flex', alignItems:'center', gap:14, cursor:'pointer' }} onClick={()=>alert(`Paramètre : ${s.title}`)}>
              <div style={{ fontSize:24 }}>{s.icon}</div>
              <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14, color:COLORS.gray900 }}>{s.title}</div><div style={{ fontSize:12, color:COLORS.gray500 }}>{s.desc}</div></div>
              <span style={{ color:COLORS.gray300, fontSize:18 }}>›</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
window.AdminDashboard = AdminDashboard;
