// LegalPages.jsx — Pages légales obligatoires (FR)
// Stub : structure et headings prêts, contenu à rédiger par un·e juriste
const { useState } = React;

function LegalStubPage({ title, intro, sections, lastUpdate }) {
  return (
    <div style={{ background: T.bg, minHeight: '60vh' }}>
      <PageContainer maxWidth={780}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Maintenant ! · Légal</div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(28px,5vw,42px)', fontWeight: 800, color: T.text1, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{title}</h1>
          {lastUpdate && <p style={{ fontSize: 13, color: T.text4, marginTop: 12 }}>Dernière mise à jour : {lastUpdate}</p>}
        </div>

        <div style={{ background: T.warnLight, border: `1px solid ${T.warning}`, borderRadius: 12, padding: '14px 18px', marginBottom: 28, fontSize: 13, color: T.warning, lineHeight: 1.55 }}>
          <strong>⚠ Document à rédiger par un·e juriste.</strong> Cette page est un placeholder structurel généré automatiquement. Le contenu définitif doit être validé juridiquement avant mise en production.
        </div>

        {intro && <p style={{ fontSize: 16, color: T.text2, lineHeight: 1.7, margin: '0 0 32px' }}>{intro}</p>}

        {sections.map((s, i) => (
          <section key={i} style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: T.text1, margin: '0 0 14px', letterSpacing: '-0.02em' }}>{s.title}</h2>
            {s.body && <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.7, margin: '0 0 12px' }}>{s.body}</p>}
            {s.placeholder && (
              <div style={{ background: T.surface2, border: `1.5px dashed ${T.borderDark}`, borderRadius: 10, padding: '14px 16px', fontSize: 13, color: T.text3, fontStyle: 'italic', lineHeight: 1.6 }}>
                À compléter : {s.placeholder}
              </div>
            )}
          </section>
        ))}
      </PageContainer>
    </div>
  );
}

// ── Mentions légales ──────────────────────────────────────
function LegalPage() {
  return <LegalStubPage
    title="Mentions légales"
    lastUpdate="à définir"
    intro="Conformément aux dispositions de la loi n°2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, les présentes mentions légales identifient l'éditeur, l'hébergeur et les responsables du site Maintenant !."
    sections={[
      { title: 'Éditeur du site', placeholder: 'Raison sociale, forme juridique (association loi 1901, SCIC, etc.), adresse du siège social, n° SIREN/SIRET, n° de déclaration en préfecture si association, directeur·trice de la publication.' },
      { title: 'Hébergeur', placeholder: 'Nom, raison sociale et adresse de l\'hébergeur (ex. OVH, Scaleway), téléphone.' },
      { title: 'Propriété intellectuelle', body: 'L\'ensemble du site (textes, photos, logo, design) relève de la législation française et internationale sur le droit d\'auteur. Toute reproduction est soumise à autorisation préalable.', placeholder: 'Mentionner les éventuelles licences (Creative Commons, AGPL pour le code, etc.).' },
      { title: 'Crédits', placeholder: 'Crédits photo (Unsplash + photographes), polices (Google Fonts — Inter, Sora), équipe de développement.' },
      { title: 'Médiation de la consommation', placeholder: 'Si activité commerciale (paiements T99CP/€), coordonnées du médiateur de la consommation.' },
    ]}
  />;
}
window.LegalPage = LegalPage;

// ── CGU ───────────────────────────────────────────────────
function CguPage() {
  return <LegalStubPage
    title="Conditions générales d'utilisation"
    lastUpdate="à définir"
    intro="Les présentes CGU régissent l'utilisation de la plateforme Maintenant !. En créant un compte ou en utilisant les services, vous acceptez ces conditions."
    sections={[
      { title: '1. Objet et champ d\'application', placeholder: 'Description du mouvement Maintenant !, des services proposés (pétitions, mobilisations, marketplace, SEL, hébergement solidaire, etc.) et des publics concernés.' },
      { title: '2. Inscription et comptes', placeholder: 'Conditions d\'inscription (âge minimum, données obligatoires), distinction compte simple / adhérent·e, gestion des mots de passe, suppression de compte.' },
      { title: '3. Adhésion au mouvement', placeholder: 'Statut d\'adhérent·e, cotisation gratuite/12 T99CP/12 €, droits associés (accès Communes Libres, Assemblée Confédérale), durée et renouvellement.' },
      { title: '4. Monnaie T99CP', placeholder: 'Nature de la T99CP (crypto-actif sur Polygon, parité 1 T99CP = 1 € = 1 minute), modalités d\'acquisition, de cession, fiscalité, lien avec the99coinproject.org. Avertissement risque crypto.' },
      { title: '5. Marketplace, SEL, hébergement, covoiturage', placeholder: 'Règles spécifiques à chaque service : responsabilité des utilisateurs, modération, annulation, frais de port (€/Polygon), litiges.' },
      { title: '6. Pétitions, cagnottes, mobilisations', placeholder: 'Charte de modération, contenus interdits (haine, désinformation), procédure de signalement.' },
      { title: '7. Communes Libres et Assemblée', placeholder: 'Fonctionnement démocratique, élection des binômes, tirage au sort, votes, statut juridique.' },
      { title: '8. Modération et sanctions', placeholder: 'Niveaux de sanction (avertissement, suspension, exclusion), recours possibles.' },
      { title: '9. Responsabilité', body: 'Maintenant ! met en œuvre les moyens raisonnables pour assurer la disponibilité du service mais ne peut garantir une absence totale de bug ou d\'interruption.', placeholder: 'Limitation de responsabilité, force majeure, contenus tiers.' },
      { title: '10. Modification des CGU', placeholder: 'Procédure de modification, notification aux utilisateurs, droit de résiliation.' },
      { title: '11. Droit applicable et juridiction compétente', body: 'Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.' },
    ]}
  />;
}
window.CguPage = CguPage;

// ── RGPD ──────────────────────────────────────────────────
function RgpdPage() {
  return <LegalStubPage
    title="Politique de confidentialité (RGPD)"
    lastUpdate="à définir"
    intro="Maintenant ! s'engage à protéger les données personnelles de ses utilisateurs et utilisatrices conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés."
    sections={[
      { title: 'Responsable du traitement', placeholder: 'Identité du responsable de traitement, coordonnées du DPO (Délégué à la Protection des Données) si désigné, formulaire de contact.' },
      { title: 'Données collectées', placeholder: 'Liste exhaustive : nom, email, téléphone, code postal, IP, données de navigation (cookies), historique des actions (signatures, contributions, transactions T99CP), avatar, bio. Distinguer adhérent·e / non-adhérent·e.' },
      { title: 'Finalités du traitement', placeholder: 'Création de compte, gestion adhésion, mise en relation entre membres (covoit, hébergement, SEL), envoi de newsletters/actualités, modération, statistiques anonymisées.' },
      { title: 'Base légale', placeholder: 'Consentement (newsletter), contrat (adhésion), intérêt légitime (sécurité), obligation légale (comptabilité).' },
      { title: 'Durée de conservation', placeholder: 'Compte actif : durée de l\'inscription. Compte inactif : 3 ans après dernière connexion. Données fiscales : 10 ans.' },
      { title: 'Destinataires des données', placeholder: 'Hébergeur, Stripe (paiements €), Polygon (transactions T99CP, données publiques par nature blockchain), Resend (emails), partenaires éventuels.' },
      { title: 'Cookies et traceurs', placeholder: 'Liste des cookies utilisés, finalités, durées, bouton de gestion du consentement.' },
      { title: 'Droits des personnes', body: 'Vous disposez des droits suivants : accès, rectification, effacement, limitation, portabilité, opposition. Pour les exercer, contactez-nous via le formulaire dédié ou par email.' },
      { title: 'Réclamation auprès de la CNIL', body: 'Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL : www.cnil.fr.' },
      { title: 'Sécurité', placeholder: 'Mesures techniques et organisationnelles : chiffrement TLS, hashage des mots de passe, journalisation, sauvegardes.' },
    ]}
  />;
}
window.RgpdPage = RgpdPage;

// ── Contact ───────────────────────────────────────────────
function ContactPage({ setPage }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const inputCss = { width: '100%', height: 46, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '0 14px', fontSize: 14, fontFamily: 'Inter,sans-serif', color: T.text1, background: T.surface, outline: 'none', boxSizing: 'border-box' };
  const submit = e => {
    e.preventDefault();
    setSent(true);
    if (window.showToast) window.showToast('Votre message a bien été enregistré (mode prototype)', { type: 'success' });
  };

  return (
    <div style={{ background: T.bg, minHeight: '60vh' }}>
      <PageContainer maxWidth={680}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Maintenant ! · Contact</div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 'clamp(28px,5vw,42px)', fontWeight: 800, color: T.text1, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Nous contacter</h1>
          <p style={{ fontSize: 16, color: T.text3, marginTop: 14, lineHeight: 1.65 }}>Une question, une remarque, un signalement ? Écrivez-nous, nous répondons sous 5 jours ouvrés.</p>
        </div>

        {sent ? (
          <div style={{ background: T.successLight, border: `1px solid ${T.success}`, borderRadius: 14, padding: 28, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.success, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>{ICONS.check}</div>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: T.success, margin: '0 0 6px' }}>Message bien reçu</h3>
            <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>Nous reviendrons vers vous à <strong>{form.email || 'votre email'}</strong>.</p>
            <Btn variant="ghost" size="sm" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }} style={{ marginTop: 14 }}>Envoyer un autre message</Btn>
          </div>
        ) : (
          <form onSubmit={submit} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.text2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nom</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputCss} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.text2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inputCss} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.text2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sujet</label>
              <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required style={inputCss}>
                <option value="">— Choisir —</option>
                <option value="adhesion">Question sur l'adhésion</option>
                <option value="t99cp">Question sur le T99CP / wallet</option>
                <option value="moderation">Signalement / modération</option>
                <option value="bug">Bug / problème technique</option>
                <option value="presse">Demande presse</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: T.text2, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Message</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={6} style={{ ...inputCss, height: 'auto', padding: '12px 14px', resize: 'vertical', lineHeight: 1.5 }} />
            </div>
            <Btn variant="gradient" size="lg" full icon={ICONS.send} onClick={submit}>Envoyer le message</Btn>
            <p style={{ fontSize: 11, color: T.text4, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
              En envoyant ce message, vous acceptez notre <a href="#rgpd" onClick={e => { e.preventDefault(); setPage && setPage('rgpd'); }} style={{ color: T.brand, textDecoration: 'underline' }}>politique de confidentialité</a>.
            </p>
          </form>
        )}
      </PageContainer>
    </div>
  );
}
window.ContactPage = ContactPage;
