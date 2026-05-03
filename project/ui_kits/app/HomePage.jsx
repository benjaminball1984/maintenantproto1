// HomePage.jsx — Hero + Stats + Petition Feed

const SAMPLE_PETITIONS = [
  { id: 1, title: "Pour une transition écologique immédiate dans les transports publics", category: "Environnement", signatures: 2847, goal: 4000, location: "Paris", featured: true },
  { id: 2, title: "Non à la fermeture des services d'urgences de nuit", category: "Santé", signatures: 8420, goal: 10000, location: "Lyon", featured: true },
  { id: 3, title: "Pour un logement décent pour toutes et tous", category: "Logement", signatures: 1234, goal: 5000, location: "Marseille", featured: false },
  { id: 4, title: "Augmentation du SMIC à 1 600 € net", category: "Social", signatures: 15600, goal: 20000, location: "France", featured: false },
  { id: 5, title: "Réforme de la justice climatique : responsabilité pénale des grands pollueurs", category: "Justice", signatures: 4100, goal: 8000, location: "France", featured: false },
  { id: 6, title: "Pour l'éducation populaire et la gratuité des fournitures scolaires", category: "Éducation", signatures: 760, goal: 2000, location: "Bordeaux", featured: false },
];

const STATS = [
  { value: '12', label: 'Pétitions' },
  { value: '32.8k', label: 'Signatures' },
  { value: '10.5k', label: 'Abonnés' },
  { value: '946', label: 'Membres' },
];

function AnimatedCounter({ value }) {
  return <span>{value}</span>;
}

function HomePage({ setActivePage }) {
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('all');

  const categories = ['all', 'Environnement', 'Social', 'Logement', 'Santé', 'Éducation', 'Justice'];

  const filtered = SAMPLE_PETITIONS.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  });

  const featured = filtered.filter(p => p.featured);
  const rest = filtered.filter(p => !p.featured);

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#C1121F 0%,#E63946 50%,#F4721E 100%)', color: '#fff', padding: '48px 20px 80px' }}>
        {/* Decorative blobs */}
        <div style={{ position:'absolute', top:-50, right:-50, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.05)', filter:'blur(40px)', pointerEvents:'none' }}></div>
        <div style={{ position:'absolute', bottom:-30, left:-30, width:180, height:180, borderRadius:'50%', background:'rgba(255,165,0,0.15)', filter:'blur(32px)', pointerEvents:'none' }}></div>

        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:9999, padding:'5px 14px', fontSize:12, fontWeight:600, marginBottom:16 }}>
            ✨ Plateforme citoyenne de mobilisation
          </div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'clamp(28px,6vw,60px)', fontWeight:800, lineHeight:1.05, letterSpacing:'-0.02em', marginBottom:10 }}>
            Maintenant !<br />
            <span style={{ fontSize:'clamp(18px,4vw,40px)', color:'rgba(255,255,255,0.80)', fontWeight:700 }}>La voix des 99%</span>
          </h1>
          <p style={{ fontSize:'clamp(13px,2vw,17px)', color:'rgba(255,255,255,0.82)', marginBottom:24, lineHeight:1.6, maxWidth:560, margin:'0 auto 24px' }}>
            Pour une vie heureuse et digne dans un monde vivable. Ils ont des milliards, soyons des millions !
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginBottom:32 }}>
            <button onClick={() => setActivePage('creer')} style={{ background:'#fff', color:'#C1121F', fontWeight:700, fontSize:14, height:44, padding:'0 22px', borderRadius:9999, border:'none', cursor:'pointer', boxShadow:'0 8px 20px rgba(0,0,0,0.15)', display:'flex', alignItems:'center', gap:6 }}>
              <i data-lucide="plus" style={{width:16,height:16}}></i> Créer une pétition
            </button>
            <button style={{ background:'rgba(255,255,255,0.15)', color:'#fff', fontWeight:600, fontSize:14, height:44, padding:'0 20px', borderRadius:9999, border:'2px solid rgba(255,255,255,0.35)', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              Découvrir les causes <i data-lucide="arrow-right" style={{width:16,height:16}}></i>
            </button>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, maxWidth:560, margin:'0 auto' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:14, padding:'10px 8px', textAlign:'center' }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.65)', textTransform:'uppercase', letterSpacing:'0.09em', marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, color:'#F9FAFB', lineHeight:0 }}>
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block',width:'100%'}}>
            <path d="M0 56L60 50C120 44 240 32 360 29C480 26 600 32 720 35C840 38 960 38 1080 33C1200 28 1320 16 1380 10L1440 4V56H0Z" fill="currentColor"/>
          </svg>
        </div>
      </section>

      {/* ── Search + Filter ────────────────────────────────── */}
      <section style={{ maxWidth:1152, margin:'0 auto', padding:'0 16px' }}>
        <div style={{ background:'#fff', borderRadius:20, boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1px solid rgba(229,231,235,0.8)', padding:'18px 20px', marginTop:-28, position:'relative', zIndex:10 }}>
          <div style={{ position:'relative' }}>
            <i data-lucide="search" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:18, height:18, color:'#9CA3AF' }}></i>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une pétition..."
              style={{ width:'100%', height:44, border:'2px solid #E5E7EB', borderRadius:12, paddingLeft:44, fontSize:14, fontFamily:'Inter,sans-serif', color:'#111827', background:'#F9FAFB', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor='#C1121F'} onBlur={e => e.target.style.borderColor='#E5E7EB'}
            />
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:14 }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding:'5px 14px', borderRadius:9999, fontSize:12, fontWeight:600, border:'none', cursor:'pointer', transition:'all 0.15s',
                background: category === cat ? 'linear-gradient(to right,#C1121F,#F4721E)' : '#F3F4F6',
                color: category === cat ? '#fff' : '#374151',
                boxShadow: category === cat ? '0 3px 10px rgba(193,18,31,0.25)' : 'none',
              }}>{cat === 'all' ? 'Toutes' : cat}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured ───────────────────────────────────────── */}
      {featured.length > 0 && (
        <section style={{ maxWidth:1152, margin:'0 auto', padding:'32px 16px 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#F59E0B,#F4721E)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(245,158,11,0.3)' }}>
              <i data-lucide="sparkles" style={{width:20,height:20,color:'#fff'}}></i>
            </div>
            <div>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:'#111827', letterSpacing:'-0.02em', margin:0 }}>Pétitions en vedette</h2>
              <p style={{ fontSize:13, color:'#6B7280', margin:'2px 0 0' }}>Causes tendances qui ont besoin de votre soutien</p>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {featured.slice(0,3).map(p => <MPetitionCard key={p.id} petition={p} onClick={() => alert(`Pétition : ${p.title}`)} />)}
          </div>
        </section>
      )}

      {/* ── All Petitions ──────────────────────────────────── */}
      <section style={{ maxWidth:1152, margin:'0 auto', padding:'24px 16px 80px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#C1121F,#F4721E)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(193,18,31,0.25)' }}>
            <i data-lucide="trending-up" style={{width:20,height:20,color:'#fff'}}></i>
          </div>
          <div>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:'#111827', letterSpacing:'-0.02em', margin:0 }}>
              {category === 'all' ? 'Toutes les pétitions' : `Pétitions · ${category}`}
            </h2>
            <p style={{ fontSize:13, color:'#6B7280', margin:'2px 0 0' }}>{filtered.length} pétition{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'#9CA3AF' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <p style={{ fontWeight:600, color:'#374151', fontSize:16 }}>Aucune pétition trouvée</p>
            <p style={{ fontSize:14, marginTop:4 }}>Essayez une autre catégorie ou créez la vôtre !</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {rest.map(p => <MPetitionCard key={p.id} petition={p} onClick={() => alert(`Pétition : ${p.title}`)} />)}
          </div>
        )}
      </section>
    </div>
  );
}

Object.assign(window, { MHomePage: HomePage });
