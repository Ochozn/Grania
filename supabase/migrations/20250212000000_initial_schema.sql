-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  telegram_id bigint unique not null,
  full_name text,
  password text,
  phone_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CATEGORIES TABLE
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  name text not null,
  type text check (type in ('expense', 'income')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRANSACTIONS TABLE
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  amount numeric not null,
  description text,
  category text, 
  subcategory text,
  type text check (type in ('expense', 'income')),
  is_fixed boolean default false,
  date date default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) - Basic setup (allow anon for webhook for now, or service_role)
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- Policies (Simplified for Webhook access)
create policy "Enable access to all users" on public.users for all using (true);
create policy "Enable access to all transactions" on public.transactions for all using (true);

-- Default Categories (Optional)
insert into public.categories (name, type) values 
('Alimentação', 'expense'),
('Transporte', 'expense'),
('Moradia', 'expense'),
('Lazer', 'expense'),
('Saúde', 'expense'),
('Salário', 'income');
