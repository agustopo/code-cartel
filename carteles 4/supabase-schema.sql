-- Ejecutar esto en Supabase: Project > SQL Editor > New query > pegar y "Run"

create table if not exists codes (
  code text primary key,
  business text default '',
  link text default '',
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists scans (
  id bigserial primary key,
  code text references codes(code) on delete cascade,
  scanned_at timestamptz default now()
);

-- Fila única para guardar configuración simple (por ahora solo el dominio, opcional)
create table if not exists settings (
  id int primary key default 1,
  domain text default '',
  constraint single_row check (id = 1)
);
insert into settings (id, domain) values (1, '') on conflict (id) do nothing;
