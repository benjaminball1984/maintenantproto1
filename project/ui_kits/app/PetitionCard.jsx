// PetitionCard.jsx — Petition card component

const PETITION_CARDS_STYLES = {
  card: {
    background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease', cursor: 'pointer',
  },
  cardHover: { boxShadow: '0 8px 30px rgba(0,0,0,0.10)', transform: 'translateY(-2px)' },
  imgPlaceholder: { height: 140, background: 'linear-gradient(135deg,#1F2937,#374151)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  category: { fontSize: 10, fontWeight: 600, color: '#C1121F', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 },
  title: { fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.35, marginBottom: 6 },
  meta: { fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 },
  progressWrap: { marginTop: 10 },
  progressBar: { height: 5, background: '#F3F4F6', borderRadius: 9999, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(to right,#C1121F,#F4721E)', borderRadius: 9999, transition: 'width 0.6s ease' },
  progressLabels: { display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#9CA3AF' },
};

function PetitionCard({ petition, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const pct = petition.goal ? Math.min(Math.round((petition.signatures / petition.goal) * 100), 100) : 0;

  const categoryColors = {
    'Environnement': '#16A34A', 'Social': '#2563EB', 'Logement': '#D97706',
    'Santé': '#7C3AED', 'Éducation': '#0891B2', 'Justice': '#C1121F',
  };
  const catColor = categoryColors[petition.category] || '#C1121F';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...PETITION_CARDS_STYLES.card, ...(hovered ? PETITION_CARDS_STYLES.cardHover : {}) }}
    >
      {/* Image */}
      <div style={PETITION_CARDS_STYLES.imgPlaceholder}>
        {petition.image ? (
          <img src={petition.image} alt={petition.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, fontFamily: 'Inter,sans-serif' }}>Image pétition</div>
        )}
        {petition.featured && (
          <div style={{ position: 'absolute', top: 8, left: 8, background: 'linear-gradient(to right,#F59E0B,#F4721E)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 9999 }}>⭐ En vedette</div>
        )}
        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 9999, backdropFilter: 'blur(4px)' }}>
          <i data-lucide="users" style={{ width: 10, height: 10, display: 'inline', marginRight: 3 }}></i>
          {petition.signatures?.toLocaleString('fr-FR')} signataires
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ ...PETITION_CARDS_STYLES.category, color: catColor }}>{petition.category}</div>
        <div style={PETITION_CARDS_STYLES.title}>{petition.title}</div>
        <div style={PETITION_CARDS_STYLES.meta}>
          <i data-lucide="map-pin" style={{ width: 11, height: 11, color: '#9CA3AF', flexShrink: 0 }}></i>
          <span>{petition.location || 'France'}</span>
        </div>
        {petition.goal && (
          <div style={PETITION_CARDS_STYLES.progressWrap}>
            <div style={PETITION_CARDS_STYLES.progressBar}>
              <div style={{ ...PETITION_CARDS_STYLES.progressFill, width: `${pct}%` }}></div>
            </div>
            <div style={PETITION_CARDS_STYLES.progressLabels}>
              <span style={{ fontWeight: 600, color: '#C1121F' }}>{pct}%</span>
              <span>Objectif : {petition.goal.toLocaleString('fr-FR')}</span>
            </div>
          </div>
        )}
        <button style={{
          marginTop: 10, width: '100%', height: 36, background: hovered ? 'linear-gradient(to right,#C1121F,#F4721E)' : '#F9FAFB',
          color: hovered ? '#fff' : '#C1121F', border: hovered ? 'none' : '1.5px solid #FECACA',
          borderRadius: 9999, fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter,sans-serif',
        }}>
          ✍️ Signer cette pétition
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { MPetitionCard: PetitionCard });
