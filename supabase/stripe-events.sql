-- À exécuter UNE FOIS dans Supabase → SQL Editor (Lot 4 : paiement Stripe).
--
-- Journal des événements reçus par le webhook Stripe (/api/webhooks/stripe) :
-- - évite de traiter deux fois le même événement (Stripe peut le renvoyer) ;
-- - garde une trace des échecs ('failed') et des paiements à rattacher à la
--   main ('needs_review' : paiement reçu mais compte introuvable).
-- Seul le serveur (clé service_role) y accède.

create table if not exists public.stripe_events (
  id            text primary key,            -- identifiant Stripe de l'événement (evt_…)
  type          text not null,
  livemode      boolean not null default false,
  status        text not null default 'processing'
                check (status in ('processing', 'processed', 'ignored', 'needs_review', 'failed')),
  note          text,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz
);

create index if not exists stripe_events_status_idx on public.stripe_events (status, received_at desc);

alter table public.stripe_events enable row level security;
revoke all on table public.stripe_events from anon, authenticated;

-- Paiements à vérifier :
-- select * from public.stripe_events where status in ('failed', 'needs_review') order by received_at desc;
