// CampaignPage.jsx — Constructeur de campagnes avec drag & drop
// Jusqu'à 12 modules issus de tous les services de la plateforme
// Sélection multi-items concrets par module + création inline si besoin
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

// ════════════════════════════════════════════════════════════
//  MODULE_SOURCES — pour chaque module qui nécessite des items :
//   - domain        : clé pour window.getUserCreations
//   - data          : référence aux items dans AppData
//   - listItem      : convertit un item en {title, subtitle, badge, image}
//   - createFields  : champs du mini-formulaire de création inline
//   - createDefaults: valeurs par défaut à fusionner pour un nouveau créé
//   - emptyMsg      : message quand l'utilisateur n'a aucun item
// ════════════════════════════════════════════════════════════
const MODULE_SOURCES = {
  petition: {
    label:'pétition', singular:'cette pétition', plural:'ces pétitions', icon:'📜', color:'#E11D74',
    domain:'petitions', getData: () => AppData.petitions,
    listItem: (p) => ({ title:p.title, subtitle:`${(p.signatures||0).toLocaleString('fr-FR')} sig. · ${p.location||''}`, badge:p.category, image:p.image }),
    createFields: [
      { key:'title',       label:'Titre de la pétition',  required:true,  placeholder:'Ex : Stop à la fermeture de l\'hôpital X' },
      { key:'category',    label:'Catégorie', type:'select', options:['Santé','Éducation','Climat','Logement','Travail','Justice','Démocratie'], required:true },
      { key:'location',    label:'Lieu / portée', placeholder:'Paris · National · Européen…' },
      { key:'goal',        label:'Objectif (signatures)', type:'number', required:true, placeholder:'10000' },
      { key:'description', label:'Description', type:'textarea', required:true, placeholder:'Pourquoi cette pétition ? Quel est l\'objectif concret ?' },
    ],
    createDefaults: { signatures:0, status:'active', date: () => new Date().toISOString().slice(0,10), featured:false, tags:[] },
    emptyMsg:"Tu n'as encore lancé aucune pétition. Crées-en une à intégrer dans ta campagne.",
  },
  mobilizations: {
    label:'mobilisation', singular:'cette mobilisation', plural:'ces mobilisations', icon:'📅', color:'#7C3AED',
    domain:'mobilizations', getData: () => AppData.mobilizations,
    listItem: (m) => ({ title:m.title, subtitle:`${new Date(m.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})} · ${m.location||''}`, badge:m.category||m.type, image:null }),
    createFields: [
      { key:'title',       label:'Titre de l\'événement', required:true, placeholder:'Marche pour le climat' },
      { key:'type',        label:'Type', type:'select', options:['manifestation','rassemblement','AG','formation','action directe'], required:true },
      { key:'date',        label:'Date', type:'date', required:true },
      { key:'location',    label:'Lieu', required:true, placeholder:'Place de la République, Paris' },
      { key:'description', label:'Description', type:'textarea', placeholder:'Pourquoi se mobiliser ? Programme prévu ?' },
    ],
    createDefaults: { participants:0, organizer:'Vous', status:'upcoming' },
    emptyMsg:"Aucune mobilisation à ton actif. Crée la prochaine !",
  },
  crowdfunding: {
    label:'cagnotte', singular:'cette cagnotte', plural:'ces cagnottes', icon:'💰', color:'#A21CAF',
    domain:'crowdfunding', getData: () => AppData.crowdfunding,
    listItem: (c) => ({ title:c.title, subtitle:`${c.raised_t99cp||0}/${c.goal_t99cp||0} T99CP · ${c.contributors||0} contrib.`, badge:c.category, image:c.cover }),
    createFields: [
      { key:'title',       label:'Titre de la cagnotte', required:true },
      { key:'category',    label:'Catégorie', type:'select', options:['Luttes','Solidaires','Participatif','Grandes Caisses'], required:true },
      { key:'goal_t99cp',  label:'Objectif (T99CP)', type:'number', required:true, placeholder:'5000' },
      { key:'days_left',   label:'Durée (jours)', type:'number', required:true, placeholder:'30' },
      { key:'description', label:'Description', type:'textarea', required:true },
    ],
    createDefaults: { raised_t99cp:0, contributors:0, organizer:'Vous', featured:false, fundUsage:[], team:[], updates:[], milestones:[] },
    emptyMsg:"Aucune cagnotte ouverte. Lances-en une pour ta campagne.",
  },
  housing: {
    label:'hébergement', singular:'cet hébergement', plural:'ces hébergements', icon:'🏠', color:'#BE185D',
    domain:'housing', getData: () => AppData.housing || [],
    listItem: (h) => ({ title:h.title || `${h.type} à ${h.location}`, subtitle:`${h.price_t99cp||0} T99CP/nuit · ${h.capacity||1} pers.`, badge:h.type, image:null }),
    createFields: [
      { key:'title',       label:'Titre de l\'annonce', required:true, placeholder:'Studio solidaire 18m² centre-ville' },
      { key:'type',        label:'Type', type:'select', options:['Studio','Chambre chez l\'habitant','Appartement','Camping','Caravane'], required:true },
      { key:'location',    label:'Ville', required:true },
      { key:'price_t99cp', label:'Prix (T99CP/nuit)', type:'number', required:true, placeholder:'15' },
      { key:'capacity',    label:'Capacité (pers.)', type:'number', placeholder:'2' },
      { key:'description', label:'Description', type:'textarea' },
    ],
    createDefaults: { host:'Vous', available:true },
    emptyMsg:"Aucune offre d'hébergement. Crées-en une pour ta campagne.",
  },
  carpooling: {
    label:'trajet', singular:'ce trajet', plural:'ces trajets', icon:'🚗', color:'#0284C7',
    domain:'carpool_offers', getData: () => AppData.carpooling_offers || [],
    listItem: (r) => ({ title:`${r.from} → ${r.to}`, subtitle:`${new Date(r.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})} · ${r.seats} place${r.seats>1?'s':''} · ${r.price_t99cp} T99CP`, badge:'Trajet', image:null }),
    createFields: [
      { key:'from',        label:'Départ', required:true, placeholder:'Paris' },
      { key:'to',          label:'Arrivée', required:true, placeholder:'Lyon' },
      { key:'date',        label:'Date', type:'date', required:true },
      { key:'time',        label:'Heure', placeholder:'08:00' },
      { key:'seats',       label:'Places disponibles', type:'number', required:true, placeholder:'3' },
      { key:'price_t99cp', label:'Prix (T99CP)', type:'number', required:true, placeholder:'25' },
    ],
    createDefaults: { driver:'Vous' },
    emptyMsg:"Aucun trajet de covoit proposé. Ajoutes-en un.",
  },
  lending: {
    label:'objet', singular:'cet objet', plural:'ces objets', icon:'🔧', color:'#0891B2',
    domain:'lending', getData: () => AppData.lending,
    listItem: (i) => ({ title:i.name, subtitle:`${i.price_t99cp > 0 ? i.price_t99cp+' T99CP/jour' : 'Gratuit'} · ${i.location||''}`, badge:i.category, image:null }),
    createFields: [
      { key:'name',        label:'Nom de l\'objet', required:true, placeholder:'Perceuse Bosch · Vélo cargo · Tente 4 places' },
      { key:'category',    label:'Catégorie', type:'select', options:['Outillage','Cuisine','Mobilité','Camping','Sport','Livres','Autre'] },
      { key:'price_t99cp', label:'Prix (T99CP/jour) — 0 = gratuit', type:'number', placeholder:'0' },
      { key:'location',    label:'Lieu', placeholder:'Paris 11e' },
      { key:'description', label:'Description', type:'textarea' },
    ],
    createDefaults: { owner:'Vous', available:true },
    emptyMsg:"Aucun objet à prêter. Partage du matériel utile à ta campagne.",
  },
  marketplace: {
    label:'article', singular:'cet article', plural:'ces articles', icon:'🛒', color:'#9333EA',
    domain:'marketplace', getData: () => AppData.marketplace,
    listItem: (p) => ({ title:p.title, subtitle:`${p.price_t99cp||0} T99CP · ${p.location||''}`, badge:p.category, image:p.images?.[0] }),
    createFields: [
      { key:'title',       label:'Titre de l\'article', required:true, placeholder:'T-shirt sérigraphié « Bloque tout »' },
      { key:'category',    label:'Catégorie', type:'select', options:['Vêtements','Livres','Affiches','Goodies','Artisanat','Alimentaire'], required:true },
      { key:'price_t99cp', label:'Prix (T99CP)', type:'number', required:true, placeholder:'15' },
      { key:'location',    label:'Lieu', placeholder:'Paris' },
      { key:'description', label:'Description', type:'textarea', required:true, placeholder:"Présente l'article, taille, état, infos pratiques…" },
    ],
    createDefaults: { seller:'Vous', condition:'Neuf', images:[] },
    emptyMsg:"Tu n'as aucun article en vente sur le marketplace. Crée-en un pour soutenir ta campagne (badges, t-shirts, livres…).",
  },
  sel: {
    label:'service', singular:'ce service', plural:'ces services', icon:'🤲', color:'#16A34A',
    domain:'sel', getData: () => AppData.sel,
    listItem: (s) => ({ title:s.service, subtitle:`${s.provider} · ${s.duration_min} T99CP`, badge:s.type, image:null }),
    createFields: [
      { key:'service',     label:'Nom du service', required:true, placeholder:'Cours de yoga · Réparation vélo · Aide informatique' },
      { key:'type',        label:'Type', type:'select', options:['Offre','Demande'], required:true },
      { key:'duration_min',label:'Durée (en T99CP)', type:'number', required:true, placeholder:'60' },
      { key:'category',    label:'Catégorie', type:'select', options:['Bien-être','Bricolage','Numérique','Cuisine','Enseignement','Transport'], required:true },
      { key:'description', label:'Description', type:'textarea' },
    ],
    createDefaults: { provider:'Vous', location:'À convenir' },
    emptyMsg:"Aucun service SEL. Propose tes compétences à la communauté de ta campagne.",
  },
  garden: {
    label:'surplus', singular:'ce surplus', plural:'ces surplus', icon:'🥬', color:'#16A34A',
    domain:'garden', getData: () => AppData.garden,
    listItem: (g) => ({ title:g.item, subtitle:`${g.free ? 'Gratuit' : g.price_t99cp+' T99CP'} · ${g.location||''}`, badge:g.type, image:null }),
    createFields: [
      { key:'item',        label:'Produit', required:true, placeholder:'Tomates cerises bio · Courgettes · Plants de basilic' },
      { key:'type',        label:'Type', type:'select', options:['Don','Vente','Échange'], required:true },
      { key:'price_t99cp', label:'Prix (T99CP) — 0 si gratuit', type:'number', placeholder:'0' },
      { key:'location',    label:'Lieu', required:true, placeholder:'Lyon 7e' },
      { key:'description', label:'Description', type:'textarea' },
    ],
    createDefaults: { gardener:'Vous', free: false },
    emptyMsg:"Aucun surplus de jardin partagé. Tu cultives quelque chose ? Partage-le.",
  },
  media: {
    label:'article', singular:'cet article', plural:'ces articles', icon:'📰', color:'#5B21B6',
    domain:'media', getData: () => AppData.media,
    listItem: (a) => ({ title:a.title, subtitle:`${a.author} · ${a.reading_time||5} min · ${a.category}`, badge:a.category, image:null }),
    createFields: [
      { key:'title',       label:'Titre de l\'article', required:true, placeholder:'Pourquoi notre lutte est urgente' },
      { key:'category',    label:'Catégorie', type:'select', options:['Politique','Climat','Social','Culture','International','Économie'], required:true },
      { key:'reading_time',label:'Temps de lecture (min)', type:'number', placeholder:'5' },
      { key:'excerpt',     label:'Chapeau (résumé court)', type:'textarea', required:true },
      { key:'content',     label:'Article (texte intégral)', type:'textarea', required:true, rows:10 },
    ],
    createDefaults: { author:'Vous', date: () => new Date().toISOString().slice(0,10), featured:false, views:0 },
    emptyMsg:"Aucun article publié. Écris ton premier billet pour soutenir ta campagne.",
  },
};

// Récupère tous les items d'un module : créations utilisateur + AppData
function getAllItemsForModule(moduleId) {
  const src = MODULE_SOURCES[moduleId];
  if (!src) return [];
  const userItems = (window.getUserCreations?.(src.domain) || []).map(it => ({ ...it, _userCreated: true }));
  const dataItems = (src.getData?.() || []);
  return [...userItems, ...dataItems];
}

// Persist d'une création faite à la volée (sauvegarde dans userCreations)
function persistInlineCreation(domain, item) {
  try {
    const key = `mn_user_${domain}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.unshift(item);
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {}
}

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

// ════════════════════════════════════════════════════════════
//  InlineItemCreator — formulaire compact de création à la volée
//  (utilisé depuis ModuleItemSelector si la liste est vide ou si
//   l'utilisateur veut ajouter un nouvel item depuis le builder)
// ════════════════════════════════════════════════════════════
function InlineItemCreator({ moduleId, onCreated, onCancel }) {
  const src = MODULE_SOURCES[moduleId];
  const [form, setForm] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const allRequired = src.createFields.filter(f => f.required).every(f => form[f.key] && String(form[f.key]).trim());

  const submit = () => {
    if (!allRequired) return;
    // Résoudre les defaults (valeurs ou fonctions)
    const defaults = Object.fromEntries(
      Object.entries(src.createDefaults || {}).map(([k, v]) => [k, typeof v === 'function' ? v() : v])
    );
    const item = {
      id: `u_${Date.now()}`,
      ...defaults,
      ...form,
      _userCreated: true,
    };
    // Convertir les nombres
    src.createFields.forEach(f => {
      if (f.type === 'number' && item[f.key] !== undefined) item[f.key] = +item[f.key];
    });
    persistInlineCreation(src.domain, item);
    window.showToast?.(`${src.icon} ${src.label.charAt(0).toUpperCase() + src.label.slice(1)} créé·e !`, { type:'success' });
    onCreated(item);
  };

  return (
    <div style={{ background:'#fff', border:`2px solid ${src.color}`, borderRadius:14, padding:'18px 20px', marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, paddingBottom:12, borderBottom:`1px solid ${COLORS.gray200}` }}>
        <div style={{ width:36, height:36, background:`${src.color}20`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{src.icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:800, color:COLORS.gray900 }}>Créer une nouvelle {src.label} à la volée</div>
          <div style={{ fontSize:11, color:COLORS.gray500 }}>Elle sera immédiatement publiée et intégrée dans ta campagne.</div>
        </div>
        <button onClick={onCancel} style={{ border:'none', background:COLORS.gray100, borderRadius:'50%', width:28, height:28, cursor:'pointer', fontSize:14, color:COLORS.gray500 }}>×</button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:11, marginTop:14 }}>
        {src.createFields.map(f => (
          <div key={f.key}>
            <label style={{ fontSize:11, fontWeight:700, color:COLORS.gray700, display:'block', marginBottom:4 }}>
              {f.label} {f.required && <span style={{ color:src.color }}>*</span>}
            </label>
            {f.type === 'textarea' ? (
              <textarea value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder} rows={f.rows || 3}
                style={{ width:'100%', border:`1.5px solid ${COLORS.gray200}`, borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:'Inter,sans-serif', color:COLORS.gray900, outline:'none', boxSizing:'border-box', resize:'vertical', lineHeight:1.5 }} />
            ) : f.type === 'select' ? (
              <select value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                style={{ width:'100%', height:38, border:`1.5px solid ${COLORS.gray200}`, borderRadius:10, padding:'0 10px', fontSize:13, fontFamily:'Inter,sans-serif', color:COLORS.gray900, outline:'none' }}>
                <option value="">— Choisir —</option>
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                style={{ width:'100%', height:38, border:`1.5px solid ${COLORS.gray200}`, borderRadius:10, padding:'0 12px', fontSize:13, fontFamily:'Inter,sans-serif', color:COLORS.gray900, outline:'none', boxSizing:'border-box' }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:8, marginTop:16 }}>
        <button onClick={onCancel} style={{ flex:1, padding:'10px', border:`1.5px solid ${COLORS.gray200}`, borderRadius:10, background:'#fff', color:COLORS.gray600, cursor:'pointer', fontWeight:600, fontSize:12, fontFamily:'Inter,sans-serif' }}>Annuler</button>
        <button onClick={submit} disabled={!allRequired} style={{ flex:2, padding:'10px', border:'none', borderRadius:10, background: allRequired ? src.color : COLORS.gray200, color:'#fff', cursor: allRequired ? 'pointer' : 'not-allowed', fontWeight:700, fontSize:12, fontFamily:'Inter,sans-serif' }}>+ Créer & ajouter à ma campagne</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  ModuleItemSelector — modale de sélection multi-items pour un module
//  Affiche les items existants + bouton "Créer un nouveau" inline
// ════════════════════════════════════════════════════════════
function ModuleItemSelector({ moduleId, selectedIds, onSave, onClose }) {
  const src = MODULE_SOURCES[moduleId];
  const [items, setItems] = useState(() => getAllItemsForModule(moduleId));
  const [selected, setSelected] = useState(new Set(selectedIds || []));
  const [showCreator, setShowCreator] = useState(items.length === 0);
  const [search, setSearch] = useState('');
  const mod = ALL_MODULES.find(m => m.id === moduleId);

  if (!src) return null;

  const toggle = (id) => {
    setSelected(s => {
      const ns = new Set(s);
      if (ns.has(id)) ns.delete(id); else ns.add(id);
      return ns;
    });
  };

  const handleCreated = (item) => {
    setItems(arr => [item, ...arr]);
    setSelected(s => { const ns = new Set(s); ns.add(item.id); return ns; });
    setShowCreator(false);
  };

  const filtered = items.filter(it => {
    if (!search) return true;
    const meta = src.listItem(it);
    return (meta.title + ' ' + (meta.subtitle || '')).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:18, maxWidth:680, width:'100%', maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 30px 80px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div style={{ padding:'20px 26px', background:`linear-gradient(135deg, ${src.color}, ${src.color}cc)`, color:'#fff', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:44, height:44, background:'rgba(255,255,255,0.2)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{src.icon}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, opacity:0.8, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>Module · {mod?.label}</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800 }}>Choisis {src.plural} à intégrer</div>
            <div style={{ fontSize:12, opacity:0.85, marginTop:3 }}>{selected.size} sélectionnée{selected.size > 1 ? 's' : ''} · sélectionne autant que tu veux</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', cursor:'pointer', fontSize:18, fontWeight:700 }}>×</button>
        </div>

        {/* Search bar + create button */}
        <div style={{ padding:'14px 20px', borderBottom:`1px solid ${COLORS.gray200}`, display:'flex', gap:10, alignItems:'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`🔍 Rechercher dans ${src.plural}...`}
            style={{ flex:1, height:36, padding:'0 12px', border:`1.5px solid ${COLORS.gray200}`, borderRadius:9999, fontSize:13, color:COLORS.gray900, background:COLORS.gray50, outline:'none', fontFamily:'Inter,sans-serif' }} />
          {!showCreator && <button onClick={() => setShowCreator(true)} style={{ padding:'8px 14px', border:'none', borderRadius:9999, background:src.color, color:'#fff', cursor:'pointer', fontWeight:700, fontSize:12, fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', flexShrink:0 }}>+ Créer une {src.label}</button>}
        </div>

        {/* Body : creator inline OU liste */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', background:COLORS.gray50 }}>
          {showCreator && <InlineItemCreator moduleId={moduleId} onCreated={handleCreated} onCancel={() => setShowCreator(false)} />}

          {filtered.length === 0 && !showCreator && (
            <div style={{ padding:'40px 20px', textAlign:'center' }}>
              <div style={{ fontSize:42, marginBottom:10, opacity:0.5 }}>{src.icon}</div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:COLORS.gray900, marginBottom:6 }}>{search ? 'Aucun résultat' : 'Aucun item disponible'}</div>
              <div style={{ fontSize:12, color:COLORS.gray500, marginBottom:16, maxWidth:380, marginLeft:'auto', marginRight:'auto', lineHeight:1.5 }}>{search ? 'Essaie avec un autre terme.' : src.emptyMsg}</div>
              <button onClick={() => setShowCreator(true)} style={{ padding:'10px 18px', border:'none', borderRadius:10, background:src.color, color:'#fff', cursor:'pointer', fontWeight:700, fontSize:13, fontFamily:'Inter,sans-serif' }}>+ Créer maintenant</button>
            </div>
          )}

          {filtered.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {filtered.map(it => {
                const meta = src.listItem(it);
                const isSel = selected.has(it.id);
                return (
                  <div key={it.id} onClick={() => toggle(it.id)} style={{ display:'flex', gap:12, padding:'12px 14px', background:'#fff', border:`2px solid ${isSel ? src.color : COLORS.gray200}`, borderRadius:12, cursor:'pointer', transition:'all 0.15s' }}>
                    {/* Checkbox */}
                    <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${isSel ? src.color : COLORS.gray300}`, background: isSel ? src.color : '#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                      {isSel && <span style={{ color:'#fff', fontSize:13, fontWeight:800 }}>✓</span>}
                    </div>
                    {/* Image (optional) */}
                    {meta.image && (
                      <img src={meta.image} alt="" style={{ width:54, height:54, borderRadius:8, objectFit:'cover', flexShrink:0 }} onError={e => e.target.style.display='none'} />
                    )}
                    {/* Texte */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                        {meta.badge && <span style={{ padding:'2px 7px', borderRadius:9999, background:`${src.color}15`, color:src.color, fontSize:10, fontWeight:700, letterSpacing:'0.04em' }}>{meta.badge}</span>}
                        {it._userCreated && <span style={{ padding:'2px 7px', borderRadius:9999, background:'#FFD93D', color:'#1A1A18', fontSize:10, fontWeight:800, letterSpacing:'0.04em' }}>★ MIEN</span>}
                      </div>
                      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:COLORS.gray900, lineHeight:1.35, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{meta.title}</div>
                      {meta.subtitle && <div style={{ fontSize:11, color:COLORS.gray500, marginTop:3 }}>{meta.subtitle}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'14px 20px', borderTop:`1px solid ${COLORS.gray200}`, display:'flex', gap:10, alignItems:'center', background:'#fff' }}>
          <div style={{ flex:1, fontSize:12, color:COLORS.gray600 }}>
            <strong style={{ color: selected.size > 0 ? src.color : COLORS.gray400 }}>{selected.size}</strong> {src.plural.split(' ').pop()} sélectionnée{selected.size > 1 ? 's' : ''}
          </div>
          <button onClick={onClose} style={{ padding:'10px 16px', border:`1.5px solid ${COLORS.gray200}`, borderRadius:10, background:'#fff', color:COLORS.gray600, cursor:'pointer', fontWeight:600, fontSize:12, fontFamily:'Inter,sans-serif' }}>Annuler</button>
          <button onClick={() => { onSave([...selected]); onClose(); }} style={{ padding:'10px 18px', border:'none', borderRadius:10, background:src.color, color:'#fff', cursor:'pointer', fontWeight:700, fontSize:12, fontFamily:'Inter,sans-serif' }}>✓ Valider la sélection</button>
        </div>
      </div>
    </div>
  );
}

// Helpers de normalisation : un module peut être string (legacy)
// ou {id, items}. On normalise toujours en {id, items}.
function normalizeModule(m) {
  return typeof m === 'string' ? { id: m, items: [] } : { id: m.id, items: m.items || [] };
}
function moduleId(m) { return typeof m === 'string' ? m : m.id; }
function moduleItems(m) { return typeof m === 'string' ? [] : (m.items || []); }

// ── Mini-previews des modules ────────────────────────────
// Si selectedItems est fourni (tableau d'IDs), on filtre les sources
// pour ne garder QUE les items choisis par l'auteur·ice de la campagne.
// Sinon fallback sur les items featured/par défaut.
function ModulePreview({ moduleId: modId, campaign, setActivePage, selectedItems }) {
  // Helper : pour chaque module qui consomme des items, on filtre depuis
  // tous les items disponibles (user creations + AppData) selon les IDs choisis.
  const pickItems = (mid, fallback) => {
    if (!selectedItems || selectedItems.length === 0) return fallback;
    const all = getAllItemsForModule(mid);
    const selected = selectedItems.map(id => all.find(it => it.id === id)).filter(Boolean);
    return selected.length > 0 ? selected : fallback;
  };

  // Empty-state : module sélectionné mais pas encore d'items configurés
  const emptyState = (mid) => {
    const src = MODULE_SOURCES[mid];
    return (
      <div style={{ background:'#FEF3C7', border:`2px dashed #F59E0B`, borderRadius:14, padding:'20px 22px', display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ fontSize:32, flexShrink:0 }}>{src?.icon || '📦'}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:'#92400E', marginBottom:3 }}>Module à configurer</div>
          <div style={{ fontSize:11, color:'#78350F', lineHeight:1.5 }}>Clique sur 🎯 dans le panneau de gauche pour choisir {src?.plural || 'les items'} à intégrer.</div>
        </div>
      </div>
    );
  };

  const petitions = pickItems('petition', [AppData.petitions.find(p=>p.id===(campaign.petition_id||1)) || AppData.petitions[0]].filter(Boolean));
  const mob       = pickItems('mobilizations', AppData.mobilizations.slice(0,2));
  const cfs       = pickItems('crowdfunding', [AppData.crowdfunding.find(c=>c.id===(campaign.crowdfunding_id||1)) || AppData.crowdfunding[0]].filter(Boolean));
  const housing   = pickItems('housing', AppData.housing.slice(0,2));
  const rides     = pickItems('carpooling', AppData.carpooling_offers.slice(0,2));
  const items     = pickItems('lending', AppData.lending.slice(0,3));
  const products  = pickItems('marketplace', AppData.marketplace.slice(0,3));
  const selItems  = pickItems('sel', AppData.sel.slice(0,3));
  const garden    = pickItems('garden', AppData.garden.slice(0,3));
  const articles  = pickItems('media', AppData.media.slice(0,2));

  // Affichage compact d'une seule pétition (la première sélectionnée)
  const petition = petitions[0];
  const cf = cfs[0];

  // Module en attente de configuration
  const needsConfig = MODULE_SOURCES[modId] && (!selectedItems || selectedItems.length === 0) && !campaign[`${modId}_id`];
  if (needsConfig && ['petition','mobilizations','crowdfunding','housing','carpooling','lending','marketplace','sel','garden','media'].includes(modId)) {
    // On affiche l'aperçu par défaut quand pas configuré (pour ne pas casser les anciennes campagnes mock)
    // mais on ajoute un badge d'avertissement subtil
  }

  const boxStyle = { background:'#fff', borderRadius:14, border:`1px solid ${COLORS.gray200}`, padding:'14px 16px', marginBottom:0 };

  switch(modId) {
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
  // Structure normalisée : tableau de {id, items}. Rétrocompatible avec ['petition',...]
  const [activeModules, setActiveModules] = useState(
    (campaign.modules || ['petition','crowdfunding','mobilizations']).map(normalizeModule)
  );
  const [title, setTitle] = useState(campaign.title || '');
  const [subtitle, setSubtitle] = useState(campaign.subtitle || '');
  const [ctaText, setCtaText] = useState(campaign.cta_text || '');
  const [ctaBtn, setCtaBtn] = useState(campaign.cta_btn || 'Agir maintenant');
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [tab, setTab] = useState('modules'); // modules | settings | preview
  const [selectorOpen, setSelectorOpen] = useState(null); // {moduleId, idx} | null

  const includesModule = (modId) => activeModules.some(m => m.id === modId);

  const addModule = (modId) => {
    if (activeModules.length >= 12) return;
    if (includesModule(modId)) return;
    const newMod = { id: modId, items: [] };
    setActiveModules(m => [...m, newMod]);
    // Ouvrir automatiquement le sélecteur d'items pour les modules qui consomment des items
    if (MODULE_SOURCES[modId]) {
      setTimeout(() => setSelectorOpen({ moduleId: modId, idx: activeModules.length }), 80);
    }
  };
  const removeModule = (idx) => setActiveModules(m=>m.filter((_,i)=>i!==idx));
  const updateModuleItems = (idx, newItems) => {
    setActiveModules(m => m.map((mod, i) => i === idx ? { ...mod, items: newItems } : mod));
  };

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

              {/* Active modules — draggable + sélection items */}
              <div style={{ display:'flex', flexDirection:'column', gap:6, minHeight:40 }}>
                {activeModules.length === 0 && <div style={{ padding:'16px', textAlign:'center', color:COLORS.gray400, fontSize:12, border:`2px dashed ${COLORS.gray200}`, borderRadius:12 }}>Ajoutez des modules ci-dessous</div>}
                {activeModules.map((m, idx) => {
                  const mod = ALL_MODULES.find(am => am.id === m.id);
                  if(!mod) return null;
                  const hasItemsConfig = !!MODULE_SOURCES[m.id]; // ce module accepte une sélection d'items
                  const itemsCount = m.items?.length || 0;
                  const needsConfig = hasItemsConfig && itemsCount === 0;
                  return (
                    <div key={`${m.id}-${idx}`}
                      draggable onDragStart={e=>onDragStart(e,idx)} onDragOver={e=>onDragOver(e,idx)} onDrop={e=>onDrop(e,idx)} onDragEnd={onDragEnd}
                      style={{ background: dragOver===idx?`${mod.color}18`:'#fff', border:`1.5px solid ${dragOver===idx?mod.color : (needsConfig ? '#F59E0B' : COLORS.gray200)}`, borderRadius:10, transition:'all 0.15s', userSelect:'none' }}>
                      {/* Ligne 1 : drag + label + remove */}
                      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px 4px', cursor:'grab' }}>
                        <span style={{ color:COLORS.gray300, fontSize:14 }}>⠿</span>
                        <span style={{ fontSize:18 }}>{mod.icon}</span>
                        <span style={{ flex:1, fontWeight:600, fontSize:12, color:COLORS.gray900, minWidth:0 }}>{mod.label}</span>
                        <span style={{ fontSize:10, color:COLORS.gray400, background:COLORS.gray100, padding:'1px 6px', borderRadius:9999 }}>#{idx+1}</span>
                        <button onClick={()=>removeModule(idx)} style={{ border:'none', background:'#FEE2E2', color:'#EF4444', borderRadius:'50%', width:20, height:20, cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>×</button>
                      </div>

                      {/* Ligne 2 : configuration des items (si applicable) */}
                      {hasItemsConfig && (
                        <button onClick={() => setSelectorOpen({ moduleId: m.id, idx })}
                          style={{ display:'flex', alignItems:'center', gap:6, width:'100%', padding:'7px 10px', margin:'0', border:'none', borderTop:`1px dashed ${COLORS.gray200}`, background: needsConfig ? '#FEF3C7' : `${mod.color}08`, color: needsConfig ? '#92400E' : mod.color, fontSize:11, fontWeight:700, cursor:'pointer', borderRadius:'0 0 9px 9px', fontFamily:'Inter,sans-serif', textAlign:'left' }}>
                          <span style={{ fontSize:12 }}>🎯</span>
                          <span style={{ flex:1 }}>
                            {itemsCount === 0 ? `Choisir ${MODULE_SOURCES[m.id].plural}…` : `${itemsCount} ${MODULE_SOURCES[m.id].label}${itemsCount > 1 ? 's' : ''} sélectionnée${itemsCount > 1 ? 's' : ''}`}
                          </span>
                          <span style={{ fontSize:10, opacity:0.7 }}>{needsConfig ? '⚠ À configurer' : '✏'}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop:`1px solid ${COLORS.gray200}`, paddingTop:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:COLORS.gray700, marginBottom:8 }}>Ajouter un module :</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {ALL_MODULES.map(mod=>{
                  const isActive = includesModule(mod.id);
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
          <div style={{ background:COLORS.amber, color:'#fff', borderRadius:12, padding:'8px 16px', fontSize:12, fontWeight:700, marginBottom:20, display:'inline-flex', alignItems:'center', gap:6 }}>👁️ Aperçu en temps réel · clique 🎯 pour configurer les contenus</div>
          <CampaignView campaign={updatedCampaign} setActivePage={setActivePage} preview />
        </div>
      </div>

      {/* MODALE de sélection d'items (au-dessus de tout) */}
      {selectorOpen && (
        <ModuleItemSelector
          moduleId={selectorOpen.moduleId}
          selectedIds={activeModules[selectorOpen.idx]?.items || []}
          onSave={(newItems) => updateModuleItems(selectorOpen.idx, newItems)}
          onClose={() => setSelectorOpen(null)}
        />
      )}
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

      {/* Modules — chaque entrée peut être {id, items} ou string (legacy) */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {(campaign.modules || []).map((m, i) => {
          const mid = moduleId(m);
          const mItems = moduleItems(m);
          const mod = ALL_MODULES.find(am => am.id === mid);
          if(!mod) return null;
          return (
            <div key={`${mid}-${i}`}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:`${mod.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>{mod.icon}</div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:COLORS.gray900, margin:0 }}>{mod.label}</h3>
                {mItems.length > 0 && <span style={{ fontSize:10, color:mod.color, fontWeight:700, background:`${mod.color}15`, padding:'2px 7px', borderRadius:9999, letterSpacing:'0.04em' }}>{mItems.length} sélectionné{mItems.length>1?'s':''}</span>}
                <div style={{ flex:1, height:1, background:COLORS.gray200 }}></div>
              </div>
              <ModulePreview moduleId={mid} campaign={campaign} setActivePage={setActivePage} selectedItems={mItems} />
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
          {(campaign.modules || []).slice(0,4).map((m, i)=>{
            const mid = moduleId(m);
            const mod = ALL_MODULES.find(x => x.id === mid);
            return mod ? <span key={`${mid}-${i}`} title={mod.label} style={{ fontSize:16 }}>{mod.icon}</span> : null;
          })}
          {(campaign.modules?.length || 0) > 4 && <span style={{ fontSize:11, color:COLORS.gray400, alignSelf:'center' }}>+{campaign.modules.length-4}</span>}
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
