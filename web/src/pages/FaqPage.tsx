import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

const pageStyle: CSSProperties = {
  maxWidth: 880,
  margin: '0 auto',
  padding: 'clamp(2.5rem, 5vw, 4rem) 1.5rem 4rem',
  color: 'var(--mn-text-1)',
  lineHeight: 1.65,
};

const eyebrowStyle: CSSProperties = {
  display: 'inline-block',
  padding: '0.4rem 0.85rem',
  borderRadius: 999,
  background: 'var(--mn-brand-light)',
  color: 'var(--mn-brand-dark)',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.02em',
  margin: '0 0 1rem',
};

const h1Style: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(2rem, 5vw, 3rem)',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  margin: '0 0 1rem',
  color: 'var(--mn-text-1)',
};

const leadStyle: CSSProperties = {
  fontSize: 'clamp(1rem, 2vw, 1.15rem)',
  lineHeight: 1.6,
  color: 'var(--mn-text-2)',
  margin: '0 0 2.5rem',
};

const sectionStyle: CSSProperties = {
  marginTop: '2.5rem',
};

const h2Style: CSSProperties = {
  fontFamily: "'Sora', sans-serif",
  fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  margin: '0 0 0.75rem',
  color: 'var(--mn-text-1)',
};

const accordionListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  marginTop: '1rem',
};

const detailsStyle: CSSProperties = {
  background: 'var(--mn-surface)',
  border: '1px solid var(--mn-border)',
  borderRadius: 12,
  padding: '0.85rem 1.1rem',
};

const summaryStyle: CSSProperties = {
  cursor: 'pointer',
  fontFamily: "'Sora', sans-serif",
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--mn-text-1)',
  listStyle: 'none',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '0.75rem',
};

const answerStyle: CSSProperties = {
  marginTop: '0.85rem',
  fontSize: 15,
  lineHeight: 1.65,
  color: 'var(--mn-text-2)',
};

const ctaSectionStyle: CSSProperties = {
  marginTop: '3.5rem',
  padding: '1.75rem 1.5rem',
  borderRadius: 14,
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  textAlign: 'center',
};

const ctaTextStyle: CSSProperties = {
  fontSize: 15,
  lineHeight: 1.55,
  color: 'var(--mn-text-2)',
  margin: '0 0 1rem',
};

interface FaqEntry {
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  title: string;
  items: FaqEntry[];
}

const FAQ: FaqCategory[] = [
  {
    id: 'compte',
    title: 'Compte & connexion',
    items: [
      {
        q: 'Comment créer un compte sur Maintenant ! ?',
        a: "Clique sur « Rejoindre » dans le menu, puis renseigne ton e-mail et un mot de passe. Tu peux aussi te connecter via Google ou Instagram si tu préfères. Aucune information autre que ton e-mail n'est obligatoire.",
      },
      {
        q: "J'ai oublié mon mot de passe, comment le réinitialiser ?",
        a: "Sur l'écran de connexion, clique sur « Mot de passe oublié ». Tu recevras un lien sécurisé par e-mail (valable 1 heure) pour en définir un nouveau.",
      },
      {
        q: 'Puis-je changer mon adresse e-mail ou mon nom public ?',
        a: 'Oui — depuis ta page profil, tu peux modifier ton nom d’affichage à tout moment. Le changement d’e-mail nécessite une confirmation par e-mail (sécurité).',
      },
    ],
  },
  {
    id: 'rgpd',
    title: 'Données personnelles & RGPD',
    items: [
      {
        q: 'Quelles données collectez-vous ?',
        a: "Strict minimum : e-mail (obligatoire pour le compte), nom d'affichage (modifiable), et les contributions publiques que tu choisis de faire (signatures, posts, RSVP). Aucun cookie publicitaire, aucun pistage tiers. Détail complet dans la page Confidentialité.",
      },
      {
        q: 'Puis-je exporter mes données ?',
        a: "Oui, depuis ta page profil — bouton « Exporter mes données ». Tu reçois un fichier JSON avec l'intégralité de tes données personnelles sous 30 jours (en pratique sous 48 h).",
      },
      {
        q: 'Comment supprimer mon compte ?',
        a: "Sur ta page profil, bouton « Supprimer mon compte ». La suppression est définitive sous 30 jours (délai légal pour annulation accidentelle). Tes contributions publiques antérieures sont anonymisées (le nom est remplacé par « Compte supprimé »), elles ne disparaissent pas du registre public car elles font partie d'une démarche citoyenne.",
      },
      {
        q: 'Mes données sont-elles hébergées en Europe ?',
        a: "Oui : l'intégralité de la base de données et des fichiers est hébergée dans la région Supabase EU (Francfort, Allemagne). Aucun transfert hors UE n'est effectué. Stripe est notre seul sous-traitant non-UE et son traitement est limité aux données de paiement, conformément aux clauses contractuelles types validées par la CNIL.",
      },
    ],
  },
  {
    id: 't99cp',
    title: 'T99CP — jetons d’adhésion',
    items: [
      {
        q: 'Qu’est-ce qu’un T99CP ?',
        a: "Le T99CP (« Token 99 % Citoyen Participatif ») est l'unité d'adhésion symbolique du mouvement. À chaque adhésion (libre, dès 1 €), tu reçois 1 T99CP — c'est un jeton interne, sans valeur monétaire, qui matérialise ton statut d'adhérent·e. Le compteur cumulé est public sur la page Transparence.",
      },
      {
        q: 'Comment obtenir des T99CP ?',
        a: 'Une seule façon : l’adhésion via la page « Rejoindre ». Trois tiers libres : 1 € symbolique, 12 € standard, 60 € soutien. Tu reçois 1 T99CP par adhésion (renouvelable annuellement).',
      },
      {
        q: 'Les T99CP me donnent-ils des avantages ?',
        a: "Pas d'avantage matériel : le T99CP est un marqueur d'engagement, pas une monnaie. Certaines fonctionnalités (création d'une commune libre, vote sur les sondages internes du mouvement) requièrent d'être adhérent·e. Le détail des droits est dans les statuts associatifs.",
      },
      {
        q: 'Que se passe-t-il si je n’ai pas les moyens d’adhérer ?',
        a: "L'adhésion à 1 € symbolique reste accessible. Si même cette somme est un obstacle, contacte-nous via le formulaire dédié : nous accordons des adhésions gratuites au cas par cas, sans justification demandée. La règle du mouvement : jamais d'exclusion pour des raisons financières.",
      },
    ],
  },
  {
    id: 'stripe',
    title: 'Paiements & Stripe',
    items: [
      {
        q: 'Mon paiement est-il sécurisé ?',
        a: 'Oui : les paiements sont traités par Stripe (PCI DSS niveau 1, le standard le plus élevé du secteur). Maintenant ! ne stocke jamais ton numéro de carte ; seul Stripe le voit. Nous ne conservons que le statut « adhésion confirmée » et un identifiant technique anonyme.',
      },
      {
        q: 'Puis-je obtenir un remboursement ?',
        a: 'Oui, sous 14 jours (droit de rétractation légal pour une transaction en ligne). Au-delà, contacte-nous via le formulaire dédié — les demandes justifiées sont étudiées au cas par cas.',
      },
      {
        q: 'Mon adhésion est-elle déductible des impôts ?',
        a: 'Pas pour le moment. Maintenant ! n’a pas le statut d’association d’intérêt général — c’est un objectif à moyen terme une fois le seuil d’activité atteint.',
      },
    ],
  },
  {
    id: 'moderation',
    title: 'Modération & signalement',
    items: [
      {
        q: 'Comment signaler un contenu inapproprié ?',
        a: 'Chaque pétition, post, mobilisation et profil dispose d’un bouton « Signaler ». Le signalement déclenche une revue manuelle par l’équipe de modération sous 48 h. Tu peux aussi nous contacter directement via le formulaire de la page Contact.',
      },
      {
        q: 'Quelles sont les règles de la communauté ?',
        a: "Trois règles essentielles : respect de la personne (pas d'insulte, pas de harcèlement), respect de la loi (pas d'incitation à la haine, pas d'apologie de violence), et bonne foi militante (pas de désinformation manifeste, pas d'astroturfing). Le détail complet est dans la charte communautaire (lien dans le footer).",
      },
      {
        q: 'Que se passe-t-il en cas d’infraction ?',
        a: "Trois niveaux : (1) avertissement avec retrait du contenu, (2) suspension temporaire de 7 à 30 jours, (3) bannissement définitif sur récidive grave. Toute sanction est notifiée par e-mail et est contestable via la page Contact.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main style={pageStyle}>
      <p style={eyebrowStyle}>Centre d&rsquo;aide</p>
      <h1 style={h1Style}>Questions fréquentes</h1>
      <p style={leadStyle}>
        Compte, RGPD, T99CP, paiement, modération&nbsp;: les réponses aux
        questions qu&rsquo;on nous pose le plus souvent. Tu ne trouves pas
        ta réponse&nbsp;?{' '}
        <Link to="/legal/contact" style={{ color: 'var(--mn-brand)', fontWeight: 600 }}>
          Contacte-nous
        </Link>
        .
      </p>

      {FAQ.map((category) => (
        <section
          key={category.id}
          style={sectionStyle}
          aria-labelledby={`faq-cat-${category.id}-title`}
        >
          <h2 id={`faq-cat-${category.id}-title`} style={h2Style}>
            {category.title}
          </h2>
          <div style={accordionListStyle}>
            {category.items.map((item) => (
              <details key={item.q} style={detailsStyle} data-testid="faq-entry">
                <summary style={summaryStyle}>
                  <span>{item.q}</span>
                  <span aria-hidden style={{ color: 'var(--mn-brand)', fontWeight: 700 }}>
                    +
                  </span>
                </summary>
                <p style={answerStyle}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <section style={ctaSectionStyle} aria-labelledby="faq-cta-title">
        <h2 id="faq-cta-title" style={{ ...h2Style, fontSize: '1.2rem', margin: '0 0 0.5rem' }}>
          Une question reste sans réponse&nbsp;?
        </h2>
        <p style={ctaTextStyle}>
          L&rsquo;équipe répond sous 48&nbsp;heures via le formulaire de
          contact. Pour les sujets sensibles (RGPD, modération), tu reçois
          systématiquement un accusé de réception.
        </p>
        <Link
          to="/legal/contact"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.4rem',
            borderRadius: 10,
            background: 'var(--mn-gradient)',
            color: '#ffffff',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Nous contacter
        </Link>
      </section>
    </main>
  );
}
