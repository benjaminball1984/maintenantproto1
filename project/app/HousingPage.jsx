// HousingPage.jsx — Hébergement solidaire style Airbnb
const { useState } = React;

function HousingCard({ h, onClick, adminMode, onEdit }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
      style={{ background:'#fff', borderRadius:16, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', cursor:'pointer', transition:'all 0.2s', boxShadow:hov?'0 8px 30px rgba(0,0,0,0.1)':'0 1px 4px rgba(0,0,0,0.05)', transform:hov?'translateY(-2px)':'none', position:'relative' }}>
      <ImgPlaceholder style={{ height:160, borderRadius:'12px 12px 0 0' }} icon={h.type==='Maison'?'🏠':h.type==='Chambre'?'🛏️':h.type==='Studio'?'🏢':'🏡'} text={h.type} />
      {adminMode && <div style={{ position:'absolute', top:8, right:8, zIndex:2 }} onClick={e=>{e.stopPropagation();onEdit();}}><AdminEdit /></div>}
      {h.solidarity && <div style={{ position:'absolute', top:8, left:8, background:COLORS.green, color:'#fff', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:9999 }}>🤝 Solidaire</div>}
      <div style={{ padding:'12px 14px 14px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:COLORS.gray900, margin:0, lineHeight:1.3, flex:1, marginRight:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{h.title}</h3>
        </div>
        <p style={{ fontSize:12, color:COLORS.gray500, margin:'0 0 8px' }}>📍 {h.location}</p>
        <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
          <Badge color="gray">{h.type}</Badge>
          <Badge color="blue">{h.area} m²</Badge>
          <Badge color="gray">{h.rooms} pièce{h.rooms>1?'s':''}</Badge>
        </div>
        <Stars rating={h.rating} />
        <span style={{ fontSize:11, color:COLORS.gray400, marginLeft:6 }}>{h.reviews} avis</span>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
          <div><T99 value={h.price_t99cp} size={14} /><span style={{ fontSize:11, color:COLORS.gray400 }}>/nuit</span></div>
          <span style={{ fontSize:11, color:COLORS.green, fontWeight:600 }}>📅 {h.available}</span>
        </div>
      </div>
    </div>
  );
}

function HousingDetail({ h, onClose, adminMode, onSave, user, onOpenAuth }) {
  const [t99Open, setT99Open] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [data, setData] = useState(h);
  const [nights, setNights] = useState(3);

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'24px 16px 100px' }}>
      <button onClick={onClose} style={{ display:'flex', alignItems:'center', gap:6, border:'none', background:'transparent', cursor:'pointer', color:COLORS.gray500, fontSize:13, fontWeight:600, marginBottom:16, padding:0 }}>← Retour aux logements</button>
      <div style={{ background:'#fff', borderRadius:20, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.07)' }}>
        <ImgPlaceholder style={{ height:260 }} icon={data.type==='Maison'?'🏠':'🏢'} text="Photos de l'hébergement" />
        <div style={{ padding:28 }}>
          <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
            <Badge color="gray">{data.type}</Badge><Badge color="blue">{data.area} m²</Badge><Badge color="gray">{data.rooms} pièce{data.rooms>1?'s':''}</Badge>
            {data.solidarity && <Badge color="green">🤝 Hébergement solidaire</Badge>}
            {adminMode && <AdminEdit onEdit={()=>setShowEdit(true)} />}
          </div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(18px,3vw,24px)', fontWeight:800, color:COLORS.gray900, margin:'0 0 8px', lineHeight:1.3 }}>{data.title}</h1>
          <p style={{ fontSize:14, color:COLORS.gray500, margin:'0 0 6px' }}>📍 {data.location} · 🏠 Hôte : <strong>{data.host}</strong></p>
          <div style={{ marginBottom:16 }}><Stars rating={data.rating} /><span style={{ fontSize:12, color:COLORS.gray500, marginLeft:6 }}>{data.reviews} avis</span></div>
          <p style={{ fontSize:15, color:COLORS.gray700, lineHeight:1.7, marginBottom:20 }}>{data.description}</p>

          <div style={{ marginBottom:20 }}>
            <h4 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, color:COLORS.gray900, marginBottom:10 }}>Équipements</h4>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {data.amenities.map(a=><Badge key={a} color="gray">✓ {a}</Badge>)}
            </div>
          </div>

          <div style={{ background:COLORS.gray50, borderRadius:16, padding:'20px', border:`1px solid ${COLORS.gray200}`, marginBottom:20 }}>
            <h4 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:COLORS.gray900, margin:'0 0 14px' }}>Réserver</h4>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:COLORS.gray700 }}>Nombre de nuits :</label>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <button onClick={()=>setNights(n=>Math.max(1,n-1))} style={{ width:32, height:32, borderRadius:'50%', border:`1.5px solid ${COLORS.gray200}`, background:'#fff', cursor:'pointer', fontSize:16 }}>−</button>
                <span style={{ fontWeight:700, fontSize:16, width:24, textAlign:'center' }}>{nights}</span>
                <button onClick={()=>setNights(n=>n+1)} style={{ width:32, height:32, borderRadius:'50%', border:`1.5px solid ${COLORS.gray200}`, background:'#fff', cursor:'pointer', fontSize:16 }}>+</button>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:14, color:COLORS.gray600 }}><T99 value={data.price_t99cp} size={13} /> × {nights} nuits</span>
              <span style={{ fontWeight:700, fontSize:15, color:COLORS.gray900 }}><T99 value={data.price_t99cp*nights} size={14} /></span>
            </div>
            <div style={{ fontSize:11, color:COLORS.gray400, marginBottom:14 }}>+ frais de port Polygon (Gas fees) estimés</div>
            <Btn variant="gradient" full size="lg" onClick={()=>{ if(!user){onOpenAuth();}else{setT99Open(true);} }}>
              ₮ Réserver — {data.price_t99cp*nights} T99CP
            </Btn>
          </div>
        </div>
      </div>
      <T99Modal open={t99Open} onClose={()=>setT99Open(false)} amount={data.price_t99cp*nights} item={data.title} description={`Réservation ${nights} nuit${nights>1?'s':''} — Hébergement solidaire`} />
      <EditModal open={showEdit} onClose={()=>setShowEdit(false)} title="Modifier l'offre" data={data} onSave={f=>{setData(d=>({...d,...f}));onSave&&onSave({...data,...f});}}
        fields={[{key:'title',label:'Titre'},{key:'type',label:'Type',type:'select',options:['Studio','Chambre','T2','T3','T4','Maison','Loft','Gîte']},{key:'location',label:'Lieu'},{key:'price_t99cp',label:'Prix/nuit (T99CP)',type:'number'},{key:'area',label:'Surface (m²)',type:'number'},{key:'description',label:'Description',type:'textarea'},{key:'available',label:'Disponibilité'},{key:'host',label:'Hôte'}]} />
    </div>
  );
}

function HousingPage({ user, adminMode, onOpenAuth }) {
  const [data, setData] = useState(AppData.housing);
  const [detail, setDetail] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [filter, setFilter] = useState('Tous');
  const [search, setSearch] = useState('');
  const types = ['Tous','Studio','Chambre','T2','T3','T4','Maison','Loft','Gîte'];
  const filtered = data.filter(h=>{
    const mt = filter==='Tous'||h.type===filter;
    const ms = !search||h.title.toLowerCase().includes(search.toLowerCase())||h.location.toLowerCase().includes(search.toLowerCase());
    return mt&&ms;
  });
  if(detail) return <HousingDetail h={detail} onClose={()=>setDetail(null)} adminMode={adminMode} onSave={u=>setData(d=>d.map(h=>h.id===u.id?u:h))} user={user} onOpenAuth={onOpenAuth} />;
  return (
    <PageWrap title="🏠 Hébergements Solidaires" subtitle={`${filtered.length} logements disponibles`}
      action={adminMode && <Btn variant="success" size="sm">+ Ajouter une offre</Btn>}>
      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher par ville, type..." />
      <FilterPills options={types} active={filter} onChange={setFilter} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
        {filtered.map(h=><HousingCard key={h.id} h={h} onClick={()=>setDetail(h)} adminMode={adminMode} onEdit={()=>setEditItem(h)} />)}
      </div>
      {filtered.length===0 && <EmptyState icon="🏠" title="Aucun logement trouvé" desc="Essayez d'autres filtres." />}
      {editItem && <EditModal open={true} onClose={()=>setEditItem(null)} title="Modifier l'offre" data={editItem} onSave={f=>{setData(d=>d.map(h=>h.id===editItem.id?{...h,...f}:h));setEditItem(null);}}
        fields={[{key:'title',label:'Titre'},{key:'type',label:'Type',type:'select',options:types.slice(1)},{key:'location',label:'Lieu'},{key:'price_t99cp',label:'Prix/nuit (T99CP)',type:'number'},{key:'description',label:'Description',type:'textarea'}]} />}
    </PageWrap>
  );
}
window.HousingPage = HousingPage;
