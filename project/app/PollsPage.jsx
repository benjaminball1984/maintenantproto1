// PollsPage.jsx — Service Sondages avec parcours scientifique
const { useState, useEffect, useMemo } = React;

// Persistence locale des votes
const POLL_VOTES_KEY = 'mn_poll_votes';
const loadVotes = () => { try { return JSON.parse(localStorage.getItem(POLL_VOTES_KEY) || '{}'); } catch { return {}; } };
const saveVotes = v => { try { localStorage.setItem(POLL_VOTES_KEY, JSON.stringify(v)); } catch {} };

// ── Type colors ───────────────────────────────────────────
const TYPE_META = {
  electoral:  { label: 'Sondage électoral',     color: '#7C3AED', bg: '#F3EBFE', icon: '🗳️' },
  societe:    { label: 'Sondage société',        color: '#E11D74', bg: '#FDE9F2', icon: '⚡' },
  pronostic:  { label: 'Pronostic',              color: '#0891B2', bg: '#ECFEFF', icon: '🔮' },
};

// ── 15 QUESTIONS DE PROFIL DÉMOGRAPHIQUE (style INSEE) ────
const POLL_DEMOGRAPHIC_FIELDS = [
  { key: 'age', category: 'Démographie', label: 'Quelle est votre tranche d\'âge ?',
    options: ['18-24 ans', '25-34 ans', '35-49 ans', '50-64 ans', '65 ans et plus'] },
  { key: 'gender', category: 'Démographie', label: 'À quel genre vous identifiez-vous ?',
    options: ['Femme', 'Homme', 'Non-binaire', 'Préfère ne pas répondre'] },
  { key: 'csp', category: 'Profession', label: 'Quelle est votre catégorie socio-professionnelle ?',
    options: ['Agriculteur·rice exploitant·e', 'Artisan·e, commerçant·e, chef·fe d\'entreprise', 'Cadre, profession intellectuelle supérieure', 'Profession intermédiaire', 'Employé·e', 'Ouvrier·ère', 'Retraité·e', 'Étudiant·e', 'Sans emploi', 'Autre'] },
  { key: 'education', category: 'Éducation', label: 'Quel est votre plus haut diplôme obtenu ?',
    options: ['Sans diplôme', 'Brevet des collèges', 'CAP / BEP', 'Baccalauréat', 'Bac+2 (BTS, DUT)', 'Bac+3 (Licence)', 'Bac+5 (Master, ingénieur)', 'Bac+8 (Doctorat)'] },
  { key: 'vote_pres_2022', category: 'Politique', label: 'Pour qui avez-vous voté au 1er tour de la présidentielle 2022 ?',
    options: ['Nathalie Arthaud (LO)', 'Fabien Roussel (PCF)', 'Emmanuel Macron (LREM)', 'Jean Lassalle (Résistons)', 'Marine Le Pen (RN)', 'Éric Zemmour (Reconquête)', 'Jean-Luc Mélenchon (LFI)', 'Anne Hidalgo (PS)', 'Yannick Jadot (EELV)', 'Valérie Pécresse (LR)', 'Philippe Poutou (NPA)', 'Nicolas Dupont-Aignan (DLF)', 'Vote blanc / nul', 'Abstention', 'Refuse de répondre'] },
  { key: 'vote_eu_2024', category: 'Politique', label: 'Pour quelle liste avez-vous voté aux européennes 2024 ?',
    options: ['Jordan Bardella (RN)', 'Raphaël Glucksmann (PS-Place publique)', 'Valérie Hayer (Renaissance)', 'Manon Aubry (LFI)', 'Marie Toussaint (EELV)', 'Marion Maréchal (Reconquête)', 'François-Xavier Bellamy (LR)', 'Léon Deffontaines (PCF)', 'Autre liste', 'Vote blanc / nul', 'Abstention', 'Refuse de répondre'] },
  { key: 'housing', category: 'Logement', label: 'Quel est votre statut de logement ?',
    options: ['Propriétaire', 'Locataire (privé)', 'Locataire (HLM / social)', 'Hébergé·e gratuitement', 'Autre'] },
  { key: 'diet', category: 'Mode de vie', label: 'Quel est votre régime alimentaire ?',
    options: ['Omnivore', 'Flexitarien·ne', 'Pesco-végétarien·ne', 'Végétarien·ne', 'Végane'] },
  { key: 'income', category: 'Revenus', label: 'Quel est le revenu mensuel net de votre foyer ?',
    options: ['Moins de 1 000 €', '1 000 — 1 500 €', '1 500 — 2 500 €', '2 500 — 4 000 €', '4 000 — 6 000 €', 'Plus de 6 000 €', 'Refuse de répondre'] },
  { key: 'family', category: 'Famille', label: 'Quelle est votre situation familiale ?',
    options: ['Célibataire sans enfant', 'En couple sans enfant', 'En couple avec enfant(s)', 'Famille monoparentale', 'Veuf·ve', 'Autre'] },
  { key: 'postal_code', category: 'Géographie', label: 'Quel est votre code postal ?',
    type: 'text', placeholder: 'Ex : 75011', maxLength: 5 },
  { key: 'zone_type', category: 'Géographie', label: 'Comment qualifieriez-vous votre lieu de vie ?',
    options: ['Urbain (ville-centre)', 'Périurbain (banlieue)', 'Rural'] },
  { key: 'religion', category: 'Convictions', label: 'Quelle est votre appartenance religieuse ?',
    options: ['Sans religion', 'Catholique pratiquant·e', 'Catholique non-pratiquant·e', 'Musulman·e pratiquant·e', 'Musulman·e non-pratiquant·e', 'Protestant·e', 'Juif·ve', 'Bouddhiste', 'Autre', 'Refuse de répondre'] },
  { key: 'media_trust', category: 'Médias', label: 'Quelle est votre confiance dans les médias traditionnels ?',
    options: ['Très faible', 'Faible', 'Moyenne', 'Forte', 'Très forte'] },
  { key: 'engagement', category: 'Engagement', label: 'Quel est votre niveau d\'engagement militant ?',
    options: ['Aucun', 'Occasionnel (1-2 fois par an)', 'Régulier (mensuel)', 'Très actif (hebdomadaire)'] },
];

const TOTAL_DEMO = POLL_DEMOGRAPHIC_FIELDS.length;

// ── Time helpers ──────────────────────────────────────────
const fmtDate = s => new Date(s).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' });
const daysLeft = closes => {
  const d = Math.ceil((new Date(closes) - new Date()) / (1000 * 60 * 60 * 24));
  if (d < 0) return { txt: 'Clos', color: window.T.text4 };
  if (d === 0) return { txt: 'Dernier jour', color: '#DC2626' };
  if (d <= 7) return { txt: `Encore ${d} j`, color: '#DC2626' };
  return { txt: `Encore ${d} j`, color: window.T.text3 };
};

// ── Avatar option ─────────────────────────────────────────
const POLL_VIEW_KEY = 'mn_poll_avatar_mode';
const loadView = () => localStorage.getItem(POLL_VIEW_KEY) || 'photo';
const saveView = v => { try { localStorage.setItem(POLL_VIEW_KEY, v); } catch {} };

const getEmoji = img => typeof img === 'string' ? img : (img?.emoji || '·');
const getPhoto = img => typeof img === 'object' ? img?.photo : null;

function OptionAvatar({ img, color, size = 54, mode = 'photo', selected = false, ringWhenSelected = true }) {
  const photo = getPhoto(img);
  const emoji = getEmoji(img);
  const usePhoto = mode === 'photo' && photo;
  const radius = Math.round(size * 0.22);
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: usePhoto ? `${color}10` : `${color}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, overflow: 'hidden',
      border: ringWhenSelected ? `2px solid ${selected ? color : 'transparent'}` : 'none',
      transition: 'all 0.18s', position: 'relative',
    }}>
      {usePhoto ? (
        <img src={photo} alt="" loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = `<span style="font-size:${size*0.55}px">${emoji}</span>`; }} />
      ) : (
        <span style={{ fontSize: Math.round(size * 0.55), lineHeight: 1 }}>{emoji}</span>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   FIABILITÉ — Calculs scientifiques
// ════════════════════════════════════════════════════════════
function computeReliability(poll) {
  const total = poll.votes_total;
  // Simulés en fonction du poll.id pour cohérence visuelle
  const seed = poll.id * 37;
  const rand = (n) => ((seed * (n + 1)) % 100) / 100;

  // 1. Votes confirmés par email (~ 65-85% du total)
  const confirmRate = 0.65 + rand(1) * 0.20;
  const confirmed = Math.floor(total * confirmRate);

  // 2. Profils renseignés (~ 35-70% des confirmés)
  const profileRate = 0.35 + rand(2) * 0.35;
  const profiles = Math.floor(confirmed * profileRate);

  // 3. Complétion moyenne (sur 15 questions) : 4-12 questions/profil
  const completion = 4 + rand(3) * 8;
  const completionPct = completion / TOTAL_DEMO;

  // 4. Diversité de l'échantillon (0-1)
  const diversity = 0.45 + rand(4) * 0.50;

  // Score normalisé par axe (0-100)
  const sVotes = Math.min(100, Math.round((confirmed / Math.max(total, 1)) * 100));
  const sProfiles = Math.min(100, Math.round((profiles / Math.max(confirmed, 1)) * 100));
  const sCompletion = Math.round(completionPct * 100);
  const sDiversity = Math.round(diversity * 100);

  // Score global pondéré
  const score = Math.round(
    sVotes * 0.25 + sProfiles * 0.25 + sCompletion * 0.25 + sDiversity * 0.25
  );

  // Seuils minimums pour activer le mode pondéré
  const thresholds = { votes: 60, profiles: 35, completion: 30, diversity: 50 };
  const viable = sVotes >= thresholds.votes && sProfiles >= thresholds.profiles
              && sCompletion >= thresholds.completion && sDiversity >= thresholds.diversity;

  return {
    total, confirmed, profiles, completion: Number(completion.toFixed(1)),
    completionPct, diversity,
    axes: {
      votes: { score: sVotes, label: 'Votes confirmés', icon: '✉️', value: confirmed.toLocaleString('fr-FR'), threshold: thresholds.votes },
      profiles: { score: sProfiles, label: 'Profils renseignés', icon: '👤', value: profiles.toLocaleString('fr-FR'), threshold: thresholds.profiles },
      completion: { score: sCompletion, label: 'Complétion moyenne', icon: '📋', value: `${completion.toFixed(1)} / ${TOTAL_DEMO}`, threshold: thresholds.completion },
      diversity: { score: sDiversity, label: 'Diversité échantillon', icon: '🌐', value: `${Math.round(diversity * 100)}%`, threshold: thresholds.diversity },
    },
    score, viable,
  };
}

const scoreColor = s => s >= 70 ? '#16A34A' : s >= 45 ? '#F59E0B' : '#DC2626';
const scoreLabel = s => s >= 75 ? 'Élevée' : s >= 55 ? 'Modérée' : s >= 35 ? 'Faible' : 'Très faible';
const scoreBg = s => s >= 70 ? '#DCFCE7' : s >= 45 ? '#FEF3C7' : '#FEE2E2';

// Calcul de la marge d'erreur (mode pondéré)
function computeMargin(rel) {
  const designEffect = 1 + (1 - rel.diversity) * 1.4;
  const effectiveN = Math.max(1, (rel.profiles * rel.completionPct) / designEffect);
  const margin = 196 / Math.sqrt(effectiveN); // en pourcentage points
  return { margin: Number(margin.toFixed(1)), effectiveN: Math.round(effectiveN), designEffect: Number(designEffect.toFixed(2)) };
}

// ════════════════════════════════════════════════════════════
//   ReliabilityBadge — pastille compacte sur PollCard
// ════════════════════════════════════════════════════════════
function ReliabilityBadge({ poll }) {
  const rel = useMemo(() => computeReliability(poll), [poll.id, poll.votes_total]);
  const c = scoreColor(rel.score);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 9999,
      background: scoreBg(rel.score),
      fontSize: 11, fontWeight: 700, color: c,
      border: `1px solid ${c}30`,
    }} title={`Fiabilité scientifique : ${scoreLabel(rel.score)}`}>
      <span style={{ fontSize: 11 }}>⊙</span> Fiabilité {rel.score}
    </span>
  );
}

// ════════════════════════════════════════════════════════════
//   PollsPage — Liste des sondages
// ════════════════════════════════════════════════════════════
function PollsPage({ user, setUser, onAuth, setPage }) {
  const T = window.T;
  const [filter, setFilter] = useState('all');
  const [activePoll, setActivePoll] = useState(null);
  const [votes, setVotes] = useState(loadVotes);
  const [viewMode, setViewMode] = useState(loadView);
  const [proposeOpen, setProposeOpen] = useState(false);
  const [userPolls, setUserPolls] = useState(() => window.getUserCreations('polls'));
  const setView = v => { setViewMode(v); saveView(v); };

  const polls = [...userPolls, ...window.AppData.polls];
  const filtered = filter === 'all' ? polls : polls.filter(p => p.type === filter);

  const filterButtons = [
    ['all',       'Tous',                      polls.length],
    ['electoral', '🗳️ Électoraux',             polls.filter(p => p.type === 'electoral').length],
    ['societe',   '⚡ Société',                 polls.filter(p => p.type === 'societe').length],
    ['pronostic', '🔮 Pronostics',              polls.filter(p => p.type === 'pronostic').length],
  ];

  if (activePoll) {
    return <PollDetail
      poll={activePoll}
      user={user} setUser={setUser}
      onAuth={onAuth}
      onBack={() => setActivePoll(null)}
      votes={votes} setVotes={setVotes}
      viewMode={viewMode} setViewMode={setView}
    />;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Hero */}
      <div style={{ position:'relative', borderRadius:24, overflow:'hidden', marginBottom:36, background:T.grad, padding:'44px 36px', color:'#fff' }}>
        <div style={{ position:'absolute', top:-50, right:-50, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.10)', filter:'blur(40px)' }}></div>
        <div style={{ position:'absolute', bottom:-30, left:-30, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.08)', filter:'blur(30px)' }}></div>
        <div style={{ position:'relative', maxWidth:740 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 12px', background:'rgba(255,255,255,0.15)', borderRadius:9999, fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:14, backdropFilter:'blur(10px)' }}>
            <span>📊</span> Information & Réseau · Sondages
          </div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(28px,4.5vw,42px)', fontWeight:800, margin:'0 0 12px', letterSpacing:'-0.03em', lineHeight:1.05 }}>
            Sondages citoyens
          </h1>
          <p style={{ fontSize:16, opacity:0.92, lineHeight:1.55, margin:'0 0 20px', maxWidth:600 }}>
            Élections, société, pronostics. Vote confirmé par email + profil scientifique optionnel pour fiabiliser nos résultats.
          </p>
          <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            {[[`${polls.length}`,'Sondages actifs'],[`${polls.reduce((a,p)=>a+p.votes_total,0).toLocaleString('fr-FR')}`,'Votes exprimés'],[`${user?.demographics ? Object.keys(user.demographics).length : 0}/${TOTAL_DEMO}`,'Votre profil']].map(([n,l])=>(
              <div key={l}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:11, opacity:0.75, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters + Toggle */}
      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', overflowX:'auto', padding:'2px 0' }}>
          {filterButtons.map(([key, label, count]) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{
                padding: '10px 16px', borderRadius: 9999,
                border: filter === key ? `1.5px solid ${T.brand}` : `1.5px solid ${T.border}`,
                background: filter === key ? T.brand : T.surface,
                color: filter === key ? '#fff' : T.text2,
                fontSize: 13, fontWeight: 600, fontFamily: 'Inter,sans-serif',
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.18s',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
              {label}
              <span style={{ fontSize:11, padding:'1px 7px', borderRadius:9999, background: filter === key ? 'rgba(255,255,255,0.25)' : T.surface2, color: filter === key ? '#fff' : T.text4 }}>{count}</span>
            </button>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 6px 4px 10px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:9999 }}>
          <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase' }}>Affichage</span>
          <div style={{ display:'flex', gap:2, padding:2, background:T.surface2, borderRadius:9999 }}>
            {[['photo','📷 Photos'],['emoji','😀 Pictos']].map(([k,l]) => (
              <button key={k} onClick={()=>setView(k)}
                style={{
                  padding:'5px 12px', borderRadius:9999, border:'none',
                  background: viewMode === k ? '#fff' : 'transparent',
                  color: viewMode === k ? T.brand : T.text3,
                  fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif',
                  boxShadow: viewMode === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition:'all 0.15s',
                }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(330px, 1fr))', gap:18 }}>
        {filtered.map(poll => (
          <PollCard key={poll.id} poll={poll} voted={!!votes[poll.id]} onClick={() => setActivePoll(poll)} viewMode={viewMode} />
        ))}
      </div>

      <div style={{ marginTop:48, padding:'32px 28px', background:T.surface, borderRadius:20, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:260 }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, margin:'0 0 6px' }}>Lancer un sondage ?</h3>
          <p style={{ fontSize:14, color:T.text3, margin:0, lineHeight:1.55 }}>Les modérateur·rices et adhérent·es de la Confédération peuvent proposer un sondage. Validation par le comité éditorial sous 48h.</p>
        </div>
        <Btn variant="outline" size="md" onClick={()=>user ? setProposeOpen(true) : onAuth()}>
          {user ? 'Proposer un sondage' : 'Se connecter pour proposer'}
        </Btn>
      </div>

      <CreateModal open={proposeOpen} onClose={()=>setProposeOpen(false)} title="Proposer un sondage"
        subtitle="Pour fiabiliser le résultat, prévois au moins 3 options. Les profils répondants seront utilisés pour la méthode des quotas."
        color={T.brand}
        fields={[
          { id:'title',     label:'Question du sondage', required:true, placeholder:"Faut-il limiter les écrans à l'école ?" },
          { id:'type',      label:'Type de sondage', type:'select', required:true, options:[{value:'electoral',label:'🗳️ Électoral'},{value:'societe',label:'⚡ Société'},{value:'pronostic',label:'🔮 Pronostic'}] },
          { id:'category',  label:'Catégorie / sujet', required:true, placeholder:"Éducation, climat, justice..." },
          { id:'desc',      label:'Présentation du sondage', type:'textarea', rows:3, required:true, placeholder:"Pourquoi cette question ? Contexte ?" },
          { id:'options',   label:'Options de réponse (une par ligne)', type:'textarea', rows:6, required:true, placeholder:"Oui, fortement\nOui, modérément\nNon\nSans avis", hint:'Minimum 2 options · 1 par ligne' },
          { id:'closes',    label:'Date de clôture', type:'date', required:true },
          { id:'multi',     label:'Vote multiple ?', type:'select', options:[{value:'',label:'Non, vote unique'},{value:'true',label:'Oui, vote multiple'}] },
        ]}
        onSubmit={item => {
          // Découpage des options en objets compatibles avec PollDetail
          const colors = ['#DC2626','#7C3AED','#16A34A','#2563EB','#E11D74','#F59E0B','#0891B2','#6B7280'];
          const optionsList = (item.options || '').split('\n').map(s => s.trim()).filter(Boolean);
          if (optionsList.length < 2) { window.showToast?.('Il faut au moins 2 options', { type:'error' }); return; }
          const enriched = {
            id: `u_${Date.now()}`, _userCreated: true, _createdAt: Date.now(),
            ...item,
            slug: 'user-' + Date.now(),
            author: user?.name || 'Vous',
            created: new Date().toISOString().slice(0, 10),
            votes_total: 0,
            requires_account: true,
            multi: item.multi === 'true',
            options: optionsList.map((label, i) => ({
              id: i + 1, label,
              color: colors[i % colors.length],
              img: { emoji: '🗳️', photo: `https://picsum.photos/seed/optu${Date.now()}_${i}/200/200` },
              votes: 0,
            })),
          };
          // Sauvegarde manuelle (avec la structure correcte) — domain non passé à CreateModal
          const arr = [enriched, ...window.getUserCreations('polls')];
          try { localStorage.setItem('mn_user_polls', JSON.stringify(arr)); } catch {}
          setUserPolls(arr);
          window.showToast?.('Sondage publié — il apparaîtra en haut de la liste', { type:'success', icon:'📊' });
        }}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   PollCard
// ════════════════════════════════════════════════════════════
function PollCard({ poll, voted, onClick, viewMode = 'photo' }) {
  const T = window.T;
  const [hov, setHov] = useState(false);
  const meta = TYPE_META[poll.type] || TYPE_META.societe;
  const dl = daysLeft(poll.closes);
  const top3 = [...poll.options].sort((a,b)=>b.votes-a.votes).slice(0, 3);

  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.surface,
        border: `1px solid ${hov ? T.brand : T.border}`,
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 16px 36px rgba(225,29,116,0.12)` : '0 1px 3px rgba(0,0,0,0.04)',
      }}>
      <div style={{ background: meta.bg, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, color:meta.color, textTransform:'uppercase', letterSpacing:'0.06em' }}>
          <span>{meta.icon}</span>{meta.label}
        </span>
        <span style={{ fontSize:11, fontWeight:600, color:dl.color, display:'inline-flex', alignItems:'center', gap:4 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:dl.color }}></span>{dl.txt}
        </span>
      </div>
      <div style={{ padding: '18px 20px' }}>
        <div style={{ fontSize:11, color:T.text4, fontWeight:600, marginBottom:6, letterSpacing:'0.04em' }}>{poll.category}</div>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: T.text1, margin: '0 0 12px', lineHeight: 1.25, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{poll.title}</h3>

        <div style={{ marginBottom: 14 }}>
          {top3.map((opt, i) => {
            const pct = poll.votes_total ? Math.round((opt.votes / poll.votes_total) * 100) : 0;
            return (
              <div key={opt.id} style={{ marginBottom: 7 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  {viewMode === 'photo' && getPhoto(opt.img)
                    ? <img src={getPhoto(opt.img)} alt="" style={{ width:18, height:18, borderRadius:4, objectFit:'cover', flexShrink:0, border:`1px solid ${T.border}` }} />
                    : <span style={{ fontSize:14, width:18, textAlign:'center', flexShrink:0 }}>{getEmoji(opt.img)}</span>}
                  <span style={{ fontSize:12, color:T.text2, fontWeight:600, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{opt.label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color: i === 0 ? meta.color : T.text3 }}>{pct}%</span>
                </div>
                <div style={{ height:5, background:T.surface2, borderRadius:9999, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background: i === 0 ? meta.color : T.text4, borderRadius:9999, transition:'width 0.6s ease-out' }}></div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:`1px solid ${T.border}`, gap: 8, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap: 8, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, color:T.text4, fontWeight:600 }}>
              {poll.votes_total.toLocaleString('fr-FR')} votes
            </span>
            {poll._userCreated && <window.UserBadge />}
            <ReliabilityBadge poll={poll} />
          </div>
          {voted ? (
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700, color:T.success, padding:'3px 8px', background:T.successLight, borderRadius:9999 }}>
              ✓ Voté
            </span>
          ) : (
            <span style={{ fontSize:12, fontWeight:700, color:meta.color }}>Voter →</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   PollDetail — STATE MACHINE: vote → email → confirmed → question → thanks → done
// ════════════════════════════════════════════════════════════
function PollDetail({ poll, user, setUser, onAuth, onBack, votes, setVotes, viewMode, setViewMode }) {
  const T = window.T;
  const meta = TYPE_META[poll.type] || TYPE_META.societe;
  const dl = daysLeft(poll.closes);
  const userVote = votes[poll.id];
  const hasVoted = !!userVote;

  const [stage, setStage] = useState(hasVoted ? 'done' : 'vote');
  const [selected, setSelected] = useState(userVote ? (poll.multi ? userVote : [userVote]) : []);
  const [hoverOpt, setHoverOpt] = useState(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);

  const [localBump, setLocalBump] = useState({});
  const augmentedVotes = poll.options.map(o => ({ ...o, votes: o.votes + (localBump[o.id] || 0) }));
  const totalVotes = poll.votes_total + Object.values(localBump).reduce((a,b)=>a+b, 0);
  const sorted = [...augmentedVotes].sort((a,b)=>b.votes - a.votes);

  const demographics = user?.demographics || {};
  const filledCount = Object.keys(demographics).length;

  const toggleOption = id => {
    if (poll.multi) {
      if (selected.includes(id)) setSelected(selected.filter(x => x !== id));
      else if (selected.length < (poll.max_choices || poll.options.length)) setSelected([...selected, id]);
    } else setSelected([id]);
  };

  // Étape 1 : envoi simulé email
  const submitVote = () => {
    if (!user) { onAuth(); return; }
    if (selected.length === 0) return;
    setStage('email');
  };

  // Étape 2 : confirmation par clic sur le faux email
  const confirmEmail = () => {
    const newVotes = { ...votes, [poll.id]: poll.multi ? selected : selected[0] };
    setVotes(newVotes);
    saveVotes(newVotes);
    const bump = {};
    selected.forEach(id => bump[id] = (localBump[id] || 0) + 1);
    setLocalBump({ ...localBump, ...bump });
    setStage('confirmed');
  };

  // Pioche question parmi celles non remplies
  const pickQuestion = () => {
    const remaining = POLL_DEMOGRAPHIC_FIELDS.filter(f => !demographics[f.key]);
    if (remaining.length === 0) return null;
    return remaining[Math.floor(Math.random() * remaining.length)];
  };

  const startQuestion = () => {
    const q = pickQuestion();
    if (!q) { setStage('done'); return; }
    setCurrentQ(q);
    setStage('question');
  };

  const submitAnswer = (answer) => {
    if (!setUser) return;
    const newDemographics = { ...demographics, [currentQ.key]: answer };
    setUser({ ...user, demographics: newDemographics });
    setQuestionsAnswered(questionsAnswered + 1);
    setStage('thanks');
  };

  const askAnother = () => {
    const q = pickQuestion();
    if (!q) { setStage('done'); return; }
    setCurrentQ(q);
    setStage('question');
  };

  const skipToResults = () => setStage('done');

  // ── Rendu en fonction de l'étape ──────────────────────
  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px 20px 100px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, gap:10, flexWrap:'wrap' }}>
        <button onClick={onBack}
          style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:9999, fontSize:13, color:T.text2, cursor:'pointer', fontFamily:'Inter,sans-serif', fontWeight:600 }}>
          ← Tous les sondages
        </button>
        {stage !== 'email' && setViewMode && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 6px 4px 10px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:9999 }}>
            <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase' }}>Affichage</span>
            <div style={{ display:'flex', gap:2, padding:2, background:T.surface2, borderRadius:9999 }}>
              {[['photo','📷 Photos'],['emoji','😀 Pictos']].map(([k,l]) => (
                <button key={k} onClick={()=>setViewMode(k)}
                  style={{ padding:'5px 12px', borderRadius:9999, border:'none', background: viewMode === k ? '#fff' : 'transparent', color: viewMode === k ? T.brand : T.text3, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif', boxShadow: viewMode === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ÉTAPE EMAIL — faux email Resend */}
      {stage === 'email' && (
        <StepEmail poll={poll} user={user} selected={selected} meta={meta}
          onConfirm={confirmEmail} onModify={() => setStage('vote')} viewMode={viewMode} />
      )}

      {/* ÉTAPE CONFIRMED */}
      {stage === 'confirmed' && (
        <StepConfirmed filledCount={filledCount} onStart={startQuestion} onSkip={skipToResults} />
      )}

      {/* ÉTAPE QUESTION */}
      {stage === 'question' && currentQ && (
        <StepQuestion question={currentQ} filledCount={filledCount} onSubmit={submitAnswer} onSkip={skipToResults} />
      )}

      {/* ÉTAPE THANKS */}
      {stage === 'thanks' && (
        <StepThanks
          questionsAnswered={questionsAnswered}
          filledCount={filledCount}
          remaining={POLL_DEMOGRAPHIC_FIELDS.filter(f => !demographics[f.key]).length}
          onAnother={askAnother} onDone={skipToResults} />
      )}

      {/* ÉTAPE VOTE */}
      {stage === 'vote' && (
        <div style={{ background:T.surface, borderRadius:20, border:`1px solid ${T.border}`, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ background: meta.bg, padding: '20px 28px', borderBottom:`1px solid ${T.border}` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:12 }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 12px', background:'#fff', borderRadius:9999, fontSize:11, fontWeight:700, color:meta.color, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                <span style={{ fontSize:14 }}>{meta.icon}</span>{meta.label}
              </span>
              <div style={{ display:'flex', gap:14, alignItems:'center', fontSize:12, color:T.text3 }}>
                <span><strong style={{ color:T.text1 }}>{totalVotes.toLocaleString('fr-FR')}</strong> votes</span>
                <span style={{ color:dl.color, fontWeight:600 }}>● {dl.txt}</span>
              </div>
            </div>
            <div style={{ fontSize:12, color:meta.color, fontWeight:700, marginBottom:6, letterSpacing:'0.04em' }}>{poll.category}</div>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(20px,3vw,28px)', fontWeight:800, color:T.text1, margin:'0 0 10px', letterSpacing:'-0.02em', lineHeight:1.2 }}>{poll.title}</h1>
            <p style={{ fontSize:14, color:T.text2, margin:0, lineHeight:1.55, maxWidth:680 }}>{poll.desc}</p>
          </div>

          <div style={{ padding:'24px 28px' }}>
            <div style={{ display:'flex', gap:18, alignItems:'center', flexWrap:'wrap', fontSize:12, color:T.text3, marginBottom:22, paddingBottom:16, borderBottom:`1px dashed ${T.border}` }}>
              <span>👤 <strong style={{ color:T.text2 }}>{poll.author}</strong></span>
              <span>📅 Du {fmtDate(poll.created)} au {fmtDate(poll.closes)}</span>
              {poll.multi && <span>☑️ Vote multiple (max {poll.max_choices})</span>}
            </div>

            {!user && (
              <div style={{ background:'linear-gradient(135deg,#FEF3C7 0%,#FDE68A 100%)', border:`1px solid #FCD34D`, borderRadius:14, padding:'14px 18px', marginBottom:22, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                <div style={{ fontSize:22 }}>🔒</div>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:'#78350F', marginBottom:2 }}>Connexion requise pour voter</div>
                  <div style={{ fontSize:12, color:'#92400E' }}>Pour garantir la sincérité du sondage, seuls les membres certifié·es peuvent voter.</div>
                </div>
                <Btn variant="dark" size="sm" onClick={onAuth}>Se connecter</Btn>
              </div>
            )}

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14 }}>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:700, color:T.text1, margin:0 }}>
                {poll.multi ? `Sélectionnez jusqu'à ${poll.max_choices} options` : 'Faites votre choix'}
              </h2>
              {poll.multi && <span style={{ fontSize:12, color:T.text3 }}>{selected.length} / {poll.max_choices} sélectionnées</span>}
            </div>

            <div style={{ display:'grid', gap:10, marginBottom:22 }}>
              {poll.options.map(opt => {
                const isSel = selected.includes(opt.id);
                const isHov = hoverOpt === opt.id;
                return (
                  <button key={opt.id} onClick={() => toggleOption(opt.id)} onMouseEnter={() => setHoverOpt(opt.id)} onMouseLeave={() => setHoverOpt(null)}
                    style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', background: isSel ? `${opt.color}10` : T.surface, border: `2px solid ${isSel ? opt.color : (isHov ? T.borderDark : T.border)}`, borderRadius:14, cursor:'pointer', textAlign:'left', fontFamily:'Inter,sans-serif', transition:'all 0.18s', width:'100%' }}>
                    <OptionAvatar img={opt.img} color={opt.color} size={54} mode={viewMode} selected={isSel} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:T.text1, marginBottom:opt.party || opt.desc ? 3 : 0 }}>{opt.label}</div>
                      {opt.party && <div style={{ fontSize:12, color:opt.color, fontWeight:600 }}>{opt.party}</div>}
                      {opt.desc && <div style={{ fontSize:12, color:T.text3 }}>{opt.desc}</div>}
                    </div>
                    <div style={{ width:24, height:24, borderRadius: poll.multi ? 6 : '50%', border:`2px solid ${isSel ? opt.color : T.borderDark}`, background: isSel ? opt.color : T.surface, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.18s' }}>
                      {isSel && <span style={{ color:'#fff', fontSize:14, fontWeight:800 }}>{poll.multi ? '✓' : '●'}</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <Btn variant="gradient" size="lg" disabled={selected.length === 0 || !user} onClick={submitVote} style={{ width:'100%' }}>
              {!user ? '🔒 Se connecter pour voter' : selected.length === 0 ? 'Sélectionnez une option' : `✉️ Confirmer par email${selected.length > 1 ? ` (${selected.length} choix)` : ''}`}
            </Btn>
            <div style={{ fontSize:11, color:T.text4, textAlign:'center', marginTop:10 }}>
              Vote confirmé par email · Anonyme · Aucune donnée tierce
            </div>
          </div>
        </div>
      )}

      {/* ÉTAPE DONE → résultats */}
      {stage === 'done' && (
        <div style={{ background:T.surface, borderRadius:20, border:`1px solid ${T.border}`, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ background: meta.bg, padding: '20px 28px', borderBottom:`1px solid ${T.border}` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:12 }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 12px', background:'#fff', borderRadius:9999, fontSize:11, fontWeight:700, color:meta.color, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                <span style={{ fontSize:14 }}>{meta.icon}</span>{meta.label}
              </span>
              <div style={{ display:'flex', gap:14, alignItems:'center', fontSize:12, color:T.text3 }}>
                <span><strong style={{ color:T.text1 }}>{totalVotes.toLocaleString('fr-FR')}</strong> votes</span>
                <span style={{ color:dl.color, fontWeight:600 }}>● {dl.txt}</span>
              </div>
            </div>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(20px,3vw,28px)', fontWeight:800, color:T.text1, margin:'0 0 10px', letterSpacing:'-0.02em', lineHeight:1.2 }}>{poll.title}</h1>
          </div>
          <div style={{ padding:'24px 28px' }}>
            <ReliabilityPanel poll={poll} />
            <PollResults poll={poll} augmentedVotes={augmentedVotes} sorted={sorted} totalVotes={totalVotes} userVote={userVote} meta={meta} viewMode={viewMode} />
          </div>
        </div>
      )}

      <div style={{ marginTop:18, padding:'14px 18px', background:T.surface2, borderRadius:12, fontSize:12, color:T.text3, lineHeight:1.55 }}>
        <strong style={{ color:T.text2 }}>ℹ️ À propos de la fiabilité.</strong> Ce sondage est confirmé par email et enrichi par les profils volontaires des votant·es. Le mode pondéré apparaît dès que l'échantillon atteint un seuil scientifique minimal.
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   StepEmail — Faux email Resend
// ════════════════════════════════════════════════════════════
function StepEmail({ poll, user, selected, meta, onConfirm, onModify, viewMode }) {
  const T = window.T;
  const selectedOpts = selected.map(id => poll.options.find(o => o.id === id)).filter(Boolean);

  return (
    <div>
      {/* Bandeau bleu en haut */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)', borderRadius: 20, padding: '36px 28px', color: '#fff', marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Confirme ton vote par email
          </h1>
          <p style={{ fontSize: 15, opacity: 0.92, margin: 0, maxWidth: 540, marginInline: 'auto', lineHeight: 1.55 }}>
            Pour garantir la sincérité du sondage, on t'a envoyé un email de confirmation. Clique sur le bouton à l'intérieur pour valider ton vote.
          </p>
        </div>
      </div>

      {/* Banner prototype */}
      <div style={{ background:'linear-gradient(135deg,#FEF3C7 0%,#FDE68A 100%)', border:`1px solid #FCD34D`, borderRadius:14, padding:'12px 18px', marginBottom:18, display:'flex', alignItems:'flex-start', gap:12 }}>
        <div style={{ fontSize:18, marginTop:1 }}>⚠️</div>
        <div style={{ flex:1, fontSize:13, color:'#78350F', lineHeight:1.5 }}>
          <strong>Mode prototype :</strong> ceci est une simulation de l'email Resend qui sera envoyé en production. Clique sur le bouton dans la carte ci-dessous pour confirmer.
        </div>
      </div>

      {/* Carte email simulée */}
      <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,0.08)' }}>
        {/* Header email */}
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.border}`, background: '#FAFAFA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #E11D74, #F4721E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontFamily: "'Sora',sans-serif", flexShrink: 0 }}>M!</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: T.text1 }}>noreply@maintenant.org</span>
                <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', background: '#000', color: '#fff', borderRadius: 4, letterSpacing: '0.06em' }}>VIA RESEND</span>
              </div>
              <div style={{ fontSize: 11, color: T.text4, marginTop: 2 }}>à {user?.email || 'vous@example.com'}</div>
            </div>
            <div style={{ fontSize: 11, color: T.text4, flexShrink: 0 }}>maintenant</div>
          </div>
          <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 17, color: T.text1, marginTop: 6 }}>
            Confirme ton vote sur Maintenant !
          </div>
        </div>

        {/* Body email */}
        <div style={{ padding: '28px 24px' }}>
          <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.65, margin: '0 0 18px' }}>
            Bonjour {user?.name?.split(' ')[0] || 'militant·e'},
          </p>
          <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.65, margin: '0 0 22px' }}>
            Tu viens de voter sur le sondage suivant. Pour finaliser ta participation, confirme ton choix en cliquant sur le bouton ci-dessous.
          </p>

          {/* Récap du vote */}
          <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 18px', marginBottom: 22 }}>
            <div style={{ fontSize: 11, color: T.text4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              {meta.icon} {meta.label}
            </div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: T.text1, marginBottom: 14, lineHeight: 1.35 }}>
              {poll.title}
            </div>
            <div style={{ fontSize: 11, color: T.text4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Ton choix
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedOpts.map(opt => (
                <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#fff', borderRadius: 8, border: `1px solid ${T.border}` }}>
                  <OptionAvatar img={opt.img} color={opt.color} size={32} mode={viewMode} ringWhenSelected={false} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: T.text1 }}>{opt.label}</div>
                    {opt.party && <div style={{ fontSize: 11, color: opt.color, fontWeight: 600 }}>{opt.party}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA confirmation */}
          <div style={{ textAlign: 'center', margin: '8px 0 22px' }}>
            <button onClick={onConfirm}
              style={{ background: 'linear-gradient(135deg, #E11D74 0%, #F4721E 100%)', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: 12, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 24px rgba(225,29,116,0.35)', letterSpacing: '-0.01em' }}>
              ✓ Confirmer mon vote
            </button>
          </div>

          <p style={{ fontSize: 12, color: T.text4, lineHeight: 1.55, margin: 0, textAlign: 'center' }}>
            Si tu n'es pas à l'origine de ce vote, ignore cet email.<br />
            Lien valable 24h · Maintenant ! · La voix des 99%
          </p>
        </div>
      </div>

      {/* Modifier */}
      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <button onClick={onModify}
          style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.text2, padding: '10px 20px', borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
          ← Modifier mon choix
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   StepConfirmed — Vote confirmé + invitation au profil
// ════════════════════════════════════════════════════════════
function StepConfirmed({ filledCount, onStart, onSkip }) {
  const T = window.T;
  return (
    <div>
      {/* Hero confirmation verte */}
      <div style={{ background: 'linear-gradient(135deg, #15803D 0%, #16A34A 50%, #22C55E 100%)', borderRadius: 20, padding: '48px 28px', color: '#fff', marginBottom: 22, position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 44 }}>
            ✓
          </div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(26px,4vw,38px)', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Vote confirmé !
          </h1>
          <p style={{ fontSize: 15, opacity: 0.92, margin: 0, maxWidth: 480, marginInline: 'auto', lineHeight: 1.55 }}>
            Ta voix est enregistrée. Merci d'avoir contribué à ce sondage citoyen.
          </p>
        </div>
      </div>

      {/* Carte invitation profil */}
      <div style={{ background: 'linear-gradient(135deg, #FDF2F8 0%, #F3E8FF 100%)', border: '1px solid #E9D5FF', borderRadius: 18, padding: '24px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #DB2777, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🔬</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: T.text1, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              Aide-nous à fiabiliser nos sondages
            </h2>
            <p style={{ fontSize: 13, color: T.text2, margin: 0, lineHeight: 1.5 }}>
              Plus tu réponds à des questions sur ton profil, plus nos résultats deviennent scientifiquement robustes.
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text2 }}>Ton profil scientifique</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#7C3AED', fontFamily: "'Sora',sans-serif" }}>{filledCount}/{TOTAL_DEMO} questions</span>
          </div>
          <div style={{ height: 8, background: '#fff', borderRadius: 9999, overflow: 'hidden', border: '1px solid #E9D5FF' }}>
            <div style={{ height: '100%', width: `${(filledCount / TOTAL_DEMO) * 100}%`, background: 'linear-gradient(90deg, #DB2777, #7C3AED)', borderRadius: 9999, transition: 'width 0.6s ease-out' }}></div>
          </div>
        </div>

        <button onClick={onStart}
          style={{ width: '100%', background: 'linear-gradient(135deg, #DB2777 0%, #7C3AED 100%)', color: '#fff', border: 'none', padding: '14px 20px', borderRadius: 12, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 6px 18px rgba(124,58,237,0.30)', letterSpacing: '-0.01em', marginBottom: 10 }}>
          Répondre à une question (15 secondes) →
        </button>
        <div style={{ textAlign: 'center' }}>
          <button onClick={onSkip}
            style={{ background: 'transparent', border: 'none', color: T.text3, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', textDecoration: 'underline' }}>
            Non merci, voir les résultats
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   StepQuestion — Question piochée au hasard
// ════════════════════════════════════════════════════════════
function StepQuestion({ question, filledCount, onSubmit, onSkip }) {
  const T = window.T;
  const [answer, setAnswer] = useState('');
  const isText = question.type === 'text';

  const submit = () => {
    if (!answer) return;
    if (isText && question.maxLength === 5 && !/^\d{5}$/.test(answer)) {
      alert('Le code postal doit comporter 5 chiffres.');
      return;
    }
    onSubmit(answer);
  };

  return (
    <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
      {/* Header rose-violet */}
      <div style={{ background: 'linear-gradient(135deg, #FDF2F8 0%, #F3E8FF 100%)', padding: '20px 28px', borderBottom: '1px solid #E9D5FF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>🎲</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Question piochée au hasard
          </span>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Profil scientifique</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#7C3AED', fontFamily: "'Sora',sans-serif" }}>{filledCount}/{TOTAL_DEMO}</span>
          </div>
          <div style={{ height: 6, background: '#fff', borderRadius: 9999, overflow: 'hidden', border: '1px solid #E9D5FF' }}>
            <div style={{ height: '100%', width: `${(filledCount / TOTAL_DEMO) * 100}%`, background: 'linear-gradient(90deg, #DB2777, #7C3AED)', borderRadius: 9999, transition: 'width 0.4s ease-out' }}></div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div style={{ padding: '28px 28px 24px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#DB2777', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          {question.category}
        </div>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(18px,2.6vw,24px)', fontWeight: 800, color: T.text1, margin: '0 0 22px', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
          {question.label}
        </h2>

        {isText ? (
          <input
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value.replace(/\D/g, '').slice(0, question.maxLength || 5))}
            placeholder={question.placeholder || ''}
            maxLength={question.maxLength}
            style={{ width: '100%', padding: '14px 18px', border: `2px solid ${T.border}`, borderRadius: 12, fontSize: 16, fontFamily: 'Inter,sans-serif', color: T.text1, outline: 'none', marginBottom: 22, fontWeight: 600, letterSpacing: '0.05em' }}
            onFocus={e => e.target.style.borderColor = '#7C3AED'}
            onBlur={e => e.target.style.borderColor = T.border}
          />
        ) : (
          <div style={{ display: 'grid', gap: 8, marginBottom: 22 }}>
            {question.options.map(opt => {
              const isSel = answer === opt;
              return (
                <button key={opt} onClick={() => setAnswer(opt)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: isSel ? '#F3E8FF' : '#fff', border: `2px solid ${isSel ? '#7C3AED' : T.border}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter,sans-serif', transition: 'all 0.18s', width: '100%' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${isSel ? '#7C3AED' : T.borderDark}`, background: isSel ? '#7C3AED' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isSel && <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>●</span>}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.text1, flex: 1 }}>{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        <button onClick={submit} disabled={!answer}
          style={{ width: '100%', background: answer ? 'linear-gradient(135deg, #DB2777 0%, #7C3AED 100%)' : T.surface2, color: answer ? '#fff' : T.text4, border: 'none', padding: '14px 20px', borderRadius: 12, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, cursor: answer ? 'pointer' : 'not-allowed', boxShadow: answer ? '0 6px 18px rgba(124,58,237,0.30)' : 'none', letterSpacing: '-0.01em' }}>
          Valider ma réponse
        </button>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button onClick={onSkip}
            style={{ background: 'transparent', border: 'none', color: T.text3, padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            Passer · voir les résultats
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   StepThanks — Merci, encore une ?
// ════════════════════════════════════════════════════════════
function StepThanks({ questionsAnswered, filledCount, remaining, onAnother, onDone }) {
  const T = window.T;
  const profileComplete = remaining === 0;

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #FDF2F8 0%, #F3E8FF 100%)', borderRadius: 20, padding: '40px 28px', textAlign: 'center', marginBottom: 18, border: '1px solid #E9D5FF' }}>
        <div style={{ fontSize: 56, marginBottom: 14 }}>🎉</div>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(24px,4vw,34px)', fontWeight: 800, color: T.text1, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Merci !
        </h1>
        <p style={{ fontSize: 15, color: T.text2, margin: 0, lineHeight: 1.5 }}>
          {questionsAnswered === 1 ? '1 question répondue' : `${questionsAnswered} questions répondues`} dans cette session
        </p>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 16, padding: '22px 24px', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          {profileComplete ? (
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #FBBF24, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏆</div>
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #DB2777, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🔬</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: T.text1, marginBottom: 2 }}>
              {profileComplete ? 'Profil complet — bravo !' : 'Profil scientifique'}
            </div>
            <div style={{ fontSize: 12, color: T.text3 }}>
              {profileComplete ? 'Tu as répondu à toutes les questions de profil.' : `Encore ${remaining} questions disponibles`}
            </div>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Progression</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#7C3AED', fontFamily: "'Sora',sans-serif" }}>{filledCount}/{TOTAL_DEMO}</span>
          </div>
          <div style={{ height: 8, background: T.surface2, borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(filledCount / TOTAL_DEMO) * 100}%`, background: profileComplete ? 'linear-gradient(90deg, #FBBF24, #F59E0B)' : 'linear-gradient(90deg, #DB2777, #7C3AED)', borderRadius: 9999, transition: 'width 0.6s ease-out' }}></div>
          </div>
        </div>
      </div>

      {profileComplete ? (
        <button onClick={onDone}
          style={{ width: '100%', background: 'linear-gradient(135deg, #DB2777 0%, #7C3AED 100%)', color: '#fff', border: 'none', padding: '16px 20px', borderRadius: 12, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 6px 18px rgba(124,58,237,0.30)' }}>
          Voir les résultats →
        </button>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={onAnother}
            style={{ background: 'linear-gradient(135deg, #DB2777 0%, #7C3AED 100%)', color: '#fff', border: 'none', padding: '14px 16px', borderRadius: 12, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 6px 18px rgba(124,58,237,0.30)' }}>
            Oui, encore une !
          </button>
          <button onClick={onDone}
            style={{ background: '#fff', color: T.text2, border: `2px solid ${T.border}`, padding: '14px 16px', borderRadius: 12, fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Voir les résultats
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   ReliabilityPanel — affiché au-dessus des résultats
// ════════════════════════════════════════════════════════════
function ReliabilityPanel({ poll }) {
  const T = window.T;
  const rel = useMemo(() => computeReliability(poll), [poll.id, poll.votes_total]);
  const [expanded, setExpanded] = useState(false);
  const [weighted, setWeighted] = useState(false);

  const c = scoreColor(rel.score);
  const margin = useMemo(() => weighted ? computeMargin(rel) : null, [weighted, rel]);

  // Expose au parent (PollResults) via window pour partager le state weighted
  useEffect(() => {
    window.__pollWeighted = weighted ? { poll: poll.id, margin: margin?.margin } : null;
    window.dispatchEvent(new CustomEvent('mn-poll-weighted-change', { detail: { weighted, margin: margin?.margin, pollId: poll.id } }));
  }, [weighted, margin, poll.id]);

  return (
    <div style={{ background: '#fff', border: `2px solid ${c}30`, borderRadius: 16, padding: '18px 20px', marginBottom: 22, boxShadow: `0 4px 16px ${c}10` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {/* Cercle de score */}
        <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
          <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="36" cy="36" r="30" fill="none" stroke={T.surface2} strokeWidth="6" />
            <circle cx="36" cy="36" r="30" fill="none" stroke={c} strokeWidth="6"
              strokeDasharray={`${(rel.score / 100) * 188.5} 188.5`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.8s ease-out' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: c, lineHeight: 1 }}>{rel.score}</div>
            <div style={{ fontSize: 9, color: T.text4, fontWeight: 700, marginTop: 1 }}>/ 100</div>
          </div>
        </div>

        {/* Libellé */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            🔬 Fiabilité scientifique
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: T.text1 }}>{scoreLabel(rel.score)}</span>
            <span style={{ padding: '3px 10px', borderRadius: 9999, background: scoreBg(rel.score), color: c, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {scoreLabel(rel.score)}
            </span>
          </div>
          <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5 }}>
            {rel.confirmed.toLocaleString('fr-FR')} votes confirmés · {rel.profiles.toLocaleString('fr-FR')} profils renseignés
          </div>
        </div>

        {/* Toggle détail */}
        <button onClick={() => setExpanded(!expanded)}
          style={{ background: T.surface2, border: 'none', color: T.text2, padding: '8px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}>
          {expanded ? '▲ Masquer' : '▼ Voir le détail'}
        </button>
      </div>

      {/* Détail des 4 axes */}
      {expanded && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px dashed ${T.border}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {Object.entries(rel.axes).map(([key, axis]) => {
            const ac = scoreColor(axis.score);
            const meets = axis.score >= axis.threshold;
            return (
              <div key={key} style={{ background: T.surface2, borderRadius: 12, padding: '12px 14px', border: meets ? `1px solid ${ac}40` : `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{axis.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.text2, lineHeight: 1.2 }}>{axis.label}</div>
                    <div style={{ fontSize: 11, color: T.text4 }}>{axis.value}</div>
                  </div>
                  <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: ac }}>{axis.score}</span>
                </div>
                <div style={{ height: 5, background: '#fff', borderRadius: 9999, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${axis.score}%`, background: ac, borderRadius: 9999, transition: 'width 0.6s ease-out' }}></div>
                  {/* Marqueur de seuil */}
                  <div style={{ position: 'absolute', top: -2, left: `${axis.threshold}%`, width: 2, height: 9, background: T.text4 }} title={`Seuil : ${axis.threshold}`}></div>
                </div>
                {!meets && (
                  <div style={{ fontSize: 10, color: T.text4, marginTop: 4, fontStyle: 'italic' }}>Seuil min. : {axis.threshold}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Toggle pondéré / brut */}
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
        {rel.viable ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 2, padding: 3, background: T.surface2, borderRadius: 9999 }}>
              {[['raw', 'Résultats bruts'], ['weighted', 'Résultats pondérés']].map(([k, l]) => (
                <button key={k} onClick={() => setWeighted(k === 'weighted')}
                  style={{ padding: '7px 14px', borderRadius: 9999, border: 'none', background: (weighted ? 'weighted' : 'raw') === k ? '#fff' : 'transparent', color: (weighted ? 'weighted' : 'raw') === k ? T.text1 : T.text3, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', boxShadow: (weighted ? 'weighted' : 'raw') === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
                  {l}
                </button>
              ))}
            </div>
            {weighted && margin && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 9999, fontSize: 12, fontWeight: 700, color: '#78350F' }}>
                📐 Marge d'erreur ± {margin.margin} pts · IC 95 %
              </span>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: T.text3, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            Le toggle <strong style={{ color: T.text2 }}>« Résultats pondérés »</strong> apparaîtra dès que tous les axes seront atteints.
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   PollResults — Diagramme + résultats
// ════════════════════════════════════════════════════════════
function PollResults({ poll, augmentedVotes, sorted, totalVotes, userVote, meta, viewMode = 'photo' }) {
  const T = window.T;
  const [chartType, setChartType] = useState('bars');
  const [weightedState, setWeightedState] = useState({ weighted: false, margin: null });
  const userVoteIds = poll.multi ? (Array.isArray(userVote) ? userVote : [userVote]) : [userVote].filter(Boolean);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail.pollId === poll.id) {
        setWeightedState({ weighted: e.detail.weighted, margin: e.detail.margin });
      }
    };
    window.addEventListener('mn-poll-weighted-change', handler);
    return () => window.removeEventListener('mn-poll-weighted-change', handler);
  }, [poll.id]);

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:700, color:T.text1, margin:0 }}>
          📊 Résultats {weightedState.weighted ? 'pondérés' : 'en temps réel'}
        </h2>
        <div style={{ display:'flex', gap:4, padding:4, background:T.surface2, borderRadius:9999 }}>
          {[['bars','Barres','📊'],['donut','Camembert','🥧']].map(([k,l,i]) => (
            <button key={k} onClick={() => setChartType(k)}
              style={{ padding:'6px 14px', borderRadius:9999, border:'none', background: chartType === k ? '#fff' : 'transparent', color: chartType === k ? T.text1 : T.text3, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif', boxShadow: chartType === k ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
              {i} {l}
            </button>
          ))}
        </div>
      </div>

      {chartType === 'bars' ? (
        <BarsChart options={sorted} totalVotes={totalVotes} userVoteIds={userVoteIds} viewMode={viewMode} weighted={weightedState.weighted} margin={weightedState.margin} />
      ) : (
        <DonutChart options={augmentedVotes} totalVotes={totalVotes} userVoteIds={userVoteIds} viewMode={viewMode} />
      )}

      {userVote && (
        <div style={{ marginTop:22, padding:'14px 18px', background:meta.bg, borderRadius:14, border:`1px solid ${meta.color}40`, display:'flex', alignItems:'center', gap:12, flexWrap: 'wrap' }}>
          <div style={{ fontSize:22 }}>✓</div>
          <div style={{ flex:1, fontSize:13, color:T.text2, lineHeight:1.5 }}>
            <strong style={{ color:meta.color }}>Votre vote :</strong>{' '}
            {userVoteIds.map(id => {
              const opt = poll.options.find(o => o.id === id);
              if (!opt) return null;
              return (
                <span key={id} style={{ display:'inline-flex', alignItems:'center', gap:6, marginRight:10 }}>
                  {viewMode === 'photo' && getPhoto(opt.img)
                    ? <img src={getPhoto(opt.img)} alt="" style={{ width:22, height:22, borderRadius:6, objectFit:'cover', border:`1px solid ${T.border}` }} />
                    : <span>{getEmoji(opt.img)}</span>}
                  <span>{opt.label}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

// ── Bars chart (avec whiskers en mode pondéré) ────────────
function BarsChart({ options, totalVotes, userVoteIds, viewMode, weighted, margin }) {
  const T = window.T;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {options.map((opt, i) => {
        const pct = totalVotes ? (opt.votes / totalVotes) * 100 : 0;
        const isLeader = i === 0;
        const userVoted = userVoteIds.includes(opt.id);
        const lowBound = Math.max(0, pct - (margin || 0));
        const highBound = Math.min(100, pct + (margin || 0));
        return (
          <div key={opt.id} style={{ background: T.surface2, borderRadius:12, padding:'12px 16px', border: userVoted ? `2px solid ${opt.color}` : `1px solid ${T.border}`, position:'relative' }}>
            {userVoted && (
              <span style={{ position:'absolute', top:-9, right:14, background:opt.color, color:'#fff', fontSize:9, fontWeight:800, padding:'2px 8px', borderRadius:9999, letterSpacing:'0.04em', textTransform:'uppercase' }}>Votre vote</span>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
              <OptionAvatar img={opt.img} color={opt.color} size={40} mode={viewMode} ringWhenSelected={false} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:8 }}>
                  <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, color:T.text1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {isLeader && '🏆 '}{opt.label}
                  </span>
                  <span style={{ display:'flex', gap:8, alignItems:'baseline', flexShrink:0 }}>
                    <span style={{ fontSize:11, color:T.text4 }}>{opt.votes.toLocaleString('fr-FR')}</span>
                    <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color: opt.color }}>{pct.toFixed(1)}%</span>
                  </span>
                </div>
                {opt.party && <div style={{ fontSize:11, color:opt.color, fontWeight:600, marginTop:1 }}>{opt.party}</div>}
              </div>
            </div>
            {/* Barre + whiskers */}
            <div style={{ position: 'relative', height: 18, marginBottom: weighted ? 4 : 0 }}>
              <div style={{ position: 'absolute', top: 4, left: 0, right: 0, height:10, background:'#fff', borderRadius:9999, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, background: `linear-gradient(90deg, ${opt.color} 0%, ${opt.color}DD 100%)`, borderRadius:9999, transition:'width 1s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 12px ${opt.color}40` }}></div>
              </div>
              {/* Whiskers (moustaches) */}
              {weighted && margin > 0 && (
                <>
                  {/* Ligne horizontale incertitude */}
                  <div style={{ position: 'absolute', top: 8, left: `${lowBound}%`, width: `${highBound - lowBound}%`, height: 2, background: '#1A1A18', borderRadius: 1 }}></div>
                  {/* Moustache gauche */}
                  <div style={{ position: 'absolute', top: 3, left: `${lowBound}%`, width: 2, height: 12, background: '#1A1A18', transform: 'translateX(-1px)' }}></div>
                  {/* Moustache droite */}
                  <div style={{ position: 'absolute', top: 3, left: `${highBound}%`, width: 2, height: 12, background: '#1A1A18', transform: 'translateX(-1px)' }}></div>
                </>
              )}
            </div>
            {weighted && margin > 0 && (
              <div style={{ fontSize: 10, color: T.text4, fontWeight: 600, fontStyle: 'italic', marginTop: 2 }}>
                Intervalle : {lowBound.toFixed(1)} % — {highBound.toFixed(1)} %
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Donut chart ───────────────────────────────────────────
function DonutChart({ options, totalVotes, userVoteIds, viewMode = 'photo' }) {
  const T = window.T;
  const radius = 90;
  const stroke = 38;
  const norm = radius - stroke / 2;
  const circ = 2 * Math.PI * norm;

  let cumulative = 0;
  const segments = options.map(opt => {
    const pct = totalVotes ? opt.votes / totalVotes : 0;
    const dash = pct * circ;
    const offset = circ - cumulative * circ;
    cumulative += pct;
    return { ...opt, dash, offset, pct };
  });

  return (
    <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:30, alignItems:'center', padding:'14px 0' }} className="mn-donut-grid">
      <div style={{ position:'relative', width:radius*2, height:radius*2, justifySelf:'center' }}>
        <svg width={radius*2} height={radius*2} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={radius} cy={radius} r={norm} fill="none" stroke={T.surface2} strokeWidth={stroke} />
          {segments.map((seg) => (
            <circle key={seg.id} cx={radius} cy={radius} r={norm} fill="none" stroke={seg.color} strokeWidth={stroke}
              strokeDasharray={`${seg.dash} ${circ - seg.dash}`} strokeDashoffset={seg.offset}
              style={{ transition:'all 0.8s ease-out' }} />
          ))}
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:24, color:T.text1, lineHeight:1 }}>{totalVotes.toLocaleString('fr-FR')}</div>
          <div style={{ fontSize:10, color:T.text3, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginTop:4 }}>Votes</div>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {[...segments].sort((a,b)=>b.pct-a.pct).map(seg => {
          const userVoted = userVoteIds.includes(seg.id);
          return (
            <div key={seg.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background: userVoted ? `${seg.color}10` : T.surface, borderRadius:10, border: userVoted ? `1px solid ${seg.color}` : `1px solid ${T.border}` }}>
              <div style={{ width:14, height:14, borderRadius:4, background:seg.color, flexShrink:0 }}></div>
              {viewMode === 'photo' && getPhoto(seg.img)
                ? <img src={getPhoto(seg.img)} alt="" style={{ width:24, height:24, borderRadius:6, objectFit:'cover', flexShrink:0, border:`1px solid ${T.border}` }} />
                : <div style={{ fontSize:18, width:24, textAlign:'center', flexShrink:0 }}>{getEmoji(seg.img)}</div>}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:13, color:T.text1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{seg.label}</div>
                {seg.party && <div style={{ fontSize:10, color:T.text3 }}>{seg.party}</div>}
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:14, color:seg.color }}>{(seg.pct*100).toFixed(1)}%</div>
                <div style={{ fontSize:10, color:T.text4 }}>{seg.votes.toLocaleString('fr-FR')}</div>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@media (max-width: 600px) { .mn-donut-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

window.PollsPage = PollsPage;
window.POLL_DEMOGRAPHIC_FIELDS = POLL_DEMOGRAPHIC_FIELDS;
