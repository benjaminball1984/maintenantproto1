// PollsPage.jsx — Service Sondages (élections, société, pronostics)
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

// ════════════════════════════════════════════════════════════
//  CATÉGORIES DE PROFIL (méthode des quotas — INSEE)
//  Chaque vote confirmé déclenche une question piochée au hasard
//  parmi celles non encore renseignées sur le profil de l'utilisateur·rice.
// ════════════════════════════════════════════════════════════
const POLL_DEMOGRAPHIC_FIELDS = [
  { id:'age',           short:'Âge',                label:"Quelle est votre tranche d'âge ?",
    options:['18-24 ans','25-34 ans','35-49 ans','50-64 ans','65 ans et plus'] },
  { id:'gender',        short:'Genre',              label:'Quel est votre genre ?',
    options:['Femme','Homme','Non-binaire / Autre','Préfère ne pas répondre'] },
  { id:'csp',           short:'CSP',                label:'Quelle est votre catégorie socio-professionnelle ?',
    options:['Agricultrice / Agriculteur','Artisan·e, commerçant·e, chef·fe d\'entreprise','Cadre, profession intellectuelle supérieure','Profession intermédiaire','Employé·e','Ouvrier·ère','Retraité·e','Étudiant·e','Sans emploi','Autre / Refus'] },
  { id:'education',     short:'Diplôme',            label:'Quel est votre plus haut niveau de diplôme ?',
    options:['Sans diplôme','Brevet (BEPC)','CAP / BEP','Baccalauréat','Bac +2 (BTS, DUT, DEUG)','Bac +3 (Licence, BUT)','Bac +5 (Master, ingénieur)','Bac +8 (Doctorat)'] },
  { id:'vote_pres_2022',short:'Présidentielle 2022',label:'Pour qui avez-vous voté au 1er tour de la présidentielle 2022 ?',
    options:['Emmanuel Macron','Marine Le Pen','Jean-Luc Mélenchon','Éric Zemmour','Valérie Pécresse','Yannick Jadot','Jean Lassalle','Fabien Roussel','Nicolas Dupont-Aignan','Anne Hidalgo','Philippe Poutou','Nathalie Arthaud','Vote blanc / nul','Abstention','Préfère ne pas répondre'] },
  { id:'vote_eu_2024',  short:'Européennes 2024',   label:'Pour quelle liste avez-vous voté aux européennes 2024 ?',
    options:['RN — Bardella','PS / Place publique — Glucksmann','Renaissance — Hayer','LFI — Aubry','EELV — Toussaint','Reconquête — Maréchal','LR — Bellamy','PCF — Deffontaines','Autre liste','Vote blanc / nul','Abstention','Préfère ne pas répondre'] },
  { id:'housing',       short:'Logement',           label:'Quel est le statut de votre logement ?',
    options:['Propriétaire','Locataire (privé)','Locataire (HLM)','Hébergé·e gratuitement','Autre'] },
  { id:'diet',          short:'Régime alimentaire', label:'Quel est votre régime alimentaire ?',
    options:['Omnivore','Flexitarien·ne','Pesco-végétarien·ne','Végétarien·ne','Végane'] },
  { id:'income',        short:'Revenu',             label:'Quel est le revenu mensuel net de votre foyer ?',
    options:['Moins de 1 000 €','1 000 — 1 500 €','1 500 — 2 500 €','2 500 — 4 000 €','4 000 — 6 000 €','Plus de 6 000 €','Préfère ne pas répondre'] },
  { id:'family',        short:'Situation familiale',label:'Quelle est votre situation familiale ?',
    options:['Célibataire sans enfant','En couple sans enfant','En couple avec enfant(s)','Famille monoparentale','Veuf·ve','Autre'] },
  { id:'postal_code',   short:'Code postal',        label:'Quel est votre code postal ?', type:'text', placeholder:'75011' },
  { id:'zone_type',     short:'Type de territoire', label:'Dans quel type de territoire vivez-vous ?',
    options:['Urbain (grande ville)','Périurbain (banlieue)','Rural'] },
  { id:'religion',      short:'Religion',           label:'Quel est votre rapport à la religion ?',
    options:['Sans religion / Athée','Catholique pratiquant·e','Catholique non pratiquant·e','Musulman·e pratiquant·e','Musulman·e non pratiquant·e','Protestant·e','Juif·ve','Bouddhiste','Autre','Préfère ne pas répondre'] },
  { id:'media_trust',   short:'Confiance médias',   label:'Quel est votre niveau de confiance dans les médias traditionnels ?',
    options:['Très faible','Faible','Moyenne','Forte','Très forte'] },
  { id:'engagement',    short:'Engagement',         label:'Quel est votre niveau d\'engagement militant ou associatif ?',
    options:['Aucun','Occasionnel','Régulier','Très actif (élu·e, militant·e)'] },
];
window.POLL_DEMOGRAPHIC_FIELDS = POLL_DEMOGRAPHIC_FIELDS;

// Pioche au hasard une question non encore renseignée
const pickRandomMissingField = (user) => {
  const filled = (user && user.demographics) || {};
  const missing = POLL_DEMOGRAPHIC_FIELDS.filter(f => !filled[f.id]);
  if (missing.length === 0) return null;
  return missing[Math.floor(Math.random() * missing.length)];
};

// Compte de questions remplies sur 15
const profileCompleteness = (user) => {
  const filled = (user && user.demographics) || {};
  const n = POLL_DEMOGRAPHIC_FIELDS.filter(f => filled[f.id]).length;
  return { filled: n, total: POLL_DEMOGRAPHIC_FIELDS.length, pct: Math.round((n / POLL_DEMOGRAPHIC_FIELDS.length) * 100) };
};

// ════════════════════════════════════════════════════════════
//  FIABILITÉ SCIENTIFIQUE — méthode des quotas
//  Calcule un score de fiabilité et la marge d'erreur d'un sondage
//  selon : nombre de votes, profils renseignés, complétion moyenne, diversité.
// ════════════════════════════════════════════════════════════
// Générateur déterministe (même résultat à chaque rendu pour un même sondage)
const seededRand = seed => {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
};

const pollScience = (poll) => {
  const rng = seededRand(poll.id * 73 + 11);
  const total = poll.votes_total;
  // Confirmé par email (prototype : 70-86%)
  const confirmedRatio = 0.70 + rng() * 0.16;
  // Profils renseignés (prototype : 18-44 % du total)
  const profilesRatio  = 0.18 + rng() * 0.26;
  // Complétion moyenne par profil (prototype : 30-65 %)
  const completion     = 0.30 + rng() * 0.35;
  // Diversité (prototype : 0.45-0.92)
  const diversity      = 0.45 + rng() * 0.47;

  const confirmed   = Math.round(total * confirmedRatio);
  const profiles    = Math.round(total * profilesRatio);
  const completionPct = Math.round(completion * 100);
  const diversityPct  = Math.round(diversity * 100);

  // Score de fiabilité globale (0-100) — moyenne pondérée des 4 axes
  const reliability = Math.round(
    Math.min(1, total / 5000) * 22 +     // nombre de votes
    Math.min(1, profiles / 800) * 28 +   // nombre de profils
    completion * 25 +                     // complétion moyenne
    diversity * 25                        // diversité
  );

  // Viabilité : peut-on appliquer la méthode des quotas ?
  // → Oui si chaque axe atteint son seuil minimum
  const axes = {
    votes:      Math.min(1, total / 1200),
    profiles:   Math.min(1, profiles / 350),
    completion: Math.min(1, completion / 0.40),
    diversity:  Math.min(1, diversity / 0.55),
  };
  const canWeight = Object.values(axes).every(v => v >= 1);

  // Marge d'erreur (statistique classique + design effect)
  // Échantillon effectif = profils × complétion ÷ design_effect
  const designEffect = 1 + (1 - diversity) * 1.4;
  const effectiveN   = Math.max(1, profiles * completion / designEffect);
  // ME 95% pour proportions ≈ 1.96 × √(0.25/n) en points de %
  const marginRaw = 196 / Math.sqrt(effectiveN);
  const margin    = Math.round(Math.min(15, marginRaw) * 10) / 10;

  return {
    confirmed, profiles, completionPct, diversityPct,
    reliability, canWeight, margin,
    axes,
    rngSeed: poll.id * 73 + 11,  // pour générer les résultats pondérés
  };
};

// Résultats pondérés (méthode des quotas) — simulation déterministe
// On applique de petits ajustements aux % bruts pour simuler la repondération.
const weightedOptions = (poll, science) => {
  const rng = seededRand(science.rngSeed + 7);
  const total = poll.votes_total + 0;
  const baseRaw = poll.options.map(o => ({ ...o, rawPct: total ? (o.votes / total) * 100 : 0 }));
  // Ajustements ±2.5 points par option (simulation de l'effet quotas)
  const adjusted = baseRaw.map(o => {
    const delta = (rng() - 0.5) * 5;
    const wp = Math.max(0, o.rawPct + delta);
    return { ...o, weightedPct: wp };
  });
  // Renormaliser à 100 %
  const sum = adjusted.reduce((s, o) => s + o.weightedPct, 0);
  return adjusted.map(o => ({ ...o, weightedPct: sum ? (o.weightedPct / sum) * 100 : 0 }));
};

// Couleur du score de fiabilité
const reliabilityColor = (score) => {
  if (score >= 70) return '#16A34A';
  if (score >= 50) return '#D97706';
  if (score >= 30) return '#DC2626';
  return '#6B7280';
};

// ── Time helpers ──────────────────────────────────────────
const fmtDate = s => new Date(s).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' });
const daysLeft = closes => {
  const d = Math.ceil((new Date(closes) - new Date()) / (1000 * 60 * 60 * 24));
  if (d < 0) return { txt: 'Clos', color: window.T.text4 };
  if (d === 0) return { txt: 'Dernier jour', color: '#DC2626' };
  if (d <= 7) return { txt: `Encore ${d} j`, color: '#DC2626' };
  return { txt: `Encore ${d} j`, color: window.T.text3 };
};

// ── Avatar option (picto OU photo) ────────────────────────
const POLL_VIEW_KEY = 'mn_poll_avatar_mode';
const loadView = () => localStorage.getItem(POLL_VIEW_KEY) || 'photo';
const saveView = v => { try { localStorage.setItem(POLL_VIEW_KEY, v); } catch {} };

// `img` peut être : string (emoji legacy) | { emoji, photo }
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
      flexShrink: 0,
      overflow: 'hidden',
      border: ringWhenSelected ? `2px solid ${selected ? color : 'transparent'}` : 'none',
      transition: 'all 0.18s',
      position: 'relative',
    }}>
      {usePhoto ? (
        <img
          src={photo}
          alt=""
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = `<span style="font-size:${size*0.55}px">${emoji}</span>`; }}
        />
      ) : (
        <span style={{ fontSize: Math.round(size * 0.55), lineHeight: 1 }}>{emoji}</span>
      )}
    </div>
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
  const setView = v => { setViewMode(v); saveView(v); };

  const polls = window.AppData.polls;
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
      user={user}
      setUser={setUser}
      onAuth={onAuth}
      onBack={() => setActivePoll(null)}
      votes={votes}
      setVotes={setVotes}
      viewMode={viewMode}
      setViewMode={setView}
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
            Élections, société, pronostics. Donnez votre voix sans publicité, sans ciblage, sans données revendues. Vote réservé aux membres certifié·es.
          </p>
          <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            {[[`${polls.length}`,'Sondages actifs'],[`${polls.reduce((a,p)=>a+p.votes_total,0).toLocaleString('fr-FR')}`,'Votes exprimés'],[`${user?'Connecté·e':'Non connecté·e'}`,'Votre statut']].map(([n,l])=>(
              <div key={l}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:11, opacity:0.75, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters + Toggle picto/photo */}
      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', overflowX:'auto', padding:'2px 0' }}>
          {filterButtons.map(([key, label, count]) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{
                padding: '10px 16px',
                borderRadius: 9999,
                border: filter === key ? `1.5px solid ${T.brand}` : `1.5px solid ${T.border}`,
                background: filter === key ? T.brand : T.surface,
                color: filter === key ? '#fff' : T.text2,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'Inter,sans-serif',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
              {label}
              <span style={{ fontSize:11, padding:'1px 7px', borderRadius:9999, background: filter === key ? 'rgba(255,255,255,0.25)' : T.surface2, color: filter === key ? '#fff' : T.text4 }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Toggle Picto / Photo */}
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

      {/* Cards grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(330px, 1fr))', gap:18 }}>
        {filtered.map(poll => (
          <PollCard
            key={poll.id}
            poll={poll}
            voted={!!votes[poll.id]}
            onClick={() => setActivePoll(poll)}
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* CTA fond de page */}
      <div style={{ marginTop:48, padding:'32px 28px', background:T.surface, borderRadius:20, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:260 }}>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, margin:'0 0 6px' }}>Lancer un sondage ?</h3>
          <p style={{ fontSize:14, color:T.text3, margin:0, lineHeight:1.55 }}>Les modérateur·rices et adhérent·es de la Confédération peuvent proposer un sondage. Validation par le comité éditorial sous 48h.</p>
        </div>
        <Btn variant="outline" size="md" onClick={()=>user ? alert('Formulaire de proposition de sondage à venir') : onAuth()}>
          {user ? 'Proposer un sondage' : 'Se connecter pour proposer'}
        </Btn>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   PollCard — carte d'un sondage dans la liste
// ════════════════════════════════════════════════════════════
function PollCard({ poll, voted, onClick, viewMode = 'photo' }) {
  const T = window.T;
  const [hov, setHov] = useState(false);
  const meta = TYPE_META[poll.type] || TYPE_META.societe;
  const dl = daysLeft(poll.closes);
  const top3 = [...poll.options].sort((a,b)=>b.votes-a.votes).slice(0, 3);
  const max = Math.max(...poll.options.map(o => o.votes));
  const science = useMemo(() => pollScience(poll), [poll.id]);
  const relColor = reliabilityColor(science.reliability);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.surface,
        border: `1px solid ${hov ? T.brand : T.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 16px 36px rgba(225,29,116,0.12)` : '0 1px 3px rgba(0,0,0,0.04)',
      }}>

      {/* Header coloré par type */}
      <div style={{
        background: meta.bg,
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${T.border}`,
      }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, color:meta.color, textTransform:'uppercase', letterSpacing:'0.06em' }}>
          <span>{meta.icon}</span>{meta.label}
        </span>
        <span style={{ fontSize:11, fontWeight:600, color:dl.color, display:'inline-flex', alignItems:'center', gap:4 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:dl.color }}></span>{dl.txt}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px' }}>
        <div style={{ fontSize:11, color:T.text4, fontWeight:600, marginBottom:6, letterSpacing:'0.04em' }}>{poll.category}</div>
        <h3 style={{
          fontFamily: "'Sora',sans-serif",
          fontSize: 17, fontWeight: 800, color: T.text1,
          margin: '0 0 12px', lineHeight: 1.25,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
        }}>{poll.title}</h3>

        {/* Top 3 results preview (always shown — even si pas voté, c'est un sondage public) */}
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

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:`1px solid ${T.border}`, gap:8, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:T.text4, fontWeight:600 }}>
            <span>{poll.votes_total.toLocaleString('fr-FR')} votes</span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 7px', background:`${relColor}15`, color:relColor, borderRadius:9999, fontSize:10, fontWeight:800 }}>
              ⊙ Fiabilité {science.reliability}
            </span>
          </div>
          {voted ? (
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700, color:T.success, padding:'3px 8px', background:T.successLight, borderRadius:9999 }}>
              ✓ Vous avez voté
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
//   PollDetail — Vue détail + vote + résultats
//   Parcours :  vote  →  email  →  confirm  →  question  →  thanks  →  done
// ════════════════════════════════════════════════════════════
function PollDetail({ poll, user, setUser, onAuth, onBack, votes, setVotes, viewMode = 'photo', setViewMode }) {
  const T = window.T;
  const meta = TYPE_META[poll.type] || TYPE_META.societe;
  const dl = daysLeft(poll.closes);
  const userVote = votes[poll.id];
  const [selected, setSelected] = useState(userVote ? (poll.multi ? userVote : [userVote]) : []);
  const [hoverOpt, setHoverOpt] = useState(null);

  // ── Stages du parcours de confirmation ───────────────────
  // 'vote' (par défaut) → 'email' → 'confirmed' → 'question' → 'thanks' → 'done' (résultats)
  const [stage, setStage] = useState(userVote ? 'done' : 'vote');
  const [pendingChoice, setPendingChoice] = useState(null);
  const [currentField, setCurrentField] = useState(null);
  const [demoValue, setDemoValue]       = useState('');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const hasVoted = !!userVote || stage === 'done';

  // Augmenter les votes localement après vote pour effet immédiat
  const [localBump, setLocalBump] = useState({});
  const augmentedVotes = poll.options.map(o => ({
    ...o,
    votes: o.votes + (localBump[o.id] || 0),
  }));
  const totalVotes = poll.votes_total + Object.values(localBump).reduce((a,b)=>a+b, 0);
  const sorted = [...augmentedVotes].sort((a,b)=>b.votes - a.votes);

  const toggleOption = id => {
    if (poll.multi) {
      if (selected.includes(id)) {
        setSelected(selected.filter(x => x !== id));
      } else if (selected.length < (poll.max_choices || poll.options.length)) {
        setSelected([...selected, id]);
      }
    } else {
      setSelected([id]);
    }
  };

  // Étape 1 : l'utilisateur·rice clique sur « Valider mon vote »
  // → on n'enregistre pas encore le vote, on envoie un email de confirmation simulé.
  const submitVote = () => {
    if (!user) { onAuth(); return; }
    if (selected.length === 0) return;
    setPendingChoice([...selected]);
    setStage('email');
  };

  // Étape 2 : clic sur le faux email → vote enregistré pour de bon
  const confirmFromEmail = () => {
    const newVotes = { ...votes, [poll.id]: poll.multi ? pendingChoice : pendingChoice[0] };
    setVotes(newVotes);
    saveVotes(newVotes);
    const bump = {};
    pendingChoice.forEach(id => bump[id] = (localBump[id] || 0) + 1);
    setLocalBump(prev => ({ ...prev, ...bump }));
    setStage('confirmed');
  };

  // Étape 3 : passage de la confirmation à la 1ère question (ou direct résultats si profil complet)
  const startDemographic = () => {
    const next = pickRandomMissingField(user);
    if (!next) { setStage('done'); return; }
    setCurrentField(next);
    setDemoValue('');
    setStage('question');
  };

  // Étape 4 : la personne répond à une question
  const submitDemographic = () => {
    if (!demoValue.trim() || !currentField) return;
    const updated = { ...user, demographics: { ...(user.demographics || {}), [currentField.id]: demoValue.trim() } };
    if (typeof setUser === 'function') setUser(updated);
    setQuestionsAnswered(n => n + 1);
    setStage('thanks');
  };

  // Étape 5 : la personne accepte de répondre à une autre question
  const askAnother = () => {
    const fakeUpdated = { ...user, demographics: user?.demographics || {} };
    const next = pickRandomMissingField(fakeUpdated);
    if (!next) { setStage('done'); return; }
    setCurrentField(next);
    setDemoValue('');
    setStage('question');
  };

  // L'utilisateur·rice termine le parcours (skip ou bouton "Voir les résultats")
  const finishFlow = () => setStage('done');

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px 20px 100px' }}>
      {/* Back + toggle */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, gap:10, flexWrap:'wrap' }}>
        <button onClick={onBack}
          style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:9999, fontSize:13, color:T.text2, cursor:'pointer', fontFamily:'Inter,sans-serif', fontWeight:600 }}
          onMouseEnter={e=>{e.currentTarget.style.background=T.surface2; e.currentTarget.style.borderColor=T.borderDark}}
          onMouseLeave={e=>{e.currentTarget.style.background=T.surface; e.currentTarget.style.borderColor=T.border}}>
          ← Tous les sondages
        </button>

        {setViewMode && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 6px 4px 10px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:9999 }}>
            <span style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase' }}>Affichage</span>
            <div style={{ display:'flex', gap:2, padding:2, background:T.surface2, borderRadius:9999 }}>
              {[['photo','📷 Photos'],['emoji','😀 Pictos']].map(([k,l]) => (
                <button key={k} onClick={()=>setViewMode(k)}
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
        )}
      </div>

      {/* Card */}
      <div style={{ background:T.surface, borderRadius:20, border:`1px solid ${T.border}`, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
        {/* Header coloré */}
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

        {/* Body */}
        <div style={{ padding:'24px 28px' }}>
          {/* Méta */}
          <div style={{ display:'flex', gap:18, alignItems:'center', flexWrap:'wrap', fontSize:12, color:T.text3, marginBottom:22, paddingBottom:16, borderBottom:`1px dashed ${T.border}` }}>
            <span>👤 <strong style={{ color:T.text2 }}>{poll.author}</strong></span>
            <span>📅 Du {fmtDate(poll.created)} au {fmtDate(poll.closes)}</span>
            {poll.multi && <span>☑️ Vote multiple (max {poll.max_choices})</span>}
            {poll.requires_account && <span>🔒 Compte requis</span>}
          </div>

          {/* Login banner */}
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

          {/* ═════ Stage : VOTE (sélection des options) ═════ */}
          {stage === 'vote' && (
            <>
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
                    <button key={opt.id}
                      onClick={() => toggleOption(opt.id)}
                      onMouseEnter={() => setHoverOpt(opt.id)}
                      onMouseLeave={() => setHoverOpt(null)}
                      style={{
                        display:'flex', alignItems:'center', gap:14,
                        padding:'14px 18px',
                        background: isSel ? `${opt.color}10` : T.surface,
                        border: `2px solid ${isSel ? opt.color : (isHov ? T.borderDark : T.border)}`,
                        borderRadius:14,
                        cursor:'pointer',
                        textAlign:'left',
                        fontFamily:'Inter,sans-serif',
                        transition:'all 0.18s',
                        width:'100%',
                      }}>
                      <OptionAvatar img={opt.img} color={opt.color} size={54} mode={viewMode} selected={isSel} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:T.text1, marginBottom:opt.party || opt.desc ? 3 : 0 }}>
                          {opt.label}
                        </div>
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

              <Btn variant="gradient" size="lg" disabled={selected.length === 0}
                onClick={submitVote}
                style={{ width:'100%' }}>
                {!user ? '🔒 Se connecter pour voter' : selected.length === 0 ? 'Sélectionnez une option' : `Valider mon vote${selected.length > 1 ? `s (${selected.length})` : ''}`}
              </Btn>
              <div style={{ fontSize:11, color:T.text4, textAlign:'center', marginTop:10 }}>
                Vote confirmé par email · Profil scientifique progressif · Aucune donnée revendue
              </div>
            </>
          )}

          {/* ═════ Stage : EMAIL — confirmation simulée ═════ */}
          {stage === 'email' && (
            <EmailConfirmStep
              user={user}
              poll={poll}
              meta={meta}
              pendingChoice={pendingChoice}
              onConfirm={confirmFromEmail}
              onCancel={() => setStage('vote')}
              viewMode={viewMode}
            />
          )}

          {/* ═════ Stage : CONFIRMED — page d'arrivée ═════ */}
          {stage === 'confirmed' && (
            <ConfirmedStep
              user={user}
              poll={poll}
              meta={meta}
              completeness={profileCompleteness(user)}
              onContinue={startDemographic}
              onSkip={finishFlow}
            />
          )}

          {/* ═════ Stage : QUESTION — une question piochée au hasard ═════ */}
          {stage === 'question' && currentField && (
            <DemographicQuestion
              field={currentField}
              value={demoValue}
              setValue={setDemoValue}
              onSubmit={submitDemographic}
              onSkip={finishFlow}
              completeness={profileCompleteness(user)}
              questionsAnswered={questionsAnswered}
              meta={meta}
            />
          )}

          {/* ═════ Stage : THANKS — proposer une autre question ═════ */}
          {stage === 'thanks' && (
            <ThanksStep
              completeness={profileCompleteness(user)}
              questionsAnswered={questionsAnswered}
              onAnother={askAnother}
              onFinish={finishFlow}
              meta={meta}
            />
          )}

          {/* ═════ Stage : DONE — résultats ═════ */}
          {stage === 'done' && (
            <PollResults
              poll={poll}
              augmentedVotes={augmentedVotes}
              sorted={sorted}
              totalVotes={totalVotes}
              userVote={userVote || (poll.multi ? pendingChoice : (pendingChoice && pendingChoice[0]))}
              meta={meta}
              viewMode={viewMode}
            />
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop:18, padding:'14px 18px', background:T.surface2, borderRadius:12, fontSize:12, color:T.text3, lineHeight:1.55 }}>
        <strong style={{ color:T.text2 }}>⚠️ Sondage sans valeur scientifique.</strong> Les résultats reflètent uniquement la communauté de la plateforme Maintenant!. Ils ne constituent pas une enquête d'opinion représentative au sens des instituts de sondage agréés.
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   EmailConfirmStep — Étape 2 : faux email envoyé
// ════════════════════════════════════════════════════════════
function EmailConfirmStep({ user, poll, meta, pendingChoice, onConfirm, onCancel, viewMode }) {
  const T = window.T;
  const choiceLabels = pendingChoice.map(id => poll.options.find(o => o.id === id)).filter(Boolean);
  return (
    <div>
      <div style={{ background:'linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 100%)', border:`1.5px solid #93C5FD`, borderRadius:16, padding:'22px 24px', marginBottom:22 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>📧</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:800, color:'#1E3A8A', marginBottom:2 }}>Confirme ton vote par email</div>
            <div style={{ fontSize:13, color:'#1E40AF' }}>
              Un email vient d'être envoyé à <strong>{user?.email || 'votre adresse'}</strong>
            </div>
          </div>
        </div>
        <div style={{ fontSize:13, color:'#1E40AF', lineHeight:1.55, opacity:0.9 }}>
          Pour garantir l'unicité du vote (un·e votant·e = une voix), nous t'envoyons un lien à cliquer. Sans cette confirmation, ton vote ne sera <strong>pas comptabilisé</strong>.
        </div>
      </div>

      {/* Faux email simulé */}
      <div style={{ background:'#fff', border:`1px solid ${T.border}`, borderRadius:14, padding:'18px 22px', marginBottom:18, boxShadow:'0 4px 16px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:12, borderBottom:`1px solid ${T.border}`, marginBottom:14 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:meta.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{meta.icon}</div>
          <div style={{ flex:1, minWidth:0, fontSize:11, color:T.text3 }}>
            <div style={{ fontWeight:700, color:T.text1, fontSize:13 }}>noreply@maintenant.org</div>
            <div>à {user?.email || 'vous'} · à l'instant</div>
          </div>
          <span style={{ fontSize:9, fontWeight:800, color:'#16A34A', padding:'2px 7px', background:'#DCFCE7', borderRadius:9999, letterSpacing:'0.06em' }}>VIA RESEND</span>
        </div>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, marginBottom:8 }}>
          Confirme ton vote sur Maintenant !
        </div>
        <div style={{ fontSize:13, color:T.text2, lineHeight:1.6, marginBottom:16 }}>
          Bonjour <strong>{user?.name?.split(' ')[0] || 'militant·e'}</strong>,<br />
          Tu viens de voter sur le sondage <em style={{ color:meta.color }}>« {poll.title} »</em>.
          Pour valider ta voix, clique sur le bouton ci-dessous.
        </div>
        <div style={{ background:T.surface2, padding:'12px 14px', borderRadius:10, fontSize:12, color:T.text3, marginBottom:16 }}>
          Ton choix : {choiceLabels.map((o, i) => (
            <span key={o.id}>
              <strong style={{ color:o.color }}>{o.label}</strong>{i < choiceLabels.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
        <button onClick={onConfirm} style={{
          width:'100%', padding:'14px 20px', background:meta.color, color:'#fff',
          border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer',
          fontFamily:'Inter,sans-serif', letterSpacing:'-0.01em',
          boxShadow:`0 6px 20px ${meta.color}40`, transition:'transform 0.15s',
        }} onMouseEnter={e=>e.target.style.transform='translateY(-1px)'} onMouseLeave={e=>e.target.style.transform='none'}>
          ✓ Confirmer mon vote
        </button>
        <div style={{ fontSize:11, color:T.text4, textAlign:'center', marginTop:10 }}>
          Lien valable 24h · Si tu n'es pas à l'origine de ce vote, ignore cet email.
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, padding:'10px 14px', background:'#FEF3C7', borderRadius:10, marginBottom:14, fontSize:12, color:'#78350F' }}>
        <span style={{ fontSize:16 }}>💡</span>
        <span><strong>Mode prototype :</strong> aucun email n'est réellement envoyé. Clique sur le bouton ci-dessus pour simuler le clic dans l'email.</span>
      </div>

      <button onClick={onCancel} style={{ width:'100%', padding:'10px', background:'transparent', color:T.text3, border:'none', cursor:'pointer', fontSize:13, fontFamily:'Inter,sans-serif' }}>← Modifier mon choix</button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   ConfirmedStep — Étape 3 : page d'arrivée du clic email
// ════════════════════════════════════════════════════════════
function ConfirmedStep({ user, poll, meta, completeness, onContinue, onSkip }) {
  const T = window.T;
  const profileFull = completeness.filled >= POLL_DEMOGRAPHIC_FIELDS.length;
  return (
    <div style={{ textAlign:'center', padding:'8px 0' }}>
      <div style={{ width:80, height:80, borderRadius:'50%', background:'#DCFCE7', margin:'0 auto 18px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:38, animation:'fadeUp 0.4s' }}>
        ✓
      </div>
      <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:T.text1, margin:'0 0 8px', letterSpacing:'-0.02em' }}>
        Vote confirmé !
      </h2>
      <p style={{ fontSize:14, color:T.text3, margin:'0 auto 26px', lineHeight:1.55, maxWidth:440 }}>
        Merci, ta voix est désormais comptabilisée dans le sondage.
      </p>

      {!profileFull ? (
        <div style={{ background:'linear-gradient(135deg,#FDE9F2 0%,#F3EBFE 100%)', border:`1.5px solid ${T.brandLight}`, borderRadius:16, padding:'22px 24px', marginBottom:18, textAlign:'left' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <span style={{ fontSize:22 }}>🔬</span>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:T.brand }}>
              Aide-nous à fiabiliser nos sondages
            </div>
          </div>
          <p style={{ fontSize:13, color:T.text2, margin:'0 0 14px', lineHeight:1.55 }}>
            Si tu réponds à <strong>une seule question</strong> sur ton profil, ce sondage gagne en fiabilité scientifique. Petit à petit, à chaque vote, nous nous rapprochons d'une vraie <strong>méthode des quotas</strong>.
          </p>
          <div style={{ background:'#fff', border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 14px', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.06em' }}>Ton profil scientifique</span>
              <span style={{ fontSize:12, fontWeight:800, color:T.brand }}>{completeness.filled}/{completeness.total}</span>
            </div>
            <div style={{ height:6, background:T.surface2, borderRadius:9999, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${completeness.pct}%`, background:T.gradR, borderRadius:9999, transition:'width 0.6s' }}></div>
            </div>
          </div>
          <Btn variant="gradient" full size="lg" onClick={onContinue}>
            Répondre à une question (15 secondes) →
          </Btn>
          <button onClick={onSkip} style={{ width:'100%', padding:'10px', background:'transparent', color:T.text3, border:'none', cursor:'pointer', fontSize:13, fontFamily:'Inter,sans-serif', marginTop:6 }}>
            Non merci, je veux juste voir les résultats
          </button>
        </div>
      ) : (
        <div style={{ background:T.successLight, border:`1px solid ${T.success}`, borderRadius:14, padding:'18px 22px', marginBottom:18 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🏆</div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:800, color:T.success, marginBottom:4 }}>Profil scientifique complet !</div>
          <div style={{ fontSize:13, color:T.text2 }}>Tes 15 questions sont remplies. Merci pour ta contribution à la fiabilité de la plateforme.</div>
        </div>
      )}

      {profileFull && <Btn variant="gradient" full size="lg" onClick={onSkip}>Voir les résultats →</Btn>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   DemographicQuestion — Une question piochée au hasard
// ════════════════════════════════════════════════════════════
function DemographicQuestion({ field, value, setValue, onSubmit, onSkip, completeness, questionsAnswered, meta }) {
  const T = window.T;
  const isText = field.type === 'text';
  return (
    <div>
      {/* Header de progression */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
        <span style={{ fontSize:11, fontWeight:800, color:T.text4, textTransform:'uppercase', letterSpacing:'0.08em' }}>
          {questionsAnswered === 0 ? 'Question piochée au hasard' : `Encore une question ! (${questionsAnswered + 1}ème)`}
        </span>
        <span style={{ fontSize:11, fontWeight:700, color:meta.color }}>
          Profil {completeness.filled}/{completeness.total}
        </span>
      </div>
      <div style={{ height:5, background:T.surface2, borderRadius:9999, overflow:'hidden', marginBottom:24 }}>
        <div style={{ height:'100%', width:`${completeness.pct}%`, background:T.gradR, borderRadius:9999, transition:'width 0.4s' }}></div>
      </div>

      <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(20px,2.8vw,26px)', fontWeight:800, color:T.text1, margin:'0 0 8px', letterSpacing:'-0.02em', lineHeight:1.25 }}>
        {field.label}
      </h2>
      <p style={{ fontSize:13, color:T.text3, margin:'0 0 24px', lineHeight:1.5 }}>
        Catégorie : <strong>{field.short}</strong> · Tes réponses sont anonymisées et servent à pondérer les résultats.
      </p>

      {/* Réponse — soit liste d'options, soit input texte (code postal) */}
      {!isText ? (
        <div style={{ display:'grid', gap:8, marginBottom:22 }}>
          {field.options.map(opt => {
            const sel = value === opt;
            return (
              <button key={opt} onClick={() => setValue(opt)}
                style={{
                  display:'flex', alignItems:'center', gap:12, padding:'13px 16px',
                  background: sel ? `${T.brand}10` : T.surface,
                  border: `2px solid ${sel ? T.brand : T.border}`,
                  borderRadius:12, cursor:'pointer', textAlign:'left',
                  fontFamily:'Inter,sans-serif', transition:'all 0.15s', width:'100%',
                }}>
                <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${sel ? T.brand : T.borderDark}`, background: sel ? T.brand : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                  {sel && <span style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }}></span>}
                </div>
                <span style={{ fontSize:14, fontWeight: sel ? 700 : 500, color: sel ? T.brand : T.text1 }}>{opt}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ marginBottom:22 }}>
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder={field.placeholder || ''}
            inputMode="numeric"
            maxLength={5}
            style={{
              width:'100%', height:54, border:`1.5px solid ${T.border}`, borderRadius:14,
              padding:'0 18px', fontSize:18, fontFamily:'Inter,sans-serif', color:T.text1,
              background:T.bg, outline:'none', boxSizing:'border-box', letterSpacing:'0.04em',
              textAlign:'center', fontWeight:600,
            }}
            onFocus={e => e.target.style.borderColor = T.brand}
            onBlur={e => e.target.style.borderColor = T.border}
          />
        </div>
      )}

      <Btn variant="gradient" full size="lg" disabled={!value.trim() || (isText && value.length < 5)} onClick={onSubmit}>
        Valider ma réponse
      </Btn>
      <button onClick={onSkip} style={{ width:'100%', padding:'10px', background:'transparent', color:T.text3, border:'none', cursor:'pointer', fontSize:13, fontFamily:'Inter,sans-serif', marginTop:6 }}>
        Passer · voir les résultats
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   ThanksStep — Proposer une autre question
// ════════════════════════════════════════════════════════════
function ThanksStep({ completeness, questionsAnswered, onAnother, onFinish, meta }) {
  const T = window.T;
  const profileFull = completeness.filled >= POLL_DEMOGRAPHIC_FIELDS.length;
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ width:64, height:64, borderRadius:'50%', background:'#DCFCE7', margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 }}>
        🎉
      </div>
      <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:T.text1, margin:'0 0 6px', letterSpacing:'-0.02em' }}>
        Merci !
      </h2>
      <p style={{ fontSize:14, color:T.text3, margin:'0 0 18px' }}>
        {questionsAnswered === 1 ? 'Une question répondue.' : `${questionsAnswered} questions répondues.`} La fiabilité du sondage augmente.
      </p>

      <div style={{ background:T.surface2, border:`1px solid ${T.border}`, borderRadius:12, padding:'14px 18px', marginBottom:22, maxWidth:420, margin:'0 auto 22px', textAlign:'left' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.06em' }}>Ton profil scientifique</span>
          <span style={{ fontSize:13, fontWeight:800, color:T.brand }}>{completeness.filled}/{completeness.total} ({completeness.pct}%)</span>
        </div>
        <div style={{ height:6, background:'#fff', borderRadius:9999, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${completeness.pct}%`, background:T.gradR, borderRadius:9999, transition:'width 0.6s' }}></div>
        </div>
      </div>

      {profileFull ? (
        <div style={{ background:T.successLight, border:`1px solid ${T.success}`, borderRadius:12, padding:'14px 18px', marginBottom:18, maxWidth:420, margin:'0 auto 18px' }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:T.success, marginBottom:4 }}>🏆 Profil complet !</div>
          <div style={{ fontSize:12, color:T.text2 }}>Tu as répondu à toutes les questions. Bravo !</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, maxWidth:420, margin:'0 auto 12px' }}>
          <Btn variant="gradient" size="lg" onClick={onAnother}>
            Oui, encore une !
          </Btn>
          <Btn variant="outline" size="lg" onClick={onFinish}>
            Voir les résultats
          </Btn>
        </div>
      )}

      {profileFull && <Btn variant="gradient" size="lg" full style={{ maxWidth:420, margin:'0 auto' }} onClick={onFinish}>Voir les résultats →</Btn>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//   PollResults — Diagramme + détail par option + Fiabilité
// ════════════════════════════════════════════════════════════
function PollResults({ poll, augmentedVotes, sorted, totalVotes, userVote, meta, viewMode = 'photo' }) {
  const T = window.T;
  const [chartType, setChartType] = useState('bars'); // bars | donut
  const [weighted, setWeighted]   = useState(false); // false = brut, true = pondéré
  const userVoteIds = poll.multi ? userVote : [userVote];

  // ── Fiabilité scientifique du sondage ────────────────────
  const science = useMemo(() => pollScience(poll), [poll.id]);
  const weightedOpts = useMemo(() => weightedOptions(poll, science), [poll.id]);

  // Si on est en mode pondéré, on remplace les options par leur version pondérée
  // Pour les charts, on injecte des votes "virtuels" qui correspondent au % pondéré
  const displayOptions = useMemo(() => {
    if (!weighted) return sorted;
    const map = new Map(weightedOpts.map(w => [w.id, w.weightedPct]));
    const wTotal = totalVotes;
    return [...sorted].map(o => ({ ...o, votes: Math.round((map.get(o.id) || 0) * wTotal / 100) }))
      .sort((a, b) => b.votes - a.votes);
  }, [weighted, sorted, weightedOpts, totalVotes]);

  const displayAugmented = useMemo(() => {
    if (!weighted) return augmentedVotes;
    const map = new Map(weightedOpts.map(w => [w.id, w.weightedPct]));
    const wTotal = totalVotes;
    return augmentedVotes.map(o => ({ ...o, votes: Math.round((map.get(o.id) || 0) * wTotal / 100) }));
  }, [weighted, augmentedVotes, weightedOpts, totalVotes]);

  return (
    <>
      {/* ── Panneau Fiabilité scientifique ─────────────────── */}
      <ReliabilityPanel
        science={science}
        weighted={weighted}
        setWeighted={setWeighted}
        meta={meta}
      />

      {/* En-tête résultats avec switcher */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:700, color:T.text1, margin:0 }}>
          📊 Résultats {weighted ? <span style={{ color:meta.color, fontWeight:800 }}>· pondérés</span> : 'bruts'}
        </h2>
        <div style={{ display:'flex', gap:4, padding:4, background:T.surface2, borderRadius:9999 }}>
          {[['bars','Barres','📊'],['donut','Camembert','🥧']].map(([k,l,i]) => (
            <button key={k} onClick={() => setChartType(k)}
              style={{
                padding:'6px 14px', borderRadius:9999, border:'none',
                background: chartType === k ? '#fff' : 'transparent',
                color: chartType === k ? T.text1 : T.text3,
                fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif',
                boxShadow: chartType === k ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition:'all 0.15s',
              }}>{i} {l}</button>
          ))}
        </div>
      </div>

      {chartType === 'bars' ? (
        <BarsChart options={displayOptions} totalVotes={totalVotes} userVoteIds={userVoteIds} viewMode={viewMode} margin={weighted ? science.margin : null} />
      ) : (
        <DonutChart options={displayAugmented} totalVotes={totalVotes} userVoteIds={userVoteIds} viewMode={viewMode} />
      )}

      {/* Récap vote utilisateur */}
      <div style={{ marginTop:22, padding:'14px 18px', background:meta.bg, borderRadius:14, border:`1px solid ${meta.color}40`, display:'flex', alignItems:'center', gap:12 }}>
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
        <span style={{ fontSize:11, color:T.text3, fontStyle:'italic' }}>Modifiable jusqu'à clôture</span>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
//   ReliabilityPanel — Score de fiabilité + toggle pondéré
//   Les 4 axes : votes · profils · complétion · diversité
// ════════════════════════════════════════════════════════════
function ReliabilityPanel({ science, weighted, setWeighted, meta }) {
  const T = window.T;
  const [open, setOpen] = useState(false);
  const color = reliabilityColor(science.reliability);

  const axes = [
    { key:'votes',      label:'Votes',         icon:'🗳️', value:science.axes.votes,      hint:`${(science.confirmed).toLocaleString('fr-FR')} confirmé·es par email` },
    { key:'profiles',   label:'Profils',       icon:'👤', value:science.axes.profiles,   hint:`${(science.profiles).toLocaleString('fr-FR')} profils renseignés` },
    { key:'completion', label:'Complétion',    icon:'📋', value:science.axes.completion, hint:`${science.completionPct} % en moyenne par profil` },
    { key:'diversity',  label:'Diversité',     icon:'🌍', value:science.axes.diversity,  hint:`Indice de représentativité ${science.diversityPct}/100` },
  ];

  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:'16px 18px', marginBottom:18, boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
      {/* Bandeau principal */}
      <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
        {/* Cercle score */}
        <div style={{ position:'relative', width:64, height:64, flexShrink:0 }}>
          <svg width="64" height="64" style={{ transform:'rotate(-90deg)' }}>
            <circle cx="32" cy="32" r="26" stroke={T.surface2} strokeWidth="6" fill="none" />
            <circle cx="32" cy="32" r="26" stroke={color} strokeWidth="6" fill="none"
              strokeDasharray={`${(science.reliability/100) * 2 * Math.PI * 26} ${2 * Math.PI * 26}`}
              strokeLinecap="round" style={{ transition:'stroke-dasharray 0.8s ease-out' }} />
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, color }}>
            {science.reliability}
          </div>
        </div>
        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
            <span style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:T.text1, letterSpacing:'-0.01em' }}>
              Fiabilité scientifique
            </span>
            <span style={{ fontSize:10, fontWeight:800, color, padding:'2px 8px', background:`${color}15`, borderRadius:9999, letterSpacing:'0.04em', textTransform:'uppercase' }}>
              {science.reliability >= 70 ? 'Élevée' : science.reliability >= 50 ? 'Modérée' : science.reliability >= 30 ? 'Faible' : 'Très faible'}
            </span>
          </div>
          <div style={{ fontSize:12, color:T.text3, lineHeight:1.5 }}>
            {science.canWeight
              ? <>Échantillon suffisant pour appliquer la <strong>méthode des quotas</strong>.</>
              : <>Échantillon encore <strong>trop faible</strong> pour pondérer scientifiquement.</>}
          </div>
        </div>
        <button onClick={() => setOpen(!open)} style={{
          fontSize:12, fontWeight:600, color:T.text3, background:T.surface2,
          border:'none', borderRadius:9999, padding:'7px 14px', cursor:'pointer',
          fontFamily:'Inter,sans-serif', whiteSpace:'nowrap',
          display:'inline-flex', alignItems:'center', gap:5,
        }}>{open ? 'Masquer le détail' : 'Voir le détail'} {open ? '↑' : '↓'}</button>
      </div>

      {/* Détail des 4 axes (dépliable) */}
      {open && (
        <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${T.border}` }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10, marginBottom:14 }}>
            {axes.map(a => {
              const pct = Math.round(a.value * 100);
              const ok = a.value >= 1;
              return (
                <div key={a.key} style={{ background:T.surface2, borderRadius:10, padding:'10px 12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                    <span style={{ fontSize:14 }}>{a.icon}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:T.text2, flex:1 }}>{a.label}</span>
                    <span style={{ fontSize:11, fontWeight:800, color: ok ? '#16A34A' : '#D97706' }}>{ok ? '✓' : '⚠'}</span>
                  </div>
                  <div style={{ height:5, background:'#fff', borderRadius:9999, overflow:'hidden', marginBottom:5 }}>
                    <div style={{ height:'100%', width:`${pct}%`, background: ok ? '#16A34A' : '#D97706', borderRadius:9999, transition:'width 0.6s' }}></div>
                  </div>
                  <div style={{ fontSize:10, color:T.text4, lineHeight:1.35 }}>{a.hint}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize:11, color:T.text3, lineHeight:1.55, padding:'8px 12px', background:T.surface2, borderRadius:8 }}>
            La fiabilité augmente avec : ① le nombre de votes confirmés par email, ② le nombre de profils renseignés, ③ le niveau de complétion moyen des 15 questions de profil, ④ la diversité de l'échantillon (toutes catégories démographiques représentées). À chaque vote, une nouvelle question est posée pour fiabiliser le sondage.
          </div>
        </div>
      )}

      {/* Toggle brut / pondéré + marge d'erreur */}
      <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        {science.canWeight ? (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:4, padding:4, background:T.surface2, borderRadius:9999 }}>
              {[[false,'Résultats bruts'],[true,'Résultats pondérés']].map(([k, l]) => (
                <button key={String(k)} onClick={() => setWeighted(k)}
                  style={{
                    padding:'7px 14px', borderRadius:9999, border:'none',
                    background: weighted === k ? meta.color : 'transparent',
                    color: weighted === k ? '#fff' : T.text3,
                    fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif',
                    boxShadow: weighted === k ? `0 2px 8px ${meta.color}40` : 'none',
                    transition:'all 0.15s',
                  }}>{l}</button>
              ))}
            </div>
            {weighted && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 14px', background:'#FFFBEB', border:`1px solid #FDE68A`, borderRadius:9999 }}>
                <span style={{ fontSize:14 }}>📐</span>
                <span style={{ fontSize:12, color:'#78350F' }}>
                  Marge d'erreur <strong>± {science.margin.toFixed(1)} pts</strong> · IC 95 %
                </span>
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize:12, color:T.text3, fontStyle:'italic', display:'flex', alignItems:'center', gap:8 }}>
            <span>🔬</span>
            Le toggle « Résultats pondérés » apparaîtra dès que tous les axes seront atteints. Continue à voter et à compléter ton profil !
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bars chart ────────────────────────────────────────────
function BarsChart({ options, totalVotes, userVoteIds, viewMode = 'photo', margin = null }) {
  const T = window.T;
  const max = Math.max(...options.map(o => o.votes), 1);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {options.map((opt, i) => {
        const pct = totalVotes ? (opt.votes / totalVotes) * 100 : 0;
        const isLeader = i === 0;
        const userVoted = userVoteIds.includes(opt.id);
        return (
          <div key={opt.id} style={{
            background: T.surface2,
            borderRadius:12,
            padding:'12px 16px',
            border: userVoted ? `2px solid ${opt.color}` : `1px solid ${T.border}`,
            position:'relative',
          }}>
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
                    <span style={{ fontSize:11, color:T.text4 }}>{opt.votes.toLocaleString('fr-FR')} votes</span>
                    <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, color: opt.color }}>{pct.toFixed(1)}%</span>
                  </span>
                </div>
                {opt.party && <div style={{ fontSize:11, color:opt.color, fontWeight:600, marginTop:1 }}>{opt.party}</div>}
              </div>
            </div>
            <div style={{ position:'relative', height:10, background:'#fff', borderRadius:9999, overflow:'visible' }}>
              <div style={{
                height:'100%',
                width:`${pct}%`,
                background: `linear-gradient(90deg, ${opt.color} 0%, ${opt.color}DD 100%)`,
                borderRadius:9999,
                transition:'width 1s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: `0 0 12px ${opt.color}40`,
              }}></div>
              {/* Marge d'erreur — moustaches d'intervalle de confiance */}
              {margin !== null && pct > 0 && (
                <div style={{ position:'absolute', top:'50%', left:`${Math.max(0, pct - margin)}%`, width:`${Math.min(100, 2 * margin)}%`, transform:'translateY(-50%)', pointerEvents:'none' }}>
                  <div style={{ position:'relative', height:14 }}>
                    <div style={{ position:'absolute', top:'50%', left:0, right:0, height:2, background:'rgba(0,0,0,0.55)', transform:'translateY(-50%)' }}></div>
                    <div style={{ position:'absolute', top:0, left:0, width:2, height:14, background:'rgba(0,0,0,0.55)', borderRadius:1 }}></div>
                    <div style={{ position:'absolute', top:0, right:0, width:2, height:14, background:'rgba(0,0,0,0.55)', borderRadius:1 }}></div>
                  </div>
                </div>
              )}
            </div>
            {margin !== null && (
              <div style={{ fontSize:10, color:T.text4, textAlign:'right', marginTop:3, fontStyle:'italic' }}>
                Intervalle : {Math.max(0, pct - margin).toFixed(1)} % — {Math.min(100, pct + margin).toFixed(1)} %
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
      {/* SVG donut */}
      <div style={{ position:'relative', width:radius*2, height:radius*2, justifySelf:'center' }}>
        <svg width={radius*2} height={radius*2} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={radius} cy={radius} r={norm} fill="none" stroke={T.surface2} strokeWidth={stroke} />
          {segments.map((seg) => (
            <circle key={seg.id}
              cx={radius} cy={radius} r={norm}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${seg.dash} ${circ - seg.dash}`}
              strokeDashoffset={seg.offset}
              style={{ transition:'all 0.8s ease-out' }}
            />
          ))}
        </svg>
        {/* Center label */}
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:24, color:T.text1, lineHeight:1 }}>{totalVotes.toLocaleString('fr-FR')}</div>
          <div style={{ fontSize:10, color:T.text3, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginTop:4 }}>Votes</div>
        </div>
      </div>

      {/* Légende */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {[...segments].sort((a,b)=>b.pct-a.pct).map(seg => {
          const userVoted = userVoteIds.includes(seg.id);
          return (
            <div key={seg.id} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'8px 12px',
              background: userVoted ? `${seg.color}10` : T.surface,
              borderRadius:10,
              border: userVoted ? `1px solid ${seg.color}` : `1px solid ${T.border}`,
            }}>
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

      <style>{`
        @media (max-width: 600px) {
          .mn-donut-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// Expose
window.PollsPage = PollsPage;
