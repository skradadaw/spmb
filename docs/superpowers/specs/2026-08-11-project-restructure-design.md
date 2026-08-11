# Feature-Driven Project Restructure Design

## Goal
Restructure the Next.js SPMB (Sistem Penerimaan Murid Baru) project from a basic structure to a Feature-Sliced/Domain-Driven architecture. This will prepare the codebase for future scalability, particularly for adding an admin dashboard and authentication logic, while keeping related features grouped together.

## Architecture

The project will transition to the following structure:

```text
src/
├── app/                      
│   ├── (public)/             # Route group for public pages
│   │   ├── page.tsx          
│   │   └── pendaftaran/
│   │       └── page.tsx      
│   ├── (admin)/              # Route group for future admin pages
│   │   ├── layout.tsx        
│   │   └── dashboard/
│   │       └── page.tsx      
│   ├── globals.css
│   └── layout.tsx            
│
├── components/               
│   └── ui/                   # Dumb/stateless global components (e.g. Button, Input)
│
├── features/                 # Core domains containing business logic
│   ├── registration/         
│   │   ├── components/       # Specific UI for registration
│   │   │   └── RegistrationForm.tsx
│   │   ├── actions.ts        # Server Actions (DB mutations)
│   │   └── schema.ts         # Zod validations
│   │
│   └── admin/                # Placeholder for future admin logic
│       └── components/       
│
└── lib/                      # Global utilities
    └── supabase.ts           
```

## Component Refactoring Strategy

### `RegistrationForm.tsx` (Target: `src/features/registration/components/RegistrationForm.tsx`)
Currently, this file is ~16KB and contains UI, form state, Zod schema, and direct Supabase database interactions.
- **Action**: It will be stripped down to only handle UI, form steps state, and `react-hook-form` initialization.
- **Validation Extraction**: The `z.object({...})` schema will move to `src/features/registration/schema.ts`.
- **Database Interaction Extraction**: The `supabase.from('pendaftar').insert(...)` logic will move to `src/features/registration/actions.ts`.

## Open Questions / Ambiguity
None. The scope is strictly refactoring the existing file layout and logic boundaries without adding new user-facing features.

## Verification
- Run `npm run dev` and ensure the Next.js compiler passes without import errors.
- Ensure the registration form still submits successfully to the Supabase database.
