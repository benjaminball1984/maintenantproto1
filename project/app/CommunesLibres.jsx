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
// ═══════════════════════════════════════════════════════════
// CARTE INTERACTIVE — France métropolitaine en SVG, markers par commune
// Projection simple lat/lon → x/y. Cliquer sur un marker ouvre la commune.
// ═══════════════════════════════════════════════════════════
function CommunesMap({ communes, federations, onOpenCommune, onOpenFed }) {
  const [hover, setHover] = useState(null);
  const [selectedFed, setSelectedFed] = useState(null);
  // Bounding box France métropolitaine : lat [41.3, 51.1], lon [-5.2, 9.6]
  const W = 540, H = 540;
  const project = (lat, lon) => {
    const x = ((lon - (-5.2)) / (9.6 - (-5.2))) * W;
    const y = H - ((lat - 41.3) / (51.1 - 41.3)) * H;
    return [x, y];
  };
  // Outline France très simplifiée (suffisant pour l'effet visuel)
  const FRANCE_PATH = "M 230 30 Q 280 25 320 35 L 380 50 Q 420 70 440 110 L 460 160 Q 470 220 460 280 L 480 340 Q 500 390 470 430 L 430 470 Q 390 490 340 495 L 280 510 Q 220 510 180 480 L 130 440 Q 90 400 80 340 L 70 280 Q 70 220 90 170 L 120 120 Q 150 80 200 50 Z";

  return (
    <div style={{ background:'#fff', border:`2px solid ${T.text1}`, padding:'24px', position:'relative' }}>
      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 280px', gap:24, alignItems:'flex-start' }} className="mn-detail-grid">
        {/* SVG France */}
        <div style={{ position:'relative', width:'100%', maxWidth:W, margin:'0 auto', aspectRatio:'1 / 1' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'100%', display:'block' }}>
            <defs>
              <pattern id="hatching" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#FFD93D" strokeWidth="1.5" opacity="0.18" />
              </pattern>
            </defs>
            {/* Hexagone France */}
            <path d={FRANCE_PATH} fill="url(#hatching)" stroke={T.text1} strokeWidth="2.5" strokeLinejoin="round" />

            {/* Liens fédération : trait entre communes d'une même fédé */}
            {federations.map(f => {
              const comms = communes.filter(c => f.communes.includes(c.id) && c.coord);
              if (comms.length < 2) return null;
              return comms.slice(0, -1).map((c1, i) => {
                const c2 = comms[i + 1];
                const [x1, y1] = project(c1.coord[0], c1.coord[1]);
                const [x2, y2] = project(c2.coord[0], c2.coord[1]);
                return (
                  <line key={`${f.id}-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={selectedFed === f.id ? '#0369A1' : T.brand}
                    strokeWidth={selectedFed === f.id ? 3 : 1.5}
                    strokeDasharray={selectedFed === f.id ? '0' : '4,3'}
                    opacity={selectedFed && selectedFed !== f.id ? 0.15 : 0.6} />
                );
              });
            })}

            {/* Markers communes */}
            {communes.filter(c => c.coord).map(c => {
              const [x, y] = project(c.coord[0], c.coord[1]);
              const repr = c.members >= 5;
              const isHover = hover === c.id;
              const dim = selectedFed && c.federation_id !== selectedFed;
              const r = isHover ? 14 : (repr ? 10 : 7);
              return (
                <g key={c.id} style={{ cursor:'pointer', opacity: dim ? 0.25 : 1, transition:'opacity 0.18s' }}
                   onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)}
                   onClick={() => onOpenCommune(c)}>
                  {repr && <circle cx={x} cy={y} r={r + 6} fill="none" stroke={T.brand} strokeWidth="1.5" opacity="0.4" />}
                  <circle cx={x} cy={y} r={r} fill={repr ? T.brand : '#fff'} stroke={T.text1} strokeWidth="2" />
                  {repr && <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff" style={{ pointerEvents:'none' }}>★</text>}
                  {isHover && (
                    <g style={{ pointerEvents:'none' }}>
                      <rect x={x + 14} y={y - 26} width={Math.max(c.name.length * 6.5 + 28, 100)} height="24" fill={T.text1} rx="2" />
                      <text x={x + 22} y={y - 10} fontSize="11" fontWeight="700" fill="#FFD93D" fontFamily="Inter,sans-serif">{c.name}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Panneau légende + filtre fédération */}
        <div>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', color:T.brand, marginBottom:10, textTransform:'uppercase' }}>━ Légende</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:12, color:T.text2 }}>
              <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="6" fill="#fff" stroke={T.text1} strokeWidth="2" /></svg>
              <span>Commune naissante (&lt; 5 membres)</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:12, color:T.text2 }}>
              <svg width="22" height="22" viewBox="0 0 22 22">
                <circle cx="11" cy="11" r="9" fill="none" stroke={T.brand} strokeWidth="1.5" opacity="0.4" />
                <circle cx="11" cy="11" r="6" fill={T.brand} stroke={T.text1} strokeWidth="2" />
                <text x="11" y="14" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">★</text>
              </svg>
              <span>Commune avec représentation (≥ 5 membres)</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:12, color:T.text2 }}>
              <svg width="22" height="22" viewBox="0 0 22 22"><line x1="3" y1="11" x2="19" y2="11" stroke={T.brand} strokeWidth="1.5" strokeDasharray="4,3" /></svg>
              <span>Lien de fédération</span>
            </div>
          </div>

          <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', color:T.brand, marginBottom:10, textTransform:'uppercase' }}>━ Filtrer par fédération</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <button onClick={() => setSelectedFed(null)} style={{ padding:'10px 12px', border:`1.5px solid ${T.text1}`, background: !selectedFed ? T.text1 : '#fff', color: !selectedFed ? '#FFD93D' : T.text1, fontSize:11, fontWeight:800, cursor:'pointer', textAlign:'left', fontFamily:"'Sora',sans-serif", letterSpacing:'0.04em' }}>TOUTES LES COMMUNES</button>
            {federations.map(f => (
              <button key={f.id} onClick={() => setSelectedFed(selectedFed === f.id ? null : f.id)} style={{ padding:'10px 12px', border:`1.5px solid ${T.text1}`, background: selectedFed === f.id ? '#0369A1' : '#fff', color: selectedFed === f.id ? '#fff' : T.text1, fontSize:11, fontWeight:700, cursor:'pointer', textAlign:'left', fontFamily:'Inter,sans-serif', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                <span>FÉD. {f.short}</span>
                <span style={{ opacity:0.7 }}>{f.communes.length} communes</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop:18, padding:'12px 14px', background:'#FFD93D', fontSize:11, color:T.text1, lineHeight:1.55, fontWeight:600 }}>
            💡 Clique sur un marker pour ouvrir la commune.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TRÉSORERIE COMMUNE — cotisations, recettes, dépenses, solde
// ═══════════════════════════════════════════════════════════
function CommuneTreasury({ commune: c }) {
  // Données simulées calculées depuis la commune
  const cotisationAnnuelle = 12; // T99CP / membre / an
  const totalCotisations = c.members * cotisationAnnuelle;
  const recettes = [
    { date:'2026-04-01', label:'Cotisations annuelles', amount: totalCotisations, type:'cotisation' },
    { date:'2026-03-15', label:'Don Marie D. (membre)', amount: 50, type:'don' },
    { date:'2026-02-20', label:'Reversement cagnotte solidaire', amount: 120, type:'don' },
    { date:'2026-02-10', label:'Cotisation tardive 2025', amount: 24, type:'cotisation' },
  ];
  const depenses = [
    { date:'2026-04-12', label:'Location salle AG hebdo (avril)', amount: 30, cat:'Salle' },
    { date:'2026-04-08', label:'Achat matériel ronéo (encre, papier)', amount: 18, cat:'Matériel' },
    { date:'2026-04-05', label:'Repas solidaire 1ᵉʳ Mai (avance)', amount: 80, cat:'Événement' },
    { date:'2026-03-22', label:'Cagnotte ZAD voisine', amount: 50, cat:'Solidarité' },
    { date:'2026-03-10', label:'Frais d\'impression tracts', amount: 22, cat:'Matériel' },
  ];
  const totalRecettes = recettes.reduce((s,r) => s + r.amount, 0);
  const totalDepenses = depenses.reduce((s,d) => s + d.amount, 0);
  const solde = totalRecettes - totalDepenses;
  // Stats par catégorie
  const catTotals = {};
  depenses.forEach(d => { catTotals[d.cat] = (catTotals[d.cat] || 0) + d.amount; });
  const catColors = { 'Salle':'#0369A1', 'Matériel':'#7C3AED', 'Événement':T.brand, 'Solidarité':'#16A34A' };

  return (
    <div>
      <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.brand, marginBottom:14, textTransform:'uppercase' }}>━ Trésorerie de la commune · 100 % transparente</div>

      {/* Bandeau solde */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:0, border:`2px solid ${T.text1}`, marginBottom:24 }}>
        {[
          ['Solde actuel',     `${solde} T99CP`,        solde >= 0 ? T.success : T.brand],
          ['Recettes (an)',    `+${totalRecettes} T99CP`, T.text1],
          ['Dépenses (an)',    `-${totalDepenses} T99CP`, T.text1],
          ['Cotisant·es',      `${c.members}/${c.members}`, T.text1],
        ].map(([l,v,col],i,arr) => (
          <div key={l} style={{ padding:'24px 22px', background:'#fff', borderRight:i<arr.length-1?`2px solid ${T.text1}`:'none' }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:800, color:col, lineHeight:1, letterSpacing:'-0.03em' }}>{v}</div>
            <div style={{ fontSize:11, fontWeight:700, color:T.text2, marginTop:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, border:`2px solid ${T.text1}`, marginBottom:24 }} className="mn-detail-grid">
        {/* RECETTES */}
        <div style={{ borderRight:`2px solid ${T.text1}` }}>
          <div style={{ background:T.success, color:'#fff', padding:'14px 20px', borderBottom:`2px solid ${T.text1}` }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', marginBottom:2 }}>━ RECETTES</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, letterSpacing:'-0.02em' }}>+{totalRecettes} T99CP</div>
          </div>
          <div style={{ background:'#fff' }}>
            {recettes.map((r,i)=>(
              <div key={i} style={{ padding:'14px 20px', borderBottom:i<recettes.length-1?`1px solid ${T.border}`:'none', display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:T.text1 }}>{r.label}</div>
                  <div style={{ fontSize:11, color:T.text4, marginTop:2 }}>{new Date(r.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })} · {r.type}</div>
                </div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, color:T.success, letterSpacing:'-0.01em', whiteSpace:'nowrap' }}>+{r.amount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* DÉPENSES */}
        <div>
          <div style={{ background:T.brand, color:'#fff', padding:'14px 20px', borderBottom:`2px solid ${T.text1}` }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', marginBottom:2 }}>━ DÉPENSES</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, letterSpacing:'-0.02em' }}>-{totalDepenses} T99CP</div>
          </div>
          <div style={{ background:'#fff' }}>
            {depenses.map((d,i)=>(
              <div key={i} style={{ padding:'14px 20px', borderBottom:i<depenses.length-1?`1px solid ${T.border}`:'none', display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:T.text1 }}>{d.label}</div>
                  <div style={{ fontSize:11, color:T.text4, marginTop:2, display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:8, height:8, background:catColors[d.cat] || T.text3, display:'inline-block' }}></span>
                    {new Date(d.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })} · {d.cat}
                  </div>
                </div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, color:T.brand, letterSpacing:'-0.01em', whiteSpace:'nowrap' }}>-{d.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Répartition dépenses */}
      <div style={{ background:'#fff', border:`2px solid ${T.text1}`, padding:'22px 24px', marginBottom:20 }}>
        <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.text1, marginBottom:14, textTransform:'uppercase' }}>━ Répartition des dépenses par poste</div>
        <div style={{ display:'flex', height:18, border:`1.5px solid ${T.text1}`, marginBottom:14 }}>
          {Object.entries(catTotals).map(([cat, amt]) => (
            <div key={cat} title={`${cat} : ${amt} T99CP`} style={{ background: catColors[cat], width:`${(amt / totalDepenses) * 100}%` }}></div>
          ))}
        </div>
        <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
          {Object.entries(catTotals).map(([cat, amt]) => (
            <div key={cat} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:T.text2 }}>
              <span style={{ width:14, height:14, background:catColors[cat] }}></span>
              <span><strong style={{ color:T.text1 }}>{cat}</strong> · {amt} T99CP ({((amt / totalDepenses) * 100).toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bandeau info cotisations */}
      <div style={{ background:'#FFD93D', border:`2px solid ${T.text1}`, padding:'18px 22px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:240 }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:800, color:T.text1, letterSpacing:'-0.01em', marginBottom:4 }}>Cotisation : 12 T99CP / an / membre</div>
          <div style={{ fontSize:13, color:T.text2, lineHeight:1.5 }}>Toute dépense de plus de 50 T99CP est soumise à vote de l'AG. Bilan annuel public et auditable.</div>
        </div>
        <button style={{ background:T.text1, color:'#fff', border:'none', padding:'12px 18px', fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:800, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.06em' }}>📥 Télécharger le bilan</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AGORA — délibérations + dépôt de motion
// ═══════════════════════════════════════════════════════════
function CommuneAgora({ commune: c }) {
  const [showMotionForm, setShowMotionForm] = useState(false);
  const [motionForm, setMotionForm] = useState({ titre:'', description:'', deadline:'14', type:'decision' });
  const [motions, setMotions] = useState([
    { id:1, t:'Motion : Fédération avec la Commune Libre voisine ?', votes:18, total:c.members, status:'En cours', d:'5j restants', author:'Marie D.', desc:'Proposition de fédération avec la commune libre voisine pour mutualiser nos AG mensuelles et soutenir la cagnotte solidaire commune.', type:'decision' },
    { id:2, t:'Compte-rendu de l\'AG du 24 avril', votes:c.members, total:c.members, status:'Adoptée', d:'il y a 1 sem.', author:'Thomas R.', desc:'Compte-rendu de la dernière AG : 78% des présents ont voté pour la motion sur les ZAD agricoles. Présence de 23 membres sur 23.', type:'compte-rendu' },
    { id:3, t:'Budget participatif 2026 — propositions',  votes:11, total:c.members, status:'En cours',  d:'12j restants', author:'Aisha K.', desc:'Cinq propositions soumises au vote pour le budget participatif 2026 : jardin partagé, atelier d\'auto-réparation vélo, soutien à un média local, soirées culturelles, fonds d\'urgence solidaire.', type:'budget' },
  ]);
  const [voted, setVoted] = useState({}); // { motionId: 'pour'|'contre'|'abstention' }

  const submitMotion = () => {
    if (!motionForm.titre || !motionForm.description) return;
    const m = {
      id: Date.now(), t: motionForm.titre, desc: motionForm.description,
      type: motionForm.type, votes: 0, total: c.members,
      status:'En cours', d:`${motionForm.deadline}j restants`, author: 'Vous',
    };
    setMotions(ms => [m, ...ms]);
    setMotionForm({ titre:'', description:'', deadline:'14', type:'decision' });
    setShowMotionForm(false);
    window.showToast?.('Motion déposée — soumise au vote de la commune.', { type:'success', icon:'★' });
  };

  const vote = (motionId, choice) => {
    if (voted[motionId]) return;
    setVoted(v => ({ ...v, [motionId]: choice }));
    setMotions(ms => ms.map(m => m.id === motionId ? { ...m, votes: m.votes + 1 } : m));
    window.showToast?.(`Vote « ${choice} » enregistré`, { type:'success' });
  };

  const TYPE_ICONS = { decision:'⚖', 'compte-rendu':'📋', budget:'💰' };
  const TYPE_LABELS_M = { decision:'Décision', 'compte-rendu':'Compte-rendu', budget:'Budget' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, marginBottom:18, flexWrap:'wrap' }}>
        <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.brand, textTransform:'uppercase' }}>━ Agora · Délibérations & motions</div>
        <button onClick={() => setShowMotionForm(true)} style={{ background:T.brand, color:'#fff', border:'none', padding:'12px 20px', fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:800, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.06em', boxShadow:`3px 3px 0 ${T.text1}` }}>+ Déposer une motion</button>
      </div>

      {motions.map(m => {
        const pctVotes = (m.votes / m.total) * 100;
        const myVote = voted[m.id];
        return (
          <div key={m.id} style={{ background:'#fff', border:`2px solid ${T.text1}`, padding:'24px 26px', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:14, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:240 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                  <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.1em', padding:'3px 8px', background:m.status==='Adoptée'?T.success:'#FFD93D', color:m.status==='Adoptée'?'#fff':T.text1 }}>{m.status.toUpperCase()}</span>
                  <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.1em', padding:'3px 8px', background:T.text1, color:'#FFD93D' }}>{TYPE_ICONS[m.type]} {TYPE_LABELS_M[m.type]?.toUpperCase()}</span>
                  <span style={{ fontSize:11, color:T.text4, fontWeight:600 }}>par {m.author} · {m.d}</span>
                </div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, letterSpacing:'-0.02em', margin:'0 0 8px' }}>{m.t}</h3>
                <p style={{ fontSize:13, color:T.text2, margin:0, lineHeight:1.55 }}>{m.desc}</p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:28, fontWeight:800, color:T.text1, lineHeight:1, letterSpacing:'-0.02em' }}>{m.votes}<span style={{ color:T.text4, fontSize:14 }}>/{m.total}</span></div>
                <div style={{ fontSize:10, color:T.text4, fontWeight:600, marginTop:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>votes</div>
              </div>
            </div>

            {/* Barre de progression */}
            <div style={{ height:6, background:T.surface2, marginBottom:12, position:'relative' }}>
              <div style={{ height:'100%', background:T.brand, width:`${pctVotes}%` }}></div>
            </div>

            {/* Vote buttons (sauf comptes-rendus déjà adoptés) */}
            {m.status === 'En cours' && (
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {[['pour','✓ POUR', T.success], ['contre','✗ CONTRE', T.brand], ['abstention','◯ ABSTENTION', T.text3]].map(([k, l, col]) => (
                  <button key={k} disabled={!!myVote} onClick={() => vote(m.id, k)}
                    style={{ flex:1, minWidth:100, padding:'10px 14px', border:`2px solid ${T.text1}`, background: myVote === k ? col : (myVote ? '#fff' : '#fff'), color: myVote === k ? '#fff' : T.text1, cursor: myVote ? 'not-allowed' : 'pointer', fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:800, letterSpacing:'0.06em', opacity: myVote && myVote !== k ? 0.4 : 1 }}>
                    {l}
                  </button>
                ))}
                {myVote && <div style={{ width:'100%', fontSize:11, color:T.text3, fontStyle:'italic', textAlign:'center', marginTop:4 }}>Tu as voté « {myVote} » · 1 vote = 1 voix</div>}
              </div>
            )}
          </div>
        );
      })}

      {/* MODAL dépôt motion */}
      {showMotionForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(26,26,24,0.6)', zIndex:1500, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={() => setShowMotionForm(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', border:`2px solid ${T.text1}`, maxWidth:560, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ background:T.text1, color:'#fff', padding:'20px 24px', borderBottom:`2px solid ${T.text1}` }}>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.16em', color:'#FFD93D', marginBottom:4 }}>━ NOUVELLE MOTION</div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, letterSpacing:'-0.02em' }}>Déposer une motion à l'agora</div>
            </div>
            <div style={{ padding:'24px' }}>
              <div style={{ background:'#FFD93D', padding:'12px 14px', marginBottom:18, borderLeft:`4px solid ${T.text1}`, fontSize:12, color:T.text1, fontWeight:600, lineHeight:1.5 }}>
                Toute motion est soumise au vote des {c.members} membres de la commune. Résultat à la majorité simple.
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:800, color:T.text1, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>Type de motion</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:0, border:`2px solid ${T.text1}` }}>
                  {Object.entries(TYPE_LABELS_M).map(([k,v],i,arr) => (
                    <button key={k} onClick={() => setMotionForm(f => ({...f, type:k}))} style={{ padding:'12px 8px', border:'none', borderRight:i<arr.length-1?`2px solid ${T.text1}`:'none', background:motionForm.type===k?'#FFD93D':'#fff', cursor:'pointer', fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:800, color:T.text1, letterSpacing:'0.04em' }}>
                      <div style={{ fontSize:18, marginBottom:2 }}>{TYPE_ICONS[k]}</div>
                      <div>{v}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:800, color:T.text1, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>Titre de la motion *</label>
                <input value={motionForm.titre} onChange={e => setMotionForm(f => ({...f, titre:e.target.value}))} placeholder="Motion : créer un jardin partagé sur le terrain communal" style={{ width:'100%', height:46, border:`2px solid ${T.text1}`, padding:'0 14px', fontSize:14, fontFamily:'Inter,sans-serif', color:T.text1, background:'#fff', outline:'none', boxSizing:'border-box' }} />
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:800, color:T.text1, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>Argumentaire détaillé *</label>
                <textarea value={motionForm.description} onChange={e => setMotionForm(f => ({...f, description:e.target.value}))} rows={5} placeholder="Présente le contexte, l'objectif, les modalités, le budget si concerné…" style={{ width:'100%', border:`2px solid ${T.text1}`, padding:'12px 14px', fontSize:13, fontFamily:'Inter,sans-serif', color:T.text1, background:'#fff', outline:'none', boxSizing:'border-box', resize:'vertical', lineHeight:1.5 }} />
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, fontWeight:800, color:T.text1, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>Délai de vote (jours)</label>
                <div style={{ display:'flex', gap:0, border:`2px solid ${T.text1}` }}>
                  {['7','14','30'].map((d,i,arr) => (
                    <button key={d} onClick={() => setMotionForm(f => ({...f, deadline:d}))} style={{ flex:1, padding:'12px', border:'none', borderRight:i<arr.length-1?`2px solid ${T.text1}`:'none', background:motionForm.deadline===d?'#FFD93D':'#fff', cursor:'pointer', fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, color:T.text1 }}>{d} jours</button>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setShowMotionForm(false)} style={{ flex:1, padding:'14px', background:'#fff', border:`2px solid ${T.text1}`, color:T.text1, cursor:'pointer', fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em' }}>Annuler</button>
                <button disabled={!motionForm.titre || !motionForm.description} onClick={submitMotion} style={{ flex:2, padding:'14px', background: motionForm.titre && motionForm.description ? T.brand : T.text4, color:'#fff', border:'none', cursor:motionForm.titre && motionForm.description ? 'pointer' : 'not-allowed', fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em' }}>★ Déposer la motion ►</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
            ['tresorerie','Trésorerie'],
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
                  ━━ {cat==='mobilisation'?'Information & Mobilisation':'Économie du partage'}
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

        {/* ─── TRÉSORERIE ─── */}
        {tab==='tresorerie' && <CommuneTreasury commune={c} />}

        {/* ─── AGORA ─── */}
        {tab==='agora' && <CommuneAgora commune={c} />}

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
// CALENDRIER DES ASSEMBLÉES — vue chronologique des AG à venir
// ═══════════════════════════════════════════════════════════
function AGCalendar({ communes, federations, myCommune, myFed }) {
  const [filter, setFilter] = useState('mes'); // 'mes' | 'toutes'
  const today = new Date('2026-04-25'); // Date de référence cohérente avec le mock

  // Génération d'événements simulés
  const events = [
    { id:1, date:'2026-05-07', time:'19:00', title:`AG hebdomadaire — Commune Libre de ${myCommune?.name || 'Belleville'}`,                        type:'commune',     scope:'mes', location:'Salle des fêtes du quartier · Présentiel + visio', attendees:18, total:myCommune?.members || 23 },
    { id:2, date:'2026-05-14', time:'19:00', title:`AG hebdomadaire — Commune Libre de ${myCommune?.name || 'Belleville'}`,                        type:'commune',     scope:'mes', location:'Salle des fêtes du quartier · Présentiel + visio', attendees:5,  total:myCommune?.members || 23 },
    { id:3, date:'2026-05-18', time:'20:30', title:`AG mensuelle Fédération ${myFed?.short || 'IDF–RA'}`,                                            type:'federation',  scope:'mes', location:'Visio uniquement', attendees:7, total:12 },
    { id:4, date:'2026-06-01', time:'19:00', title:'Assemblée Confédérale (1ʳᵉ chambre + tirage 2ᵉ chambre)',                                          type:'confederation', scope:'toutes', location:'Visio + retransmission publique', attendees:24, total:38, important:true },
    { id:5, date:'2026-06-12', time:'14:00', title:'Assemblée physique annuelle — Confédération nationale',                                            type:'confederation', scope:'toutes', location:'Saint-Étienne · Bourse du Travail', attendees:0, total:200, important:true },
    { id:6, date:'2026-05-22', time:'18:30', title:`AG mensuelle Fédération du Grand Ouest`,                                                            type:'federation', scope:'toutes', location:'Visio', attendees:0, total:18 },
    { id:7, date:'2026-05-30', time:'10:00', title:`AG plénière — Commune Libre des Cévennes`,                                                          type:'commune', scope:'toutes', location:'Mas du Crès · Le Vigan', attendees:0, total:8 },
  ].sort((a, b) => new Date(a.date) - new Date(b.date)).filter(e => filter === 'toutes' || e.scope === 'mes');

  const TYPE_META = {
    commune:      { color:T.brand,   bg:'#FEE7EE', label:'COMMUNE' },
    federation:   { color:'#0369A1', bg:'#DCEAF7', label:'FÉDÉRATION' },
    confederation:{ color:'#7C3AED', bg:'#F1ECFE', label:'CONFÉD.' },
  };

  return (
    <div>
      {/* Toggle */}
      <div style={{ display:'flex', border:`2px solid ${T.text1}`, marginBottom:16, maxWidth:340 }}>
        {[['mes','★ MES ASSEMBLÉES'],['toutes','◉ TOUTES']].map(([k,l],i,arr)=>(
          <button key={k} onClick={() => setFilter(k)} style={{ flex:1, padding:'10px 14px', border:'none', borderRight:i<arr.length-1?`2px solid ${T.text1}`:'none', background:filter===k?T.text1:'#fff', color:filter===k?'#FFD93D':T.text1, cursor:'pointer', fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:800, letterSpacing:'0.06em' }}>{l}</button>
        ))}
      </div>

      {/* Liste timeline */}
      <div style={{ position:'relative', paddingLeft:30, borderLeft:`3px solid ${T.text1}` }}>
        {events.length === 0 && (
          <div style={{ padding:'30px 20px', background:T.surface2, border:`2px solid ${T.text1}`, marginLeft:-30 }}>
            <div style={{ fontSize:14, color:T.text2, fontWeight:600 }}>Aucune assemblée prévue.</div>
          </div>
        )}
        {events.map(e => {
          const eventDate = new Date(e.date);
          const daysUntil = Math.ceil((eventDate - today) / 86400000);
          const meta = TYPE_META[e.type];
          const day = eventDate.toLocaleDateString('fr-FR', { day:'numeric' });
          const month = eventDate.toLocaleDateString('fr-FR', { month:'short' }).toUpperCase().replace('.','');
          const weekday = eventDate.toLocaleDateString('fr-FR', { weekday:'long' });
          return (
            <div key={e.id} style={{ position:'relative', marginBottom:14 }}>
              {/* Pastille date */}
              <div style={{ position:'absolute', left:-49, top:0, width:54, height:54, background: e.important ? '#FFD93D' : '#fff', border:`3px solid ${T.text1}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, lineHeight:1 }}>{day}</div>
                <div style={{ fontSize:9, fontWeight:800, color:T.text1, letterSpacing:'0.04em', marginTop:2 }}>{month}</div>
              </div>
              {/* Carte event */}
              <div style={{ marginLeft:24, background:'#fff', border:`2px solid ${T.text1}`, padding:'18px 22px', display:'flex', alignItems:'flex-start', gap:14, flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:240 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.1em', padding:'3px 8px', background:meta.color, color:'#fff' }}>{meta.label}</span>
                    {e.important && <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.1em', padding:'3px 8px', background:'#FFD93D', color:T.text1 }}>★ MAJEUR</span>}
                    <span style={{ fontSize:11, color:T.text4, fontWeight:600, textTransform:'capitalize' }}>{weekday} · {e.time}</span>
                    {daysUntil > 0 && <span style={{ fontSize:10, fontWeight:800, color: daysUntil <= 7 ? T.brand : T.text3, letterSpacing:'0.04em' }}>DANS {daysUntil}J</span>}
                    {daysUntil <= 0 && <span style={{ fontSize:10, fontWeight:800, color:T.text4, letterSpacing:'0.04em' }}>PASSÉ</span>}
                  </div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:T.text1, letterSpacing:'-0.01em', marginBottom:6 }}>{e.title}</div>
                  <div style={{ fontSize:12, color:T.text3, marginBottom:8 }}>📍 {e.location}</div>
                  {e.attendees > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:T.text2 }}>
                      <div style={{ flex:1, height:6, background:T.surface2, position:'relative', maxWidth:200 }}>
                        <div style={{ height:'100%', background:meta.color, width:`${(e.attendees/e.total)*100}%` }}></div>
                      </div>
                      <span style={{ fontWeight:700 }}>{e.attendees}/{e.total} inscrit·es</span>
                    </div>
                  )}
                </div>
                {daysUntil >= 0 && (
                  <button style={{ background:T.text1, color:'#fff', border:'none', padding:'10px 18px', fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:800, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.06em', flexShrink:0 }}>Je participe ►</button>
                )}
              </div>
            </div>
          );
        })}
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
  const [viewMode, setViewMode] = useState('liste'); // 'liste' | 'carte'

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
            {/* Toggle Liste / Carte */}
            <div style={{ display:'flex', border:`2px solid ${T.text1}`, flexShrink:0 }}>
              {[['liste','▤ LISTE'],['carte','◉ CARTE']].map(([k,l],i,arr)=>(
                <button key={k} onClick={()=>setViewMode(k)} style={{ padding:'12px 16px', border:'none', borderRight:i<arr.length-1?`2px solid ${T.text1}`:'none', background:viewMode===k?T.text1:'#fff', color:viewMode===k?'#FFD93D':T.text1, cursor:'pointer', fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:800, letterSpacing:'0.06em' }}>{l}</button>
              ))}
            </div>
            <button onClick={()=>setShowCreate(true)} style={{ background:T.text1, color:'#fff', border:'none', padding:'14px 22px', fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.06em', flexShrink:0 }}>+ Créer une commune</button>
          </div>

          {viewMode === 'liste' && (
            <>
              <div style={{ display:'flex', gap:0, marginBottom:20, border:`2px solid ${T.text1}`, overflowX:'auto' }}>
                {[['Tous','TOUTES'],['quartier','QUARTIERS'],['commune','COMMUNES'],['village','VILLAGES'],['zad','ZAD'],['tiers_lieu','TIERS-LIEUX']].map(([k,l],i,arr)=>(
                  <button key={k} onClick={()=>setTypeFilter(k)} style={{ flex:1, padding:'12px 16px', border:'none', background:typeFilter===k?T.text1:'#fff', color:typeFilter===k?'#FFD93D':T.text2, cursor:'pointer', fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:800, letterSpacing:'0.08em', whiteSpace:'nowrap', borderRight:i<arr.length-1?`2px solid ${T.text1}`:'none' }}>{l}</button>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))', gap:16 }}>
                {filtered.map(c=><CommuneCard key={c.id} c={c} onClick={()=>setCommuneOpen(c)} />)}
              </div>
            </>
          )}

          {viewMode === 'carte' && (
            <CommunesMap communes={communes} federations={federations}
              onOpenCommune={c => setCommuneOpen(c)}
              onOpenFed={f => setFedOpen(f)} />
          )}
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
          {/* CALENDRIER DES AG À VENIR */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', color:T.brand, marginBottom:14, textTransform:'uppercase' }}>━ Calendrier de mes assemblées</div>
            <AGCalendar communes={communes} federations={federations} myCommune={myCommune} myFed={myFed} />
          </div>

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
// Exposition pour stats globales (ServicesHub Bloc 10)
window.SAMPLE_COMMUNES = SAMPLE_COMMUNES;
