
-- Add family_id to users if it doesn't exist
do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'family_id') then
        alter table public.users add column family_id uuid default uuid_generate_v4();
        create index idx_users_family_id on public.users(family_id);
    end if;
end $$;

-- Create invitations table
create table if not exists public.invitations (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references public.users(id) not null,
  receiver_phone text not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.invitations enable row level security;

-- Policies for Invitations
drop policy if exists "Users can see sent invitations" on public.invitations;
create policy "Users can see sent invitations" on public.invitations
  for select using (auth.uid() = sender_id);

drop policy if exists "Users can create invitations" on public.invitations;
create policy "Users can create invitations" on public.invitations
  for insert with check (auth.uid() = sender_id);

-- Policy to see received invitations. 
-- Since we can read all users (per initial schema), we can join/check phone.
-- But standard RLS doesn't support joins easily without performance cost or definition issues.
-- However, we can use a subquery.
drop policy if exists "Users can see received invitations" on public.invitations;
create policy "Users can see received invitations" on public.invitations
  for select using (
    receiver_phone = (select phone_number from public.users where id = auth.uid())
  );

drop policy if exists "Users can update received invitations" on public.invitations;
create policy "Users can update received invitations" on public.invitations
  for update using (
    receiver_phone = (select phone_number from public.users where id = auth.uid())
  );

-- Update Transactions Policy for Family Access
drop policy if exists "Enable access to all transactions" on public.transactions;
drop policy if exists "Enable access to own and family transactions" on public.transactions;

create policy "Enable access to own and family transactions" on public.transactions
  for all using (
    user_id = auth.uid() or 
    user_id in (
      select id from public.users 
      where family_id = (select family_id from public.users where id = auth.uid())
    )
  );

-- Update Categories Policy
drop policy if exists "Enable access to all categories" on public.categories; -- remove old if exists
drop policy if exists "Enable access to own and family categories" on public.categories;

create policy "Enable access to own and family categories" on public.categories
  for all using (
    user_id = auth.uid() or 
    user_id in (
      select id from public.users 
      where family_id = (select family_id from public.users where id = auth.uid())
    )
  );
