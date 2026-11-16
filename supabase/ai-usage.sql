-- Journal d'utilisation des fonctions IA, pour limiter les abus
-- (remplissage express du profil, aperçu gratuit de la lettre de motivation).
-- À exécuter une fois dans Supabase → SQL Editor.

create table if not exists public.ai_usage (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  kind        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists ai_usage_user_kind_created_idx
  on public.ai_usage (user_id, kind, created_at desc);

-- Accès réservé au serveur (clé service_role) : aucune règle pour les visiteurs
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon, authenticated;
