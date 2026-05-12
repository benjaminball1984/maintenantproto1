# Load testing — k6

Smoke + load tests pour les endpoints publics Supabase. Cible : valider que
la combinaison Supabase Pro (région EU) + cache Vercel CDN tient un pic
électoral / annonce médiatique (~50 utilisateurs simultanés).

## Pré-requis

```bash
brew install k6   # ou https://k6.io/docs/get-started/installation/
```

## Variables d'environnement

| Var | Valeur | Note |
| --- | --- | --- |
| `SUPABASE_URL` | `https://<project-id>.supabase.co` | projet de **test** uniquement |
| `SUPABASE_ANON_KEY` | clé anon (jamais service_role) | |
| `PETITION_SLUG` | slug d'une pétition publiée de test | pour le scénario lecture |

## Scénarios

```bash
# Smoke : 1 VU, 10 itérations — vérifie que les endpoints répondent.
k6 run web/load/smoke.js

# Charge : 50 VUs pendant 2 min — vérifie le SLA p95 < 500 ms.
k6 run web/load/petitions-read.js
```

## Règles

- **Aucun écrit** sur un projet Supabase prod. Les scénarios d'écriture
  (`signature_insert`) sont **désactivés par défaut** ; ils s'activent
  uniquement avec `--env WRITE=1` sur un projet de test isolé.
- **Pas de RLS bypass** : tous les appels passent par la clé anon. Si une
  policy bloque l'opération, c'est qu'elle est correctement configurée.
- **Cleanup** : si tu actives `WRITE=1`, tronque la table `signatures` à
  la fin (`delete from public.signatures where created_at > now() - interval '1 hour'`).

## SLO cibles

| Endpoint | p50 | p95 | error rate |
| --- | --- | --- | --- |
| `GET /rest/v1/petitions?...` | < 100 ms | < 500 ms | < 0.5 % |
| `GET /rest/v1/petitions?slug=eq.X` | < 80 ms | < 300 ms | < 0.1 % |
| `POST /rest/v1/signatures` (test only) | < 150 ms | < 700 ms | < 1 % |

Reporting : k6 affiche le résumé en fin de run. Pour persister, ajouter
`--out json=load-result.json` et committer dans `web/load/results/` (à
créer si besoin).
