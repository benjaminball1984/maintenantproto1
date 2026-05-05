// Pages_Media_Profile.jsx — Media v2, Mobilisations v2, Profile v2
const { useState, useEffect, useRef } = React;

// ── MEDIA v2 ──────────────────────────────────────────────
function MediaArticle({ a, onBack, adminMode, onSave }) {
  const [editOpen, setEditOpen] = useState(false);
  const [data, setData] = useState(a);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const el = document.querySelector('.mn-article-body');
    if (!el) return;
    const h = () => {
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight;
      const visible = window.scrollY - el.offsetTop + window.innerHeight;
      setScrollPct(Math.min(100, Math.round((visible / total) * 100)));
    };
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const related = AppData.media.filter(x => x.category === a.category && x.id !== a.id).slice(0, 3);

  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      {/* Reading progress */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: T.border, zIndex: 300 }}>
        <div style={{ height: '100%', width: `${scrollPct}%`, background: T.gradR, transition: 'width 0.1s' }}></div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: T.text2, fontSize: 14, fontWeight: 600, fontFamily: 'Inter,sans-serif', padding: '8px 0' }}>{ICONS.arrow_l} Média</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {adminMode && <AdminBtn onEdit={() => setEditOpen(true)} />}
            <Btn variant="surface" size="sm" icon={ICONS.share}>Partager</Btn>
          </div>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Tag variant="brand" style={{ marginBottom: 16 }}>{data.category}</Tag>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(24px,4vw,42px)', fontWeight: 800, color: T.text1, margin: '0 0 20px', letterSpacing: '-0.04em', lineHeight: 1.1 }}>{data.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, marginBottom: 28, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={data.author} size={40} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.text1 }}>{data.author}</div>
                <div style={{ fontSize: 12, color: T.text4 }}>Journaliste militant·e</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 13, color: T.text4, marginLeft: 'auto', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{ICONS.calendar} {new Date(data.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{ICONS.clock} {data.reading_time} min de lecture</span>
            </div>
          </div>
        </div>

        {/* Hero image */}
        <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 36, height: 400 }}>
          <img src={`https://picsum.photos/seed/article${a.id}hero/1200/600`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
        </div>

        {/* Article body */}
        <div className="mn-article-body">
          {/* Lead */}
          <p style={{ fontSize: 19, fontWeight: 500, color: T.text1, lineHeight: 1.7, margin: '0 0 28px', borderLeft: `4px solid ${T.brand}`, paddingLeft: 20 }}>{data.excerpt}</p>

          {/* Body paragraphs */}
          {[
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Face aux oppressions systémiques, nos luttes doivent devenir systémiques. La situation actuelle exige une réponse collective et immédiate de notre part.',
            'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Les chiffres parlent d\'eux-mêmes : en dix ans, la fortune des 100 plus riches a triplé tandis que les services publics s\'effondraient.',
            'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit. Une enquête approfondie révèle les mécanismes de capture du pouvoir politique par les intérêts privés. Les données que nous avons récoltées montrent une corrélation directe entre contributions aux campagnes et décisions législatives.',
          ].map((p, i) => (
            <p key={i} style={{ fontSize: 16, color: T.text2, lineHeight: 1.8, margin: '0 0 24px' }}>{p}</p>
          ))}

          {/* Pull quote */}
          <blockquote style={{ margin: '36px 0', padding: '24px 28px', background: T.brandLight, borderLeft: `5px solid ${T.brand}`, borderRadius: '0 16px 16px 0' }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: T.brand, lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>« Face aux oppressions systémiques, nos luttes doivent devenir systémiques. Ils ont des milliards, soyons des millions ! »</p>
            <footer style={{ fontSize: 13, color: T.text3, marginTop: 12, fontStyle: 'normal' }}>— THE99COINPROJECT</footer>
          </blockquote>

          {[
            'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam. La mobilisation citoyenne reste le seul levier efficace face au pouvoir économique concentré entre quelques mains.',
          ].map((p, i) => (
            <p key={i} style={{ fontSize: 16, color: T.text2, lineHeight: 1.8, margin: '0 0 24px' }}>{p}</p>
          ))}

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 24, borderTop: `1px solid ${T.border}`, marginTop: 12 }}>
            {(data.tags || ['militantisme', 'politique', 'société']).map(tag => (
              <Tag key={tag}>#{tag}</Tag>
            ))}
          </div>
        </div>

        {/* Author card */}
        <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, padding: '24px', marginTop: 40, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <Avatar name={data.author} size={56} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>À propos de l'auteur·e</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 17, color: T.text1, marginBottom: 8 }}>{data.author}</div>
            <p style={{ fontSize: 14, color: T.text3, margin: 0, lineHeight: 1.6 }}>Journaliste militant·e au sein de Maintenant! Média. Spécialiste des questions politiques, sociales et économiques. Engagé·e dans la lutte pour une information libre et indépendante.</p>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: T.text1, margin: '0 0 20px', letterSpacing: '-0.02em' }}>À lire aussi</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
              {related.map(ra => (
                <div key={ra.id} onClick={onBack} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ height: 120, overflow: 'hidden' }}><img src={`https://picsum.photos/seed/rel${ra.id}/400/240`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /></div>
                  <div style={{ padding: '12px 14px' }}>
                    <Tag variant="brand" size="xs" style={{ marginBottom: 6 }}>{ra.category}</Tag>
                    <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, color: T.text1, margin: '0 0 5px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ra.title}</h3>
                    <div style={{ fontSize: 11, color: T.text4, display: 'flex', gap: 4, alignItems: 'center' }}>{ICONS.clock} {ra.reading_time} min</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <EditModal open={editOpen} onClose={() => setEditOpen(false)} title="Article" data={data} onSave={f => { setData(d => ({ ...d, ...f })); onSave?.({ ...a, ...f }); }}
        fields={[{ key: 'title', label: 'Titre' }, { key: 'category', label: 'Catégorie', type: 'select', options: ['Enquête', 'Politique', 'Environnement', 'Justice', 'Économie', 'Portrait', 'Innovation', 'Culture', 'Logement'] }, { key: 'excerpt', label: 'Chapeau', type: 'textarea' }, { key: 'author', label: 'Auteur·e' }, { key: 'reading_time', label: 'Temps de lecture (min)', type: 'number' }]} />
    </div>
  );
}

// Métadonnées par format de contenu
const FORMAT_META = {
  article: { label:'Article',  icon:'📰', color:'#5B21B6' },
  video:   { label:'Vidéo',    icon:'▶',  color:'#DC2654' },
  podcast: { label:'Podcast',  icon:'🎙', color:'#7C3AED' },
  live:    { label:'Live',     icon:'●',  color:'#DC2626' },
  dessin:  { label:'Dessin',   icon:'✏',  color:'#EA580C' },
  breve:   { label:'Brève',    icon:'⚡', color:'#0891B2' },
};

const formatDuration = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

// Petit badge de format affiché sur les cards
function FormatBadge({ format, item }) {
  const meta = FORMAT_META[format] || FORMAT_META.article;
  if (format === 'live') return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', background:'#DC2626', color:'#fff', borderRadius:9999, fontSize:10, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', boxShadow:'0 2px 8px rgba(220,38,38,0.4)' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:'#fff', animation:'fadeUp 1s infinite alternate' }}></span>
      EN DIRECT · {item?.live_viewers?.toLocaleString('fr-FR') || 0}
    </span>
  );
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', background:`${meta.color}18`, color:meta.color, border:`1px solid ${meta.color}33`, borderRadius:9999, fontSize:10, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase' }}>
      <span>{meta.icon}</span> {meta.label}
    </span>
  );
}

// Card universelle pour tout type de contenu
function MediaCard({ item, onClick, adminMode, onEdit, size = 'md' }) {
  const meta = FORMAT_META[item.format || 'article'];
  const isCompact = size === 'sm' || item.format === 'breve';

  // Brève : layout texte uniquement
  if (item.format === 'breve') {
    return (
      <div onClick={onClick} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, borderLeft: `4px solid ${FORMAT_META.breve.color}`, padding: '16px 18px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
        {adminMode && <div style={{ position: 'absolute', top: 8, right: 8 }} onClick={e => { e.stopPropagation(); onEdit?.(item); }}><AdminBtn onEdit={() => onEdit?.(item)} /></div>}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <FormatBadge format="breve" />
          <span style={{ fontSize:11, color:T.text4, fontWeight:600 }}>{new Date(item.date).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}</span>
        </div>
        <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:T.text1, margin:'0 0 6px', lineHeight:1.35 }}>{item.title}</h3>
        <p style={{ fontSize:13, color:T.text3, margin:0, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.excerpt}</p>
      </div>
    );
  }

  return (
    <div onClick={onClick} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      {adminMode && <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }} onClick={e => { e.stopPropagation(); onEdit?.(item); }}><AdminBtn onEdit={() => onEdit?.(item)} /></div>}

      {/* Visual */}
      <div style={{ height: isCompact ? 150 : 200, overflow: 'hidden', position: 'relative', background: `${meta.color}10` }}>
        <img src={item.image || `https://picsum.photos/seed/m${item.id}/600/360`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.4),transparent 50%)' }}></div>

        {/* Format badge top-left */}
        <div style={{ position: 'absolute', top: 12, left: 12 }}><FormatBadge format={item.format || 'article'} item={item} /></div>

        {/* Play overlay pour video / podcast */}
        {(item.format === 'video' || item.format === 'podcast') && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:54, height:54, borderRadius:'50%', background:'rgba(255,255,255,0.95)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.3)', color:meta.color, fontSize:22, paddingLeft:item.format==='video'?4:0 }}>
              {item.format === 'video' ? '▶' : '🎙'}
            </div>
          </div>
        )}

        {/* Durée pour video / podcast */}
        {item.duration_sec && (
          <span style={{ position:'absolute', bottom:12, right:12, padding:'3px 8px', background:'rgba(0,0,0,0.75)', color:'#fff', fontSize:11, fontWeight:700, borderRadius:6, fontVariantNumeric:'tabular-nums' }}>
            {formatDuration(item.duration_sec)}
          </span>
        )}
      </div>

      <div style={{ padding: '14px 18px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>{item.category}</div>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: T.text1, margin: '0 0 8px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h3>
        {!isCompact && item.excerpt && <p style={{ fontSize: 12.5, color: T.text3, margin: '0 0 10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.excerpt}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.text4 }}>
          <Avatar name={item.author} size={20} />
          <span>{item.author}</span>
          {item.reading_time && <><span>·</span><span style={{ display:'flex', alignItems:'center', gap:3 }}>{ICONS.clock} {item.reading_time} min</span></>}
        </div>
      </div>
    </div>
  );
}

function MediaPage({ adminMode, onAuth }) {
  const [data, setData] = useState(AppData.media);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [format, setFormat] = useState('Tous');
  const [editItem, setEditItem] = useState(null);
  const [tipOpen, setTipOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(() => { try { return localStorage.getItem('mn_newsletter_sub') === '1'; } catch { return false; } });

  const formats = ['Tous', 'Articles', 'Vidéos', 'Podcasts', 'Lives', 'Dessins', 'Brèves'];
  const formatMap = { 'Articles':'article', 'Vidéos':'video', 'Podcasts':'podcast', 'Lives':'live', 'Dessins':'dessin', 'Brèves':'breve' };

  const filtered = data.filter(a => {
    const fok = format === 'Tous' || a.format === formatMap[format];
    const sok = !search || a.title.toLowerCase().includes(search.toLowerCase()) || (a.author||'').toLowerCase().includes(search.toLowerCase()) || (a.category||'').toLowerCase().includes(search.toLowerCase());
    return fok && sok;
  });

  const lives    = filtered.filter(a => a.format === 'live');
  const featured = filtered.filter(a => a.featured && a.format !== 'live');
  const breves   = filtered.filter(a => a.format === 'breve');
  const others   = filtered.filter(a => !a.featured && a.format !== 'live' && a.format !== 'breve');

  const handleSubscribe = () => {
    if (!newsletterEmail.trim() || !/.+@.+\..+/.test(newsletterEmail)) {
      window.showToast?.('Adresse email invalide', { type:'error' });
      return;
    }
    try { localStorage.setItem('mn_newsletter_sub', '1'); localStorage.setItem('mn_newsletter_email', newsletterEmail); } catch {}
    setSubscribed(true);
    window.showToast?.(`Inscrit·e à la newsletter hebdomadaire !`, { type:'success', icon:'📬' });
  };

  if (detail) return <MediaArticle a={detail} onBack={() => setDetail(null)} adminMode={adminMode} onSave={u => setData(d => d.map(a => a.id === u.id ? u : a))} />;

  return (
    <PageContainer maxWidth={1200}>
      {/* Hero éditorial */}
      <div style={{ borderBottom: `2px solid ${T.text1}`, paddingBottom: 18, marginBottom: 28, display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:14, flexWrap:'wrap' }} className="mn-section-title">
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>━━ Le média militant</div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(28px,4.5vw,40px)', fontWeight: 800, color: T.text1, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            Maintenant ! <span style={{ color: T.brand }}>Média</span>
          </h1>
          <p style={{ fontSize: 14, color: T.text3, margin: '8px 0 0', lineHeight: 1.55, maxWidth: 560 }}>
            Articles, vidéos, podcasts, lives, dessins de presse. Journalisme militant indépendant, gratuit, financé par les adhérent·es.
          </p>
        </div>
        {adminMode && <Btn variant="success" size="sm" icon={ICONS.plus}>Nouveau contenu</Btn>}
      </div>

      {/* Search + format chips */}
      <div style={{ marginBottom: 14 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un article, un·e journaliste, un sujet..." />
      </div>
      <div data-mn-chips style={{ display: 'flex', gap: 8, marginBottom: 30, overflowX:'auto', paddingBottom:4 }}>
        {formats.map(f => (
          <button key={f} onClick={() => setFormat(f)}
            style={{
              padding: '8px 16px', borderRadius: 9999,
              border: format === f ? `1.5px solid ${T.brand}` : `1.5px solid ${T.border}`,
              background: format === f ? T.brand : T.surface,
              color: format === f ? '#fff' : T.text2,
              fontSize: 13, fontWeight: 600, fontFamily: 'Inter,sans-serif', cursor: 'pointer',
              whiteSpace: 'nowrap', flexShrink: 0,
              boxShadow: format === f ? `0 4px 12px ${T.brand}40` : 'none',
              transition: 'all 0.18s',
            }}>{f}</button>
        ))}
      </div>

      {/* LIVES — bandeau rouge en haut si présent */}
      {lives.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#DC2626', boxShadow:'0 0 0 4px rgba(220,38,38,0.2)' }}></span>
            En direct maintenant
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
            {lives.map(a => <MediaCard key={a.id} item={a} onClick={() => setDetail(a)} adminMode={adminMode} onEdit={setEditItem} />)}
          </div>
        </div>
      )}

      {/* FEATURED — gros bloc en avant */}
      {featured.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>━ À la une</div>
          {featured.slice(0, 1).map(a => (
            <div key={a.id} onClick={() => setDetail(a)} className="mn-media-featured" style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, overflow: 'hidden', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 0, transition: 'all 0.22s', position: 'relative', marginBottom: 16 }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              {adminMode && <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 3 }} onClick={e => { e.stopPropagation(); setEditItem(a); }}><AdminBtn onEdit={() => setEditItem(a)} /></div>}
              <div style={{ position: 'relative', overflow: 'hidden', minHeight: 320, background: `${(FORMAT_META[a.format] || FORMAT_META.article).color}15` }}>
                <img src={a.image || `https://picsum.photos/seed/feat${a.id}/800/600`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                <div style={{ position: 'absolute', top: 16, left: 16 }}><FormatBadge format={a.format || 'article'} item={a} /></div>
              </div>
              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{a.category}</div>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(18px,2.4vw,26px)', fontWeight: 800, color: T.text1, margin: '0 0 14px', lineHeight: 1.25, letterSpacing: '-0.025em' }}>{a.title}</h2>
                <p style={{ fontSize: 14, color: T.text3, lineHeight: 1.65, margin: '0 0 20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={a.author} size={32} />
                  <div style={{ fontSize: 13, color: T.text3 }}>
                    <strong style={{ color: T.text1 }}>{a.author}</strong>
                    {a.reading_time && <> · {a.reading_time} min de lecture</>}
                    {a.duration_sec && <> · {formatDuration(a.duration_sec)}</>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {featured.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {featured.slice(1).map(a => <MediaCard key={a.id} item={a} onClick={() => setDetail(a)} adminMode={adminMode} onEdit={setEditItem} />)}
            </div>
          )}
        </div>
      )}

      {/* NEWSLETTER hebdo — entre les featured et le reste */}
      <div style={{ background: 'linear-gradient(135deg, #FDE9F2 0%, #F3EBFE 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 32, border: `1.5px solid ${T.brandLight}`, display:'grid', gridTemplateColumns:'1fr auto', gap:20, alignItems:'center' }} className="mn-newsletter-block">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <span style={{ fontSize: 24 }}>📬</span>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, color:T.brand, letterSpacing:'0.04em', textTransform:'uppercase' }}>Newsletter hebdomadaire</span>
          </div>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(18px,2.5vw,22px)', fontWeight:800, color:T.text1, margin:'0 0 8px', letterSpacing:'-0.02em', lineHeight:1.2 }}>
            Notre semaine, dans ta boîte mail tous les vendredis.
          </h3>
          <p style={{ fontSize:13.5, color:T.text2, margin:0, lineHeight:1.55, maxWidth: 540 }}>
            Une sélection de nos articles, vidéos, podcasts et brèves, sans pub ni traceur. Désabonnement en 1 clic.
          </p>
        </div>
        {!subscribed ? (
          <div className="mn-btn-row" style={{ display:'flex', gap:8, alignItems:'stretch' }}>
            <input
              type="email" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)}
              placeholder="ton@email.fr"
              onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
              style={{ height:48, minWidth:240, border:`1.5px solid ${T.border}`, borderRadius:12, padding:'0 16px', fontSize:14, fontFamily:'Inter,sans-serif', color:T.text1, background:'#fff', outline:'none' }}
              onFocus={e => e.target.style.borderColor = T.brand} onBlur={e => e.target.style.borderColor = T.border}
            />
            <Btn variant="gradient" size="lg" onClick={handleSubscribe}>S'inscrire</Btn>
          </div>
        ) : (
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 16px', background:T.successLight, border:`1px solid ${T.success}`, borderRadius:12, color:T.success, fontWeight:700, fontSize:13 }}>
            ✓ Inscrit·e
          </div>
        )}
      </div>

      {/* GRILLE PRINCIPALE — tous les autres contenus */}
      {others.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>━ {format === 'Tous' ? 'Tous nos contenus' : format}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {others.map(a => <MediaCard key={a.id} item={a} onClick={() => setDetail(a)} adminMode={adminMode} onEdit={setEditItem} />)}
          </div>
        </div>
      )}

      {/* BRÈVES — colonne dédiée si présentes */}
      {breves.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: FORMAT_META.breve.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>━ Brèves de la semaine</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
            {breves.map(a => <MediaCard key={a.id} item={a} onClick={() => setDetail(a)} adminMode={adminMode} onEdit={setEditItem} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && <EmptyState title="Aucun contenu trouvé" desc="Essayez d'autres filtres ou termes de recherche." />}

      {/* SOUTENIR — tip jar T99CP / euros */}
      <div style={{ background: T.text1, borderRadius: 24, padding: '36px 36px', marginTop: 40, position:'relative', overflow:'hidden', color:'#fff' }} className="mn-wallet-card">
        <div style={{ position:'absolute', top:-100, right:-100, width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle, rgba(225,29,116,0.25) 0%, transparent 70%)', filter:'blur(8px)' }}></div>
        <div style={{ position:'absolute', bottom:-80, left:-80, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', filter:'blur(8px)' }}></div>
        <div style={{ position:'relative', display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center' }}>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 12px', background:'rgba(255,255,255,0.10)', borderRadius:9999, fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:14 }}>
              <span>♥</span> Soutenir le média
            </div>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(20px,3vw,28px)', fontWeight:800, margin:'0 0 10px', letterSpacing:'-0.02em', lineHeight:1.2 }}>
              Notre indépendance dépend de toi.
            </h3>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', margin:'0 0 20px', lineHeight:1.6, maxWidth:540 }}>
              Sans pub, sans actionnaire, sans subvention publique. 100 % financé par les dons des lectrices et lecteurs. Paiement en T99CP avec alternative en euros.
            </p>
          </div>
          <Btn variant="white" size="lg" onClick={() => setTipOpen(true)} icon={ICONS.wallet}>Faire un don</Btn>
        </div>
      </div>

      <PayModal open={tipOpen} onClose={() => setTipOpen(false)} amount={10} item="Don à Maintenant ! Média" description="Soutien au journalisme militant indépendant. Paiement en T99CP ou en euros, sans intermédiaire." seller="Maintenant ! Média" />

      {editItem && <EditModal open onClose={() => setEditItem(null)} title="Contenu média" data={editItem} onSave={f => { setData(d => d.map(a => a.id === editItem.id ? { ...a, ...f } : a)); setEditItem(null); }} fields={[{ key: 'title', label: 'Titre' }, { key: 'category', label: 'Catégorie' }, { key: 'format', label: 'Format', type: 'select', options: ['article','video','podcast','live','dessin','breve'] }, { key: 'excerpt', label: 'Chapeau', type: 'textarea' }, { key: 'author', label: 'Auteur·rice' }, { key: 'image', label: 'URL photo' }]} />}
    </PageContainer>
  );
}
window.MediaPage = MediaPage;

// ── MOBILISATIONS v2 ───────────────────────────────────────
// ── MOBILISATIONS v2 ──────────────────────────────────────
const MOB_TYPE_COLOR = { 'Manifestation': T.brand, 'Assemblée': T.info, 'Grève': '#7C3AED', 'Veillée': T.warning, 'Rassemblement': T.success, 'Festival': T.accent, 'Forum': T.info, 'Action directe': '#DC2654', 'Camp': T.success };
const MOB_TYPES = ['Manifestation', 'Assemblée', 'Grève', 'Veillée', 'Rassemblement', 'Festival', 'Forum', 'Action directe', 'Camp'];
const MOB_FIELDS = [
  { key: 'title', label: 'Titre' },
  { key: 'type', label: 'Type', type: 'select', options: MOB_TYPES },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'time', label: 'Heure' },
  { key: 'location', label: 'Lieu' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'organizer', label: 'Organisateur·rice' },
  { key: 'image', label: 'URL de la photo' },
  { key: 'participants', label: 'Participants', type: 'number' },
];
const MOB_SORTS = [
  { id: 'date_close',   label: 'Date la plus proche' },
  { id: 'date_far',     label: 'Date la plus lointaine' },
  { id: 'participants', label: 'Plus de participants' },
  { id: 'relevance',    label: '✨ Plus pertinentes' },
];
const isMobPast = (m) => new Date(`${m.date}T${m.time || '23:59'}:00`) < new Date();

function MobilizationCard({ m, onClick, adminMode, onEdit }) {
  const d = new Date(m.date);
  const color = MOB_TYPE_COLOR[m.type] || T.brand;
  const past = isMobPast(m);
  return (
    <a href={`#mobs/${m.id}`} onClick={e => { e.preventDefault(); onClick?.(); }} className="mn-card-hover"
      aria-label={`${m.title} — ${m.type} le ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`}
      style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, display: 'flex', overflow: 'hidden', position: 'relative', textDecoration: 'none', color: 'inherit', opacity: past ? 0.78 : 1 }}>
      {adminMode && <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }} onClick={e => { e.stopPropagation(); e.preventDefault(); onEdit(); }}><AdminBtn onEdit={onEdit} /></div>}
      {m._userCreated && <div style={{ position: 'absolute', top: 10, left: 80, zIndex: 2 }}><window.UserBadge /></div>}
      <div style={{ width: 72, background: color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '14px 0' }}>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.toLocaleDateString('fr-FR', { month: 'short' })}</div>
        <div style={{ color: '#fff', fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 28, lineHeight: 1 }}>{d.getDate()}</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{d.getFullYear()}</div>
      </div>
      <div className="mn-mob-card-img" style={{ width: 130, flexShrink: 0, background: T.text1, position: 'relative', overflow: 'hidden' }}>
        {m.image && <img src={m.image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: past ? 0.7 : 0.92 }} onError={e => { e.target.style.display = 'none'; }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent 70%)' }}></div>
      </div>
      <div style={{ padding: '16px 20px', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Tag size="xs" style={{ background: `${color}18`, color, border: 'none' }}>{m.type}</Tag>
          {past && <Tag size="xs" variant="warning">Passée</Tag>}
          <span style={{ fontSize: 12, color: T.text4, display: 'flex', alignItems: 'center', gap: 3 }}>{ICONS.clock} {m.time}</span>
        </div>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: T.text1, margin: '0 0 5px', lineHeight: 1.3 }}>{m.title}</h3>
        <p style={{ fontSize: 13, color: T.text3, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{m.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: T.text4, display: 'flex', alignItems: 'center', gap: 4 }}>{ICONS.pin} {m.location}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text3 }}>{ICONS.users} {m.participants.toLocaleString('fr-FR')}</span>
        </div>
      </div>
    </a>
  );
}

function MobilizationDetail({ m, onBack, user, adminMode, onAuth, onSave, onSelectMob }) {
  const [data, setData] = useState(m);
  const [joined, setJoined] = useState(() => {
    if (window.isUserJoined?.('mobilizations', m.id)) return true;
    try { if (localStorage.getItem(`mn_join_anon_mob_${m.id}`)) return true; } catch (e) {}
    return false;
  });
  const [editOpen, setEditOpen] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [partAnonOpen, setPartAnonOpen] = useState(false);
  const [supportAmount, setSupportAmount] = useState(10);

  const past = isMobPast(data);
  const color = MOB_TYPE_COLOR[data.type] || T.brand;
  const permalink = (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '') + '#mobs/' + data.id;
  const cityOf = (loc) => (loc || '').split('—')[0].trim();
  const similar = (window.AppData?.mobilizations || [])
    .filter(o => o.id !== data.id && (o.type === data.type || cityOf(o.location) === cityOf(data.location)))
    .slice(0, 3);

  const handleJoinClick = () => {
    if (joined) {
      if (user) {
        window.toggleUserJoin?.('mobilizations', data.id);
        setJoined(false);
        setData(d => ({ ...d, participants: Math.max(0, d.participants - 1) }));
        window.showToast?.(`Désinscrit·e de : ${data.title}`, { type: 'info', icon: '←' });
      }
      return;
    }
    if (user) {
      window.toggleUserJoin?.('mobilizations', data.id);
      setJoined(true);
      setData(d => ({ ...d, participants: d.participants + 1 }));
      window.showToast?.(`Inscrit·e à : ${data.title}`, { type: 'success', icon: '✊' });
    } else {
      setPartAnonOpen(true);
    }
  };

  const handleAnonJoin = (formData) => {
    try { localStorage.setItem(`mn_join_anon_mob_${data.id}`, JSON.stringify({ email: formData.email, joined_at: formData.joined_at })); } catch (e) {}
    setJoined(true);
    setData(d => ({ ...d, participants: d.participants + 1 }));
    window.showToast?.('Participation confirmée — un email de rappel te sera envoyé.', { type: 'success', icon: '✊', duration: 5000 });
  };

  const contactOrganizer = () => {
    if (!user) { onAuth(); return; }
    window.showToast?.(`Message envoyé à ${data.organizer} — réponse par messagerie`, { type: 'success', icon: '✉️', duration: 4000 });
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={onBack} aria-label="Retour à la liste des mobilisations" style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: T.text2, fontSize: 14, fontWeight: 600, fontFamily: 'Inter,sans-serif', padding: '8px 0' }}>{ICONS.arrow_l} Mobilisations</button>
          {adminMode && <AdminBtn onEdit={() => setEditOpen(true)} />}
        </div>

        <div style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.07)' }}>
          {/* Hero */}
          <div style={{ position: 'relative', height: 280, overflow: 'hidden', background: T.text1 }}>
            {data.image && <img src={data.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />}
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${color}D9, ${color}99 60%, transparent)` }}></div>
            <div style={{ position: 'absolute', inset: 0, padding: '32px 32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: '#fff' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 8, letterSpacing: '0.04em' }}>{data.type}</span>
                {past && <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: 8, letterSpacing: '0.04em' }}>PASSÉE</span>}
              </div>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(20px,3.5vw,32px)', fontWeight: 800, margin: '0 0 14px', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{data.title}</h1>
              <div style={{ display: 'flex', gap: 20, fontSize: 14, opacity: 0.95, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{ICONS.calendar} {new Date(data.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{ICONS.clock} {data.time}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{ICONS.pin} {data.location}</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
              {[['Organisateur·rice', data.organizer], ['Participants', data.participants.toLocaleString('fr-FR')], ['Heure', data.time]].map(([l, v]) => (
                <div key={l} style={{ background: T.surface2, borderRadius: 14, padding: '14px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{l}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.text1, lineHeight: 1.3 }}>{v}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.75, marginBottom: data.context ? 16 : 24 }}>{data.description}</p>
            {data.context && (
              <p style={{ fontSize: 14.5, color: T.text2, lineHeight: 1.7, margin: '0 0 20px' }}>{data.context}</p>
            )}
            {data.quote && (
              <div style={{ margin: '24px 0', padding: '16px 20px', background: T.brandLight, borderLeft: `4px solid ${T.brand}`, borderRadius: '0 12px 12px 0' }}>
                <p style={{ fontSize: 14, color: T.brand, fontWeight: 600, lineHeight: 1.6, margin: 0 }}>« {data.quote} »</p>
              </div>
            )}

            {/* CTA Participer (1-clic si user, sinon ParticipateAnonymousModal) */}
            <Btn full variant={joined ? 'success' : 'gradient'} size="lg" onClick={handleJoinClick} icon={joined ? ICONS.check : null} disabled={past && !joined}>
              {past && !joined ? 'Mobilisation passée' : joined ? '✓ Inscrit·e — cliquer pour annuler' : 'Participer à cette mobilisation'}
            </Btn>

            {/* Boutons secondaires */}
            <div className="mn-btn-row" style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <Btn full variant="outline" size="md" onClick={contactOrganizer} icon={ICONS.chat}>Contacter l'organisateur·rice</Btn>
              <Btn full variant="outline" size="md" onClick={() => window.exportICS?.(data)} icon={ICONS.calendar}>Ajouter à mon agenda</Btn>
              <Btn full variant="ghost" size="md" onClick={() => setShareOpen(true)} icon={ICONS.share}>Partager</Btn>
            </div>

            {/* Bloc Contribuer — conditionnel sur data.support_enabled */}
            {data.support_enabled && (
              <div style={{ marginTop: 18, padding: '18px 20px', borderRadius: 14, background: T.surface2, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text2, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contribuer en T99CP</div>
                <p style={{ fontSize: 12.5, color: T.text3, margin: '0 0 12px', lineHeight: 1.55 }}>
                  L'organisateur·rice a activé les contributions pour couvrir les frais (logistique, transports, matériel). Paiement T99CP avec alternative euros.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
                  {[5, 10, 20, 50].map(a => (
                    <button key={a} onClick={() => setSupportAmount(a)} style={{ padding: '8px 0', borderRadius: 10, border: `1.5px solid ${supportAmount === a ? T.brand : T.border}`, background: supportAmount === a ? T.brandLight : T.surface, color: supportAmount === a ? T.brand : T.text2, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}>{a}</button>
                  ))}
                </div>
                <Btn full variant="outline" size="md" icon={ICONS.wallet} onClick={() => setFundOpen(true)}>Contribuer aux frais d'organisation</Btn>
              </div>
            )}
          </div>
        </div>

        {/* Mobs similaires */}
        {similar.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>D'autres mobilisations qui pourraient t'intéresser</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {similar.map(o => <MobilizationCard key={o.id} m={o} onClick={() => onSelectMob?.(o)} />)}
            </div>
          </div>
        )}
      </div>

      {/* FAB mobile */}
      {!joined && !past && (
        <div className="mn-detail-fab">
          <Btn full variant="gradient" size="lg" onClick={handleJoinClick}>Participer à cette mobilisation</Btn>
        </div>
      )}

      <PayModal open={fundOpen} onClose={() => setFundOpen(false)} amount={supportAmount} item={`Contribution à : ${data.title}`} description={`Don à ${data.organizer} pour couvrir les frais de l'événement.`} seller={data.organizer} />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} title={data.title} url={permalink} text={`${data.title} — Maintenant !`} />
      <ParticipateAnonymousModal open={partAnonOpen} onClose={() => setPartAnonOpen(false)} onParticipate={handleAnonJoin} mobTitle={data.title} mobDate={data.date} />
      {editOpen && <EditModal open onClose={() => setEditOpen(false)} title="Mobilisation" data={data} onSave={f => { const upd = { ...data, ...f }; setData(upd); onSave?.(upd); setEditOpen(false); }} fields={MOB_FIELDS} />}
    </div>
  );
}

function MobilizationsPage({ user, adminMode, onAuth, setPage }) {
  const [data, setData] = useState([...window.getUserCreations('mobilizations'), ...AppData.mobilizations]);
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState('Toutes');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date_close');
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const present = new Set(data.map(m => m.type));
  const types = ['Toutes', ...MOB_TYPES.filter(t => present.has(t))];

  const q = search.trim().toLowerCase();
  const filtered = data.filter(m => {
    const ms = !q || [m.title, m.description, m.location, m.organizer, ...(m.tags || [])]
      .some(s => typeof s === 'string' && s.toLowerCase().includes(q));
    const mt = filter === 'Toutes' || m.type === filter;
    return ms && mt;
  });

  const sorters = {
    date_close:   (a, b) => new Date(a.date) - new Date(b.date),
    date_far:     (a, b) => new Date(b.date) - new Date(a.date),
    participants: (a, b) => b.participants - a.participants,
    relevance:    (a, b) => (isMobPast(a) ? 1 : 0) - (isMobPast(b) ? 1 : 0) || new Date(a.date) - new Date(b.date),
  };
  const sorted = [...filtered].sort(sorters[sort] || sorters.date_close);

  if (detail) return (
    <MobilizationDetail
      m={detail}
      onBack={() => setDetail(null)}
      user={user}
      adminMode={adminMode}
      onAuth={onAuth}
      onSave={u => { setData(d => d.map(x => x.id === u.id ? u : x)); setDetail(u); }}
      onSelectMob={mob => setDetail(mob)}
    />
  );

  return (
    <PageContainer>
      <SectionTitle label="Agenda militant" title="Mobilisations & Événements" action={
        <Btn variant="gradient" size="sm" icon={ICONS.plus} onClick={() => user ? setCreateOpen(true) : onAuth()}>Créer un événement</Btn>
      } />
      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} title="Créer un événement / une mobilisation"
        subtitle="Annonce ta marche, ton AG, ton festival, ton camp militant. Tu peux ajouter ta propre photo et activer les contributions financières."
        domain="mobilizations" color={T.brand}
        defaultPhoto="https://images.unsplash.com/photo-1591848478625-de43268e6fb8?w=1200&q=80"
        fields={[
          { id:'title',           label:'Titre de la mobilisation', required:true, placeholder:"Marche pour le climat — Paris" },
          { id:'type',            label:'Type d\'événement', type:'select', required:true, options: MOB_TYPES },
          { id:'date',            label:'Date', type:'date', required:true },
          { id:'time',            label:'Heure de rendez-vous', required:true, placeholder:"14:30" },
          { id:'location',        label:'Lieu', required:true, placeholder:"Place de la République, Paris 11e" },
          { id:'organizer',       label:'Organisateur·rice (collectif, syndicat, asso…)', required:true, placeholder:"Alternatiba Paris" },
          { id:'description',    label:'Présentation de la mobilisation', type:'textarea', rows:4, required:true, placeholder:"Pourquoi cette mobilisation ? Programme ? Mots d'ordre ?" },
          { id:'image',          label:'URL de la photo / visuel (optionnel)', type:'photo', hint:'Lien vers une image — sinon une photo générique sera utilisée.' },
          { id:'support_enabled', label:'Activer les contributions financières (optionnel)', type:'select', options:['Non','Oui'], hint:'Permet aux participant·es de contribuer en T99CP aux frais d\'organisation.' },
        ]}
        onSubmit={item => { const enriched = { ...item, participants: 1, _userCreated: true, support_enabled: item.support_enabled === 'Oui' }; setData(d => [enriched, ...d]); }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12, marginBottom: 8 }} className="mn-detail-grid">
        <SearchInput value={search} onChange={setSearch} placeholder="Titre, lieu, organisateur·rice, #tag..." />
        <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Trier les mobilisations"
          style={{ height: 48, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: '0 14px', fontSize: 14, fontFamily: 'Inter,sans-serif', color: T.text1, background: T.bg, outline: 'none', cursor: 'pointer', fontWeight: 600 }}>
          {MOB_SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
      <FilterTabs options={types} active={filter} onChange={setFilter} />

      <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
        {filter === 'Toutes' ? 'Toutes les mobilisations' : filter} · {sorted.length} résultat{sorted.length !== 1 ? 's' : ''}
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="Aucune mobilisation trouvée" desc="Essayez d'autres filtres ou créez la vôtre." action={<Btn variant="gradient" onClick={() => user ? setCreateOpen(true) : onAuth()} icon={ICONS.plus}>Créer un événement</Btn>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sorted.map(m => <MobilizationCard key={m.id} m={m} onClick={() => setDetail(m)} adminMode={adminMode} onEdit={() => setEditItem(m)} />)}
        </div>
      )}

      {editItem && !detail && <EditModal open onClose={() => setEditItem(null)} title="Mobilisation" data={editItem} onSave={f => { setData(d => d.map(m => m.id === editItem.id ? { ...m, ...f } : m)); setEditItem(null); }} fields={MOB_FIELDS} />}
    </PageContainer>
  );
}
window.MobilizationsPage = MobilizationsPage;

// ── PROFILE v2 ────────────────────────────────────────────
function ProfilePage({ user, setUser, onAuth, setPage }) {
  const [tab, setTab] = useState('activity');
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState(user || AppData.defaultUser);
  const [settingDetail, setSettingDetail] = useState(null);

  if (!user) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', background: T.bg }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: T.text4 }}>{ICONS.user}</div>
      <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, color: T.text1, margin: '0 0 10px' }}>Votre profil militant</h2>
      <p style={{ color: T.text3, fontSize: 15, maxWidth: 360, lineHeight: 1.6, margin: '0 0 28px' }}>Créez votre profil pour accéder à tous les services solidaires de Maintenant!</p>
      <Btn variant="gradient" size="lg" onClick={onAuth}>Se connecter · Créer un compte</Btn>
    </div>
  );

  // ── Activité dérivée depuis localStorage ──────────────────
  const buildActivities = () => {
    const acts = [];
    const formatTime = (ts) => {
      const diff = Date.now() - ts;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor(diff / 60000);
      if (d > 7) return `il y a ${Math.floor(d/7)} sem.`;
      if (d > 0) return `il y a ${d} jour${d>1?'s':''}`;
      if (h > 0) return `il y a ${h}h`;
      if (m > 0) return `il y a ${m} min`;
      return "à l'instant";
    };
    // Créations utilisateur (par domaine)
    const domains = [
      { key:'housing',       label:'Hébergement',     icon:ICONS.home,     color:T.hub.housing,      titleField:'title' },
      { key:'marketplace',   label:'Article marketplace', icon:ICONS.grid, color:T.hub.marketplace,  titleField:'title' },
      { key:'sel',           label:'Service SEL',     icon:ICONS.users,    color:T.hub.sel,          titleField:'service' },
      { key:'crowdfunding',  label:'Cagnotte',        icon:ICONS.wallet,   color:T.hub.crowdfunding, titleField:'title' },
      { key:'garden',        label:'Surplus jardin',  icon:ICONS.heart,    color:T.hub.garden,       titleField:'item' },
      { key:'lending',       label:'Objet à prêter',  icon:ICONS.share,    color:'#A21CAF',          titleField:'name' },
      { key:'carpool_offers',label:'Trajet covoit',   icon:ICONS.car,      color:T.hub.carpooling,   titleField:'from' },
      { key:'polls',         label:'Sondage',         icon:ICONS.trending, color:T.brand,            titleField:'title' },
      { key:'federations',   label:'Fédération',      icon:ICONS.sparkle,  color:T.brand,            titleField:'name' },
    ];
    domains.forEach(d => {
      (window.getUserCreations?.(d.key) || []).forEach(item => {
        const tt = item[d.titleField] || item.title || 'Création';
        acts.push({ icon:d.icon, color:d.color, time:formatTime(item._createdAt || Date.now()), ts:item._createdAt||0, text:`Tu as publié : ${d.label} — « ${tt} »` });
      });
    });
    // Joins
    const joinedMobs = window.getUserJoined?.('mobilizations') || [];
    const allMobs = window.AppData?.mobilizations || [];
    joinedMobs.forEach(id => {
      const m = allMobs.find(x => x.id === id);
      if (m) acts.push({ icon:ICONS.calendar, color:'#7C3AED', time:'récemment', ts:Date.now()-1000, text:`Inscrit·e à : ${m.title}` });
    });
    const joinedGroups = window.getUserJoined?.('groups') || [];
    joinedGroups.forEach(id => {
      acts.push({ icon:ICONS.users, color:T.hub.network, time:'récemment', ts:Date.now()-2000, text:`Tu as rejoint un groupe du réseau` });
    });
    // Votes sondages
    try {
      const votes = JSON.parse(localStorage.getItem('mn_poll_votes') || '{}');
      Object.keys(votes).forEach(pollId => {
        const poll = (window.AppData?.polls || []).find(p => p.id === +pollId);
        if (poll) acts.push({ icon:ICONS.check, color:T.brand, time:'récemment', ts:Date.now()-3000, text:`Tu as voté au sondage : « ${poll.title} »` });
      });
    } catch {}
    // Tri par récence (descend)
    acts.sort((a,b) => b.ts - a.ts);
    return acts;
  };

  const realActivities = buildActivities();
  const fallbackActivities = [
    { icon: ICONS.trending, text: 'Bienvenue sur Maintenant !', time: 'à l\'instant', color: T.brand },
    { icon: ICONS.sparkle, text: 'Crée ta première contribution depuis n\'importe quel service !', time: '', color: T.accent },
  ];
  const activities = realActivities.length > 0 ? realActivities : fallbackActivities;

  // ── Compteurs par service pour l'onglet "Mes services" ───
  const buildServiceStats = () => {
    return [
      { label:'Hébergement',     page:'housing',      created:(window.getUserCreations?.('housing')||[]).length,        joins:0, color:T.hub.housing },
      { label:'Marketplace',     page:'marketplace',  created:(window.getUserCreations?.('marketplace')||[]).length,    joins:0, color:T.hub.marketplace },
      { label:'Services SEL',    page:'sel',          created:(window.getUserCreations?.('sel')||[]).length,            joins:0, color:T.hub.sel },
      { label:'Cagnottes',       page:'crowdfunding', created:(window.getUserCreations?.('crowdfunding')||[]).length,   joins:0, color:T.hub.crowdfunding },
      { label:'Surplus jardin',  page:'garden',       created:(window.getUserCreations?.('garden')||[]).length,         joins:0, color:T.hub.garden },
      { label:'Ki Prête Tout',   page:'lending',      created:(window.getUserCreations?.('lending')||[]).length,        joins:0, color:'#A21CAF' },
      { label:'Covoiturage',     page:'carpooling',   created:(window.getUserCreations?.('carpool_offers')||[]).length+(window.getUserCreations?.('carpool_requests')||[]).length, joins:0, color:T.hub.carpooling },
      { label:'Sondages',        page:'polls',        created:(window.getUserCreations?.('polls')||[]).length,          joins:Object.keys((()=>{ try{return JSON.parse(localStorage.getItem('mn_poll_votes')||'{}');}catch{return {};} })()).length, color:T.brand, joinLabel:'votes' },
      { label:'Mobilisations',   page:'mobilizations',created:0,                                                         joins:(window.getUserJoined?.('mobilizations')||[]).length, color:'#7C3AED', joinLabel:'inscriptions' },
      { label:'Pétitions',       page:'petitions',    created:0,                                                         joins:profile.petitions_signed||0, color:T.brand, joinLabel:'signatures' },
      { label:'Réseau',          page:'reseau',       created:0,                                                         joins:(window.getUserJoined?.('groups')||[]).length, color:T.hub.network, joinLabel:'groupes' },
      { label:'Communes Libres', page:'communes',     created:(window.getUserCreations?.('federations')||[]).length,    joins:0, color:T.hub.communes, createLabel:'fédérations' },
    ];
  };
  const serviceStats = buildServiceStats();

  // Bouton Partager
  const handleShareProfile = () => {
    const url = `${location.origin}${location.pathname}#profile/${encodeURIComponent(profile.name||'me')}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => window.showToast?.('Lien du profil copié dans le presse-papiers', { type:'success', icon:'🔗' }));
    else window.showToast?.('Lien : ' + url, { type:'info' });
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      {/* Cover */}
      <div className="mn-profile-cover" style={{ height: 180, background: T.gradR, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src={`https://picsum.photos/seed/cover${user.name?.length || 5}/1200/400`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} onError={e => e.target.style.display = 'none'} />
        </div>
        <div style={{ position: 'absolute', top: 16, right: 20, display: 'flex', gap: 8 }}>
          <Btn variant="white" size="sm" onClick={() => setEditOpen(true)} icon={ICONS.edit}>Modifier le profil</Btn>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 100px' }}>
        {/* Profile header */}
        <div className="mn-profile-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, marginTop: -32, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: T.gradR, border: `4px solid ${T.surface}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 30, boxShadow: '0 8px 24px rgba(225,29,116,0.3)', flexShrink: 0 }}>
              {profile.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={{ paddingBottom: 8 }}>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: T.text1, margin: '0 0 4px', letterSpacing: '-0.02em' }}>{profile.name}</h1>
              <div style={{ fontSize: 13, color: T.text3, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{ICONS.pin} {profile.location || 'France'}</span>
                <span>·</span>
                <span>Membre depuis {new Date(profile.joined || '2025-01-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingBottom: 8 }}>
            <Btn variant="surface" size="sm" icon={ICONS.share} onClick={handleShareProfile}>Partager le profil</Btn>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.65, margin: '0 0 16px' }}>{profile.bio}</p>}

        {/* Badges */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
          {(profile.badges || []).map(b => <Tag key={b} variant="brand">{b}</Tag>)}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, marginBottom: 32 }}>
          {[
            [profile.petitions_signed || 8, 'Pétitions signées'],
            [3, 'Mobilisations'],
            [profile.services_used || 5, 'Services SEL'],
            [4, 'Contributions'],
          ].map(([val, label]) => (
            <div key={label} style={{ background: T.surface, borderRadius: 16, padding: '18px 16px', textAlign: 'center', border: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 800, color: T.brand, lineHeight: 1, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 12, color: T.text4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Wallet */}
        <div className="mn-wallet-card" style={{ background: T.text1, borderRadius: 20, padding: '24px 28px', marginBottom: 28, display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(244,114,30,0.1)', pointerEvents: 'none' }}></div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Wallet T99CP · Réseau Polygon</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 42, fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: 4 }}>{profile.t99cp_balance}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>T99CP · ≈ {profile.t99cp_balance} € · ≈ {profile.t99cp_balance} minutes</div>
          </div>
          <Btn variant="white" size="md" onClick={() => window.open('https://the99coinproject.org', '_blank')} icon={ICONS.wallet}>Gérer</Btn>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 24 }}>
          {[['activity', 'Activité'], ['services', 'Mes services'], ['settings', 'Paramètres']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: tab === id ? 700 : 500, fontSize: 14, fontFamily: 'Inter,sans-serif', color: tab === id ? T.brand : T.text3, borderBottom: `2px solid ${tab === id ? T.brand : 'transparent'}`, marginBottom: -2, transition: 'all 0.15s', letterSpacing: '-0.01em' }}>{label}</button>
          ))}
        </div>

        {tab === 'activity' && (
          <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, padding: '8px 0' }}>
            {activities.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: i < activities.length - 1 ? `1px solid ${T.border}` : 'none', alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, flexShrink: 0 }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: T.text1, lineHeight: 1.5, fontWeight: 500 }}>{a.text}</div>
                  <div style={{ fontSize: 12, color: T.text4, marginTop: 3 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'services' && (
          <div>
            <p style={{ fontSize: 13, color: T.text3, margin: '0 0 16px', lineHeight: 1.55 }}>Tes contributions et participations dans chaque service. Les <strong style={{ color: T.brand }}>compteurs</strong> reflètent ce que tu as réellement fait — clique sur un service pour ouvrir la liste filtrée.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
              {serviceStats.map(s => {
                const total = s.created + s.joins;
                const empty = total === 0;
                return (
                  <div key={s.page} onClick={() => setPage(s.page)} style={{
                    background: T.surface, borderRadius: 14, border: `1px solid ${empty ? T.border : `${s.color}40`}`,
                    borderTop: `3px solid ${s.color}`,
                    padding: '14px 16px', cursor: 'pointer', transition: 'all 0.18s',
                    opacity: empty ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = `0 6px 20px ${s.color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = empty ? T.border : `${s.color}40`; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: T.text1, fontFamily:"'Sora',sans-serif" }}>{s.label}</span>
                      <div style={{ color: s.color, opacity: empty ? 0.4 : 1 }}>{ICONS.arrow_r}</div>
                    </div>
                    <div style={{ display:'flex', gap: 12, flexWrap:'wrap' }}>
                      {s.created > 0 && (
                        <div>
                          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: s.color, lineHeight: 1 }}>{s.created}</div>
                          <div style={{ fontSize: 10, color: T.text4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 3 }}>{s.createLabel || (s.created > 1 ? 'créations' : 'création')}</div>
                        </div>
                      )}
                      {s.joins > 0 && (
                        <div>
                          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: T.text1, lineHeight: 1 }}>{s.joins}</div>
                          <div style={{ fontSize: 10, color: T.text4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 3 }}>{s.joinLabel || 'participations'}</div>
                        </div>
                      )}
                      {empty && <span style={{ fontSize: 12, color: T.text4, fontStyle: 'italic' }}>Aucune contribution pour l'instant</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 500 }}>
            {[
              { id:'notifications',  title:'Notifications',                desc:'Gérer vos alertes (email, push, in-app)' },
              { id:'security',       title:'Sécurité & Confidentialité',    desc:'Mot de passe, 2FA, sessions actives' },
              { id:'rgpd',           title:'RGPD — Export de mes données',  desc:'Télécharger un fichier JSON complet' },
              { id:'wallet',         title:'Wallet T99CP',                  desc:'Gérer votre monnaie solidaire sur Polygon' },
            ].map(s => (
              <div key={s.id} onClick={() => {
                if (s.id === 'wallet') { window.open('https://the99coinproject.org','_blank'); return; }
                if (s.id === 'rgpd') {
                  // Génération d'un export JSON local et téléchargement
                  const data = {
                    profile,
                    creations: ['housing','marketplace','sel','crowdfunding','garden','lending','carpool_offers','carpool_requests','polls','federations']
                      .reduce((a,d)=>{ a[d] = window.getUserCreations?.(d)||[]; return a; }, {}),
                    joins: { mobilizations:window.getUserJoined?.('mobilizations')||[], groups:window.getUserJoined?.('groups')||[] },
                    poll_votes: (()=>{ try{return JSON.parse(localStorage.getItem('mn_poll_votes')||'{}');}catch{return{};} })(),
                    exported_at: new Date().toISOString(),
                  };
                  const blob = new Blob([JSON.stringify(data,null,2)], { type:'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url; link.download = `maintenant-${(profile.name||'export').replace(/\s+/g,'-').toLowerCase()}-${new Date().toISOString().slice(0,10)}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                  window.showToast?.('Export RGPD téléchargé', { type:'success', icon:'📥' });
                  return;
                }
                setSettingDetail(s);
              }} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.brand} onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
                <div><div style={{ fontWeight: 600, fontSize: 14, color: T.text1 }}>{s.title}</div><div style={{ fontSize: 12, color: T.text4 }}>{s.desc}</div></div>
                <div style={{ color: T.text4 }}>{ICONS.arrow_r}</div>
              </div>
            ))}
            <Btn variant="outline" style={{ borderColor: '#EF4444', color: '#EF4444', marginTop: 8 }} onClick={() => { setUser(null); setPage('home'); }} icon={ICONS.logout}>Se déconnecter</Btn>
          </div>
        )}

        {/* Modal détail des paramètres */}
        {settingDetail && (
          <Modal open onClose={()=>setSettingDetail(null)} title={`⚙ ${settingDetail.title}`} width={520}>
            {settingDetail.id === 'notifications' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <p style={{ fontSize:13, color:T.text3, margin:0, lineHeight:1.55 }}>Choisis quelles notifications tu veux recevoir et par quel canal.</p>
                {[
                  ['Nouvelles pétitions de tes thématiques', true, true, false],
                  ['Mobilisations dans ta région',           true, true, true],
                  ['Réponses à tes posts du réseau',          true, false, true],
                  ['Versement T99CP reçu sur ton wallet',     true, false, true],
                  ['Récap hebdo de la plateforme',            true, false, false],
                ].map(([label, email, push, inapp]) => (
                  <div key={label} style={{ background:T.surface2, borderRadius:10, padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                    <span style={{ fontSize:13, color:T.text2, flex:1 }}>{label}</span>
                    <div style={{ display:'flex', gap:6 }}>
                      <span style={{ fontSize:10, padding:'3px 8px', borderRadius:6, background: email ? T.successLight : '#fff', color: email ? T.success : T.text4, border:`1px solid ${email ? T.success : T.border}`, fontWeight:600 }}>📧 Email</span>
                      <span style={{ fontSize:10, padding:'3px 8px', borderRadius:6, background: push ? T.successLight : '#fff', color: push ? T.success : T.text4, border:`1px solid ${push ? T.success : T.border}`, fontWeight:600 }}>📱 Push</span>
                      <span style={{ fontSize:10, padding:'3px 8px', borderRadius:6, background: inapp ? T.successLight : '#fff', color: inapp ? T.success : T.text4, border:`1px solid ${inapp ? T.success : T.border}`, fontWeight:600 }}>🔔 In-app</span>
                    </div>
                  </div>
                ))}
                <div style={{ background:'#FEF3C7', border:`1px solid #FCD34D`, borderRadius:10, padding:'10px 14px', fontSize:12, color:'#78350F', lineHeight:1.55 }}>
                  <strong>Mode prototype :</strong> les bascules seront cliquables dans la version production.
                </div>
              </div>
            )}
            {settingDetail.id === 'security' && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ background:T.surface2, borderRadius:12, padding:'16px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Mot de passe</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:13, color:T.text2 }}>Dernière modification : il y a 4 mois</span>
                    <Btn variant="outline" size="sm" onClick={()=>window.showToast?.('Lien de réinitialisation envoyé par email', { type:'success' })}>Modifier</Btn>
                  </div>
                </div>
                <div style={{ background:T.surface2, borderRadius:12, padding:'16px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Authentification à 2 facteurs (2FA)</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:13, color:T.text2 }}>Statut : <strong style={{ color:'#DC2626' }}>Désactivée</strong></span>
                    <Btn variant="gradient" size="sm" onClick={()=>window.showToast?.('Configuration 2FA — démo prototype', { type:'info' })}>Activer</Btn>
                  </div>
                </div>
                <div style={{ background:T.surface2, borderRadius:12, padding:'16px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.text3, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Sessions actives</div>
                  {[['🖥️','Chrome · Linux','Lyon, France · à l\'instant',true],['📱','Firefox · Android','Lyon, France · il y a 3 j',false]].map(([ic,dev,loc,curr])=>(
                    <div key={dev} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:`1px solid ${T.border}` }}>
                      <span style={{ fontSize:18 }}>{ic}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, color:T.text1, fontWeight:600 }}>{dev}{curr && <span style={{ fontSize:10, fontWeight:800, color:T.success, marginLeft:6, padding:'2px 6px', background:T.successLight, borderRadius:4, letterSpacing:'0.04em' }}>SESSION ACTUELLE</span>}</div>
                        <div style={{ fontSize:11, color:T.text4 }}>{loc}</div>
                      </div>
                      {!curr && <button onClick={()=>window.showToast?.('Session déconnectée', { type:'info' })} style={{ padding:'4px 10px', border:`1px solid ${T.border}`, background:'transparent', borderRadius:8, fontSize:11, color:T.text3, cursor:'pointer' }}>Déconnecter</button>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginTop:14 }}>
              <Btn full variant="ghost" size="md" onClick={()=>setSettingDetail(null)}>Fermer</Btn>
            </div>
          </Modal>
        )}
      </div>

      <EditModal open={editOpen} onClose={() => setEditOpen(false)} title="Mon profil" data={profile} onSave={f => { setProfile(p => ({ ...p, ...f })); setUser && setUser(u => ({ ...u, ...f })); }} fields={[{ key: 'name', label: 'Nom complet' }, { key: 'location', label: 'Ville' }, { key: 'bio', label: 'Présentation', type: 'textarea' }]} />
    </div>
  );
}
window.ProfilePage = ProfilePage;
