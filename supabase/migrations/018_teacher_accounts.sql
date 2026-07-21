-- 018_teacher_accounts.sql — Phase 2: multi-tenant teacher accounts + class ownership.
-- Applied to prod via MCP. Additive + idempotent.
create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  password_hash text,
  password_salt text,
  is_admin boolean not null default false,
  plan text not null default 'free',
  status text not null default 'active',
  created_at timestamptz not null default now()
);
alter table classes add column if not exists teacher_id uuid references teachers(id) on delete set null;
create index if not exists idx_classes_teacher on classes(teacher_id);
create table if not exists redemption_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  plan text not null default 'teacher',
  note text,
  redeemed_by_teacher_id uuid references teachers(id) on delete set null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_redemption_unredeemed on redemption_codes(code) where redeemed_at is null;
insert into teachers (email, name, is_admin, plan, status)
values ('eva@thesisters.org', 'Eva', true, 'admin', 'active')
on conflict (email) do update set is_admin = true;
update classes set teacher_id = (select id from teachers where is_admin order by created_at limit 1) where teacher_id is null;
alter table teachers enable row level security;
alter table redemption_codes enable row level security;
drop policy if exists teachers_all_anon on teachers;
create policy teachers_all_anon on teachers for all using (true) with check (true);
drop policy if exists redemption_all_anon on redemption_codes;
create policy redemption_all_anon on redemption_codes for all using (true) with check (true);
