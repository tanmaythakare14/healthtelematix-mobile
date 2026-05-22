# Health Telematix Clinic Portal — Claude Code Guide

## Project Overview

HIPAA-compliant healthcare portal for Clinic Admins, Physicians, Registered Nurses, and Digital Health Navigators. ~74 screens across 7 modules.

**Stack:** React 19 · TypeScript · Vite · shadcn/ui · Tailwind CSS · Redux Toolkit · React Router v6

---

## Commands

```bash
npm run dev            # start dev server
npm run build          # tsc -b && vite build
npm run typecheck      # tsc --noEmit
npm run lint           # eslint --fix
npm run lint:check     # eslint (no fix)
npm run format         # prettier --write
npm run format:check   # prettier --check
npm run test           # vitest
npm run test:coverage  # vitest run --coverage
npm run commit         # commitizen (conventional commits)
```

---

## Tech Stack — Approved Libraries Only

| Purpose         | Library                           | Notes                                                 |
| --------------- | --------------------------------- | ----------------------------------------------------- |
| UI components   | **shadcn/ui**                     | ONLY UI library — no MUI, Ant Design, Chakra, Mantine |
| Styling         | **Tailwind CSS v4**               | Utility classes only, no inline styles                |
| Forms           | **React Hook Form + Zod**         | shadcn/ui `<Form>` depends on these                   |
| Data tables     | **TanStack Table**                | Paired with shadcn/ui `<Table>` primitives            |
| Charts          | **shadcn/ui Charts**              | Wraps Recharts — do not use Recharts directly         |
| Routing         | **React Router v6**               | Already installed                                     |
| State           | **Redux Toolkit**                 | Auth + UI state only (not server data)                |
| Icons           | **Lucide React**                  | Already used by shadcn/ui                             |
| Toasts          | **Sonner**                        | Via shadcn/ui `<Sonner>` component                    |
| Dates           | **date-fns + shadcn/ui Calendar** | Never use moment.js                                   |
| Class utilities | **clsx + tailwind-merge + cva**   | Required by shadcn/ui internals                       |

Adding any library not in this table requires team approval first.

---

## Modules

All feature code lives inside `src/modules/`. Never add business logic to `src/` root or `src/components/`.

| Module            | Screens | Description                                                                                                                                                          |
| ----------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onboarding`      | 12      | Invitation flow, email verify, set password, create profile, EHR setup, sign in, **login (post-logout)**, **forgot password**, **reset password**                    |
| `dashboard`       | 2       | KPI cards, revenue graphs (APCM · RPM · BHI), enrollment trends, billing stats                                                                                       |
| `patient`         | 15      | Patient list, detail view with 8 tabs (vitals, medications, care plan, billing, tasks, appointments, activity log, programs/devices), enrollment (5-step multi-form) |
| `user-management` | 3       | Physician/RN/DHN list, add user, view detail                                                                                                                         |
| `billing`         | 3       | Billing table, monthly summary, CPT code generation, billing history                                                                                                 |
| `messages`        | 2       | Read-only conversation list, patient context panel                                                                                                                   |
| `settings`        | 8       | User profile, clinic profile, EHR/EMR settings, notifications, change password, ToS, FAQs, help & support                                                            |

---

## Source Layout

```
src/
├── modules/           # All feature modules (see rules/modules.md)
├── components/
│   └── ui/            # shadcn/ui generated files — NEVER hand-edit
├── store/
│   ├── index.ts       # Redux store with encrypted persistence
│   ├── hooks.ts       # useAppDispatch, useAppSelector
│   └── slices/        # One slice per domain
├── hooks/             # Shared custom hooks (non-module-specific)
├── router/
│   └── index.tsx      # All React Router v6 route definitions
├── config/
│   └── environment.ts # All Vite env var access (NEVER import.meta.env elsewhere)
└── utils/
    ├── encryption.ts  # CryptoJS AES — do not modify
    ├── secureStorage.ts
    └── logger.ts      # PHI-aware logger — always use this, never console.log
```

---

## HIPAA Rules (enforced at all times)

- PHI fields in JSX must carry a `data-phi` attribute: MRN, DOB, SSN, insurance IDs, phone, email
- Never log PHI — use `src/utils/logger.ts` which auto-redacts PHI patterns
- Never store raw PHI in Redux — encrypted persistence via `secureStorage` adapter
- Never hardcode API base URLs — read from `src/config/environment.ts`
- Never expose raw API error messages to the UI — map to user-friendly strings

---

## Path Aliases

Use `@/` for `src/` in all imports. Never use relative `../../` paths that cross module boundaries.

```ts
// correct
import { patientApi } from '@/modules/patient/service/api';
import { Button } from '@/components/ui/button';

// wrong
import { patientApi } from '../../modules/patient/service/api';
```

---

## Path-Scoped Rules (auto-loaded by Claude Code)

- @rules/modules.md — folder structure, layer separation, barrel exports
- @rules/components.md — shadcn/ui usage, form patterns, table patterns, chart patterns
- @rules/api.md — HTTP client, response typing, error handling, PHI logging
- @rules/typescript.md — type safety, interfaces, Zod schema conventions
- @rules/testing.md — Vitest + @testing-library/react conventions
- @rules/state.md — Redux Toolkit slice and thunk patterns
- @rules/styling.md — Tailwind utility rules, shadcn/ui CSS variable conventions
- @rules/onboarding-patterns.md — two-panel layout, card, password strength, success popup, demo banner
- @rules/dialog.md — `@base-ui/react/dialog` usage, `showCloseButton` prop, TypeScript gotchas
