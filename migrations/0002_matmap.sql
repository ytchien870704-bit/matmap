create table if not exists profiles (
  user_id text primary key,
  display_name text,
  gym_name text,
  gi_preference text not null default 'both',
  is_pro boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id text primary key,
  user_id text not null,
  trained_on date not null,
  gym_name text,
  gi_type text not null default 'gi',
  duration_min integer,
  kind text not null default 'mixed',
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_date_idx on sessions (user_id, trained_on desc);

create table if not exists session_cards (
  id text primary key,
  session_id text not null,
  user_id text not null,
  from_node text,
  action_node text,
  to_node text,
  result text not null default 'drill',
  fail_reason text,
  count integer not null default 1,
  details text,
  role text not null default 'attack',
  created_at timestamptz not null default now()
);
create index if not exists session_cards_user_idx on session_cards (user_id);
create index if not exists session_cards_session_idx on session_cards (session_id);

create table if not exists session_photos (
  id text primary key,
  session_id text not null,
  user_id text not null,
  data_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists technique_cards (
  user_id text not null,
  action_node text not null,
  custom_name text,
  details text,
  proficiency text not null default 'seen',
  times integer not null default 0,
  last_date date,
  diagrams jsonb,
  fail_notes jsonb,
  primary key (user_id, action_node)
);

create table if not exists user_edges (
  user_id text not null,
  from_node text not null,
  to_node text not null,
  source text not null default 'practiced',
  times integer not null default 0,
  last_date date,
  primary key (user_id, from_node, to_node, source)
);

create table if not exists reviews (
  id text primary key,
  user_id text not null,
  session_id text,
  for_date date not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reviews_user_date_idx on reviews (user_id, for_date desc);
