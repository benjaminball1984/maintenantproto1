// ServicesPage.jsx + CreerPage.jsx

// ── Services Page ──────────────────────────────────────────
const SERVICES = [
  { icon: '📜', label: 'Pétitions', desc: 'Lancez et signez des pétitions citoyennes', page: 'home', color: '#C1121F' },
  { icon: '📅', label: 'Événements', desc: 'Mobilisations, marches, assemblées', page: 'mobilizations', color: '#2563EB' },
  { icon: '💰', label: 'Cagnottes', desc: 'Collectes solidaires et caisses de lutte', page: 'crowdfunding', color: '#D97706' },
  { icon: '👥', label: 'Réseau social', desc: 'Réseau militant sans publicité', page: 'reseau', color: '#7C3AED' },
  { icon: '🔧', label: 'Ki Prête Tout', desc: 'Prêt et emprunt d\'objets entre voisins', page: 'services', color: '#0891B2' },
  { icon: '🤲', label: 'SEL', desc: 'Système d\'échange local — temps contre temps', page: 'services', color: '#16A34A' },
  { icon: '🏡', label: 'Se loger', desc: 'Hébergement solidaire et troc logement', page: 'services', color: '#EA580C' },
  { icon: '🚗', label: 'Covoiturage', desc: 'Trajets partagés entre militants', page: 'services', color: '#0284C7' },
  { icon: '🥬', label: 'Nos Fruits', desc: 'Jardin partagé, troc fruits et légumes', page: 'services', color: '#15803D' },
  { icon: '🛒', label: 'Marketplace', desc: 'Vente et achat solidaire entre membres', page: 'services', color: '#9333EA' },
  { icon: '🤝', label: 'Moment Solidaire', desc: 'Créez et rejoignez des moments d\'entraide', page: 'services', color: '#E11D48' },
  { icon: '📰', label: 'Média', desc: 'Articles, vidéos et analyses militantes', page: 'media', color: '#374151' },
];

function ServicesPage({ setActivePage }) {
  const [hovered, setHovered] = React.useState(null);

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '28px 16px 80px' }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Services solidaires</h1>
          <p style={{ fontSize: 15, color: '#6B7280', margin: 0 }}>Tous les outils pour agir ensemble — localement et nationalement.</p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
          {SERVICES.map((s, i) => (
            <div
              key={i}
              onClick={() => setActivePage(s.page)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '18px 18px 16px',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: hovered === i ? '0 8px 30px rgba(0,0,0,0.10)' : 'none',
                transform: hovered === i ? 'translateY(-2px)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: `${s.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                }}>
                  {s.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>{s.desc}</div>
                </div>
                <i data-lucide="arrow-right" style={{ width: 16, height: 16, color: '#D1D5DB', flexShrink: 0, marginTop: 2, transition: 'color 0.15s', ...(hovered === i ? { color: s.color } : {}) }}></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Creer Page ─────────────────────────────────────────────
const CREER_TILES = [
  { icon: '📜', label: 'Pétition', desc: 'Lancer une pétition', color: '#C1121F' },
  { icon: '📅', label: 'Événement', desc: 'Organiser un rassemblement', color: '#2563EB' },
  { icon: '💰', label: 'Cagnotte', desc: 'Ouvrir une collecte', color: '#D97706' },
  { icon: '📰', label: 'Article', desc: 'Publier sur le média', color: '#374151' },
  { icon: '🔧', label: 'Prêt matériel', desc: 'Prêter un objet', color: '#0891B2' },
  { icon: '🤲', label: 'Service SEL', desc: 'Proposer du temps', color: '#16A34A' },
  { icon: '🏡', label: 'Hébergement', desc: 'Offrir un logement', color: '#EA580C' },
  { icon: '🚗', label: 'Covoiturage', desc: 'Proposer un trajet', color: '#0284C7' },
  { icon: '🥬', label: 'Jardin', desc: 'Partager des fruits', color: '#15803D' },
  { icon: '🤝', label: 'Moment Solidaire', desc: 'Créer un moment d\'entraide', color: '#E11D48' },
  { icon: '🚀', label: 'Campagne', desc: 'Lancer une campagne', color: '#7C3AED' },
];

function CreerPage({ setActivePage }) {
  const [hovered, setHovered] = React.useState(null);

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Mini header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setActivePage('home')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280', padding: 6, borderRadius: 8 }}>
          <i data-lucide="arrow-left" style={{ width: 20, height: 20 }}></i>
        </button>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>Que souhaitez-vous créer ?</h1>
      </div>

      <div style={{ padding: '20px 16px 80px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {CREER_TILES.map((tile, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => alert(`Créer : ${tile.label}`)}
              style={{
                background: hovered === i ? `${tile.color}12` : '#fff',
                border: hovered === i ? `1.5px solid ${tile.color}50` : '1px solid #E5E7EB',
                borderRadius: 14, padding: '14px 10px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                transition: 'all 0.18s', textAlign: 'center',
                boxShadow: hovered === i ? `0 4px 16px ${tile.color}20` : 'none',
              }}
            >
              <div style={{ fontSize: 26, lineHeight: 1 }}>{tile.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#111827', lineHeight: 1.2 }}>{tile.label}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', lineHeight: 1.3 }}>{tile.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Reseau placeholder ─────────────────────────────────────
function ReseauPage({ setActivePage }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>👥</div>
      <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Réseau Social</h2>
      <p style={{ color: '#6B7280', fontSize: 15, maxWidth: 360, lineHeight: 1.6, margin: '0 0 24px' }}>
        Le réseau social militant de Maintenant ! — sans publicité, sans algorithme commercial. Connexion requise.
      </p>
      <button onClick={() => setActivePage('login')} style={{ background: 'linear-gradient(to right,#C1121F,#F4721E)', color: '#fff', fontWeight: 700, fontSize: 14, height: 44, padding: '0 24px', borderRadius: 9999, border: 'none', cursor: 'pointer', boxShadow: '0 6px 16px rgba(193,18,31,0.3)' }}>
        Se connecter pour accéder
      </button>
    </div>
  );
}

// ── Login placeholder ──────────────────────────────────────
function LoginPage({ onLogin, setActivePage }) {
  const [email, setEmail] = React.useState('');
  const [pwd, setPwd] = React.useState('');

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.10)', border: '1px solid #E5E7EB' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#C1121F,#F4721E)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 6px 16px rgba(193,18,31,0.3)' }}>
            <i data-lucide="user" style={{ width: 26, height: 26, color: '#fff' }}></i>
          </div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Connexion</h2>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Rejoignez le mouvement</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="votre@email.fr" style={{ width: '100%', height: 44, border: '2px solid #E5E7EB', borderRadius: 12, padding: '0 14px', fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Mot de passe</label>
            <input value={pwd} onChange={e => setPwd(e.target.value)} type="password" placeholder="••••••••" style={{ width: '100%', height: 44, border: '2px solid #E5E7EB', borderRadius: 12, padding: '0 14px', fontSize: 14, fontFamily: 'Inter,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={() => onLogin({ name: 'Marie Dupont', email: email || 'marie@exemple.fr' })} style={{ background: 'linear-gradient(to right,#C1121F,#F4721E)', color: '#fff', fontWeight: 700, fontSize: 15, height: 46, borderRadius: 9999, border: 'none', cursor: 'pointer', marginTop: 4, boxShadow: '0 6px 16px rgba(193,18,31,0.3)' }}>
            Se connecter
          </button>
          <button onClick={() => setActivePage('home')} style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', padding: '4px 0' }}>
            Continuer sans compte →
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MServicesPage: ServicesPage, MCreerPage: CreerPage, MReseauPage: ReseauPage, MLoginPage: LoginPage });
