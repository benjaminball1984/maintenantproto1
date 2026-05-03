// PetitionsPage.jsx — Style Change.org
const { useState } = React;

function PetitionDetail({ petition, onClose, adminMode, onSave, user, onOpenAuth }) {
  const [signed, setSigned] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [data, setData] = useState(petition);
  const [t99Open, setT99Open] = useState(false);
  const pct = Math.min(Math.round((data.signatures/data.goal)*100),100);

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'24px 16px 100px' }}>
      <button onClick={onClose} style={{ display:'flex', alignItems:'center', gap:6, border:'none', background:'transparent', cursor:'pointer', color:COLORS.gray500, fontSize:13, fontWeight:600, marginBottom:16, padding:0 }}>← Retour aux pétitions</button>
      <div style={{ background:'#fff', borderRadius:20, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.07)' }}>
        <ImgPlaceholder style={{ height:220 }} icon="✊" text="Image de la pétition" />
        <div style={{ padding:28 }}>
          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
            <Badge color="red">{data.category}</Badge>
            <Badge color="gray">📍 {data.location}</Badge>
            <Badge color="green">{data.status==='active'?'✅ Active':'Fermée'}</Badge>
            {adminMode && <AdminEdit onEdit={()=>setShowEdit(true)} />}
          </div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(18px,3vw,26px)', fontWeight:800, color:COLORS.gray900, margin:'0 0 12px', lineHeight:1.3 }}>{data.title}</h1>
          <p style={{ fontSize:14, color:COLORS.gray500, margin:'0 0 20px' }}>Par <strong>{data.author}</strong> · {new Date(data.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</p>
          <p style={{ fontSize:15, color:COLORS.gray700, lineHeight:1.7, margin:'0 0 24px' }}>{data.description}</p>

          <div style={{ background:COLORS.gray50, borderRadius:14, padding:'18px 20px', marginBottom:20, border:`1px solid ${COLORS.gray200}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10 }}>
              <span style={{ fontFamily:"'Sora',sans-serif", fontSize:28, fontWeight:800, color:COLORS.red }}>{data.signatures.toLocaleString('fr-FR')}</span>
              <span style={{ fontSize:13, color:COLORS.gray500 }}>sur {data.goal.toLocaleString('fr-FR')} signatures</span>
            </div>
            <Progress value={data.signatures} max={data.goal} />
          </div>

          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {signed ? (
              <div style={{ flex:1, background:'#DCFCE7', borderRadius:12, padding:'14px 20px', textAlign:'center', border:'1px solid #BBF7D0' }}>
                <div style={{ fontSize:24, marginBottom:4 }}>✅</div>
                <div style={{ fontWeight:700, color:'#166534' }}>Vous avez signé !</div>
                <div style={{ fontSize:12, color:'#16A34A', marginTop:2 }}>Merci pour votre soutien.</div>
              </div>
            ) : (
              <Btn variant="gradient" size="lg" style={{ flex:1 }} onClick={()=>{ if(!user){onOpenAuth();}else{setSigned(true);setData(d=>({...d,signatures:d.signatures+1}));} }}>
                ✍️ Signer cette pétition
              </Btn>
            )}
            <Btn variant="outline" size="lg" onClick={()=>setT99Open(true)}>💰 Soutenir en T99CP</Btn>
          </div>

          <div style={{ marginTop:20, padding:'14px 16px', background:'#EFF6FF', borderRadius:12, border:'1px solid #BFDBFE', fontSize:13, color:'#1e40af' }}>
            🔗 <strong>Partagez :</strong> Chaque signature compte. Partagez avec vos proches et réseaux !
          </div>

          <div style={{ marginTop:20 }}>
            {data.tags?.map(t=><Badge key={t} color="gray" style={{ marginRight:6, marginBottom:4 }}>#{t}</Badge>)}
          </div>
        </div>
      </div>

      <T99Modal open={t99Open} onClose={()=>setT99Open(false)} amount={5} item={data.title} description="Soutenez cette pétition avec un don en T99CP pour couvrir les frais de campagne." />
      <EditModal open={showEdit} onClose={()=>setShowEdit(false)} title="Modifier la pétition" data={data} onSave={(f)=>{setData(d=>({...d,...f}));onSave&&onSave({...data,...f});}}
        fields={[{key:'title',label:'Titre'},{key:'category',label:'Catégorie',type:'select',options:['Santé','Environnement','Social','Justice','Transport','Logement','Droits','Éducation']},{key:'description',label:'Description',type:'textarea'},{key:'goal',label:'Objectif signatures',type:'number'},{key:'location',label:'Lieu'},{key:'author',label:'Auteur'}]} />
    </div>
  );
}

function PetitionCard2({ petition, onClick, adminMode, onEdit }) {
  const pct = Math.min(Math.round((petition.signatures/petition.goal)*100),100);
  const catColors = {'Santé':'red','Environnement':'green','Social':'blue','Justice':'red','Transport':'blue','Logement':'amber','Droits':'purple','Éducation':'blue'};
  return (
    <Card onClick={onClick} style={{ overflow:'hidden', position:'relative' }}>
      <ImgPlaceholder style={{ height:130, borderRadius:'12px 12px 0 0' }} icon={petition.featured?'⭐':'✊'} />
      {adminMode && <div style={{ position:'absolute', top:8, right:8 }} onClick={e=>{e.stopPropagation();onEdit();}}><AdminEdit label="Modifier" /></div>}
      {petition.featured && <div style={{ position:'absolute', top:8, left:8, background:GRAD, color:'#fff', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:9999 }}>⭐ En vedette</div>}
      <div style={{ padding:'12px 14px 14px' }}>
        <Badge color={catColors[petition.category]||'gray'} style={{ marginBottom:6 }}>{petition.category}</Badge>
        <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:COLORS.gray900, margin:'0 0 6px', lineHeight:1.35, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{petition.title}</h3>
        <p style={{ fontSize:12, color:COLORS.gray500, margin:'0 0 10px' }}>📍 {petition.location} · Par {petition.author}</p>
        <Progress value={petition.signatures} max={petition.goal} />
        <div style={{ marginTop:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:12, fontWeight:700, color:COLORS.red }}>{petition.signatures.toLocaleString('fr-FR')} signataires</span>
          <span style={{ fontSize:11, color:COLORS.gray400 }}>{pct}% atteint</span>
        </div>
      </div>
    </Card>
  );
}

function PetitionsPage({ user, adminMode, onOpenAuth }) {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Toutes');
  const [detail, setDetail] = useState(null);
  const [data, setData] = useState(AppData.petitions);
  const [editItem, setEditItem] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newPetition, setNewPetition] = useState({title:'',category:'Social',description:'',goal:5000,location:'France',author:user?.name||''});

  const cats = ['Toutes',...[...new Set(data.map(p=>p.category))]];
  const filtered = data.filter(p=>{
    const ms = !search||p.title.toLowerCase().includes(search.toLowerCase())||p.description.toLowerCase().includes(search.toLowerCase());
    const mc = cat==='Toutes'||p.category===cat;
    return ms&&mc;
  });
  const featured = filtered.filter(p=>p.featured);
  const rest = filtered.filter(p=>!p.featured);

  const handleSave = (updated) => setData(d=>d.map(p=>p.id===updated.id?updated:p));
  const handleCreate = () => {
    const np = {...newPetition, id:Date.now(), signatures:0, status:'active', date:new Date().toISOString().split('T')[0], featured:false, tags:[]};
    setData(d=>[np,...d]); setShowCreate(false);
    setNewPetition({title:'',category:'Social',description:'',goal:5000,location:'France',author:user?.name||''});
  };

  if(detail) return <PetitionDetail petition={detail} onClose={()=>setDetail(null)} adminMode={adminMode} onSave={handleSave} user={user} onOpenAuth={onOpenAuth} />;

  return (
    <PageWrap title="📜 Pétitions citoyennes" subtitle={`${filtered.length} pétitions actives`} action={
      <div style={{ display:'flex', gap:8 }}>
        {adminMode && <Btn variant="success" size="sm" onClick={()=>setShowCreate(true)}>+ Nouvelle pétition</Btn>}
        <Btn variant="gradient" size="sm" onClick={()=>{ if(!user)onOpenAuth(); else setShowCreate(true); }}>+ Créer une pétition</Btn>
      </div>
    }>
      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une pétition..." />
      <FilterPills options={cats} active={cat} onChange={setCat} />

      {featured.length>0 && <>
        <SectionHeader icon="⭐" iconBg="linear-gradient(135deg,#F59E0B,#7C3AED)" title="Pétitions en vedette" sub="Causes prioritaires" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16, marginBottom:32 }}>
          {featured.map(p=><PetitionCard2 key={p.id} petition={p} onClick={()=>setDetail(p)} adminMode={adminMode} onEdit={()=>setEditItem(p)} />)}
        </div>
      </>}

      <SectionHeader icon="📜" title={cat==='Toutes'?'Toutes les pétitions':`Pétitions — ${cat}`} sub={`${rest.length} pétition${rest.length!==1?'s':''}`} />
      {rest.length===0 ? <EmptyState icon="🔍" title="Aucune pétition trouvée" desc="Essayez d'autres filtres ou créez la vôtre !" />
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {rest.map(p=><PetitionCard2 key={p.id} petition={p} onClick={()=>setDetail(p)} adminMode={adminMode} onEdit={()=>setEditItem(p)} />)}
          </div>}

      {editItem && <EditModal open={true} onClose={()=>setEditItem(null)} title="Modifier la pétition" data={editItem} onSave={(f)=>{handleSave({...editItem,...f});setEditItem(null);}}
        fields={[{key:'title',label:'Titre'},{key:'category',label:'Catégorie',type:'select',options:['Santé','Environnement','Social','Justice','Transport','Logement','Droits','Éducation']},{key:'description',label:'Description',type:'textarea'},{key:'goal',label:'Objectif',type:'number'},{key:'location',label:'Lieu'},{key:'author',label:'Auteur'}]} />}

      <Modal open={showCreate} onClose={()=>setShowCreate(false)} title="✍️ Créer une pétition" width={520}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[{key:'title',label:'Titre de la pétition'},{key:'location',label:'Lieu'},{key:'author',label:'Votre nom / organisation'}].map(f=>(
            <div key={f.key}><label style={{ fontSize:12,fontWeight:600,color:COLORS.gray700,display:'block',marginBottom:4 }}>{f.label}</label>
            <input value={newPetition[f.key]} onChange={e=>setNewPetition(p=>({...p,[f.key]:e.target.value}))} style={{...inputSt}} /></div>
          ))}
          <div><label style={{ fontSize:12,fontWeight:600,color:COLORS.gray700,display:'block',marginBottom:4 }}>Catégorie</label>
          <select value={newPetition.category} onChange={e=>setNewPetition(p=>({...p,category:e.target.value}))} style={inputSt}>
            {['Santé','Environnement','Social','Justice','Transport','Logement','Droits','Éducation'].map(c=><option key={c}>{c}</option>)}
          </select></div>
          <div><label style={{ fontSize:12,fontWeight:600,color:COLORS.gray700,display:'block',marginBottom:4 }}>Description</label>
          <textarea value={newPetition.description} onChange={e=>setNewPetition(p=>({...p,description:e.target.value}))} rows={4} style={{...inputSt,height:'auto',padding:'10px 14px',resize:'vertical'}} /></div>
          <div><label style={{ fontSize:12,fontWeight:600,color:COLORS.gray700,display:'block',marginBottom:4 }}>Objectif (signatures)</label>
          <input type="number" value={newPetition.goal} onChange={e=>setNewPetition(p=>({...p,goal:+e.target.value}))} style={inputSt} /></div>
          <Btn variant="gradient" full onClick={handleCreate}>🚀 Publier la pétition</Btn>
        </div>
      </Modal>
    </PageWrap>
  );
}
const inputSt = { width:'100%',height:44,border:'1.5px solid #E5E7EB',borderRadius:12,padding:'0 14px',fontSize:14,fontFamily:'Inter,sans-serif',outline:'none',boxSizing:'border-box' };
window.PetitionsPage = PetitionsPage;
