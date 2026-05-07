export default function LegalPage() {
  return (
    <section className="container mx-auto px-4 py-12 max-w-3xl prose-petition">
      <h1 className="font-display text-4xl text-bca-green-dark mb-6">Mentions légales</h1>

      <h2>Éditeur du site</h2>
      <p>
        <strong>Bio Consom'acteurs</strong> — Association loi 1901
        <br />
        10 rue Beaumarchais, 93100 Montreuil, France
        <br />
        Email :{' '}
        <a href="mailto:contact@bioconsomacteurs.org" className="underline">
          contact@bioconsomacteurs.org
        </a>
        <br />
        Site institutionnel :{' '}
        <a
          href="https://bioconsomacteurs.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          bioconsomacteurs.org
        </a>
      </p>

      <h2>Directrice / Directeur de la publication</h2>
      <p>
        Présidence de l'association Bio Consom'acteurs (à renseigner précisément avant
        mise en ligne publique).
      </p>

      <h2>Hébergeur</h2>
      <p>
        Netlify, Inc. — 512 2nd Street, Suite 200, San Francisco, CA 94107, États-Unis.{' '}
        <br />
        Les données personnelles sont stockées chez Supabase (région Europe — Francfort)
        et les emails transactionnels acheminés par Resend (UE).
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Sauf mention contraire, l'ensemble des contenus (textes, illustrations,
        photographies, logos) sont la propriété de Bio Consom'acteurs ou de leurs auteurs
        respectifs et ne peuvent être reproduits sans autorisation écrite préalable.
      </p>

      <h2>Crédits</h2>
      <p>
        Cartographie : OpenStreetMap contributors. Icônes : Lucide. Polices :
        Bagel Fat One, Caveat Brush, Inter (Google Fonts).
      </p>
    </section>
  );
}
