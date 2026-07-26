-- Skema SPMB SD Plus 3 Al-Muhajirin TA 2027/2028
create table public.pendaftar (
  id uuid primary key default gen_random_uuid(),
  nomor_urut bigint generated always as identity,
  nomor_pendaftaran text generated always as
    ('SPMB-2728-' || lpad(nomor_urut::text, 4, '0')) stored,
  -- data calon siswa
  nama_lengkap text not null,
  nik text not null,
  tempat_lahir text not null,
  tanggal_lahir date not null,
  jenis_kelamin text not null check (jenis_kelamin in ('L', 'P')),
  alamat text not null,
  asal_tk text,
  -- data orang tua / wali
  nama_ayah text not null,
  pekerjaan_ayah text not null,
  pendidikan_ayah text not null,
  nama_ibu text not null,
  pekerjaan_ibu text not null,
  pendidikan_ibu text not null,
  nama_wali text,
  pekerjaan_wali text,
  no_whatsapp text not null,
  -- status
  status_verifikasi text not null default 'menunggu'
    check (status_verifikasi in ('menunggu', 'terverifikasi', 'perlu_perbaikan')),
  status_penerimaan text not null default 'menunggu'
    check (status_penerimaan in ('menunggu', 'diterima', 'tidak_diterima')),
  catatan_admin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pendaftar_nik_unik unique (nik),
  constraint pendaftar_nomor_unik unique (nomor_pendaftaran)
);

create table public.dokumen (
  id uuid primary key default gen_random_uuid(),
  pendaftar_id uuid not null references public.pendaftar (id) on delete cascade,
  jenis text not null check (jenis in ('kartu_keluarga', 'akta_kelahiran', 'pas_foto')),
  path_storage text not null,
  created_at timestamptz not null default now(),
  constraint dokumen_unik_per_jenis unique (pendaftar_id, jenis)
);

create table public.konten (
  key text primary key,
  isi jsonb not null,
  updated_at timestamptz not null default now()
);

-- updated_at otomatis
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger pendaftar_updated_at before update on public.pendaftar
  for each row execute function public.set_updated_at();
create trigger konten_updated_at before update on public.konten
  for each row execute function public.set_updated_at();

-- RLS: tutup semua akses publik; service role melewati RLS.
alter table public.pendaftar enable row level security;
alter table public.dokumen enable row level security;
alter table public.konten enable row level security;

-- konten boleh dibaca siapa saja (isinya memang untuk landing page)
create policy "konten dibaca publik" on public.konten
  for select to anon, authenticated using (true);

-- bucket privat untuk dokumen upload
insert into storage.buckets (id, name, public)
values ('dokumen', 'dokumen', false)
on conflict (id) do nothing;
