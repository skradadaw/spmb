# Task 14 Brief: Export Data Pendaftar ke Excel

## Objectives
- Create Route Handler `src/app/admin/(dasbor)/pendaftar/export/route.ts`
- Protect route with Supabase Auth check (return 401 if unauthenticated).
- Accept query parameters `q`, `verifikasi`, `penerimaan` to support filtered exports.
- Build Excel workbook using `exceljs` with 21 columns including registration data, parent info, status labels, and dates.
- Return response with content type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` and header `Content-Disposition: attachment; filename="pendaftar-spmb-2027-2028.xlsx"`.
