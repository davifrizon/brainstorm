-- =========================================================
-- Brainstorm — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`)
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text not null default 'Friend',
  avatar_url text,
  status text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- boards
-- ---------------------------------------------------------
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Untitled board',
  emoji text not null default '🧠',
  owner_id uuid not null references public.profiles (id) on delete cascade,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists boards_owner_idx on public.boards (owner_id);

create table if not exists public.board_members (
  board_id uuid not null references public.boards (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member', 'viewer')),
  joined_at timestamptz not null default now(),
  primary key (board_id, user_id)
);

create index if not exists board_members_user_idx on public.board_members (user_id);

-- Auto-add the creator as owner member.
create or replace function public.handle_new_board()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.board_members (board_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_board_created on public.boards;
create trigger on_board_created
  after insert on public.boards
  for each row execute procedure public.handle_new_board();

-- ---------------------------------------------------------
-- frames (categories / sections on the canvas)
-- ---------------------------------------------------------
create table if not exists public.frames (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  name text not null default 'New frame',
  color text not null default '#8b8fa3',
  x double precision not null default 0,
  y double precision not null default 0,
  width double precision not null default 480,
  height double precision not null default 360,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists frames_board_idx on public.frames (board_id);

-- ---------------------------------------------------------
-- notes (sticky notes)
-- ---------------------------------------------------------
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  frame_id uuid references public.frames (id) on delete set null,
  text text not null default '',
  color text not null default '#fde68a',
  x double precision not null default 0,
  y double precision not null default 0,
  width double precision not null default 220,
  height double precision not null default 200,
  rotation double precision not null default 0,
  z_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_board_idx on public.notes (board_id);
create index if not exists notes_frame_idx on public.notes (frame_id);

-- ---------------------------------------------------------
-- connections (arrows between notes)
-- ---------------------------------------------------------
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  from_note_id uuid not null references public.notes (id) on delete cascade,
  to_note_id uuid not null references public.notes (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists connections_board_idx on public.connections (board_id);

-- ---------------------------------------------------------
-- votes (up / down, one per user per note)
-- ---------------------------------------------------------
create table if not exists public.votes (
  note_id uuid not null references public.notes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (note_id, user_id)
);

-- ---------------------------------------------------------
-- stars (favorite)
-- ---------------------------------------------------------
create table if not exists public.stars (
  note_id uuid not null references public.notes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (note_id, user_id)
);

-- ---------------------------------------------------------
-- reactions (emoji)
-- ---------------------------------------------------------
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (note_id, user_id, emoji)
);

create index if not exists reactions_note_idx on public.reactions (note_id);

-- ---------------------------------------------------------
-- comments
-- ---------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_note_idx on public.comments (note_id);

-- ---------------------------------------------------------
-- activity feed
-- ---------------------------------------------------------
create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_board_idx on public.activity (board_id, created_at desc);

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.board_members enable row level security;
alter table public.frames enable row level security;
alter table public.notes enable row level security;
alter table public.connections enable row level security;
alter table public.votes enable row level security;
alter table public.stars enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.activity enable row level security;

-- Helper: is the current user a member of a given board?
create or replace function public.is_board_member(target_board_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.board_members
    where board_id = target_board_id and user_id = auth.uid()
  );
$$;

create or replace function public.board_role(target_board_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.board_members
  where board_id = target_board_id and user_id = auth.uid();
$$;

-- profiles: readable by anyone signed in, editable only by owner.
create policy "profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- boards: visible to members, insertable by any signed-in user, editable by owner.
create policy "members can view their boards"
  on public.boards for select
  to authenticated
  using (public.is_board_member(id));

create policy "authenticated users can create boards"
  on public.boards for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "owners can update their boards"
  on public.boards for update
  to authenticated
  using (public.board_role(id) = 'owner');

create policy "owners can delete their boards"
  on public.boards for delete
  to authenticated
  using (public.board_role(id) = 'owner');

-- board_members
create policy "members can view membership of their boards"
  on public.board_members for select
  to authenticated
  using (public.is_board_member(board_id));

create policy "members can join via invite (self insert)"
  on public.board_members for insert
  to authenticated
  with check (user_id = auth.uid() or public.board_role(board_id) = 'owner');

create policy "owners manage members, users can remove themselves"
  on public.board_members for delete
  to authenticated
  using (user_id = auth.uid() or public.board_role(board_id) = 'owner');

create policy "owners can change member roles"
  on public.board_members for update
  to authenticated
  using (public.board_role(board_id) = 'owner');

-- generic "board content" policy helper applied to frames/notes/connections/activity
create policy "members can view frames" on public.frames for select to authenticated using (public.is_board_member(board_id));
create policy "members can write frames" on public.frames for insert to authenticated with check (public.is_board_member(board_id));
create policy "members can update frames" on public.frames for update to authenticated using (public.is_board_member(board_id));
create policy "members can delete frames" on public.frames for delete to authenticated using (public.is_board_member(board_id));

create policy "members can view notes" on public.notes for select to authenticated using (public.is_board_member(board_id));
create policy "members can create notes" on public.notes for insert to authenticated with check (public.is_board_member(board_id));
create policy "members can update notes" on public.notes for update to authenticated using (public.is_board_member(board_id));
create policy "members can delete notes" on public.notes for delete to authenticated using (public.is_board_member(board_id));

create policy "members can view connections" on public.connections for select to authenticated using (public.is_board_member(board_id));
create policy "members can create connections" on public.connections for insert to authenticated with check (public.is_board_member(board_id));
create policy "members can delete connections" on public.connections for delete to authenticated using (public.is_board_member(board_id));

create policy "members can view activity" on public.activity for select to authenticated using (public.is_board_member(board_id));
create policy "members can post activity" on public.activity for insert to authenticated with check (public.is_board_member(board_id));

-- votes / stars / reactions / comments: scoped through the parent note's board.
create policy "members can view votes" on public.votes for select to authenticated
  using (exists (select 1 from public.notes n where n.id = note_id and public.is_board_member(n.board_id)));
create policy "members can cast votes" on public.votes for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.notes n where n.id = note_id and public.is_board_member(n.board_id)));
create policy "members can change own vote" on public.votes for update to authenticated
  using (user_id = auth.uid());
create policy "members can remove own vote" on public.votes for delete to authenticated
  using (user_id = auth.uid());

create policy "members can view stars" on public.stars for select to authenticated
  using (exists (select 1 from public.notes n where n.id = note_id and public.is_board_member(n.board_id)));
create policy "members can star" on public.stars for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.notes n where n.id = note_id and public.is_board_member(n.board_id)));
create policy "members can unstar" on public.stars for delete to authenticated
  using (user_id = auth.uid());

create policy "members can view reactions" on public.reactions for select to authenticated
  using (exists (select 1 from public.notes n where n.id = note_id and public.is_board_member(n.board_id)));
create policy "members can react" on public.reactions for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.notes n where n.id = note_id and public.is_board_member(n.board_id)));
create policy "members can remove own reaction" on public.reactions for delete to authenticated
  using (user_id = auth.uid());

create policy "members can view comments" on public.comments for select to authenticated
  using (exists (select 1 from public.notes n where n.id = note_id and public.is_board_member(n.board_id)));
create policy "members can comment" on public.comments for insert to authenticated
  with check (author_id = auth.uid() and exists (select 1 from public.notes n where n.id = note_id and public.is_board_member(n.board_id)));
create policy "members can delete own comments" on public.comments for delete to authenticated
  using (author_id = auth.uid());

-- =========================================================
-- Realtime
-- =========================================================
alter publication supabase_realtime add table public.notes;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.reactions;
alter publication supabase_realtime add table public.votes;
alter publication supabase_realtime add table public.stars;
alter publication supabase_realtime add table public.frames;
alter publication supabase_realtime add table public.connections;
alter publication supabase_realtime add table public.activity;
alter publication supabase_realtime add table public.board_members;
