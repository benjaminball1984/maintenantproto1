// ReseauPage.jsx — Réseau social complet (feed, profils, groupes)
const { useState, useRef } = React;

// ════════════════════════════════════════════════════════════
//  POSTS — données enrichies avec author_id, link sharing, date
//  Le champ `link` permet l'affichage de cards "rich preview" type Facebook
// ════════════════════════════════════════════════════════════
// Helpers pour comments mock spécifiques par post
const C = (author, text, time = 'il y a 1h') => ({ id: Math.random(), author, text, time });

const SAMPLE_POSTS = [
  { id:1,  author_id:1, author:'Marie Dupont',          time:'il y a 2h',  date:'2026-04-22T10:00', content:"Victoire ! La pétition contre la fermeture des urgences vient de dépasser 14 000 signatures 🎉 Continuons à partager !", likes:47, shares:8, image:'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=900&q=70', tags:['santé','urgences'],
    comments:[ C('Thomas R.','Bravo, on continue ✊','il y a 1h'), C('Aisha R.','Partagé sur tous mes réseaux !','il y a 30min') ] },
  { id:2,  author_id:2, author:'Thomas Rivière',        time:'il y a 4h',  date:'2026-04-22T08:00', content:"Retour du camp militant du Larzac — 3 jours intenses, des rencontres inoubliables, et une énergie collective qui fait chaud au cœur. Merci à toutes et tous ! ✊", likes:134, shares:19, tags:['larzac','militant'],
    comments:[ C('Léa M.','Hâte du prochain camp 🌄','il y a 2h'), C('Karim Z.','Quels ateliers tu retiens en priorité ?','il y a 1h') ] },
  { id:3,  author_id:3, author:'Aisha Rahman',          time:'il y a 6h',  date:'2026-04-22T06:00', content:"Je propose un cours de yoga gratuit ce samedi matin à Paris 10e pour les camarades stressés par le mouvement. 10h-11h30, 10 places max. Inscriptions en MP 🧘", likes:23, shares:5, tags:['SEL','yoga','Paris'],
    comments:[ C('Marie D.','Je prends une place, merci !','il y a 4h'), C('Omar B.','Topissime — exactement ce qu\'il nous faut','il y a 3h') ] },
  { id:4,  author_id:7, author:'Collectif Santé Pour Tous', time:'hier', date:'2026-04-21T18:00', content:"📢 ALERTE : La préfecture vient de confirmer la fermeture définitive de 3 maternités rurales. Nous organisons une conférence de presse mardi 10h. Venez nombreux !", likes:89, shares:56, image:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=70', tags:['santé','maternité','alerte'],
    comments:[ C('Karim Z.','Inadmissible. Je relaie','hier'), C('Pauline B.','On se mobilise depuis Toulouse aussi','il y a 18h'), C('Marie D.','Je serai là mardi','il y a 12h') ] },
  { id:5,  author_id:4, author:'Omar Benzara',          time:'il y a 2 jours', date:'2026-04-20T14:00', content:"Thread sur la monnaie T99CP et pourquoi c'est une révolution pour les échanges solidaires 🧵\n\n1/ La T99CP est indexée à la fois sur l'euro et sur le temps de travail humain. 1 T99CP = 1€ = 1 minute de travail...", likes:201, shares:88, tags:['T99CP','crypto','solidarité'],
    comments:[ C('Thomas R.','Excellent thread, à épingler','il y a 2 jours'), C('Salomé G.','Question : que se passe-t-il si l\'euro s\'effondre ?','il y a 2 jours') ] },
  { id:6,  author_id:5, author:'Léa Martin',            time:'il y a 3 jours', date:'2026-04-19T11:00', content:"Surplus de mon jardin ! J'ai des kilos de courgettes et de tomates cerises. Passage possible à Lyon 7e ce week-end. DM pour organiser 🥬🍅", likes:31, shares:3, image:'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=900&q=70', tags:['jardin','surplus','Lyon'],
    comments:[ C('Aisha R.','Je passe samedi avec mon panier 🧺','il y a 2 jours') ] },
  // Posts avec partage de liens externes
  { id:7,  author_id:2, author:'Thomas Rivière',        time:'il y a 5h',  date:'2026-04-22T07:00', content:"À lire absolument — l'enquête Reporterre sur l'accaparement de l'eau par les méga-bassines. Édifiant.", link:{ url:'https://reporterre.net/Mega-bassines-l-eau-confisquee', title:"Méga-bassines : l'eau confisquée", description:"Enquête approfondie sur le système opaque qui permet aux multinationales agro-industrielles de capter l'eau publique au détriment des paysans.", siteName:'Reporterre', thumbnail:'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=70' }, likes:312, shares:127,
    comments:[ C('Karim Z.','Indispensable comme lecture','il y a 4h'), C('Omar B.','Faisons-en un article de Maintenant','il y a 3h') ] },
  { id:8,  author_id:4, author:'Omar Benzara',          time:'il y a 1 jour', date:'2026-04-21T10:00', content:"Vidéo très claire de Vert le Média sur la transition écologique — à partager sans modération 👇", link:{ url:'https://vert.eco/articles/comprendre-le-tournant-energetique', title:"Comprendre le tournant énergétique en 6 minutes", description:"Vert le média décrypte les enjeux du virage énergétique avec une vidéo pédagogique et accessible.", siteName:'Vert le média', thumbnail:'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=70', type:'video' }, likes:178, shares:67,
    comments:[ C('Salomé G.','Top — j\'ai partagé en cours','hier') ] },
  { id:9,  author_id:6, author:'Karim Zidane',          time:'il y a 2 jours', date:'2026-04-20T16:00', content:"Mediapart vient de publier un papier important sur les paradis fiscaux européens. À lire et faire circuler.", link:{ url:'https://mediapart.fr/journal/economie/220425/paradis-fiscaux-europe-derobe-100-milliards', title:"Paradis fiscaux : 100 milliards d'euros qui échappent à l'Europe", description:"Une enquête de 6 mois révèle l'ampleur de la fuite des capitaux et la complicité des gouvernements.", siteName:'Mediapart', thumbnail:null }, likes:88, shares:42,
    comments:[ C('Marie D.','100 milliards. Hôpitaux, écoles, retraites…','il y a 2 jours'), C('Pauline B.','À ce niveau c\'est plus de l\'optimisation, c\'est du pillage','il y a 2 jours') ] },
  { id:10, author_id:8, author:'Sophie Leclercq',       time:'il y a 3 jours', date:'2026-04-19T15:00', content:"Petit live YouTube avec Hartmut Rosa sur l'accélération sociale, je recommande chaudement.", link:{ url:'https://youtube.com/watch?v=abcd1234', title:"Hartmut Rosa : sortir de la course folle", description:"Conférence de 1h15 du sociologue allemand sur sa théorie de la résonance et l'aliénation par l'urgence.", siteName:'YouTube', thumbnail:'https://images.unsplash.com/photo-1554189097-ffe88e998a2b?w=600&q=70', type:'video' }, likes:67, shares:24,
    comments:[ C('Aisha R.','Sa théorie de la résonance change tout','il y a 3 jours') ] },
  // Posts d'amis d'amis
  { id:11, author_id:11, author:'Nadia Belhadj',        time:'il y a 8h',  date:'2026-04-22T04:00', content:"Première AG de la commune libre de notre quartier ce soir 🏡 — on est 47 inscrits, plus qu'à attendre les autres camarades !", likes:42, shares:6, tags:['communes-libres','Paris-20'],
    comments:[ C('Marie D.','Bravo Nadia ! Tiens-nous au courant','il y a 6h') ] },
  { id:12, author_id:12, author:'Mathieu Charlot',      time:'il y a 12h', date:'2026-04-22T00:00', content:"Trajet covoit Paris→Lille demain pour la mob du 23 avril, 2 places restantes, prix solidaire en T99CP 🚗", likes:18, shares:3, tags:['covoit','mobilisation'],
    comments:[ C('Léa M.','Je prends une place 🙋','il y a 10h') ] },
  { id:13, author_id:13, author:'Salomé Garnier',       time:'hier',       date:'2026-04-21T20:00', content:"L'épisode 4 du podcast 'Décarboner les transports' est dingue, ça raconte la guerre du diesel comme un thriller industriel.", likes:55, shares:9, tags:['podcast','transports'],
    comments:[ C('Thomas R.','Romain Béral signe encore un grand épisode','hier') ] },
  // Posts d'autres
  { id:14, author_id:21, author:'Pauline Brun',         time:'il y a 1 jour', date:'2026-04-21T09:00', content:"On organise un atelier 'monter une caisse de grève' la semaine prochaine à Toulouse, infos en commentaire 💪", likes:73, shares:18, tags:['caisse-de-grève','Toulouse'],
    comments:[ C('Karim Z.','Comptez sur moi pour relayer dans le sud','hier'), C('Omar B.','Possible de récupérer le support de présentation ?','il y a 18h') ] },
  { id:15, author_id:22, author:'Jean Lefort',          time:'il y a 2 jours', date:'2026-04-20T19:00', content:"Magnifique soirée à la fête de la Conf' Paysanne hier — débats, concerts, et un vrai bon vin 🍷", likes:91, shares:11, image:'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=70', tags:['conf-paysanne','culture'],
    comments:[ C('Léa M.','J\'y étais aussi, soirée magique','il y a 2 jours') ] },
];

// Marie Dupont = utilisatrice par défaut (id 1) — réseau simulé
const DEFAULT_CONTACTS = [2, 3, 4, 5, 6, 7];           // amis directs
const DEFAULT_FOFS     = [11, 12, 13];                 // amis d'amis
// Le reste = "autres" (21, 22, etc.)

const SAMPLE_GROUPS = [
  { id:1, name:'Luttes climatiques', members:1240, icon:'🌍', desc:'Actions et informations sur l\'urgence climatique', color:'#16A34A' },
  { id:2, name:'Syndicats & Travail', members:890, icon:'✊', desc:'Actualités syndicales et droit du travail', color:'#7C3AED' },
  { id:3, name:'Logement & DAL', members:560, icon:'🏠', desc:'Lutte pour le droit au logement', color:'#BE185D' },
  { id:4, name:'Féminisme & Droits', members:1780, icon:'♀️', desc:'Combats féministes et droits des femmes', color:'#E11D74' },
  { id:5, name:'Réseau SEL Paris', members:340, icon:'🤲', desc:'Échanges locaux en Île-de-France', color:'#7C3AED' },
  { id:6, name:'Médias Alternatifs', members:2100, icon:'📰', desc:'Journalisme militant et contre-information', color:'#5B21B6' },
];

const SAMPLE_MEMBERS = [
  { id:1, name:'Marie Dupont', role:'Militante', location:'Paris', joined:'2025-06', t99cp:247, badges:['Signataire ×10','Militant actif'] },
  { id:2, name:'Thomas Rivière', role:'Organisateur', location:'Lyon', joined:'2025-03', t99cp:512, badges:['Fondateur','Contributeur SEL'] },
  { id:3, name:'Aisha Rahman', role:'Militante', location:'Paris', joined:'2025-09', t99cp:89, badges:['Nouvelle membre'] },
  { id:4, name:'Omar Benzara', role:'Journaliste', location:'Marseille', joined:'2024-11', t99cp:340, badges:['Éditeur Média','Militant actif'] },
  { id:5, name:'Léa Martin', role:'Militante', location:'Lyon', joined:'2025-07', t99cp:155, badges:['Jardinière','SEL active'] },
  { id:6, name:'Karim Zidane', role:'Modérateur', location:'Bordeaux', joined:'2025-01', t99cp:780, badges:['Admin','Fondateur'] },
];

// ════════════════════════════════════════════════════════════
//  LINK PREVIEWS — métadonnées par domaine connu (style Facebook)
// ════════════════════════════════════════════════════════════
const KNOWN_DOMAINS = {
  'youtube.com':   { siteName:'YouTube',        bgColor:'#FF0000', icon:'▶' },
  'youtu.be':      { siteName:'YouTube',        bgColor:'#FF0000', icon:'▶' },
  'reporterre.net':{ siteName:'Reporterre',     bgColor:'#16A34A', icon:'📰' },
  'mediapart.fr':  { siteName:'Mediapart',      bgColor:'#E11D48', icon:'📰' },
  'lemonde.fr':    { siteName:'Le Monde',       bgColor:'#1A1A18', icon:'📰' },
  'liberation.fr': { siteName:'Libération',     bgColor:'#EF4444', icon:'📰' },
  'vert.eco':      { siteName:'Vert le média',  bgColor:'#10B981', icon:'🌱' },
  'politis.fr':    { siteName:'Politis',        bgColor:'#7C3AED', icon:'📰' },
  'arte.tv':       { siteName:'ARTE',           bgColor:'#1A1A18', icon:'🎬' },
  'twitter.com':   { siteName:'X / Twitter',    bgColor:'#1A1A18', icon:'𝕏' },
  'mastodon':      { siteName:'Mastodon',       bgColor:'#6364FF', icon:'🐘' },
  'soundcloud.com':{ siteName:'SoundCloud',     bgColor:'#FF7700', icon:'🎵' },
};

function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function resolveLinkMeta(link) {
  if (!link?.url) return null;
  const domain = getDomain(link.url);
  const known = Object.entries(KNOWN_DOMAINS).find(([k]) => domain.includes(k));
  const fallback = { siteName: domain, bgColor: '#6B7280', icon: '🔗' };
  return { ...(known ? known[1] : fallback), domain, ...link };
}

// Card preview type Facebook (image + title + description + site name)
function LinkPreviewCard({ link }) {
  const meta = resolveLinkMeta(link);
  if (!meta) return null;
  const isVideo = meta.type === 'video' || meta.siteName === 'YouTube';
  return (
    <a href={meta.url} target="_blank" rel="noopener noreferrer"
       onClick={e => e.stopPropagation()}
       style={{ display:'block', textDecoration:'none', color:'inherit', marginTop:10, border:`1px solid ${COLORS.gray200}`, borderRadius:12, overflow:'hidden', background:'#fff', transition:'all 0.18s' }}
       onMouseEnter={e => { e.currentTarget.style.borderColor = meta.bgColor; e.currentTarget.style.boxShadow = `0 4px 16px ${meta.bgColor}22`; }}
       onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.gray200; e.currentTarget.style.boxShadow = 'none'; }}>
      {meta.thumbnail ? (
        <div style={{ position:'relative', height:180, overflow:'hidden', background:`${meta.bgColor}15` }}>
          <img src={meta.thumbnail} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} />
          {isVideo && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:54, height:54, borderRadius:'50%', background:'rgba(255,255,255,0.95)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 18px rgba(0,0,0,0.3)', color:meta.bgColor, fontSize:20, paddingLeft:4 }}>▶</div>
            </div>
          )}
          <div style={{ position:'absolute', top:10, left:10, padding:'4px 10px', background:meta.bgColor, color:'#fff', fontSize:10, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', borderRadius:6 }}>{meta.siteName}</div>
        </div>
      ) : (
        <div style={{ height:8, background: meta.bgColor }}></div>
      )}
      <div style={{ padding:'12px 14px' }}>
        <div style={{ fontSize:10, fontWeight:700, color:meta.bgColor, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>{meta.siteName} · {meta.domain}</div>
        <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, color:COLORS.gray900, lineHeight:1.35, marginBottom:5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{meta.title}</div>
        {meta.description && <div style={{ fontSize:12, color:COLORS.gray500, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{meta.description}</div>}
      </div>
    </a>
  );
}

// ════════════════════════════════════════════════════════════
//  ALGORITHME DE FEED
//
//  Mix : 60 % publications de tes contacts (chronologique)
//        20 % publications d'amis d'amis (boost récence + affinité)
//        10 % autres publications de la communauté
//        10 % suggestions plateforme (pétitions, articles, mobs…)
//
//  Le scoring d'affinité augmente quand :
//    + le contenu correspond à ta localisation
//    + tu as déjà engagé avec cette catégorie
//    + tes contacts ont engagé avec ce contenu
//
//  Pénalité (anti-spam) : si tu n'as JAMAIS acheté sur le marketplace,
//  on évite de t'en montrer (forte pénalité). Idem pour SEL et services
//  où tu n'as pas d'historique.
//
//  Bonus universel sur les pétitions et mobilisations (intérêt général
//  militant assumé).
//
//  Décroissance temporelle : -0.2 point par jour d'âge.
//
//  Anti-doublon plateforme : on n'injecte pas 2 fois le même type de
//  service consécutivement.
// ════════════════════════════════════════════════════════════
function computeAffinityScore(item, user) {
  let score = 50; // base

  // Boost localisation
  const userLoc = (user?.location || '').toLowerCase();
  if (item.location && userLoc && item.location.toLowerCase().includes(userLoc.split(' ')[0])) {
    score += 12;
  }

  // Catégories où l'utilisateur a déjà engagé (mock : on déduit de ses badges)
  const engagedCats = new Set();
  (user?.badges || []).forEach(b => {
    if (/SEL/i.test(b)) engagedCats.add('sel');
    if (/jardinière|jardin/i.test(b)) engagedCats.add('garden');
    if (/Signataire|p[ée]tition/i.test(b)) engagedCats.add('petitions');
    if (/militant|active|fondateur/i.test(b)) { engagedCats.add('mobilizations'); engagedCats.add('petitions'); }
    if (/contributeur|m[ée]dia/i.test(b)) engagedCats.add('media');
  });

  // Pénalité anti-spam : si l'utilisateur n'a jamais touché ce service
  if (item._service === 'marketplace' && !engagedCats.has('marketplace')) score -= 25;
  if (item._service === 'sel' && !engagedCats.has('sel'))                 score -= 8;
  if (item._service === 'garden' && !engagedCats.has('garden'))           score -= 5;

  // Bonus universel intérêt général militant
  if (item._service === 'petitions')      score += 15;
  if (item._service === 'mobilizations')  score += 12;
  if (item._service === 'media')          score += 8;

  // Boost si la catégorie correspond à un engagement passé
  if (item._service && engagedCats.has(item._service)) score += 10;

  // Décroissance temporelle
  if (item.date) {
    const ageDays = (Date.now() - new Date(item.date)) / 86400000;
    score -= ageDays * 0.2;
  }

  return Math.max(0, score);
}

// Compose un feed mixé selon les ratios 60/20/10/10
// Les posts de l'utilisateur·rice (origin === 'self' ou author_id === userId) sont
// systématiquement injectés en tête, hors du quota — c'est *son* fil.
function composeFeed(user, posts, platformItems) {
  const userId = user?.id || 1; // par défaut Marie (id 1)
  const contactIds = new Set(DEFAULT_CONTACTS);
  const fofIds = new Set(DEFAULT_FOFS);

  // Posts publiés par l'utilisateur·rice elle-même (toujours en tête, ordre antichrono)
  const bySelf = posts.filter(p => p._origin === 'self' || p.author_id === userId)
                       .sort((a, b) => new Date(b.date) - new Date(a.date))
                       .map(p => ({ ...p, _origin: 'self' }));

  // Catégoriser le reste
  const byContacts = posts.filter(p => p._origin !== 'self' && p.author_id !== userId && contactIds.has(p.author_id));
  const byFoFs     = posts.filter(p => p._origin !== 'self' && p.author_id !== userId && fofIds.has(p.author_id) && !contactIds.has(p.author_id));
  const byOthers   = posts.filter(p => p._origin !== 'self' && !contactIds.has(p.author_id) && !fofIds.has(p.author_id) && p.author_id !== userId);

  // Tri chronologique (plus récent d'abord)
  const sortDate = arr => arr.sort((a,b) => new Date(b.date) - new Date(a.date));
  sortDate(byContacts); sortDate(byFoFs); sortDate(byOthers);

  // Scoring des items plateforme
  const scoredPlatform = platformItems
    .map(it => ({ ...it, _score: computeAffinityScore(it, user) }))
    .sort((a,b) => b._score - a._score);

  // Ratios cibles pour un feed de ~16 items
  const TARGET = 16;
  const counts = {
    contacts: Math.round(TARGET * 0.60),  // 10
    fofs:     Math.round(TARGET * 0.20),  // 3
    others:   Math.round(TARGET * 0.10),  // 2
    platform: Math.round(TARGET * 0.10),  // 2
  };

  // Sélections
  const sel = {
    contacts: byContacts.slice(0, counts.contacts).map(p => ({ ...p, _origin:'contact' })),
    fofs:     byFoFs.slice(0, counts.fofs).map(p => ({ ...p, _origin:'fof' })),
    others:   byOthers.slice(0, counts.others).map(p => ({ ...p, _origin:'other' })),
    platform: scoredPlatform.slice(0, counts.platform).map(p => ({ ...p, _origin:'platform' })),
  };

  // Composition : self en premier (hors quota), puis on injecte fofs / others / platform
  // à des positions stratégiques pour casser la monotonie, le reste = contacts chronologique
  const feed = [...bySelf];
  let cIdx = 0, fIdx = 0, oIdx = 0, pIdx = 0;
  let lastPlatformService = null;

  for (let pos = 0; pos < TARGET; pos++) {
    // Toutes les ~5 positions : platform (anti-doublon par service)
    if (pos > 1 && pos % 5 === 0 && pIdx < sel.platform.length) {
      const candidate = sel.platform[pIdx];
      if (candidate._service !== lastPlatformService) {
        feed.push(candidate);
        lastPlatformService = candidate._service;
        pIdx++;
        continue;
      }
    }
    // Toutes les ~4 positions : ami d'ami
    if (pos > 0 && pos % 4 === 0 && fIdx < sel.fofs.length) {
      feed.push(sel.fofs[fIdx++]);
      continue;
    }
    // Toutes les ~7 positions : autre
    if (pos > 0 && pos % 7 === 0 && oIdx < sel.others.length) {
      feed.push(sel.others[oIdx++]);
      continue;
    }
    // Sinon, contact (le pilier du feed)
    if (cIdx < sel.contacts.length) feed.push(sel.contacts[cIdx++]);
    else if (fIdx < sel.fofs.length) feed.push(sel.fofs[fIdx++]);
    else if (oIdx < sel.others.length) feed.push(sel.others[oIdx++]);
    else if (pIdx < sel.platform.length) feed.push(sel.platform[pIdx++]);
  }
  return feed;
}

// Récupère les éléments plateforme de tous les services pour les suggestions
function getPlatformItems() {
  const items = [];
  (window.AppData?.petitions || []).slice(0, 4).forEach(p => items.push({ ...p, _service:'petitions', _label:'Pétition à signer' }));
  (window.AppData?.mobilizations || []).slice(0, 3).forEach(m => items.push({ ...m, _service:'mobilizations', _label:'Mobilisation', date: m.date }));
  (window.AppData?.media || []).filter(a => a.featured).slice(0, 3).forEach(a => items.push({ ...a, _service:'media', _label:'Article du média' }));
  (window.AppData?.crowdfunding || []).slice(0, 2).forEach(c => items.push({ ...c, _service:'crowdfunding', _label:'Cagnotte solidaire' }));
  (window.AppData?.sel || []).slice(0, 2).forEach(s => items.push({ ...s, _service:'sel', _label:'Service SEL', title:s.service }));
  (window.AppData?.marketplace || []).slice(0, 2).forEach(m => items.push({ ...m, _service:'marketplace', _label:'Marketplace' }));
  return items;
}

// Menu contextuel ⋯ (Signaler / Masquer / Copier le lien)
function PostMenu({ post, onHide }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const copyLink = () => {
    const url = `${location.origin}${location.pathname}#post-${post.id}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => window.showToast?.('Lien copié dans le presse-papiers', { type: 'success', icon: '🔗' }));
    else window.showToast?.('Lien : ' + url, { type: 'info' });
    close();
  };
  const report = () => { window.showToast?.('Signalement envoyé à la modération', { type: 'success', icon: '⚠️' }); close(); };
  const hide = () => { onHide?.(post.id); window.showToast?.('Publication masquée', { type: 'info', icon: '🙈' }); close(); };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} aria-label="Plus d'options sur cette publication" aria-expanded={open}
        style={{ border: 'none', background: open ? COLORS.gray100 : 'transparent', cursor: 'pointer', color: COLORS.gray500, fontSize: 18, padding: '4px 8px', borderRadius: 8, transition: 'background 0.15s' }}>⋯</button>
      {open && (
        <>
          <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 50 }}></div>
          <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#fff', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: `1px solid ${COLORS.gray200}`, minWidth: 200, zIndex: 60, overflow: 'hidden' }}>
            {[
              { icon: '🔗', label: 'Copier le lien du post', action: copyLink },
              { icon: '🙈', label: 'Masquer cette publication', action: hide },
              { icon: '⚠️', label: 'Signaler', action: report, danger: true },
            ].map(opt => (
              <button key={opt.label} onClick={opt.action} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: opt.danger ? COLORS.red : COLORS.gray700, fontFamily: 'Inter,sans-serif', textAlign: 'left', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = COLORS.gray50}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span>{opt.icon}</span><span>{opt.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PostCard({ post, user, onHide }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [shares, setShares] = useState(post.shares || 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = () => { setLiked(!liked); setLikes(l => liked ? l - 1 : l + 1); };
  const handleComment = () => {
    if (!comment.trim()) return;
    setComments(cs => [...cs, { id: Date.now(), author: user?.name || 'Anonyme', text: comment, time: 'À l\'instant' }]);
    setComment('');
  };
  const handleShare = () => {
    const url = `${location.origin}${location.pathname}#post-${post.id}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => window.showToast?.('Lien copié dans le presse-papiers', { type: 'success', icon: '🔗' }));
    else window.showToast?.('Lien : ' + url, { type: 'info' });
    setShares(s => s + 1);
  };

  return (
    <Card style={{ marginBottom: 14 }}>
      <div style={{ padding: '14px 16px' }}>
        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
            {post.author.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.gray900, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {post.author}
              {post._origin === 'self'  && <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.red, background: '#FDE9F2', padding: '2px 7px', borderRadius: 9999, letterSpacing: '0.04em' }}>Ta publication</span>}
              {post._origin === 'fof'   && <span style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', background: '#F3EBFE', padding: '2px 7px', borderRadius: 9999, letterSpacing: '0.04em' }}>Ami·e d'ami·e</span>}
              {post._origin === 'other' && <span style={{ fontSize: 10, fontWeight: 700, color: '#0891B2', background: '#ECFEFF', padding: '2px 7px', borderRadius: 9999, letterSpacing: '0.04em' }}>Découverte communauté</span>}
            </div>
            <div style={{ fontSize: 11, color: COLORS.gray400 }}>{post.time}</div>
          </div>
          <PostMenu post={post} onHide={onHide} />
        </div>

        {/* Content */}
        <p style={{ fontSize: 14, color: COLORS.gray700, lineHeight: 1.65, margin: '0 0 10px', whiteSpace: 'pre-line' }}>{post.content}</p>

        {/* Image */}
        {post.image && <img src={post.image} alt="" loading="lazy" style={{ width: '100%', borderRadius: 12, marginBottom: 10, maxHeight: 320, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
        {post.video && (
          <video src={post.video} controls preload="metadata" style={{ width: '100%', borderRadius: 12, marginBottom: 10, maxHeight: 360, background: '#000' }} />
        )}
        {post.link && <LinkPreviewCard link={post.link} />}

        {/* Tags */}
        {post.tags?.length > 0 && <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {post.tags.map(t => <Badge key={t} color="blue" style={{ fontSize: 11 }}>#{t}</Badge>)}
        </div>}

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.gray400, padding: '8px 0', borderTop: `1px solid ${COLORS.gray100}`, borderBottom: `1px solid ${COLORS.gray100}`, margin: '0 0 8px' }}>
          <span>{likes} j'aime{likes > 1 ? 's' : ''}</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setShowComments(!showComments)}>{comments.length} commentaire{comments.length > 1 ? 's' : ''} · {shares} partage{shares > 1 ? 's' : ''}</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { icon: liked ? '❤️' : '🤍', label: liked ? 'Aimé' : 'J\'aime', action: handleLike, active: liked, aria: liked ? 'Retirer le j\'aime' : 'J\'aime cette publication' },
            { icon: '💬', label: 'Commenter', action: () => setShowComments(!showComments), aria: 'Afficher ou masquer les commentaires' },
            { icon: '↗️', label: 'Partager', action: handleShare, aria: 'Partager ce post' },
          ].map(a => (
            <button key={a.label} onClick={a.action} aria-label={a.aria} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: a.active ? COLORS.red : COLORS.gray500, borderRadius: 8, fontFamily: 'Inter,sans-serif', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = COLORS.gray50} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {a.icon} <span className="mn-desktop-nav" style={{ display: 'inline' }}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Comments */}
        {showComments && (
          <div style={{ marginTop: 10, borderTop: `1px solid ${COLORS.gray100}`, paddingTop: 10 }}>
            {comments.length === 0
              ? <div style={{ fontSize: 12, color: COLORS.gray400, textAlign: 'center', padding: '12px 8px', fontStyle: 'italic' }}>Sois le·la premier·e à commenter cette publication</div>
              : comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: COLORS.gray200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{c.author.charAt(0)}</div>
                  <div style={{ background: COLORS.gray50, borderRadius: 12, padding: '8px 12px', flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: COLORS.gray900 }}>{c.author}<span style={{ fontWeight: 400, color: COLORS.gray400, marginLeft: 6, fontSize: 11 }}>{c.time}</span></div>
                    <div style={{ fontSize: 13, color: COLORS.gray700, marginTop: 2 }}>{c.text}</div>
                  </div>
                </div>
              ))}
            {user && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{user.name.charAt(0)}</div>
                <div style={{ flex: 1, display: 'flex', gap: 6 }}>
                  <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleComment()} placeholder="Votre commentaire..." aria-label="Écrire un commentaire" style={{ flex: 1, height: 36, border: `1.5px solid ${COLORS.gray200}`, borderRadius: 18, padding: '0 14px', fontSize: 13, fontFamily: 'Inter,sans-serif', outline: 'none' }} />
                  <button onClick={handleComment} aria-label="Envoyer le commentaire" style={{ border: 'none', background: COLORS.red, color: '#fff', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16 }}>↑</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
//  PlatformSuggestionCard — card mise en avant d'un service
//  (apparaît tous les ~5 posts, max 10 % du feed)
// ════════════════════════════════════════════════════════════
function PlatformSuggestionCard({ item, setActivePage }) {
  const SERVICE_META = {
    petitions:     { icon:'✊', color:'#E11D74', label:'Pétition à signer',       cta:'Signer cette pétition →' },
    mobilizations: { icon:'📅', color:'#7C3AED', label:'Mobilisation à venir',     cta:'Voir cette mobilisation →' },
    media:         { icon:'📰', color:'#5B21B6', label:'Article du média',         cta:'Lire l\'article →' },
    crowdfunding:  { icon:'💰', color:'#A21CAF', label:'Cagnotte solidaire',       cta:'Contribuer →' },
    sel:           { icon:'🤲', color:'#C026D3', label:'Service SEL proche',       cta:'Voir le service →' },
    marketplace:   { icon:'🛍', color:'#DC2654', label:'Sur le marketplace',       cta:'Voir l\'article →' },
  };
  const meta = SERVICE_META[item._service] || SERVICE_META.petitions;
  return (
    <Card style={{ padding:0, overflow:'hidden', border:`1px solid ${COLORS.gray200}`, position:'relative' }}>
      <div style={{ background: `linear-gradient(135deg, ${meta.color}15, ${meta.color}08)`, padding:'12px 18px', borderBottom:`1px solid ${COLORS.gray200}`, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:18 }}>{meta.icon}</span>
        <span style={{ fontSize:11, fontWeight:800, color:meta.color, textTransform:'uppercase', letterSpacing:'0.08em' }}>SUGGESTION · {meta.label}</span>
        <span style={{ marginLeft:'auto', fontSize:10, color:COLORS.gray400, fontStyle:'italic' }}>basé sur ton profil</span>
      </div>
      <div style={{ padding:'18px 20px' }}>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:700, color:COLORS.gray900, marginBottom:6, lineHeight:1.3 }}>{item.title}</div>
        <div style={{ fontSize:13, color:COLORS.gray500, marginBottom:14, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {item.description || item.excerpt || (item.signatures ? `${item.signatures.toLocaleString('fr-FR')} signatures` : '')}
        </div>
        <button onClick={() => setActivePage(item._service)} style={{ background:meta.color, color:'#fff', border:'none', padding:'9px 16px', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif', boxShadow:`0 4px 12px ${meta.color}40` }}>
          {meta.cta}
        </button>
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
//  GroupDetailPage — vraie page détail (cohérence Bloc 5 cagnottes)
//  Hero avec gradient color du groupe + posts liés + sidebar charte
// ════════════════════════════════════════════════════════════
function GroupDetailPage({ group, posts, user, onBack, isJoined, onToggleJoin, onSelectMember }) {
  const [shareOpen, setShareOpen] = useState(false);
  // 3 derniers posts qui mentionnent le nom du groupe ou son thème
  const groupPosts = posts.filter(p => {
    const txt = (p.content || '').toLowerCase();
    const tags = (p.tags || []).join(' ').toLowerCase();
    return txt.includes(group.name.toLowerCase().split(' ')[0]) || tags.includes(group.name.toLowerCase().split(' ')[0]) || (group.id === 1 && /climat|écolog|carbone/i.test(txt + tags)) || (group.id === 6 && /média|reporterre|mediapart|vert/i.test(txt + tags));
  }).slice(0, 3);
  const recentMembers = SAMPLE_MEMBERS.slice(0, 5);
  const permalink = `${location.origin}${location.pathname}#groupe/${group.id}`;
  const memberCount = group.members + (isJoined ? 1 : 0);

  return (
    <div style={{ maxWidth: 1152, margin: '0 auto', padding: '20px 16px 100px' }}>
      <button onClick={onBack} aria-label="Retour à la liste des groupes" style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: COLORS.gray500, fontSize: 13, fontWeight: 600, fontFamily: 'Inter,sans-serif', padding: '8px 0', marginBottom: 12 }}>← Réseau · Groupes</button>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${group.color}, ${group.color}AA)`, borderRadius: 24, padding: '36px 32px', color: '#fff', marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -40, fontSize: 240, opacity: 0.12, lineHeight: 1 }}>{group.icon}</div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 84, height: 84, borderRadius: 20, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, flexShrink: 0, backdropFilter: 'blur(8px)' }}>{group.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(255,255,255,0.18)', borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>👥 Groupe public</div>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(22px,3.6vw,34px)', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>{group.name}</h1>
            <p style={{ fontSize: 14, opacity: 0.92, margin: '0 0 16px', lineHeight: 1.5, maxWidth: 600 }}>{group.desc}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Btn size="md" variant="white" onClick={onToggleJoin} icon={isJoined ? '✓' : '+'}>
                {isJoined ? 'Membre · Quitter le groupe' : 'Rejoindre le groupe'}
              </Btn>
              <button onClick={() => setShareOpen(true)} aria-label="Partager ce groupe"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 44, padding: '0 22px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Inter,sans-serif', cursor: 'pointer', transition: 'all 0.18s', backdropFilter: 'blur(4px)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}>
                ↗ Partager
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 20, alignItems: 'start' }} className="mn-reseau-grid">
        {/* Main */}
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
            {[
              { v: memberCount.toLocaleString('fr-FR'), l: 'Membres' },
              { v: Math.floor(group.members / 50), l: 'Posts par sem.' },
              { v: 'Public', l: 'Type' },
            ].map(s => (
              <div key={s.l} style={{ background: '#fff', border: `1px solid ${COLORS.gray200}`, borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: group.color, lineHeight: 1.1 }}>{s.v}</div>
                <div style={{ fontSize: 11, color: COLORS.gray500, marginTop: 4, fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Charte */}
          <div style={{ background: `${group.color}10`, borderRadius: 14, padding: '16px 18px', borderLeft: `4px solid ${group.color}`, marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: group.color, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>👋 Charte du groupe</div>
            <div style={{ fontSize: 13, color: COLORS.gray700, lineHeight: 1.6 }}>Bienveillance, écoute, respect des positions divergentes. Pas de spam, pas de pub commerciale, modération par les pairs. Les contenus illégaux ou haineux entraînent une exclusion immédiate.</div>
          </div>

          {/* Derniers posts */}
          <SectionHeader icon="📰" title={`Derniers échanges du groupe (${groupPosts.length})`} sub={groupPosts.length === 0 ? 'Aucune publication récente liée — sois le·la premier·e' : null} />
          {groupPosts.length === 0
            ? <Card style={{ padding: '24px 16px', textAlign: 'center', color: COLORS.gray500, fontSize: 13, fontStyle: 'italic' }}>Pas encore de publication dans ce fil. Publie depuis ton fil principal en mentionnant <strong style={{ color: group.color }}>#{group.name.toLowerCase().split(' ')[0]}</strong> pour amorcer la discussion.</Card>
            : groupPosts.map(p => <PostCard key={p.id} post={p} user={user} />)
          }
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="mn-reseau-sidebar">
          {/* Membres récents */}
          <Card style={{ padding: '14px 16px' }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.gray900, marginBottom: 10 }}>Membres récents</div>
            {recentMembers.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${COLORS.gray100}` }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{m.name.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: COLORS.gray900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.gray400 }}>{m.role}</div>
                </div>
                <button onClick={() => onSelectMember?.(m)} aria-label={`Envoyer un message à ${m.name}`} style={{ border: `1px solid ${COLORS.gray200}`, background: 'transparent', borderRadius: 8, padding: '3px 8px', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontWeight: 600, color: COLORS.gray600 }}>💬</button>
              </div>
            ))}
          </Card>

          {/* Couleur thématique du groupe */}
          <div style={{ background: `linear-gradient(135deg, ${group.color}, ${group.color}DD)`, borderRadius: 14, padding: '16px', color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 6 }}>{group.icon}</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{group.name}</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Espace de discussion modéré par les pairs</div>
          </div>
        </div>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} title={group.name} url={permalink} text={`Rejoins le groupe « ${group.name} » sur Maintenant !`} />
    </div>
  );
}

function ReseauPage({ user, onOpenAuth, setActivePage, adminMode }) {
  const [tab, setTab] = useState('feed');
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [hiddenIds, setHiddenIds] = useState(new Set());
  const [newPost, setNewPost] = useState('');
  const [newPostImg, setNewPostImg] = useState('');
  const [newPostVideo, setNewPostVideo] = useState('');
  const [newPostLink, setNewPostLink] = useState(null); // { url, internal:bool, title?, description?, thumbnail? }
  const fileInputRef = useRef(null);
  const [search, setSearch] = useState('');
  const [groupDetail, setGroupDetail] = useState(null);
  const [groupShareOpen, setGroupShareOpen] = useState(false);
  const [joinedTick, setJoinedTick] = useState(0);
  const [showAlgoExplain, setShowAlgoExplain] = useState(false);

  // Calcul du feed mixé (recalcul si user ou posts changent)
  const feed = React.useMemo(
    () => composeFeed(user || { id:1, location:'Paris', badges:['Signataire ×10','Militante active'] }, posts, getPlatformItems()),
    [user, posts]
  );

  const isGroupJoined = id => window.isUserJoined?.('groups', id);
  const toggleGroupJoin = (g) => {
    const nowJoined = window.toggleUserJoin?.('groups', g.id);
    setJoinedTick(t => t + 1);
    window.showToast?.(nowJoined ? `Tu as rejoint « ${g.name} »` : `Tu as quitté « ${g.name} »`, { type: nowJoined ? 'success' : 'info', icon: nowJoined ? '👋' : '←' });
  };

  if (!user) return (
    <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ fontSize:56, marginBottom:16 }}>👥</div>
      <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:COLORS.gray900, margin:'0 0 8px' }}>Réseau Social Militant</h2>
      <p style={{ color:COLORS.gray500, fontSize:15, maxWidth:360, lineHeight:1.6, margin:'0 0 24px' }}>Sans publicité. Sans algorithme commercial. Réservé aux membres de Maintenant !</p>
      <Btn variant="gradient" size="lg" onClick={onOpenAuth}>Se connecter pour accéder</Btn>
    </div>
  );

  // Helpers compose
  const handleImagePick = () => fileInputRef.current?.click();
  const handleImageFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { window.showToast?.('Image trop grosse (max 4 Mo)', { type: 'error' }); return; }
    const reader = new FileReader();
    reader.onload = ev => setNewPostImg(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const handleAddVideo = () => {
    const url = window.prompt('URL de la vidéo (YouTube, Vimeo, fichier mp4 direct...) :');
    if (!url || !url.trim()) return;
    setNewPostVideo(url.trim());
  };
  const handleAddLink = () => {
    const url = window.prompt('URL à partager (page externe ou lien interne #petitions/X) :');
    if (!url || !url.trim()) return;
    const trimmed = url.trim();
    const internal = trimmed.startsWith('#') || trimmed.startsWith('/');
    if (internal) {
      setNewPostLink({ url: trimmed, internal: true, title: 'Lien interne · Maintenant !', description: trimmed });
    } else {
      const domain = (() => { try { return new URL(trimmed).hostname.replace(/^www\./, ''); } catch { return trimmed; } })();
      setNewPostLink({ url: trimmed, internal: false, title: domain, description: 'Aperçu du lien à charger' });
    }
  };

  const handlePost = () => {
    if (!newPost.trim() && !newPostImg && !newPostVideo && !newPostLink) return;
    const post = {
      id: Date.now(),
      author_id: user.id || 1,
      author: user.name,
      time: 'À l\'instant',
      date: new Date().toISOString(),
      content: newPost,
      likes: 0,
      shares: 0,
      image: newPostImg || null,
      video: newPostVideo || null,
      link: newPostLink || null,
      tags: [],
      comments: [],
      _origin: 'self',
    };
    setPosts(ps => [post, ...ps]);
    setNewPost(''); setNewPostImg(''); setNewPostVideo(''); setNewPostLink(null);
    window.showToast?.('Publication partagée sur ton fil', { type: 'success', icon: '✨' });
  };

  const tabStyle = (id) => ({ flex:1, padding:'10px 6px', border:'none', cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'Inter,sans-serif', background:tab===id?'#fff':COLORS.gray100, color:tab===id?COLORS.red:COLORS.gray500, boxShadow:tab===id?'0 2px 8px rgba(0,0,0,0.08)':'none', borderRadius:10, whiteSpace:'nowrap' });

  // Early return : page détail d'un groupe (cohérence Bloc 5)
  if (groupDetail) return (
    <GroupDetailPage
      group={groupDetail} posts={posts} user={user}
      onBack={() => setGroupDetail(null)}
      isJoined={isGroupJoined(groupDetail.id)}
      onToggleJoin={() => toggleGroupJoin(groupDetail)}
      onSelectMember={m => { setActivePage?.('messages'); window.showToast?.(`Conversation avec ${m.name.split(' ')[0]} ouverte`, { type: 'info', icon: '💬' }); }}
    />
  );

  return (
    <div style={{ maxWidth:1152, margin:'0 auto', padding:'20px 16px 100px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 280px', gap:20, alignItems:'start' }} className="mn-reseau-grid">
        {/* Main column */}
        <div>
          {/* Tabs */}
          <div style={{ display:'flex', gap:4, background:COLORS.gray100, borderRadius:12, padding:4, marginBottom:20, overflowX:'auto' }}>
            {[['feed','📰 Fil d\'actu'],['groupes','👥 Groupes'],['membres','🌐 Membres'],['découvrir','✨ Découvrir']].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={tabStyle(id)}>{label}</button>
            ))}
          </div>

          {/* Feed */}
          {tab==='feed' && <>
            {/* Compose */}
            <Card style={{ marginBottom: 16, padding: '14px 16px' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{user.name.charAt(0)}</div>
                <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder={`Quoi de neuf, ${user.name.split(' ')[0]} ? Partagez une action, une info, une ressource...`} aria-label="Contenu de votre publication" style={{ flex: 1, border: `1.5px solid ${COLORS.gray200}`, borderRadius: 12, padding: '10px 14px', fontSize: 14, fontFamily: 'Inter,sans-serif', resize: 'none', outline: 'none', minHeight: 70, lineHeight: 1.5 }} />
              </div>

              {/* Aperçus des médias attachés */}
              {newPostImg && (
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <img src={newPostImg} alt="Aperçu" style={{ width: '100%', borderRadius: 12, maxHeight: 280, objectFit: 'cover' }} />
                  <button onClick={() => setNewPostImg('')} aria-label="Retirer l'image" style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.7)', color: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>×</button>
                </div>
              )}
              {newPostVideo && (
                <div style={{ position: 'relative', marginBottom: 10, padding: '12px 14px', background: COLORS.gray50, borderRadius: 12, border: `1px dashed ${COLORS.gray300}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🎬</span>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: COLORS.gray700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{newPostVideo}</div>
                  <button onClick={() => setNewPostVideo('')} aria-label="Retirer la vidéo" style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: COLORS.gray300, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>×</button>
                </div>
              )}
              {newPostLink && (
                <div style={{ position: 'relative', marginBottom: 10, padding: '10px 14px', background: newPostLink.internal ? '#FDE9F2' : COLORS.gray50, borderRadius: 12, border: `1px solid ${newPostLink.internal ? COLORS.red : COLORS.gray300}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{newPostLink.internal ? '🔗' : '🌐'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: newPostLink.internal ? COLORS.red : COLORS.gray500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{newPostLink.internal ? 'Lien interne Maintenant !' : 'Lien externe'}</div>
                    <div style={{ fontSize: 12, color: COLORS.gray700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{newPostLink.url}</div>
                  </div>
                  <button onClick={() => setNewPostLink(null)} aria-label="Retirer le lien" style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: COLORS.gray300, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>×</button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageFile} style={{ display: 'none' }} aria-hidden="true" />
                  {[
                    { icon: '📷', label: 'Image',  action: handleImagePick, active: !!newPostImg },
                    { icon: '🎬', label: 'Vidéo',  action: handleAddVideo,  active: !!newPostVideo },
                    { icon: '🔗', label: 'Lien',   action: handleAddLink,   active: !!newPostLink },
                  ].map(b => (
                    <button key={b.label} onClick={b.action} aria-label={`Ajouter ${b.label.toLowerCase()} à la publication`}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, border: `1px solid ${b.active ? COLORS.red : COLORS.gray200}`, background: b.active ? '#FDE9F2' : 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: b.active ? COLORS.red : COLORS.gray600, fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}>
                      {b.icon} {b.label}
                    </button>
                  ))}
                </div>
                <Btn variant="gradient" size="sm" onClick={handlePost} disabled={!newPost.trim() && !newPostImg && !newPostVideo && !newPostLink}>Publier</Btn>
              </div>
            </Card>

            {/* Bandeau "Comment fonctionne ton fil ?" */}
            <Card style={{ padding:'12px 16px', background:'linear-gradient(135deg, #FDE9F2 0%, #F3EBFE 100%)', border:`1px solid ${COLORS.gray200}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:12, color:COLORS.gray700, lineHeight:1.5 }}>
                <span style={{ fontSize:18, flexShrink:0 }}>📊</span>
                <div>
                  <strong style={{ color:COLORS.red }}>Ton fil chronologique mixé</strong> — 60 % de tes contacts, 20 % d'amis d'amis, 10 % de la communauté, 10 % de la plateforme. Pas de pub, jamais. <span style={{ cursor:'pointer', textDecoration:'underline', color:COLORS.red }} onClick={()=>setShowAlgoExplain(!showAlgoExplain)}>{showAlgoExplain ? 'Masquer' : 'Comment ça marche ?'}</span>
                </div>
              </div>
              {showAlgoExplain && (
                <div style={{ marginTop:12, padding:'12px 14px', background:'rgba(255,255,255,0.7)', borderRadius:10, fontSize:12, color:COLORS.gray700, lineHeight:1.6 }}>
                  L'algorithme prend en compte ta localisation, tes pétitions signées, tes contributions, tes votes aux sondages, les services que tu utilises sur la plateforme. Plus tu engages, plus le fil reflète ce qui te tient à cœur — et il essaie d'élargir ton horizon en injectant des contenus d'amis d'amis ou suggérés. <strong>Anti-spam :</strong> si tu n'achètes jamais sur le marketplace, on évite de t'en envoyer. Idem pour les services jamais utilisés.
                </div>
              )}
            </Card>

            {/* Feed mixé via composeFeed */}
            {feed.filter(it => !hiddenIds.has(it.id)).map((item, idx) => (
              item._origin === 'platform'
                ? <PlatformSuggestionCard key={`pf-${idx}`} item={item} setActivePage={setActivePage} />
                : <PostCard key={item.id} post={item} user={user} onHide={id => setHiddenIds(s => new Set([...s, id]))} />
            ))}
          </>}

          {/* Groupes */}
          {tab==='groupes' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
              {SAMPLE_GROUPS.map(g => (
                <a key={g.id} href={`#groupe/${g.id}`} onClick={e => { e.preventDefault(); setGroupDetail(g); }} className="mn-card-hover"
                  aria-label={`Groupe ${g.name} : ${g.members.toLocaleString('fr-FR')} membres`}
                  style={{ display: 'block', textDecoration: 'none', color: 'inherit', background: '#fff', border: `1px solid ${COLORS.gray200}`, borderRadius: 14, padding: '16px', transition: 'all 0.22s' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${g.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{g.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.gray900, marginBottom: 3 }}>{g.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.gray500, marginBottom: 8, lineHeight: 1.4 }}>{g.desc}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: COLORS.gray400 }}>👥 {(g.members + (isGroupJoined(g.id) ? 1 : 0)).toLocaleString('fr-FR')} membres</span>
                        <Btn variant={isGroupJoined(g.id) ? 'success' : 'outline'} size="sm" onClick={e => { e.stopPropagation(); e.preventDefault(); toggleGroupJoin(g); }}>
                          {isGroupJoined(g.id) ? '✓ Membre' : 'Rejoindre'}
                        </Btn>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Membres */}
          {tab==='membres' && <>
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher par nom, rôle, ville ou badge..." />
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {SAMPLE_MEMBERS.filter(m => {
                if (!search) return true;
                const q = search.toLowerCase();
                return [m.name, m.role, m.location, ...(m.badges || [])].some(s => typeof s === 'string' && s.toLowerCase().includes(q));
              }).map(m => (
                <Card key={m.id} style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:18, flexShrink:0 }}>{m.name.charAt(0)}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:COLORS.gray900 }}>{m.name}</div>
                    <div style={{ fontSize:12, color:COLORS.gray500 }}>{m.role} · 📍 {m.location} · Membre depuis {m.joined}</div>
                    <div style={{ display:'flex', gap:4, marginTop:4, flexWrap:'wrap' }}>{m.badges.map(b => <Badge key={b} color="red" style={{ fontSize:10 }}>{b}</Badge>)}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <T99 value={m.t99cp} size={12} />
                    <div style={{ marginTop:4 }}>
                      <Btn variant="outline" size="sm" onClick={() => { setActivePage?.('messages'); window.showToast?.(`Conversation avec ${m.name.split(' ')[0]} ouverte`, { type: 'info', icon: '💬' }); }}>Message</Btn>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>}

          {/* Découvrir */}
          {tab==='découvrir' && (
            <div>
              <SectionHeader icon="✨" title="Découvrir" sub="Contenu recommandé" />
              <div style={{ display:'grid', gap:12 }}>
                {[
                  { icon:'🔥', label:'Pétitions tendances', desc:'Les pétitions qui mobilisent le plus en ce moment', page:'petitions' },
                  { icon:'📅', label:'Événements à venir', desc:'Mobilisations près de chez vous', page:'mobilizations' },
                  { icon:'🤲', label:'Services SEL disponibles', desc:'Des compétences à échanger dès maintenant', page:'sel' },
                  { icon:'🥬', label:'Surplus du jardin', desc:'Dons et ventes dans votre région', page:'garden' },
                ].map(item => (
                  <a key={item.label} href={`#${item.page}`} onClick={e => { e.preventDefault(); setActivePage(item.page); }} className="mn-card-hover"
                    aria-label={`${item.label} — ouvrir`}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff', border: `1px solid ${COLORS.gray200}`, borderRadius: 14, textDecoration: 'none', color: 'inherit', transition: 'all 0.22s' }}>
                    <div style={{ fontSize: 28 }}>{item.icon}</div>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14, color: COLORS.gray900 }}>{item.label}</div><div style={{ fontSize: 12, color: COLORS.gray500 }}>{item.desc}</div></div>
                    <span style={{ color: COLORS.gray300, fontSize: 20 }}>›</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }} className="mn-reseau-sidebar">
          {/* User card — stats connectées aux vraies valeurs */}
          {(() => {
            const joinedGroupsCount = SAMPLE_GROUPS.filter(g => isGroupJoined(g.id)).length;
            const userPostsCount = posts.filter(p => p._origin === 'self' || p.author_id === (user.id || 1)).length;
            const userSignatures = user.signatures_count ?? 0;
            return (
              <Card style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>{user.name.charAt(0)}</div>
                  <div><div style={{ fontWeight: 700, fontSize: 14, color: COLORS.gray900 }}>{user.name}</div><T99 value={user.t99cp_balance} size={12} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, textAlign: 'center' }}>
                  {[
                    [userSignatures, 'Signatures'],
                    [joinedGroupsCount, 'Groupes'],
                    [userPostsCount, 'Publi.'],
                  ].map(([v, l]) => (
                    <div key={l} style={{ background: COLORS.gray50, borderRadius: 10, padding: '8px 4px' }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: COLORS.gray900 }}>{v}</div>
                      <div style={{ fontSize: 10, color: COLORS.gray400 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })()}

          {/* Groupes suggérés (non-joints uniquement) */}
          <Card style={{ padding: '14px 16px' }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.gray900, marginBottom: 10 }}>Groupes suggérés</div>
            {SAMPLE_GROUPS.filter(g => !isGroupJoined(g.id)).slice(0, 3).map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${COLORS.gray100}` }}>
                <div style={{ fontSize: 20 }}>{g.icon}</div>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setGroupDetail(g)}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: COLORS.gray900 }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.gray400 }}>{g.members.toLocaleString('fr-FR')} membres</div>
                </div>
                <button onClick={() => toggleGroupJoin(g)} aria-label={`Rejoindre ${g.name}`} style={{ border: `1px solid ${COLORS.red}`, background: 'transparent', borderRadius: 8, padding: '3px 8px', fontSize: 11, cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontWeight: 700, color: COLORS.red, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = COLORS.red; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.red; }}>+</button>
              </div>
            ))}
            {SAMPLE_GROUPS.filter(g => !isGroupJoined(g.id)).length === 0 && (
              <div style={{ fontSize: 12, color: COLORS.gray400, textAlign: 'center', padding: '10px 4px', fontStyle: 'italic' }}>Tu as rejoint tous les groupes 🎉</div>
            )}
          </Card>

          {/* T99CP info */}
          <div style={{ background:'linear-gradient(135deg,#1e3a5f,#1d4ed8)', borderRadius:14, padding:'14px 16px', color:'#fff' }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>₮ Votre Wallet T99CP</div>
            <div style={{ fontSize:24, fontWeight:800, fontFamily:"'Sora',sans-serif" }}>{user.t99cp_balance}</div>
            <div style={{ fontSize:12, opacity:0.7, marginBottom:10 }}>T99CP disponibles</div>
            <button onClick={()=>window.open('https://the99coinproject.org','_blank')} style={{ width:'100%', background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:10, padding:'8px', color:'#fff', fontWeight:600, fontSize:12, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Gérer mon wallet →</button>
          </div>
        </div>
      </div>

    </div>
  );
}
window.ReseauPage = ReseauPage;
