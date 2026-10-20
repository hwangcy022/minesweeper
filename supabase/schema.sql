-- 지뢰찾기 게임: Supabase SQL Editor 에서 실행하세요.

create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  player_name text not null check (char_length(player_name) between 1 and 20),
  difficulty  text not null check (difficulty in ('easy', 'medium', 'hard')),
  won         boolean not null,
  time_seconds integer not null check (time_seconds >= 0),
  created_at  timestamptz not null default now()
);

create table if not exists public.reviews (
  id          bigint generated always as identity primary key,
  author_name text not null check (char_length(author_name) between 1 and 20),
  rating      smallint not null check (rating between 1 and 5),
  content     text not null check (char_length(content) between 1 and 500),
  created_at  timestamptz not null default now()
);

create index if not exists scores_rank_idx on public.scores (difficulty, won, time_seconds);
create index if not exists reviews_created_idx on public.reviews (created_at desc);

-- 로그인 없이 누구나 읽고 쓸 수 있도록 RLS 정책 설정
alter table public.scores enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "scores read" on public.scores;
drop policy if exists "scores insert" on public.scores;
drop policy if exists "reviews read" on public.reviews;
drop policy if exists "reviews insert" on public.reviews;

create policy "scores read"   on public.scores  for select to anon, authenticated using (true);
create policy "scores insert" on public.scores  for insert to anon, authenticated with check (true);
create policy "reviews read"   on public.reviews for select to anon, authenticated using (true);
create policy "reviews insert" on public.reviews for insert to anon, authenticated with check (true);
