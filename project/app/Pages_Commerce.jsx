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
      <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: T.surface2 }}>
        <img src={`https://picsum.photos/seed/mp${item.id}/400/300`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.06)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} onError={e => e.target.style.display = 'none'} />
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
              <Btn full variant="outline" size="md" onClick={() => user ? alert('Message envoyé !') : onAuth()} icon={ICONS.chat}>Contacter le vendeur</Btn>
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
  const [data, setData] = useState(AppData.marketplace);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Toutes');
  const [sort, setSort] = useState('recent');
  const [editItem, setEditItem] = useState(null);
  const cats = ['Toutes', ...new Set(data.map(i => i.category))];
  let filtered = data.filter(i => (cat === 'Toutes' || i.category === cat) && (!search || i.title.toLowerCase().includes(search.toLowerCase())));
  if (sort === 'asc') filtered = [...filtered].sort((a, b) => a.price_t99cp - b.price_t99cp);
  if (sort === 'desc') filtered = [...filtered].sort((a, b) => b.price_t99cp - a.price_t99cp);
  if (detail) return <MPDetail item={detail} onBack={() => setDetail(null)} user={user} onAuth={onAuth} adminMode={adminMode} onSave={u => setData(d => d.map(i => i.id === u.id ? u : i))} />;
  return (
    <PageContainer>
      <SectionTitle label="Commerce solidaire" title="Marketplace" action={<Btn variant="gradient" size="sm" icon={ICONS.plus} onClick={() => user ? alert('Vendre') : onAuth()}>Vendre un article</Btn>} />
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
  const [data, setData] = useState(AppData.sel);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [cat, sCat] = useState('Toutes');
  const [editItem, setEditItem] = useState(null);
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
        <Btn variant="white" size="md" onClick={() => user ? alert('Proposer') : onAuth()} icon={ICONS.plus}>Proposer un service</Btn>
      </div>
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

// ── CROWDFUNDING v2 ────────────────────────────────────────
function CrowdfundingPage({ user, adminMode, onAuth }) {
  const [data, setData] = useState(AppData.crowdfunding);
  const [payItem, setPayItem] = useState(null);
  const [amount, setAmount] = useState(10);
  const [editItem, setEditItem] = useState(null);
  return (
    <PageContainer>
      <SectionTitle label="Finance solidaire" title="Cagnottes & Collectes" action={<Btn variant="gradient" size="sm" icon={ICONS.plus} onClick={() => user ? alert('Créer') : onAuth()}>Créer une cagnotte</Btn>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 24 }}>
        {data.map(c => (
          <div key={c.id} style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, overflow: 'hidden', position: 'relative', transition: 'all 0.22s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
            {adminMode && <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 3 }} onClick={() => setEditItem(c)}><AdminBtn onEdit={() => setEditItem(c)} /></div>}
            <div style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
              <img src={`https://picsum.photos/seed/crowd${c.id}/600/300`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6),transparent)' }}></div>
              <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
                <Tag variant={c.category === 'Luttes' ? 'brand' : 'success'}>{c.category}</Tag>
              </div>
            </div>
            <div style={{ padding: '20px 22px 24px' }}>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: T.text1, margin: '0 0 8px', lineHeight: 1.35 }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: T.text3, margin: '0 0 16px', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
              <ProgressBar value={c.raised_t99cp} max={c.goal_t99cp} height={6} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.text3, margin: '10px 0 16px', flexWrap: 'wrap', gap: 4 }}>
                <span><strong style={{ color: T.info, fontSize: 14 }}>{c.raised_t99cp} T99CP</strong> collectés</span>
                <span>{c.contributors} contributeurs · {c.days_left}j restants</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} min="1" placeholder="Montant" style={{ flex: 1, height: 42, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '0 14px', fontSize: 14, fontFamily: 'Inter,sans-serif', color: T.text1, background: T.bg, outline: 'none' }} />
                <Btn variant="blue" size="md" onClick={() => { if (!user) { onAuth(); return; } setPayItem(c); }} icon={ICONS.wallet}>Contribuer</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
      {payItem && <PayModal open onClose={() => setPayItem(null)} amount={amount} item={payItem.title} description={`Contribution solidaire · ${payItem.organizer}`} seller={payItem.organizer} />}
      {editItem && <EditModal open onClose={() => setEditItem(null)} title="Cagnotte" data={editItem} onSave={f => { setData(d => d.map(c => c.id === editItem.id ? { ...c, ...f } : c)); setEditItem(null); }} fields={[{ key: 'title', label: 'Titre' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'goal_t99cp', label: 'Objectif T99CP', type: 'number' }, { key: 'days_left', label: 'Jours restants', type: 'number' }]} />}
    </PageContainer>
  );
}
window.CrowdfundingPage = CrowdfundingPage;

// ── GARDEN v2 ─────────────────────────────────────────────
function GardenPage({ user, adminMode, onAuth }) {
  const [data, setData] = useState(AppData.garden);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('Tous');
  const [editItem, setEditItem] = useState(null);
  const [payItem, setPayItem] = useState(null);
  const types = ['Tous', 'Légume', 'Fruit', 'Plant', 'Herbe', 'Œufs', 'Autre'];
  const filtered = data.filter(i => (type === 'Tous' || i.type === type) && (!search || i.item.toLowerCase().includes(search.toLowerCase())));
  return (
    <PageContainer>
      <SectionTitle label="Partage" title="Surplus de Jardin" action={<Btn variant="success" size="sm" icon={ICONS.plus} onClick={() => user ? alert('Proposer') : onAuth()}>Proposer un surplus</Btn>} />
      <SearchInput value={search} onChange={setSearch} placeholder="Tomates, courgettes, miel..." />
      <FilterTabs options={types} active={type} onChange={setType} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
        {filtered.map(i => (
          <div key={i.id} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', position: 'relative', transition: 'all 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(22,163,74,0.1)'; e.currentTarget.style.borderColor = T.success; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'none'; }}
            onClick={() => { if (!i.free) { if (!user) { onAuth(); } else setPayItem(i); } else { alert(`Contacter ${i.giver} pour récupérer : ${i.item}`); } }}>
            {adminMode && <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }} onClick={e => { e.stopPropagation(); setEditItem(i); }}><AdminBtn onEdit={() => setEditItem(i)} /></div>}
            <div style={{ height: 130, position: 'relative', overflow: 'hidden' }}>
              <img src={`https://picsum.photos/seed/garden${i.id}/400/250`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg,#14532d,#166534)'; }} />
              <Tag variant={i.free ? 'success' : 'info'} size="xs" style={{ position: 'absolute', top: 10, left: 10 }}>{i.free ? 'GRATUIT' : `${i.price_t99cp} T99CP`}</Tag>
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
  const [data, setData] = useState(AppData.lending);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [cat, sCat] = useState('Toutes');
  const [editItem, setEditItem] = useState(null);
  const [payOpen, setPayOpen] = useState(false);
  const [days, setDays] = useState(2);
  const cats = ['Toutes', ...new Set(data.map(i => i.category))];
  const filtered = data.filter(i => (cat === 'Toutes' || i.category === cat) && (!search || i.name.toLowerCase().includes(search.toLowerCase())));
  return (
    <PageContainer>
      <SectionTitle label="Entraide" title="Ki Prête Tout" action={<Btn variant="gradient" size="sm" icon={ICONS.plus} onClick={() => user ? alert('Proposer') : onAuth()}>Proposer un objet</Btn>} />
      <SearchInput value={search} onChange={setSearch} placeholder="Perceuse, raclette, vélo, piano..." />
      <FilterTabs options={cats} active={cat} onChange={sCat} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
        {filtered.map(i => (
          <div key={i.id} onClick={() => setDetail(i)} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', opacity: i.available ? 1 : 0.7 }}
            onMouseEnter={e => { if (i.available) { e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
            {adminMode && <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }} onClick={e => { e.stopPropagation(); setEditItem(i); }}><AdminBtn onEdit={() => setEditItem(i)} /></div>}
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
                  <button onClick={() => setDays(n => Math.max(1, n - 1))} style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${T.border}`, background: 'transparent', cursor: 'pointer', fontSize: 16 }}>−</button>
                  <span style={{ fontWeight: 800, fontSize: 18, minWidth: 24, textAlign: 'center' }}>{days}</span>
                  <button onClick={() => setDays(n => n + 1)} style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${T.border}`, background: 'transparent', cursor: 'pointer', fontSize: 16 }}>+</button>
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
  const [offers, setOffers] = useState(AppData.carpooling_offers);
  const [requests] = useState(AppData.carpooling_requests);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const filterTrips = arr => !search ? arr : arr.filter(t => t.from.toLowerCase().includes(search.toLowerCase()) || t.to.toLowerCase().includes(search.toLowerCase()));

  const TripCard = ({ t, isOffer }) => (
    <div onClick={() => setDetail({ ...t, isOffer })} style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      {adminMode && isOffer && <div style={{ position: 'absolute', top: 10, right: 10 }} onClick={e => { e.stopPropagation(); setEditItem(t); }}><AdminBtn onEdit={() => setEditItem(t)} /></div>}
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
      <SectionTitle label="Mobilité" title="Covoiturage Solidaire" action={<Btn variant="gradient" size="sm" icon={ICONS.plus} onClick={() => user ? alert('Proposer') : onAuth()}>Proposer un trajet</Btn>} />
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
              <Btn full variant="gradient" size="lg" onClick={() => user ? alert('Message envoyé !') : onAuth()} icon={ICONS.chat}>Proposer mon trajet</Btn>
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
