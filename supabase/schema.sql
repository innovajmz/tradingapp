-- Trading Calendar — Supabase schema
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('challenge','fondeo','real','live','futuros','demo')),
  prop_firm text,
  starting_balance numeric not null default 0,
  total_commission numeric not null default 0,
  profit_split numeric,
  profit_target_pct numeric,
  max_daily_loss_pct numeric,
  max_total_drawdown_pct numeric,
  drawdown_type text not null default 'static' check (drawdown_type in ('static','trailing')),
  min_trading_days integer,
  status text not null default 'active' check (status in ('active','passed','failed','funded')),
  created_at timestamptz not null default now()
);

-- Each row is a single operation/trade (not a daily total) — a day's
-- result is the sum of every trade logged for that date, computed in the app.
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  pnl numeric not null default 0,
  symbol text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists trades_account_date_idx on public.trades(account_id, date);
create index if not exists accounts_user_id_idx on public.accounts(user_id);

alter table public.accounts enable row level security;
alter table public.trades enable row level security;

drop policy if exists "accounts_select_own" on public.accounts;
drop policy if exists "accounts_insert_own" on public.accounts;
drop policy if exists "accounts_update_own" on public.accounts;
drop policy if exists "accounts_delete_own" on public.accounts;

create policy "accounts_select_own" on public.accounts for select using (auth.uid() = user_id);
create policy "accounts_insert_own" on public.accounts for insert with check (auth.uid() = user_id);
create policy "accounts_update_own" on public.accounts for update using (auth.uid() = user_id);
create policy "accounts_delete_own" on public.accounts for delete using (auth.uid() = user_id);

drop policy if exists "trades_select_own" on public.trades;
drop policy if exists "trades_insert_own" on public.trades;
drop policy if exists "trades_update_own" on public.trades;
drop policy if exists "trades_delete_own" on public.trades;

create policy "trades_select_own" on public.trades for select using (auth.uid() = user_id);
create policy "trades_insert_own" on public.trades for insert with check (auth.uid() = user_id);
create policy "trades_update_own" on public.trades for update using (auth.uid() = user_id);
create policy "trades_delete_own" on public.trades for delete using (auth.uid() = user_id);
