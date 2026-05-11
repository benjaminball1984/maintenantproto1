// Headers CORS partagés entre les Edge Functions. On garde une allow-list stricte
// (origines connues : dev local + futur staging + futur prod). En attendant les
// déploiements réels on autorise les variantes localhost pour `vite dev`.
const ORIGIN_ALLOWLIST: readonly string[] = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

export function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ORIGIN_ALLOWLIST.includes(origin) ? origin : ORIGIN_ALLOWLIST[0];
  return {
    'access-control-allow-origin': allow,
    'access-control-allow-headers':
      'authorization, x-client-info, apikey, content-type, stripe-signature',
    'access-control-allow-methods': 'POST, OPTIONS',
    vary: 'origin',
  };
}

export function jsonResponse(
  body: unknown,
  init: { status?: number; origin?: string | null } = {},
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(init.origin ?? null),
    },
  });
}
