export default function PrivacyPage() {
  return (
    <section className="container mx-auto px-4 py-12 max-w-3xl prose-petition">
      <h1 className="font-display text-4xl text-bca-green-dark mb-6">
        Politique de confidentialité
      </h1>

      <p>
        Cette page explique comment Bio Consom'acteurs (ci-après « BCA ») collecte et
        traite vos données personnelles dans le cadre de la pétition{' '}
        <em>Pas de pesticides pour nos enfants</em>.
      </p>

      <h2>1. Responsable de traitement</h2>
      <p>
        <strong>Bio Consom'acteurs</strong>, association loi 1901, 10 rue Beaumarchais,
        93100 Montreuil. Délégué à la protection des données :{' '}
        <a href="mailto:contact@bioconsomacteurs.org" className="underline">
          contact@bioconsomacteurs.org
        </a>
        .
      </p>

      <h2>2. Données collectées et finalités</h2>
      <ul>
        <li>
          <strong>Signature de la pétition</strong> : prénom, nom, email, code postal,
          téléphone (facultatif). Finalité : recueillir et porter votre signature auprès
          des décideur·euses politiques. Base légale : intérêt légitime de l'association
          dans le cadre de son objet associatif (pétition citoyenne).
        </li>
        <li>
          <strong>Newsletter Bio Consom'infos</strong> : email. Finalité : vous informer
          des actions de BCA. Base légale : consentement (case décochée par défaut, opt-in
          actif).
        </li>
        <li>
          <strong>Commande de matériel</strong> : adresse postale complète. Finalité :
          expédier le matériel commandé. Base légale : exécution contractuelle.
        </li>
        <li>
          <strong>Organisation d'une distribution</strong> : prénom, email, téléphone,
          lieu, date. Finalité : enregistrer et coordonner les distributions, afficher la
          mobilisation sur la carte publique <em>uniquement avec votre consentement</em>.
        </li>
      </ul>

      <h2>3. Destinataires</h2>
      <p>
        Vos données sont traitées par BCA et ses sous-traitants :
        <strong> Supabase</strong> (base de données, UE),{' '}
        <strong>Resend</strong> (emails transactionnels, UE),{' '}
        <strong>Stripe</strong> (paiement des frais de port, UE/US, certifié DPF) et{' '}
        <strong>Netlify</strong> (hébergement, US, sous Standard Contractual Clauses).
        Vos données ne sont jamais vendues ni cédées à des tiers à des fins commerciales.
      </p>

      <h2>4. Durée de conservation</h2>
      <ul>
        <li>Signatures : 3 ans après la fin de la campagne.</li>
        <li>Newsletter : jusqu'à désinscription.</li>
        <li>Commandes : 5 ans (obligation comptable).</li>
        <li>Distributions passées : 1 an.</li>
      </ul>

      <h2>5. Vos droits</h2>
      <p>
        Vous disposez d'un droit d'accès, de rectification, de suppression, d'opposition,
        de limitation et de portabilité sur vos données. Vous pouvez les exercer à tout
        moment en écrivant à{' '}
        <a href="mailto:contact@bioconsomacteurs.org" className="underline">
          contact@bioconsomacteurs.org
        </a>
        . Vous avez également le droit d'introduire une réclamation auprès de la CNIL{' '}
        (
        <a
          href="https://www.cnil.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          cnil.fr
        </a>
        ).
      </p>

      <h2>6. Cookies</h2>
      <p>
        Ce site n'utilise <strong>pas</strong> de cookie traceur. Seul un stockage local
        technique (localStorage) est utilisé pour pré-remplir les pages d'engagement après
        votre signature ; il ne quitte jamais votre navigateur.
      </p>
    </section>
  );
}
