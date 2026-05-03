// MarketplacePage.jsx — Marketplace solidaire style Vinted/Leboncoin
const { useState } = React;

function MarketplaceCard({ item, onClick, adminMode, onEdit }) {
  const [hov, setHov] = useState(false);
  const condColors = {'Excellent':'green','Très bon':'blue','Bon':'gray'};
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
      style={{ background:'#fff', borderRadius:14, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', cursor:'pointer', transition:'all 0.2s', boxShadow:hov?'0 6px 20px rgba(0,0,0,0.09)':'0 1px 3px rgba(0,0,0,0.05)', transform:hov?'translateY(-2px)':'none', position:'relative' }}>
      {adminMode && <div style={{ position:'absolute', top:6, right:6, zIndex:2 }} onClick={e=>{e.stopPropagation();onEdit();}}><AdminEdit /></div>}
      <ImgPlaceholder style={{ height:140 }} icon="🛍️" />
      <div style={{ padding:'10px 12px 12px' }}>
        <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700, color:COLORS.gray900, margin:'0 0 4px', lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.title}</h3>
        <p style={{ fontSize:11, color:COLORS.gray400, margin:'0 0 6px' }}>📍 {item.location} · {item.seller}</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <T99 value={item.price_t99cp} size={13} />
          <Badge color={condColors[item.condition]||'gray'} style={{ fontSize:10 }}>{item.condition}</Badge>
        </div>
      </div>
    </div>
  );
}

function MarketplaceDetail({ item, onClose, user, onOpenAuth, adminMode, onSave }) {
  const [t99Open, setT99Open] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [data, setData] = useState(item);

  return (
    <div style={{ maxWidth:760, margin:'0 auto', padding:'24px 16px 100px' }}>
      <button onClick={onClose} style={{ display:'flex', alignItems:'center', gap:6, border:'none', background:'transparent', cursor:'pointer', color:COLORS.gray500, fontSize:13, fontWeight:600, marginBottom:16, padding:0 }}>← Retour à la marketplace</button>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }} className="mn-detail-grid">
        <div>
          <ImgPlaceholder style={{ height:280, borderRadius:16 }} icon="🛍️" text="Photos de l'article" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginTop:6 }}>
            {[1,2,3,4].map(i=><ImgPlaceholder key={i} style={{ height:60, borderRadius:10 }} icon="📷" />)}
          </div>
        </div>
        <div style={{ background:'#fff', borderRadius:16, border:`1px solid ${COLORS.gray200}`, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap', alignItems:'center' }}>
            <Badge color="gray">{data.category}</Badge>
            <Badge color={data.condition==='Excellent'?'green':'blue'}>{data.condition}</Badge>
            {adminMode && <AdminEdit onEdit={()=>setShowEdit(true)} />}
          </div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(16px,2.5vw,20px)', fontWeight:800, color:COLORS.gray900, margin:'0 0 8px', lineHeight:1.3 }}>{data.title}</h1>
          <p style={{ fontSize:13, color:COLORS.gray500, margin:'0 0 12px' }}>👤 {data.seller} · 📍 {data.location}</p>
          <div style={{ margin:'0 0 20px' }}><T99 value={data.price_t99cp} size={22} /></div>
          <p style={{ fontSize:14, color:COLORS.gray700, lineHeight:1.7, margin:'0 0 20px' }}>{data.description}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <Btn variant="gradient" full size="lg" onClick={()=>{ if(!user)onOpenAuth(); else setT99Open(true); }}>₮ Acheter — {data.price_t99cp} T99CP</Btn>
            <Btn variant="outline" full onClick={()=>user?alert('Message envoyé !'):onOpenAuth()}>✉️ Contacter le vendeur</Btn>
            <p style={{ fontSize:11, color:COLORS.gray400, textAlign:'center', margin:0 }}>+ frais de port en Polygon (Gas fees)</p>
          </div>
        </div>
      </div>
      <T99Modal open={t99Open} onClose={()=>setT99Open(false)} amount={data.price_t99cp} item={data.title} description={`Achat auprès de ${data.seller} · ${data.location}`} />
      <EditModal open={showEdit} onClose={()=>setShowEdit(false)} title="Modifier l'article" data={data} onSave={f=>{setData(d=>({...d,...f}));onSave&&onSave({...data,...f});}}
        fields={[{key:'title',label:'Titre'},{key:'category',label:'Catégorie',type:'select',options:['Sport & Vélo','High-Tech','Livres','Mobilier','Vêtements','Maison','Musique','Cuisine','Jardin']},{key:'price_t99cp',label:'Prix T99CP',type:'number'},{key:'condition',label:'État',type:'select',options:['Excellent','Très bon','Bon']},{key:'description',label:'Description',type:'textarea'},{key:'location',label:'Lieu'},{key:'seller',label:'Vendeur'}]} />
    </div>
  );
}

function MarketplacePage({ user, adminMode, onOpenAuth }) {
  const [data, setData] = useState(AppData.marketplace);
  const [detail, setDetail] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [cat, setCat] = useState('Toutes');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');

  const cats = ['Toutes',...[...new Set(data.map(i=>i.category))]];
  let filtered = data.filter(i=>{
    const mc = cat==='Toutes'||i.category===cat;
    const ms = !search||i.title.toLowerCase().includes(search.toLowerCase())||i.location.toLowerCase().includes(search.toLowerCase());
    return mc&&ms;
  });
  if(sort==='price_asc') filtered=[...filtered].sort((a,b)=>a.price_t99cp-b.price_t99cp);
  if(sort==='price_desc') filtered=[...filtered].sort((a,b)=>b.price_t99cp-a.price_t99cp);

  if(detail) return <MarketplaceDetail item={detail} onClose={()=>setDetail(null)} user={user} onOpenAuth={onOpenAuth} adminMode={adminMode} onSave={u=>setData(d=>d.map(i=>i.id===u.id?u:i))} />;

  return (
    <PageWrap title="🛒 Marketplace Solidaire" subtitle={`${filtered.length} articles disponibles`}
      action={<Btn variant="gradient" size="sm" onClick={()=>user?alert('Vendre un article'):onOpenAuth()}>+ Vendre un article</Btn>}>
      <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ flex:1, minWidth:200 }}><SearchBar value={search} onChange={setSearch} placeholder="Rechercher un article..." /></div>
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{ height:44, border:`1.5px solid ${COLORS.gray200}`, borderRadius:12, padding:'0 14px', fontSize:13, fontFamily:'Inter,sans-serif', outline:'none', background:'#fff', flexShrink:0 }}>
          <option value="recent">Plus récents</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
        </select>
      </div>
      <FilterPills options={cats} active={cat} onChange={setCat} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
        {filtered.map(i=><MarketplaceCard key={i.id} item={i} onClick={()=>setDetail(i)} adminMode={adminMode} onEdit={()=>setEditItem(i)} />)}
      </div>
      {filtered.length===0 && <EmptyState icon="🛍️" title="Aucun article trouvé" />}
      {editItem && <EditModal open={true} onClose={()=>setEditItem(null)} title="Modifier l'article" data={editItem} onSave={f=>{setData(d=>d.map(i=>i.id===editItem.id?{...i,...f}:i));setEditItem(null);}} fields={[{key:'title',label:'Titre'},{key:'price_t99cp',label:'Prix T99CP',type:'number'},{key:'condition',label:'État',type:'select',options:['Excellent','Très bon','Bon']},{key:'description',label:'Description',type:'textarea'},{key:'location',label:'Lieu'}]} />}
    </PageWrap>
  );
}
window.MarketplacePage = MarketplacePage;
