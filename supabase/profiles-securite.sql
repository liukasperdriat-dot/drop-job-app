-- À exécuter UNE FOIS dans Supabase → SQL Editor, AVANT de déployer la branche
-- fix/paiement-premium.
--
-- 1. Empêche un utilisateur connecté de modifier lui-même sa ligne `profiles`
--    (sinon il pourrait écrire is_premium = true depuis la console du navigateur).
--    Seul le serveur (clé service_role : webhook Stripe, génération de CV)
--    peut désormais écrire dans cette table. La lecture reste possible.
revoke insert, update, delete on table public.profiles from anon, authenticated;

-- 2. Ajoute la période du compteur de CV gratuits, pour qu'il reparte
--    à zéro automatiquement chaque mois (format 'AAAA-MM').
alter table public.profiles
  add column if not exists cv_count_period text;

-- Vérification (doit afficher uniquement SELECT pour authenticated) :
-- select grantee, privilege_type from information_schema.role_table_grants
-- where table_schema = 'public' and table_name = 'profiles'
--   and grantee in ('anon', 'authenticated');
