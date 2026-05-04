// CommunesLibres.jsx — Espace Adhérents · Communes Libres · Fédérations · Assemblée
// Inspiration : actionpopulaire.fr (typographie forte, blocs plats, palette franche)
const { useState, useMemo } = React;

// ── Sample data ────────────────────────────────────────────
const SAMPLE_COMMUNES = [
  { id:1, name:'Belleville',                 type:'quartier',   location:'Paris 20e',         members:23, founded:'2025-03', description:'Foyer de résistance culturelle et sociale du nord-est parisien. Ateliers, AG hebdomadaires, jardin partagé.', federation_id:1, services:['petitions','sel','media'], coord:[48.872,2.378] },
  { id:2, name:'la Croix-Rousse',            type:'quartier',   location:'Lyon 4e',           members:31, founded:'2025-01', description:'Le plateau militant de Lyon — tisseurs et tisseuses d\'un autre monde.',                                  federation_id:1, services:['petitions','mobilizations','sel'],            coord:[45.778,4.829] },
  { id:3, name:'Notre-Dame-des-Landes',      type:'zad',        location:'Loire-Atlantique',  members:89, founded:'2024-11', description:'La ZAD continue d\'exister et de rayonner. Habitats légers, brigade de défense, cantine.',              federation_id:2, services:['petitions','garden','sel','crowdfunding'],   coord:[47.401,-1.583] },
  { id:4, name:'Confluences',                type:'tiers_lieu', location:'Bordeaux',          members:12, founded:'2026-01', description:'Commune naissante autour du tiers lieu Confluences. Venez nous rejoindre !',                            federation_id:null, services:['sel','media'],                              coord:[44.840,-0.580] },
  { id:5, name:'Montreuil',                  type:'commune',    location:'Montreuil (93)',    members:56, founded:'2025-05', description:'La commune libre de Montreuil, ville militante par excellence.',                                          federation_id:2, services:['petitions','mobilizations','marketplace','sel'], coord:[48.861,2.443] },
  { id:6, name:'Cévennes',                   type:'village',    location:'Gard',              members:8,  founded:'2025-10', description:'Commune libre rurale, agriculture paysanne et solidaire. Marché autogéré le samedi.',                    federation_id:null, services:['garden','sel','lending'],                   coord:[44.000,3.583] },
  { id:7, name:'Arnaud-Bernard',             type:'quartier',   location:'Toulouse',          members:19, founded:'2025-08', description:'Quartier populaire et militant de Toulouse.',                                                            federation_id:3, services:['petitions','sel','reseau'],                   coord:[43.608,1.439] },
  { id:8, name:'du Vieux-Port',              type:'quartier',   location:'Marseille',         members:44, founded:'2025-02', description:'Commune libre du cœur de Marseille, plurielle et combative.',                                            federation_id:3, services:['petitions','crowdfunding','media'],          coord:[43.295,5.374] },
];

const SAMPLE_FEDERATIONS = [
  { id:1, name:'Île-de-France & Rhône-Alpes', short:'IDF–RA',  communes:[1,2], description:'Fédération inter-régionale Paris-Lyon, pour construire des luttes communes.', created:'2025-04', confederation_id:1 },
  { id:2, name:'Grand Ouest',                 short:'OUEST',   communes:[3,5], description:'Les communes libres de l\'Ouest fédérées autour des luttes rurales et urbaines.', created:'2025-06', confederation_id:1 },
  { id:3, name:'Grand Sud',                   short:'SUD',     communes:[7,8], description:'Toulouse et Marseille unies pour une fédération du Grand Sud militant.',           created:'2025-09', confederation_id:1 },
];

const SAMPLE_CONFEDERATION = {
  id:1, name:'Confédération Nationale des Communes et Territoires Libres',
  federations:[1,2,3], communes_directes:[4,6],
  description:'Rassemble toutes les communes libres et fédérations de la plateforme Maintenant! Organise l\'Assemblée Confédérale.',
  created:'2025-12',
};

const TYPE_LABELS = { quartier:'Quartier', commune:'Commune', village:'Village', zad:'ZAD', tiers_lieu:'Tiers-Lieu' };
const TYPE_GLYPHS = { quartier:'▣', commune:'◉', village:'◈', zad:'◐', tiers_lieu:'◆' };

const ALL_SERVICES = [
  { id:'petitions',     label:'Pétitions',     desc:'Signer et créer des pétitions',                 cat:'mobilisation' },
  { id:'mobilizations', label:'Mobilisations', desc:'Marches, AG, actions directes',                 cat:'mobilisation' },
  { id:'crowdfunding',  label:'Cagnottes',     desc:'Caisses de lutte et collectes',                 cat:'mobilisation' },
  { id:'media',         label:'Média',         desc:'Articles et tribune locale',                    cat:'mobilisation' },
  { id:'reseau',        label:'Réseau social', desc:'Fil d\'actualité de la commune',                cat:'mobilisation' },
  { id:'sel',           label:'SEL',           desc:'Système d\'échange local en heures',            cat:'entraide' },
  { id:'garden',        label:'Jardins',       desc:'Échange de fruits et légumes',                  cat:'entraide' },
  { id:'lending',       label:'Ki Prête Tout', desc:'Prêt d\'objets entre voisins',                  cat:'entraide' },
  { id:'carpooling',    label:'Covoiturage',   desc:'Trajets partagés solidaires',                   cat:'entraide' },
  { id:'housing',       label:'Hébergement',   desc:'Logement militant et accueil',                  cat:'entraide' },
  { id:'marketplace',   label:'Marketplace',   desc:'Don et seconde main de proximité',              cat:'entraide' },
];

// ═══════════════════════════════════════════════════════════
// 1. VERROU D'ADHÉSION — Page d'accueil pour non-adhérents
// ═══════════════════════════════════════════════════════════
function MembershipGate({ user, onAuth, setPage }) {
  return (
    <div style={{ background:T.bg, minHeight:'100vh' }}>
      {/* Bandeau jaune Action Populaire */}
      <div style={{ background:'#FFD93D', borderBottom:'3px solid #1A1A18', padding:'10px 24px', textAlign:'center', fontWeight:700, fontSize:13, color:'#1A1A18', letterSpacing:'-0.01em' }}>
        ★ Espace réservé aux adhérent·es du mouvement Maintenant !
      </div>

      <div style={{ background:'#1A1A18', color:'#fff', padding:'clamp(48px,8vw,96px) 24px', borderBottom:`6px solid ${T.brand}` }}>
        <div style={{ maxWidth:920, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:'#FFD93D', marginBottom:24, textTransform:'uppercase' }}>
            ━━━ Communes Libres · Confédération
          </div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(34px,6vw,72px)', fontWeight:800, margin:'0 0 24px', letterSpacing:'-0.04em', lineHeight:0.95 }}>
            Pour entrer dans<br/>
            <span style={{ color:T.brand }}>l'espace adhérent,</span><br/>
            il faut adhérer.
          </h1>
          <p style={{ fontSize:'clamp(16px,2vw,20px)', color:'rgba(255,255,255,0.75)', lineHeight:1.55, margin:'0 0 36px', maxWidth:680, fontWeight:300 }}>
            Avoir un profil utilisateur ne fait pas de vous un·e adhérent·e. L'adhésion est un <strong style={{ color:'#FFD93D', fontWeight:700 }}>geste politique</strong> : nom, email, code postal, et cotisation — gratuite, en T99CP ou en euros.
          </p>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            <button onClick={() => user ? setPage('join') : onAuth()} style={{ background:T.brand, color:'#fff', border:'none', padding:'18px 32px', fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:800, letterSpacing:'-0.01em', cursor:'pointer', textTransform:'uppercase', boxShadow:'4px 4px 0 #FFD93D', transition:'all 0.15s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translate(-2px,-2px)'; e.currentTarget.style.boxShadow='6px 6px 0 #FFD93D'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='4px 4px 0 #FFD93D'; }}>
              ► Adhérer maintenant
            </button>
            <button onClick={() => setPage('home')} style={{ background:'transparent', color:'#fff', border:'1.5px solid rgba(255,255,255,0.3)', padding:'18px 28px', fontFamily:'Inter,sans-serif', fontSize:15, fontWeight:600, cursor:'pointer' }}>
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>

      {/* Pourquoi adhérer */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'72px 24px' }}>
        <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.brand, marginBottom:14, textTransform:'uppercase' }}>━ L'adhésion ouvre des droits</div>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(28px,4vw,44px)', fontWeight:800, color:T.text1, margin:'0 0 48px', letterSpacing:'-0.03em', lineHeight:1.05, maxWidth:780 }}>
          Ce que vous obtenez en devenant<br/>adhérent·e du mouvement
        </h2>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:0, border:`2px solid ${T.text1}` }}>
          {[
            { num:'01', t:'Rejoindre une commune libre', d:'Participez à la commune de votre quartier, village, ZAD ou tiers lieu — ou créez la vôtre.' },
            { num:'02', t:'Représenter votre territoire', d:'Dès 5 membres, votre commune envoie un binôme à l\'Assemblée Confédérale.' },
            { num:'03', t:'Tirage au sort', d:'Vous pouvez être tiré·e au sort pour siéger à la 2ᵉ chambre de l\'Assemblée.' },
            { num:'04', t:'Se fédérer librement', d:'Avec d\'autres communes voisines, créez fédérations et confédérations territoriales.' },
          ].map((it,i)=>(
            <div key={it.num} style={{ padding:'28px 26px', borderRight:i<3?`2px solid ${T.text1}`:'none', background:'#fff' }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:48, fontWeight:800, color:T.brand, lineHeight:1, marginBottom:14, letterSpacing:'-0.04em' }}>{it.num}</div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:700, color:T.text1, marginBottom:8, letterSpacing:'-0.01em' }}>{it.t}</div>
              <div style={{ fontSize:13, color:T.text3, lineHeight:1.55 }}>{it.d}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:48, background:'#FFD93D', border:`2px solid ${T.text1}`, padding:'28px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:T.text1, letterSpacing:'-0.02em', marginBottom:4 }}>3 formules d'adhésion</div>
            <div style={{ fontSize:14, color:T.text2, fontWeight:500 }}>Gratuit · 12 T99CP/an · 12 €/an via Stripe</div>
          </div>
          <button onClick={() => user ? setPage('join') : onAuth()} style={{ background:T.text1, color:'#fff', border:'none', padding:'16px 28px', fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.04em' }}>
            Adhérer ►
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 2. CARTE D'UNE COMMUNE — style éditorial
// ═══════════════════════════════════════════════════════════
function CommuneCard({ c, onClick }) {
  const fed = SAMPLE_FEDERATIONS.find(f => f.id === c.federation_id);
  const repr = c.members >= 5;
  return (
    <div onClick={onClick} style={{ background:'#fff', border:`2px solid ${T.text1}`, padding:'22px 22px 18px', cursor:'pointer', transition:'all 0.15s', position:'relative' }}
      onMouseEnter={e=>{ e.currentTarget.style.transform='translate(-3px,-3px)'; e.currentTarget.style.boxShadow=`6px 6px 0 ${T.brand}`; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14, gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, background:T.text1, color:'#FFD93D', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{TYPE_GLYPHS[c.type]}</div>
          <div>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.12em', color:T.brand, textTransform:'uppercase' }}>{TYPE_LABELS[c.type]}</div>
            <div style={{ fontSize:11, color:T.text4, marginTop:2 }}>{c.location}</div>
          </div>
        </div>
        {repr && <div style={{ background:'#FFD93D', color:T.text1, fontSize:9, fontWeight:800, padding:'4px 8px', letterSpacing:'0.08em' }}>★ REPR.</div>}
      </div>

      <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:T.text1, margin:'0 0 8px', lineHeight:1.1, letterSpacing:'-0.02em' }}>
        Commune Libre<br/>de {c.name}
      </h3>
      <p style={{ fontSize:13, color:T.text3, margin:'0 0 16px', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{c.description}</p>

      <div style={{ borderTop:`1.5px solid ${T.text1}`, paddingTop:12, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
          <span style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:T.text1, letterSpacing:'-0.02em' }}>{c.members}</span>
          <span style={{ fontSize:11, color:T.text3, fontWeight:500 }}>membre{c.members>1?'s':''}</span>
          {!repr && <span style={{ fontSize:11, color:T.brand, fontWeight:600, marginLeft:6 }}>· {5-c.members} pour la repr.</span>}
        </div>
        {fed && <div style={{ fontSize:10, fontWeight:700, color:T.text2, padding:'3px 8px', border:`1.5px solid ${T.text1}`, letterSpacing:'0.04em' }}>FÉD. {fed.short}</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 3. ESPACE DÉDIÉ D'UNE COMMUNE — page complète avec services
// ═══════════════════════════════════════════════════════════
function CommuneSpace({ c, onBack, user, isAdminCommune=true }) {
  const fed = SAMPLE_FEDERATIONS.find(f => f.id === c.federation_id);
  const [tab, setTab] = useState('actu');
  const [services, setServices] = useState(c.services || []);
  const [editServices, setEditServices] = useState(false);
  const repr = c.members >= 5;

  return (
    <div style={{ background:T.bg, minHeight:'100vh' }}>
      {/* Bandeau breadcrumb */}
      <div style={{ background:T.text1, color:'rgba(255,255,255,0.7)', padding:'10px 24px', fontSize:12, fontWeight:600 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', gap:6 }}>
          <button onClick={onBack} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontWeight:600, padding:0, fontSize:12 }}>← Communes Libres</button>
          <span style={{ color:'rgba(255,255,255,0.4)' }}>/</span>
          {fed && <><span>Féd. {fed.short}</span><span style={{ color:'rgba(255,255,255,0.4)' }}>/</span></>}
          <span style={{ color:'#FFD93D' }}>Commune Libre de {c.name}</span>
        </div>
      </div>

      {/* HÉRO commune — éditorial fort */}
      <div style={{ background:T.text1, color:'#fff', padding:'clamp(40px,6vw,72px) 24px', borderBottom:`6px solid ${T.brand}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:24, alignItems:'flex-start' }} className="mn-detail-grid">
            <div style={{ width:80, height:80, background:'#FFD93D', color:T.text1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:42, flexShrink:0 }}>{TYPE_GLYPHS[c.type]}</div>
            <div>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:'#FFD93D', marginBottom:14, textTransform:'uppercase' }}>━ {TYPE_LABELS[c.type]} · {c.location}</div>
              <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(32px,5vw,60px)', fontWeight:800, margin:'0 0 14px', letterSpacing:'-0.04em', lineHeight:0.95 }}>
                Commune Libre<br/>
                <span style={{ color:T.brand }}>de {c.name}</span>
              </h1>
              <p style={{ fontSize:'clamp(14px,1.6vw,17px)', color:'rgba(255,255,255,0.75)', lineHeight:1.55, margin:0, maxWidth:680, fontWeight:300 }}>{c.description}</p>
            </div>
            <div style={{ flexShrink:0, textAlign:'right' }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:64, fontWeight:800, color:'#fff', lineHeight:0.9, letterSpacing:'-0.04em' }}>{c.members}</div>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:6 }}>membres</div>
              <div style={{ marginTop:14, padding:'8px 12px', background:repr?'#FFD93D':T.brand, color:repr?T.text1:'#fff', fontSize:11, fontWeight:800, letterSpacing:'0.04em' }}>
                {repr ? '★ DROIT À REPRÉSENTATION' : `${5-c.members} POUR REPRÉSENTATION`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ background:'#fff', borderBottom:`2px solid ${T.text1}`, position:'sticky', top:64, zIndex:50 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'flex', gap:0, overflowX:'auto' }}>
          {[
            ['actu',     'Actualité'],
            ['services', `Services (${services.length})`],
            ['membres',  `Membres (${c.members})`],
            ['agora',    'Agora'],
            ['assemblee','Assemblée'],
          ].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ padding:'18px 22px', border:'none', background:'transparent', cursor:'pointer', fontWeight:tab===id?800:600, fontSize:13, fontFamily:"'Sora',sans-serif", color:tab===id?T.brand:T.text2, borderBottom:`3px solid ${tab===id?T.brand:'transparent'}`, marginBottom:-2, whiteSpace:'nowrap', letterSpacing:'-0.01em' }}>{label.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'36px 24px 100px' }}>

        {/* ─── ACTUALITÉ ─── */}
        {tab==='actu' && (
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 320px', gap:32 }} className="mn-reseau-grid">
            <div>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.brand, marginBottom:14, textTransform:'uppercase' }}>━ Fil d'actualité de la commune</div>
              {[
                { author:'Marie D.', role:'Coordinatrice', date:'il y a 2h',   t:'AG hebdomadaire ce jeudi 19h',     d:`Salle des fêtes du quartier. Ordre du jour : préparation de la mobilisation du 1er mai, point sur la cagnotte solidaire, et présentation de la nouvelle commune voisine de ${c.location}.` },
                { author:'Thomas R.', role:'Membre',        date:'hier',       t:'Le marché autogéré reprend dimanche', d:'On cherche des bras pour décharger les cagettes à 8h. Café et croissants offerts. Inscription dans le service SEL pour comptabiliser les heures.' },
                { author:'Aisha K.',  role:'Binôme repr.',  date:'il y a 3j',  t:'Compte-rendu Assemblée Confédérale', d:'Notre binôme a porté la motion sur les ZAD agricoles. Adoptée à 78%. Le compte-rendu intégral est dans l\'espace Agora.' },
              ].map((p,i)=>(
                <div key={i} style={{ background:'#fff', border:`2px solid ${T.text1}`, padding:'22px 24px', marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                    <Avatar name={p.author} size={36} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:T.text1 }}>{p.author}</div>
                      <div style={{ fontSize:11, color:T.text4 }}>{p.role} · {p.date}</div>
                    </div>
                  </div>
                  <h4 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, margin:'0 0 6px', letterSpacing:'-0.02em' }}>{p.t}</h4>
                  <p style={{ fontSize:14, color:T.text2, margin:0, lineHeight:1.55 }}>{p.d}</p>
                </div>
              ))}
            </div>

            <aside>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.brand, marginBottom:14, textTransform:'uppercase' }}>━ La commune en bref</div>
              <div style={{ background:'#fff', border:`2px solid ${T.text1}`, padding:'18px 20px', marginBottom:14 }}>
                {[
                  ['Type', TYPE_LABELS[c.type]],
                  ['Lieu', c.location],
                  ['Fondée', c.founded],
                  ['Fédération', fed?.name || 'Indépendante'],
                  ['Représentation', repr?'Oui (≥5 membres)':'Non (<5)'],
                  ['Services actifs', `${services.length} sur ${ALL_SERVICES.length}`],
                ].map(([l,v])=>(
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:`1px solid ${T.border}`, fontSize:13 }}>
                    <span style={{ color:T.text4, fontWeight:500 }}>{l}</span>
                    <span style={{ color:T.text1, fontWeight:700, textAlign:'right', maxWidth:'60%' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ background:'#FFD93D', border:`2px solid ${T.text1}`, padding:'18px 20px' }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:800, color:T.text1, letterSpacing:'-0.01em', marginBottom:6 }}>Prochaine AG</div>
                <div style={{ fontSize:13, color:T.text2, marginBottom:12, lineHeight:1.5 }}>Jeudi 7 mai, 19h<br/>Salle des fêtes du quartier</div>
                <button style={{ background:T.text1, color:'#fff', border:'none', width:'100%', padding:'10px', fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:800, cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase' }}>Je participe ►</button>
              </div>
            </aside>
          </div>
        )}

        {/* ─── SERVICES (sélection comme espace Campagnes) ─── */}
        {tab==='services' && (
          <div>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, gap:16, flexWrap:'wrap' }}>
              <div>
                <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.brand, marginBottom:8, textTransform:'uppercase' }}>━ Services de la plateforme</div>
                <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(22px,3vw,32px)', fontWeight:800, color:T.text1, margin:0, letterSpacing:'-0.03em', lineHeight:1.1, maxWidth:560 }}>
                  Activez les outils dont la commune a besoin
                </h2>
              </div>
              {isAdminCommune && (
                <button onClick={()=>setEditServices(!editServices)} style={{ background:editServices?T.brand:T.text1, color:'#fff', border:'none', padding:'12px 20px', fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:800, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.06em', flexShrink:0 }}>
                  {editServices ? '✓ Terminer' : '✎ Modifier la sélection'}
                </button>
              )}
            </div>

            {['mobilisation','entraide'].map(cat=>(
              <div key={cat} style={{ marginBottom:32 }}>
                <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', color:T.text3, marginBottom:14, textTransform:'uppercase' }}>
                  ━━ {cat==='mobilisation'?'Information & Mobilisation':'Commerce & Entraide'}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:0, border:`2px solid ${T.text1}` }}>
                  {ALL_SERVICES.filter(s=>s.cat===cat).map((s,i,arr)=>{
                    const active = services.includes(s.id);
                    return (
                      <div key={s.id} onClick={()=>{ if(editServices){ setServices(p=>p.includes(s.id)?p.filter(x=>x!==s.id):[...p,s.id]); } }}
                        style={{ padding:'18px 20px', background:active?'#FFD93D':'#fff', borderRight:`2px solid ${T.text1}`, borderBottom:`2px solid ${T.text1}`, cursor:editServices?'pointer':'default', position:'relative', transition:'all 0.15s', minHeight:120 }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:800, color:T.text1, letterSpacing:'-0.01em' }}>{s.label}</div>
                          <div style={{ width:22, height:22, border:`2px solid ${T.text1}`, background:active?T.text1:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            {active && <span style={{ color:'#FFD93D', fontSize:14, fontWeight:800, lineHeight:1 }}>✓</span>}
                          </div>
                        </div>
                        <div style={{ fontSize:12, color:T.text2, lineHeight:1.5 }}>{s.desc}</div>
                        {active && !editServices && <div style={{ position:'absolute', top:8, left:8, fontSize:9, fontWeight:800, color:T.text1, letterSpacing:'0.08em' }}>★ ACTIF</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ background:T.text1, color:'#fff', padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
              <div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, letterSpacing:'-0.01em' }}>{services.length} service{services.length>1?'s':''} sélectionné{services.length>1?'s':''}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginTop:4 }}>Identique au système des espaces Campagnes — la commune aspire les services qu'elle veut depuis la plateforme.</div>
              </div>
              {editServices && <button onClick={()=>setEditServices(false)} style={{ background:'#FFD93D', color:T.text1, border:'none', padding:'14px 24px', fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.06em' }}>Enregistrer ►</button>}
            </div>
          </div>
        )}

        {/* ─── MEMBRES ─── */}
        {tab==='membres' && (
          <div>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.brand, marginBottom:14, textTransform:'uppercase' }}>━ Adhérent·es de la commune</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:0, border:`2px solid ${T.text1}` }}>
              {Array.from({length:Math.min(c.members,12)},(_,i)=>{
                const data = [
                  { n:'Marie D.',  r:'Coordinatrice',  b:true,  pc:'75020' },
                  { n:'Thomas R.', r:'Binôme repr.',   b:true,  pc:'75020' },
                  { n:'Aisha K.',  r:'Binôme repr.',   b:true,  pc:'75019' },
                  { n:'Omar B.',   r:'Trésorier',     b:false, pc:'75020' },
                  { n:'Clara F.',  r:'Membre',        b:false, pc:'75020' },
                  { n:'Lucas M.',  r:'Membre',        b:false, pc:'75019' },
                  { n:'Nina P.',   r:'Membre',        b:false, pc:'75020' },
                  { n:'Antoine G.',r:'Membre',        b:false, pc:'75011' },
                  { n:'Sophie L.', r:'Membre',        b:false, pc:'75020' },
                  { n:'Karim Z.',  r:'Membre',        b:false, pc:'75019' },
                  { n:'Élise V.',  r:'Membre',        b:false, pc:'75020' },
                  { n:'Pierre N.', r:'Membre',        b:false, pc:'75020' },
                ][i] || { n:`Membre ${i+1}`, r:'Membre', b:false, pc:'—' };
                return (
                  <div key={i} style={{ padding:'18px 20px', background:'#fff', borderRight:`2px solid ${T.text1}`, borderBottom:`2px solid ${T.text1}`, display:'flex', alignItems:'center', gap:12 }}>
                    <Avatar name={data.n} size={40} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:T.text1 }}>{data.n}</div>
                      <div style={{ fontSize:11, color:T.text4, marginTop:2 }}>{data.r} · {data.pc}</div>
                    </div>
                    {data.b && <div style={{ width:18, height:18, background:'#FFD93D', color:T.text1, fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>★</div>}
                  </div>
                );
              })}
            </div>
            {c.members > 12 && <div style={{ textAlign:'center', padding:'16px', fontSize:13, color:T.text3, fontWeight:600 }}>+ {c.members-12} autres adhérent·es</div>}
          </div>
        )}

        {/* ─── AGORA ─── */}
        {tab==='agora' && (
          <div>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.brand, marginBottom:14, textTransform:'uppercase' }}>━ Agora · Délibérations & motions</div>
            {[
              { t:'Motion : Fédération avec la Commune Libre voisine ?', votes:18, total:23, status:'En cours', d:'5j restants' },
              { t:'Compte-rendu de l\'AG du 24 avril',                   votes:23, total:23, status:'Adoptée',   d:'il y a 1 sem.' },
              { t:'Budget participatif 2026 — propositions',            votes:11, total:23, status:'En cours',  d:'12j restants' },
            ].map((m,i)=>(
              <div key={i} style={{ background:'#fff', border:`2px solid ${T.text1}`, padding:'22px 26px', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:240 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.1em', padding:'3px 8px', background:m.status==='Adoptée'?T.success:'#FFD93D', color:m.status==='Adoptée'?'#fff':T.text1 }}>{m.status.toUpperCase()}</span>
                    <span style={{ fontSize:11, color:T.text4, fontWeight:600 }}>{m.d}</span>
                  </div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:700, color:T.text1, letterSpacing:'-0.01em' }}>{m.t}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:T.text1, lineHeight:1, letterSpacing:'-0.02em' }}>{m.votes}<span style={{ color:T.text4, fontSize:14 }}>/{m.total}</span></div>
                  <div style={{ fontSize:10, color:T.text4, fontWeight:600, marginTop:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>votes</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── ASSEMBLÉE ─── */}
        {tab==='assemblee' && (
          <div>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.brand, marginBottom:14, textTransform:'uppercase' }}>━ Représentation à l'Assemblée Confédérale</div>
            <div style={{ background:repr?'#FFD93D':T.surface2, border:`2px solid ${T.text1}`, padding:'28px 32px', marginBottom:20 }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(22px,3vw,32px)', fontWeight:800, color:T.text1, margin:'0 0 10px', letterSpacing:'-0.03em', lineHeight:1.1 }}>
                {repr ? '★ Votre commune dispose d\'un binôme à l\'Assemblée' : `Encore ${5-c.members} adhérent·es pour avoir le droit à représentation`}
              </div>
              <p style={{ fontSize:14, color:T.text2, margin:0, lineHeight:1.6 }}>
                {repr
                  ? `Marie D. et Thomas R. représentent la Commune Libre de ${c.name} à l'Assemblée Confédérale des Communes et Territoires Libres. Le binôme est paritaire et tournant tous les 6 mois.`
                  : `Le seuil de représentation est de 5 membres. Invitez vos voisin·es à rejoindre la commune libre pour atteindre ce seuil et envoyer un binôme à l'Assemblée.`}
              </p>
            </div>
            {fed && (
              <div style={{ background:'#fff', border:`2px solid ${T.text1}`, padding:'24px 28px' }}>
                <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', color:T.brand, marginBottom:8, textTransform:'uppercase' }}>━ Fédération d'appartenance</div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:T.text1, letterSpacing:'-0.02em', marginBottom:6 }}>Fédération {fed.name}</div>
                <div style={{ fontSize:13, color:T.text3, lineHeight:1.55 }}>{fed.description}</div>
                <div style={{ marginTop:12, display:'inline-block', padding:'6px 12px', border:`1.5px solid ${T.text1}`, fontSize:11, fontWeight:700, letterSpacing:'0.06em', color:T.text1 }}>+ 1 BINÔME SUPPLÉMENTAIRE PORTÉ PAR LA FÉDÉRATION</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 4. ESPACE DÉDIÉ D'UNE FÉDÉRATION
// ═══════════════════════════════════════════════════════════
function FederationSpace({ f, communes, onBack, onOpenCommune }) {
  const [tab, setTab] = useState('communes');
  const memberCommunes = communes.filter(c => f.communes.includes(c.id));
  const totalMembers = memberCommunes.reduce((a,c)=>a+c.members,0);
  const reprCount = memberCommunes.filter(c=>c.members>=5).length;

  return (
    <div style={{ background:T.bg, minHeight:'100vh' }}>
      <div style={{ background:T.text1, color:'rgba(255,255,255,0.7)', padding:'10px 24px', fontSize:12, fontWeight:600 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', gap:6 }}>
          <button onClick={onBack} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontWeight:600, padding:0, fontSize:12 }}>← Fédérations</button>
          <span style={{ color:'rgba(255,255,255,0.4)' }}>/</span>
          <span style={{ color:'#FFD93D' }}>Fédération {f.name}</span>
        </div>
      </div>

      <div style={{ background:'#0369A1', color:'#fff', padding:'clamp(40px,6vw,72px) 24px', borderBottom:`6px solid #FFD93D` }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:'#FFD93D', marginBottom:14, textTransform:'uppercase' }}>━ Fédération de communes libres</div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(32px,5vw,60px)', fontWeight:800, margin:'0 0 16px', letterSpacing:'-0.04em', lineHeight:0.95 }}>
            Fédération<br/><span style={{ color:'#FFD93D' }}>{f.name}</span>
          </h1>
          <p style={{ fontSize:'clamp(14px,1.6vw,17px)', color:'rgba(255,255,255,0.8)', lineHeight:1.55, margin:'0 0 28px', maxWidth:680, fontWeight:300 }}>{f.description}</p>
          <div style={{ display:'flex', gap:0, border:'2px solid #fff' }}>
            {[['Communes',memberCommunes.length],['Adhérents',totalMembers],['Avec repr.',reprCount],['Binôme féd.','+1']].map(([l,v],i)=>(
              <div key={l} style={{ padding:'16px 24px', borderRight:i<3?'2px solid rgba(255,255,255,0.4)':'none', flex:1 }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:800, color:'#fff', lineHeight:1, letterSpacing:'-0.03em' }}>{v}</div>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.7)', marginTop:6, letterSpacing:'0.08em', textTransform:'uppercase' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:'#fff', borderBottom:`2px solid ${T.text1}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'flex' }}>
          {[['communes','Communes membres'],['actions','Actions communes'],['agora','Agora fédérale']].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ padding:'18px 22px', border:'none', background:'transparent', cursor:'pointer', fontWeight:tab===id?800:600, fontSize:13, fontFamily:"'Sora',sans-serif", color:tab===id?T.brand:T.text2, borderBottom:`3px solid ${tab===id?T.brand:'transparent'}`, marginBottom:-2, letterSpacing:'-0.01em' }}>{label.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'36px 24px 100px' }}>
        {tab==='communes' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
            {memberCommunes.map(c=><CommuneCard key={c.id} c={c} onClick={()=>onOpenCommune(c)} />)}
          </div>
        )}
        {tab==='actions' && (
          <div>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.brand, marginBottom:14, textTransform:'uppercase' }}>━ Actions menées en commun</div>
            {[
              { t:'Mobilisation inter-communes du 1er Mai',           d:'Cortège commun à Paris et Lyon. Trains affrétés depuis chaque commune.', date:'1ᵉʳ mai 2026' },
              { t:'Caisse de solidarité fédérale',                    d:'Cagnotte commune pour soutenir les militant·es poursuivi·es.', date:'En cours · 4 832 €' },
              { t:'Plateforme média partagée',                        d:'Articles co-rédigés par les communes membres, diffusés via le service Média.', date:'Permanent' },
            ].map((a,i)=>(
              <div key={i} style={{ background:'#fff', border:`2px solid ${T.text1}`, padding:'22px 26px', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
                <div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, letterSpacing:'-0.02em', marginBottom:4 }}>{a.t}</div>
                  <div style={{ fontSize:13, color:T.text3, lineHeight:1.5 }}>{a.d}</div>
                </div>
                <div style={{ background:'#FFD93D', color:T.text1, padding:'8px 14px', fontSize:11, fontWeight:800, letterSpacing:'0.04em' }}>{a.date}</div>
              </div>
            ))}
          </div>
        )}
        {tab==='agora' && (
          <div style={{ background:'#fff', border:`2px solid ${T.text1}`, padding:'40px 32px', textAlign:'center' }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:T.text1, letterSpacing:'-0.02em', marginBottom:10 }}>Agora fédérale</div>
            <p style={{ fontSize:14, color:T.text3, margin:0, maxWidth:520, marginLeft:'auto', marginRight:'auto', lineHeight:1.6 }}>Espace de délibération entre les binômes des communes membres. Motions, votes inter-communes et coordination des actions.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 5. ESPACE CONFÉDÉRATION
// ═══════════════════════════════════════════════════════════
function ConfederationSpace({ communes, federations, onOpenFed, onOpenCommune }) {
  const totalMembers = communes.reduce((a,c)=>a+c.members,0);
  return (
    <div>
      <div style={{ background:T.text1, color:'#fff', padding:'48px 32px', marginBottom:32, borderLeft:`8px solid ${T.brand}` }}>
        <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:'#FFD93D', marginBottom:12, textTransform:'uppercase' }}>━ Confédération nationale</div>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(26px,4vw,42px)', fontWeight:800, margin:'0 0 14px', letterSpacing:'-0.03em', lineHeight:1.05 }}>{SAMPLE_CONFEDERATION.name}</h2>
        <p style={{ fontSize:15, color:'rgba(255,255,255,0.75)', margin:0, lineHeight:1.6, maxWidth:720, fontWeight:300 }}>{SAMPLE_CONFEDERATION.description}</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:0, border:`2px solid ${T.text1}`, marginBottom:32 }}>
        {[
          ['Fédérations', federations.length, T.brand],
          ['Communes',    communes.length,    '#0369A1'],
          ['Adhérents',   totalMembers,       T.text1],
          ['Binômes',     communes.filter(c=>c.members>=5).length+federations.length+1, '#7C3AED'],
        ].map(([l,v,col],i,arr)=>(
          <div key={l} style={{ padding:'24px 22px', borderRight:i<arr.length-1?`2px solid ${T.text1}`:'none', background:'#fff' }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:42, fontWeight:800, color:col, lineHeight:1, letterSpacing:'-0.03em' }}>{v}</div>
            <div style={{ fontSize:11, fontWeight:700, color:T.text2, marginTop:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.brand, marginBottom:14, textTransform:'uppercase' }}>━ Fédérations membres de la confédération</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:0, border:`2px solid ${T.text1}`, marginBottom:32 }}>
        {federations.map((f,i,arr)=>{
          const memberCount = f.communes.reduce((a,cid)=>a+(communes.find(c=>c.id===cid)?.members||0),0);
          return (
            <div key={f.id} onClick={()=>onOpenFed(f)} style={{ padding:'22px 24px', background:'#fff', borderRight:`2px solid ${T.text1}`, borderBottom:i<arr.length-1?`2px solid ${T.text1}`:'none', cursor:'pointer', transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#FEF8E0'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ background:'#0369A1', color:'#fff', padding:'4px 8px', fontSize:10, fontWeight:800, letterSpacing:'0.06em' }}>FÉD. {f.short}</div>
              </div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:T.text1, letterSpacing:'-0.02em', marginBottom:6 }}>Fédération {f.name}</div>
              <div style={{ fontSize:13, color:T.text3, marginBottom:14, lineHeight:1.5 }}>{f.description}</div>
              <div style={{ display:'flex', gap:14, fontSize:12, fontWeight:700, color:T.text2 }}>
                <span><strong style={{ color:T.text1, fontSize:14 }}>{f.communes.length}</strong> communes</span>
                <span><strong style={{ color:T.text1, fontSize:14 }}>{memberCount}</strong> adhérents</span>
                <span style={{ color:T.brand }}>+ 1 binôme féd.</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background:'#FFD93D', border:`2px solid ${T.text1}`, padding:'24px 28px' }}>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, letterSpacing:'-0.02em', marginBottom:8 }}>Comment ça fonctionne ?</div>
        <p style={{ fontSize:13, color:T.text2, margin:0, lineHeight:1.65 }}>
          Chaque <strong>commune</strong> de 5+ membres → 1 binôme à l'Assemblée. Chaque <strong>fédération</strong> (2+ communes) → 1 binôme supplémentaire. La <strong>confédération</strong> elle-même → 1 binôme. Plus la 2ᵉ chambre tirée au sort parmi tou·tes les adhérent·es.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 6. ASSEMBLÉE CONFÉDÉRALE
// ═══════════════════════════════════════════════════════════
function AssembleeView({ communes, federations }) {
  const reprCommunes = communes.filter(c=>c.members>=5);
  const tirage = useMemo(()=>{
    const names = ['Sophie L.','Karim Z.','Marie D.','Thomas R.','Aisha K.','Omar B.','Clara F.','Lucas M.','Nina P.','Antoine G.'];
    return names.map((n,i)=>({ name:n, commune: communes[i%communes.length]?.name, pc:['75020','69004','44130','33000','93100','30270'][i%6] }));
  },[]);

  return (
    <div>
      <div style={{ background:T.text1, color:'#fff', padding:'48px 32px', marginBottom:32, borderLeft:`8px solid ${T.brand}` }}>
        <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:'#FFD93D', marginBottom:12, textTransform:'uppercase' }}>━ Démocratie directe · 2 chambres</div>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(26px,4vw,46px)', fontWeight:800, margin:'0 0 14px', letterSpacing:'-0.03em', lineHeight:1 }}>
          Assemblée Confédérale<br/>des Communes &<br/>Territoires Libres
        </h2>
        <div style={{ display:'flex', gap:12, marginTop:24, flexWrap:'wrap' }}>
          <div style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.25)', padding:'10px 16px', fontSize:13 }}>
            <strong style={{ color:'#FFD93D', letterSpacing:'-0.01em' }}>Prochaine session</strong> · 1ᵉʳ juin 2026, 19h
          </div>
          <div style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.25)', padding:'10px 16px', fontSize:13 }}>
            <strong style={{ color:'#FFD93D', letterSpacing:'-0.01em' }}>Format</strong> · Visio + retranscription
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, border:`2px solid ${T.text1}` }} className="mn-detail-grid">
        {/* 1ère Chambre */}
        <div style={{ background:'#fff', borderRight:`2px solid ${T.text1}` }}>
          <div style={{ background:T.brand, color:'#fff', padding:'18px 22px', borderBottom:`2px solid ${T.text1}` }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', color:'#FFD93D', marginBottom:4 }}>━ 1ᵉʳᵉ CHAMBRE</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, letterSpacing:'-0.02em' }}>Représentants élus</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.85)', marginTop:6 }}>1 binôme par commune (≥5), fédération, confédération</div>
          </div>
          <div>
            {[
              ...reprCommunes.map(c=>({ name:c.name, type:'COMMUNE', loc:c.location, binome:['Marie D.','Thomas R.'] })),
              ...federations.map(f=>({ name:f.short, type:'FÉDÉRATION', loc:f.name, binome:['Aisha K.','Omar B.'] })),
              { name:'Confédération', type:'CONFÉD.', loc:'Nationale', binome:['Élise V.','Pierre N.'] },
            ].slice(0,8).map((r,i)=>(
              <div key={i} style={{ padding:'14px 22px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ fontSize:9, fontWeight:800, color:T.text1, padding:'3px 6px', border:`1.5px solid ${T.text1}`, letterSpacing:'0.06em', flexShrink:0, minWidth:74, textAlign:'center' }}>{r.type}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:T.text1, letterSpacing:'-0.01em' }}>{r.name}</div>
                  <div style={{ fontSize:11, color:T.text4 }}>{r.loc}</div>
                </div>
                <div style={{ display:'flex', gap:4 }}>{r.binome.map(n=><Avatar key={n} name={n} size={26} />)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2ème Chambre */}
        <div style={{ background:'#fff' }}>
          <div style={{ background:'#7C3AED', color:'#fff', padding:'18px 22px', borderBottom:`2px solid ${T.text1}` }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', color:'#FDE047', marginBottom:4 }}>━ 2ᵉ CHAMBRE</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, letterSpacing:'-0.02em' }}>Tirage au sort</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.85)', marginTop:6 }}>Parmi l'ensemble des adhérent·es</div>
          </div>
          <div style={{ background:'#F5F3FF', padding:'14px 22px', borderBottom:`1px solid ${T.border}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#7C3AED' }}>★ Prochain tirage : 1ᵉʳ juin 2026 · 10 sièges parmi 946 adhérent·es</div>
          </div>
          {tirage.slice(0,8).map((m,i)=>(
            <div key={i} style={{ padding:'14px 22px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:12 }}>
              <Avatar name={m.name} size={32} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14, color:T.text1 }}>{m.name}</div>
                <div style={{ fontSize:11, color:T.text4 }}>Tiré·e au sort · {m.commune}</div>
              </div>
              <div style={{ fontSize:9, fontWeight:800, color:'#7C3AED', padding:'3px 6px', background:'#F5F3FF', border:'1.5px solid #DDD6FE', letterSpacing:'0.08em' }}>{m.pc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fonctionnement */}
      <div style={{ marginTop:32, background:'#FFD93D', border:`2px solid ${T.text1}`, padding:'28px 32px' }}>
        <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.text1, marginBottom:14, textTransform:'uppercase' }}>━ Fonctionnement de l'Assemblée</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:18 }}>
          {[
            ['Sessions',  'Mensuelle en visio + assemblée physique annuelle, lieu choisi par rotation entre les fédérations.'],
            ['Décisions', 'Délibération conjointe des deux chambres. Majorité requise dans chacune pour les décisions structurelles.'],
            ['Mandats',   'Binômes paritaires, tournants tous les 6 mois. Tirage au sort renouvelé tous les 4 mois.'],
            ['Motions',   'Toute commune ou adhérent·e tiré·e au sort peut déposer une motion. Débat 2 semaines avant le vote.'],
          ].map(([l,d])=>(
            <div key={l}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:800, color:T.text1, marginBottom:6, letterSpacing:'-0.01em' }}>{l}</div>
              <div style={{ fontSize:13, color:T.text2, lineHeight:1.55 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 7. PAGE PRINCIPALE — Hub de l'espace adhérent
// ═══════════════════════════════════════════════════════════
function EspaceAdherents({ user, onAuth, setPage }) {
  const isMember = user && user.is_member;

  // VERROU : non-connecté ou non-adhérent → page Gate
  if (!isMember) return <MembershipGate user={user} onAuth={onAuth} setPage={setPage} />;

  const [tab, setTab] = useState('communes');
  const [communeOpen, setCommuneOpen] = useState(null);
  const [fedOpen, setFedOpen] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [newCommune, setNewCommune] = useState({ name:'', type:'quartier', location:'', description:'' });

  const [communes, setCommunes] = useState(SAMPLE_COMMUNES);
  const [federations, setFederations] = useState([...window.getUserCreations('federations'), ...SAMPLE_FEDERATIONS]);
  const [createFedOpen, setCreateFedOpen] = useState(false);

  if (communeOpen) return <CommuneSpace c={communeOpen} onBack={()=>setCommuneOpen(null)} user={user} />;
  if (fedOpen) return <FederationSpace f={fedOpen} communes={communes} onBack={()=>setFedOpen(null)} onOpenCommune={c=>{ setFedOpen(null); setCommuneOpen(c); }} />;

  const filtered = communes.filter(c => {
    const mt = typeFilter==='Tous' || c.type===typeFilter;
    const ms = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase());
    return mt && ms;
  });

  const myCommune = communes.find(c => c.id===1);
  const myFed = federations.find(f => f.id===myCommune?.federation_id);

  return (
    <div style={{ background:T.bg, minHeight:'100vh' }}>
      {/* Bandeau jaune adhérent */}
      <div style={{ background:'#FFD93D', borderBottom:`3px solid ${T.text1}`, padding:'10px 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, fontWeight:700, color:T.text1, letterSpacing:'-0.01em' }}>
            ★ <span>Espace adhérent · {user.name} · Adhérent·e depuis {user.member_since||user.joined||'2025'}</span>
          </div>
          <div style={{ fontSize:11, fontWeight:700, color:T.text1, opacity:0.7, letterSpacing:'0.04em' }}>COTISATION : 12 T99CP/AN · ACTIVE</div>
        </div>
      </div>

      {/* HÉRO */}
      <div style={{ background:T.text1, color:'#fff', padding:'clamp(48px,7vw,84px) 24px', borderBottom:`6px solid ${T.brand}` }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:'#FFD93D', marginBottom:24, textTransform:'uppercase' }}>━━━ Communes Libres · Fédérations · Confédération · Assemblée</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:32, alignItems:'flex-end' }} className="mn-detail-grid">
            <div>
              <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(36px,7vw,84px)', fontWeight:800, margin:'0 0 18px', letterSpacing:'-0.045em', lineHeight:0.92 }}>
                L'auto-organisation<br/>
                <span style={{ color:T.brand }}>de la base</span><br/>
                au territoire.
              </h1>
              <p style={{ fontSize:'clamp(15px,1.8vw,19px)', color:'rgba(255,255,255,0.75)', lineHeight:1.55, margin:0, maxWidth:680, fontWeight:300 }}>
                Une personne suffit pour <strong style={{ color:'#FFD93D', fontWeight:700 }}>créer</strong> une commune libre. Cinq pour la <strong style={{ color:'#FFD93D', fontWeight:700 }}>représenter</strong>. Voisines elles se <strong style={{ color:'#FFD93D', fontWeight:700 }}>fédèrent</strong>. Ensemble elles <strong style={{ color:'#FFD93D', fontWeight:700 }}>confédèrent</strong> les territoires.
              </p>
            </div>
            <button onClick={()=>setShowCreate(true)} style={{ background:T.brand, color:'#fff', border:'none', padding:'20px 32px', fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.04em', boxShadow:'4px 4px 0 #FFD93D', flexShrink:0, transition:'all 0.15s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translate(-2px,-2px)'; e.currentTarget.style.boxShadow='6px 6px 0 #FFD93D'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='4px 4px 0 #FFD93D'; }}>
              + Créer<br/>une commune
            </button>
          </div>
        </div>
      </div>

      {/* Stats nationales */}
      <div style={{ background:'#fff', borderBottom:`2px solid ${T.text1}` }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))' }}>
          {[
            ['Adhérents',     '946'],
            ['Communes',      communes.length],
            ['Fédérations',   federations.length],
            ['Confédérations','1'],
            ['Binômes',        communes.filter(c=>c.members>=5).length+federations.length+1],
          ].map(([l,v],i,arr)=>(
            <div key={l} style={{ padding:'24px 22px', borderRight:i<arr.length-1?`1px solid ${T.border}`:'none' }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:36, color:T.brand, lineHeight:1, letterSpacing:'-0.03em' }}>{v}</div>
              <div style={{ fontSize:11, fontWeight:700, color:T.text2, marginTop:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Onglets principaux */}
      <div style={{ background:'#fff', borderBottom:`2px solid ${T.text1}`, position:'sticky', top:64, zIndex:50 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', display:'flex', overflowX:'auto' }}>
          {[
            ['communes',     'Communes libres'],
            ['federations',  'Fédérations'],
            ['confederation','Confédération'],
            ['assemblee',    'Assemblée'],
            ['mon',          'Mon espace'],
          ].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ padding:'18px 22px', border:'none', background:'transparent', cursor:'pointer', fontWeight:tab===id?800:600, fontSize:13, fontFamily:"'Sora',sans-serif", color:tab===id?T.brand:T.text2, borderBottom:`3px solid ${tab===id?T.brand:'transparent'}`, marginBottom:-2, whiteSpace:'nowrap', letterSpacing:'-0.01em' }}>{label.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'36px 24px 100px' }}>

        {/* ─── COMMUNES ─── */}
        {tab==='communes' && <>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
            <div style={{ flex:1, minWidth:240 }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Chercher une commune libre, un quartier, une ville..."
                style={{ width:'100%', height:48, padding:'0 16px', fontSize:14, fontFamily:'Inter,sans-serif', border:`2px solid ${T.text1}`, background:'#fff', outline:'none' }} />
            </div>
            <button onClick={()=>setShowCreate(true)} style={{ background:T.text1, color:'#fff', border:'none', padding:'14px 22px', fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.06em' }}>+ Créer une commune</button>
          </div>

          <div style={{ display:'flex', gap:0, marginBottom:20, border:`2px solid ${T.text1}`, overflowX:'auto' }}>
            {[['Tous','TOUTES'],['quartier','QUARTIERS'],['commune','COMMUNES'],['village','VILLAGES'],['zad','ZAD'],['tiers_lieu','TIERS-LIEUX']].map(([k,l],i,arr)=>(
              <button key={k} onClick={()=>setTypeFilter(k)} style={{ flex:1, padding:'12px 16px', border:'none', background:typeFilter===k?T.text1:'#fff', color:typeFilter===k?'#FFD93D':T.text2, cursor:'pointer', fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:800, letterSpacing:'0.08em', whiteSpace:'nowrap', borderRight:i<arr.length-1?`2px solid ${T.text1}`:'none' }}>{l}</button>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))', gap:16 }}>
            {filtered.map(c=><CommuneCard key={c.id} c={c} onClick={()=>setCommuneOpen(c)} />)}
          </div>
          {filtered.length===0 && (
            <div style={{ textAlign:'center', padding:'60px 24px', background:'#fff', border:`2px solid ${T.text1}` }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:T.text1, letterSpacing:'-0.02em', marginBottom:8 }}>Aucune commune trouvée</div>
              <div style={{ fontSize:14, color:T.text3, marginBottom:20 }}>Créez la première commune libre de votre territoire !</div>
              <button onClick={()=>setShowCreate(true)} style={{ background:T.brand, color:'#fff', border:'none', padding:'14px 22px', fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.06em' }}>+ Créer une commune libre</button>
            </div>
          )}
        </>}

        {/* ─── FÉDÉRATIONS ─── */}
        {tab==='federations' && <>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, gap:16, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.brand, marginBottom:8, textTransform:'uppercase' }}>━ Communes voisines en accord</div>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(24px,3.5vw,36px)', fontWeight:800, color:T.text1, margin:0, letterSpacing:'-0.03em', lineHeight:1.05, maxWidth:600 }}>
                Les fédérations agrègent<br/>les communes alliées
              </h2>
            </div>
            <button onClick={()=>setCreateFedOpen(true)} style={{ background:T.text1, color:'#fff', border:'none', padding:'14px 22px', fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.06em', flexShrink:0, whiteSpace:'nowrap' }}>+ Créer une fédération</button>
          </div>

          <window.CreateModal open={createFedOpen} onClose={()=>setCreateFedOpen(false)} title="Créer une fédération de communes"
            subtitle="Une fédération naît de l'accord d'au moins 2 communes libres voisines. Elle a son propre espace et envoie 1 binôme représentatif à l'Assemblée Confédérale."
            color={T.brand}
            fields={[
              { id:'name',         label:'Nom de la fédération', required:true, placeholder:"Fédération du Vallon" },
              { id:'territoire',   label:'Territoire couvert', required:true, placeholder:"Vallée de la Dordogne" },
              { id:'description',  label:'Présentation', type:'textarea', rows:3, required:true, placeholder:"Pourquoi cette fédération ? Quels sont ses combats communs ?" },
              { id:'communesText', label:'Communes fondatrices (une par ligne)', type:'textarea', rows:3, required:true, placeholder:"Commune libre de Beynac\nCommune libre de La Roque-Gageac", hint:'Minimum 2 communes signataires' },
              { id:'principles',   label:'Principes de la fédération', type:'textarea', rows:2, placeholder:"Démocratie directe, autonomie communale, mandats impératifs..." },
            ]}
            onSubmit={item => {
              const list = (item.communesText||'').split('\n').map(s=>s.trim()).filter(Boolean);
              if (list.length < 2) { window.showToast?.('Une fédération nécessite au moins 2 communes', { type:'error' }); return; }
              const enriched = {
                id: `u_fed_${Date.now()}`, _userCreated: true,
                name: item.name, territoire: item.territoire, description: item.description,
                principles: item.principles,
                communesNames: list, communes: [], // ids vides — créations user
                creation: new Date().toISOString().slice(0,10),
                hasRepresentation: true,
              };
              const arr = [enriched, ...window.getUserCreations('federations')];
              try { localStorage.setItem('mn_user_federations', JSON.stringify(arr)); } catch {}
              setFederations(f => [enriched, ...f]);
              window.showToast?.(`Fédération « ${enriched.name} » créée !`, { type:'success', icon:'★' });
            }}
          />

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:0, border:`2px solid ${T.text1}`, marginBottom:32 }}>
            {federations.map((f,i,arr)=>{
              const memberCommunes = communes.filter(c=>f.communes.includes(c.id));
              const totalMembers = memberCommunes.reduce((a,c)=>a+c.members,0);
              return (
                <div key={f.id} onClick={()=>setFedOpen(f)} style={{ padding:'24px', background:'#fff', borderRight:`2px solid ${T.text1}`, borderBottom:i<arr.length-1?`2px solid ${T.text1}`:'none', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='#FEF8E0'; }} onMouseLeave={e=>{ e.currentTarget.style.background='#fff'; }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                    <div style={{ background:'#0369A1', color:'#fff', padding:'4px 10px', fontSize:10, fontWeight:800, letterSpacing:'0.08em' }}>FÉDÉRATION</div>
                    <div style={{ background:T.text1, color:'#FFD93D', padding:'4px 10px', fontSize:10, fontWeight:800, letterSpacing:'0.08em' }}>{f.short}</div>
                  </div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:T.text1, letterSpacing:'-0.02em', marginBottom:8 }}>Fédération<br/>{f.name}</div>
                  <p style={{ fontSize:13, color:T.text3, lineHeight:1.55, margin:'0 0 14px' }}>{f.description}</p>
                  <div style={{ display:'flex', gap:12, alignItems:'baseline' }}>
                    <span><strong style={{ fontFamily:"'Sora',sans-serif", color:T.text1, fontSize:18, letterSpacing:'-0.02em' }}>{f.communes.length}</strong> <span style={{ fontSize:11, color:T.text4, fontWeight:600 }}>communes</span></span>
                    <span><strong style={{ fontFamily:"'Sora',sans-serif", color:T.text1, fontSize:18, letterSpacing:'-0.02em' }}>{totalMembers}</strong> <span style={{ fontSize:11, color:T.text4, fontWeight:600 }}>adhérents</span></span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background:T.surface2, border:`2px solid ${T.text1}`, padding:'24px 28px' }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, letterSpacing:'-0.02em', marginBottom:8 }}>Comment se fédèrent les communes ?</div>
            <p style={{ fontSize:13, color:T.text2, margin:0, lineHeight:1.65 }}>
              L'accord de <strong>2 communes libres ou plus</strong> suffit. La fédération obtient son propre espace dédié sur la plateforme et un binôme supplémentaire à l'Assemblée. Les fédérations peuvent elles-mêmes se regrouper en confédérations territoriales.
            </p>
          </div>
        </>}

        {/* ─── CONFÉDÉRATION ─── */}
        {tab==='confederation' && <ConfederationSpace communes={communes} federations={federations} onOpenFed={f=>setFedOpen(f)} onOpenCommune={c=>setCommuneOpen(c)} />}

        {/* ─── ASSEMBLÉE ─── */}
        {tab==='assemblee' && <AssembleeView communes={communes} federations={federations} />}

        {/* ─── MON ESPACE ─── */}
        {tab==='mon' && <>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24 }} className="mn-detail-grid">
            <div style={{ background:T.text1, color:'#fff', border:`2px solid ${T.text1}`, padding:'28px 30px' }}>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', color:'#FFD93D', marginBottom:14 }}>━ MA CARTE D'ADHÉRENT·E</div>
              <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:24 }}>
                <Avatar name={user?.name||'U'} size={64} />
                <div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:24, letterSpacing:'-0.02em' }}>{user?.name}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginTop:2 }}>{user?.email}</div>
                </div>
              </div>
              {[['Code postal',user?.postal_code||'75020'],['Adhérent·e depuis',user?.member_since||'2025-06-12'],['Cotisation','12 T99CP / an'],['Statut','★ Actif·ve']].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.1)', fontSize:13 }}>
                  <span style={{ color:'rgba(255,255,255,0.55)', fontWeight:500 }}>{l}</span>
                  <span style={{ fontWeight:700, color:'#fff' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:20, fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:800, color:'#FFD93D', letterSpacing:'0.12em' }}>★ MAINTENANT — THE99COINPROJECT ★</div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:0, border:`2px solid ${T.text1}` }}>
              {[
                { label:'Ma commune libre', desc:`Commune Libre de ${myCommune?.name}`, action:()=>setCommuneOpen(myCommune), bg:'#FFD93D' },
                { label:'Ma fédération',     desc:myFed?`Fédération ${myFed.name}`:'Aucune', action:()=>myFed&&setFedOpen(myFed), bg:'#fff' },
                { label:'Prochaine Assemblée', desc:'1ᵉʳ juin 2026, 19h — visio',        action:()=>setTab('assemblee'), bg:'#fff' },
                { label:'Renouveler l\'adhésion', desc:'Expire le 1ᵉʳ janvier 2027',     action:()=>setPage('join'), bg:'#fff' },
              ].map((it,i,arr)=>(
                <div key={it.label} onClick={it.action} style={{ background:it.bg, padding:'22px 24px', borderBottom:i<arr.length-1?`2px solid ${T.text1}`:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                  <div>
                    <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, color:T.text1, letterSpacing:'-0.01em' }}>{it.label}</div>
                    <div style={{ fontSize:13, color:T.text3, marginTop:4 }}>{it.desc}</div>
                  </div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:T.text1 }}>►</div>
                </div>
              ))}
            </div>
          </div>
        </>}
      </div>

      {/* MODAL CRÉER UNE COMMUNE */}
      {showCreate && (
        <div style={{ position:'fixed', inset:0, background:'rgba(26,26,24,0.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={()=>setShowCreate(false)}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', border:`2px solid ${T.text1}`, maxWidth:540, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ background:T.text1, color:'#fff', padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`2px solid ${T.text1}` }}>
              <div>
                <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', color:'#FFD93D', marginBottom:4 }}>━ NOUVELLE COMMUNE LIBRE</div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, letterSpacing:'-0.02em' }}>Créer une commune</div>
              </div>
              <button onClick={()=>setShowCreate(false)} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', width:32, height:32, cursor:'pointer', fontSize:18, fontWeight:600 }}>×</button>
            </div>
            <div style={{ padding:'24px' }}>
              <div style={{ background:'#FFD93D', padding:'14px 16px', marginBottom:18, borderLeft:`4px solid ${T.text1}` }}>
                <div style={{ fontSize:13, fontWeight:600, color:T.text1, lineHeight:1.55 }}>
                  <strong>1 personne suffit</strong> pour créer une commune libre. À <strong>5 membres</strong>, elle envoie un binôme à l'Assemblée Confédérale.
                </div>
              </div>
              {[
                {key:'name',label:'Nom du lieu',placeholder:'Ex: Belleville, Notre-Dame-des-Landes',helper:'Sera affiché : « Commune Libre de [nom] »'},
                {key:'location',label:'Localisation',placeholder:'Ex: Paris 20e, Loire-Atlantique'},
                {key:'description',label:'Description',placeholder:'Décrivez votre commune libre, vos luttes, votre territoire…'},
              ].map(f=>(
                <div key={f.key} style={{ marginBottom:16 }}>
                  <label style={{ fontSize:11, fontWeight:800, color:T.text1, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>{f.label}</label>
                  {f.key==='description'
                    ? <textarea value={newCommune[f.key]} onChange={e=>setNewCommune(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} rows={3} style={{ width:'100%', border:`2px solid ${T.text1}`, padding:'12px 14px', fontSize:14, fontFamily:'Inter,sans-serif', color:T.text1, background:'#fff', outline:'none', boxSizing:'border-box', resize:'vertical' }} />
                    : <input value={newCommune[f.key]} onChange={e=>setNewCommune(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{ width:'100%', height:46, border:`2px solid ${T.text1}`, padding:'0 14px', fontSize:14, fontFamily:'Inter,sans-serif', color:T.text1, background:'#fff', outline:'none', boxSizing:'border-box' }} />}
                  {f.helper && <div style={{ fontSize:11, color:T.text4, marginTop:4 }}>{f.helper}</div>}
                </div>
              ))}
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, fontWeight:800, color:T.text1, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>Type de territoire</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:0, border:`2px solid ${T.text1}` }}>
                  {Object.entries(TYPE_LABELS).map(([k,v],i,arr)=>(
                    <button key={k} onClick={()=>setNewCommune(p=>({...p,type:k}))} style={{ padding:'12px 6px', border:'none', borderRight:i<arr.length-1?`2px solid ${T.text1}`:'none', background:newCommune.type===k?'#FFD93D':'#fff', cursor:'pointer', fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:800, color:T.text1, letterSpacing:'0.04em' }}>
                      <div style={{ fontSize:18, marginBottom:2 }}>{TYPE_GLYPHS[k]}</div>
                      <div>{v}</div>
                    </button>
                  ))}
                </div>
              </div>
              <button disabled={!newCommune.name||!newCommune.location} onClick={()=>{
                setCommunes(cs=>[...cs,{id:Date.now(),name:newCommune.name,type:newCommune.type,location:newCommune.location,members:1,founded:new Date().toISOString().split('T')[0].slice(0,7),description:newCommune.description||'Nouvelle commune libre.',federation_id:null,services:[]}]);
                setShowCreate(false);
                setNewCommune({name:'',type:'quartier',location:'',description:''});
              }} style={{ background:newCommune.name&&newCommune.location?T.brand:T.text4, color:'#fff', border:'none', width:'100%', padding:'18px', fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, cursor:newCommune.name&&newCommune.location?'pointer':'not-allowed', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                ★ Fonder cette commune libre ►
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.EspaceAdherents = EspaceAdherents;
window.CommunesLibresPage = EspaceAdherents;
