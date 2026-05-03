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

function MediaPage({ adminMode, onAuth }) {
  const [data, setData] = useState(AppData.media);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [cat, sCat] = useState('Toutes');
  const [editItem, setEditItem] = useState(null);
  const cats = ['Toutes', ...new Set(data.map(a => a.category))];
  const filtered = data.filter(a => (cat === 'Toutes' || a.category === cat) && (!search || a.title.toLowerCase().includes(search.toLowerCase()) || a.author.toLowerCase().includes(search.toLowerCase())));
  const featured = filtered.filter(a => a.featured);
  const rest = filtered.filter(a => !a.featured);
  if (detail) return <MediaArticle a={detail} onBack={() => setDetail(null)} adminMode={adminMode} onSave={u => setData(d => d.map(a => a.id === u.id ? u : a))} />;

  return (
    <PageContainer maxWidth={1200}>
      <SectionTitle label="Journalisme militant" title="Maintenant! Média" action={adminMode && <Btn variant="success" size="sm" icon={ICONS.plus}>Nouvel article</Btn>} />
      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1 }}><SearchInput value={search} onChange={setSearch} placeholder="Rechercher un article, un auteur..." /></div>
      </div>
      <FilterTabs options={cats} active={cat} onChange={sCat} />

      {/* Featured — big card */}
      {featured.map(a => (
        <div key={a.id} onClick={() => setDetail(a)} style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, overflow: 'hidden', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginBottom: 32, transition: 'all 0.22s', position: 'relative' }}
          className="mn-media-featured"
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
          {adminMode && <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 3 }} onClick={e => { e.stopPropagation(); setEditItem(a); }}><AdminBtn onEdit={() => setEditItem(a)} /></div>}
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 280 }}>
            <img src={`https://picsum.photos/seed/feat${a.id}/800/600`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,transparent,rgba(0,0,0,0.3))' }}></div>
          </div>
          <div style={{ padding: '32px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Tag variant="brand" style={{ marginBottom: 16, alignSelf: 'flex-start' }}>{a.category}</Tag>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(18px,2.5vw,26px)', fontWeight: 800, color: T.text1, margin: '0 0 14px', lineHeight: 1.25, letterSpacing: '-0.03em' }}>{a.title}</h2>
            <p style={{ fontSize: 14, color: T.text3, lineHeight: 1.65, margin: '0 0 20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.excerpt}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={a.author} size={32} />
              <div style={{ fontSize: 13, color: T.text3 }}>{a.author} · {a.reading_time} min</div>
            </div>
          </div>
        </div>
      ))}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
        {rest.map(a => (
          <div key={a.id} onClick={() => setDetail(a)} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
            {adminMode && <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }} onClick={e => { e.stopPropagation(); setEditItem(a); }}><AdminBtn onEdit={() => setEditItem(a)} /></div>}
            <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
              <img src={`https://picsum.photos/seed/art${a.id}/600/360`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.06)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} onError={e => e.target.style.display = 'none'} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.3),transparent)' }}></div>
              <Tag variant="brand" size="xs" style={{ position: 'absolute', top: 12, left: 12 }}>{a.category}</Tag>
            </div>
            <div style={{ padding: '16px 18px 18px' }}>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: T.text1, margin: '0 0 8px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: T.text4 }}>
                <Avatar name={a.author} size={20} />
                <span>{a.author}</span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{ICONS.clock} {a.reading_time} min</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <EmptyState title="Aucun article trouvé" desc="Essayez d'autres filtres." />}
      {editItem && <EditModal open onClose={() => setEditItem(null)} title="Article" data={editItem} onSave={f => { setData(d => d.map(a => a.id === editItem.id ? { ...a, ...f } : a)); setEditItem(null); }} fields={[{ key: 'title', label: 'Titre' }, { key: 'category', label: 'Catégorie' }, { key: 'excerpt', label: 'Chapeau', type: 'textarea' }, { key: 'author', label: 'Auteur' }]} />}
    </PageContainer>
  );
}
window.MediaPage = MediaPage;

// ── MOBILISATIONS v2 ───────────────────────────────────────
function MobilizationsPage({ user, adminMode, onAuth }) {
  const [data, setData] = useState(AppData.mobilizations);
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState('Toutes');
  const [editItem, setEditItem] = useState(null);
  const types = ['Toutes', ...new Set(data.map(m => m.type))];
  const filtered = filter === 'Toutes' ? data : data.filter(m => m.type === filter);
  const TYPE_COLOR = { 'Manifestation': T.brand, 'Assemblée': T.info, 'Grève': '#7C3AED', 'Veillée': T.warning, 'Rassemblement': T.success, 'Festival': T.accent, 'Forum': T.info, 'Action directe': T.brand, 'Camp': T.success };

  if (detail) return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={() => setDetail(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: T.text2, fontSize: 14, fontWeight: 600, fontFamily: 'Inter,sans-serif', padding: '8px 0' }}>{ICONS.arrow_l} Mobilisations</button>
          {adminMode && <AdminBtn onEdit={() => setEditItem(detail)} />}
        </div>
        <div style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.07)' }}>
          <div style={{ background: `linear-gradient(135deg,${TYPE_COLOR[detail.type] || T.brand},${TYPE_COLOR[detail.type] || T.brand}99)`, padding: '36px 32px', color: '#fff' }}>
            <Tag variant="dark" size="xs" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', marginBottom: 16 }}>{detail.type}</Tag>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(20px,3.5vw,30px)', fontWeight: 800, margin: '0 0 14px', lineHeight: 1.2 }}>{detail.title}</h1>
            <div style={{ display: 'flex', gap: 20, fontSize: 14, opacity: 0.88, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{ICONS.calendar} {new Date(detail.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{ICONS.clock} {detail.time}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{ICONS.pin} {detail.location}</span>
            </div>
          </div>
          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
              {[['Organisateur', detail.organizer], ['Participants', detail.participants.toLocaleString('fr-FR')], ['Heure', detail.time]].map(([l, v]) => (
                <div key={l} style={{ background: T.surface2, borderRadius: 14, padding: '14px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{l}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: T.text1, lineHeight: 1.3 }}>{v}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.75, marginBottom: 24 }}>{detail.description}</p>
            <Btn full variant="gradient" size="lg" onClick={() => user ? alert('Inscrit·e !') : onAuth()}>Participer à cette mobilisation</Btn>
          </div>
        </div>
        {editItem && <EditModal open onClose={() => setEditItem(null)} title="Mobilisation" data={editItem} onSave={f => { setData(d => d.map(m => m.id === editItem.id ? { ...m, ...f } : m)); setDetail(f); setEditItem(null); }} fields={[{ key: 'title', label: 'Titre' }, { key: 'type', label: 'Type', type: 'select', options: ['Manifestation', 'Assemblée', 'Grève', 'Veillée', 'Rassemblement', 'Festival', 'Forum', 'Action directe', 'Camp'] }, { key: 'date', label: 'Date', type: 'date' }, { key: 'time', label: 'Heure' }, { key: 'location', label: 'Lieu' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'organizer', label: 'Organisateur' }, { key: 'participants', label: 'Participants', type: 'number' }]} />}
      </div>
    </div>
  );

  return (
    <PageContainer>
      <SectionTitle label="Agenda militant" title="Mobilisations & Événements" action={adminMode && <Btn variant="success" size="sm" icon={ICONS.plus}>+ Événement</Btn>} />
      <FilterTabs options={types} active={filter} onChange={setFilter} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(m => {
          const d = new Date(m.date);
          const color = TYPE_COLOR[m.type] || T.brand;
          return (
            <div key={m.id} onClick={() => setDetail(m)} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, display: 'flex', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
              {adminMode && <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }} onClick={e => { e.stopPropagation(); setEditItem(m); }}><AdminBtn onEdit={() => setEditItem(m)} /></div>}
              <div style={{ width: 72, background: color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '14px 0' }}>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.toLocaleDateString('fr-FR', { month: 'short' })}</div>
                <div style={{ color: '#fff', fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 28, lineHeight: 1 }}>{d.getDate()}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{d.getFullYear()}</div>
              </div>
              <div style={{ padding: '16px 20px', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Tag size="xs" style={{ background: `${color}18`, color, border: 'none' }}>{m.type}</Tag>
                  <span style={{ fontSize: 12, color: T.text4, display: 'flex', alignItems: 'center', gap: 3 }}>{ICONS.clock} {m.time}</span>
                </div>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: T.text1, margin: '0 0 5px', lineHeight: 1.3 }}>{m.title}</h3>
                <p style={{ fontSize: 13, color: T.text3, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>{m.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: T.text4, display: 'flex', alignItems: 'center', gap: 4 }}>{ICONS.pin} {m.location}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text3 }}>{ICONS.users} {m.participants.toLocaleString('fr-FR')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {editItem && !detail && <EditModal open onClose={() => setEditItem(null)} title="Événement" data={editItem} onSave={f => { setData(d => d.map(m => m.id === editItem.id ? { ...m, ...f } : m)); setEditItem(null); }} fields={[{ key: 'title', label: 'Titre' }, { key: 'type', label: 'Type', type: 'select', options: ['Manifestation', 'Assemblée', 'Grève', 'Veillée', 'Rassemblement', 'Festival'] }, { key: 'date', label: 'Date', type: 'date' }, { key: 'time', label: 'Heure' }, { key: 'location', label: 'Lieu' }, { key: 'description', label: 'Description', type: 'textarea' }]} />}
    </PageContainer>
  );
}
window.MobilizationsPage = MobilizationsPage;

// ── PROFILE v2 ────────────────────────────────────────────
function ProfilePage({ user, setUser, onAuth, setPage }) {
  const [tab, setTab] = useState('activity');
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState(user || AppData.defaultUser);

  if (!user) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', background: T.bg }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: T.text4 }}>{ICONS.user}</div>
      <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, color: T.text1, margin: '0 0 10px' }}>Votre profil militant</h2>
      <p style={{ color: T.text3, fontSize: 15, maxWidth: 360, lineHeight: 1.6, margin: '0 0 28px' }}>Créez votre profil pour accéder à tous les services solidaires de Maintenant!</p>
      <Btn variant="gradient" size="lg" onClick={onAuth}>Se connecter · Créer un compte</Btn>
    </div>
  );

  const activities = [
    { icon: ICONS.trending, text: 'Signé : "Stop à la fermeture des urgences"', time: 'il y a 2h', color: T.brand },
    { icon: ICONS.wallet, text: 'Contribution 15 T99CP — Camp du Larzac', time: 'il y a 1 jour', color: T.info },
    { icon: ICONS.users, text: 'Service SEL échangé : Cours de yoga (60 min)', time: 'il y a 3 jours', color: '#7C3AED' },
    { icon: ICONS.trending, text: 'Pétition créée : "Pour un RUB à 900€"', time: 'il y a 1 semaine', color: T.success },
    { icon: ICONS.home, text: 'Hébergement réservé — Lyon Croix-Rousse (3 nuits)', time: 'il y a 2 semaines', color: T.accent },
    { icon: ICONS.car, text: 'Covoiturage : Paris → Lyon', time: 'il y a 3 semaines', color: T.info },
  ];

  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      {/* Cover */}
      <div style={{ height: 180, background: T.gradR, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src={`https://picsum.photos/seed/cover${user.name?.length || 5}/1200/400`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} onError={e => e.target.style.display = 'none'} />
        </div>
        <div style={{ position: 'absolute', top: 16, right: 20, display: 'flex', gap: 8 }}>
          <Btn variant="white" size="sm" onClick={() => setEditOpen(true)} icon={ICONS.edit}>Modifier le profil</Btn>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 100px' }}>
        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, marginTop: -32, flexWrap: 'wrap', gap: 12 }}>
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
            <Btn variant="surface" size="sm" icon={ICONS.share}>Partager le profil</Btn>
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
        <div style={{ background: T.text1, borderRadius: 20, padding: '24px 28px', marginBottom: 28, display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
            {[['Pétitions', 'petitions'], ['Mobilisations', 'mobilizations'], ['Services SEL', 'sel'], ['Marketplace', 'marketplace'], ['Hébergement', 'housing'], ['Cagnottes', 'crowdfunding']].map(([label, page]) => (
              <div key={page} onClick={() => setPage(page)} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: '16px 18px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.boxShadow = '0 4px 16px rgba(225,29,116,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: T.text1 }}>{label}</span>
                <div style={{ color: T.text4 }}>{ICONS.arrow_r}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 500 }}>
            {[['Notifications', 'Gérer vos alertes'], ['Sécurité & Confidentialité', 'Mot de passe, 2FA'], ['RGPD — Export données', 'Télécharger vos données'], ['Wallet T99CP', 'Gérer votre monnaie solidaire']].map(([title, desc]) => (
              <div key={title} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.brand} onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
                <div><div style={{ fontWeight: 600, fontSize: 14, color: T.text1 }}>{title}</div><div style={{ fontSize: 12, color: T.text4 }}>{desc}</div></div>
                <div style={{ color: T.text4 }}>{ICONS.arrow_r}</div>
              </div>
            ))}
            <Btn variant="outline" style={{ borderColor: '#EF4444', color: '#EF4444', marginTop: 8 }} onClick={() => { setUser(null); setPage('home'); }} icon={ICONS.logout}>Se déconnecter</Btn>
          </div>
        )}
      </div>

      <EditModal open={editOpen} onClose={() => setEditOpen(false)} title="Mon profil" data={profile} onSave={f => { setProfile(p => ({ ...p, ...f })); setUser && setUser(u => ({ ...u, ...f })); }} fields={[{ key: 'name', label: 'Nom complet' }, { key: 'location', label: 'Ville' }, { key: 'bio', label: 'Présentation', type: 'textarea' }]} />
    </div>
  );
}
window.ProfilePage = ProfilePage;
