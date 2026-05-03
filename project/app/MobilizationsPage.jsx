// MobilizationsPage.jsx — Calendrier des mobilisations
const { useState } = React;

const TYPE_COLORS = { 'Manifestation':'red','Assemblée':'blue','Grève':'purple','Veillée':'amber','Rassemblement':'green','Festival':'orange','Forum':'blue','Action directe':'red','Camp':'green' };
const TYPE_ICONS = { 'Manifestation':'✊','Assemblée':'🗣️','Grève':'⚡','Veillée':'🕯️','Rassemblement':'👥','Festival':'🎉','Forum':'🌐','Action directe':'🚧','Camp':'⛺' };

function MobilizationCard({ mob, onClick, adminMode, onEdit }) {
  const d = new Date(mob.date);
  const color = TYPE_COLORS[mob.type]||'gray';
  return (
    <Card onClick={onClick} style={{ display:'flex', gap:0, overflow:'hidden', position:'relative' }}>
      {adminMode && <div style={{ position:'absolute', top:8, right:8, zIndex:2 }} onClick={e=>{e.stopPropagation();onEdit();}}><AdminEdit /></div>}
      <div style={{ width:64, background:GRAD_R, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'14px 6px', flexShrink:0 }}>
        <div style={{ color:'rgba(255,255,255,0.8)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{d.toLocaleDateString('fr-FR',{month:'short'})}</div>
        <div style={{ color:'#fff', fontSize:26, fontWeight:800, fontFamily:"'Sora',sans-serif", lineHeight:1 }}>{d.getDate()}</div>
        <div style={{ color:'rgba(255,255,255,0.7)', fontSize:10 }}>{d.getFullYear()}</div>
      </div>
      <div style={{ padding:'14px 16px', flex:1, minWidth:0 }}>
        <div style={{ display:'flex', gap:6, marginBottom:6, flexWrap:'wrap', alignItems:'center' }}>
          <Badge color={color}>{TYPE_ICONS[mob.type]} {mob.type}</Badge>
          <span style={{ fontSize:11, color:COLORS.gray400 }}>🕐 {mob.time}</span>
        </div>
        <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:COLORS.gray900, margin:'0 0 4px', lineHeight:1.3 }}>{mob.title}</h3>
        <p style={{ fontSize:12, color:COLORS.gray500, margin:'0 0 8px' }}>📍 {mob.location}</p>
        <p style={{ fontSize:12, color:COLORS.gray600, margin:'0 0 8px', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{mob.description}</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:12, color:COLORS.gray500 }}>👥 {mob.participants.toLocaleString('fr-FR')} participant·es</span>
          <span style={{ fontSize:11, fontWeight:600, color:COLORS.red }}>S'inscrire →</span>
        </div>
      </div>
    </Card>
  );
}

function MobilizationDetail({ mob, onClose, adminMode, onSave, user, onOpenAuth }) {
  const [registered, setRegistered] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [data, setData] = useState(mob);
  const d = new Date(data.date);

  return (
    <div style={{ maxWidth:760, margin:'0 auto', padding:'24px 16px 100px' }}>
      <button onClick={onClose} style={{ display:'flex', alignItems:'center', gap:6, border:'none', background:'transparent', cursor:'pointer', color:COLORS.gray500, fontSize:13, fontWeight:600, marginBottom:16, padding:0 }}>← Retour aux mobilisations</button>
      <div style={{ background:'#fff', borderRadius:20, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.07)' }}>
        <div style={{ background:GRAD, padding:'32px 28px', color:'#fff', position:'relative' }}>
          {adminMode && <div style={{ position:'absolute', top:12, right:12 }} onClick={()=>setShowEdit(true)}><AdminEdit /></div>}
          <Badge color="gray" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', marginBottom:12 }}>{TYPE_ICONS[data.type]} {data.type}</Badge>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(18px,3vw,26px)', fontWeight:800, margin:'0 0 12px', lineHeight:1.3 }}>{data.title}</h1>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:14 }}>
            <span>📅 {d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} à {data.time}</span>
            <span>📍 {data.location}</span>
          </div>
        </div>
        <div style={{ padding:28 }}>
          <p style={{ fontSize:15, color:COLORS.gray700, lineHeight:1.7, marginBottom:20 }}>{data.description}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:24 }}>
            {[['🏢','Organisateur',data.organizer],['👥','Participants',data.participants.toLocaleString('fr-FR')],['🕐','Heure',data.time],['📍','Lieu',data.location]].map(([icon,label,value])=>(
              <div key={label} style={{ background:COLORS.gray50, borderRadius:12, padding:'12px 14px', border:`1px solid ${COLORS.gray200}` }}>
                <div style={{ fontSize:11, color:COLORS.gray400, marginBottom:3 }}>{icon} {label}</div>
                <div style={{ fontWeight:700, fontSize:14, color:COLORS.gray900 }}>{value}</div>
              </div>
            ))}
          </div>
          {registered ? (
            <div style={{ background:'#DCFCE7', borderRadius:14, padding:'16px 20px', textAlign:'center', border:'1px solid #BBF7D0', marginBottom:12 }}>
              <div style={{ fontSize:28, marginBottom:4 }}>✅</div>
              <div style={{ fontWeight:700, color:'#166534', fontSize:15 }}>Vous êtes inscrit·e !</div>
              <div style={{ fontSize:13, color:'#16A34A', marginTop:2 }}>Vous recevrez les détails par email.</div>
            </div>
          ) : (
            <Btn variant="gradient" full size="lg" onClick={()=>{ if(!user)onOpenAuth(); else setRegistered(true); }}>✊ Participer à cette mobilisation</Btn>
          )}
        </div>
      </div>
      <EditModal open={showEdit} onClose={()=>setShowEdit(false)} title="Modifier la mobilisation" data={data} onSave={f=>{setData(d=>({...d,...f}));onSave&&onSave({...data,...f});}}
        fields={[{key:'title',label:'Titre'},{key:'type',label:'Type',type:'select',options:Object.keys(TYPE_ICONS)},{key:'date',label:'Date',type:'date'},{key:'time',label:'Heure'},{key:'location',label:'Lieu'},{key:'description',label:'Description',type:'textarea'},{key:'organizer',label:'Organisateur'}]} />
    </div>
  );
}

function MobilizationsPage({ user, adminMode, onOpenAuth }) {
  const [data, setData] = useState(AppData.mobilizations);
  const [detail, setDetail] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [filter, setFilter] = useState('Toutes');
  const [showCreate, setShowCreate] = useState(false);
  const types = ['Toutes',...[...new Set(data.map(m=>m.type))]];
  const filtered = filter==='Toutes'?data:data.filter(m=>m.type===filter);

  if(detail) return <MobilizationDetail mob={detail} onClose={()=>setDetail(null)} adminMode={adminMode} onSave={u=>setData(d=>d.map(m=>m.id===u.id?u:m))} user={user} onOpenAuth={onOpenAuth} />;

  return (
    <PageWrap title="📅 Mobilisations & Événements" subtitle={`${filtered.length} événements à venir`}
      action={adminMode && <Btn variant="success" size="sm" onClick={()=>setShowCreate(true)}>+ Ajouter un événement</Btn>}>
      <FilterPills options={types} active={filter} onChange={setFilter} />
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {filtered.map(m=>(
          <MobilizationCard key={m.id} mob={m} onClick={()=>setDetail(m)} adminMode={adminMode} onEdit={()=>setEditItem(m)} />
        ))}
      </div>
      {editItem && <EditModal open={true} onClose={()=>setEditItem(null)} title="Modifier l'événement" data={editItem} onSave={f=>{setData(d=>d.map(m=>m.id===editItem.id?{...m,...f}:m));setEditItem(null);}}
        fields={[{key:'title',label:'Titre'},{key:'type',label:'Type',type:'select',options:Object.keys(TYPE_ICONS)},{key:'date',label:'Date',type:'date'},{key:'time',label:'Heure'},{key:'location',label:'Lieu'},{key:'description',label:'Description',type:'textarea'},{key:'organizer',label:'Organisateur'},{key:'participants',label:'Participants estimés',type:'number'}]} />}
      <Modal open={showCreate} onClose={()=>setShowCreate(false)} title="+ Créer un événement" width={480}>
        <p style={{ color:COLORS.gray500, fontSize:14 }}>Fonctionnalité de création d'événement disponible pour les administrateurs.</p>
        <Btn variant="gradient" full onClick={()=>setShowCreate(false)} style={{ marginTop:16 }}>Fermer</Btn>
      </Modal>
    </PageWrap>
  );
}
window.MobilizationsPage = MobilizationsPage;
