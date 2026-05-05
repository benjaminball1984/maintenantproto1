// Pages_Commerce.jsx — Marketplace v2, SEL v2, Covoiturage v2, Garden v2, Lending v2, Crowdfunding v2
const { useState } = React;

// ── MARKETPLACE v2 ─────────────────────────────────────────
function MPCard({ item, onClick, adminMode, onEdit }) {
  const [saved, setSaved] = useState(false);
  return (
    <div onClick={onClick} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      {adminMode && <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 3 }} onClick={e => { e.stopPropagation(); onEdit(); }}><AdminBtn onEdit={onEdit} /></div>}
      {item._userCreated && <div style={{ position:'absolute', top: 8, left: adminMode ? 96 : 8, zIndex: 3 }}><window.UserBadge /></div>}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: T.surface2 }}>
        <img src={item.images?.[0] || `https://picsum.photos/seed/mp${item.id}/400/300`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.06)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} onError={e => e.target.style.display = 'none'} />
        <button onClick={e => { e.stopPropagation(); setSaved(!saved); }} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: saved ? T.brand : T.text3 }}>{saved ? ICONS.heartFill : ICONS.heart}</button>
        <Tag variant={item.condition === 'Excellent' ? 'success' : item.condition === 'Très bon' ? 'info' : 'default'} size="xs" style={{ position: 'absolute', bottom: 10, left: 10 }}>{item.condition}</Tag>
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.text4, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.category}</div>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: T.text1, margin: '0 0 8px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TokenDisplay amount={item.price_t99cp} size="md" />
          <div style={{ fontSize: 11, color: T.text4 }}>📍 {item.location}</div>
        </div>
      </div>
    </div>
  );
}

function MPDetail({ item, onBack, user, onAuth, adminMode, onSave }) {
  const [payOpen, setPayOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [data, setData] = useState(item);
  const similar = AppData.marketplace.filter(i => i.category === item.category && i.id !== item.id).slice(0, 4);

  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 20px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: T.text2, fontSize: 14, fontWeight: 600, fontFamily: 'Inter,sans-serif', padding: '8px 0' }}>{ICONS.arrow_l} Marketplace</button>
          {adminMode && <AdminBtn onEdit={() => setEditOpen(true)} />}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }} className="mn-detail-grid">
          {/* Photos */}
          <div>
            <div style={{ borderRadius: 18, overflow: 'hidden', marginBottom: 10, height: 380 }}>
              <img src={`https://picsum.photos/seed/mp${item.id}main/800/700`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 70, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === 1 ? T.brand : T.border}` }}><img src={`https://picsum.photos/seed/mp${item.id}t${i}/200/150`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.background = T.surface2} /></div>)}
            </div>
          </div>
          {/* Info */}
          <div>
            <div style={{ marginBottom: 8 }}><Tag size="xs">{data.category}</Tag></div>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, color: T.text1, margin: '0 0 12px', lineHeight: 1.2, letterSpacing: '-0.03em' }}>{data.title}</h1>
            <div style={{ marginBottom: 20 }}><TokenDisplay amount={data.price_t99cp} size="xl" /></div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <Tag variant={data.condition === 'Excellent' ? 'success' : 'info'}>{data.condition}</Tag>
              <Tag>{data.location}</Tag>
            </div>
            <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.75, marginBottom: 24 }}>{data.description}</p>
            <div style={{ background: T.surface2, borderRadius: 14, padding: '16px', marginBottom: 20, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar name={data.seller} size={36} />
                <div><div style={{ fontWeight: 700, fontSize: 14, color: T.text1 }}>{data.seller}</div><div style={{ fontSize: 12, color: T.text4 }}>Vendeur vérifié · membre depuis 2025</div></div>
              </div>
              <Stars rating={4.8} count={23} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Btn full variant="gradient" size="lg" onClick={() => user ? setPayOpen(true) : onAuth()} icon={ICONS.wallet}>Acheter · <TokenDisplay amount={data.price_t99cp} size="sm" showLabel={false} /> T99CP</Btn>
              <Btn full variant="outline" size="md" onClick={() => user ? window.showToast?.(`Message envoyé à ${item.seller} — réponse par messagerie`, { type:'success', icon:'✉️' }) : onAuth()} icon={ICONS.chat}>Contacter le vendeur</Btn>
              <p style={{ fontSize: 11, color: T.text4, textAlign: 'center', margin: 0 }}>+ frais de port Polygon (Gas fees) selon poids et destination</p>
            </div>
          </div>
        </div>
        {similar.length > 0 && <>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: T.text1, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Articles similaires</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
            {similar.map(i => <MPCard key={i.id} item={i} onClick={() => { window.scrollTo(0, 0); }} adminMode={adminMode} onEdit={() => {}} />)}
          </div>
        </>}
      </div>
      <PayModal open={payOpen} onClose={() => setPayOpen(false)} amount={data.price_t99cp} item={data.title} description={`Achat auprès de ${data.seller} · ${data.location}`} seller={data.seller} hasShipping={true} />
      <EditModal open={editOpen} onClose={() => setEditOpen(false)} title="Article" data={data} onSave={f => { setData(d => ({ ...d, ...f })); onSave?.({ ...data, ...f }); }} fields={[{ key: 'title', label: 'Titre' }, { key: 'category', label: 'Catégorie' }, { key: 'price_t99cp', label: 'Prix T99CP', type: 'number' }, { key: 'condition', label: 'État', type: 'select', options: ['Excellent', 'Très bon', 'Bon'] }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'location', label: 'Lieu' }]} />
    </div>
  );
}

function MarketplacePage({ user, adminMode, onAuth }) {
  const [data, setData] = useState([...window.getUserCreations('marketplace'), ...AppData.marketplace]);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Toutes');
  const [sort, setSort] = useState('recent');
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const cats = ['Toutes', ...new Set(data.map(i => i.category))];
  let filtered = data.filter(i => (cat === 'Toutes' || i.category === cat) && (!search || i.title.toLowerCase().includes(search.toLowerCase())));
  if (sort === 'asc') filtered = [...filtered].sort((a, b) => a.price_t99cp - b.price_t99cp);
  if (sort === 'desc') filtered = [...filtered].sort((a, b) => b.price_t99cp - a.price_t99cp);
  if (detail) return <MPDetail item={detail} onBack={() => setDetail(null)} user={user} onAuth={onAuth} adminMode={adminMode} onSave={u => setData(d => d.map(i => i.id === u.id ? u : i))} />;
  return (
    <PageContainer>
      <SectionTitle label="Économie du partage" title="Marketplace" action={<Btn variant="gradient" size="sm" icon={ICONS.plus} onClick={() => user ? setCreateOpen(true) : onAuth()}>Vendre un article</Btn>} />
      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} title="Vendre un article"
        subtitle="Publie une annonce. Le prix en T99CP est environ 45% en dessous du prix euro habituel (1 T99CP = 1 €)."
        domain="marketplace" color={T.hub.marketplace}
        defaultPhoto="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=70"
        fields={[
          { id:'title',         label:'Titre de l\'article', required:true, placeholder:"Veste en jean Levi's taille M" },
          { id:'category',      label:'Catégorie', type:'select', required:true, options:['Vêtements','Mobilier','High-tech','Livres','Sport','Cuisine','Jouets','Autre'] },
          { id:'condition',     label:'État', type:'select', required:true, options:['Neuf','Excellent','Très bon','Bon','Moyen'] },
          { id:'price_t99cp',   label:'Prix en T99CP', type:'number', required:true, placeholder:'12', hint:'1 T99CP ≈ 1 €. Frais de port en € si paiement €, en gas Polygon si T99CP.' },
          { id:'description',   label:'Description', type:'textarea', rows:3, required:true, placeholder:"Acheté il y a 2 ans, peu porté..." },
          { id:'image',         label:'URL de la photo (optionnel)', type:'photo' },
        ]}
        onSubmit={item => { const enriched = { ...item, seller: user?.name || 'Vous', location: user?.location || 'France', images: [item.image].filter(Boolean), price_t99cp: +item.price_t99cp }; setData(d => [enriched, ...d]); }}
      />
      <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 220 }}><SearchInput value={search} onChange={setSearch} placeholder="Rechercher un article..." /></div>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ height: 48, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: '0 16px', fontSize: 14, fontFamily: 'Inter,sans-serif', color: T.text2, background: T.surface, outline: 'none', cursor: 'pointer' }}>
          <option value="recent">Plus récents</option><option value="asc">Prix croissant</option><option value="desc">Prix décroissant</option>
        </select>
      </div>
      <FilterTabs options={cats} active={cat} onChange={setCat} />
      {filtered.length === 0 ? <EmptyState title="Aucun article" desc="Modifiez votre recherche." /> :
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
          {filtered.map(i => <MPCard key={i.id} item={i} onClick={() => setDetail(i)} adminMode={adminMode} onEdit={() => setEditItem(i)} />)}
        </div>}
      {editItem && <EditModal open onClose={() => setEditItem(null)} title="Article" data={editItem} onSave={f => { setData(d => d.map(i => i.id === editItem.id ? { ...i, ...f } : i)); setEditItem(null); }} fields={[{ key: 'title', label: 'Titre' }, { key: 'price_t99cp', label: 'Prix T99CP', type: 'number' }, { key: 'condition', label: 'État', type: 'select', options: ['Excellent', 'Très bon', 'Bon'] }, { key: 'description', label: 'Description', type: 'textarea' }]} />}
    </PageContainer>
  );
}
window.MarketplacePage = MarketplacePage;

// ── SEL v2 ─────────────────────────────────────────────────
const SEL_CATS = { 'Bien-être': '#7C3AED', 'Formation': '#2563EB', 'Artisanat': '#D97706', 'Jardin': '#16A34A', 'Culture': '#E11D74', 'Famille': '#EA580C', 'Maison': '#374151', 'Informatique': '#0891B2', 'Social': '#DB2777' };

function SELCard({ s, onClick, adminMode, onEdit }) {
  const color = SEL_CATS[s.category] || T.brand;
  return (
    <div onClick={onClick} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 8px 28px ${color}18`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      {adminMode && <div style={{ position: 'absolute', top: 10, right: 10 }} onClick={e => { e.stopPropagation(); onEdit(); }}><AdminBtn onEdit={onEdit} /></div>}
      {s._userCreated && <div style={{ position:'absolute', top: 10, left: 10 }}><window.UserBadge /></div>}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: color, opacity: 0.7 }}></div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: T.text1, marginBottom: 4, lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.service}</div>
          <div style={{ fontSize: 12, color: T.text3, marginBottom: 10 }}>{s.provider} · {s.location}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <Tag size="xs" style={{ background: `${color}18`, color, border: 'none' }}>{s.category}</Tag>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.info }}>₮ {s.duration_min} T99CP</span>
            <span style={{ fontSize: 11, color: T.text4 }}>({s.duration_min} min)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SELDetail({ s, onBack, user, onAuth, adminMode, onSave }) {
  const [payOpen, setPayOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [data, setData] = useState(s);
  const color = SEL_CATS[s.category] || T.brand;
  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 20px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: T.text2, fontSize: 14, fontWeight: 600, fontFamily: 'Inter,sans-serif', padding: '8px 0' }}>{ICONS.arrow_l} SEL</button>
          {adminMode && <AdminBtn onEdit={() => setEditOpen(true)} />}
        </div>
        <div style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.07)' }}>
          <div style={{ background: `linear-gradient(135deg,${color},${color}bb)`, padding: '32px 28px', color: '#fff' }}>
            <Tag variant="dark" size="xs" style={{ marginBottom: 14, background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>{data.category}</Tag>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(18px,3vw,26px)', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.25 }}>{data.service}</h1>
            <div style={{ fontSize: 14, opacity: 0.85 }}>{data.provider} · {data.location}</div>
          </div>
          <div style={{ padding: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
              {[['Durée', `${data.duration_min} min`], ['Valeur SEL', `${data.duration_min} T99CP`], ['Disponible', data.available]].map(([l, v]) => (
                <div key={l} style={{ background: T.surface2, borderRadius: 14, padding: '14px', textAlign: 'center', border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{l}</div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: T.text1, fontFamily: "'Sora',sans-serif" }}>{v}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 15, color: T.text2, lineHeight: 1.75, marginBottom: 24 }}>{data.description}</p>
            <div style={{ background: `${color}10`, borderRadius: 14, padding: '16px 18px', marginBottom: 24, border: `1px solid ${color}30` }}>
              <div style={{ fontWeight: 700, fontSize: 14, color, marginBottom: 6 }}>Principe du SEL</div>
              <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.6 }}>1 minute de service = 1 T99CP. La valeur du temps est égale pour tous. 1 heure de yoga = 1 heure de plomberie = 60 T99CP.</div>
            </div>
            <Btn full variant="gradient" size="lg" onClick={() => user ? setPayOpen(true) : onAuth()} icon={ICONS.wallet}>Échanger · {data.duration_min} T99CP</Btn>
          </div>
        </div>
      </div>
      <PayModal open={payOpen} onClose={() => setPayOpen(false)} amount={data.duration_min} item={data.service} description={`Service de ${data.provider} · Durée : ${data.duration_min} minutes`} seller={data.provider} />
      <EditModal open={editOpen} onClose={() => setEditOpen(false)} title="Service SEL" data={data} onSave={f => { setData(d => ({ ...d, ...f })); onSave?.({ ...data, ...f }); }} fields={[{ key: 'service', label: 'Nom du service' }, { key: 'category', label: 'Catégorie', type: 'select', options: Object.keys(SEL_CATS) }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'duration_min', label: 'Durée (min)', type: 'number' }, { key: 'location', label: 'Lieu' }, { key: 'available', label: 'Disponibilité' }]} />
    </div>
  );
}

function SELPage({ user, adminMode, onAuth }) {
  const [data, setData] = useState([...window.getUserCreations('sel'), ...AppData.sel]);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [cat, sCat] = useState('Toutes');
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const filtered = data.filter(s => (cat === 'Toutes' || s.category === cat) && (!search || s.service.toLowerCase().includes(search.toLowerCase()) || s.provider.toLowerCase().includes(search.toLowerCase())));
  if (detail) return <SELDetail s={detail} onBack={() => setDetail(null)} user={user} onAuth={onAuth} adminMode={adminMode} onSave={u => setData(d => d.map(s => s.id === u.id ? u : s))} />;
  return (
    <PageContainer>
      <div style={{ background: T.text1, borderRadius: 20, padding: '24px 28px', marginBottom: 32, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Système d'Échange Local</div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(18px,3vw,26px)', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.03em' }}>1 minute = 1 T99CP</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Échangez vos compétences sans argent. Yoga, jardinage, plomberie, cours... chaque minute a la même valeur.</p>
        </div>
        <Btn variant="white" size="md" onClick={() => user ? setCreateOpen(true) : onAuth()} icon={ICONS.plus}>Proposer un service</Btn>
      </div>
      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} title="Proposer un service SEL"
        subtitle="1 minute de service = 1 T99CP. Toutes les heures se valent."
        domain="sel" color={T.hub.sel}
        defaultPhoto="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=70"
        fields={[
          { id:'service',      label:'Nom du service', required:true, placeholder:"Cours de guitare débutant" },
          { id:'category',     label:'Catégorie', type:'select', required:true, options:Object.keys(SEL_CATS) },
          { id:'duration_min', label:'Durée d\'une séance (en minutes)', type:'number', required:true, placeholder:'60', hint:'1 séance de 60 min = 60 T99CP' },
          { id:'location',     label:'Lieu', required:true, placeholder:"Chez moi · Paris 11e · Visio" },
          { id:'description',  label:'Description', type:'textarea', rows:3, required:true, placeholder:"Je joue depuis 15 ans, j'enseigne aux débutant·es..." },
          { id:'available',    label:'Disponibilité', placeholder:"Soirs en semaine · weekend" },
        ]}
        onSubmit={item => { const enriched = { ...item, provider: user?.name || 'Vous', rating: 0, reviews_count: 0, duration_min: +item.duration_min }; setData(d => [enriched, ...d]); }}
      />
      <SearchInput value={search} onChange={setSearch} placeholder="Yoga, plomberie, anglais, guitare..." />
      <FilterTabs options={['Toutes', ...Object.keys(SEL_CATS)]} active={cat} onChange={sCat} />
      {filtered.length === 0 ? <EmptyState title="Aucun service" desc="Essayez d'autres mots-clés." /> :
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
          {filtered.map(s => <SELCard key={s.id} s={s} onClick={() => setDetail(s)} adminMode={adminMode} onEdit={() => setEditItem(s)} />)}
        </div>}
      {editItem && <EditModal open onClose={() => setEditItem(null)} title="Service SEL" data={editItem} onSave={f => { setData(d => d.map(s => s.id === editItem.id ? { ...s, ...f } : s)); setEditItem(null); }} fields={[{ key: 'service', label: 'Nom' }, { key: 'category', label: 'Catégorie', type: 'select', options: Object.keys(SEL_CATS) }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'duration_min', label: 'Durée min', type: 'number' }, { key: 'location', label: 'Lieu' }]} />}
    </PageContainer>
  );
}
window.SELPage = SELPage;

// ── CROWDFUNDING v3 ────────────────────────────────────────
// Page Cagnottes : hero + stats + filtres + vedette + grille +
// page détail (story / utilisation des fonds / équipe / news)
const CF_CATEGORIES = ['Toutes', 'Luttes', 'Solidaires', 'Participatif', 'Grandes Caisses'];
const CF_CAT_VARIANT = { 'Luttes': 'brand', 'Solidaires': 'success', 'Participatif': 'info', 'Grandes Caisses': 'warning' };
const CF_SORTS = [
  { id: 'recent',  label: 'Plus récentes' },
  { id: 'urgent',  label: 'Urgentes (fin proche)' },
  { id: 'progress',label: '% le plus avancé' },
  { id: 'amount',  label: 'Plus gros montants' },
];

// Statut dynamique : pct >= 100 → 'won' / days_left <= 0 → 'closed' / sinon 'active'
const cfStatus = (c) => {
  const pct = c.raised_t99cp / c.goal_t99cp;
  if (pct >= 1) return { id: 'won',    label: '✨ Atteint',  variant: 'gradient' };
  if (c.days_left <= 0) return { id: 'closed', label: 'Clôturée', variant: 'warning' };
  return null;
};

// Carte mini (grille)
function CFCard({ c, onClick, adminMode, onEdit }) {
  const pct = Math.min(100, Math.round(c.raised_t99cp / c.goal_t99cp * 100));
  const urgent = c.days_left > 0 && c.days_left <= 14;
  const status = cfStatus(c);
  return (
    <a href={`#cagnottes/${c.id}`} onClick={e => { e.preventDefault(); onClick?.(); }} className="mn-card-hover"
      aria-label={`${c.title} — ${pct}% atteint`}
      style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, overflow: 'hidden', position: 'relative', display: 'block', textDecoration: 'none', color: 'inherit', transition: 'all 0.22s' }}>
      {adminMode && <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 3 }} onClick={e => { e.stopPropagation(); e.preventDefault(); onEdit(); }}><AdminBtn onEdit={onEdit} /></div>}
      {c._userCreated && <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 3 }}><window.UserBadge /></div>}
      <div style={{ height: 170, position: 'relative', overflow: 'hidden', background: T.text1 }}>
        {c.cover && <img src={c.cover} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92 }} onError={e => e.target.style.display = 'none'} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%)' }}></div>
        <div style={{ position:'absolute', top:12, right:12, display:'flex', gap:6 }}>
          {status && <Tag variant={status.variant} size="xs">{status.label}</Tag>}
          {!status && urgent && <span style={{ padding:'4px 9px', borderRadius:9999, background:'#FEE2E2', color:'#DC2626', fontSize:10, fontWeight:800, letterSpacing:'0.05em' }}>⏰ {c.days_left}J</span>}
        </div>
        <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
          <Tag variant={CF_CAT_VARIANT[c.category] || 'default'}>{c.category}</Tag>
          <span style={{ fontSize:11, color:'#fff', fontWeight:700, background:'rgba(0,0,0,0.5)', padding:'4px 8px', borderRadius:9999 }}>{pct}%</span>
        </div>
      </div>
      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:11, color:T.text3 }}>
          <span style={{ width:22, height:22, borderRadius:'50%', background:`${T.hub.crowdfunding}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>{c.organizer_avatar || '🤝'}</span>
          <span style={{ fontWeight:600 }}>{c.organizer}</span>
        </div>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: T.text1, margin: '0 0 8px', lineHeight: 1.35, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{c.title}</h3>
        <p style={{ fontSize: 12, color: T.text3, margin: '0 0 14px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
        <ProgressBar value={c.raised_t99cp} max={c.goal_t99cp} height={6} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.text3, margin: '10px 0 0', flexWrap: 'wrap', gap: 4 }}>
          <span><strong style={{ color: T.hub.crowdfunding, fontSize: 13 }}>{c.raised_t99cp.toLocaleString('fr-FR')} T99CP</strong> / {c.goal_t99cp.toLocaleString('fr-FR')}</span>
          <span>{c.contributors} contributeur·ices</span>
        </div>
      </div>
    </a>
  );
}

// Carte vedette (large, format paysage)
function CFFeaturedCard({ c, onClick }) {
  const pct = Math.min(100, Math.round(c.raised_t99cp / c.goal_t99cp * 100));
  const status = cfStatus(c);
  return (
    <a href={`#cagnottes/${c.id}`} onClick={e => { e.preventDefault(); onClick?.(); }} className="mn-card-hover"
      aria-label={`${c.title} — vedette, ${pct}% atteint`}
      style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, overflow: 'hidden', display:'grid', gridTemplateColumns:'minmax(0, 1.2fr) minmax(0, 1fr)', minHeight: 280, transition: 'all 0.25s', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ position:'relative', minHeight:240, overflow:'hidden', background:T.text1 }}>
        {c.cover && <img src={c.cover} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92 }} onError={e => e.target.style.display = 'none'} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent 60%)' }}></div>
        <div style={{ position:'absolute', top:14, left:14, padding:'5px 11px', borderRadius:9999, background:'rgba(0,0,0,0.55)', color:'#fff', fontSize:10, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase' }}>★ Vedette</div>
        <div style={{ position:'absolute', top:14, right:14, display:'flex', gap:6 }}>
          {status && <Tag variant={status.variant} size="xs">{status.label}</Tag>}
        </div>
        <div style={{ position:'absolute', bottom:14, left:14 }}><Tag variant={CF_CAT_VARIANT[c.category] || 'default'}>{c.category}</Tag></div>
      </div>
      <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, fontSize:11, color:T.text3 }}>
            <span style={{ width:24, height:24, borderRadius:'50%', background:`${T.hub.crowdfunding}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>{c.organizer_avatar}</span>
            <span style={{ fontWeight:700 }}>{c.organizer}</span>
          </div>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:T.text1, margin:'0 0 10px', lineHeight:1.25 }}>{c.title}</h3>
          <p style={{ fontSize:13, color:T.text3, margin:0, lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{c.description}</p>
        </div>
        <div style={{ marginTop:18 }}>
          <ProgressBar value={c.raised_t99cp} max={c.goal_t99cp} height={8} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginTop:10, gap:6, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontSize:18, fontWeight:800, color:T.hub.crowdfunding, fontFamily:"'Sora',sans-serif" }}>{c.raised_t99cp.toLocaleString('fr-FR')} T99CP</div>
              <div style={{ fontSize:11, color:T.text3 }}>sur {c.goal_t99cp.toLocaleString('fr-FR')} · <strong style={{ color:T.text2 }}>{pct}%</strong></div>
            </div>
            <div style={{ textAlign:'right', fontSize:11, color:T.text3 }}>
              <div><strong style={{ color:T.text2, fontSize:13 }}>{c.contributors}</strong> contributeur·ices</div>
              {c.days_left > 0 && <div>⏰ {c.days_left} jours restants</div>}
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

// Page détail — onglets : Projet · Fonds · Équipe · Mises à jour
function CFDetailPage({ c, user, onBack, onContribute, onSelectCagnotte, adminMode, onEdit }) {
  const [tab, setTab] = useState('story');
  const [contribAmount, setContribAmount] = useState(20);
  const [shareOpen, setShareOpen] = useState(false);
  if (!c) return null;
  const pct = Math.min(100, Math.round(c.raised_t99cp / c.goal_t99cp * 100));
  const totalAlloc = (c.fundUsage || []).reduce((s, f) => s + f.amount, 0);
  const status = cfStatus(c);
  const past = c.days_left <= 0;
  const permalink = (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '') + '#cagnottes/' + c.id;
  const similar = (window.AppData?.crowdfunding || [])
    .filter(o => o.id !== c.id && (o.category === c.category || o.organizer === c.organizer))
    .slice(0, 3);
  const tabs = [
    { id:'story',  label:'Le projet',          icon:'📖' },
    { id:'funds',  label:'Utilisation des fonds', icon:'💰' },
    { id:'team',   label:'L\'équipe',           icon:'👥' },
    { id:'updates',label:'Mises à jour',         icon:'🔔', count: c.updates?.length || 0 },
  ];

  return (
    <div style={{ background: T.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px 20px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={onBack} aria-label="Retour à la liste des cagnottes" style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: T.text2, fontSize: 14, fontWeight: 600, fontFamily: 'Inter,sans-serif', padding: '8px 0' }}>{ICONS.arrow_l} Cagnottes</button>
          {adminMode && <AdminBtn onEdit={onEdit} />}
        </div>

        <div style={{ background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
          {/* Cover */}
          <div style={{ height:240, position:'relative', overflow:'hidden', background: T.text1 }}>
            {c.cover && <img src={c.cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity: 0.92 }} onError={e => e.target.style.display='none'} />}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.85), transparent 50%)' }}></div>
            <div style={{ position:'absolute', bottom:18, left:24, right:24, color:'#fff' }}>
              <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
                <Tag variant={CF_CAT_VARIANT[c.category] || 'default'}>{c.category}</Tag>
                {status && <Tag variant={status.variant} size="xs">{status.label}</Tag>}
                {c.featured && <span style={{ padding:'4px 10px', borderRadius:9999, background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:10, fontWeight:800, letterSpacing:'0.06em' }}>★ VEDETTE</span>}
              </div>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, margin:'0 0 6px', lineHeight:1.25 }}>{c.title}</h2>
              <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
                <span style={{ width:24, height:24, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>{c.organizer_avatar}</span>
                <span style={{ fontWeight:600 }}>{c.organizer}</span>
              </div>
            </div>
          </div>

        {/* Stats bar */}
        <div style={{ padding:'20px 28px', borderBottom:`1px solid ${T.border}`, background:T.surface2 }}>
          <ProgressBar value={c.raised_t99cp} max={c.goal_t99cp} height={10} />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginTop:14 }}>
            <div><div style={{ fontSize:18, fontWeight:800, color:T.hub.crowdfunding, fontFamily:"'Sora',sans-serif" }}>{c.raised_t99cp.toLocaleString('fr-FR')}</div><div style={{ fontSize:10, color:T.text3, textTransform:'uppercase', letterSpacing:'0.06em' }}>T99CP collectés</div></div>
            <div><div style={{ fontSize:18, fontWeight:800, color:T.text1, fontFamily:"'Sora',sans-serif" }}>{c.goal_t99cp.toLocaleString('fr-FR')}</div><div style={{ fontSize:10, color:T.text3, textTransform:'uppercase', letterSpacing:'0.06em' }}>objectif</div></div>
            <div><div style={{ fontSize:18, fontWeight:800, color:T.text1, fontFamily:"'Sora',sans-serif" }}>{c.contributors}</div><div style={{ fontSize:10, color:T.text3, textTransform:'uppercase', letterSpacing:'0.06em' }}>contributeur·ices</div></div>
            <div><div style={{ fontSize:18, fontWeight:800, color: past ? T.text3 : (c.days_left <= 14 ? '#DC2626' : T.text1), fontFamily:"'Sora',sans-serif" }}>{past ? '—' : `${c.days_left}j`}</div><div style={{ fontSize:10, color:T.text3, textTransform:'uppercase', letterSpacing:'0.06em' }}>{past ? 'terminée' : 'restants'}</div></div>
          </div>
          {/* Paliers */}
          {c.milestones && (
            <div style={{ marginTop:18, padding:'14px 16px', background:T.surface, borderRadius:12, border:`1px solid ${T.border}` }}>
              <div style={{ fontSize:10, color:T.text3, textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:700, marginBottom:10 }}>Paliers</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10 }}>
                {c.milestones.map((m,i) => (
                  <div key={i} style={{ padding:'10px 8px', borderRadius:10, background: m.reached ? `${T.hub.crowdfunding}15` : T.surface2, border: m.reached ? `1.5px solid ${T.hub.crowdfunding}` : `1px solid ${T.border}`, textAlign:'center' }}>
                    <div style={{ fontSize:16, fontWeight:800, color: m.reached ? T.hub.crowdfunding : T.text3, fontFamily:"'Sora',sans-serif" }}>{m.percent}%</div>
                    <div style={{ fontSize:10, color: m.reached ? T.text2 : T.text3, marginTop:3, lineHeight:1.3 }}>{m.label}</div>
                    {m.reached && <div style={{ fontSize:10, color:T.hub.crowdfunding, marginTop:3, fontWeight:700 }}>✓ Atteint</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, padding:'0 28px', borderBottom:`1px solid ${T.border}`, overflowX:'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:'14px 18px', border:'none', background:'transparent', cursor:'pointer', fontSize:13, fontWeight:tab===t.id ? 700 : 500, color: tab===t.id ? T.hub.crowdfunding : T.text3, borderBottom: tab===t.id ? `2px solid ${T.hub.crowdfunding}` : '2px solid transparent', fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:7 }}>
              <span>{t.icon}</span>{t.label}{t.count !== undefined && t.count > 0 && <span style={{ fontSize:10, padding:'2px 6px', borderRadius:9999, background: tab===t.id ? T.hub.crowdfunding : T.border, color: tab===t.id ? '#fff' : T.text3, fontWeight:700 }}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding:'24px 28px', maxHeight:420, overflowY:'auto' }}>
          {tab === 'story' && (
            <div style={{ fontSize:14, color:T.text2, lineHeight:1.7, whiteSpace:'pre-line' }}>
              {c.story || c.description}
            </div>
          )}

          {tab === 'funds' && (
            <div>
              <div style={{ fontSize:13, color:T.text3, marginBottom:18, lineHeight:1.6 }}>
                Voici comment seront utilisés les <strong style={{ color:T.hub.crowdfunding }}>{c.goal_t99cp.toLocaleString('fr-FR')} T99CP</strong> demandés. Détail transparent ligne par ligne.
              </div>
              {/* Barre allocation visuelle */}
              <div style={{ display:'flex', height:14, borderRadius:9999, overflow:'hidden', marginBottom:18, border:`1px solid ${T.border}` }}>
                {(c.fundUsage || []).map((f,i) => (
                  <div key={i} title={`${f.label} : ${f.amount}`} style={{ background:f.color, width:`${f.amount/totalAlloc*100}%` }}></div>
                ))}
              </div>
              {/* Lignes détail */}
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {(c.fundUsage || []).map((f,i) => {
                  const pctFund = (f.amount / totalAlloc * 100).toFixed(1);
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:T.surface2, borderRadius:10, border:`1px solid ${T.border}` }}>
                      <div style={{ width:8, height:36, borderRadius:4, background:f.color, flexShrink:0 }}></div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, color:T.text1, fontWeight:600 }}>{f.label}</div>
                        <div style={{ fontSize:11, color:T.text3, marginTop:2 }}>{pctFund}% du budget total</div>
                      </div>
                      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:f.color }}>{f.amount.toLocaleString('fr-FR')} T</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop:14, padding:'10px 14px', background:T.surface2, borderRadius:8, fontSize:11, color:T.text3, fontStyle:'italic', lineHeight:1.5 }}>
                ⓘ Bilan d'utilisation publié dans la rubrique « Mises à jour » à mesure que les fonds sont engagés.
              </div>
            </div>
          )}

          {tab === 'team' && (
            <div>
              <div style={{ fontSize:13, color:T.text3, marginBottom:18, lineHeight:1.6 }}>
                {c.team?.length || 0} personne{(c.team?.length||0) > 1 ? 's' : ''} portent ce projet.
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:14 }}>
                {(c.team || []).map((m,i) => (
                  <div key={i} style={{ padding:'16px', background:T.surface2, borderRadius:14, border:`1px solid ${T.border}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                      <div style={{ width:46, height:46, borderRadius:'50%', background:`linear-gradient(135deg, ${T.hub.crowdfunding}, #DC2654)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14, fontFamily:"'Sora',sans-serif", flexShrink:0 }}>{m.avatar}</div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:T.text1, fontFamily:"'Sora',sans-serif" }}>{m.name}</div>
                        <div style={{ fontSize:11, color:T.hub.crowdfunding, fontWeight:600 }}>{m.role}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:T.text3, lineHeight:1.5 }}>{m.bio}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'updates' && (
            <div>
              {(c.updates || []).length === 0 ? (
                <div style={{ padding:'40px 20px', textAlign:'center', color:T.text3, fontSize:13 }}>Aucune mise à jour pour l'instant.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {(c.updates || []).map((u,i) => (
                    <div key={i} style={{ padding:'16px 18px', background:T.surface2, borderRadius:12, border:`1px solid ${T.border}`, borderLeft:`3px solid ${T.hub.crowdfunding}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                        <div style={{ fontSize:14, fontWeight:700, color:T.text1, fontFamily:"'Sora',sans-serif" }}>{u.title}</div>
                        <div style={{ fontSize:11, color:T.text3, fontWeight:500 }}>{new Date(u.date).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}</div>
                      </div>
                      <div style={{ fontSize:13, color:T.text2, lineHeight:1.6 }}>{u.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer contribution */}
        <div style={{ padding:'18px 28px', borderTop:`1px solid ${T.border}`, background:T.surface2 }}>
          {past ? (
            <div style={{ textAlign:'center', padding:'8px 0' }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15, color:T.text2, marginBottom:4 }}>Cagnotte clôturée</div>
              <div style={{ fontSize:13, color:T.text3 }}>Cette collecte n'accepte plus de contributions. Merci aux {c.contributors} contributeur·ices.</div>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:12 }}>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ fontSize:11, color:T.text3, marginBottom:6 }}>Ta contribution (T99CP)</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {[5, 10, 20, 50, 100].map(v => (
                      <button key={v} onClick={() => setContribAmount(v)} style={{ padding:'8px 12px', borderRadius:8, border:`1.5px solid ${contribAmount===v ? T.hub.crowdfunding : T.border}`, background: contribAmount===v ? `${T.hub.crowdfunding}15` : T.surface, color: contribAmount===v ? T.hub.crowdfunding : T.text2, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>{v}</button>
                    ))}
                    <input type="number" value={contribAmount} onChange={e => setContribAmount(+e.target.value || 0)} min="1" style={{ width:80, height:34, border:`1.5px solid ${T.border}`, borderRadius:8, padding:'0 10px', fontSize:13, color:T.text1, background:T.surface, outline:'none', textAlign:'center' }} />
                  </div>
                </div>
                <Btn variant="gradient" size="md" icon={ICONS.wallet} onClick={() => onContribute(c, contribAmount)}>Contribuer · {contribAmount} T99CP</Btn>
              </div>
              <div style={{ fontSize:11, color:T.text4, lineHeight:1.5 }}>
                Paiement T99CP avec alternative euros. Le bénéficiaire reçoit ses fonds sous 24h. Aucune commission, 100 % redistribué.
              </div>
            </>
          )}
          <div style={{ display:'flex', gap:8, marginTop:14, paddingTop:14, borderTop:`1px solid ${T.border}` }}>
            <Btn full variant="ghost" size="sm" icon={ICONS.share} onClick={() => setShareOpen(true)}>Partager cette cagnotte</Btn>
          </div>
        </div>
      </div>

      {/* Bloc « Cagnottes similaires » */}
      {similar.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>D'autres cagnottes qui pourraient t'intéresser</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {similar.map(o => <CFCard key={o.id} c={o} onClick={() => onSelectCagnotte?.(o)} />)}
          </div>
        </div>
      )}
    </div>

    {/* FAB mobile */}
    {!past && (
      <div className="mn-detail-fab">
        <Btn full variant="gradient" size="lg" icon={ICONS.wallet} onClick={() => onContribute(c, contribAmount)}>Contribuer · {contribAmount} T99CP</Btn>
      </div>
    )}

    <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} title={c.title} url={permalink} text={`${c.title} — Cagnotte solidaire sur Maintenant !`} />
  </div>
  );
}

// Modal de création multi-sections (titre, présentation, fonds, équipe)
function CFCreateModal({ open, onClose, onSubmit, user }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title:'', category:'Luttes', goal_t99cp:'', days_left:'30',
    description:'', story:'',
    fundUsage: [{ label:'', amount:'', color:'#DC2654' }],
    team:     [{ name: user?.name || '', role:'Porteur·euse principal·e', bio:'', avatar:(user?.name||'')[0]?.toUpperCase() || 'U' }],
  });
  const reset = () => { setStep(1); setForm({ title:'', category:'Luttes', goal_t99cp:'', days_left:'30', description:'', story:'', fundUsage:[{label:'',amount:'',color:'#DC2654'}], team:[{name:user?.name||'',role:'Porteur·euse principal·e',bio:'',avatar:(user?.name||'')[0]?.toUpperCase()||'U'}] }); };
  if (!open) return null;
  const COLORS_PALETTE = ['#DC2654', '#7C3AED', '#16A34A', '#F59E0B', '#0891B2', '#A21CAF'];
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setUsage = (i, k, v) => setForm(f => ({ ...f, fundUsage: f.fundUsage.map((u, idx) => idx === i ? { ...u, [k]: v } : u) }));
  const addUsage = () => setForm(f => ({ ...f, fundUsage: [...f.fundUsage, { label:'', amount:'', color: COLORS_PALETTE[f.fundUsage.length % COLORS_PALETTE.length] }] }));
  const delUsage = (i) => setForm(f => ({ ...f, fundUsage: f.fundUsage.filter((_, idx) => idx !== i) }));
  const setTeam = (i, k, v) => setForm(f => ({ ...f, team: f.team.map((m, idx) => idx === i ? { ...m, [k]: v, ...(k === 'name' ? { avatar: v[0]?.toUpperCase() || '?' } : {}) } : m) }));
  const addTeam = () => setForm(f => ({ ...f, team: [...f.team, { name:'', role:'', bio:'', avatar:'?' }] }));
  const delTeam = (i) => setForm(f => ({ ...f, team: f.team.filter((_, idx) => idx !== i) }));

  const stepValid = () => {
    if (step === 1) return form.title && form.category && form.goal_t99cp && form.days_left;
    if (step === 2) return form.description && form.story;
    if (step === 3) return form.fundUsage.length > 0 && form.fundUsage.every(u => u.label && u.amount);
    if (step === 4) return form.team.length > 0 && form.team.every(m => m.name && m.role);
    return true;
  };
  const submit = () => {
    const enriched = {
      id: Date.now(),
      ...form,
      organizer: user?.name || 'Vous',
      organizer_avatar: '🤝',
      raised_t99cp: 0, contributors: 0, featured: false,
      goal_t99cp: +form.goal_t99cp,
      days_left: +form.days_left,
      fundUsage: form.fundUsage.map(u => ({ ...u, amount: +u.amount })),
      milestones: [
        { percent: 25, label: "Premier palier", reached: false },
        { percent: 50, label: "Mi-parcours",     reached: false },
        { percent: 75, label: "Quasi-bouclage",  reached: false },
        { percent: 100,label: "Objectif atteint",reached: false },
      ],
      updates: [{ date: new Date().toISOString().slice(0,10), title:'🚀 Cagnotte lancée', content:`Merci de votre soutien — la collecte commence aujourd'hui pour ${form.days_left} jours.` }],
      _userCreated: true,
    };
    onSubmit(enriched);
    reset(); onClose();
  };

  const STEPS = [
    { id:1, title:'L\'essentiel',         icon:'📝' },
    { id:2, title:'Présenter le projet',  icon:'📖' },
    { id:3, title:'Utilisation des fonds', icon:'💰' },
    { id:4, title:'L\'équipe',             icon:'👥' },
  ];

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', zIndex:1500, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'40px 16px', overflowY:'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.surface, borderRadius:24, maxWidth:760, width:'100%', overflow:'hidden', boxShadow:'0 30px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ padding:'22px 28px', background:`linear-gradient(135deg, ${T.hub.crowdfunding}15, #FDE9F2)`, borderBottom:`1px solid ${T.border}`, position:'relative' }}>
          <button onClick={onClose} style={{ position:'absolute', top:14, right:14, width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.9)', border:'none', cursor:'pointer', fontSize:18, color:'#333', fontWeight:700 }}>×</button>
          <div style={{ fontSize:11, fontWeight:700, color:T.hub.crowdfunding, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Nouvelle cagnotte</div>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:T.text1, margin:0 }}>Lance ta collecte solidaire</h2>
        </div>

        {/* Stepper */}
        <div style={{ display:'flex', padding:'18px 28px', background:T.surface2, borderBottom:`1px solid ${T.border}`, gap:8, overflowX:'auto' }}>
          {STEPS.map((s, idx) => (
            <div key={s.id} onClick={() => stepValid() && setStep(s.id)} style={{ flex:1, minWidth:140, padding:'10px 12px', borderRadius:10, background: step===s.id ? T.hub.crowdfunding : (s.id < step ? `${T.hub.crowdfunding}20` : T.surface), color: step===s.id ? '#fff' : (s.id < step ? T.hub.crowdfunding : T.text3), cursor: 'pointer', display:'flex', alignItems:'center', gap:8, transition:'all 0.18s', border: step===s.id ? 'none' : `1px solid ${T.border}` }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background: step===s.id ? 'rgba(255,255,255,0.2)' : (s.id < step ? T.hub.crowdfunding : T.surface2), color: step===s.id || s.id < step ? '#fff' : T.text3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, flexShrink:0 }}>{s.id < step ? '✓' : s.id}</div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:11, opacity:0.85, marginBottom:1 }}>Étape {s.id}</div>
                <div style={{ fontSize:12, fontWeight:700, fontFamily:"'Sora',sans-serif", whiteSpace:'nowrap' }}>{s.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div style={{ padding:'24px 28px', maxHeight:480, overflowY:'auto' }}>
          {step === 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:T.text2, marginBottom:6, display:'block' }}>Titre de la cagnotte *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Caisse de grève cheminot·es PACA" style={{ width:'100%', height:42, padding:'0 14px', border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:14, color:T.text1, background:T.surface, outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:T.text2, marginBottom:6, display:'block' }}>Catégorie *</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} style={{ width:'100%', height:42, padding:'0 12px', border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:14, color:T.text1, background:T.surface, outline:'none', fontFamily:'Inter,sans-serif' }}>
                    {['Luttes','Solidaires','Participatif','Grandes Caisses'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:T.text2, marginBottom:6, display:'block' }}>Objectif T99CP *</label>
                  <input type="number" value={form.goal_t99cp} onChange={e => set('goal_t99cp', e.target.value)} placeholder="5000" style={{ width:'100%', height:42, padding:'0 14px', border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:14, color:T.text1, background:T.surface, outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:T.text2, marginBottom:6, display:'block' }}>Durée (jours) *</label>
                  <input type="number" value={form.days_left} onChange={e => set('days_left', e.target.value)} placeholder="30" style={{ width:'100%', height:42, padding:'0 14px', border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:14, color:T.text1, background:T.surface, outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box' }} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:T.text2, marginBottom:6, display:'block' }}>Pitch court (1-2 phrases) *</label>
                <div style={{ fontSize:11, color:T.text3, marginBottom:6 }}>Ce qui apparaîtra sur la carte de la cagnotte.</div>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Soutien aux cheminot·es grévistes pendant les négociations salariales." style={{ width:'100%', padding:'10px 14px', border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:14, color:T.text1, background:T.surface, outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box', resize:'vertical', lineHeight:1.5 }} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:T.text2, marginBottom:6, display:'block' }}>Présentation détaillée du projet *</label>
                <div style={{ fontSize:11, color:T.text3, marginBottom:6 }}>Raconte : le contexte, l'urgence, la portée. Sois concret·e — c'est ce qui convaincra les contributeur·ices.</div>
                <textarea value={form.story} onChange={e => set('story', e.target.value)} rows={8} placeholder="Depuis le 15 mars, plus de 400 cheminot·es sont en grève reconductible..." style={{ width:'100%', padding:'12px 14px', border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:13, color:T.text1, background:T.surface, outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box', resize:'vertical', lineHeight:1.6 }} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ marginBottom:14, padding:'12px 14px', background:`${T.hub.crowdfunding}10`, borderRadius:10, fontSize:12, color:T.text2, lineHeight:1.5 }}>
                💰 <strong>Détaille à quoi serviront les fonds.</strong> Plus c'est précis, plus tu inspires confiance. Total cible : <strong style={{ color:T.hub.crowdfunding }}>{form.goal_t99cp || 0} T99CP</strong>.
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {form.fundUsage.map((u, i) => (
                  <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'12px', background:T.surface2, borderRadius:10, border:`1px solid ${T.border}` }}>
                    <div style={{ width:8, height:38, borderRadius:4, background:u.color, flexShrink:0, marginTop:2 }}></div>
                    <input value={u.label} onChange={e => setUsage(i, 'label', e.target.value)} placeholder="Ex : Honoraires avocats" style={{ flex:1, height:38, padding:'0 12px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, color:T.text1, background:T.surface, outline:'none', fontFamily:'Inter,sans-serif', minWidth:0 }} />
                    <input type="number" value={u.amount} onChange={e => setUsage(i, 'amount', e.target.value)} placeholder="T99CP" style={{ width:100, height:38, padding:'0 12px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, color:T.text1, background:T.surface, outline:'none', fontFamily:'Inter,sans-serif', textAlign:'right' }} />
                    <select value={u.color} onChange={e => setUsage(i, 'color', e.target.value)} style={{ width:50, height:38, border:`1px solid ${T.border}`, borderRadius:8, background:u.color, color:'#fff', fontSize:11, outline:'none' }}>
                      {COLORS_PALETTE.map(c => <option key={c} value={c} style={{ background:'#fff', color:'#000' }}>●</option>)}
                    </select>
                    {form.fundUsage.length > 1 && <button onClick={() => delUsage(i)} style={{ width:38, height:38, border:`1px solid ${T.border}`, borderRadius:8, background:T.surface, color:T.text3, cursor:'pointer', fontSize:16, fontWeight:700 }}>×</button>}
                  </div>
                ))}
              </div>
              <button onClick={addUsage} style={{ marginTop:10, width:'100%', padding:'10px', borderRadius:10, border:`1.5px dashed ${T.border}`, background:'transparent', color:T.text3, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>+ Ajouter une ligne d'utilisation</button>
              <div style={{ marginTop:14, padding:'10px 14px', background:T.surface2, borderRadius:8, fontSize:12, color:T.text3, display:'flex', justifyContent:'space-between' }}>
                <span>Total alloué :</span>
                <strong style={{ color: form.fundUsage.reduce((s,u) => s + (+u.amount||0), 0) === +form.goal_t99cp ? T.hub.crowdfunding : '#F59E0B' }}>{form.fundUsage.reduce((s,u) => s + (+u.amount||0), 0).toLocaleString('fr-FR')} / {(+form.goal_t99cp).toLocaleString('fr-FR')} T99CP</strong>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={{ marginBottom:14, padding:'12px 14px', background:`${T.hub.crowdfunding}10`, borderRadius:10, fontSize:12, color:T.text2, lineHeight:1.5 }}>
                👥 <strong>Présente les personnes derrière le projet.</strong> Une équipe identifiée rassure les contributeur·ices.
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {form.team.map((m, i) => (
                  <div key={i} style={{ padding:'14px', background:T.surface2, borderRadius:10, border:`1px solid ${T.border}`, position:'relative' }}>
                    {form.team.length > 1 && <button onClick={() => delTeam(i)} style={{ position:'absolute', top:8, right:8, width:26, height:26, border:'none', borderRadius:'50%', background:T.surface, color:T.text3, cursor:'pointer', fontSize:14 }}>×</button>}
                    <div style={{ display:'flex', gap:10, marginBottom:8 }}>
                      <div style={{ width:42, height:42, borderRadius:'50%', background:`linear-gradient(135deg, ${T.hub.crowdfunding}, #DC2654)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14, fontFamily:"'Sora',sans-serif", flexShrink:0 }}>{m.avatar}</div>
                      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        <input value={m.name} onChange={e => setTeam(i, 'name', e.target.value)} placeholder="Nom complet" style={{ height:36, padding:'0 12px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, color:T.text1, background:T.surface, outline:'none', fontFamily:'Inter,sans-serif', minWidth:0 }} />
                        <input value={m.role} onChange={e => setTeam(i, 'role', e.target.value)} placeholder="Rôle dans le projet" style={{ height:36, padding:'0 12px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, color:T.text1, background:T.surface, outline:'none', fontFamily:'Inter,sans-serif', minWidth:0 }} />
                      </div>
                    </div>
                    <textarea value={m.bio} onChange={e => setTeam(i, 'bio', e.target.value)} rows={2} placeholder="Bio courte : expérience, ce qu'iel apporte au projet…" style={{ width:'100%', padding:'8px 12px', border:`1px solid ${T.border}`, borderRadius:8, fontSize:12, color:T.text1, background:T.surface, outline:'none', fontFamily:'Inter,sans-serif', resize:'vertical', boxSizing:'border-box', lineHeight:1.5 }} />
                  </div>
                ))}
              </div>
              <button onClick={addTeam} style={{ marginTop:10, width:'100%', padding:'10px', borderRadius:10, border:`1.5px dashed ${T.border}`, background:'transparent', color:T.text3, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>+ Ajouter un·e membre d'équipe</button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div style={{ display:'flex', justifyContent:'space-between', padding:'18px 28px', borderTop:`1px solid ${T.border}`, background:T.surface2 }}>
          <Btn variant="ghost" size="md" onClick={() => step > 1 ? setStep(step - 1) : onClose()}>{step > 1 ? '← Précédent' : 'Annuler'}</Btn>
          {step < 4
            ? <Btn variant="gradient" size="md" disabled={!stepValid()} onClick={() => setStep(step + 1)}>Suivant →</Btn>
            : <Btn variant="gradient" size="md" disabled={!stepValid()} onClick={submit} icon="🚀">Lancer la cagnotte</Btn>
          }
        </div>
      </div>
    </div>
  );
}

function CrowdfundingPage({ user, adminMode, onAuth }) {
  const [data, setData] = useState([...window.getUserCreations('crowdfunding'), ...AppData.crowdfunding]);
  const [payItem, setPayItem] = useState(null);
  const [amount, setAmount] = useState(20);
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [cat, setCat] = useState('Toutes');
  const [sort, setSort] = useState('recent');
  const [search, setSearch] = useState('');

  // Stats globales (calcul sur les cagnottes actives)
  const stats = data.reduce((acc, c) => ({
    raised: acc.raised + c.raised_t99cp,
    contributors: acc.contributors + c.contributors,
    active: acc.active + (c.days_left > 0 ? 1 : 0),
  }), { raised:0, contributors:0, active:0 });

  // Filtre + tri
  const q = search.trim().toLowerCase();
  let filtered = data.filter(c => {
    const ms = !q || [c.title, c.description, c.organizer, c.category, c.story]
      .some(s => typeof s === 'string' && s.toLowerCase().includes(q));
    const mc = cat === 'Toutes' || c.category === cat;
    return ms && mc;
  });
  if (sort === 'urgent')   filtered.sort((a,b) => a.days_left - b.days_left);
  if (sort === 'progress') filtered.sort((a,b) => (b.raised_t99cp/b.goal_t99cp) - (a.raised_t99cp/a.goal_t99cp));
  if (sort === 'amount')   filtered.sort((a,b) => b.raised_t99cp - a.raised_t99cp);

  // Vedettes filtrées par la même catégorie active
  const featured = filtered.filter(c => c.featured).slice(0, 3);

  const handleContribute = (c, amt) => {
    if (!user) { onAuth(); return; }
    setAmount(amt); setPayItem(c);
  };

  if (detail) return (
    <CFDetailPage
      c={detail}
      user={user}
      onBack={() => setDetail(null)}
      onContribute={handleContribute}
      onSelectCagnotte={cf => setDetail(cf)}
      adminMode={adminMode}
      onEdit={() => setEditItem(detail)}
    />
  );

  return (
    <PageContainer>
      {/* HERO avec stats */}
      <div style={{ background:`linear-gradient(135deg, ${T.hub.crowdfunding} 0%, #BE185D 100%)`, borderRadius:24, padding:'32px 32px 28px', color:'#fff', marginBottom:24, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-30, right:-30, fontSize:200, opacity:0.1 }}>💰</div>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', opacity:0.9, marginBottom:8 }}>Finance solidaire</div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:30, fontWeight:800, margin:'0 0 10px', lineHeight:1.15 }}>Cagnottes & Collectes</h1>
          <p style={{ fontSize:14, opacity:0.92, maxWidth:540, margin:'0 0 22px', lineHeight:1.6 }}>Soutiens des luttes, des projets, des caisses de grève en T99CP. Aucune commission, 100 % redistribué·e. Transparence sur l'utilisation des fonds garantie.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:14, marginBottom:18 }}>
            <div style={{ padding:'14px 16px', background:'rgba(255,255,255,0.15)', borderRadius:12, backdropFilter:'blur(8px)' }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800 }}>{stats.raised.toLocaleString('fr-FR')}</div>
              <div style={{ fontSize:11, opacity:0.85, textTransform:'uppercase', letterSpacing:'0.05em' }}>T99CP collectés</div>
            </div>
            <div style={{ padding:'14px 16px', background:'rgba(255,255,255,0.15)', borderRadius:12, backdropFilter:'blur(8px)' }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800 }}>{stats.contributors.toLocaleString('fr-FR')}</div>
              <div style={{ fontSize:11, opacity:0.85, textTransform:'uppercase', letterSpacing:'0.05em' }}>contributeur·ices</div>
            </div>
            <div style={{ padding:'14px 16px', background:'rgba(255,255,255,0.15)', borderRadius:12, backdropFilter:'blur(8px)' }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800 }}>{stats.active}</div>
              <div style={{ fontSize:11, opacity:0.85, textTransform:'uppercase', letterSpacing:'0.05em' }}>cagnottes actives</div>
            </div>
          </div>
          <Btn variant="white" size="md" icon={ICONS.plus} onClick={() => user ? setCreateOpen(true) : onAuth()}>Lancer ma cagnotte</Btn>
        </div>
      </div>

      {/* VEDETTES */}
      {featured.length > 0 && (
        <div style={{ marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:14 }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:T.text1, margin:0, display:'flex', alignItems:'center', gap:8 }}>★ Cagnottes en vedette</h2>
            <span style={{ fontSize:11, color:T.text3 }}>Sélectionnées par la communauté</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(420px, 1fr))', gap:18 }}>
            {featured.map(c => <CFFeaturedCard key={c.id} c={c} onClick={() => setDetail(c)} />)}
          </div>
        </div>
      )}

      {/* FILTRES */}
      <div style={{ marginBottom:18, padding:'14px 18px', background:T.surface, borderRadius:14, border:`1px solid ${T.border}`, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', flex:1, minWidth:240 }}>
          {CF_CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ padding:'7px 14px', borderRadius:9999, border:`1px solid ${cat===c ? T.hub.crowdfunding : T.border}`, background: cat===c ? T.hub.crowdfunding : T.surface, color: cat===c ? '#fff' : T.text2, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'all 0.18s' }}>{c}</button>
          ))}
        </div>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} aria-label="Rechercher une cagnotte" placeholder="Titre, projet, organisateur·rice..." style={{ height:36, padding:'0 14px', border:`1px solid ${T.border}`, borderRadius:9999, fontSize:13, color:T.text1, background:T.surface2, outline:'none', fontFamily:'Inter,sans-serif', width:240 }} />
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ height:36, padding:'0 12px', border:`1px solid ${T.border}`, borderRadius:9999, fontSize:12, color:T.text2, background:T.surface2, outline:'none', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
          {CF_SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {/* GRILLE */}
      {filtered.length === 0 ? (
        <div style={{ padding:'60px 20px', textAlign:'center', color:T.text3, background:T.surface, borderRadius:16, border:`1px dashed ${T.border}` }}>
          <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
          <div style={{ fontSize:14 }}>Aucune cagnotte ne correspond à ces critères.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
          {filtered.map(c => <CFCard key={c.id} c={c} onClick={() => setDetail(c)} adminMode={adminMode} onEdit={() => setEditItem(c)} />)}
        </div>
      )}

      {/* MODALES */}
      <CFCreateModal open={createOpen} onClose={() => setCreateOpen(false)} user={user} onSubmit={item => setData(d => [item, ...d])} />
      {payItem && <PayModal open onClose={() => setPayItem(null)} amount={amount} item={payItem.title} description={`Contribution solidaire · ${payItem.organizer}`} seller={payItem.organizer} />}
      {editItem && <EditModal open onClose={() => setEditItem(null)} title="Cagnotte" data={editItem} onSave={f => { setData(d => d.map(c => c.id === editItem.id ? { ...c, ...f } : c)); if (detail?.id === editItem.id) setDetail(d => ({ ...d, ...f })); setEditItem(null); }} fields={[{ key: 'title', label: 'Titre' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'goal_t99cp', label: 'Objectif T99CP', type: 'number' }, { key: 'days_left', label: 'Jours restants', type: 'number' }, { key: 'cover', label: 'URL de la cover' }]} />}
    </PageContainer>
  );
}
window.CrowdfundingPage = CrowdfundingPage;

// ── GARDEN v2 ─────────────────────────────────────────────
function GardenPage({ user, adminMode, onAuth }) {
  const [data, setData] = useState([...window.getUserCreations('garden'), ...AppData.garden]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('Tous');
  const [editItem, setEditItem] = useState(null);
  const [payItem, setPayItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const types = ['Tous', 'Légume', 'Fruit', 'Plant', 'Herbe', 'Œufs', 'Autre'];
  const filtered = data.filter(i => (type === 'Tous' || i.type === type) && (!search || i.item.toLowerCase().includes(search.toLowerCase())));
  return (
    <PageContainer>
      <SectionTitle label="Partage" title="Surplus de Jardin" action={<Btn variant="success" size="sm" icon={ICONS.plus} onClick={() => user ? setCreateOpen(true) : onAuth()}>Proposer un surplus</Btn>} />
      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} title="Proposer un surplus de jardin"
        subtitle="Tomates, miel, plants, œufs... partage tes surplus avec ton voisinage. Gratuit ou en T99CP."
        domain="garden" color={T.hub.garden}
        fields={[
          { id:'item',         label:'Nom du surplus', required:true, placeholder:"Tomates cerises bio" },
          { id:'type',         label:'Type', type:'select', required:true, options:types.slice(1) },
          { id:'quantity',     label:'Quantité', required:true, placeholder:"2 kg · 6 bouquets · 1 caisse" },
          { id:'location',     label:'Lieu de récupération', required:true, placeholder:"Lyon 7e · gare TGV" },
          { id:'price_t99cp',  label:'Prix en T99CP (0 = gratuit)', type:'number', required:true, placeholder:'0' },
          { id:'description',  label:'Description', type:'textarea', rows:2, placeholder:"Ramassées ce matin, à emporter avant samedi..." },
        ]}
        onSubmit={item => { const enriched = { ...item, giver: user?.name || 'Vous', free: +item.price_t99cp === 0, price_t99cp: +item.price_t99cp }; setData(d => [enriched, ...d]); }}
      />
      <SearchInput value={search} onChange={setSearch} placeholder="Tomates, courgettes, miel..." />
      <FilterTabs options={types} active={type} onChange={setType} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
        {filtered.map(i => (
          <div key={i.id} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', position: 'relative', transition: 'all 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(22,163,74,0.1)'; e.currentTarget.style.borderColor = T.success; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'none'; }}
            onClick={() => { if (!i.free) { if (!user) { onAuth(); } else setPayItem(i); } else { window.showToast?.(`Demande envoyée à ${i.giver} pour : ${i.item}`, { type:'success', icon:'🌱' }); } }}>
            {adminMode && <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }} onClick={e => { e.stopPropagation(); setEditItem(i); }}><AdminBtn onEdit={() => setEditItem(i)} /></div>}
            <div style={{ height: 130, position: 'relative', overflow: 'hidden' }}>
              <img src={`https://picsum.photos/seed/garden${i.id}/400/250`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg,#14532d,#166534)'; }} />
              <Tag variant={i.free ? 'success' : 'info'} size="xs" style={{ position: 'absolute', top: 10, left: 10 }}>{i.free ? 'GRATUIT' : `${i.price_t99cp} T99CP`}</Tag>
              {i._userCreated && <div style={{ position:'absolute', top: 10, right: 10 }}><window.UserBadge /></div>}
            </div>
            <div style={{ padding: '12px 14px 14px' }}>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: T.text1, margin: '0 0 4px', lineHeight: 1.3 }}>{i.item}</h3>
              <div style={{ fontSize: 12, color: T.text3, marginBottom: 8 }}>{i.giver} · {i.location}</div>
              <Tag size="xs">{i.quantity}</Tag>
            </div>
          </div>
        ))}
      </div>
      {payItem && <PayModal open onClose={() => setPayItem(null)} amount={payItem.price_t99cp} item={payItem.item} description={`Surplus de jardin de ${payItem.giver} · ${payItem.location}`} seller={payItem.giver} />}
      {editItem && <EditModal open onClose={() => setEditItem(null)} title="Surplus" data={editItem} onSave={f => { setData(d => d.map(i => i.id === editItem.id ? { ...i, ...f } : i)); setEditItem(null); }} fields={[{ key: 'item', label: 'Nom' }, { key: 'type', label: 'Type', type: 'select', options: types.slice(1) }, { key: 'quantity', label: 'Quantité' }, { key: 'location', label: 'Lieu' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'price_t99cp', label: 'Prix T99CP (0=gratuit)', type: 'number' }]} />}
    </PageContainer>
  );
}
window.GardenPage = GardenPage;

// ── LENDING v2 ────────────────────────────────────────────
function LendingPage({ user, adminMode, onAuth }) {
  const [data, setData] = useState([...window.getUserCreations('lending'), ...AppData.lending]);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [cat, sCat] = useState('Toutes');
  const [editItem, setEditItem] = useState(null);
  const [payOpen, setPayOpen] = useState(false);
  const [days, setDays] = useState(2);
  const [createOpen, setCreateOpen] = useState(false);
  const cats = ['Toutes', ...new Set(data.map(i => i.category))];
  const filtered = data.filter(i => (cat === 'Toutes' || i.category === cat) && (!search || i.name.toLowerCase().includes(search.toLowerCase())));
  return (
    <PageContainer>
      <SectionTitle label="Entraide" title="Ki Prête Tout" action={<Btn variant="gradient" size="sm" icon={ICONS.plus} onClick={() => user ? setCreateOpen(true) : onAuth()}>Proposer un objet</Btn>} />
      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} title="Proposer un objet à prêter"
        subtitle="Perceuse, raclette, jeux, instruments... prête ce que tu n'utilises pas tout le temps."
        domain="lending" color="#A21CAF"
        defaultPhoto="https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=70"
        fields={[
          { id:'name',         label:'Nom de l\'objet', required:true, placeholder:"Perceuse Bosch sans-fil 18V" },
          { id:'category',     label:'Catégorie', type:'select', required:true, options:['Bricolage','Jardinage','Cuisine','Loisirs','Multimédia','Sport','Famille','Autre'] },
          { id:'price_per_day', label:'Prix par jour (en T99CP)', type:'number', required:true, placeholder:'5' },
          { id:'deposit_t99cp', label:'Caution (en T99CP)', type:'number', required:true, placeholder:'50', hint:'Restituée à la fin du prêt' },
          { id:'location',     label:'Lieu de récupération', required:true, placeholder:"Marseille 6e" },
          { id:'description',  label:'Description', type:'textarea', rows:3, placeholder:"État, accessoires fournis, conditions d'utilisation..." },
        ]}
        onSubmit={item => { const enriched = { ...item, owner: user?.name || 'Vous', available: true, price_per_day: +item.price_per_day, deposit_t99cp: +item.deposit_t99cp }; setData(d => [enriched, ...d]); }}
      />
      <SearchInput value={search} onChange={setSearch} placeholder="Perceuse, raclette, vélo, piano..." />
      <FilterTabs options={cats} active={cat} onChange={sCat} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
        {filtered.map(i => (
          <div key={i.id} onClick={() => setDetail(i)} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', opacity: i.available ? 1 : 0.7 }}
            onMouseEnter={e => { if (i.available) { e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
            {adminMode && <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }} onClick={e => { e.stopPropagation(); setEditItem(i); }}><AdminBtn onEdit={() => setEditItem(i)} /></div>}
            {i._userCreated && <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 3 }}><window.UserBadge /></div>}
            <div style={{ height: 140, position: 'relative', background: T.surface2 }}>
              <img src={`https://picsum.photos/seed/lend${i.id}/400/280`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
              {!i.available && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag variant="dark">Indisponible</Tag></div>}
              <Tag variant={i.condition === 'Excellent' ? 'success' : 'info'} size="xs" style={{ position: 'absolute', top: 10, left: 10 }}>{i.condition}</Tag>
            </div>
            <div style={{ padding: '12px 14px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.text4, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{i.category}</div>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, color: T.text1, margin: '0 0 8px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{i.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {i.price_t99cp > 0 ? <><TokenDisplay amount={i.price_t99cp} size="sm" /><span style={{ fontSize: 11, color: T.text4 }}>/jour</span></> : <Tag variant="success" size="xs">Gratuit</Tag>}
                <div style={{ fontSize: 11, color: T.text4 }}>{i.owner}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {detail && (
        <Modal open onClose={() => setDetail(null)} title={detail.name} width={520}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <img src={`https://picsum.photos/seed/lend${detail.id}big/800/400`} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 14 }} onError={e => e.target.style.display = 'none'} />
            <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.65, margin: 0 }}>{detail.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[['État', detail.condition], ['Lieu', detail.location], ['Propriétaire', detail.owner]].map(([l, v]) => (<div key={l} style={{ background: T.surface2, borderRadius: 10, padding: '10px', textAlign: 'center' }}><div style={{ fontSize: 10, color: T.text4, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</div><div style={{ fontWeight: 700, fontSize: 13 }}>{v}</div></div>))}
            </div>
            {detail.available && <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.text2 }}>Durée (jours) :</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setDays(n => Math.max(1, n - 1))} style={{ width: 38, height: 38, borderRadius: '50%', border: `1.5px solid ${T.border}`, background: 'transparent', cursor: 'pointer', fontSize: 18 }}>−</button>
                  <span style={{ fontWeight: 800, fontSize: 18, minWidth: 24, textAlign: 'center' }}>{days}</span>
                  <button onClick={() => setDays(n => n + 1)} style={{ width: 38, height: 38, borderRadius: '50%', border: `1.5px solid ${T.border}`, background: 'transparent', cursor: 'pointer', fontSize: 18 }}>+</button>
                </div>
                <span style={{ fontSize: 13, color: T.text3, marginLeft: 'auto' }}>Total : <strong>{detail.price_t99cp > 0 ? `${detail.price_t99cp * days} T99CP` : 'Gratuit'}</strong></span>
              </div>
              <Btn full variant="gradient" size="lg" onClick={() => { if (!user) { onAuth(); } else { setPayOpen(true); } }} icon={ICONS.wallet}>
                {detail.price_t99cp > 0 ? `Emprunter · ${detail.price_t99cp * days + detail.deposit_t99cp} T99CP` : 'Demander l\'emprunt'}
              </Btn>
            </>}
          </div>
          <PayModal open={payOpen} onClose={() => setPayOpen(false)} amount={detail.price_t99cp * days + detail.deposit_t99cp} item={detail.name} description={`${days} jour${days > 1 ? 's' : ''} + caution`} seller={detail.owner||detail.lender} />tion ${detail.deposit_t99cp} T99CP remboursable`} />
        </Modal>
      )}
      {editItem && <EditModal open onClose={() => setEditItem(null)} title="Objet" data={editItem} onSave={f => { setData(d => d.map(i => i.id === editItem.id ? { ...i, ...f } : i)); setEditItem(null); }} fields={[{ key: 'name', label: 'Nom' }, { key: 'category', label: 'Catégorie' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'price_t99cp', label: 'Prix/jour T99CP', type: 'number' }, { key: 'location', label: 'Lieu' }]} />}
    </PageContainer>
  );
}
window.LendingPage = LendingPage;

// ── CARPOOLING v2 ──────────────────────────────────────────
function CarpoolingPage({ user, adminMode, onAuth }) {
  const [tab, setTab] = useState('offers');
  const [offers, setOffers] = useState([...window.getUserCreations('carpool_offers'), ...AppData.carpooling_offers]);
  const [requests, setRequests] = useState([...window.getUserCreations('carpool_requests'), ...AppData.carpooling_requests]);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  const filterTrips = arr => !search ? arr : arr.filter(t => t.from.toLowerCase().includes(search.toLowerCase()) || t.to.toLowerCase().includes(search.toLowerCase()));

  const TripCard = ({ t, isOffer }) => (
    <div onClick={() => setDetail({ ...t, isOffer })} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      {adminMode && isOffer && <div style={{ position: 'absolute', top: 10, right: 10 }} onClick={e => { e.stopPropagation(); setEditItem(t); }}><AdminBtn onEdit={() => setEditItem(t)} /></div>}
      {t._userCreated && <div style={{ position: 'absolute', top: 10, left: 10 }}><window.UserBadge /></div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: T.text1 }}>{t.from}</span>
            <div style={{ flex: 1, height: 2, background: T.border, position: 'relative' }}><div style={{ position: 'absolute', right: -4, top: -3, color: T.brand, fontSize: 10 }}>▶</div></div>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: T.text1 }}>{t.to}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 12, color: T.text3 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{ICONS.calendar}{new Date(t.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{ICONS.clock}{t.time}</span>
          </div>
        </div>
        {isOffer && <TokenDisplay amount={t.price_t99cp} size="lg" />}
      </div>
      {isOffer ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar name={t.driver} size={32} />
            <div><div style={{ fontWeight: 600, fontSize: 13, color: T.text1 }}>{t.driver}</div><Stars rating={t.rating} /></div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Tag variant={t.seats > 0 ? 'success' : 'brand'} size="xs">{t.seats > 0 ? `${t.seats} place${t.seats > 1 ? 's' : ''}` : 'Complet'}</Tag>
            <Tag size="xs">{t.car.split(' ')[0]}</Tag>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={t.passenger} size={32} />
          <div><div style={{ fontWeight: 600, fontSize: 13, color: T.text1 }}>{t.passenger}</div><div style={{ fontSize: 12, color: T.text3 }}>{t.note}</div></div>
        </div>
      )}
    </div>
  );

  return (
    <PageContainer>
      <SectionTitle label="Mobilité" title="Covoiturage Solidaire" action={<Btn variant="gradient" size="sm" icon={ICONS.plus} onClick={() => user ? (tab === 'offers' ? setCreateOpen(true) : setRequestOpen(true)) : onAuth()}>{tab === 'offers' ? 'Proposer un trajet' : 'Demander un trajet'}</Btn>} />
      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} title="Proposer un trajet"
        subtitle="Tu pars en voiture ? Propose les places libres aux militant·es du réseau."
        domain="carpool_offers" color={T.hub.carpooling}
        fields={[
          { id:'from',         label:'Départ', required:true, placeholder:"Lyon" },
          { id:'to',           label:'Arrivée', required:true, placeholder:"Marseille" },
          { id:'date',         label:'Date du trajet', type:'date', required:true },
          { id:'time',         label:'Heure de départ', required:true, placeholder:"08:30" },
          { id:'seats',        label:'Places disponibles', type:'number', required:true, placeholder:'3' },
          { id:'price_t99cp',  label:'Prix par personne (en T99CP)', type:'number', required:true, placeholder:'15' },
          { id:'description',  label:'Précisions (optionnel)', type:'textarea', rows:2, placeholder:"Bagages OK · Animal accepté · Non-fumeur" },
        ]}
        onSubmit={item => { const enriched = { ...item, driver: user?.name || 'Vous', rating: 0, seats: +item.seats, price_t99cp: +item.price_t99cp }; setOffers(d => [enriched, ...d]); }}
      />
      <CreateModal open={requestOpen} onClose={() => setRequestOpen(false)} title="Demander un trajet"
        subtitle="Tu cherches à te déplacer ? Poste ta demande, des conducteur·rices te répondront."
        domain="carpool_requests" color={T.hub.carpooling}
        fields={[
          { id:'from',         label:'Départ', required:true, placeholder:"Bordeaux" },
          { id:'to',           label:'Arrivée', required:true, placeholder:"Toulouse" },
          { id:'date',         label:'Date souhaitée', type:'date', required:true },
          { id:'flexibility',  label:'Flexibilité', type:'select', options:['Date fixe','+/- 1 jour','+/- 3 jours','Cette semaine'] },
          { id:'description',  label:'Précisions', type:'textarea', rows:2, placeholder:"Avec un sac de randonnée. Pour aller à la mobilisation du 15." },
        ]}
        onSubmit={item => { const enriched = { ...item, requester: user?.name || 'Vous' }; setRequests(d => [enriched, ...d]); }}
      />
      <SearchInput value={search} onChange={setSearch} placeholder="De... vers... (ex: Paris, Lyon)" />
      <div style={{ display: 'flex', gap: 0, background: T.surface2, borderRadius: 14, padding: 4, marginBottom: 24 }}>
        {[['offers', 'Offres de trajet'], ['requests', 'Demandes de trajet']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'Inter,sans-serif', transition: 'all 0.15s', background: tab === id ? T.surface : 'transparent', color: tab === id ? T.brand : T.text3, boxShadow: tab === id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>{label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(tab === 'offers' ? filterTrips(offers) : filterTrips(requests)).map(t => <TripCard key={t.id} t={t} isOffer={tab === 'offers'} />)}
      </div>

      {detail && (
        <Modal open onClose={() => setDetail(null)} title={`${detail.from} → ${detail.to}`} width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: T.text1, borderRadius: 14, padding: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800 }}>{detail.from}</div><div style={{ fontSize: 11, opacity: 0.6 }}>Départ</div></div>
              <div style={{ flex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 20 }}>→</div>
              <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800 }}>{detail.to}</div><div style={{ fontSize: 11, opacity: 0.6 }}>Arrivée</div></div>
            </div>
            {detail.isOffer && <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={detail.driver} size={48} />
              <div><div style={{ fontWeight: 700, fontSize: 15, color: T.text1 }}>{detail.driver}</div><Stars rating={detail.rating} /><div style={{ fontSize: 12, color: T.text3 }}>{detail.car}</div></div>
              <div style={{ marginLeft: 'auto' }}><TokenDisplay amount={detail.price_t99cp} size="lg" /><div style={{ fontSize: 11, color: T.text4, textAlign: 'right' }}>/ personne</div></div>
            </div>}
            {detail.note && <div style={{ background: T.surface2, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: T.text2, lineHeight: 1.5 }}>{detail.note}</div>}
            {detail.isOffer ? (
              <Btn full variant="gradient" size="lg" onClick={() => { if (!user) { onAuth(); } else { setPayOpen(true); } }} icon={ICONS.wallet}>Réserver · {detail.price_t99cp} T99CP</Btn>
            ) : (
              <Btn full variant="gradient" size="lg" onClick={() => user ? window.showToast?.(`Message envoyé à ${detail.requester || 'la personne'} — réponse par messagerie`, { type:'success', icon:'✉️' }) : onAuth()} icon={ICONS.chat}>Proposer mon trajet</Btn>
            )}
          </div>
          <PayModal open={payOpen} onClose={() => setPayOpen(false)} amount={detail?.price_t99cp || 0} item={`${detail?.from} → ${detail?.to}`} description={`Covoiturage avec ${detail?.driver}`} seller={detail?.driver} />
        </Modal>
      )}
      {editItem && <EditModal open onClose={() => setEditItem(null)} title="Trajet" data={editItem} onSave={f => { setOffers(d => d.map(t => t.id === editItem.id ? { ...t, ...f } : t)); setEditItem(null); }} fields={[{ key: 'from', label: 'Départ' }, { key: 'to', label: 'Arrivée' }, { key: 'date', label: 'Date', type: 'date' }, { key: 'time', label: 'Heure' }, { key: 'price_t99cp', label: 'Prix T99CP', type: 'number' }, { key: 'seats', label: 'Places', type: 'number' }]} />}
    </PageContainer>
  );
}
window.CarpoolingPage = CarpoolingPage;
