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

const tocStyle: CSSProperties = {
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  borderRadius: 12,
  padding: '1rem 1.25rem',
  margin: '0 0 2.5rem',
};

const h2Style: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: '1.25rem',
  marginTop: '2.5rem',
  marginBottom: '0.75rem',
};

const dlStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(160px, auto) 1fr',
  gap: '0.5rem 1rem',
  margin: '0.5rem 0 0',
};

const dtStyle: CSSProperties = {
  fontWeight: 600,
  color: 'var(--mn-text-2)',
};

const sections: { id: string; label: string }[] = [
  { id: 'responsable', label: 'Responsable de traitement' },
  { id: 'finalites', label: 'Finalités' },
  { id: 'base-legale', label: 'Base légale' },
  { id: 'donnees', label: 'Données collectées' },
  { id: 'conservation', label: 'Durées de conservation' },
  { id: 'sous-traitants', label: 'Sous-traitants' },
  { id: 'droits', label: 'Vos droits RGPD' },
  { id: 'dpo', label: 'Contact DPO' },
];

export default function PrivacyPage() {
  return (
    <main style={pageStyle}>
      <h1 style={h1Style}>Politique de confidentialité</h1>
      <p style={subtitleStyle}>Dernière mise à jour : 11 mai 2026 — version 1.0</p>

      <nav aria-label="Sommaire" style={tocStyle}>
        <strong style={{ display: 'block', marginBottom: 8 }}>Sommaire</strong>
        <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.label}</a>
            </li>
          ))}
        </ol>
      </nav>

      <section id="responsable">
        <h2 style={h2Style}>1. Responsable de traitement</h2>
        <p>
          Le traitement des données à caractère personnel collectées sur le site Maintenant ! est
          sous la responsabilité de l&apos;association Maintenant !, domiciliée en France. Les
          coordonnées complètes figurent dans les <Link to="/legal/notice">mentions légales</Link>.
        </p>
      </section>

      <section id="finalites">
        <h2 style={h2Style}>2. Finalités du traitement</h2>
        <ul>
          <li>Gestion des comptes utilisateurs (inscription, authentification, profil).</li>
          <li>
            Permettre la publication et la consultation des contenus militants : pétitions,
            mobilisations, sondages, campagnes.
          </li>
          <li>
            Permettre l&apos;accès aux services communautaires (hébergement, covoiturage, partage,
            jardins, SEL, marketplace, cagnottes).
          </li>
          <li>Gestion des adhésions et du dispositif T99CP.</li>
          <li>Communication entre membres (messagerie privée, notifications).</li>
          <li>Mesure d&apos;audience anonymisée (uniquement avec votre consentement).</li>
          <li>Modération, sécurité, prévention des abus.</li>
        </ul>
      </section>

      <section id="base-legale">
        <h2 style={h2Style}>3. Base légale</h2>
        <p>Les traitements reposent sur trois fondements distincts selon les finalités :</p>
        <dl style={dlStyle}>
          <dt style={dtStyle}>Contrat</dt>
          <dd>
            Création de compte, services rendus, adhésion : exécution des conditions
            d&apos;utilisation auxquelles vous avez souscrit.
          </dd>
          <dt style={dtStyle}>Consentement</dt>
          <dd>
            Mesure d&apos;audience anonymisée, signature de pétition, réception de notifications. Le
            consentement peut être retiré à tout moment.
          </dd>
          <dt style={dtStyle}>Intérêt légitime</dt>
          <dd>
            Modération, sécurité, prévention des abus, journaux techniques d&apos;exploitation,
            anti-fraude.
          </dd>
        </dl>
      </section>

      <section id="donnees">
        <h2 style={h2Style}>4. Données collectées</h2>
        <ul>
          <li>Identité : nom affiché, ville, photo de profil (facultative).</li>
          <li>Coordonnées : email (obligatoire), téléphone (facultatif).</li>
          <li>
            Contenus publiés : pétitions, mobilisations, sondages, campagnes, articles, posts,
            commentaires, messages privés.
          </li>
          <li>
            Engagements : signatures, votes, participations — incluant l&apos;identifiant
            utilisateur (transparence des soutiens publics).
          </li>
          <li>
            Données techniques : journaux d&apos;authentification, horodatages, identifiants de
            session. Aucune adresse IP n&apos;est conservée après la session sauf pour la sécurité
            (incidents).
          </li>
          <li>
            Paiement : aucune donnée bancaire n&apos;est stockée chez nous — la transaction est
            intégralement opérée par Stripe.
          </li>
        </ul>
      </section>

      <section id="conservation">
        <h2 style={h2Style}>5. Durées de conservation</h2>
        <ul>
          <li>
            Compte utilisateur : actif tant que le compte existe ; supprimé sur demande (effacement
            complet sous 30 jours).
          </li>
          <li>Contenus publiés : conservés tant que l&apos;auteur ne les retire pas.</li>
          <li>
            Signatures et votes : conservés pour l&apos;intégrité du compteur, anonymisés au retrait
            du compte.
          </li>
          <li>Messages privés : 24 mois après le dernier échange.</li>
          <li>Journaux techniques de sécurité : 12 mois maximum.</li>
          <li>Documents comptables (adhésions) : 10 ans (obligation légale).</li>
        </ul>
      </section>

      <section id="sous-traitants">
        <h2 style={h2Style}>6. Sous-traitants</h2>
        <ul>
          <li>
            <strong>Supabase</strong> — hébergement base de données + authentification. Région UE
            (Francfort). Contrat DPA signé.
          </li>
          <li>
            <strong>Vercel</strong> — hébergement front. Région UE.
          </li>
          <li>
            <strong>Stripe</strong> — traitement des paiements adhésion. PCI-DSS niveau 1.
          </li>
          <li>
            <strong>Sentry</strong> — supervision des erreurs applicatives. Données personnelles
            filtrées avant envoi (aucun email, téléphone, adresse).
          </li>
        </ul>
        <p>
          Aucun transfert hors UE n&apos;est effectué pour les données de comptes ou de contenus
          militants.
        </p>
      </section>

      <section id="droits">
        <h2 style={h2Style}>7. Vos droits RGPD</h2>
        <p>Vous disposez à tout moment des droits suivants :</p>
        <ul>
          <li>Droit d&apos;accès, de rectification et d&apos;effacement.</li>
          <li>Droit à la limitation et à l&apos;opposition au traitement.</li>
          <li>Droit à la portabilité (export des données au format JSON).</li>
          <li>Droit de retirer votre consentement à tout moment.</li>
          <li>
            Droit d&apos;introduire une réclamation auprès de la CNIL (
            <a href="https://www.cnil.fr" rel="noopener noreferrer" target="_blank">
              cnil.fr
            </a>
            ).
          </li>
        </ul>
      </section>

      <section id="dpo">
        <h2 style={h2Style}>8. Contact DPO</h2>
        <p>
          Pour exercer vos droits ou pour toute question relative à la protection des données,
          contactez notre délégué à la protection des données à l&apos;adresse indiquée dans les{' '}
          <Link to="/legal/notice">mentions légales</Link>.
        </p>
      </section>
    </main>
  );
}
