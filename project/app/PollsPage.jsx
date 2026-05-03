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
function PollsPage({ user, onAuth, setPage }) {
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
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:`1px solid ${T.border}` }}>
          <div style={{ fontSize:11, color:T.text4, fontWeight:600 }}>
            {poll.votes_total.toLocaleString('fr-FR')} votes · {poll.options.length} options
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
// ════════════════════════════════════════════════════════════
function PollDetail({ poll, user, onAuth, onBack, votes, setVotes, viewMode = 'photo', setViewMode }) {
  const T = window.T;
  const meta = TYPE_META[poll.type] || TYPE_META.societe;
  const dl = daysLeft(poll.closes);
  const userVote = votes[poll.id];
  const [selected, setSelected] = useState(userVote ? (poll.multi ? userVote : [userVote]) : []);
  const [hoverOpt, setHoverOpt] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const hasVoted = !!userVote;

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

  const submitVote = () => {
    if (!user) { onAuth(); return; }
    if (selected.length === 0) return;
    const newVotes = { ...votes, [poll.id]: poll.multi ? selected : selected[0] };
    setVotes(newVotes);
    saveVotes(newVotes);
    // bump local counts
    const bump = {};
    selected.forEach(id => bump[id] = (localBump[id] || 0) + 1);
    setLocalBump({ ...localBump, ...bump });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

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

          {/* Success banner */}
          {showSuccess && (
            <div style={{ background:T.successLight, border:`1px solid ${T.success}`, borderRadius:14, padding:'14px 18px', marginBottom:22, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ fontSize:22 }}>✓</div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:T.success }}>Vote enregistré, merci !</div>
                <div style={{ fontSize:12, color:T.text2 }}>Votre voix compte. Voici les résultats en temps réel.</div>
              </div>
            </div>
          )}

          {/* Mode VOTE (si pas voté) */}
          {!hasVoted && (
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
                      {/* Avatar (photo ou picto) */}
                      <OptionAvatar img={opt.img} color={opt.color} size={54} mode={viewMode} selected={isSel} />

                      {/* Texte */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:T.text1, marginBottom:opt.party || opt.desc ? 3 : 0 }}>
                          {opt.label}
                        </div>
                        {opt.party && <div style={{ fontSize:12, color:opt.color, fontWeight:600 }}>{opt.party}</div>}
                        {opt.desc && <div style={{ fontSize:12, color:T.text3 }}>{opt.desc}</div>}
                      </div>

                      {/* Checkbox / Radio */}
                      <div style={{
                        width:24, height:24,
                        borderRadius: poll.multi ? 6 : '50%',
                        border:`2px solid ${isSel ? opt.color : T.borderDark}`,
                        background: isSel ? opt.color : T.surface,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        flexShrink:0, transition:'all 0.18s',
                      }}>
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
                Vote anonyme · Stockage local · Aucune donnée tierce
              </div>
            </>
          )}

          {/* Mode RÉSULTATS (si voté ou si on veut voir) */}
          {hasVoted && (
            <PollResults
              poll={poll}
              augmentedVotes={augmentedVotes}
              sorted={sorted}
              totalVotes={totalVotes}
              userVote={userVote}
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
//   PollResults — Diagramme + détail par option
// ════════════════════════════════════════════════════════════
function PollResults({ poll, augmentedVotes, sorted, totalVotes, userVote, meta, viewMode = 'photo' }) {
  const T = window.T;
  const [chartType, setChartType] = useState('bars'); // bars | donut
  const userVoteIds = poll.multi ? userVote : [userVote];

  return (
    <>
      {/* En-tête résultats avec switcher */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:700, color:T.text1, margin:0 }}>
          📊 Résultats en temps réel
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
        <BarsChart options={sorted} totalVotes={totalVotes} userVoteIds={userVoteIds} viewMode={viewMode} />
      ) : (
        <DonutChart options={augmentedVotes} totalVotes={totalVotes} userVoteIds={userVoteIds} viewMode={viewMode} />
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

// ── Bars chart ────────────────────────────────────────────
function BarsChart({ options, totalVotes, userVoteIds, viewMode = 'photo' }) {
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
            <div style={{ height:10, background:'#fff', borderRadius:9999, overflow:'hidden' }}>
              <div style={{
                height:'100%',
                width:`${pct}%`,
                background: `linear-gradient(90deg, ${opt.color} 0%, ${opt.color}DD 100%)`,
                borderRadius:9999,
                transition:'width 1s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: `0 0 12px ${opt.color}40`,
              }}></div>
            </div>
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
