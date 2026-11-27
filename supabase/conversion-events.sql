-- À exécuter UNE FOIS dans Supabase → SQL Editor.
--
-- Journal des conversions, alimenté uniquement par le serveur (clé service_role) :
--   signup             inscription (une fois par compte)
--   profile_completed  profil rempli : nom, titre et au moins une expérience (une fois par compte)
--   cv_generated       CV généré avec succès
--   checkout_opened    page de paiement Stripe ouverte
--   subscription_paid  abonnement payé (webhook Stripe, source de vérité)
--
-- Aucun cookie ni identifiant n'est déposé sur l'appareil des visiteurs : les
-- événements sont enregistrés côté serveur, rattachés au compte concerné.
-- Tant que ce script n'est pas exécuté, le site fonctionne normalement
-- (les événements sont simplement ignorés).

create table if not exists public.conversion_events (
  id          bigint generated always as identity primary key,
  event       text not null check (event in ('signup', 'profile_completed', 'cv_generated', 'checkout_opened', 'subscription_paid')),
  user_id     uuid references auth.users (id) on delete cascade,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- Inscription et profil complété : comptés une seule fois par compte
create unique index if not exists conversion_events_once_per_user
  on public.conversion_events (user_id, event)
  where event in ('signup', 'profile_completed');

-- Abonnement payé : une seule ligne par session Stripe (rejeu du webhook)
create unique index if not exists conversion_events_checkout_session
  on public.conversion_events ((metadata ->> 'checkout_session'))
  where event = 'subscription_paid';

create index if not exists conversion_events_event_date
  on public.conversion_events (event, created_at desc);

-- Lecture et écriture réservées au serveur
alter table public.conversion_events enable row level security;
revoke all on table public.conversion_events from anon, authenticated;

-- Entonnoir des 30 derniers jours (à lancer dans le SQL Editor) :
-- select event, count(*) as total, count(distinct user_id) as comptes
-- from public.conversion_events
-- where created_at > now() - interval '30 days'
-- group by event
-- order by array_position(array['signup','profile_completed','cv_generated','checkout_opened','subscription_paid'], event);
