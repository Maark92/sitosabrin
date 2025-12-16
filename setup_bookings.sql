-- Tabella SLOT DISPONIBILITÀ (creata dall'Admin)
create table availability_slots (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  start_time time not null,
  end_time time not null,
  is_booked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabella PRENOTAZIONI (create dai clienti)
create table bookings (
  id uuid default uuid_generate_v4() primary key,
  slot_id uuid references availability_slots(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  notes text,
  status text default 'pending', -- pending, confirmed, cancelled
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Abilita RLS
alter table availability_slots enable row level security;
alter table bookings enable row level security;

-- Policy: Chiunque può vedere gli slot liberi
create policy "Public can view available slots" on availability_slots for select using (is_booked = false);

-- Policy: Chiunque può creare una prenotazione (insert)
create policy "Anyone can create bookings" on bookings for insert with check (true);

-- Policy: Admin può fare tutto
create policy "Auth users can manage slots" on availability_slots for all using (auth.role() = 'authenticated');
create policy "Auth users can manage bookings" on bookings for all using (auth.role() = 'authenticated');
