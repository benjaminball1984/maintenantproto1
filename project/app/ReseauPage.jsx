// ReseauPage.jsx — Réseau social complet (feed, profils, groupes)
const { useState, useRef } = React;

const SAMPLE_POSTS = [
  { id:1, author:'Marie Dupont', avatar:null, time:'il y a 2h', content:'Victoire ! La pétition contre la fermeture des urgences vient de dépasser 14 000 signatures 🎉 Continuons à partager !', likes:47, comments:12, shares:8, image:'https://picsum.photos/seed/post1/600/300', tags:['santé','urgences'] },
  { id:2, author:'Thomas Rivière', avatar:null, time:'il y a 4h', content:'Retour du camp militant du Larzac — 3 jours intenses, des rencontres inoubliables, et une énergie collective qui fait chaud au cœur. Merci à toutes et tous ! ✊', likes:134, comments:28, shares:19, image:null, tags:['larzac','militant'] },
  { id:3, author:'Aisha Rahman', avatar:null, time:'il y a 6h', content:'Je propose un cours de yoga gratuit ce samedi matin à Paris 10e pour les camarades stressés par le mouvement. 10h-11h30, 10 places max. Inscriptions en MP 🧘', likes:23, comments:17, shares:5, image:null, tags:['SEL','yoga','Paris'] },
  { id:4, author:'Collectif Santé Pour Tous', avatar:null, time:'hier', content:'📢 ALERTE : La préfecture vient de confirmer la fermeture définitive de 3 maternités rurales. Nous organisons une conférence de presse mardi 10h. Venez nombreux !', likes:89, comments:34, shares:56, image:'https://picsum.photos/seed/post4/600/250', tags:['santé','maternité','alerte'] },
  { id:5, author:'Omar Benzara', avatar:null, time:'il y a 2 jours', content:'Thread sur la monnaie T99CP et pourquoi c\'est une révolution pour les échanges solidaires 🧵\n\n1/ La T99CP est indexée à la fois sur l\'euro et sur le temps de travail humain. 1 T99CP = 1€ = 1 minute de travail...', likes:201, comments:67, shares:88, image:null, tags:['T99CP','crypto','solidarité'] },
  { id:6, author:'Léa Martin', avatar:null, time:'il y a 3 jours', content:'Surplus de mon jardin ! J\'ai des kilos de courgettes et de tomates cerises. Passage possible à Lyon 7e ce week-end. DM pour organiser 🥬🍅', likes:31, comments:22, shares:3, image:'https://picsum.photos/seed/garden1/600/280', tags:['jardin','surplus','Lyon'] },
];

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

function PostCard({ post, user, onLike }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { id:1, author:'Thomas R.', text:'Excellent ! On continue ✊', time:'il y a 1h' },
    { id:2, author:'Aisha R.', text:'Partagé sur tous mes réseaux !', time:'il y a 30min' },
  ]);

  const handleLike = () => { setLiked(!liked); setLikes(l=>liked?l-1:l+1); };
  const handleComment = () => {
    if(!comment.trim()) return;
    setComments(cs=>[...cs,{id:Date.now(),author:user?.name||'Anonyme',text:comment,time:'À l\'instant'}]);
    setComment('');
  };

  return (
    <Card style={{ marginBottom:14 }}>
      <div style={{ padding:'14px 16px' }}>
        {/* Author */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <div style={{ width:40, height:40, borderRadius:'50%', background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:16, flexShrink:0 }}>
            {post.author.charAt(0)}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:14, color:COLORS.gray900 }}>{post.author}</div>
            <div style={{ fontSize:11, color:COLORS.gray400 }}>{post.time}</div>
          </div>
          <button style={{ border:'none', background:'transparent', cursor:'pointer', color:COLORS.gray400, fontSize:18, padding:4 }}>⋯</button>
        </div>

        {/* Content */}
        <p style={{ fontSize:14, color:COLORS.gray700, lineHeight:1.65, margin:'0 0 10px', whiteSpace:'pre-line' }}>{post.content}</p>

        {/* Image */}
        {post.image && <img src={post.image} alt="" style={{ width:'100%', borderRadius:12, marginBottom:10, maxHeight:280, objectFit:'cover' }} />}

        {/* Tags */}
        {post.tags?.length>0 && <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
          {post.tags.map(t=><Badge key={t} color="blue" style={{ fontSize:11 }}>#{t}</Badge>)}
        </div>}

        {/* Stats */}
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:COLORS.gray400, padding:'8px 0', borderTop:`1px solid ${COLORS.gray100}`, borderBottom:`1px solid ${COLORS.gray100}`, margin:'0 0 8px' }}>
          <span>{likes} j'aime{likes>1?'s':''}</span>
          <span style={{ cursor:'pointer' }} onClick={()=>setShowComments(!showComments)}>{comments.length} commentaire{comments.length>1?'s':''} · {post.shares} partages</span>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:0 }}>
          {[
            { icon: liked?'❤️':'🤍', label: liked?'Aimé':'J\'aime', action: handleLike, active: liked },
            { icon:'💬', label:'Commenter', action:()=>setShowComments(!showComments) },
            { icon:'↗️', label:'Partager', action:()=>alert('Partagé !') },
          ].map(a=>(
            <button key={a.label} onClick={a.action} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'8px', border:'none', background:'transparent', cursor:'pointer', fontSize:13, fontWeight:600, color:a.active?COLORS.red:COLORS.gray500, borderRadius:8, fontFamily:'Inter,sans-serif', transition:'background 0.15s' }} onMouseEnter={e=>e.currentTarget.style.background=COLORS.gray50} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              {a.icon} <span className="mn-desktop-nav" style={{ display:'inline' }}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Comments */}
        {showComments && (
          <div style={{ marginTop:10, borderTop:`1px solid ${COLORS.gray100}`, paddingTop:10 }}>
            {comments.map(c=>(
              <div key={c.id} style={{ display:'flex', gap:8, marginBottom:8 }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:COLORS.gray200, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0 }}>{c.author.charAt(0)}</div>
                <div style={{ background:COLORS.gray50, borderRadius:12, padding:'8px 12px', flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:12, color:COLORS.gray900 }}>{c.author}<span style={{ fontWeight:400, color:COLORS.gray400, marginLeft:6, fontSize:11 }}>{c.time}</span></div>
                  <div style={{ fontSize:13, color:COLORS.gray700, marginTop:2 }}>{c.text}</div>
                </div>
              </div>
            ))}
            {user && (
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:12, flexShrink:0 }}>{user.name.charAt(0)}</div>
                <div style={{ flex:1, display:'flex', gap:6 }}>
                  <input value={comment} onChange={e=>setComment(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleComment()} placeholder="Votre commentaire..." style={{ flex:1, height:36, border:`1.5px solid ${COLORS.gray200}`, borderRadius:18, padding:'0 14px', fontSize:13, fontFamily:'Inter,sans-serif', outline:'none' }} />
                  <button onClick={handleComment} style={{ border:'none', background:COLORS.red, color:'#fff', borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:16 }}>↑</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function ReseauPage({ user, onOpenAuth, setActivePage, adminMode }) {
  const [tab, setTab] = useState('feed');
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [newPost, setNewPost] = useState('');
  const [newPostImg, setNewPostImg] = useState('');
  const [search, setSearch] = useState('');

  if (!user) return (
    <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center' }}>
      <div style={{ fontSize:56, marginBottom:16 }}>👥</div>
      <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:COLORS.gray900, margin:'0 0 8px' }}>Réseau Social Militant</h2>
      <p style={{ color:COLORS.gray500, fontSize:15, maxWidth:360, lineHeight:1.6, margin:'0 0 24px' }}>Sans publicité. Sans algorithme commercial. Réservé aux membres de Maintenant !</p>
      <Btn variant="gradient" size="lg" onClick={onOpenAuth}>Se connecter pour accéder</Btn>
    </div>
  );

  const handlePost = () => {
    if(!newPost.trim()) return;
    setPosts(ps=>[{ id:Date.now(), author:user.name, avatar:null, time:'À l\'instant', content:newPost, likes:0, comments:0, shares:0, image:newPostImg||null, tags:[] }, ...ps]);
    setNewPost(''); setNewPostImg('');
  };

  const tabStyle = (id) => ({ flex:1, padding:'10px 6px', border:'none', cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'Inter,sans-serif', background:tab===id?'#fff':COLORS.gray100, color:tab===id?COLORS.red:COLORS.gray500, boxShadow:tab===id?'0 2px 8px rgba(0,0,0,0.08)':'none', borderRadius:10, whiteSpace:'nowrap' });

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
            <Card style={{ marginBottom:16, padding:'14px 16px' }}>
              <div style={{ display:'flex', gap:10, marginBottom:10 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:16, flexShrink:0 }}>{user.name.charAt(0)}</div>
                <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder={`Quoi de neuf, ${user.name.split(' ')[0]} ? Partagez une action, une info, une ressource...`} style={{ flex:1, border:`1.5px solid ${COLORS.gray200}`, borderRadius:12, padding:'10px 14px', fontSize:14, fontFamily:'Inter,sans-serif', resize:'none', outline:'none', minHeight:70, lineHeight:1.5 }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                <div style={{ display:'flex', gap:6 }}>
                  {[['📷','Photo'],['📅','Événement'],['📜','Pétition'],['₮','T99CP']].map(([icon,label])=>(
                    <button key={label} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:8, border:`1px solid ${COLORS.gray200}`, background:'transparent', cursor:'pointer', fontSize:12, fontWeight:500, color:COLORS.gray600, fontFamily:'Inter,sans-serif' }}>{icon} {label}</button>
                  ))}
                </div>
                <Btn variant="gradient" size="sm" onClick={handlePost} disabled={!newPost.trim()}>Publier</Btn>
              </div>
            </Card>
            {posts.map(p=><PostCard key={p.id} post={p} user={user} />)}
          </>}

          {/* Groupes */}
          {tab==='groupes' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
              {SAMPLE_GROUPS.map(g=>(
                <Card key={g.id} style={{ padding:'16px', cursor:'pointer' }} onClick={()=>alert(`Groupe : ${g.name}`)}>
                  <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:`${g.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{g.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, color:COLORS.gray900, marginBottom:3 }}>{g.name}</div>
                      <div style={{ fontSize:12, color:COLORS.gray500, marginBottom:8, lineHeight:1.4 }}>{g.desc}</div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:12, color:COLORS.gray400 }}>👥 {g.members.toLocaleString('fr-FR')} membres</span>
                        <Btn variant="outline" size="sm" onClick={e=>{e.stopPropagation();alert('Rejoint !');}}>Rejoindre</Btn>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Membres */}
          {tab==='membres' && <>
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un membre..." />
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {SAMPLE_MEMBERS.filter(m=>!search||m.name.toLowerCase().includes(search.toLowerCase())).map(m=>(
                <Card key={m.id} style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:18, flexShrink:0 }}>{m.name.charAt(0)}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:COLORS.gray900 }}>{m.name}</div>
                    <div style={{ fontSize:12, color:COLORS.gray500 }}>{m.role} · 📍 {m.location} · Membre depuis {m.joined}</div>
                    <div style={{ display:'flex', gap:4, marginTop:4, flexWrap:'wrap' }}>{m.badges.map(b=><Badge key={b} color="red" style={{ fontSize:10 }}>{b}</Badge>)}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <T99 value={m.t99cp} size={12} />
                    <div style={{ marginTop:4 }}><Btn variant="outline" size="sm">Message</Btn></div>
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
                ].map(item=>(
                  <Card key={item.label} style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }} onClick={()=>setActivePage(item.page)}>
                    <div style={{ fontSize:28 }}>{item.icon}</div>
                    <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:14, color:COLORS.gray900 }}>{item.label}</div><div style={{ fontSize:12, color:COLORS.gray500 }}>{item.desc}</div></div>
                    <span style={{ color:COLORS.gray300, fontSize:20 }}>›</span>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }} className="mn-reseau-sidebar">
          {/* User card */}
          <Card style={{ padding:'16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:GRAD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:18 }}>{user.name.charAt(0)}</div>
              <div><div style={{ fontWeight:700, fontSize:14, color:COLORS.gray900 }}>{user.name}</div><T99 value={user.t99cp_balance} size={12} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, textAlign:'center' }}>
              {[['8','Signatures'],['3','Groupes'],['5','Services']].map(([v,l])=>(
                <div key={l} style={{ background:COLORS.gray50, borderRadius:10, padding:'8px 4px' }}>
                  <div style={{ fontWeight:800, fontSize:16, color:COLORS.gray900 }}>{v}</div>
                  <div style={{ fontSize:10, color:COLORS.gray400 }}>{l}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Groupes suggérés */}
          <Card style={{ padding:'14px 16px' }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:13, color:COLORS.gray900, marginBottom:10 }}>Groupes suggérés</div>
            {SAMPLE_GROUPS.slice(0,3).map(g=>(
              <div key={g.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:`1px solid ${COLORS.gray100}` }}>
                <div style={{ fontSize:20 }}>{g.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:12, color:COLORS.gray900 }}>{g.name}</div>
                  <div style={{ fontSize:11, color:COLORS.gray400 }}>{g.members} membres</div>
                </div>
                <button style={{ border:`1px solid ${COLORS.gray200}`, background:'transparent', borderRadius:8, padding:'3px 8px', fontSize:11, cursor:'pointer', fontFamily:'Inter,sans-serif', fontWeight:600, color:COLORS.gray600 }}>+</button>
              </div>
            ))}
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
