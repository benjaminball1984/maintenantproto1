// CampaignPage.jsx — Constructeur de campagnes avec drag & drop
// Jusqu'à 12 modules issus de tous les services de la plateforme
const { useState, useRef, useCallback } = React;

// ── Modules disponibles ─────────────────────────────────
const ALL_MODULES = [
  { id:'petition',      icon:'📜', label:'Pétition phare',       color:'#E11D74', desc:'Mettez en avant une pétition avec sa barre de progression et bouton de signature.' },
  { id:'mobilizations', icon:'📅', label:'Mobilisations',         color:'#7C3AED', desc:'Les 3 prochains événements et actions militantes.' },
  { id:'crowdfunding',  icon:'💰', label:'Cagnotte',              color:'#A21CAF', desc:'Collecte solidaire avec barre de progression et appel aux dons.' },
  { id:'housing',       icon:'🏠', label:'Hébergements',          color:'#BE185D', desc:'Offres de logement solidaire disponibles.' },
  { id:'carpooling',    icon:'🚗', label:'Covoiturage',           color:'#0284C7', desc:'Trajets disponibles et demandes de covoiturage.' },
  { id:'lending',       icon:'🔧', label:'Prêt d\'objets',        color:'#0891B2', desc:'Objets disponibles à emprunter dans le réseau.' },
  { id:'marketplace',   icon:'🛒', label:'Marketplace',           color:'#9333EA', desc:'Articles en vente à prix solidaire en T99CP.' },
  { id:'sel',           icon:'🤲', label:'Services SEL',          color:'#16A34A', desc:'Échanges de compétences et de temps.' },
  { id:'garden',        icon:'🥬', label:'Surplus de jardin',     color:'#9333EA', desc:'Dons et ventes de fruits, légumes, plants.' },
  { id:'media',         icon:'📰', label:'Articles & analyses',   color:'#5B21B6', desc:'Derniers articles du média militant.' },
  { id:'cta',           icon:'📣', label:'Appel à l\'action',     color:'#E11D74', desc:'Bloc texte personnalisé avec bouton CTA.' },
  { id:'stats',         icon:'📊', label:'Statistiques',          color:'#7C3AED', desc:'Chiffres clés de la campagne et de la plateforme.' },
];

// ── Données exemple campagnes ────────────────────────────
const SAMPLE_CAMPAIGNS = [
  {
    id: 1, slug: 'urgences-ouvertes', title: 'Urgences Ouvertes 24h/24', subtitle: 'Une campagne pour le droit à la santé pour tous',
    cover: 'https://picsum.photos/seed/hospital/1200/400',
    organizer: 'Collectif Santé Pour Tous', date: '2026-04-01', supporters: 3240,
    modules: ['petition','crowdfunding','mobilizations','media'],
    color: '#E11D74',
    petition_id: 1, crowdfunding_id: 1,
    cta_text: 'Ensemble, nous pouvons rouvrir les urgences de nuit. Chaque signature compte !',
    cta_btn: 'Signer maintenant',
  },
  {
    id: 2, slug: 'transition-ecologique', title: 'Transition Écologique Maintenant', subtitle: 'Pour une loi climatique ambitieuse avant 2027',
    cover: 'https://picsum.photos/seed/ecology/1200/400',
    organizer: 'Alliance Verte + THE99COINPROJECT', date: '2026-03-15', supporters: 8420,
    modules: ['petition','mobilizations','media','crowdfunding','garden','sel'],
    color: '#16A34A',
    petition_id: 2, crowdfunding_id: 2,
    cta_text: 'La planète ne peut pas attendre. Mobilisons-nous massivement !',
    cta_btn: 'Rejoindre la campagne',
  },
  {
    id: 3, slug: 'logement-pour-tous', title: 'Logement Pour Tous', subtitle: 'Contre les expulsions, pour le droit à un toit',
    cover: 'https://picsum.photos/seed/housing/1200/400',
    organizer: 'DAL + Réseau Solidarités', date: '2026-02-20', supporters: 1890,
    modules: ['petition','housing','crowdfunding','mobilizations','cta'],
    color:'#BE185D',
    petition_id: 5, crowdfunding_id: 4,
    cta_text: 'Se loger est un droit fondamental. Rejoignez la campagne !',
    cta_btn: 'Agir maintenant',
  },
];

// ── Mini-previews des modules ────────────────────────────
function ModulePreview({ moduleId, campaign, setActivePage }) {
  const petition = AppData.petitions.find(p=>p.id===(campaign.petition_id||1)) || AppData.petitions[0];
  const mob = AppData.mobilizations.slice(0,2);
  const cf = AppData.crowdfunding.find(c=>c.id===(campaign.crowdfunding_id||1)) || AppData.crowdfunding[0];
  const housing = AppData.housing.slice(0,2);
  const rides = AppData.carpooling_offers.slice(0,2);
  const items = AppData.lending.slice(0,3);
  const products = AppData.marketplace.slice(0,3);
  const selItems = AppData.sel.slice(0,3);
  const garden = AppData.garden.slice(0,3);
  const articles = AppData.media.slice(0,2);

  const boxStyle = { background:'#fff', borderRadius:14, border:`1px solid ${COLORS.gray200}`, padding:'14px 16px', marginBottom:0 };

  switch(moduleId) {
    case 'petition': return (
      <div style={boxStyle}>
        <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
          <img src={`https://picsum.photos/seed/petition${petition.id}/80/60`} style={{ width:80, height:60, borderRadius:10, objectFit:'cover', flexShrink:0 }} alt="" />
          <div style={{ flex:1, minWidth:0 }}>
            <Badge color="red" style={{ marginBottom:4, fontSize:10 }}>{petition.category}</Badge>
            <h4 style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:COLORS.gray900, margin:'0 0 6px', lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{petition.title}</h4>
            <Progress value={petition.signatures} max={petition.goal} />
            <div style={{ marginTop:6 }}><Btn variant="gradient" size="sm" onClick={()=>setActivePage('petitions')}>✍️ Signer</Btn></div>
          </div>
        </div>
      </div>
    );
    case 'mobilizations': return (
      <div style={{ ...boxStyle, display:'flex', flexDirection:'column', gap:8 }}>
        {mob.map(m=><div key={m.id} style={{ display:'flex', gap:10, alignItems:'center', padding:'8px 10px', background:COLORS.gray50, borderRadius:10 }}>
          <div style={{ width:40, height:40, background:GRAD, borderRadius:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#fff' }}>
            <div style={{ fontSize:14, fontWeight:800, lineHeight:1 }}>{new Date(m.date).getDate()}</div>
            <div style={{ fontSize:9, opacity:0.8 }}>{new Date(m.date).toLocaleDateString('fr-FR',{month:'short'})}</div>
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:12, color:COLORS.gray900 }}>{m.title}</div>
            <div style={{ fontSize:11, color:COLORS.gray500 }}>📍 {m.location}</div>
          </div>
        </div>)}
        <Btn variant="outline" size="sm" full onClick={()=>setActivePage('mobilizations')}>Voir tout →</Btn>
      </div>
    );
    case 'crowdfunding': return (
      <div style={boxStyle}>
        <img src={`https://picsum.photos/seed/fund${cf.id}/400/120`} style={{ width:'100%', height:90, objectFit:'cover', borderRadius:10, marginBottom:10 }} alt="" />
        <h4 style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:COLORS.gray900, margin:'0 0 8px' }}>{cf.title}</h4>
        <Progress value={cf.raised_t99cp} max={cf.goal_t99cp} />
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:COLORS.gray500, margin:'6px 0 10px' }}>
          <span><strong style={{ color:COLORS.blue }}>{cf.raised_t99cp} T99CP</strong></span>
          <span>👥 {cf.contributors} contributeurs</span>
        </div>
        <Btn variant="t99cp" size="sm" full onClick={()=>setActivePage('crowdfunding')}>₮ Contribuer</Btn>
      </div>
    );
    case 'housing': return (
      <div style={{ ...boxStyle, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {housing.map(h=><div key={h.id} style={{ borderRadius:10, overflow:'hidden', border:`1px solid ${COLORS.gray200}` }}>
          <img src={`https://picsum.photos/seed/house${h.id}/200/100`} style={{ width:'100%', height:70, objectFit:'cover' }} alt="" />
          <div style={{ padding:'6px 8px' }}>
            <div style={{ fontSize:11, fontWeight:600, color:COLORS.gray900, lineHeight:1.2, marginBottom:2 }}>{h.type} · {h.location}</div>
            <T99 value={h.price_t99cp} size={11} /><span style={{ fontSize:10, color:COLORS.gray400 }}>/nuit</span>
          </div>
        </div>)}
        <Btn variant="outline" size="sm" style={{ gridColumn:'1/-1' }} full onClick={()=>setActivePage('housing')}>Voir les hébergements →</Btn>
      </div>
    );
    case 'carpooling': return (
      <div style={{ ...boxStyle, display:'flex', flexDirection:'column', gap:6 }}>
        {rides.map(r=><div key={r.id} style={{ padding:'8px 10px', background:COLORS.gray50, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div><span style={{ fontWeight:700, fontSize:12 }}>{r.from}</span><span style={{ color:COLORS.red, margin:'0 6px' }}>→</span><span style={{ fontWeight:700, fontSize:12 }}>{r.to}</span><div style={{ fontSize:11, color:COLORS.gray500 }}>{r.driver} · {r.seats} place{r.seats>1?'s':''}</div></div>
          <T99 value={r.price_t99cp} size={12} />
        </div>)}
        <Btn variant="outline" size="sm" full onClick={()=>setActivePage('carpooling')}>Tous les trajets →</Btn>
      </div>
    );
    case 'lending': return (
      <div style={{ ...boxStyle, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
        {items.map(i=><div key={i.id} style={{ textAlign:'center', padding:'8px 4px', background:COLORS.gray50, borderRadius:10 }}>
          <div style={{ fontSize:24, marginBottom:2 }}>{'🔧📚🍳'[items.indexOf(i)]||'📦'}</div>
          <div style={{ fontSize:10, fontWeight:600, color:COLORS.gray700, lineHeight:1.2 }}>{i.name.split(' ').slice(0,2).join(' ')}</div>
          <div style={{ fontSize:10, color:COLORS.green }}>{i.price_t99cp>0?`${i.price_t99cp} T99CP`:'Gratuit'}</div>
        </div>)}
        <Btn variant="outline" size="sm" style={{ gridColumn:'1/-1' }} full onClick={()=>setActivePage('lending')}>Tous les objets →</Btn>
      </div>
    );
    case 'marketplace': return (
      <div style={{ ...boxStyle, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
        {products.map(p=><div key={p.id} style={{ borderRadius:10, overflow:'hidden', border:`1px solid ${COLORS.gray200}` }}>
          <img src={`https://picsum.photos/seed/product${p.id}/100/80`} style={{ width:'100%', height:60, objectFit:'cover' }} alt="" />
          <div style={{ padding:'4px 6px' }}>
            <div style={{ fontSize:10, fontWeight:600, color:COLORS.gray900, lineHeight:1.2, display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.title}</div>
            <T99 value={p.price_t99cp} size={10} />
          </div>
        </div>)}
        <Btn variant="outline" size="sm" style={{ gridColumn:'1/-1' }} full onClick={()=>setActivePage('marketplace')}>Voir tout →</Btn>
      </div>
    );
    case 'sel': return (
      <div style={{ ...boxStyle, display:'flex', flexDirection:'column', gap:6 }}>
        {selItems.map(s=><div key={s.id} style={{ display:'flex', gap:8, padding:'8px 10px', background:COLORS.gray50, borderRadius:10, alignItems:'center' }}>
          <div style={{ fontSize:20 }}>{'🧘📚🔨'[selItems.indexOf(s)]||'⚙️'}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, fontSize:12, color:COLORS.gray900 }}>{s.service}</div>
            <div style={{ fontSize:11, color:COLORS.gray500 }}>{s.provider} · {s.duration_min} T99CP</div>
          </div>
        </div>)}
        <Btn variant="outline" size="sm" full onClick={()=>setActivePage('sel')}>Tous les services →</Btn>
      </div>
    );
    case 'garden': return (
      <div style={{ ...boxStyle, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
        {garden.map(g=><div key={g.id} style={{ textAlign:'center', padding:'8px 4px', background:'#F0FDF4', borderRadius:10, border:'1px solid #BBF7D0' }}>
          <div style={{ fontSize:24, marginBottom:2 }}>{'🥦🍎🌱'[garden.indexOf(g)]||'🌻'}</div>
          <div style={{ fontSize:10, fontWeight:600, color:'#166534', lineHeight:1.2 }}>{g.item.split('—')[0].trim()}</div>
          <div style={{ fontSize:10, color:g.free?COLORS.green:COLORS.blue }}>{g.free?'Gratuit':`${g.price_t99cp} T99CP`}</div>
        </div>)}
        <Btn variant="success" size="sm" style={{ gridColumn:'1/-1' }} full onClick={()=>setActivePage('garden')}>Voir les surplus →</Btn>
      </div>
    );
    case 'media': return (
      <div style={{ ...boxStyle, display:'flex', flexDirection:'column', gap:8 }}>
        {articles.map(a=><div key={a.id} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
          <img src={`https://picsum.photos/seed/article${a.id}/80/60`} style={{ width:70, height:55, borderRadius:8, objectFit:'cover', flexShrink:0 }} alt="" />
          <div>
            <Badge color="red" style={{ fontSize:9, marginBottom:3 }}>{a.category}</Badge>
            <div style={{ fontWeight:600, fontSize:12, color:COLORS.gray900, lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{a.title}</div>
            <div style={{ fontSize:10, color:COLORS.gray400 }}>{a.author} · {a.reading_time} min</div>
          </div>
        </div>)}
        <Btn variant="outline" size="sm" full onClick={()=>setActivePage('media')}>Tous les articles →</Btn>
      </div>
    );
    case 'cta': return (
      <div style={{ background:GRAD, borderRadius:14, padding:'20px', textAlign:'center', color:'#fff' }}>
        <div style={{ fontSize:32, marginBottom:8 }}>📣</div>
        <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, margin:'0 0 14px', lineHeight:1.5 }}>{campaign.cta_text||'Rejoignez le mouvement !'}</p>
        <Btn variant="white" size="md">{campaign.cta_btn||'Agir maintenant'}</Btn>
      </div>
    );
    case 'stats': return (
      <div style={{ ...boxStyle }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
          {[['📜',AppData.petitions.reduce((a,p)=>a+p.signatures,0).toLocaleString('fr-FR'),'Signatures'],['👥',campaign.supporters?.toLocaleString('fr-FR')||'0','Supporters'],['₮','247','T99CP collectés'],['📅',AppData.mobilizations.length,'Mobilisations']].map(([icon,val,label])=>(
            <div key={label} style={{ background:COLORS.gray50, borderRadius:10, padding:'10px', textAlign:'center' }}>
              <div style={{ fontSize:20, marginBottom:3 }}>{icon}</div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color:COLORS.gray900 }}>{val}</div>
              <div style={{ fontSize:10, color:COLORS.gray400 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    );
    default: return <div style={boxStyle}><EmptyState icon="📦" title="Module" desc={moduleId} /></div>;
  }
}

// ── Drag & Drop Builder ───────────────────────────────────
function CampaignBuilder({ campaign, onSave, onClose, setActivePage }) {
  const [activeModules, setActiveModules] = useState(campaign.modules || ['petition','crowdfunding','mobilizations']);
  const [title, setTitle] = useState(campaign.title || '');
  const [subtitle, setSubtitle] = useState(campaign.subtitle || '');
  const [ctaText, setCtaText] = useState(campaign.cta_text || '');
  const [ctaBtn, setCtaBtn] = useState(campaign.cta_btn || 'Agir maintenant');
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [tab, setTab] = useState('modules'); // modules | settings | preview

  const addModule = (modId) => {
    if (activeModules.length >= 12) return;
    if (!activeModules.includes(modId)) setActiveModules(m=>[...m,modId]);
  };
  const removeModule = (idx) => setActiveModules(m=>m.filter((_,i)=>i!==idx));

  const onDragStart = (e, idx) => { setDragIdx(idx); e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver = (e, idx) => { e.preventDefault(); setDragOver(idx); };
  const onDrop = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOver(null); return; }
    const next = [...activeModules];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    setActiveModules(next);
    setDragIdx(null); setDragOver(null);
  };
  const onDragEnd = () => { setDragIdx(null); setDragOver(null); };

  const updatedCampaign = { ...campaign, title, subtitle, cta_text:ctaText, cta_btn:ctaBtn, modules:activeModules };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:500, display:'flex', alignItems:'stretch', overflow:'hidden' }}>
      {/* Left panel */}
      <div style={{ width:'clamp(280px,35vw,400px)', background:'#fff', display:'flex', flexDirection:'column', boxShadow:'4px 0 20px rgba(0,0,0,0.15)', overflowY:'auto', flexShrink:0 }}>
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${COLORS.gray200}`, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#fff', zIndex:10 }}>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:800, color:COLORS.gray900, margin:0 }}>🚀 Éditeur de campagne</h2>
          <button onClick={onClose} style={{ border:'none', background:COLORS.gray100, borderRadius:'50%', width:30, height:30, cursor:'pointer', fontSize:16, color:COLORS.gray500 }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', padding:'10px 16px', gap:6 }}>
          {[['modules','📦 Modules'],['settings','⚙️ Infos'],['preview','👁️ Aperçu']].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:'7px 4px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:600, fontSize:11, fontFamily:'Inter,sans-serif', background:tab===id?GRAD_R:COLORS.gray100, color:tab===id?'#fff':COLORS.gray600 }}>{label}</button>
          ))}
        </div>

        <div style={{ flex:1, padding:'0 16px 16px', overflow:'auto' }}>
          {tab==='modules' && <>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:COLORS.gray700, marginBottom:8 }}>
                Modules actifs ({activeModules.length}/12)
                <span style={{ fontSize:10, color:COLORS.gray400, fontWeight:400, marginLeft:6 }}>Glissez pour réordonner</span>
              </div>

              {/* Active modules — draggable */}
              <div style={{ display:'flex', flexDirection:'column', gap:6, minHeight:40 }}>
                {activeModules.length === 0 && <div style={{ padding:'16px', textAlign:'center', color:COLORS.gray400, fontSize:12, border:`2px dashed ${COLORS.gray200}`, borderRadius:12 }}>Ajoutez des modules ci-dessous</div>}
                {activeModules.map((modId, idx) => {
                  const mod = ALL_MODULES.find(m=>m.id===modId);
                  if(!mod) return null;
                  return (
                    <div key={`${modId}-${idx}`}
                      draggable onDragStart={e=>onDragStart(e,idx)} onDragOver={e=>onDragOver(e,idx)} onDrop={e=>onDrop(e,idx)} onDragEnd={onDragEnd}
                      style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background: dragOver===idx?`${mod.color}18`:'#fff', border:`1.5px solid ${dragOver===idx?mod.color:COLORS.gray200}`, borderRadius:10, cursor:'grab', transition:'all 0.15s', userSelect:'none' }}>
                      <span style={{ color:COLORS.gray300, fontSize:14, cursor:'grab' }}>⠿</span>
                      <span style={{ fontSize:20 }}>{mod.icon}</span>
                      <span style={{ flex:1, fontWeight:600, fontSize:12, color:COLORS.gray900 }}>{mod.label}</span>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <span style={{ fontSize:11, color:COLORS.gray400, background:COLORS.gray100, padding:'1px 6px', borderRadius:9999 }}>#{idx+1}</span>
                        <button onClick={()=>removeModule(idx)} style={{ border:'none', background:'#FEE2E2', color:'#EF4444', borderRadius:'50%', width:22, height:22, cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop:`1px solid ${COLORS.gray200}`, paddingTop:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:COLORS.gray700, marginBottom:8 }}>Ajouter un module :</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {ALL_MODULES.map(mod=>{
                  const isActive = activeModules.includes(mod.id);
                  const isFull = activeModules.length >= 12;
                  return (
                    <button key={mod.id} onClick={()=>addModule(mod.id)} disabled={isActive||isFull}
                      style={{ padding:'8px', borderRadius:10, border:`1.5px solid ${isActive?mod.color:COLORS.gray200}`, background:isActive?`${mod.color}12`:'#fff', cursor:isActive||isFull?'default':'pointer', opacity:isFull&&!isActive?0.4:1, display:'flex', alignItems:'center', gap:6, transition:'all 0.15s', textAlign:'left', fontFamily:'Inter,sans-serif' }}>
                      <span style={{ fontSize:18 }}>{mod.icon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:11, color:COLORS.gray900, lineHeight:1.2 }}>{mod.label}</div>
                        {isActive && <div style={{ fontSize:9, color:mod.color, fontWeight:600 }}>✓ Actif</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>}

          {tab==='settings' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[{label:'Titre de la campagne',key:'title',val:title,set:setTitle},{label:'Sous-titre',key:'subtitle',val:subtitle,set:setSubtitle},{label:'Texte du bloc CTA',key:'cta',val:ctaText,set:setCtaText},{label:'Bouton CTA',key:'ctabtn',val:ctaBtn,set:setCtaBtn}].map(f=>(
                <div key={f.key}>
                  <label style={{ fontSize:11, fontWeight:600, color:COLORS.gray700, display:'block', marginBottom:4 }}>{f.label}</label>
                  <input value={f.val} onChange={e=>f.set(e.target.value)} style={{ width:'100%', height:40, border:`1.5px solid ${COLORS.gray200}`, borderRadius:10, padding:'0 12px', fontSize:13, fontFamily:'Inter,sans-serif', outline:'none', boxSizing:'border-box' }} />
                </div>
              ))}
            </div>
          )}

          {tab==='preview' && (
            <div style={{ fontSize:12, color:COLORS.gray500, textAlign:'center', padding:'20px 0' }}>
              L'aperçu est visible dans le panneau de droite →
            </div>
          )}
        </div>

        <div style={{ padding:'12px 16px', borderTop:`1px solid ${COLORS.gray200}`, display:'flex', gap:8 }}>
          <Btn variant="gradient" full onClick={()=>{onSave(updatedCampaign);onClose();}}>💾 Enregistrer</Btn>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        </div>
      </div>

      {/* Right panel — Live Preview */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px', background:'#F9FAFB' }}>
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          <div style={{ background:COLORS.amber, color:'#fff', borderRadius:12, padding:'8px 16px', fontSize:12, fontWeight:700, marginBottom:20, display:'inline-flex', alignItems:'center', gap:6 }}>👁️ Aperçu en temps réel — Glissez les modules à gauche pour les réordonner</div>
          <CampaignView campaign={updatedCampaign} setActivePage={setActivePage} preview />
        </div>
      </div>
    </div>
  );
}

// ── Campaign View ─────────────────────────────────────────
function CampaignView({ campaign, setActivePage, preview=false }) {
  return (
    <div>
      {/* Cover */}
      <div style={{ position:'relative', borderRadius:preview?16:0, overflow:'hidden', marginBottom:20 }}>
        <img src={campaign.cover||`https://picsum.photos/seed/${campaign.slug}/1200/300`} style={{ width:'100%', height:200, objectFit:'cover' }} alt="" />
        <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${campaign.color||'#E11D74'}ee 0%, transparent 60%)`, display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'20px 24px' }}>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(18px,3vw,28px)', fontWeight:800, color:'#fff', margin:'0 0 6px', textShadow:'0 2px 8px rgba(0,0,0,0.3)' }}>{campaign.title}</h1>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.85)', margin:'0 0 8px' }}>{campaign.subtitle}</p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <Badge color="gray" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', backdropFilter:'blur(4px)' }}>🏢 {campaign.organizer}</Badge>
            <Badge color="gray" style={{ background:'rgba(255,255,255,0.2)', color:'#fff', backdropFilter:'blur(4px)' }}>👥 {campaign.supporters?.toLocaleString('fr-FR')} supporters</Badge>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {campaign.modules.map((modId,i)=>{
          const mod = ALL_MODULES.find(m=>m.id===modId);
          if(!mod) return null;
          return (
            <div key={`${modId}-${i}`}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:`${mod.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>{mod.icon}</div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:COLORS.gray900, margin:0 }}>{mod.label}</h3>
                <div style={{ flex:1, height:1, background:COLORS.gray200 }}></div>
              </div>
              <ModulePreview moduleId={modId} campaign={campaign} setActivePage={setActivePage} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Campaign Card ─────────────────────────────────────────
function CampaignCard({ campaign, onClick, adminMode, onEdit }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
      style={{ background:'#fff', borderRadius:16, border:`1px solid ${COLORS.gray200}`, overflow:'hidden', cursor:'pointer', transition:'all 0.2s', boxShadow:hov?'0 8px 28px rgba(0,0,0,0.10)':'0 1px 4px rgba(0,0,0,0.04)', transform:hov?'translateY(-2px)':'none', position:'relative' }}>
      {adminMode && <div style={{ position:'absolute', top:8, right:8, zIndex:2 }} onClick={e=>{e.stopPropagation();onEdit();}}><AdminEdit /></div>}
      <div style={{ position:'relative' }}>
        <img src={campaign.cover||`https://picsum.photos/seed/${campaign.slug}/400/180`} style={{ width:'100%', height:160, objectFit:'cover' }} alt="" />
        <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top,${campaign.color||'#E11D74'}cc 0%,transparent 60%)` }}></div>
      </div>
      <div style={{ padding:'14px 16px' }}>
        <div style={{ display:'flex', gap:6, marginBottom:6, flexWrap:'wrap' }}>
          {campaign.modules.slice(0,4).map(m=>{const mod=ALL_MODULES.find(x=>x.id===m);return mod?<span key={m} title={mod.label} style={{ fontSize:16 }}>{mod.icon}</span>:null;})}
          {campaign.modules.length > 4 && <span style={{ fontSize:11, color:COLORS.gray400, alignSelf:'center' }}>+{campaign.modules.length-4}</span>}
        </div>
        <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:COLORS.gray900, margin:'0 0 4px', lineHeight:1.3 }}>{campaign.title}</h3>
        <p style={{ fontSize:12, color:COLORS.gray500, margin:'0 0 8px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{campaign.subtitle}</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12 }}>
          <span style={{ color:COLORS.gray500 }}>🏢 {campaign.organizer}</span>
          <span style={{ fontWeight:700, color:COLORS.red }}>👥 {campaign.supporters?.toLocaleString('fr-FR')}</span>
        </div>
      </div>
    </div>
  );
}

// ── Campaigns List Page ───────────────────────────────────
function CampaignsPage({ user, adminMode, onOpenAuth, setActivePage }) {
  const [campaigns, setCampaigns] = useState(SAMPLE_CAMPAIGNS);
  const [detail, setDetail] = useState(null);
  const [building, setBuilding] = useState(null); // campaign being edited
  const [search, setSearch] = useState('');

  const filtered = campaigns.filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreateNew = () => {
    if (!user) { onOpenAuth(); return; }
    const newCampaign = {
      id: Date.now(), slug: `campagne-${Date.now()}`, title: 'Ma nouvelle campagne', subtitle: 'Description de la campagne',
      cover: `https://picsum.photos/seed/new${Date.now()}/1200/400`,
      organizer: user.name, date: new Date().toISOString().split('T')[0],
      supporters: 0, modules: ['petition','cta'], color: '#E11D74',
      cta_text: 'Rejoignez le mouvement !', cta_btn: 'Agir maintenant',
    };
    setBuilding(newCampaign);
  };

  if (detail && !building) return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'24px 16px 100px' }}>
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <button onClick={()=>setDetail(null)} style={{ display:'flex', alignItems:'center', gap:6, border:'none', background:'transparent', cursor:'pointer', color:COLORS.gray500, fontSize:13, fontWeight:600, padding:0 }}>← Retour aux campagnes</button>
        {(adminMode || detail.organizer===user?.name) && <Btn variant="outline" size="sm" onClick={()=>setBuilding(detail)}>✏️ Modifier la campagne</Btn>}
      </div>
      <CampaignView campaign={detail} setActivePage={setActivePage} />
    </div>
  );

  return (
    <PageWrap title="🚀 Campagnes" subtitle={`${filtered.length} campagnes actives`}
      action={<Btn variant="gradient" size="sm" onClick={handleCreateNew}>🚀 Créer une campagne</Btn>}>
      <div style={{ background:'linear-gradient(to right,#4F46E5,#7C3AED)', borderRadius:14, padding:'14px 18px', marginBottom:24, color:'#fff', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
        <div style={{ fontSize:32 }}>🧩</div>
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, marginBottom:3 }}>Builder de campagne — glissez vos modules</div>
          <div style={{ fontSize:13, opacity:0.85 }}>Agrégez jusqu'à <strong>12 services</strong> de la plateforme : pétitions, cagnottes, hébergements, SEL, covoiturage... dans une page unifiée.</div>
        </div>
        <Btn variant="white" size="sm" style={{ marginLeft:'auto' }} onClick={handleCreateNew}>Créer →</Btn>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une campagne..." />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
        {filtered.map(c=>(
          <CampaignCard key={c.id} campaign={c} onClick={()=>setDetail(c)} adminMode={adminMode}
            onEdit={()=>setBuilding(c)} />
        ))}
      </div>
      {filtered.length===0 && <EmptyState icon="🚀" title="Aucune campagne" desc="Créez la première campagne !" />}

      {building && (
        <CampaignBuilder
          campaign={building}
          setActivePage={setActivePage}
          onSave={(updated)=>{ setCampaigns(cs=>cs.some(c=>c.id===updated.id)?cs.map(c=>c.id===updated.id?updated:c):[...cs,updated]); setDetail(updated); }}
          onClose={()=>setBuilding(null)}
        />
      )}
    </PageWrap>
  );
}
window.CampaignsPage = CampaignsPage;
