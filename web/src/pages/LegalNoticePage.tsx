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
      <p style={subtitleStyle}>Dernière mise à jour : 15 mai 2026</p>

      <section>
        <h2 style={h2Style}>Éditeur</h2>
        <dl style={dlStyle}>
          <dt style={dtStyle}>Raison sociale</dt>
          <dd>Association Maintenant !</dd>
          <dt style={dtStyle}>Forme juridique</dt>
          <dd>
            Association loi 1901 en cours d&rsquo;enregistrement à la préfecture du Val
            d&rsquo;Oise (mai 2026).
          </dd>
          <dt style={dtStyle}>Siège social</dt>
          <dd>27 rue de Paradis, 95100 Argenteuil, France</dd>
          <dt style={dtStyle}>SIRET</dt>
          <dd>
            En cours d&rsquo;attribution (déclaration en préfecture du Val d&rsquo;Oise, mai
            2026). Publié dès réception du récépissé officiel.
          </dd>
          <dt style={dtStyle}>Directeur de la publication</dt>
          <dd>
            Le bureau de l&rsquo;association (à publier nominativement à la finalisation de
            l&rsquo;enregistrement préfectoral).
          </dd>
          <dt style={dtStyle}>Contact</dt>
          <dd>
            <a href="mailto:contact@maintenant.org">contact@maintenant.org</a> &middot;{' '}
            <a href="tel:+33649985753">06 49 98 57 53</a>
          </dd>
        </dl>
      </section>

      <section>
        <h2 style={h2Style}>Hébergement</h2>
        <dl style={dlStyle}>
          <dt style={dtStyle}>Front (site web)</dt>
          <dd>Netlify, Inc. — réseau CDN mondial (UE incluse).</dd>
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
