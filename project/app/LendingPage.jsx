// LendingPage.jsx — Ki Prête Tout
const { useState } = React;

function LendingCard({ item, onClick, adminMode, onEdit }) {
  const [hov, setHov] = useState(false);
  const catIcons = {'Cuisine':'🍳','Livres':'📚','Bricolage':'🔧','Jardin':'🌿','Jeux':'🎲','Audio':'🔊','Musique':'🎹','Plein air':'⛺'};
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
      style={{ background:'#fff', borderRadius:16, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', cursor:'pointer', transition:'all 0.2s', boxShadow:hov?'0 8px 24px rgba(0,0,0,0.09)':'0 1px 4px rgba(0,0,0,0.04)', transform:hov?'translateY(-2px)':'none', position:'relative' }}>
      {adminMode && <div style={{ position:'absolute', top:8, right:8, zIndex:2 }} onClick={e=>{e.stopPropagation();onEdit();}}><AdminEdit /></div>}
      <div style={{ height:100, background:`linear-gradient(135deg,${item.available?'#1F2937':'#374151'},#4B5563)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, position:'relative' }}>
        {catIcons[item.category]||'📦'}
        {!item.available && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}><Badge color="red">Indisponible</Badge></div>}
      </div>
      <div style={{ padding:'12px 14px 14px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:COLORS.gray900, margin:0, flex:1, marginRight:6, lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.name}</h3>
        </div>
        <p style={{ fontSize:11, color:COLORS.gray500, margin:'0 0 8px' }}>👤 {item.owner} · 📍 {item.location}</p>
        <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
          <Badge color="gray">{catIcons[item.category]} {item.category}</Badge>
          <Badge color={item.condition==='Excellent'?'green':item.condition==='Très bon'?'blue':'gray'}>{item.condition}</Badge>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            {item.price_t99cp>0 ? <><T99 value={item.price_t99cp} size={12} /><span style={{ fontSize:10, color:COLORS.gray400 }}>/jour</span></>
              : <span style={{ fontSize:12, fontWeight:700, color:COLORS.green }}>🆓 Gratuit</span>}
          </div>
          <div style={{ fontSize:11, color:COLORS.gray400 }}>Caution : <T99 value={item.deposit_t99cp} size={11} /></div>
        </div>
      </div>
    </div>
  );
}

function LendingDetail({ item, onClose, user, onOpenAuth, adminMode, onSave }) {
  const [t99Open, setT99Open] = useState(false);
  const [days, setDays] = useState(2);
  const [showEdit, setShowEdit] = useState(false);
  const [data, setData] = useState(item);
  const total = data.price_t99cp * days;

  return (
    <div style={{ maxWidth:700, margin:'0 auto', padding:'24px 16px 100px' }}>
      <button onClick={onClose} style={{ display:'flex', alignItems:'center', gap:6, border:'none', background:'transparent', cursor:'pointer', color:COLORS.gray500, fontSize:13, fontWeight:600, marginBottom:16, padding:0 }}>← Retour aux objets</button>
      <div style={{ background:'#fff', borderRadius:20, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.07)' }}>
        <div style={{ height:200, background:'linear-gradient(135deg,#1F2937,#374151)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:72 }}>
          {{'Cuisine':'🍳','Livres':'📚','Bricolage':'🔧','Jardin':'🌿','Jeux':'🎲','Audio':'🔊','Musique':'🎹','Plein air':'⛺'}[data.category]||'📦'}
        </div>
        <div style={{ padding:24 }}>
          <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
            <Badge color="gray">{data.category}</Badge>
            <Badge color={data.condition==='Excellent'?'green':'blue'}>{data.condition}</Badge>
            <Badge color={data.available?'green':'red'}>{data.available?'✅ Disponible':'⛔ Indisponible'}</Badge>
            {adminMode && <AdminEdit onEdit={()=>setShowEdit(true)} />}
          </div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(16px,3vw,22px)', fontWeight:800, color:COLORS.gray900, margin:'0 0 8px', lineHeight:1.3 }}>{data.name}</h1>
          <p style={{ fontSize:13, color:COLORS.gray500, margin:'0 0 16px' }}>👤 Prêté par <strong>{data.owner}</strong> · 📍 {data.location}</p>
          <p style={{ fontSize:15, color:COLORS.gray700, lineHeight:1.7, marginBottom:20 }}>{data.description}</p>

          {data.available && (
            <div style={{ background:COLORS.gray50, borderRadius:16, padding:'18px 20px', border:`1px solid ${COLORS.gray200}`, marginBottom:20 }}>
              <h4 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, margin:'0 0 14px' }}>Emprunter cet objet</h4>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <span style={{ fontSize:13, fontWeight:600, color:COLORS.gray700 }}>Nombre de jours :</span>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <button onClick={()=>setDays(n=>Math.max(1,n-1))} style={{ width:32, height:32, borderRadius:'50%', border:`1.5px solid ${COLORS.gray200}`, background:'#fff', cursor:'pointer', fontSize:16 }}>−</button>
                  <span style={{ fontWeight:700, fontSize:16, width:24, textAlign:'center' }}>{days}</span>
                  <button onClick={()=>setDays(n=>n+1)} style={{ width:32, height:32, borderRadius:'50%', border:`1.5px solid ${COLORS.gray200}`, background:'#fff', cursor:'pointer', fontSize:16 }}>+</button>
                </div>
              </div>
              <div style={{ fontSize:13, color:COLORS.gray600, marginBottom:4 }}>
                {data.price_t99cp > 0 ? <><T99 value={data.price_t99cp} size={12} /> × {days} jours = <strong><T99 value={total} size={13} /></strong></> : <span style={{ color:COLORS.green, fontWeight:700 }}>🆓 Prêt gratuit</span>}
              </div>
              <div style={{ fontSize:11, color:COLORS.gray400, marginBottom:14 }}>+ Caution remboursable : <T99 value={data.deposit_t99cp} size={11} /></div>
              <Btn variant="gradient" full size="lg" onClick={()=>{ if(!user)onOpenAuth(); else setT99Open(true); }}>
                {data.price_t99cp>0 ? `₮ Emprunter — ${total + data.deposit_t99cp} T99CP (dont caution)` : '✋ Demander l\'emprunt'}
              </Btn>
            </div>
          )}
        </div>
      </div>
      {data.price_t99cp>0 && <T99Modal open={t99Open} onClose={()=>setT99Open(false)} amount={total+data.deposit_t99cp} item={data.name} description={`Emprunt ${days} jour${days>1?'s':''} + caution remboursable ${data.deposit_t99cp} T99CP`} />}
      <EditModal open={showEdit} onClose={()=>setShowEdit(false)} title="Modifier l'objet" data={data} onSave={f=>{setData(d=>({...d,...f}));onSave&&onSave({...data,...f});}}
        fields={[{key:'name',label:'Nom'},{key:'category',label:'Catégorie',type:'select',options:['Cuisine','Livres','Bricolage','Jardin','Jeux','Audio','Musique','Plein air']},{key:'description',label:'Description',type:'textarea'},{key:'price_t99cp',label:'Prix/jour T99CP',type:'number'},{key:'deposit_t99cp',label:'Caution T99CP',type:'number'},{key:'condition',label:'État',type:'select',options:['Excellent','Très bon','Bon','Passable']},{key:'location',label:'Lieu'}]} />
    </div>
  );
}

function LendingPage({ user, adminMode, onOpenAuth }) {
  const [data, setData] = useState(AppData.lending);
  const [detail, setDetail] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [cat, setCat] = useState('Toutes');
  const [search, setSearch] = useState('');
  const cats = ['Toutes',...[...new Set(data.map(i=>i.category))]];
  const filtered = data.filter(i=>{
    const mc = cat==='Toutes'||i.category===cat;
    const ms = !search||i.name.toLowerCase().includes(search.toLowerCase());
    return mc&&ms;
  });
  if(detail) return <LendingDetail item={detail} onClose={()=>setDetail(null)} user={user} onOpenAuth={onOpenAuth} adminMode={adminMode} onSave={u=>setData(d=>d.map(i=>i.id===u.id?u:i))} />;
  return (
    <PageWrap title="🔧 Ki Prête Tout" subtitle={`${filtered.length} objets disponibles au prêt`}
      action={<Btn variant="gradient" size="sm" onClick={()=>user?alert('Ajouter un objet'):onOpenAuth()}>+ Proposer un objet</Btn>}>
      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un objet..." />
      <FilterPills options={cats} active={cat} onChange={setCat} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
        {filtered.map(i=><LendingCard key={i.id} item={i} onClick={()=>setDetail(i)} adminMode={adminMode} onEdit={()=>setEditItem(i)} />)}
      </div>
      {filtered.length===0 && <EmptyState icon="🔍" title="Aucun objet trouvé" />}
      {editItem && <EditModal open={true} onClose={()=>setEditItem(null)} title="Modifier l'objet" data={editItem} onSave={f=>{setData(d=>d.map(i=>i.id===editItem.id?{...i,...f}:i));setEditItem(null);}} fields={[{key:'name',label:'Nom'},{key:'category',label:'Catégorie',type:'select',options:cats.slice(1)},{key:'description',label:'Description',type:'textarea'},{key:'price_t99cp',label:'Prix/jour T99CP',type:'number'},{key:'location',label:'Lieu'}]} />}
    </PageWrap>
  );
}
window.LendingPage = LendingPage;
