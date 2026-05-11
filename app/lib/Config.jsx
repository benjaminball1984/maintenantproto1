// Config.jsx — Configuration globale Maintenant!
// Lit window.MN_CONFIG si défini (injecté dans index.html ou via config.local.js),
// sinon utilise les valeurs par défaut (mode offline localStorage).

(function () {
  const defaults = {
    // Supabase — si vide, mode offline localStorage activé
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    SUPABASE_STORAGE_BUCKET: 'media',
    // Stripe — si vide, paiement simulé
    STRIPE_PUBLISHABLE_KEY: '',
    // Branding / site settings (éditables admin)
    SITE_NAME: 'Maintenant !',
    SITE_TAGLINE: 'La voix des 99%',
    SITE_URL: 'https://maintenant.org',
    SITE_LOGO_URL: '',
    DEFAULT_LOCALE: 'fr',
    // Feature flags
    ENABLE_REALTIME: true,
    ENABLE_RICHTEXT: true,
    ENABLE_COOKIE_BANNER: true,
    ENABLE_DEV_TWEAKS: true,
    // Storage keys
    LS_PREFIX: 'mn_v3_',
    // Quotas
    MAX_IMAGE_MB: 5,
    MAX_LOCAL_STORAGE_MB: 8
  };
  const injected = (typeof window !== 'undefined' && window.MN_CONFIG) || {};
  const CONFIG = Object.assign({}, defaults, injected);

  // Mode "online" si on a une URL + clé Supabase
  CONFIG.ONLINE = !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);

  // Build Supabase client si dispo
  let supabaseClient = null;
  if (CONFIG.ONLINE && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: CONFIG.LS_PREFIX + 'sb_auth' }
      });
    } catch (e) {
      console.warn('[Config] Supabase init failed, fallback offline:', e);
      CONFIG.ONLINE = false;
    }
  }

  window.MN = window.MN || {};
  window.MN.config = CONFIG;
  window.MN.supabase = supabaseClient;
  window.MN.ls = (k) => CONFIG.LS_PREFIX + k;
})();
