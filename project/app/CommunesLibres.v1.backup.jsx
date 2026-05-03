// CommunesLibres.jsx — Espace Adhérents + Communes Libres + Fédérations + Assemblée
const { useState, useMemo } = React;

// ── Sample data ────────────────────────────────────────────
const SAMPLE_COMMUNES = [
  { id:1, name:'Commune Libre de Belleville', type:'quartier', location:'Paris 20e', members:23, founded:'2025-03', description:'Commune libre du quartier de Belleville, foyer de résistance culturelle et sociale.', active:true, federation_id:1, services:['petitions','sel','media'] },
  { id:2, name:'Commune Libre de la Croix-Rousse', type:'quartier', location:'Lyon 4e', members:31, founded:'2025-01', description:'Le plateau militant de Lyon — tisseurs et tisseuses d\'un autre monde.', active:true, federation_id:1, services:['petitions','mobilizations','sel'] },
  { id:3, name:'Commune Libre de Notre-Dame-des-Landes', type:'zad', location:'Loire-Atlantique', members:89, founded:'2024-11', description:'La ZAD de Notre-Dame-des-Landes continue d\'exister et de rayonner.', active:true, federation_id:2, services:['petitions','garden','sel','crowdfunding'] },
  { id:4, name:'Commune Libre du Tiers Lieu Confluences', type:'tiers_lieu', location:'Bordeaux', members:12, founded:'2026-01', description:'Commune naissante autour du tiers lieu Confluences. Venez nous rejoindre !', active:true, federation_id:null, services:['sel','media'] },
  { id:5, name:'Commune Libre de Montreuil', type:'commune', location:'Montreuil (93)', members:56, founded:'2025-05', description:'La commune libre de Montreuil, ville militante par excellence.', active:true, federation_id:2, services:['petitions','mobilizations','marketplace','sel'] },
  { id:6, name:'Commune Libre des Cévennes', type:'village', location:'Gard', members:8, founded:'2025-10', description:'Commune libre en milieu rural, pour une agriculture paysanne et solidaire.', active:true, federation_id:null, services:['garden','sel','lending'] },
  { id:7, name:'Commune Libre de Toulouse Arnaud-Bernard', type:'quartier', location:'Toulouse', members:19, founded:'2025-08', description:'Quartier populaire et militant de Toulouse.', active:true, federation_id:3, services:['petitions','sel','reseau'] },
  { id:8, name:'Commune Libre du Vieux-Port', type:'quartier', location:'Marseille', members:44, founded:'2025-02', description:'Commune libre du coeur de Marseille, plurielle et combative.', active:true, federation_id:3, services:['petitions','crowdfunding','media'] },
];

const SAMPLE_FEDERATIONS = [
  { id:1, name:'Fédération Île-de-France / Rhône-Alpes', communes:[1,2], description:'Fédération inter-régionale Paris-Lyon, pour construire des luttes communes.', created:'2025-04' },
  { id:2, name:'Fédération Grand Ouest', communes:[3,5], description:'Les communes libres de l\'Ouest fédérées autour des luttes rurales et urbaines.', created:'2025-06' },
  { id:3, name:'Fédération Sud', communes:[7,8], description:'Toulouse et Marseille unies pour une fédération du Grand Sud militant.', created:'2025-09' },
];

const SAMPLE_CONFEDERATION = {
  id:1, name:'Confédération des Communes et Territoires Libres',
  federations:[1,2,3], communes_directes:[4,6],
  description:'La confédération rassemble toutes les communes libres et fédérations de la plateforme Maintenant! Elle organise l\'Assemblée Confédérale.',
  created:'2025-12',
};

const TYPE_LABELS = { quartier:'Quartier', commune:'Commune', village:'Village', zad:'ZAD', tiers_lieu:'Tiers-Lieu' };
const TYPE_COLORS = { quartier:T.brand, commune:T.info, village:T.success, zad:'#D97706', tiers_lieu:'#7C3AED' };

// ── Composants ─────────────────────────────────────────────
function CommuneCard({ c, onClick, isAdmin }) {
  const fed = SAMPLE_FEDERATIONS.find(f => f.id === c.federation_id);
  return (
    <div onClick={onClick} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, padding: '20px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${TYPE_COLORS[c.type] || T.brand}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>{ {quartier:'🏘️',commune:'🏛️',village:'🌾',zad:'🌱',tiers_lieu:'🔧'}[c.type]||'🏛️'}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Tag size="xs" style={{ background:`${TYPE_COLORS[c.type]}18`, color:TYPE_COLORS[c.type], border:'none', marginBottom:6 }}>{TYPE_LABELS[c.type]}</Tag>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:T.text1, margin:'0 0 3px', lineHeight:1.3 }}>{c.name}</h3>
          <div style={{ fontSize:12, color:T.text3, display:'flex', alignItems:'center', gap:4 }}>{ICONS.pin} {c.location}</div>
        </div>
      </div>
      <p style={{ fontSize:13, color:T.text3, margin:'0 0 12px', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{c.description}</p>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:6 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <Tag size="xs">{c.members} membre{c.members>1?'s':''}</Tag>
          {c.members >= 5 ? <Tag variant="success" size="xs">✓ Représentation</Tag> : <Tag variant="warning" size="xs">{5-c.members} pour la représentation</Tag>}
        </div>
        {fed && <Tag size="xs" variant="info">{fed.name.split(' ').slice(0,3).join(' ')}...</Tag>}
      </div>
      {c.services?.length > 0 && (
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:10, paddingTop:10, borderTop:`1px solid ${T.border}` }}>
          {c.services.map(s => <Tag key={s} size="xs" style={{ fontSize:10 }}>{s}</Tag>)}
        </div>
      )}
    </div>
  );
}

function CommuneDetail({ c, onBack, user }) {
  const fed = SAMPLE_FEDERATIONS.find(f => f.id === c.federation_id);
  const [joined, setJoined] = useState(false);
  const [tab, setTab] = useState('about');
  const allServices = [
    { id:'petitions',label:'Pétitions'},{id:'mobilizations',label:'Mobilisations'},{id:'crowdfunding',label:'Cagnottes'},
    {id:'housing',label:'Hébergement'},{id:'carpooling',label:'Covoiturage'},{id:'lending',label:'Ki Prête Tout'},
    {id:'marketplace',label:'Marketplace'},{id:'sel',label:'SEL'},{id:'garden',label:'Jardin'},{id:'media',label:'Média'},
  ];

  return (
    <div style={{ maxWidth:860, margin:'0 auto', padding:'24px 20px 100px' }}>
      <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, border:'none', background:'transparent', cursor:'pointer', color:T.text2, fontSize:14, fontWeight:600, fontFamily:'Inter,sans-serif', padding:'8px 0', marginBottom:20 }}>
        {ICONS.arrow_l} Communes Libres
      </button>

      {/* Header */}
      <div style={{ background:T.surface, borderRadius:24, border:`1px solid ${T.border}`, overflow:'hidden', marginBottom:24, boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ background:`linear-gradient(135deg,${TYPE_COLORS[c.type]||T.brand},${TYPE_COLORS[c.type]||T.brand}99)`, padding:'32px 28px', color:'#fff' }}>
          <Tag size="xs" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', border:'none', marginBottom:14 }}>{TYPE_LABELS[c.type]}</Tag>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(20px,3.5vw,28px)', fontWeight:800, margin:'0 0 8px', lineHeight:1.2 }}>{c.name}</h1>
          <div style={{ fontSize:14, opacity:0.85, display:'flex', alignItems:'center', gap:6 }}>{ICONS.pin} {c.location}</div>
        </div>
        <div style={{ padding:'20px 28px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:20 }}>
            {[['Membres',c.members],['Fondée',c.founded],['Représentation',c.members>=5?'Oui (≥5)':'Non (<5)'],['Fédération',fed?.name.split(' ').slice(0,2).join(' ')||'Indépendante']].map(([l,v])=>(
              <div key={l} style={{ background:T.surface2, borderRadius:12, padding:'12px', textAlign:'center', border:`1px solid ${T.border}` }}>
                <div style={{ fontSize:10, fontWeight:700, color:T.text4, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>{l}</div>
                <div style={{ fontWeight:700, fontSize:14, color:T.text1 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:`2px solid ${T.border}`, marginBottom:20 }}>
            {[['about','À propos'],['services','Services'],['membres','Membres'],['assemblee','Assemblée']].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{ padding:'9px 16px', border:'none', background:'transparent', cursor:'pointer', fontWeight:tab===id?700:500, fontSize:13, fontFamily:'Inter,sans-serif', color:tab===id?T.brand:T.text3, borderBottom:`2px solid ${tab===id?T.brand:'transparent'}`, marginBottom:-2, transition:'all 0.15s' }}>{label}</button>
            ))}
          </div>

          {tab==='about' && <>
            <p style={{ fontSize:15, color:T.text2, lineHeight:1.75, marginBottom:20 }}>{c.description}</p>
            <div style={{ background:T.brandLight, borderRadius:14, padding:'16px 18px', border:`1px solid #FECACA` }}>
              <div style={{ fontWeight:700, fontSize:14, color:T.brand, marginBottom:6 }}>Principe des Communes Libres</div>
              <p style={{ fontSize:13, color:T.text2, margin:0, lineHeight:1.6 }}>1 personne suffit pour créer une commune libre. Dès 5 membres, la commune peut envoyer un binôme à l'Assemblée Confédérale. Les communes peuvent se fédérer librement entre elles pour travailler ensemble.</p>
            </div>
          </>}

          {tab==='services' && <>
            <p style={{ fontSize:14, color:T.text3, marginBottom:16 }}>Cette commune utilise les services suivants de la plateforme :</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
              {allServices.map(s=>(
                <div key={s.id} style={{ padding:'12px 14px', borderRadius:12, border:`1.5px solid ${c.services?.includes(s.id)?T.brand:T.border}`, background:c.services?.includes(s.id)?T.brandLight:T.surface2, display:'flex', alignItems:'center', gap:8 }}>
                  {c.services?.includes(s.id) && <div style={{ color:T.brand, display:'flex', flexShrink:0 }}>{ICONS.check}</div>}
                  <span style={{ fontSize:13, fontWeight:600, color:c.services?.includes(s.id)?T.brand:T.text3 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </>}

          {tab==='membres' && <>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {Array.from({length:Math.min(c.members,6)},(_,i)=>({ name:['Marie D.','Thomas R.','Aisha K.','Omar B.','Clara F.','Lucas M.'][i]||`Membre ${i+1}`, role:i===0?'Coordinateur·trice':'Membre', joined:`2025-0${i%9+1}` })).map((m,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px', background:T.surface2, borderRadius:12, border:`1px solid ${T.border}` }}>
                  <Avatar name={m.name} size={36} />
                  <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14, color:T.text1 }}>{m.name}</div><div style={{ fontSize:12, color:T.text4 }}>{m.role} · depuis {m.joined}</div></div>
                  {i<2 && <Tag variant="brand" size="xs">Binôme</Tag>}
                </div>
              ))}
              {c.members>6 && <div style={{ textAlign:'center', fontSize:13, color:T.text3, padding:'10px 0' }}>+ {c.members-6} autres membres</div>}
            </div>
          </>}

          {tab==='assemblee' && <>
            <div style={{ background:T.infoLight, borderRadius:14, padding:'16px 18px', border:'1px solid #BFDBFE', marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:14, color:T.info, marginBottom:6 }}>Droit à la représentation</div>
              {c.members>=5
                ? <p style={{ fontSize:14, color:T.info, margin:0 }}>✓ Cette commune dispose d'un binôme de représentation à l'Assemblée Confédérale des Communes et Territoires Libres.</p>
                : <p style={{ fontSize:14, color:T.info, margin:0 }}>Il manque {5-c.members} membre{5-c.members>1?'s':''} pour atteindre le seuil de représentation (minimum 5 membres).</p>}
            </div>
            {fed && <div style={{ background:T.surface2, borderRadius:14, padding:'14px 16px', border:`1px solid ${T.border}` }}>
              <div style={{ fontWeight:600, fontSize:14, color:T.text1, marginBottom:4 }}>Fédération d'appartenance</div>
              <div style={{ fontSize:13, color:T.text3 }}>{fed.name} · Cette fédération dispose également d'un binôme à l'Assemblée.</div>
            </div>}
          </>}

          <div style={{ marginTop:20 }}>
            {joined ? (
              <div style={{ background:T.successLight, borderRadius:14, padding:'14px 18px', textAlign:'center', border:`1px solid #BBF7D0` }}>
                <div style={{ fontWeight:700, color:T.success, fontSize:15 }}>✓ Vous avez rejoint cette commune libre !</div>
              </div>
            ) : (
              <Btn full variant="gradient" size="lg" onClick={() => setJoined(true)}>Rejoindre cette commune libre</Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ESPACE ADHÉRENTS ───────────────────────────────────────
function EspaceAdherents({ user, setPage }) {
  const [tab, setTab] = useState('communes');
  const [communeDetail, setCommuneDetail] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [newCommune, setNewCommune] = useState({ name:'', type:'quartier', location:'', description:'' });

  const [communes, setCommunes] = useState(SAMPLE_COMMUNES);
  const [federations] = useState(SAMPLE_FEDERATIONS);

  const filtered = communes.filter(c => {
    const mt = typeFilter==='Tous' || c.type===typeFilter;
    const ms = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase());
    return mt && ms;
  });

  // Assemblée members (tirage au sort simulation)
  const tireAuSort = useMemo(() => {
    const names = ['Sophie L.','Karim Z.','Marie D.','Thomas R.','Aisha K.','Omar B.','Clara F.','Lucas M.','Nina P.','Antoine G.'];
    return names.map((n,i) => ({ name:n, commune: communes[i%communes.length]?.name?.split(' ').slice(-2).join(' '), tirage:true }));
  }, []);

  if (communeDetail) return <CommuneDetail c={communeDetail} onBack={() => setCommuneDetail(null)} user={user} />;

  return (
    <div style={{ background:T.bg, minHeight:'100vh' }}>
      {/* Hero */}
      <div style={{ background:T.text1, padding:'clamp(32px,5vw,60px) 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0 }}>
          <img src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1600&q=60" alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.1 }} onError={e=>e.target.style.display='none'} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(26,26,24,0.96),rgba(193,18,31,0.8))' }}></div>
        </div>
        <div style={{ position:'relative', maxWidth:900, margin:'0 auto' }}>
          <Tag variant="gradient" style={{ marginBottom:16, display:'inline-flex' }}>Espace Adhérents · Membres actifs seulement</Tag>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center', flexWrap:'wrap' }}>
            <div>
              <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(24px,4vw,44px)', fontWeight:800, color:'#fff', margin:'0 0 10px', letterSpacing:'-0.04em', lineHeight:1.05 }}>
                Communes Libres &<br />Assemblée Confédérale
              </h1>
              <p style={{ fontSize:'clamp(13px,1.5vw,16px)', color:'rgba(255,255,255,0.65)', lineHeight:1.6, margin:0 }}>
                Rejoignez ou créez une commune libre dans votre quartier, village, ZAD ou tiers lieu. Fédérez-vous, confédérez-vous, représentez-vous.
              </p>
            </div>
            <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:16, padding:'16px 20px', border:'1px solid rgba(255,255,255,0.12)', textAlign:'center', flexShrink:0 }} className="mn-desk">
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:800, color:'#fff' }}>{communes.length}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:4 }}>Communes actives</div>
            </div>
          </div>
          {user && (
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:24, background:'rgba(255,255,255,0.08)', borderRadius:14, padding:'12px 16px', border:'1px solid rgba(255,255,255,0.15)', width:'fit-content' }}>
              <Avatar name={user.name} size={32} />
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:'#fff' }}>{user.name}</div>
                <Tag variant="success" size="xs" style={{ marginTop:3 }}>✓ Adhérent·e</Tag>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
          {[['Communes libres',communes.length],['Fédérations',federations.length],['Confédérations',1],['Adhérents',946]].map(([l,v])=>(
            <div key={l} style={{ padding:'16px 0', textAlign:'center', borderRight:`1px solid ${T.border}` }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, color:T.brand }}>{v}</div>
              <div style={{ fontSize:12, color:T.text4, marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 24px 100px' }}>
        {/* Tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:`2px solid ${T.border}`, marginBottom:28, overflowX:'auto' }}>
          {[['communes','Communes Libres'],['federations','Fédérations'],['confederation','Confédération'],['assemblee','Assemblée Confédérale'],['espace','Mon Espace']].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ padding:'12px 18px', border:'none', background:'transparent', cursor:'pointer', fontWeight:tab===id?700:500, fontSize:13, fontFamily:'Inter,sans-serif', color:tab===id?T.brand:T.text3, borderBottom:`2px solid ${tab===id?T.brand:'transparent'}`, marginBottom:-2, transition:'all 0.15s', whiteSpace:'nowrap' }}>{label}</button>
          ))}
        </div>

        {/* COMMUNES */}
        {tab==='communes' && <>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
            <div style={{ flex:1, minWidth:240 }}><SearchInput value={search} onChange={setSearch} placeholder="Rechercher une commune libre..." /></div>
            <Btn variant="gradient" size="md" icon={ICONS.plus} onClick={()=>setShowCreate(true)}>Créer une commune libre</Btn>
          </div>
          <FilterTabs options={['Tous','quartier','commune','village','zad','tiers_lieu']} active={typeFilter} onChange={setTypeFilter} />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
            {filtered.map(c=><CommuneCard key={c.id} c={c} onClick={()=>setCommuneDetail(c)} />)}
          </div>
          {filtered.length===0 && <EmptyState title="Aucune commune trouvée" desc="Créez la première commune libre de votre territoire !" action={<Btn variant="gradient" icon={ICONS.plus} onClick={()=>setShowCreate(true)}>Créer une commune libre</Btn>} />}
        </>}

        {/* FÉDÉRATIONS */}
        {tab==='federations' && <>
          <SectionTitle label="Réseau" title="Fédérations de communes" action={<Btn variant="gradient" size="sm" icon={ICONS.plus} onClick={()=>alert('Créer une fédération (accord de 2+ communes requis)')}>Créer une fédération</Btn>} />
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {federations.map(f=>(
              <div key={f.id} style={{ background:T.surface, borderRadius:18, border:`1px solid ${T.border}`, padding:'22px 24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, flexWrap:'wrap', gap:10 }}>
                  <div>
                    <Tag variant="info" size="xs" style={{ marginBottom:8 }}>Fédération</Tag>
                    <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:700, color:T.text1, margin:'0 0 4px' }}>{f.name}</h3>
                    <p style={{ fontSize:13, color:T.text3, margin:0 }}>{f.description}</p>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <Tag size="xs">{f.communes.length} communes</Tag>
                    <Tag variant="success" size="xs">1 binôme à l'Assemblée</Tag>
                  </div>
                </div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {f.communes.map(cid=>{
                    const c = communes.find(x=>x.id===cid);
                    return c ? <Tag key={cid} size="xs">{c.name.replace('Commune Libre de ','').replace('Commune Libre du ','')}</Tag> : null;
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:32, background:T.surface2, borderRadius:16, padding:'20px 24px', border:`1px solid ${T.border}` }}>
            <div style={{ fontWeight:700, fontSize:15, color:T.text1, marginBottom:8 }}>Comment créer une fédération ?</div>
            <p style={{ fontSize:14, color:T.text3, margin:0, lineHeight:1.65 }}>Il suffit de l'accord de deux communes libres ou plus. Une fois la fédération créée, elle dispose de son propre espace sur la plateforme et d'un binôme de représentation à l'Assemblée Confédérale. Les fédérations peuvent elles-mêmes se regrouper en confédérations territoriales.</p>
          </div>
        </>}

        {/* CONFÉDÉRATION */}
        {tab==='confederation' && <>
          <div style={{ background:T.surface, borderRadius:24, border:`1px solid ${T.border}`, overflow:'hidden', marginBottom:28 }}>
            <div style={{ background:T.gradR, padding:'28px 32px', color:'#fff' }}>
              <Tag size="xs" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', border:'none', marginBottom:14 }}>Confédération territoriale</Tag>
              <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(18px,3vw,28px)', fontWeight:800, margin:'0 0 10px' }}>{SAMPLE_CONFEDERATION.name}</h1>
              <p style={{ fontSize:14, opacity:0.85, margin:0 }}>{SAMPLE_CONFEDERATION.description}</p>
            </div>
            <div style={{ padding:'24px 32px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
                {[['Fédérations',SAMPLE_CONFEDERATION.federations.length],['Communes directes',SAMPLE_CONFEDERATION.communes_directes.length],['Total communes',communes.length],['Fondée',SAMPLE_CONFEDERATION.created]].map(([l,v])=>(
                  <div key={l} style={{ background:T.surface2, borderRadius:12, padding:'14px', textAlign:'center', border:`1px solid ${T.border}` }}>
                    <div style={{ fontSize:10, fontWeight:700, color:T.text4, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>{l}</div>
                    <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:T.text1 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:20 }}>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, color:T.text1, margin:'0 0 12px' }}>Fédérations membres</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {federations.map(f=>(
                    <div key={f.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:T.surface2, borderRadius:12, border:`1px solid ${T.border}` }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14, color:T.text1 }}>{f.name}</div>
                        <div style={{ fontSize:12, color:T.text4 }}>{f.communes.length} communes</div>
                      </div>
                      <Tag variant="success" size="xs">1 binôme</Tag>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background:T.brandLight, borderRadius:14, padding:'16px 18px', border:`1px solid #FECACA` }}>
                <div style={{ fontWeight:700, fontSize:14, color:T.brand, marginBottom:6 }}>Droit à la représentation</div>
                <p style={{ fontSize:13, color:T.text2, margin:0, lineHeight:1.6 }}>Chaque commune, chaque fédération et la confédération elle-même disposent d'un binôme (1 homme + 1 femme ou 2 personnes non-binaires) à l'Assemblée Confédérale des Communes et Territoires Libres.</p>
              </div>
            </div>
          </div>
        </>}

        {/* ASSEMBLÉE */}
        {tab==='assemblee' && <>
          <SectionTitle label="Démocratie directe" title="Assemblée Confédérale des Communes et Territoires Libres" />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:28 }} className="mn-detail-grid">
            {/* Chambre des représentants */}
            <div style={{ background:T.surface, borderRadius:20, border:`1px solid ${T.border}`, overflow:'hidden' }}>
              <div style={{ background:T.brand, padding:'18px 22px', color:'#fff' }}>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, margin:0 }}>1ère Chambre · Représentants élus</h3>
                <div style={{ fontSize:12, opacity:0.8, marginTop:4 }}>1 binôme par commune, fédération ou confédération</div>
              </div>
              <div style={{ padding:'16px' }}>
                {[...communes.filter(c=>c.members>=5).map(c=>({ name:c.name.replace('Commune Libre de ','').replace('Commune Libre du ',''), from:c.location, type:'Commune', binome:['Marie D.','Thomas R.'] })),
                  ...federations.map(f=>({ name:f.name.split(' ').slice(0,3).join(' '), from:'Multi-territoires', type:'Fédération', binome:['Aisha K.','Omar B.'] }))
                ].slice(0,6).map((r,i)=>(
                  <div key={i} style={{ display:'flex', gap:10, padding:'10px 0', borderBottom:i<5?`1px solid ${T.border}`:'none', alignItems:'center' }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13, color:T.text1 }}>{r.name}</div>
                      <div style={{ fontSize:11, color:T.text4 }}>{r.type} · {r.from}</div>
                    </div>
                    <div style={{ marginLeft:'auto', display:'flex', gap:5 }}>
                      {r.binome.map(n=><Avatar key={n} name={n} size={24} />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chambre tirée au sort */}
            <div style={{ background:T.surface, borderRadius:20, border:`1px solid ${T.border}`, overflow:'hidden' }}>
              <div style={{ background:'#7C3AED', padding:'18px 22px', color:'#fff' }}>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, margin:0 }}>2ème Chambre · Tirage au sort</h3>
                <div style={{ fontSize:12, opacity:0.8, marginTop:4 }}>Parmi l'ensemble des adhérent·es</div>
              </div>
              <div style={{ padding:'16px' }}>
                <div style={{ background:'#F3E8FF', borderRadius:12, padding:'12px 14px', marginBottom:14, border:'1px solid #DDD6FE' }}>
                  <div style={{ fontSize:12, color:'#7C3AED', fontWeight:600 }}>Prochain tirage : 1er juin 2026</div>
                  <div style={{ fontSize:11, color:'#6D28D9', marginTop:2 }}>10 personnes tirées au sort parmi 946 adhérent·es</div>
                </div>
                {tireAuSort.slice(0,6).map((m,i)=>(
                  <div key={i} style={{ display:'flex', gap:10, padding:'9px 0', borderBottom:i<5?`1px solid ${T.border}`:'none', alignItems:'center' }}>
                    <Avatar name={m.name} size={28} />
                    <div>
                      <div style={{ fontWeight:600, fontSize:13, color:T.text1 }}>{m.name}</div>
                      <div style={{ fontSize:11, color:T.text4 }}>Tiré·e au sort · {m.commune}</div>
                    </div>
                    <Tag size="xs" style={{ marginLeft:'auto', background:'#F3E8FF', color:'#7C3AED', border:'none' }}>Tirage</Tag>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background:T.surface2, borderRadius:16, padding:'20px 24px', border:`1px solid ${T.border}` }}>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:T.text1, margin:'0 0 12px' }}>Fonctionnement de l'Assemblée</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:14 }}>
              {[
                ['1ère Chambre','Représentants des communes, fédérations et confédérations. 1 binôme (paritaire) par entité ayant au moins 5 membres.'],
                ['2ème Chambre','Citoyens tirés au sort parmi l\'ensemble des adhérent·es actif·ves de la plateforme.'],
                ['Décisions','Les deux chambres délibèrent ensemble. Les décisions importantes requièrent une majorité dans les deux chambres.'],
                ['Sessions','Assemblée mensuelle en ligne + session physique annuelle sur un territoire désigné par rotation.'],
              ].map(([l,d])=>(
                <div key={l} style={{ background:T.surface, borderRadius:12, padding:'14px 16px', border:`1px solid ${T.border}` }}>
                  <div style={{ fontWeight:700, fontSize:13, color:T.text1, marginBottom:6 }}>{l}</div>
                  <div style={{ fontSize:12, color:T.text3, lineHeight:1.55 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* MON ESPACE */}
        {tab==='espace' && <>
          <SectionTitle label="Personnel" title="Mon espace adhérent" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }} className="mn-detail-grid">
            <div style={{ background:T.surface, borderRadius:18, border:`1px solid ${T.border}`, padding:'22px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.text4, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Ma carte d'adhérent·e</div>
              <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:16 }}>
                <Avatar name={user?.name||'U'} size={52} />
                <div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:T.text1 }}>{user?.name}</div>
                  <Tag variant="success" style={{ marginTop:4 }}>✓ Adhérent·e actif·ve</Tag>
                </div>
              </div>
              {[['Email',user?.email],['Code postal','75010'],['Membre depuis',user?.joined||'2025'],['Cotisation','12 T99CP / an']].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${T.border}`, fontSize:13 }}>
                  <span style={{ color:T.text4 }}>{l}</span><span style={{ fontWeight:600, color:T.text1 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { label:'Ma commune libre', desc:'Commune Libre de Belleville', action:'Accéder', color:T.brand },
                { label:'Ma fédération', desc:'Fédération Île-de-France / Rhône-Alpes', action:'Accéder', color:T.info },
                { label:'L\'Assemblée', desc:'Prochaine session : 1er juin 2026', action:'Participer', color:'#7C3AED' },
                { label:'Renouveler mon adhésion', desc:'Expire le 1er janvier 2027', action:'Gérer', color:T.warning },
              ].map(item=>(
                <div key={item.label} style={{ background:T.surface, borderRadius:14, border:`1px solid ${T.border}`, padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=item.color} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:T.text1 }}>{item.label}</div>
                    <div style={{ fontSize:12, color:T.text4 }}>{item.desc}</div>
                  </div>
                  <Btn variant="surface" size="sm">{item.action}</Btn>
                </div>
              ))}
            </div>
          </div>
        </>}
      </div>

      {/* Create commune modal */}
      <Modal open={showCreate} onClose={()=>setShowCreate(false)} title="Créer une Commune Libre" width={520}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ background:T.brandLight, borderRadius:12, padding:'12px 14px', border:`1px solid #FECACA`, fontSize:13, color:T.brand }}>
            <strong>Bon à savoir :</strong> 1 personne suffit pour créer une commune libre. La représentation à l'Assemblée Confédérale nécessite 5 membres minimum.
          </div>
          {[{key:'name',label:'Nom de la commune libre',placeholder:'Ex: Commune Libre de Belleville'},{key:'location',label:'Lieu (ville, quartier, commune)',placeholder:'Ex: Paris 20e'},{key:'description',label:'Description',placeholder:'Décrivez votre commune libre...'}].map(f=>(
            <div key={f.key}>
              <label style={{ fontSize:12, fontWeight:700, color:T.text3, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>{f.label}</label>
              {f.key==='description'
                ? <textarea value={newCommune[f.key]} onChange={e=>setNewCommune(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} rows={3} style={{ width:'100%', border:`1.5px solid ${T.border}`, borderRadius:12, padding:'12px 14px', fontSize:14, fontFamily:'Inter,sans-serif', color:T.text1, background:T.bg, outline:'none', boxSizing:'border-box', resize:'vertical', lineHeight:1.5 }} />
                : <input value={newCommune[f.key]} onChange={e=>setNewCommune(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{ width:'100%', height:46, border:`1.5px solid ${T.border}`, borderRadius:12, padding:'0 14px', fontSize:14, fontFamily:'Inter,sans-serif', color:T.text1, background:T.bg, outline:'none', boxSizing:'border-box' }} />
              }
            </div>
          ))}
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:T.text3, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>Type de territoire</label>
            <select value={newCommune.type} onChange={e=>setNewCommune(p=>({...p,type:e.target.value}))} style={{ width:'100%', height:46, border:`1.5px solid ${T.border}`, borderRadius:12, padding:'0 14px', fontSize:14, fontFamily:'Inter,sans-serif', color:T.text1, background:T.surface, outline:'none', boxSizing:'border-box' }}>
              {Object.entries(TYPE_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <Btn full variant="gradient" size="lg" icon={ICONS.check} onClick={()=>{
            if(!newCommune.name||!newCommune.location) return;
            setCommunes(cs=>[...cs,{id:Date.now(),name:`Commune Libre de ${newCommune.name}`,type:newCommune.type,location:newCommune.location,members:1,founded:new Date().toISOString().split('T')[0].slice(0,7),description:newCommune.description,active:true,federation_id:null,services:[]}]);
            setShowCreate(false);
            setNewCommune({name:'',type:'quartier',location:'',description:''});
          }}>Créer la commune libre</Btn>
        </div>
      </Modal>
    </div>
  );
}
window.EspaceAdherents = EspaceAdherents;
window.JoinEspaceAdherents = EspaceAdherents; // alias
window.CommunesLibresPage = EspaceAdherents; // alias used by router
