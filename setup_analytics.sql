-- Create a table to track website visits
create table if not exists site_visits (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  page_path text,
  user_agent text,
  referrer text,
  country text
);

-- Enable Row Level Security (RLS)
alter table site_visits enable row level security;

-- Policy: Allow anyone (anon) to insert visits (tracking)
create policy "Allow anonymous inserts"
  on site_visits
  for insert
  to anon
  with check (true);

-- Policy: Allow authenticated users (admin) to view visits
create policy "Allow authenticated reads"
  on site_visits
  for select
  to authenticated
  using (true);

-- Create an index on created_at for faster charting queries
create index if not exists idx_site_visits_created_at on site_visits(created_at);
