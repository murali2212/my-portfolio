-- =====================================================================
-- Run this whole file once in Supabase > SQL Editor.
-- Then run STEP 2 at the bottom (after you create your user).
-- =====================================================================

-- ---------- admins + is_admin() ----------
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- projects ----------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  status text not null default '',
  image_path text,
  overview text,
  problem text,
  features text[] not null default '{}',
  how_it_works text[] not null default '{}',
  stack text[] not null default '{}',
  highlights text[] not null default '{}',
  security text[] not null default '{}',
  github_url text,
  live_url text,
  folder text,
  my_role text,
  credit text,
  sort_order int not null default 0,
  published boolean not null default false,
  deleted_at timestamptz,          -- soft delete = Trash
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

-- ---------- version history (append-only) ----------
create table public.content_versions (
  id bigint generated always as identity primary key,
  entity_type text not null default 'project',
  entity_id uuid not null,
  version_no int not null,
  action text not null,            -- create | update | delete | restore | purge
  snapshot jsonb not null,
  changed_by uuid,
  created_at timestamptz not null default now()
);
create index on public.content_versions (entity_id, version_no);

create or replace function public.log_project_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.projects;
  act text;
  n int;
begin
  if tg_op = 'DELETE' then
    rec := old;
    act := 'purge';
  else
    rec := new;
    if tg_op = 'INSERT' then
      act := 'create';
    elsif old.deleted_at is null and new.deleted_at is not null then
      act := 'delete';
    elsif old.deleted_at is not null and new.deleted_at is null then
      act := 'restore';
    else
      act := 'update';
    end if;
  end if;

  select coalesce(max(version_no), 0) + 1 into n
  from public.content_versions where entity_id = rec.id;

  insert into public.content_versions (entity_id, version_no, action, snapshot, changed_by)
  values (rec.id, n, act, to_jsonb(rec), auth.uid());

  return null;
end $$;

create trigger projects_log
after insert or update or delete on public.projects
for each row execute function public.log_project_change();

-- ---------- Row Level Security ----------
alter table public.admins enable row level security;
alter table public.projects enable row level security;
alter table public.content_versions enable row level security;

-- projects: public can only read published, non-deleted rows
create policy "public reads published" on public.projects
  for select to anon, authenticated
  using (published = true and deleted_at is null);

-- projects: only the admin can read everything and write
create policy "admin reads all" on public.projects
  for select to authenticated using (public.is_admin());
create policy "admin inserts" on public.projects
  for insert to authenticated with check (public.is_admin());
create policy "admin updates" on public.projects
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes" on public.projects
  for delete to authenticated using (public.is_admin());

-- history: admin can read; nobody can insert/update/delete directly
create policy "admin reads history" on public.content_versions
  for select to authenticated using (public.is_admin());
revoke all on public.content_versions from anon, authenticated;
grant select on public.content_versions to authenticated;

-- admins table: not readable from the browser at all (use is_admin())
revoke all on public.admins from anon, authenticated;

-- ---------- image bucket ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 2097152,
        array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "admin uploads images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'project-images' and public.is_admin());
create policy "admin updates images" on storage.objects
  for update to authenticated
  using (bucket_id = 'project-images' and public.is_admin());
create policy "admin deletes images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'project-images' and public.is_admin());

-- =====================================================================
-- STEP 2 (run separately, AFTER you create your user in
-- Authentication > Users with "Auto Confirm User" ticked):
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'YOUR_EMAIL_HERE';
--
-- Then turn OFF public sign-ups in the Authentication settings.
-- =====================================================================
