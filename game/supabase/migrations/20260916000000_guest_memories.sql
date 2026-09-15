begin;

create table public.guest_messages (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(btrim(name)) between 1 and 20),
  side text not null check (side in ('groom', 'bride')),
  message text not null check (char_length(btrim(message)) between 1 and 1000),
  avatar jsonb not null default '{}'::jsonb check (jsonb_typeof(avatar) = 'object'),
  created_at timestamptz not null default now()
);
create index guest_messages_user_created on public.guest_messages(user_id, created_at);
alter table public.guest_messages enable row level security;
revoke all on public.guest_messages from anon, authenticated;
grant select, insert on public.guest_messages to authenticated;
create policy own_messages_read on public.guest_messages for select to authenticated
  using ((select auth.uid()) = user_id);
create policy own_messages_insert on public.guest_messages for insert to authenticated
  with check ((select auth.uid()) = user_id);

create table public.guest_photos (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(btrim(name)) between 1 and 20),
  side text not null check (side in ('groom', 'bride')),
  kind text not null check (kind in ('booth', 'bridal', 'group')),
  avatar jsonb not null check (jsonb_typeof(avatar) = 'object'),
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  constraint photo_path_owner check (storage_path = user_id::text || '/' || id::text || '.png')
);
create index guest_photos_user_created on public.guest_photos(user_id, created_at);
alter table public.guest_photos enable row level security;
revoke all on public.guest_photos from anon, authenticated;
grant select, insert on public.guest_photos to authenticated;
create policy own_photos_read on public.guest_photos for select to authenticated
  using ((select auth.uid()) = user_id);
create policy own_photos_insert on public.guest_photos for insert to authenticated
  with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('guest-photos', 'guest-photos', false, 2097152, array['image/png']);
create policy own_photo_files_read on storage.objects for select to authenticated
  using (bucket_id = 'guest-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy own_photo_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'guest-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.png$');

commit;
