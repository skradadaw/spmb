# Task Brief: Redesain UI Admin (Modern Sidebar Command Console)

## Objectives
- Create `src/components/admin/AdminSidebar.tsx` (Deep Slate `#0f172a`, mobile slide-over drawer, active state indicators).
- Create `src/components/admin/AdminHeader.tsx` (sticky top header with `backdrop-blur bg-white/80`, hamburger toggle, title context).
- Modify `src/app/admin/(dasbor)/layout.tsx` to integrate `AdminSidebar`, `AdminHeader`, and expand to `max-w-7xl`.
- Redesign `src/app/admin/(dasbor)/page.tsx` (Dashboard with Slate-Emerald stats cards & recent pending table).
- Redesign `src/app/admin/(dasbor)/pendaftar/page.tsx` (Search toolbar, filters, data-dense table & mobile cards).
- Redesign `src/app/admin/(dasbor)/pendaftar/[id]/page.tsx` & `src/components/admin/StatusForm.tsx` (Two-column detail grid, document preview cards with signed URLs).
- Redesign `src/app/admin/(dasbor)/konten/page.tsx`, `src/components/admin/ListEditor.tsx`, `src/components/admin/KontakEditor.tsx` (Card-based content editors).
- Redesign `src/app/admin/login/page.tsx` (Deep Slate & Emerald Command Center login page).
- Verify with `npm test` (33 unit tests pass) and `npm run build`.
