-- Speedcat real-time sports booking schema
-- Run this in the Supabase SQL editor (existing project). Safe to re-run.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default 'Speedcat Player',
  avatar_url text,
  bio text default '',
  city text not null default 'Hyderabad',
  locality text not null default 'Gachibowli',
  role text not null default 'player' check (role in ('player', 'host', 'admin')),
  phone text default '',
  favorite_sports jsonb not null default '[]'::jsonb,
  sport_skills jsonb not null default '{}'::jsonb,
  sportsmanship jsonb not null default jsonb_build_object(
    'overallScore', 5,
    'totalReviews', 0,
    'punctuality', 5,
    'teamwork', 5,
    'fairPlay', 5,
    'communication', 5,
    'reliability', 5
  ),
  games_played integer not null default 0,
  games_hosted integer not null default 0,
  friends_count integer not null default 0,
  availability jsonb not null default jsonb_build_object('weekdays', '[]'::jsonb, 'weekends', '[]'::jsonb),
  is_public boolean not null default true,
  contact_privacy text not null default 'friends_only',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venues (
  id text primary key,
  name text not null,
  slug text not null unique,
  sport text not null,
  sports_available jsonb not null default '[]'::jsonb,
  locality text not null,
  city text not null default 'Hyderabad',
  address text,
  map_query text,
  map_link text,
  coordinates jsonb,
  price_per_hour numeric,
  is_price_verified boolean not null default false,
  price_note text,
  rating numeric default 0,
  review_count integer default 0,
  environment text,
  featured_image text,
  images jsonb not null default '[]'::jsonb,
  amenities jsonb not null default '[]'::jsonb,
  opening_hours text,
  is_open_verified boolean not null default true,
  courts_count integer not null default 0,
  description text,
  rules jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  is_popular boolean not null default false,
  verification_badge text default 'Preview Listing',
  host_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.courts (
  id text primary key,
  venue_id text not null references public.venues (id) on delete cascade,
  name text not null,
  type text,
  surface text,
  price_per_hour numeric,
  is_active boolean not null default true
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  venue_id text not null references public.venues (id) on delete cascade,
  court_id text not null references public.courts (id) on delete cascade,
  venue_name text not null,
  sport text not null,
  locality text not null,
  court_name text not null,
  booking_date date not null,
  time_slot text not null,
  duration_hours integer not null default 1,
  court_price numeric not null default 0,
  platform_fee numeric not null default 0,
  taxes numeric not null default 0,
  total_price numeric not null default 0,
  player_name text not null,
  player_email text,
  player_phone text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  reference_code text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists bookings_slot_unique
  on public.bookings (court_id, booking_date, time_slot)
  where status = 'confirmed';

create index if not exists bookings_user_idx on public.bookings (user_id, created_at desc);
create index if not exists bookings_venue_date_idx on public.bookings (venue_id, booking_date);
create index if not exists bookings_group_idx on public.bookings (group_id);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  sport text not null,
  title text not null,
  description text default '',
  match_format text not null default 'Casual Practice',
  venue_id text,
  venue_name text not null,
  locality text not null,
  venue_address text default '',
  is_venue_confirmed boolean not null default true,
  court_name text,
  date date not null,
  start_time text not null,
  end_time text not null,
  duration_hours numeric not null default 1,
  joining_deadline timestamptz,
  players_needed integer not null default 2,
  max_group_size integer not null default 4,
  skill_requirement jsonb not null default '{}'::jsonb,
  host_id uuid not null references public.profiles (id) on delete cascade,
  host_name text not null,
  host_avatar text,
  cost_per_player numeric,
  is_split_cost boolean not null default true,
  equipment_notes text,
  visibility text not null default 'public',
  rules jsonb not null default '[]'::jsonb,
  status text not null default 'Open',
  attendance_confirmed boolean not null default false,
  actual_attendees uuid[] not null default '{}',
  cancellation_reason text,
  created_at timestamptz not null default now()
);

create index if not exists games_status_date_idx on public.games (status, date);
create index if not exists games_host_idx on public.games (host_id);

create table if not exists public.game_participants (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  player_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'player',
  sport_skill text default 'Intermediate',
  joined_at timestamptz not null default now(),
  attended boolean,
  unique (game_id, player_id)
);

create table if not exists public.game_join_requests (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  player_id uuid not null references public.profiles (id) on delete cascade,
  note text,
  sport_skill text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  requested_at timestamptz not null default now(),
  unique (game_id, player_id)
);

create table if not exists public.game_messages (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  sender_id text not null,
  sender_name text not null,
  sender_avatar text,
  content text not null,
  is_system boolean not null default false,
  is_announcement boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  connected_via_game_id uuid references public.games (id) on delete set null,
  games_played_together integer not null default 0,
  last_game_date date,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> addressee_id)
);

create unique index if not exists friendships_pair_unique
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

create table if not exists public.player_ratings (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  sport text not null,
  rater_id uuid not null references public.profiles (id) on delete cascade,
  rated_id uuid not null references public.profiles (id) on delete cascade,
  skill_level text not null,
  punctuality integer not null check (punctuality between 1 and 5),
  teamwork integer not null check (teamwork between 1 and 5),
  fair_play integer not null check (fair_play between 1 and 5),
  reliability integer not null check (reliability between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  check (rater_id <> rated_id),
  unique (game_id, rater_id, rated_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  link text default '/',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_idx
  on public.notifications (recipient_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Profile bootstrap
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_role text;
begin
  chosen_role := coalesce(new.raw_user_meta_data->>'role', 'player');
  if chosen_role not in ('player', 'host', 'admin') then
    chosen_role := 'player';
  end if;

  insert into public.profiles (id, email, full_name, avatar_url, role, locality)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1), 'Speedcat Player'),
    coalesce(
      nullif(new.raw_user_meta_data->>'avatar_url', ''),
      'https://ui-avatars.com/api/?name=' || replace(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), ' ', '+') || '&background=0f172a&color=10b981'
    ),
    chosen_role,
    coalesce(nullif(new.raw_user_meta_data->>'locality', ''), 'Gachibowli')
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.notify_user(
  p_recipient uuid,
  p_title text,
  p_message text,
  p_type text,
  p_link text default '/'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_recipient is null then
    return;
  end if;
  insert into public.notifications (recipient_id, title, message, type, link)
  values (p_recipient, p_title, p_message, p_type, p_link);
end;
$$;

create or replace function public.is_game_participant(p_game_id uuid, p_user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.game_participants
    where game_id = p_game_id and player_id = p_user_id
  );
$$;

-- ---------------------------------------------------------------------------
-- Booking RPC (atomic, overlap-safe)
-- ---------------------------------------------------------------------------

create or replace function public.book_court(
  p_court_id text,
  p_venue_id text,
  p_venue_name text,
  p_sport text,
  p_locality text,
  p_court_name text,
  p_date date,
  p_slots text[],
  p_duration_hours integer,
  p_court_price numeric,
  p_player_name text,
  p_player_phone text,
  p_player_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  slot text;
  group_uuid uuid := gen_random_uuid();
  ref_code text;
  hourly numeric;
  total numeric;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to book a court';
  end if;
  if p_slots is null or array_length(p_slots, 1) is null then
    raise exception 'Select at least one time slot';
  end if;

  hourly := coalesce(p_court_price, 0);
  total := hourly * coalesce(p_duration_hours, array_length(p_slots, 1));
  ref_code := 'SPC-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  foreach slot in array p_slots loop
    insert into public.bookings (
      group_id, user_id, venue_id, court_id, venue_name, sport, locality, court_name,
      booking_date, time_slot, duration_hours, court_price, total_price,
      player_name, player_email, player_phone, status, reference_code
    ) values (
      group_uuid, auth.uid(), p_venue_id, p_court_id, p_venue_name, p_sport, p_locality, p_court_name,
      p_date, slot, p_duration_hours, hourly, total,
      p_player_name, p_player_email, p_player_phone, 'confirmed', ref_code
    );
  end loop;

  perform public.notify_user(
    auth.uid(),
    'Court booked successfully',
    'Your booking at ' || p_venue_name || ' on ' || p_date::text || ' is confirmed (' || ref_code || ').',
    'booking_confirmed',
    '/dashboard/player'
  );

  return jsonb_build_object(
    'group_id', group_uuid,
    'reference_code', ref_code,
    'total_price', total,
    'status', 'confirmed'
  );
exception
  when unique_violation then
    raise exception 'That court and time slot is already booked';
end;
$$;

create or replace function public.cancel_booking(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.bookings%rowtype;
begin
  select * into rec
  from public.bookings
  where group_id = p_group_id and user_id = auth.uid() and status = 'confirmed'
  limit 1;

  if not found then
    raise exception 'Booking not found';
  end if;

  update public.bookings
  set status = 'cancelled'
  where group_id = p_group_id and user_id = auth.uid() and status = 'confirmed';

  perform public.notify_user(
    auth.uid(),
    'Booking cancelled',
    'Your booking at ' || rec.venue_name || ' on ' || rec.booking_date::text || ' was cancelled.',
    'booking_cancelled',
    '/dashboard/player'
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Games RPCs
-- ---------------------------------------------------------------------------

create or replace function public.join_game(p_game_id uuid, p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  g public.games%rowtype;
  cnt integer;
  me public.profiles%rowtype;
  skill text;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to join a game';
  end if;

  select * into me from public.profiles where id = auth.uid();
  select * into g from public.games where id = p_game_id for update;
  if not found then
    raise exception 'Game not found';
  end if;
  if g.status not in ('Open') then
    raise exception 'This game is not open for new players';
  end if;
  if g.host_id = auth.uid() then
    raise exception 'You are already the host of this game';
  end if;
  if exists (select 1 from public.game_participants where game_id = p_game_id and player_id = auth.uid()) then
    raise exception 'You have already joined this game';
  end if;

  select count(*) into cnt from public.game_participants where game_id = p_game_id;
  if cnt >= g.max_group_size then
    update public.games set status = 'Full' where id = p_game_id;
    raise exception 'This game is already full';
  end if;

  skill := coalesce(me.sport_skills -> g.sport ->> 'selfAssessed', 'Intermediate');

  if g.visibility = 'invite-only' then
    insert into public.game_join_requests (game_id, player_id, note, sport_skill, status)
    values (p_game_id, auth.uid(), p_note, skill, 'pending')
    on conflict (game_id, player_id) do update
      set note = excluded.note, status = 'pending', requested_at = now();
    perform public.notify_user(
      g.host_id,
      'New join request',
      coalesce(me.full_name, 'A player') || ' requested to join "' || g.title || '".',
      'join_request',
      '/games/' || p_game_id::text
    );
    return jsonb_build_object('status', 'pending');
  end if;

  insert into public.game_participants (game_id, player_id, role, sport_skill)
  values (p_game_id, auth.uid(), 'player', skill);

  select count(*) into cnt from public.game_participants where game_id = p_game_id;
  if cnt >= g.max_group_size then
    update public.games set status = 'Full' where id = p_game_id;
  end if;

  insert into public.game_messages (game_id, sender_id, sender_name, sender_avatar, content, is_system)
  values (p_game_id, 'system', 'Speedcat', '', coalesce(me.full_name, 'A player') || ' joined the game.', true);

  perform public.notify_user(
    g.host_id,
    'Player joined your game',
    coalesce(me.full_name, 'A player') || ' joined "' || g.title || '".',
    'player_joined',
    '/games/' || p_game_id::text
  );

  return jsonb_build_object('status', 'joined', 'count', cnt);
end;
$$;

create or replace function public.leave_game(p_game_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  g public.games%rowtype;
  me public.profiles%rowtype;
begin
  select * into me from public.profiles where id = auth.uid();
  select * into g from public.games where id = p_game_id for update;
  if not found then
    raise exception 'Game not found';
  end if;
  if g.host_id = auth.uid() then
    raise exception 'Hosts cannot leave. Cancel the game instead.';
  end if;

  delete from public.game_participants
  where game_id = p_game_id and player_id = auth.uid();

  if g.status = 'Full' then
    update public.games set status = 'Open' where id = p_game_id;
  end if;

  insert into public.game_messages (game_id, sender_id, sender_name, sender_avatar, content, is_system)
  values (p_game_id, 'system', 'Speedcat', '', coalesce(me.full_name, 'A player') || ' left the game.', true);

  perform public.notify_user(
    g.host_id,
    'Player left your game',
    coalesce(me.full_name, 'A player') || ' left "' || g.title || '".',
    'player_left',
    '/games/' || p_game_id::text
  );
end;
$$;

create or replace function public.respond_join_request(p_game_id uuid, p_player_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  g public.games%rowtype;
  cnt integer;
  skill text;
begin
  select * into g from public.games where id = p_game_id for update;
  if g.host_id <> auth.uid() then
    raise exception 'Only the host can respond to join requests';
  end if;

  update public.game_join_requests
  set status = case when p_accept then 'accepted' else 'declined' end
  where game_id = p_game_id and player_id = p_player_id and status = 'pending';

  if p_accept then
    select count(*) into cnt from public.game_participants where game_id = p_game_id;
    if cnt >= g.max_group_size then
      raise exception 'Game is already full';
    end if;
    select sport_skill into skill from public.game_join_requests
      where game_id = p_game_id and player_id = p_player_id;
    insert into public.game_participants (game_id, player_id, role, sport_skill)
    values (p_game_id, p_player_id, 'player', coalesce(skill, 'Intermediate'))
    on conflict do nothing;
    select count(*) into cnt from public.game_participants where game_id = p_game_id;
    if cnt >= g.max_group_size then
      update public.games set status = 'Full' where id = p_game_id;
    end if;
    perform public.notify_user(p_player_id, 'Join request accepted', 'You were accepted into "' || g.title || '".', 'request_accepted', '/games/' || p_game_id::text);
  else
    perform public.notify_user(p_player_id, 'Join request update', 'Your request to join "' || g.title || '" was not accepted.', 'request_declined', '/games/' || p_game_id::text);
  end if;
end;
$$;

create or replace function public.complete_game(p_game_id uuid, p_attendee_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  g public.games%rowtype;
  a uuid;
  b uuid;
  i integer;
  j integer;
begin
  select * into g from public.games where id = p_game_id for update;
  if g.host_id <> auth.uid() then
    raise exception 'Only the host can complete this game';
  end if;

  update public.games
  set status = 'Completed',
      attendance_confirmed = true,
      actual_attendees = coalesce(p_attendee_ids, '{}')
  where id = p_game_id;

  update public.game_participants
  set attended = (player_id = any (p_attendee_ids))
  where game_id = p_game_id;

  update public.profiles
  set games_hosted = games_hosted + 1
  where id = g.host_id;

  update public.profiles
  set games_played = games_played + 1
  where id = any (p_attendee_ids);

  if p_attendee_ids is not null then
    for i in 1 .. coalesce(array_length(p_attendee_ids, 1), 0) loop
      a := p_attendee_ids[i];
      perform public.notify_user(a, 'Rate your fellow players', '"' || g.title || '" is completed. Rate skill and sportsmanship.', 'rate_players', '/games/' || p_game_id::text);
      for j in i + 1 .. coalesce(array_length(p_attendee_ids, 1), 0) loop
        b := p_attendee_ids[j];
        insert into public.friendships (requester_id, addressee_id, status, connected_via_game_id, games_played_together, last_game_date, responded_at)
        values (a, b, 'accepted', p_game_id, 1, g.date, now())
        on conflict (least(requester_id, addressee_id), greatest(requester_id, addressee_id))
        do update set
          status = 'accepted',
          games_played_together = public.friendships.games_played_together + 1,
          last_game_date = excluded.last_game_date,
          responded_at = now();
        perform public.notify_user(a, 'New sports friend added', 'You and a fellow player from "' || g.title || '" are now friends.', 'friend_added', '/friends');
        perform public.notify_user(b, 'New sports friend added', 'You and a fellow player from "' || g.title || '" are now friends.', 'friend_added', '/friends');
      end loop;
    end loop;
  end if;
end;
$$;

create or replace function public.cancel_game(p_game_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  g public.games%rowtype;
  pid uuid;
begin
  select * into g from public.games where id = p_game_id for update;
  if g.host_id <> auth.uid() and public.current_role() <> 'admin' then
    raise exception 'Only the host can cancel this game';
  end if;

  update public.games
  set status = 'Cancelled', cancellation_reason = p_reason
  where id = p_game_id;

  for pid in select player_id from public.game_participants where game_id = p_game_id loop
    if pid <> g.host_id then
      perform public.notify_user(pid, 'Game cancelled', '"' || g.title || '" was cancelled: ' || coalesce(p_reason, 'No reason given'), 'game_cancelled', '/games/' || p_game_id::text);
    end if;
  end loop;
end;
$$;

create or replace function public.send_friend_request(p_addressee uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing public.friendships%rowtype;
  me public.profiles%rowtype;
begin
  if auth.uid() is null or auth.uid() = p_addressee then
    raise exception 'Invalid friend request';
  end if;
  select * into me from public.profiles where id = auth.uid();

  select * into existing
  from public.friendships
  where least(requester_id, addressee_id) = least(auth.uid(), p_addressee)
    and greatest(requester_id, addressee_id) = greatest(auth.uid(), p_addressee);

  if found then
    if existing.status = 'accepted' then
      return jsonb_build_object('status', 'accepted');
    end if;
    if existing.addressee_id = auth.uid() and existing.status = 'pending' then
      update public.friendships
      set status = 'accepted', responded_at = now()
      where id = existing.id;
      perform public.notify_user(existing.requester_id, 'Friend request accepted', coalesce(me.full_name, 'A player') || ' accepted your friend request.', 'friend_added', '/friends');
      return jsonb_build_object('status', 'accepted');
    end if;
    return jsonb_build_object('status', existing.status);
  end if;

  insert into public.friendships (requester_id, addressee_id, status)
  values (auth.uid(), p_addressee, 'pending');

  perform public.notify_user(
    p_addressee,
    'New friend request',
    coalesce(me.full_name, 'A player') || ' sent you a friend request.',
    'friend_invite',
    '/friends'
  );

  return jsonb_build_object('status', 'pending');
end;
$$;

create or replace function public.respond_friend_request(p_friendship_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  f public.friendships%rowtype;
  me public.profiles%rowtype;
begin
  select * into f from public.friendships where id = p_friendship_id;
  if f.addressee_id <> auth.uid() then
    raise exception 'Only the recipient can respond';
  end if;
  select * into me from public.profiles where id = auth.uid();

  update public.friendships
  set status = case when p_accept then 'accepted' else 'declined' end,
      responded_at = now()
  where id = p_friendship_id;

  if p_accept then
    perform public.notify_user(f.requester_id, 'Friend request accepted', coalesce(me.full_name, 'A player') || ' accepted your friend request.', 'friend_added', '/friends');
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.venues enable row level security;
alter table public.courts enable row level security;
alter table public.bookings enable row level security;
alter table public.games enable row level security;
alter table public.game_participants enable row level security;
alter table public.game_join_requests enable row level security;
alter table public.game_messages enable row level security;
alter table public.friendships enable row level security;
alter table public.player_ratings enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (is_public = true or auth.uid() = id or public.current_role() = 'admin');

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "venues_select" on public.venues;
create policy "venues_select" on public.venues for select using (true);

drop policy if exists "venues_admin_write" on public.venues;
create policy "venues_admin_write" on public.venues
  for all using (public.current_role() in ('admin', 'host'))
  with check (public.current_role() in ('admin', 'host'));

drop policy if exists "courts_select" on public.courts;
create policy "courts_select" on public.courts for select using (true);

drop policy if exists "courts_admin_write" on public.courts;
create policy "courts_admin_write" on public.courts
  for all using (public.current_role() in ('admin', 'host'))
  with check (public.current_role() in ('admin', 'host'));

drop policy if exists "bookings_select" on public.bookings;
create policy "bookings_select" on public.bookings
  for select using (
    auth.uid() = user_id
    or public.current_role() in ('host', 'admin')
  );

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own" on public.bookings
  for insert with check (auth.uid() = user_id);

drop policy if exists "bookings_update_own" on public.bookings;
create policy "bookings_update_own" on public.bookings
  for update using (auth.uid() = user_id or public.current_role() in ('host', 'admin'));

drop policy if exists "games_select" on public.games;
create policy "games_select" on public.games
  for select using (visibility = 'public' or host_id = auth.uid() or public.is_game_participant(id, auth.uid()) or public.current_role() = 'admin');

drop policy if exists "games_insert_auth" on public.games;
create policy "games_insert_auth" on public.games
  for insert with check (auth.uid() = host_id);

drop policy if exists "games_update_host" on public.games;
create policy "games_update_host" on public.games
  for update using (auth.uid() = host_id or public.current_role() = 'admin');

drop policy if exists "participants_select" on public.game_participants;
create policy "participants_select" on public.game_participants for select using (true);

drop policy if exists "participants_insert" on public.game_participants;
create policy "participants_insert" on public.game_participants
  for insert with check (auth.uid() = player_id or exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid()));

drop policy if exists "participants_delete" on public.game_participants;
create policy "participants_delete" on public.game_participants
  for delete using (auth.uid() = player_id or exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid()));

drop policy if exists "join_req_select" on public.game_join_requests;
create policy "join_req_select" on public.game_join_requests
  for select using (
    player_id = auth.uid()
    or exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
  );

drop policy if exists "join_req_insert" on public.game_join_requests;
create policy "join_req_insert" on public.game_join_requests
  for insert with check (player_id = auth.uid());

drop policy if exists "join_req_update" on public.game_join_requests;
create policy "join_req_update" on public.game_join_requests
  for update using (
    exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid())
    or player_id = auth.uid()
  );

drop policy if exists "messages_select" on public.game_messages;
create policy "messages_select" on public.game_messages
  for select using (public.is_game_participant(game_id, auth.uid()) or exists (select 1 from public.games g where g.id = game_id and g.host_id = auth.uid()));

drop policy if exists "messages_insert" on public.game_messages;
create policy "messages_insert" on public.game_messages
  for insert with check (public.is_game_participant(game_id, auth.uid()) or sender_id = 'system');

drop policy if exists "friends_select" on public.friendships;
create policy "friends_select" on public.friendships
  for select using (requester_id = auth.uid() or addressee_id = auth.uid());

drop policy if exists "friends_insert" on public.friendships;
create policy "friends_insert" on public.friendships
  for insert with check (requester_id = auth.uid());

drop policy if exists "friends_update" on public.friendships;
create policy "friends_update" on public.friendships
  for update using (requester_id = auth.uid() or addressee_id = auth.uid());

drop policy if exists "friends_delete" on public.friendships;
create policy "friends_delete" on public.friendships
  for delete using (requester_id = auth.uid() or addressee_id = auth.uid());

drop policy if exists "ratings_select" on public.player_ratings;
create policy "ratings_select" on public.player_ratings for select using (true);

drop policy if exists "ratings_insert" on public.player_ratings;
create policy "ratings_insert" on public.player_ratings
  for insert with check (rater_id = auth.uid());

drop policy if exists "notifs_select" on public.notifications;
create policy "notifs_select" on public.notifications
  for select using (recipient_id = auth.uid());

drop policy if exists "notifs_update" on public.notifications;
create policy "notifs_update" on public.notifications
  for update using (recipient_id = auth.uid());

drop policy if exists "notifs_insert" on public.notifications;
create policy "notifs_insert" on public.notifications
  for insert with check (true);

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter table public.bookings replica identity full;
alter table public.games replica identity full;
alter table public.game_participants replica identity full;
alter table public.game_join_requests replica identity full;
alter table public.game_messages replica identity full;
alter table public.notifications replica identity full;
alter table public.friendships replica identity full;
alter table public.profiles replica identity full;
alter table public.player_ratings replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.bookings;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.games;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.game_participants;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.game_join_requests;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.game_messages;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.notifications;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.friendships;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.profiles;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.player_ratings;
  exception when duplicate_object then null;
  end;
end $$;

grant usage on schema public to anon, authenticated;
grant select on public.venues, public.courts, public.profiles, public.games, public.game_participants to anon, authenticated;
grant all on public.profiles, public.bookings, public.games, public.game_participants, public.game_join_requests, public.game_messages, public.friendships, public.player_ratings, public.notifications, public.venues, public.courts to authenticated;

grant execute on function public.book_court(text, text, text, text, text, text, date, text[], integer, numeric, text, text, text) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.join_game(uuid, text) to authenticated;
grant execute on function public.leave_game(uuid) to authenticated;
grant execute on function public.respond_join_request(uuid, uuid, boolean) to authenticated;
grant execute on function public.complete_game(uuid, uuid[]) to authenticated;
grant execute on function public.cancel_game(uuid, text) to authenticated;
grant execute on function public.send_friend_request(uuid) to authenticated;
grant execute on function public.respond_friend_request(uuid, boolean) to authenticated;
grant execute on function public.notify_user(uuid, text, text, text, text) to authenticated;
