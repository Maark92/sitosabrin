-- Tabella IMPOSTAZIONI SITO (Sfondo, ecc.)
create table site_settings (
  id int primary key default 1, -- Unica riga
  hero_bg_url text default 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=2070&auto=format&fit=crop',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inserisci riga default
insert into site_settings (id) values (1) on conflict (id) do nothing;

-- Tabella OFFERTE / POPUP
create table offers (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  is_active boolean default false,
  type text default 'popup', -- 'popup' o 'banner'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table site_settings enable row level security;
alter table offers enable row level security;

-- Policies
create policy "Public can view settings" on site_settings for select using (true);
create policy "Auth users map manage settings" on site_settings for all using (auth.role() = 'authenticated');

create policy "Public can view active offers" on offers for select using (is_active = true);
create policy "Auth users manage offers" on offers for all using (auth.role() = 'authenticated');
