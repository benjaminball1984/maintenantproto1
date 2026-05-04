// Pages_Services.jsx — Pétitions v2, Mobilisations v2, Logement v2
const { useState, useEffect } = React;

// ── PÉTITIONS v2 ───────────────────────────────────────────
function PetitionDetail({ p, onBack, user, onAuth, adminMode, onSave }) {
  const [signed, setSigned] = useState(false);
  const [data, setData] = useState(p);
  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [tab, setTab] = useState('about');
  const pct = Math.min(Math.round((data.signatures / data.goal) * 100), 100);

  const updates = [
    { date: '2026-04-20', text: 'La pétition atteint 10 000 signatures ! Merci à toutes et tous.', author: data.author },
    { date: '2026-04-10', text: 'Nous avons remis nos revendications à la préfecture.', author: data.author },
    { date: '2026-03-28', text: 'Lancement de la pétition.', author: data.author },
  ];
  const comments = [
    { name: 'Thomas R.', text: 'Essentiel ! J\'ai partagé à tous mes contacts.', time: 'il y a 2h' },
    { name: 'Aisha K.', text: 'C\'est scandaleux. On doit continuer à se battre.', time: 'il y a 4h' },
    { name: 'Omar B.', text: 'Soutien total depuis Marseille ✊', time: 'hier' },
  ];

  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 320, overflow: 'hidden' }}>
        <img src={`https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&q=70`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }}></div>
        <button onClick={onBack} style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 16px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, fontFamily: 'Inter,sans-serif' }}>
          {ICONS.arrow_l} Pétitions
        </button>
        {adminMode && <div style={{ position: 'absolute', top: 20, right: 20 }}><AdminBtn onEdit={() => setEditOpen(true)} /></div>}
        <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <Tag variant="brand">{data.category}</Tag>
            <Tag variant="success" dot>Active</Tag>
          </div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(20px,3.5vw,30px)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>{data.title}</h1>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, marginTop: 28 }} className="mn-detail-grid">
          {/* Left */}
          <div>
            {/* Author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '14px 16px', background: T.surface, borderRadius: 14, border: `1px solid ${T.border}` }}>
              <Avatar name={data.author} size={40} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.text1 }}>{data.author}</div>
                <div style={{ fontSize: 12, color: T.text3 }}>Initiateur de la pétition · {new Date(data.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {data.tags?.map(t => <Tag key={t} size="xs">#{t}</Tag>)}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 24 }}>
              {[['about', 'À propos'], ['updates', `Mises à jour (${updates.length})`], ['comments', `Commentaires (${comments.length})`]].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} style={{ padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: tab === id ? 700 : 500, fontSize: 14, fontFamily: 'Inter,sans-serif', color: tab === id ? T.brand : T.text3, borderBottom: `2px solid ${tab === id ? T.brand : 'transparent'}`, marginBottom: -2, transition: 'all 0.15s', letterSpacing: '-0.01em' }}>{label}</button>
              ))}
            </div>

            {tab === 'about' && (
              <div>
                <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.75, margin: '0 0 20px' }}>{data.description}</p>
                <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.7 }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. La situation actuelle exige une réponse immédiate et collective. Nos droits fondamentaux sont en jeu.</p>
                <div style={{ margin: '24px 0', padding: '16px 20px', background: T.brandLight, borderLeft: `4px solid ${T.brand}`, borderRadius: '0 12px 12px 0' }}>
                  <p style={{ fontSize: 14, color: T.brand, fontWeight: 600, lineHeight: 1.6, margin: 0 }}>« Face aux oppressions systémiques, nos luttes doivent devenir systémiques. Ils ont des milliards, soyons des millions ! »</p>
                </div>
              </div>
            )}

            {tab === 'updates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {updates.map((u, i) => (
                  <div key={i} style={{ background: T.surface, borderRadius: 14, padding: '16px 18px', border: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Avatar name={u.author} size={28} />
                      <div style={{ fontWeight: 600, fontSize: 13, color: T.text1 }}>{u.author}</div>
                      <div style={{ fontSize: 12, color: T.text4, marginLeft: 'auto' }}>{new Date(u.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                    </div>
                    <p style={{ fontSize: 14, color: T.text2, margin: 0, lineHeight: 1.6 }}>{u.text}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'comments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {comments.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10 }}>
                    <Avatar name={c.name} size={32} />
                    <div style={{ flex: 1, background: T.surface2, borderRadius: 12, padding: '10px 14px' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: T.text1 }}>{c.name}<span style={{ fontWeight: 400, color: T.text4, marginLeft: 8, fontSize: 11 }}>{c.time}</span></div>
                      <div style={{ fontSize: 14, color: T.text2, marginTop: 3 }}>{c.text}</div>
                    </div>
                  </div>
                ))}
                {user && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <Avatar name={user.name} size={32} />
                    <input placeholder="Votre commentaire..." style={{ flex: 1, height: 40, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '0 14px', fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none', background: T.bg }} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: T.surface, borderRadius: 20, padding: '22px', border: `1px solid ${T.border}`, position: 'sticky', top: 80 }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 36, fontWeight: 800, color: T.brand, lineHeight: 1, marginBottom: 4 }}>{data.signatures.toLocaleString('fr-FR')}</div>
              <div style={{ fontSize: 13, color: T.text3, marginBottom: 16 }}>signatures sur {data.goal.toLocaleString('fr-FR')} objectif</div>
              <ProgressBar value={data.signatures} max={data.goal} height={6} />
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {signed ? (
                  <div style={{ background: T.successLight, borderRadius: 14, padding: '16px', textAlign: 'center', border: `1px solid #BBF7D0` }}>
                    <div style={{ color: T.success, display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{ICONS.check}</div>
                    <div style={{ fontWeight: 700, color: T.success, fontSize: 15 }}>Vous avez signé !</div>
                    <div style={{ fontSize: 12, color: T.success, marginTop: 3, opacity: 0.8 }}>Merci pour votre engagement.</div>
                  </div>
                ) : (
                  <Btn full variant="gradient" size="lg" onClick={() => { if (!user) { onAuth(); } else { setSigned(true); setData(d => ({ ...d, signatures: d.signatures + 1 })); } }}>
                    Signer cette pétition
                  </Btn>
                )}
                <Btn full variant="outline" size="md" onClick={() => setPayOpen(true)} icon={ICONS.wallet}>Soutenir en T99CP</Btn>
                <Btn full variant="ghost" size="md" onClick={() => navigator.share?.({ title: data.title, url: window.location.href }).catch(() => {})} icon={ICONS.share}>Partager</Btn>
              </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 16, padding: '18px', border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Derniers signataires</div>
              {['Marie D.', 'Thomas R.', 'Aisha K.', 'Omar B.', 'Clara F.'].map((n, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: i < 4 ? `1px solid ${T.border}` : 'none' }}>
                  <Avatar name={n} size={28} />
                  <span style={{ fontSize: 13, color: T.text2, fontWeight: 500 }}>{n}</span>
                  <span style={{ fontSize: 11, color: T.text4, marginLeft: 'auto' }}>il y a {i + 1}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PayModal open={payOpen} onClose={() => setPayOpen(false)} amount={5} item={data.title} description="Soutenez cette pétition avec un don en T99CP pour financer la campagne." />
      <EditModal open={editOpen} onClose={() => setEditOpen(false)} title="Pétition" data={data} onSave={f => { setData(d => ({ ...d, ...f })); onSave?.({ ...data, ...f }); }}
        fields={[{ key: 'title', label: 'Titre' }, { key: 'category', label: 'Catégorie', type: 'select', options: ['Santé', 'Environnement', 'Social', 'Justice', 'Transport', 'Logement', 'Droits', 'Éducation'] }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'goal', label: 'Objectif', type: 'number' }, { key: 'location', label: 'Lieu' }]} />
    </div>
  );
}

function PetitionCard({ p, onClick, adminMode, onEdit }) {
  const pct = Math.min(Math.round((p.signatures / p.goal) * 100), 100);
  return (
    <div onClick={onClick} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.22s', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      {adminMode && <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }} onClick={e => { e.stopPropagation(); onEdit(); }}><AdminBtn onEdit={onEdit} /></div>}
      <div style={{ height: 160, position: 'relative', overflow: 'hidden', background: T.text1 }}>
        <img src={`https://picsum.photos/seed/pet${p.id}/600/300`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.65),transparent 60%)' }}></div>
        <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
          <Tag variant="brand" size="xs">{p.category}</Tag>
          {p.featured && <Tag variant="gradient" size="xs" style={{ marginLeft: 6 }}>En vedette</Tag>}
        </div>
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: T.text1, margin: '0 0 6px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.text4, marginBottom: 12 }}>
          {ICONS.pin}<span>{p.location}</span><span>·</span><span>{p.author}</span>
        </div>
        <ProgressBar value={p.signatures} max={p.goal} height={4} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.brand }}>{p.signatures.toLocaleString('fr-FR')} <span style={{ fontWeight: 400, color: T.text3, fontSize: 12 }}>signataires</span></span>
          <Tag>{pct}% atteint</Tag>
        </div>
      </div>
    </div>
  );
}

function PetitionsPage({ user, adminMode, onAuth, setPage }) {
  const [data, setData] = useState(AppData.petitions);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Toutes');
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newP, setNewP] = useState({ title: '', category: 'Social', description: '', goal: 5000, location: 'France', author: user?.name || '' });

  const cats = ['Toutes', ...new Set(data.map(p => p.category))];
  const filtered = data.filter(p => {
    const ms = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const mc = cat === 'Toutes' || p.category === cat;
    return ms && mc;
  });
  const featured = filtered.filter(p => p.featured);
  const rest = filtered.filter(p => !p.featured);

  if (detail) return <PetitionDetail p={detail} onBack={() => setDetail(null)} user={user} onAuth={onAuth} adminMode={adminMode} onSave={u => setData(d => d.map(p => p.id === u.id ? u : p))} />;

  return (
    <PageContainer>
      <SectionTitle label="Mobilisation" title="Pétitions citoyennes" action={
        <Btn variant="gradient" size="sm" icon={ICONS.plus} onClick={() => user ? setCreateOpen(true) : onAuth()}>Créer une pétition</Btn>
      } />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 8 }} className="mn-detail-grid">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une pétition, une cause..." />
      </div>
      <FilterTabs options={cats} active={cat} onChange={setCat} />

      {featured.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>En vedette</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
            {featured.map(p => <PetitionCard key={p.id} p={p} onClick={() => setDetail(p)} adminMode={adminMode} onEdit={() => setEditItem(p)} />)}
          </div>
        </div>
      )}

      <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
        {cat === 'Toutes' ? 'Toutes les pétitions' : cat} · {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
      </div>
      {rest.length === 0 ? <EmptyState title="Aucune pétition trouvée" desc="Essayez d'autres filtres ou créez la vôtre." action={<Btn variant="gradient" onClick={() => user ? setCreateOpen(true) : onAuth()} icon={ICONS.plus}>Créer une pétition</Btn>} />
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>{rest.map(p => <PetitionCard key={p.id} p={p} onClick={() => setDetail(p)} adminMode={adminMode} onEdit={() => setEditItem(p)} />)}</div>}

      {editItem && <EditModal open onClose={() => setEditItem(null)} title="Pétition" data={editItem} onSave={f => { setData(d => d.map(p => p.id === editItem.id ? { ...p, ...f } : p)); setEditItem(null); }} fields={[{ key: 'title', label: 'Titre' }, { key: 'category', label: 'Catégorie', type: 'select', options: ['Santé', 'Environnement', 'Social', 'Justice', 'Transport', 'Logement', 'Droits'] }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'goal', label: 'Objectif', type: 'number' }, { key: 'location', label: 'Lieu' }]} />}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Créer une pétition" width={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['title', 'Titre de la pétition'], ['location', 'Lieu concerné'], ['author', 'Votre nom ou organisation']].map(([k, l]) => (
            <div key={k}><label style={{ fontSize: 12, fontWeight: 600, color: T.text3, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</label>
              <input value={newP[k]} onChange={e => setNewP(p => ({ ...p, [k]: e.target.value }))} style={{ width: '100%', height: 46, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '0 16px', fontSize: 15, fontFamily: 'Inter,sans-serif', color: T.text1, background: T.bg, outline: 'none', boxSizing: 'border-box' }} /></div>
          ))}
          <div><label style={{ fontSize: 12, fontWeight: 600, color: T.text3, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Catégorie</label>
            <select value={newP.category} onChange={e => setNewP(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', height: 46, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '0 16px', fontSize: 15, fontFamily: 'Inter,sans-serif', color: T.text1, background: T.bg, outline: 'none', boxSizing: 'border-box' }}>
              {['Santé', 'Environnement', 'Social', 'Justice', 'Transport', 'Logement', 'Droits', 'Éducation'].map(c => <option key={c}>{c}</option>)}
            </select></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: T.text3, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Description</label>
            <textarea value={newP.description} onChange={e => setNewP(p => ({ ...p, description: e.target.value }))} rows={4} style={{ width: '100%', border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 16px', fontSize: 15, fontFamily: 'Inter,sans-serif', color: T.text1, background: T.bg, outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.5 }} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: T.text3, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Objectif de signatures</label>
            <input type="number" value={newP.goal} onChange={e => setNewP(p => ({ ...p, goal: +e.target.value }))} style={{ width: '100%', height: 46, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '0 16px', fontSize: 15, fontFamily: 'Inter,sans-serif', color: T.text1, background: T.bg, outline: 'none', boxSizing: 'border-box' }} /></div>
          <Btn full variant="gradient" size="lg" icon={ICONS.check} onClick={() => { const np = { ...newP, id: Date.now(), signatures: 0, status: 'active', date: new Date().toISOString().split('T')[0], featured: false, tags: [] }; setData(d => [np, ...d]); setCreateOpen(false); }}>Publier la pétition</Btn>
        </div>
      </Modal>
    </PageContainer>
  );
}
window.PetitionsPage = PetitionsPage;

// ── HOUSING v2 ─────────────────────────────────────────────
function HousingCard({ h, onClick, adminMode, onEdit }) {
  return (
    <div onClick={onClick} style={{ background: T.surface, borderRadius: 18, overflow: 'hidden', cursor: 'pointer', border: `1px solid ${T.border}`, transition: 'all 0.22s', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      {adminMode && <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 3 }} onClick={e => { e.stopPropagation(); onEdit(); }}><AdminBtn onEdit={onEdit} /></div>}
      {h._userCreated && <div style={{ position:'absolute', top: 12, left: h.solidarity ? 110 : 12, zIndex: 3 }}><window.UserBadge /></div>}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <img src={h.images?.[0] || `https://images.unsplash.com/photo-${['1522708323590-d24dbb6b0267','1502672260266-1c1ef2d93688','1493809842364-78817add7ffb','1571939228382-b2f2b585ce15','1560448204-e02f11c3d0e2','1556909114-f6e7ad7d3136','1512917774080-9991f1c4c750','1574362848149-11496d93a7c7','1582063289852-62e3ba2747f8','1493556134231-aa8efa1b93ce'][(h.id-1)%10]}?w=600&q=70`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} onError={e => { e.target.src = `https://picsum.photos/seed/house${h.id}/600/300`; }} />
        {h.solidarity && <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(22,163,74,0.9)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, letterSpacing: '0.03em' }}>SOLIDAIRE</div>}
        <button style={{ position: 'absolute', top: 12, right: adminMode ? 90 : 12, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text3 }} onClick={e => e.stopPropagation()}>{ICONS.heart}</button>
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: T.text1, margin: '0 0 3px', lineHeight: 1.3 }}>{h.title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.text3 }}>{ICONS.pin}<span>{h.location}</span></div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <TokenDisplay amount={h.price_t99cp} size="md" />
            <div style={{ fontSize: 11, color: T.text4 }}>/ nuit</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, margin: '10px 0', flexWrap: 'wrap' }}>
          <Tag size="xs">{h.type}</Tag>
          <Tag size="xs">{h.area} m²</Tag>
          <Tag size="xs">{h.rooms} pièce{h.rooms > 1 ? 's' : ''}</Tag>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stars rating={h.rating} count={h.reviews} />
          <Tag variant="success" size="xs">{h.available}</Tag>
        </div>
      </div>
    </div>
  );
}

function HousingDetail({ h, onBack, user, onAuth, adminMode, onSave }) {
  const [nights, setNights] = useState(3);
  const [payOpen, setPayOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [data, setData] = useState(h);
  const [activeImg, setActiveImg] = useState(0);
  const photos = Array.from({ length: 4 }, (_, i) => `https://picsum.photos/seed/house${h.id}x${i}/800/500`);

  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 20px 100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: T.text2, fontSize: 14, fontWeight: 600, fontFamily: 'Inter,sans-serif', padding: '8px 0' }}>{ICONS.arrow_l} Hébergements</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {adminMode && <AdminBtn onEdit={() => setEditOpen(true)} />}
            <Btn variant="surface" size="sm" icon={ICONS.share}>Partager</Btn>
            <Btn variant="surface" size="sm" icon={ICONS.heart}>Sauvegarder</Btn>
          </div>
        </div>

        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, color: T.text1, margin: '0 0 6px', letterSpacing: '-0.03em' }}>{data.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <Stars rating={data.rating} count={data.reviews} />
          <span style={{ color: T.text4 }}>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: T.text2 }}>{ICONS.pin}{data.location}</span>
          {data.solidarity && <Tag variant="success" dot>Hébergement solidaire</Tag>}
        </div>

        {/* Gallery */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8, height: 360, borderRadius: 20, overflow: 'hidden', marginBottom: 32 }}>
          <img src={photos[0]} alt="" style={{ gridRow: '1/-1', width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onError={e => { e.target.src = `https://picsum.photos/seed/h${h.id}a/800/500`; }} />
          {photos.slice(1).map((src, i) => <img key={i} src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onError={e => { e.target.src = `https://picsum.photos/seed/h${h.id}${i}/400/300`; }} />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }} className="mn-detail-grid">
          {/* Left */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 20, borderBottom: `1px solid ${T.border}`, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: T.text1, margin: '0 0 4px' }}>{data.type} proposé par {data.host}</h2>
                <div style={{ fontSize: 14, color: T.text3 }}>{data.rooms} pièce{data.rooms > 1 ? 's' : ''} · {data.area} m²</div>
              </div>
              <Avatar name={data.host} size={48} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
              {[['Disponibilité', data.available], ['Surface', `${data.area} m²`], ['Pièces', data.rooms]].map(([l, v]) => (
                <div key={l} style={{ background: T.surface2, borderRadius: 12, padding: '14px', textAlign: 'center', border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 11, color: T.text4, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: T.text1 }}>{v}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.75, marginBottom: 24 }}>{data.description}</p>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: T.text1, marginBottom: 14 }}>Équipements</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
                {data.amenities.map(a => (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: T.text2 }}>
                    <div style={{ color: T.success, display: 'flex' }}>{ICONS.check}</div>{a}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking widget */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, padding: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                <TokenDisplay amount={data.price_t99cp} size="lg" />
                <span style={{ fontSize: 13, color: T.text3 }}>/ nuit</span>
              </div>

              <div style={{ border: `1.5px solid ${T.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${T.border}` }}>
                  {[['Arrivée', '15 mai 2026'], ['Départ', '18 mai 2026']].map(([l, v]) => (
                    <div key={l} style={{ padding: '12px 14px', borderRight: l === 'Arrivée' ? `1px solid ${T.border}` : 'none' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.text1 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Durée</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button onClick={() => setNights(n => Math.max(1, n - 1))} style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: T.text2 }}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 16, minWidth: 24, textAlign: 'center' }}>{nights}</span>
                      <button onClick={() => setNights(n => n + 1)} style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: T.text2 }}>+</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: T.text3 }}>{nights} nuit{nights > 1 ? 's' : ''}</div>
                </div>
              </div>

              <Btn full variant="gradient" size="lg" onClick={() => user ? setPayOpen(true) : onAuth()} style={{ marginBottom: 10 }}>
                Réserver · <TokenDisplay amount={data.price_t99cp * nights} size="sm" showLabel={false} /> T99CP
              </Btn>
              <p style={{ fontSize: 11, color: T.text4, textAlign: 'center', margin: '0 0 14px' }}>+ frais de port Polygon (Gas fees) · Vous ne serez pas débité maintenant</p>

              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
                {[['Prix', `${data.price_t99cp} × ${nights} nuits`, `${data.price_t99cp * nights} T99CP`], ['Frais de service', '10%', `${Math.round(data.price_t99cp * nights * 0.1)} T99CP`]].map(([l, m, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: T.text2, marginBottom: 8 }}>
                    <span>{l} <span style={{ color: T.text4, fontSize: 12 }}>({m})</span></span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: T.text1, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                  <span>Total</span>
                  <TokenDisplay amount={Math.round(data.price_t99cp * nights * 1.1)} size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PayModal open={payOpen} onClose={() => setPayOpen(false)} amount={Math.round(data.price_t99cp * nights * 1.1)} item={data.title} description={`${nights} nuit${nights > 1 ? 's' : ''} · ${data.host}`} seller={data.host} />ost} · ${data.location}`} />
      <EditModal open={editOpen} onClose={() => setEditOpen(false)} title="Hébergement" data={data} onSave={f => { setData(d => ({ ...d, ...f })); onSave?.({ ...data, ...f }); }}
        fields={[{ key: 'title', label: 'Titre' }, { key: 'type', label: 'Type', type: 'select', options: ['Studio', 'Chambre', 'T2', 'T3', 'T4', 'Maison', 'Loft', 'Gîte'] }, { key: 'price_t99cp', label: 'Prix/nuit T99CP', type: 'number' }, { key: 'area', label: 'Surface m²', type: 'number' }, { key: 'location', label: 'Lieu' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'available', label: 'Disponibilité' }]} />
    </div>
  );
}

function HousingPage({ user, adminMode, onAuth, setPage }) {
  const [userItems, setUserItems] = useState(() => window.getUserCreations('housing'));
  const [data, setData] = useState([...userItems, ...AppData.housing]);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('Tous');
  const [solidarity, setSolidarity] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const types = ['Tous', 'Studio', 'Chambre', 'T2', 'T3', 'Maison', 'Loft', 'Gîte'];
  const filtered = data.filter(h => {
    const mt = type === 'Tous' || h.type === type;
    const ms = !search || h.title.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase());
    const msol = !solidarity || h.solidarity;
    return mt && ms && msol;
  });

  if (detail) return <HousingDetail h={detail} onBack={() => setDetail(null)} user={user} onAuth={onAuth} adminMode={adminMode} onSave={u => setData(d => d.map(h => h.id === u.id ? u : h))} />;

  return (
    <PageContainer>
      <SectionTitle label="Service" title="Hébergements solidaires" action={<Btn variant="gradient" size="sm" icon={ICONS.plus} onClick={() => user ? setCreateOpen(true) : onAuth()}>Proposer un logement</Btn>} />
      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} title="Proposer un hébergement"
        subtitle="Partage ton logement de manière temporaire, à prix solidaire. Tu peux demander une participation en T99CP par nuit."
        domain="housing" color={T.hub.housing}
        defaultPhoto="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=70"
        fields={[
          { id:'title',         label:'Titre de l\'annonce', required:true, placeholder:"Studio cosy près du canal" },
          { id:'type',          label:'Type de logement', type:'select', required:true, options:types.slice(1) },
          { id:'location',      label:'Ville / quartier', required:true, placeholder:"Paris 11e" },
          { id:'price_t99cp',   label:'Prix par nuit (en T99CP)', type:'number', required:true, hint:'Tu peux mettre 0 pour un hébergement gratuit', placeholder:'25' },
          { id:'capacity',      label:'Nombre de personnes', type:'number', required:true, placeholder:'2' },
          { id:'description',   label:'Description', type:'textarea', rows:3, required:true, placeholder:"Lumineux, calme, 5 min du métro..." },
          { id:'image',         label:'URL de la photo (optionnel)', type:'photo', hint:'Colle un lien d\'image. Sinon une photo par défaut sera utilisée.' },
          { id:'solidarity',    label:'Mode solidaire (gratuit pour militant·es)', type:'select', options:[{value:'',label:'Non'},{value:'true',label:'Oui'}] },
        ]}
        onSubmit={item => { const enriched = { ...item, host: user?.name || 'Vous', rating: 0, reviews_count: 0, solidarity: item.solidarity === 'true', images: [item.image].filter(Boolean) }; setData(d => [enriched, ...d]); setUserItems(u => [enriched, ...u]); }}
      />
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}><SearchInput value={search} onChange={setSearch} placeholder="Destination, ville..." /></div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '10px 16px', background: solidarity ? T.successLight : T.surface, border: `1.5px solid ${solidarity ? T.success : T.border}`, borderRadius: 12, fontSize: 13, fontWeight: 600, color: solidarity ? T.success : T.text2 }}>
          <input type="checkbox" checked={solidarity} onChange={e => setSolidarity(e.target.checked)} style={{ display: 'none' }} />
          {solidarity ? ICONS.check : null} Solidaires uniquement
        </label>
      </div>
      <FilterTabs options={types} active={type} onChange={setType} />
      {filtered.length === 0 ? <EmptyState title="Aucun logement trouvé" desc="Modifiez vos filtres ou proposez un hébergement." /> :
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
          {filtered.map(h => <HousingCard key={h.id} h={h} onClick={() => setDetail(h)} adminMode={adminMode} onEdit={() => setEditItem(h)} />)}
        </div>}
      {editItem && <EditModal open onClose={() => setEditItem(null)} title="Hébergement" data={editItem} onSave={f => { setData(d => d.map(h => h.id === editItem.id ? { ...h, ...f } : h)); setEditItem(null); }} fields={[{ key: 'title', label: 'Titre' }, { key: 'type', label: 'Type', type: 'select', options: types.slice(1) }, { key: 'price_t99cp', label: 'Prix T99CP', type: 'number' }, { key: 'location', label: 'Lieu' }, { key: 'description', label: 'Description', type: 'textarea' }]} />}
    </PageContainer>
  );
}
window.HousingPage = HousingPage;
