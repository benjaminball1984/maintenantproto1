import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

const pageStyle: CSSProperties = {
  maxWidth: 800,
  margin: '0 auto',
  padding: '2.5rem 1.5rem 4rem',
  color: 'var(--mn-text-1)',
  lineHeight: 1.65,
};

const h1Style: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
  letterSpacing: '-0.02em',
  margin: '0 0 0.5rem',
};

const subtitleStyle: CSSProperties = {
  color: 'var(--mn-text-3)',
  fontSize: 14,
  margin: '0 0 2rem',
};

const h2Style: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: '1.25rem',
  marginTop: '2rem',
  marginBottom: '0.5rem',
};

const dlStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(180px, auto) 1fr',
  gap: '0.5rem 1rem',
  margin: 0,
};

const dtStyle: CSSProperties = {
  fontWeight: 600,
  color: 'var(--mn-text-2)',
};

export default function LegalNoticePage() {
  return (
    <main style={pageStyle}>
      <h1 style={h1Style}>Mentions légales</h1>
      <p style={subtitleStyle}>Dernière mise à jour : 11 mai 2026</p>

      <section>
        <h2 style={h2Style}>Éditeur</h2>
        <dl style={dlStyle}>
          <dt style={dtStyle}>Raison sociale</dt>
          <dd>Association Maintenant !</dd>
          <dt style={dtStyle}>Forme juridique</dt>
          <dd>Association loi 1901</dd>
          <dt style={dtStyle}>Siège social</dt>
          <dd>À compléter avant mise en production</dd>
          <dt style={dtStyle}>SIRET</dt>
          <dd>À compléter avant mise en production</dd>
          <dt style={dtStyle}>Directeur de la publication</dt>
          <dd>À compléter avant mise en production</dd>
          <dt style={dtStyle}>Contact</dt>
          <dd>À compléter avant mise en production</dd>
        </dl>
      </section>

      <section>
        <h2 style={h2Style}>Hébergement</h2>
        <dl style={dlStyle}>
          <dt style={dtStyle}>Front (site web)</dt>
          <dd>Vercel Inc. — région UE.</dd>
          <dt style={dtStyle}>Base de données et authentification</dt>
          <dd>Supabase Inc. — région UE (Francfort).</dd>
          <dt style={dtStyle}>Paiements</dt>
          <dd>Stripe Payments Europe Ltd.</dd>
        </dl>
      </section>

      <section>
        <h2 style={h2Style}>Propriété intellectuelle</h2>
        <p>
          Les marques, logos, signes distinctifs et contenus éditoriaux affichés sur ce site
          appartiennent à leurs détenteurs respectifs. Toute reproduction sans autorisation
          préalable est interdite. Les contributions des utilisateurs restent la propriété de leurs
          auteurs.
        </p>
      </section>

      <section>
        <h2 style={h2Style}>Liens utiles</h2>
        <p>
          Pour en savoir plus sur le traitement de vos données, consultez la{' '}
          <Link to="/legal/privacy">politique de confidentialité</Link> et la{' '}
          <Link to="/legal/cookies">page cookies</Link>.
        </p>
      </section>
    </main>
  );
}
