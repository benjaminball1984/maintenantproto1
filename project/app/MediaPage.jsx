// MediaPage.jsx — Style Mediapart
const { useState } = React;

function MediaCard({ article, onClick, adminMode, onEdit, featured }) {
  const [hov, setHov] = useState(false);
  if (featured) return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:'#fff', borderRadius:16, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', cursor:'pointer', transition:'all 0.2s', boxShadow:hov?'0 8px 30px rgba(0,0,0,0.10)':'0 1px 4px rgba(0,0,0,0.05)', transform:hov?'translateY(-2px)':'none', display:'grid', gridTemplateColumns:'1fr 1fr', position:'relative' }} className="mn-media-featured">
      {adminMode && <div style={{ position:'absolute', top:8, right:8, zIndex:2 }} onClick={e=>{e.stopPropagation();onEdit();}}><AdminEdit /></div>}
      <ImgPlaceholder style={{ height:'100%', minHeight:200 }} icon="📰" text="Photo de l'article" />
      <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <Badge color="red" style={{ marginBottom:10, alignSelf:'flex-start' }}>{article.category}</Badge>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(14px,2vw,18px)', fontWeight:800, color:COLORS.gray900, margin:'0 0 10px', lineHeight:1.35 }}>{article.title}</h2>
        <p style={{ fontSize:13, color:COLORS.gray600, lineHeight:1.6, margin:'0 0 12px', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{article.excerpt}</p>
        <div style={{ fontSize:11, color:COLORS.gray400 }}>✍️ {article.author} · 📅 {new Date(article.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})} · ⏱ {article.reading_time} min</div>
      </div>
    </div>
  );
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:'#fff', borderRadius:14, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', cursor:'pointer', transition:'all 0.2s', boxShadow:hov?'0 6px 20px rgba(0,0,0,0.09)':'none', position:'relative' }}>
      {adminMode && <div style={{ position:'absolute', top:6, right:6, zIndex:2 }} onClick={e=>{e.stopPropagation();onEdit();}}><AdminEdit /></div>}
      <ImgPlaceholder style={{ height:120 }} icon="📰" />
      <div style={{ padding:'10px 12px 12px' }}>
        <Badge color="red" style={{ marginBottom:6, fontSize:10 }}>{article.category}</Badge>
        <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:COLORS.gray900, margin:'0 0 6px', lineHeight:1.35, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{article.title}</h3>
        <div style={{ fontSize:11, color:COLORS.gray400 }}>✍️ {article.author} · ⏱ {article.reading_time} min</div>
      </div>
    </div>
  );
}

function ArticleDetail({ article, onClose, adminMode, onSave }) {
  const [showEdit, setShowEdit] = useState(false);
  const [data, setData] = useState(article);
  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'24px 16px 100px' }}>
      <button onClick={onClose} style={{ display:'flex', alignItems:'center', gap:6, border:'none', background:'transparent', cursor:'pointer', color:COLORS.gray500, fontSize:13, fontWeight:600, marginBottom:16, padding:0 }}>← Retour au média</button>
      <article style={{ background:'#fff', borderRadius:20, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.07)' }}>
        <ImgPlaceholder style={{ height:280 }} icon="📰" text="Illustration de l'article" />
        <div style={{ padding:'28px 32px' }}>
          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
            <Badge color="red">{data.category}</Badge>
            {data.tags?.map(t=><Badge key={t} color="gray">#{t}</Badge>)}
            {adminMode && <AdminEdit onEdit={()=>setShowEdit(true)} />}
          </div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(20px,3.5vw,30px)', fontWeight:800, color:COLORS.gray900, margin:'0 0 14px', lineHeight:1.25, letterSpacing:'-0.02em' }}>{data.title}</h1>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24, paddingBottom:20, borderBottom:`1px solid ${COLORS.gray200}`, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13 }}>{data.author.charAt(0)}</div>
              <div><div style={{ fontWeight:600, fontSize:13, color:COLORS.gray900 }}>{data.author}</div><div style={{ fontSize:11, color:COLORS.gray400 }}>Journaliste</div></div>
            </div>
            <span style={{ fontSize:12, color:COLORS.gray400 }}>📅 {new Date(data.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</span>
            <span style={{ fontSize:12, color:COLORS.gray400 }}>⏱ {data.reading_time} min de lecture</span>
          </div>
          <p style={{ fontSize:16, color:COLORS.gray700, lineHeight:1.8, margin:'0 0 20px', fontWeight:500, borderLeft:`4px solid ${COLORS.red}`, paddingLeft:16 }}>{data.excerpt}</p>
          <div style={{ fontSize:15, color:COLORS.gray700, lineHeight:1.8 }}>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p style={{ marginTop:16 }}>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <p style={{ marginTop:16 }}>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
            <blockquote style={{ margin:'24px 0', padding:'16px 20px', background:COLORS.gray50, borderLeft:`4px solid ${COLORS.red}`, borderRadius:'0 12px 12px 0', fontStyle:'italic', color:COLORS.gray700, fontSize:15 }}>
              « Face aux oppressions systémiques, nos luttes doivent devenir systémiques. Ils ont des milliards, soyons des millions ! »
            </blockquote>
            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
          </div>
        </div>
      </article>
      <EditModal open={showEdit} onClose={()=>setShowEdit(false)} title="Modifier l'article" data={data} onSave={f=>{setData(d=>({...d,...f}));onSave&&onSave({...data,...f});}}
        fields={[{key:'title',label:'Titre'},{key:'category',label:'Catégorie',type:'select',options:['Enquête','Politique','Environnement','Justice','Économie','Portrait','Innovation','Culture','Logement']},{key:'excerpt',label:'Chapeau (extrait)',type:'textarea'},{key:'author',label:'Auteur'},{key:'reading_time',label:'Temps de lecture (min)',type:'number'}]} />
    </div>
  );
}

function MediaPage({ user, adminMode, onOpenAuth }) {
  const [data, setData] = useState(AppData.media);
  const [detail, setDetail] = useState(null);
  const [cat, setCat] = useState('Toutes');
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState(null);
  const cats = ['Toutes',...[...new Set(data.map(a=>a.category))]];
  const filtered = data.filter(a=>{
    const mc = cat==='Toutes'||a.category===cat;
    const ms = !search||a.title.toLowerCase().includes(search.toLowerCase())||a.author.toLowerCase().includes(search.toLowerCase());
    return mc&&ms;
  });
  const featured = filtered.filter(a=>a.featured);
  const rest = filtered.filter(a=>!a.featured);
  if(detail) return <ArticleDetail article={detail} onClose={()=>setDetail(null)} adminMode={adminMode} onSave={u=>setData(d=>d.map(a=>a.id===u.id?u:a))} />;
  return (
    <PageWrap title="📰 Média & Analyses" subtitle="Journalisme militant indépendant"
      action={adminMode && <Btn variant="success" size="sm">+ Nouvel article</Btn>}>
      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un article, un auteur..." />
      <FilterPills options={cats} active={cat} onChange={setCat} />
      {featured.length>0 && <div style={{ marginBottom:24 }}>{featured.map(a=><MediaCard key={a.id} article={a} onClick={()=>setDetail(a)} adminMode={adminMode} onEdit={()=>setEditItem(a)} featured />)}</div>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
        {rest.map(a=><MediaCard key={a.id} article={a} onClick={()=>setDetail(a)} adminMode={adminMode} onEdit={()=>setEditItem(a)} />)}
      </div>
      {filtered.length===0 && <EmptyState icon="📰" title="Aucun article trouvé" />}
      {editItem && <EditModal open={true} onClose={()=>setEditItem(null)} title="Modifier l'article" data={editItem} onSave={f=>{setData(d=>d.map(a=>a.id===editItem.id?{...a,...f}:a));setEditItem(null);}} fields={[{key:'title',label:'Titre'},{key:'category',label:'Catégorie'},{key:'excerpt',label:'Extrait',type:'textarea'},{key:'author',label:'Auteur'}]} />}
    </PageWrap>
  );
}
window.MediaPage = MediaPage;
