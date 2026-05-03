// CarpoolingPage.jsx — Covoiturage style BlaBlaCar
const { useState } = React;

function TripCard({ trip, isOffer, onClick, adminMode, onEdit }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
      style={{ background:'#fff', borderRadius:16, border:`1px solid ${COLORS.gray200}`, padding:'16px 18px', cursor:'pointer', transition:'all 0.2s', boxShadow:hov?'0 8px 24px rgba(0,0,0,0.09)':'0 1px 4px rgba(0,0,0,0.05)', transform:hov?'translateY(-2px)':'none', position:'relative' }}>
      {adminMode && <div style={{ position:'absolute', top:8, right:8 }} onClick={e=>{e.stopPropagation();onEdit();}}><AdminEdit /></div>}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:COLORS.gray900 }}>{trip.from}</span>
            <span style={{ color:COLORS.red, fontSize:18 }}>→</span>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:COLORS.gray900 }}>{trip.to}</span>
          </div>
          <div style={{ fontSize:12, color:COLORS.gray500 }}>
            📅 {new Date(trip.date).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})} · 🕐 {trip.time}
          </div>
        </div>
        {isOffer && <div style={{ textAlign:'right', flexShrink:0 }}>
          <T99 value={trip.price_t99cp} size={14} />
          <div style={{ fontSize:11, color:COLORS.gray400 }}>par personne</div>
        </div>}
      </div>
      {isOffer ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:12 }}>{trip.driver.charAt(0)}</div>
            <div>
              <div style={{ fontWeight:600, fontSize:13, color:COLORS.gray900 }}>{trip.driver}</div>
              <Stars rating={trip.rating} />
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <Badge color={trip.seats>0?'green':'red'}>{trip.seats > 0 ? `${trip.seats} place${trip.seats>1?'s':''}` : 'Complet'}</Badge>
            <Badge color="blue">🚗 {trip.car.split(' ')[0]}</Badge>
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', color:COLORS.blue, fontWeight:700, fontSize:12 }}>{trip.passenger.charAt(0)}</div>
          <div>
            <div style={{ fontWeight:600, fontSize:13, color:COLORS.gray900 }}>{trip.passenger}</div>
            <div style={{ fontSize:12, color:COLORS.gray500 }}>{trip.note}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function TripDetail({ trip, isOffer, onClose, user, onOpenAuth, adminMode, onSave }) {
  const [t99Open, setT99Open] = useState(false);
  const [booked, setBooked] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [data, setData] = useState(trip);

  return (
    <div style={{ maxWidth:700, margin:'0 auto', padding:'24px 16px 100px' }}>
      <button onClick={onClose} style={{ display:'flex', alignItems:'center', gap:6, border:'none', background:'transparent', cursor:'pointer', color:COLORS.gray500, fontSize:13, fontWeight:600, marginBottom:16, padding:0 }}>← Retour au covoiturage</button>
      <div style={{ background:'#fff', borderRadius:20, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.07)' }}>
        <div style={{ background:GRAD, padding:'24px 28px', color:'#fff' }}>
          {adminMode && <div style={{ float:'right' }} onClick={()=>setShowEdit(true)}><AdminEdit /></div>}
          <div style={{ fontSize:12, fontWeight:600, marginBottom:8, opacity:0.8 }}>{isOffer?'🚗 OFFRE DE COVOITURAGE':'🙋 DEMANDE DE TRAJET'}</div>
          <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Sora',sans-serif" }}>{data.from}</div>
              <div style={{ fontSize:11, opacity:0.7 }}>Départ</div>
            </div>
            <div style={{ fontSize:36, flex:1, textAlign:'center' }}>→</div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Sora',sans-serif" }}>{data.to}</div>
              <div style={{ fontSize:11, opacity:0.7 }}>Arrivée</div>
            </div>
          </div>
          <div style={{ marginTop:12, fontSize:14, opacity:0.85 }}>
            📅 {new Date(data.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})} à {data.time}
          </div>
        </div>
        <div style={{ padding:24 }}>
          {isOffer ? <>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, padding:'14px 16px', background:COLORS.gray50, borderRadius:14, border:`1px solid ${COLORS.gray200}` }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:16 }}>{data.driver.charAt(0)}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:15, color:COLORS.gray900 }}>{data.driver}</div>
                <Stars rating={data.rating} />
                <div style={{ fontSize:12, color:COLORS.gray500 }}>🚗 {data.car}</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10, marginBottom:20 }}>
              {[['💺','Places dispo',`${data.seats} place${data.seats>1?'s':''}`],['₮','Prix/pers.',`${data.price_t99cp} T99CP`],['🚗','Véhicule',data.car.split('(')[0].trim()]].map(([icon,label,value])=>(
                <div key={label} style={{ background:COLORS.gray50, borderRadius:12, padding:'10px 12px', border:`1px solid ${COLORS.gray200}`, textAlign:'center' }}>
                  <div style={{ fontSize:18, marginBottom:3 }}>{icon}</div>
                  <div style={{ fontSize:10, color:COLORS.gray400 }}>{label}</div>
                  <div style={{ fontWeight:700, fontSize:13, color:COLORS.gray900 }}>{value}</div>
                </div>
              ))}
            </div>
            {data.comfort?.length>0 && <div style={{ marginBottom:20 }}><div style={{ fontSize:13, fontWeight:600, color:COLORS.gray700, marginBottom:8 }}>🛋️ Confort</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>{data.comfort.map(c=><Badge key={c} color="blue">{c}</Badge>)}</div></div>}
            {data.note && <div style={{ background:'#EFF6FF', borderRadius:12, padding:'12px 14px', border:'1px solid #BFDBFE', marginBottom:20 }}>
              <div style={{ fontSize:12, color:COLORS.blue }}><strong>💬 Note du conducteur :</strong> {data.note}</div></div>}
            {booked ? (
              <div style={{ background:'#DCFCE7', borderRadius:14, padding:'16px 20px', textAlign:'center', border:'1px solid #BBF7D0' }}>
                <div style={{ fontSize:28, marginBottom:4 }}>✅</div>
                <div style={{ fontWeight:700, color:'#166534', fontSize:15 }}>Réservation confirmée !</div>
              </div>
            ) : (
              <Btn variant="gradient" full size="lg" onClick={()=>{ if(!user){onOpenAuth();}else{setT99Open(true);} }}>₮ Réserver — {data.price_t99cp} T99CP</Btn>
            )}
          </> : <>
            <div style={{ marginBottom:20, padding:'14px 16px', background:'#EFF6FF', borderRadius:14, border:'1px solid #BFDBFE' }}>
              <div style={{ fontWeight:600, fontSize:14, color:COLORS.blue, marginBottom:4 }}>🙋 Passager·ère : {data.passenger}</div>
              <div style={{ fontSize:13, color:COLORS.gray600 }}>{data.note}</div>
            </div>
            <Btn variant="gradient" full size="lg" onClick={()=>{ if(!user)onOpenAuth(); else alert('Message envoyé au passager !'); }}>✉️ Proposer mon trajet</Btn>
          </>}
        </div>
      </div>
      <T99Modal open={t99Open} onClose={()=>setT99Open(false)} amount={data.price_t99cp} item={`Covoiturage ${data.from} → ${data.to}`} description={`Réservation d'une place avec ${data.driver}`} />
      <EditModal open={showEdit} onClose={()=>setShowEdit(false)} title="Modifier le trajet" data={data} onSave={f=>{setData(d=>({...d,...f}));onSave&&onSave({...data,...f});}}
        fields={[{key:'from',label:'Départ'},{key:'to',label:'Arrivée'},{key:'date',label:'Date',type:'date'},{key:'time',label:'Heure'},{key:'price_t99cp',label:'Prix T99CP',type:'number'},{key:'seats',label:'Places',type:'number'},{key:'note',label:'Note'}]} />
    </div>
  );
}

function CarpoolingPage({ user, adminMode, onOpenAuth }) {
  const [tab, setTab] = useState('offers');
  const [offers, setOffers] = useState(AppData.carpooling_offers);
  const [requests, setRequests] = useState(AppData.carpooling_requests);
  const [detail, setDetail] = useState(null);
  const [detailIsOffer, setDetailIsOffer] = useState(true);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState(null);

  const filterData = (arr) => !search ? arr : arr.filter(t => t.from.toLowerCase().includes(search.toLowerCase()) || t.to.toLowerCase().includes(search.toLowerCase()));

  if(detail) return <TripDetail trip={detail} isOffer={detailIsOffer} onClose={()=>setDetail(null)} user={user} onOpenAuth={onOpenAuth} adminMode={adminMode} onSave={u=>{if(detailIsOffer)setOffers(d=>d.map(t=>t.id===u.id?u:t));else setRequests(d=>d.map(t=>t.id===u.id?u:t));}} />;

  return (
    <PageWrap title="🚗 Covoiturage Solidaire" subtitle="Partagez vos trajets entre militant·es"
      action={<Btn variant="gradient" size="sm" onClick={()=>user?alert('Formulaire de publication'):onOpenAuth()}>+ Proposer un trajet</Btn>}>
      <SearchBar value={search} onChange={setSearch} placeholder="De... vers... (ex: Paris, Lyon)" />
      <div style={{ display:'flex', gap:0, marginBottom:20, background:COLORS.gray100, borderRadius:12, padding:4 }}>
        {[['offers','🚗 Offres de trajet'],['requests','🙋 Demandes de trajet']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:'9px 12px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'Inter,sans-serif', transition:'all 0.15s', background:tab===id?'#fff':COLORS.gray100, color:tab===id?COLORS.red:COLORS.gray500, boxShadow:tab===id?'0 2px 8px rgba(0,0,0,0.08)':'none' }}>{label}</button>
        ))}
      </div>
      {tab==='offers' && <>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filterData(offers).map(t=><TripCard key={t.id} trip={t} isOffer={true} onClick={()=>{setDetail(t);setDetailIsOffer(true);}} adminMode={adminMode} onEdit={()=>setEditItem({...t,_type:'offer'})} />)}
        </div>
        {filterData(offers).length===0 && <EmptyState icon="🚗" title="Aucun trajet trouvé" desc="Essayez une autre recherche." />}
      </>}
      {tab==='requests' && <>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filterData(requests).map(t=><TripCard key={t.id} trip={t} isOffer={false} onClick={()=>{setDetail(t);setDetailIsOffer(false);}} adminMode={adminMode} onEdit={()=>setEditItem({...t,_type:'request'})} />)}
        </div>
      </>}
      {editItem && <EditModal open={true} onClose={()=>setEditItem(null)} title="Modifier le trajet" data={editItem} onSave={f=>{ const updated={...editItem,...f}; if(editItem._type==='offer')setOffers(d=>d.map(t=>t.id===updated.id?updated:t)); else setRequests(d=>d.map(t=>t.id===updated.id?updated:t)); setEditItem(null); }} fields={[{key:'from',label:'Départ'},{key:'to',label:'Arrivée'},{key:'date',label:'Date',type:'date'},{key:'time',label:'Heure'},{key:'price_t99cp',label:'Prix T99CP',type:'number'},{key:'note',label:'Note'}]} />}
    </PageWrap>
  );
}
window.CarpoolingPage = CarpoolingPage;
