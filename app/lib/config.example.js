// app/lib/config.example.js
// Copier ce fichier en `app/lib/config.local.js` (gitignoré) et remplir les valeurs.
// Sans ce fichier, l'application démarre en mode offline (localStorage).
//
// Pour activer Supabase :
//   1. Créer un projet sur https://supabase.com (région EU pour RGPD)
//   2. Settings → API : copier l'URL du projet et la clé anon (public)
//   3. Settings → Storage : créer un bucket public nommé "media"
//   4. SQL Editor : exécuter db/schema.sql
//   5. Renseigner ci-dessous puis recharger
//
// IMPORTANT : ne jamais committer la clé service_role côté front.

window.MN_CONFIG = {
  // ── Supabase ───────────────────────────────────────────────
  SUPABASE_URL: '',                  // ex: 'https://xxxxx.supabase.co'
  SUPABASE_ANON_KEY: '',             // clé anon publique
  SUPABASE_STORAGE_BUCKET: 'media',

  // ── Stripe (paiements adhésion + cagnottes) ────────────────
  STRIPE_PUBLISHABLE_KEY: '',        // ex: 'pk_test_...'

  // ── Branding (overridable depuis l'admin) ──────────────────
  SITE_NAME: 'Maintenant !',
  SITE_TAGLINE: 'La voix des 99%',
  SITE_URL: 'https://maintenant.org',
  SITE_LOGO_URL: '',

  // ── Feature flags ──────────────────────────────────────────
  ENABLE_REALTIME: true,
  ENABLE_RICHTEXT: true,
  ENABLE_COOKIE_BANNER: true,
  ENABLE_DEV_TWEAKS: true,           // tweaks panel admin en bas à droite

  // ── Quotas client ──────────────────────────────────────────
  MAX_IMAGE_MB: 5,
  MAX_LOCAL_STORAGE_MB: 8
};
