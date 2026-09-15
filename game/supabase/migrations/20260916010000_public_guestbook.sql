begin;

-- This view intentionally exposes only the public guestbook fields, not auth IDs or photo files.
create view public.guestbook_entries with (security_barrier = true) as
select id, name, side, message, avatar, created_at
from public.guest_messages;
revoke all on public.guestbook_entries from public, anon, authenticated;
grant select on public.guestbook_entries to anon, authenticated;

commit;
