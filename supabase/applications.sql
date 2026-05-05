-- Run this in the Supabase SQL editor

create table if not exists applications (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  job_id      text,
  job_title   text        not null,
  company     text        not null,
  location    text,
  contract    text,
  salary      text,
  status      text        default 'En cours' not null,
  created_at  timestamptz default now() not null
);

alter table applications enable row level security;

create policy "select_own" on applications for select using (auth.uid() = user_id);
create policy "insert_own" on applications for insert with check (auth.uid() = user_id);
create policy "update_own" on applications for update using (auth.uid() = user_id);
create policy "delete_own" on applications for delete using (auth.uid() = user_id);
