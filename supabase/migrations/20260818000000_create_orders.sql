create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  title text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  telegram text not null,
  comment text not null default '',
  status text not null default 'new' check (status in ('new', 'delivery_error', 'processed')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  product_title text not null,
  quantity integer not null check (quantity between 1 and 20),
  primary key (order_id, product_id)
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

insert into public.products (id, title) values
  ('first-light', 'Первый свет'),
  ('quiet-dawn', 'Тихий рассвет'),
  ('spring-spectrum', 'Весенний спектр'),
  ('golden-tulips', 'Золотые тюльпаны'),
  ('honey-sun', 'Медовое солнце'),
  ('three-roses', 'Три розы'),
  ('sun-crystal', 'Солнечный кристалл'),
  ('single-tulip', 'Один тюльпан'),
  ('cornflower', 'Василёк'),
  ('peony-for-her', 'Пион для неё'),
  ('aroma-sachet', 'Арома-саше'),
  ('heart-in-box', 'Сердце в коробке'),
  ('pair', 'Пара'),
  ('candle-sweets', 'Свечные конфеты'),
  ('lavender-home', 'Лавандовый дом'),
  ('summer-herbarium', 'Летний гербарий'),
  ('winter-fire', 'Зимний огонь'),
  ('dumplings-by-candlelight', 'Пельмени при свечах')
on conflict (id) do update set title = excluded.title, active = true;

create or replace function public.create_order_with_items(
  p_customer_name text,
  p_telegram text,
  p_comment text,
  p_items jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_item_count integer;
begin
  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'items must be a JSON array';
  end if;

  insert into public.orders (customer_name, telegram, comment)
  values (p_customer_name, p_telegram, coalesce(p_comment, ''))
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_title, quantity)
  select
    v_order_id,
    item.id,
    product.title,
    item.quantity
  from jsonb_to_recordset(p_items) as item(id text, title text, quantity integer)
  join public.products as product on product.id = item.id and product.active
  where item.quantity between 1 and 20;

  get diagnostics v_item_count = row_count;
  if v_item_count = 0 then
    raise exception 'order contains no valid products';
  end if;

  return v_order_id;
end;
$$;

revoke all on function public.create_order_with_items(text, text, text, jsonb) from public;
revoke all on function public.create_order_with_items(text, text, text, jsonb) from anon;
revoke all on function public.create_order_with_items(text, text, text, jsonb) from authenticated;
grant execute on function public.create_order_with_items(text, text, text, jsonb) to service_role;
