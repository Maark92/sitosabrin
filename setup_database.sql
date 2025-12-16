-- Abilita l'estensione UUID per generare ID univoci
create extension if not exists "uuid-ossp";

-- 1. Tabella SERVIZI (Gestibile da Admin)
create table services (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price text not null, -- testo libero es. "€45" o "da €50"
  duration text, -- es. "60min"
  image_url text,
  is_popular boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabella FEATURES (Perché sceglierci)
create table features (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  icon_name text not null, -- nome icona Lucide
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabella PORTFOLIO (Galleria)
create table portfolio (
  id uuid default uuid_generate_v4() primary key,
  title text,
  image_url text not null,
  category text, -- es. "Nail Art", "Simple", "French"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Abilita Row Level Security (Sicurezza)
alter table services enable row level security;
alter table features enable row level security;
alter table portfolio enable row level security;

-- 5. Policy: CHIUNQUE può leggere (Select)
create policy "Public services are viewable by everyone" on services for select using (true);
create policy "Public features are viewable by everyone" on features for select using (true);
create policy "Public portfolio is viewable by everyone" on portfolio for select using (true);

-- 6. Policy: SOLO ADMIN può modificare (Insert/Update/Delete)
-- (Per ora permettiamo a tutti se autenticati, poi restringeremo al ruolo admin)
create policy "Authenticated users can modify services" on services for all using (auth.role() = 'authenticated');
create policy "Authenticated users can modify features" on features for all using (auth.role() = 'authenticated');
create policy "Authenticated users can modify portfolio" on portfolio for all using (auth.role() = 'authenticated');

-- DATI INIZIALI (Seed) - Copiati dal tuo codice attuale
insert into services (title, description, price, duration, image_url, is_popular) values
('Semipermanente Rinforzato', 'Manicure russa con stesura gel rinforzante e colore premium.', '€45', '60min', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1974&auto=format&fit=crop', true),
('Ricostruzione Gel', 'Allungamento con formina per una forma perfetta e resistente.', '€70', '90min', 'https://images.unsplash.com/photo-1519017666493-4c61214c9fcd?q=80&w=2070&auto=format&fit=crop', true),
('Nail Art Design', 'Decorazioni a mano libera, cristalli Swarovski ed effetti speciali.', 'da €10', 'var', 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=2070&auto=format&fit=crop', false);

insert into features (title, description, icon_name) values
('Qualità Premium', 'Utilizziamo solo prodotti certificati e di alta qualità per garantire la salute delle tue unghie.', 'Award'),
('Design Unici', 'Ogni set è un''opera d''arte creata su misura per il tuo stile e la tua personalità.', 'Sparkles'),
('Igiene Totale', 'Strumenti sterilizzati in autoclave e lime monouso per la tua massima sicurezza.', 'ShieldCheck');
