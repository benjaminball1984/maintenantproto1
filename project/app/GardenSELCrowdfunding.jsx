// GardenPage.jsx + SELPage.jsx + CrowdfundingPage.jsx
const { useState } = React;

// ── JARDIN / SURPLUS ──────────────────────────────────────
function GardenCard({ item, onClick, adminMode, onEdit }) {
  const [hov, setHov] = useState(false);
  const typeIcons = {'Légume':'🥦','Fruit':'🍎','Plant':'🌱','Herbe':'🌿','Œufs':'🥚','Autre':'🌻'};
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
      style={{ background:'#fff', borderRadius:14, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', cursor:'pointer', transition:'all 0.2s', boxShadow:hov?'0 6px 20px rgba(0,0,0,0.09)':'0 1px 3px rgba(0,0,0,0.04)', transform:hov?'translateY(-2px)':'none', position:'relative' }}>
      {adminMode && <div style={{ position:'absolute', top:6, right:6, zIndex:2 }} onClick={e=>{e.stopPropagation();onEdit();}}><AdminEdit /></div>}
      <div style={{ height:100, background:'linear-gradient(135deg,#14532d,#166534,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:44 }}>{typeIcons[item.type]||'🌻'}</div>
      <div style={{ padding:'10px 12px 12px' }}>
        <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:COLORS.gray900, margin:'0 0 4px', lineHeight:1.3 }}>{item.item}</h3>
        <p style={{ fontSize:11, color:COLORS.gray500, margin:'0 0 6px' }}>👤 {item.giver} · 📍 {item.location}</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Badge color="gray">{item.quantity}</Badge>
          {item.free ? <Badge color="green">🆓 Gratuit</Badge> : <T99 value={item.price_t99cp} size={12} />}
        </div>
      </div>
    </div>
  );
}

function GardenPage({ user, adminMode, onOpenAuth }) {
  const [data, setData] = useState(AppData.garden);
  const [detail, setDetail] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [filter, setFilter] = useState('Tous');
  const [search, setSearch] = useState('');
  const [t99Open, setT99Open] = useState(false);
  const types = ['Tous','Légume','Fruit','Plant','Herbe','Œufs','Autre'];
  const filtered = data.filter(i=>{
    const mt = filter==='Tous'||i.type===filter;
    const ms = !search||i.item.toLowerCase().includes(search.toLowerCase());
    return mt&&ms;
  });
  return (
    <PageWrap title="🥬 Nos Fruits de la Terre" subtitle="Surplus de jardin, troc et dons entre voisins"
      action={<Btn variant="gradient" size="sm" onClick={()=>user?alert('Proposer un surplus'):onOpenAuth()}>+ Proposer un surplus</Btn>}>
      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher des fruits, légumes..." />
      <FilterPills options={types} active={filter} onChange={setFilter} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
        {filtered.map(i=>(
          <GardenCard key={i.id} item={i} adminMode={adminMode} onEdit={()=>setEditItem(i)}
            onClick={()=>{ if(!i.free){ if(!user){onOpenAuth();}else{setDetail(i);setT99Open(true);} } else { alert(`Contact : ${i.giver} vous propose ${i.item} gratuitement à ${i.location} !`); } }} />
        ))}
      </div>
      {filtered.length===0 && <EmptyState icon="🌻" title="Aucun surplus trouvé" />}
      {detail && <T99Modal open={t99Open} onClose={()=>{setT99Open(false);setDetail(null);}} amount={detail?.price_t99cp||0} item={detail?.item||''} description={`Surplus de jardin de ${detail?.giver} · ${detail?.location}`} />}
      {editItem && <EditModal open={true} onClose={()=>setEditItem(null)} title="Modifier l'offre" data={editItem} onSave={f=>{setData(d=>d.map(i=>i.id===editItem.id?{...i,...f}:i));setEditItem(null);}} fields={[{key:'item',label:'Nom du surplus'},{key:'type',label:'Type',type:'select',options:types.slice(1)},{key:'quantity',label:'Quantité'},{key:'location',label:'Lieu'},{key:'description',label:'Description',type:'textarea'},{key:'price_t99cp',label:'Prix T99CP (0 = gratuit)',type:'number'}]} />}
    </PageWrap>
  );
}
window.GardenPage = GardenPage;

// ── SEL — SYSTÈME D'ÉCHANGE LOCAL ─────────────────────────
const SEL_COLORS = {'Bien-être':'purple','Formation':'blue','Artisanat':'amber','Jardin':'green','Culture':'red','Famille':'amber','Maison':'gray','Informatique':'blue','Social':'red'};

function SELCard({ service, onClick, adminMode, onEdit }) {
  const [hov, setHov] = useState(false);
  const catIcons = {'Bien-être':'🧘','Formation':'📚','Artisanat':'🔨','Jardin':'🌿','Culture':'🎨','Famille':'👨‍👩‍👧','Maison':'🏠','Informatique':'💻','Social':'🤝'};
  const color = SEL_COLORS[service.category]||'gray';
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
      style={{ background:'#fff', borderRadius:14, border:`1px solid ${COLORS.gray200}`, padding:'14px 16px', cursor:'pointer', transition:'all 0.2s', boxShadow:hov?'0 6px 20px rgba(0,0,0,0.09)':'0 1px 3px rgba(0,0,0,0.04)', transform:hov?'translateY(-2px)':'none', position:'relative' }}>
      {adminMode && <div style={{ position:'absolute', top:6, right:6 }} onClick={e=>{e.stopPropagation();onEdit();}}><AdminEdit /></div>}
      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`${COLORS[color]||COLORS.gray500}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{catIcons[service.category]||'⚙️'}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:COLORS.gray900, margin:'0 0 3px', lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{service.service}</h3>
          <p style={{ fontSize:11, color:COLORS.gray500, margin:'0 0 6px' }}>👤 {service.provider} · 📍 {service.location}</p>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
            <Badge color={color}>{catIcons[service.category]} {service.category}</Badge>
            <span style={{ fontSize:11, fontWeight:700, color:COLORS.blue }}>₮ {service.duration_min} min = {service.duration_min} T99CP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SELDetail({ service, onClose, user, onOpenAuth, adminMode, onSave }) {
  const [t99Open, setT99Open] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [data, setData] = useState(service);
  return (
    <div style={{ maxWidth:700, margin:'0 auto', padding:'24px 16px 100px' }}>
      <button onClick={onClose} style={{ display:'flex', alignItems:'center', gap:6, border:'none', background:'transparent', cursor:'pointer', color:COLORS.gray500, fontSize:13, fontWeight:600, marginBottom:16, padding:0 }}>← Retour au SEL</button>
      <div style={{ background:'#fff', borderRadius:20, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.07)' }}>
        <div style={{ background:GRAD, padding:'28px 28px', color:'#fff' }}>
          {adminMode && <div style={{ float:'right' }} onClick={()=>setShowEdit(true)}><AdminEdit /></div>}
          <Badge color="gray" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', marginBottom:12 }}>{data.category}</Badge>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(16px,3vw,22px)', fontWeight:800, margin:'0 0 8px', lineHeight:1.3 }}>{data.service}</h1>
          <div style={{ fontSize:14, opacity:0.85 }}>👤 {data.provider} · 📍 {data.location}</div>
        </div>
        <div style={{ padding:24 }}>
          <p style={{ fontSize:15, color:COLORS.gray700, lineHeight:1.7, marginBottom:20 }}>{data.description}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
            {[['⏱️','Durée',`${data.duration_min} min`],['₮','Équivalent',`${data.duration_min} T99CP`],['📅','Disponible',data.available]].map(([icon,label,val])=>(
              <div key={label} style={{ background:COLORS.gray50, borderRadius:12, padding:'12px', textAlign:'center', border:`1px solid ${COLORS.gray200}` }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
                <div style={{ fontSize:10, color:COLORS.gray400 }}>{label}</div>
                <div style={{ fontWeight:700, fontSize:13, color:COLORS.gray900 }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'#EFF6FF', borderRadius:12, padding:'12px 14px', border:'1px solid #BFDBFE', marginBottom:16, fontSize:13, color:'#1e40af' }}>
            💡 <strong>Principe SEL :</strong> 1 heure de service = 60 T99CP. La valeur du temps est égale pour tous.
          </div>
          <Btn variant="gradient" full size="lg" onClick={()=>{ if(!user)onOpenAuth(); else setT99Open(true); }}>₮ Échanger — {data.duration_min} T99CP</Btn>
        </div>
      </div>
      <T99Modal open={t99Open} onClose={()=>setT99Open(false)} amount={data.duration_min} item={data.service} description={`Service de ${data.provider} · Durée : ${data.duration_min} minutes`} />
      <EditModal open={showEdit} onClose={()=>setShowEdit(false)} title="Modifier le service" data={data} onSave={f=>{setData(d=>({...d,...f}));onSave&&onSave({...data,...f});}}
        fields={[{key:'service',label:'Nom du service'},{key:'category',label:'Catégorie',type:'select',options:Object.keys(SEL_COLORS)},{key:'description',label:'Description',type:'textarea'},{key:'duration_min',label:'Durée (min)',type:'number'},{key:'location',label:'Lieu'},{key:'available',label:'Disponibilité'}]} />
    </div>
  );
}

function SELPage({ user, adminMode, onOpenAuth }) {
  const [data, setData] = useState(AppData.sel);
  const [detail, setDetail] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [cat, setCat] = useState('Toutes');
  const [search, setSearch] = useState('');
  const cats = ['Toutes',...Object.keys(SEL_COLORS)];
  const filtered = data.filter(s=>{
    const mc = cat==='Toutes'||s.category===cat;
    const ms = !search||s.service.toLowerCase().includes(search.toLowerCase())||s.provider.toLowerCase().includes(search.toLowerCase());
    return mc&&ms;
  });
  if(detail) return <SELDetail service={detail} onClose={()=>setDetail(null)} user={user} onOpenAuth={onOpenAuth} adminMode={adminMode} onSave={u=>setData(d=>d.map(s=>s.id===u.id?u:s))} />;
  return (
    <PageWrap title="🤲 Système d'Échange Local" subtitle={`${filtered.length} services disponibles · 1h = 60 T99CP`}
      action={<Btn variant="gradient" size="sm" onClick={()=>user?alert('Proposer un service'):onOpenAuth()}>+ Proposer un service</Btn>}>
      <div style={{ background:'linear-gradient(135deg,#1e40af,#3b82f6)', borderRadius:14, padding:'14px 18px', marginBottom:20, color:'#fff' }}>
        <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>💡 Comment fonctionne le SEL ?</div>
        <div style={{ fontSize:13, opacity:0.9, lineHeight:1.5 }}>Échangez vos compétences sans argent. <strong>1 minute de service = 1 T99CP</strong>. Cuisinez, réparez, enseignez, aidez — votre temps a de la valeur !</div>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Yoga, plomberie, anglais, jardinage..." />
      <FilterPills options={cats} active={cat} onChange={setCat} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
        {filtered.map(s=><SELCard key={s.id} service={s} onClick={()=>setDetail(s)} adminMode={adminMode} onEdit={()=>setEditItem(s)} />)}
      </div>
      {filtered.length===0 && <EmptyState icon="🤲" title="Aucun service trouvé" />}
      {editItem && <EditModal open={true} onClose={()=>setEditItem(null)} title="Modifier le service" data={editItem} onSave={f=>{setData(d=>d.map(s=>s.id===editItem.id?{...s,...f}:s));setEditItem(null);}} fields={[{key:'service',label:'Nom du service'},{key:'category',label:'Catégorie',type:'select',options:Object.keys(SEL_COLORS)},{key:'description',label:'Description',type:'textarea'},{key:'duration_min',label:'Durée min',type:'number'},{key:'location',label:'Lieu'}]} />}
    </PageWrap>
  );
}
window.SELPage = SELPage;

// ── CROWDFUNDING ───────────────────────────────────────────
function CrowdfundingPage({ user, adminMode, onOpenAuth }) {
  const [data, setData] = useState(AppData.crowdfunding);
  const [detail, setDetail] = useState(null);
  const [t99Open, setT99Open] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [amount, setAmount] = useState(10);

  return (
    <PageWrap title="💰 Cagnottes Solidaires" subtitle="Financement participatif militant"
      action={<Btn variant="gradient" size="sm" onClick={()=>user?alert('Créer une cagnotte'):onOpenAuth()}>+ Créer une cagnotte</Btn>}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
        {data.map(c=>(
          <Card key={c.id} style={{ overflow:'hidden', position:'relative' }}>
            {adminMode && <div style={{ position:'absolute', top:8, right:8, zIndex:2 }} onClick={()=>setEditItem(c)}><AdminEdit /></div>}
            <ImgPlaceholder style={{ height:140, borderRadius:'12px 12px 0 0' }} icon={c.category==='Luttes'?'⚡':'💚'} />
            <div style={{ padding:'14px 16px' }}>
              <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                <Badge color={c.category==='Luttes'?'red':'green'}>{c.category}</Badge>
                <Badge color="gray">📅 {c.days_left}j restants</Badge>
              </div>
              <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:COLORS.gray900, margin:'0 0 6px', lineHeight:1.35 }}>{c.title}</h3>
              <p style={{ fontSize:12, color:COLORS.gray600, margin:'0 0 10px', lineHeight:1.5 }}>{c.description}</p>
              <Progress value={c.raised_t99cp} max={c.goal_t99cp} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:COLORS.gray500, margin:'8px 0 12px' }}>
                <span><strong style={{ color:COLORS.blue }}>{c.raised_t99cp} T99CP</strong> collectés</span>
                <span>👥 {c.contributors} contributeurs</span>
              </div>
              <Btn variant="gradient" full size="sm" onClick={()=>{ if(!user)onOpenAuth(); else{setDetail(c);setT99Open(true);} }}>₮ Contribuer</Btn>
            </div>
          </Card>
        ))}
      </div>
      {detail && <T99Modal open={t99Open} onClose={()=>{setT99Open(false);setDetail(null);}} amount={amount} item={detail?.title||''} description={`Contribution à la cagnotte · ${detail?.organizer}`} />}
      {editItem && <EditModal open={true} onClose={()=>setEditItem(null)} title="Modifier la cagnotte" data={editItem} onSave={f=>{setData(d=>d.map(c=>c.id===editItem.id?{...c,...f}:c));setEditItem(null);}} fields={[{key:'title',label:'Titre'},{key:'category',label:'Catégorie',type:'select',options:['Solidaires','Luttes']},{key:'description',label:'Description',type:'textarea'},{key:'goal_t99cp',label:'Objectif T99CP',type:'number'},{key:'days_left',label:'Jours restants',type:'number'}]} />}
    </PageWrap>
  );
}
window.CrowdfundingPage = CrowdfundingPage;
