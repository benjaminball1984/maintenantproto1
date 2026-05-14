import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import Accordion, { type AccordionItem } from '@/components/Accordion';

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
  fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  margin: '0 0 1rem',
  color: 'var(--mn-text-1)',
};

const linkStyle: CSSProperties = {
  color: 'var(--mn-brand)',
  fontWeight: 600,
};

const footerNoteStyle: CSSProperties = {
  marginTop: '2.5rem',
  padding: '1.25rem 1.5rem',
  borderRadius: 14,
  background: 'var(--mn-surface-2)',
  border: '1px solid var(--mn-border)',
  color: 'var(--mn-text-2)',
  fontSize: 14,
  lineHeight: 1.6,
};

interface FaqCategory {
  id: string;
  title: string;
  items: AccordionItem[];
}

const ACCOUNT_ITEMS: AccordionItem[] = [
  {
    id: 'account-signup',
    question: 'Comment créer un compte sur Maintenant ?',
    answer: (
      <>
        Clique sur « Se connecter » dans le bandeau du haut puis sur
        l’onglet « S’inscrire ». Tu peux choisir un courriel +
        mot de passe, ou utiliser Google / Instagram. Le compte est gratuit, sans
        carte bancaire requise.
      </>
    ),
  },
  {
    id: 'account-login',
    question: 'Je n’arrive pas à me connecter, que faire ?',
    answer: (
      <>
        Vérifie que le courriel saisi est exactement celui utilisé à
        l’inscription. Si tu as oublié ton mot de passe, utilise le lien
        « Mot de passe oublié » dans la modale d’identification —
        un lien de réinitialisation est envoyé en quelques minutes.
      </>
    ),
  },
  {
    id: 'account-reset',
    question: 'Comment réinitialiser mon mot de passe ?',
    answer: (
      <>
        Dans la modale de connexion, clique sur « Mot de passe oublié ».
        Tu reçois un courriel avec un lien sécurisé valable 1 h. Le lien ouvre la
        page <code>/auth/reset-password</code> où tu choisis un nouveau mot de
        passe (minimum 12 caractères).
      </>
    ),
  },
  {
    id: 'account-delete',
    question: 'Puis-je supprimer mon compte définitivement ?',
    answer: (
      <>
        Oui. Depuis ton <Link to="/profile" style={linkStyle}>profil</Link>, la
        section « Mon compte » expose un bouton de suppression. La
        suppression efface tes données personnelles sous 30 jours (cf.{' '}
        <Link to="/legal/privacy" style={linkStyle}>Politique de confidentialité</Link>).
      </>
    ),
  },
];

const RGPD_ITEMS: AccordionItem[] = [
  {
    id: 'rgpd-data',
    question: 'Quelles données personnelles Maintenant collecte-t-il ?',
    answer: (
      <>
        Le minimum nécessaire au fonctionnement : ton courriel, ton
        pseudo / nom public, et les contenus que tu publies (pétitions,
        commentaires, etc.). Aucun pistage publicitaire, pas de cookies tiers de
        mesure d’audience. Détails dans la{' '}
        <Link to="/legal/privacy" style={linkStyle}>Politique de confidentialité</Link>.
      </>
    ),
  },
  {
    id: 'rgpd-export',
    question: 'Comment exporter mes données ?',
    answer: (
      <>
        Tu peux demander un export complet (JSON) de tes données depuis ton{' '}
        <Link to="/profile" style={linkStyle}>profil</Link>, rubrique « Mes
        données ». L’export inclut tes signatures, RSVP, votes, posts et
        messages. Réponse sous 30 jours (Art. 15 RGPD).
      </>
    ),
  },
  {
    id: 'rgpd-right-to-erasure',
    question: 'Quel est mon droit à l’oubli ?',
    answer: (
      <>
        Tu peux demander la suppression de tes données à tout moment (Art. 17
        RGPD). Exceptions : les signatures publiques de pétitions et les
        votes restent conservés sous pseudonyme pour préserver l’intégrité
        des décomptes (anonymisation, pas suppression).
      </>
    ),
  },
  {
    id: 'rgpd-region',
    question: 'Où sont hébergées mes données ?',
    answer: (
      <>
        Sur des serveurs en Union européenne (région Supabase EU). Aucun transfert
        hors UE. Sauvegardes chiffrées au repos et en transit.
      </>
    ),
  },
];

const T99CP_ITEMS: AccordionItem[] = [
  {
    id: 't99cp-what',
    question: 'Qu’est-ce que le T99CP ?',
    answer: (
      <>
        Le T99CP (« Token 99% Citoyen Public ») est un jeton symbolique
        d’adhésion au mouvement. Chaque adhésion payée émet 1 jeton — le
        compteur cumulé est public sur la page{' '}
        <Link to="/transparence" style={linkStyle}>Transparence</Link>.
      </>
    ),
  },
  {
    id: 't99cp-how',
    question: 'Comment obtenir un T99CP ?',
    answer: (
      <>
        En adhérant via la page <Link to="/join" style={linkStyle}>Rejoindre</Link>.
        Trois paliers d’adhésion (libre, soutien, mécène) — tous donnent
        droit à 1 jeton. Le paiement est sécurisé par Stripe.
      </>
    ),
  },
  {
    id: 't99cp-rights',
    question: 'Le T99CP donne-t-il des droits particuliers ?',
    answer: (
      <>
        Pas encore. À terme, il servira de preuve d’adhésion pour participer
        aux décisions associatives (AG, votes internes). La gouvernance est en
        cours d’écriture — la roadmap est publique sur{' '}
        <Link to="/roadmap" style={linkStyle}>/roadmap</Link>.
      </>
    ),
  },
  {
    id: 't99cp-transferable',
    question: 'Le T99CP est-il transférable ou monnayable ?',
    answer: (
      <>
        Non. C’est un jeton non transférable, non monnayable, attaché à un
        compte. Il n’a aucune valeur marchande — sa valeur est symbolique
        (signe d’adhésion) et politique (poids dans la gouvernance future).
      </>
    ),
  },
];

const STRIPE_ITEMS: AccordionItem[] = [
  {
    id: 'stripe-safe',
    question: 'Est-ce que le paiement par Stripe est sécurisé ?',
    answer: (
      <>
        Oui. Stripe est un prestataire de paiement certifié PCI-DSS niveau 1.
        Maintenant ! ne voit jamais ton numéro de carte — il transite
        directement de ton navigateur vers Stripe via une connexion chiffrée.
      </>
    ),
  },
  {
    id: 'stripe-refund',
    question: 'Puis-je être remboursé de mon adhésion ?',
    answer: (
      <>
        Oui, sous 14 jours après le paiement (droit de rétractation). Contacte-nous
        via la <Link to="/legal/contact" style={linkStyle}>page Contact</Link> en
        précisant l’adresse courriel du compte. Remboursement traité sous 5
        jours ouvrés.
      </>
    ),
  },
  {
    id: 'stripe-data',
    question: 'Quelles données de paiement sont conservées ?',
    answer: (
      <>
        Seulement les 4 derniers chiffres de carte, le pays d’émission et le
        montant — pour audit comptable. Ces données sont purgées automatiquement
        au bout de 90 jours (cf.{' '}
        <Link to="/legal/privacy" style={linkStyle}>Politique de confidentialité</Link>).
      </>
    ),
  },
];

const MODERATION_ITEMS: AccordionItem[] = [
  {
    id: 'mod-report',
    question: 'Comment signaler un contenu problématique ?',
    answer: (
      <>
        Chaque pétition / mobilisation / post du réseau social expose un lien
        « Signaler ». Le signalement arrive dans la file de modération
        et est traité sous 72 h ouvrées.
      </>
    ),
  },
  {
    id: 'mod-rules',
    question: 'Quelles sont les règles de modération ?',
    answer: (
      <>
        Pas de discours de haine, pas d’appel à la violence, pas de
        publicité commerciale. Les règles détaillées sont dans les{' '}
        <Link to="/legal/notice" style={linkStyle}>mentions légales</Link>{' '}
        § Code de bonne conduite.
      </>
    ),
  },
  {
    id: 'mod-sanctions',
    question: 'Quelles sont les sanctions possibles ?',
    answer: (
      <>
        Trois niveaux : avertissement, suspension temporaire (7 à 30 jours),
        bannissement définitif. Toute sanction est notifiée par courriel avec
        motif et procédure d’appel.
      </>
    ),
  },
  {
    id: 'mod-appeal',
    question: 'Comment contester une sanction ?',
    answer: (
      <>
        Réponds au courriel de notification dans les 14 jours, en exposant ton
        point de vue. Un·e modérateur·rice tiers réexamine le dossier — décision
        finale sous 21 jours.
      </>
    ),
  },
];

const CATEGORIES: FaqCategory[] = [
  { id: 'account', title: 'Compte', items: ACCOUNT_ITEMS },
  { id: 'rgpd', title: 'Données personnelles & RGPD', items: RGPD_ITEMS },
  { id: 't99cp', title: 'Adhésion & T99CP', items: T99CP_ITEMS },
  { id: 'stripe', title: 'Paiement Stripe', items: STRIPE_ITEMS },
  { id: 'moderation', title: 'Modération & signalement', items: MODERATION_ITEMS },
];

const TOTAL_QUESTIONS: number = CATEGORIES.reduce(
  (acc: number, cat: FaqCategory): number => acc + cat.items.length,
  0,
);

function renderCategorySection(category: FaqCategory): ReactNode {
  return (
    <section
      key={category.id}
      style={sectionStyle}
      aria-labelledby={`faq-cat-${category.id}-title`}
      data-testid={`faq-category-${category.id}`}
    >
      <h2 id={`faq-cat-${category.id}-title`} style={h2Style}>
        {category.title}
      </h2>
      <Accordion
        items={category.items}
        ariaLabel={`Questions ${category.title}`}
        testId={`faq-accordion-${category.id}`}
      />
    </section>
  );
}

export default function FaqPage() {
  return (
    <main style={pageStyle}>
      <p style={eyebrowStyle}>Aide & questions fréquentes</p>
      <h1 style={h1Style}>Foire aux questions</h1>
      <p style={leadStyle}>
        Les réponses aux {TOTAL_QUESTIONS} questions les plus fréquentes,
        regroupées par thème. Tu ne trouves pas ? Écris-nous via la{' '}
        <Link to="/legal/contact" style={linkStyle}>page Contact</Link>.
      </p>

      {CATEGORIES.map((cat) => renderCategorySection(cat))}

      <aside style={footerNoteStyle} aria-label="Plus d'informations">
        <strong>Encore une question ?</strong> Consulte la{' '}
        <Link to="/decouvrir" style={linkStyle}>page Découvrir</Link> pour le
        contexte général, la{' '}
        <Link to="/transparence" style={linkStyle}>page Transparence</Link> pour
        les chiffres clés, ou contacte-nous via la{' '}
        <Link to="/legal/contact" style={linkStyle}>page Contact</Link>.
      </aside>
    </main>
  );
}
