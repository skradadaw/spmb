# Task 15 Brief: Editor Konten Landing Page

## Objectives
- Create `src/app/admin/(dasbor)/konten/actions.ts` with `simpanKonten(key: KontenKey, isi: unknown)` Server Action.
- Create `src/components/admin/ListEditor.tsx` (generic list editor for Jadwal, Syarat, Biaya, FAQ).
- Create `src/components/admin/KontakEditor.tsx` (editor for Whatsapp, Telepon, Alamat).
- Create `src/app/admin/(dasbor)/konten/page.tsx` integrating all content editors.
- Validate input fields before saving to Supabase `konten` table via `upsert`.
- Revalidate paths `/` and `/admin/konten` upon saving.
