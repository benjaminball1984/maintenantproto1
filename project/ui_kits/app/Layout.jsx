// Layout.jsx — Header + BottomNav + Footer
// Shared globally via window.MLayout

const { useState, useEffect, useRef } = React;

function Header({ activePage, setActivePage, currentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { page: 'home', label: 'Accueil', icon: 'home' },
    { page: 'mobilizations', label: 'Mobilisations', icon: 'calendar' },
    { page: 'crowdfunding', label: 'Cagnottes', icon: 'coins' },
    { page: 'join', label: 'Adhérer', icon: 'heart' },
    { page: 'services', label: 'Services', icon: 'layout-grid' },
  ];

  return (
    <header style={{
      background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <div onClick={() => setActivePage('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69875f581fc4bdc871bc013d/58e1cd879_MAINTENANT1.jpg"
            alt="Maintenant!"
            style={{ height: 48, width: 'auto', borderRadius: 8, objectFit: 'contain' }}
            onError={e => { e.target.style.display='none'; }}
          />
        </div>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, ['@media(max-width:768px)']: { display: 'none' } }} className="desktop-nav">
          {navLinks.map(link => (
            <button key={link.page} onClick={() => setActivePage(link.page)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12,
              fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: activePage === link.page ? 'linear-gradient(to right,#C1121F,#F4721E)' : 'transparent',
              color: activePage === link.page ? '#fff' : '#374151',
              boxShadow: activePage === link.page ? '0 4px 12px rgba(193,18,31,0.25)' : 'none',
              transition: 'all 0.15s',
            }}>
              <i data-lucide={link.icon} style={{ width: 16, height: 16 }}></i>
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {currentUser ? (
            <div style={{ position: 'relative' }} ref={profileRef}>
              <div onClick={() => setProfileOpen(!profileOpen)} style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg,#C1121F,#F4721E)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(193,18,31,0.3)', border: '2px solid #E5E7EB'
              }}>
                {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {profileOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 200,
                  background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 100
                }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{currentUser.name}</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>{currentUser.email}</div>
                  </div>
                  {[['👤', 'Mon profil'], ['⚙️', 'Espace membre'], ['🔔', 'Notifications'], ['📧', 'Newsletters']].map(([icon, label]) => (
                    <div key={label} style={{ padding: '10px 14px', fontSize: 13, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background='#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      {icon} {label}
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #F3F4F6', padding: '8px 14px' }}>
                    <div style={{ fontSize: 13, color: '#C1121F', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>🚪 Se déconnecter</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setActivePage('login')} style={{
              height: 36, padding: '0 16px', borderRadius: 9999, border: '2px solid #C1121F',
              color: '#C1121F', fontWeight: 600, fontSize: 13, background: 'transparent', cursor: 'pointer'
            }}>Se connecter</button>
          )}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-btn" style={{
            display: 'none', padding: 8, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8
          }}>
            <i data-lucide={mobileMenuOpen ? 'x' : 'menu'} style={{ width: 22, height: 22, color: '#374151' }}></i>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div style={{ borderTop: '1px solid #E5E7EB', padding: '8px 16px 12px', background: '#fff' }}>
          {navLinks.map(link => (
            <button key={link.page} onClick={() => { setActivePage(link.page); setMobileMenuOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 14px',
              borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginBottom: 2,
              background: activePage === link.page ? 'linear-gradient(to right,#C1121F,#F4721E)' : 'transparent',
              color: activePage === link.page ? '#fff' : '#374151',
            }}>
              <i data-lucide={link.icon} style={{ width: 18, height: 18 }}></i>
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function BottomNav({ activePage, setActivePage }) {
  const tabs = [
    { page: 'home', icon: 'home', label: 'Accueil' },
    { page: 'services', icon: 'layout-grid', label: 'Services' },
    null, // FAB
    { page: 'profile', icon: 'user', label: 'Profil' },
    { page: 'notifications', icon: 'bell', label: 'Notifs' },
  ];

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '6px 8px 10px', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', zIndex: 50
    }} className="bottom-nav">
      {tabs.map((tab, i) => {
        if (tab === null) return (
          <div key="fab" style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative', top: -12 }}>
            <button onClick={() => setActivePage('creer')} style={{
              width: 48, height: 48, borderRadius: '50%', border: '3px solid #F9FAFB',
              background: 'linear-gradient(135deg,#C1121F,#F4721E)', color: '#fff',
              fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(193,18,31,0.40)', cursor: 'pointer'
            }}>+</button>
          </div>
        );
        const isActive = activePage === tab.page;
        return (
          <button key={tab.page} onClick={() => setActivePage(tab.page)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '6px 4px', border: 'none', background: 'transparent', cursor: 'pointer',
            position: 'relative', borderRadius: 10, color: isActive ? '#C1121F' : '#6B7280'
          }}>
            {isActive && <div style={{ position: 'absolute', top: 0, width: 24, height: 3, background: 'linear-gradient(to right,#C1121F,#F4721E)', borderRadius: 9999 }}></div>}
            <i data-lucide={tab.icon} style={{ width: 20, height: 20 }}></i>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Footer() {
  return (
    <footer style={{ background: '#fff', borderTop: '1px solid #E5E7EB', padding: '24px 24px', marginBottom: 0 }} className="desktop-footer">
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69875f581fc4bdc871bc013d/58e1cd879_MAINTENANT1.jpg"
          alt="Maintenant!" style={{ height: 48, width: 'auto', objectFit: 'contain', borderRadius: 8 }} onError={e => { e.target.style.display='none'; }} />
        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#6B7280', flexWrap: 'wrap' }}>
          <a href="#" style={{ color: '#6B7280', textDecoration: 'none' }} onMouseEnter={e=>e.target.style.color='#C1121F'} onMouseLeave={e=>e.target.style.color='#6B7280'}>Mentions légales & RGPD</a>
          <a href="#" style={{ color: '#6B7280', textDecoration: 'none' }} onMouseEnter={e=>e.target.style.color='#C1121F'} onMouseLeave={e=>e.target.style.color='#6B7280'}>Contact</a>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { MHeader: Header, MBottomNav: BottomNav, MFooter: Footer });
