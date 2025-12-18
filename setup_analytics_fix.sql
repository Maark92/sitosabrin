-- Drop old policies to avoid conflicts
drop policy if exists "Allow anonymous inserts" on site_visits;
drop policy if exists "Allow authenticated reads" on site_visits;

-- 1. Permetti a CHIUNQUE (anche a te che sei loggato) di registrare una visita
create policy "Allow all inserts"
  on site_visits
  for insert
  with check (true);

-- 2. Permetti solo agli ADMIN (authenticated) di leggere i dati per il grafico
create policy "Allow authenticated reads"
  on site_visits
  for select
  to authenticated
  using (true);
