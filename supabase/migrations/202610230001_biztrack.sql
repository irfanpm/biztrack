-- Run in the Supabase SQL editor or with supabase db push.
create table public.products (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 business text not null check (business in ('meesho','digital')), name text not null check (length(trim(name)) between 1 and 120),
 price numeric(14,2) not null check (price between 0 and 1000000000),
 unique(id,user_id,business)
);
create table public.entries (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 business text not null check (business in ('meesho','digital')), date date not null,
 product_id uuid, quantity integer not null default 0 check(quantity between 0 and 1000000000),
 unit_price numeric(14,2) not null default 0 check(unit_price between 0 and 1000000000),
 revenue numeric(14,2) not null default 0 check(revenue between 0 and 1000000000),
 ad_spend numeric(14,2) not null default 0 check(ad_spend between 0 and 1000000000),
 enquiries integer not null default 0 check(enquiries between 0 and 1000000000),
 purchase_cost numeric(14,2) not null default 0 check(purchase_cost between 0 and 1000000000),
 delivery_fees numeric(14,2) not null default 0 check(delivery_fees between 0 and 1000000000),
 gateway_fees numeric(14,2) not null default 0 check(gateway_fees between 0 and 1000000000),
 other_costs numeric(14,2) not null default 0 check(other_costs between 0 and 1000000000),
 refunds numeric(14,2) not null default 0 check(refunds between 0 and 1000000000),
 status text not null default 'completed' check(status in ('completed','cancelled')),
 foreign key (product_id,user_id,business) references public.products(id,user_id,business) on delete restrict,
 check(quantity = 0 or product_id is not null),
 check((business='meesho' and gateway_fees=0) or (business='digital' and enquiries=0 and purchase_cost=0 and delivery_fees=0))
);
create index entries_owner_date on public.entries(user_id,date);
alter table public.products enable row level security;
alter table public.entries enable row level security;
create policy owner_products on public.products for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy owner_entries on public.entries for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.products, public.entries from anon;
grant select,insert,update,delete on public.products,public.entries to authenticated;
