-- 025_password_resets.sql
-- Teacher password reset. Open beta means strangers with accounts, and there
-- was previously no way for a teacher who forgot their password to get back in
-- at all — the only recovery was asking the owner to edit the database.
--
-- Tokens are stored HASHED. A leak of this table must not let anyone reset an
-- account, so the raw token exists only in the link that goes to the teacher.
-- Tokens are single-use and short-lived.

create table if not exists password_resets (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references teachers(id) on delete cascade,
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_password_resets_teacher on password_resets(teacher_id);
create index if not exists idx_password_resets_hash    on password_resets(token_hash);

alter table password_resets enable row level security;
drop policy if exists "password_resets_all_anon" on password_resets;
create policy "password_resets_all_anon" on password_resets for all using (true) with check (true);
