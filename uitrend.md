# Health Telematix — Clinic Portal UI Reference

> **Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · TanStack Table · React Router v6 · Redux Toolkit · Lucide React · Sonner

---

## 1. Design Identity

| Attribute                  | Value                                               |
| -------------------------- | --------------------------------------------------- |
| Primary color              | `#1A2D45` → `oklch(0.295 0.058 256)`                |
| Primary teal (CTA grad)    | `#0D9488` → `oklch(0.5454 0.1286 181.18)`           |
| LeftNav background         | `#0F1B2D` (hardcoded, not a CSS variable)           |
| LeftNav active accent      | `#4F8EF7` (blue)                                    |
| Page background            | `#FAFAF9` (warm off-white)                          |
| Surface (cards)            | `#FFFFFF`                                           |
| Card border                | `border-slate-200`                                  |
| Muted background           | `bg-[#FAFAF9]` (table headers, empty states)        |
| Font family                | `Geist Variable` (via `@fontsource-variable/geist`) |
| Border radius — cards      | `rounded-[14px]` or `rounded-2xl`                   |
| Border radius — buttons    | `rounded-lg` / `rounded-md`                         |
| Border radius — pills      | `rounded-full`                                      |
| Border radius — icon boxes | `rounded-xl` (larger), `rounded-lg` (smaller)       |
| Card shadow                | `shadow-xs`                                         |

### CSS Variables (`src/index.css`)

```css
--primary: oklch(0.295 0.058 256); /* #1A2D45 */
--primary-hover: oklch(0.38 0.05 256);
--primary-foreground: oklch(0.985 0 0); /* white */
--primary-teal: oklch(0.5454 0.1286 181.18); /* #0D9488 */
--background: oklch(1 0 0);
--foreground: oklch(0.145 0 0);
--muted-foreground: oklch(0.556 0 0);
--border: oklch(0.922 0 0);
--radius: 0.625rem;
```

### Program badge colors

| Program | Background     | Text              | Border              |
| ------- | -------------- | ----------------- | ------------------- |
| APCM    | `bg-teal-50`   | `text-teal-700`   | `border-teal-200`   |
| RPM     | `bg-blue-50`   | `text-blue-700`   | `border-blue-100`   |
| BHI     | `bg-violet-50` | `text-violet-700` | `border-violet-200` |

### Status badge colors

| Status      | Background      | Text               | Border               |
| ----------- | --------------- | ------------------ | -------------------- |
| Active      | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` |
| Pending     | `bg-amber-50`   | `text-amber-600`   | `border-amber-200`   |
| Inactive    | `bg-slate-100`  | `text-slate-500`   | `border-slate-200`   |
| Critical    | `bg-rose-50`    | `text-rose-600`    | `border-rose-200`    |
| Generated   | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` |
| Deactivated | `bg-slate-50`   | `text-slate-400`   | `border-slate-200`   |

---

## 2. Layout System

### Page shell

Every page uses this exact structure:

```tsx
<div className="min-h-screen flex bg-[#FAFAF9]">
  <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />
  <div
    className={cn(
      'flex-1 flex flex-col min-w-0 transition-[margin-left] duration-[220ms] ease-in-out',
      navCollapsed ? 'ml-[60px]' : 'ml-60'
    )}
  >
    <TopBar title="Page Title" subtitle="Page Subtitle" />
    <main className="flex-1 overflow-y-auto p-6 space-y-5">{/* content */}</main>
  </div>
</div>
```

- `LeftNav` expanded: `w-60` (240px), collapsed: `w-[60px]`
- Content margin animates with nav: `transition-[margin-left] duration-[220ms] ease-in-out`
- Main content padding: `p-6` with `space-y-5` between sections

---

## 3. Left Navigation (`src/components/layout/LeftNav.tsx`)

### Visual identity

| Element         | Style                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| Background      | `bg-[#0F1B2D]` (fixed dark navy)                                        |
| Logo icon box   | `bg-[rgba(79,142,247,0.20)]` with `text-[#4F8EF7]`                      |
| Active nav      | `bg-[rgba(79,142,247,0.15)] text-white font-semibold`                   |
| Active icon     | `text-[#4F8EF7]`                                                        |
| Inactive nav    | `text-[rgba(255,255,255,0.52)]`                                         |
| Inactive hover  | `hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.85)]` |
| Section borders | `border-[rgba(255,255,255,0.06)]`                                       |
| Toggle button   | `bg-[#1A2D45]` / hover → `bg-[#4F8EF7]`                                 |
| Profile popup   | `bg-[#1A2D45]`, Log Out in `text-[#ff6b6b]`                             |

### Nav items

```ts
const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',         icon: <LayoutDashboard size={17} />, path: '/dashboard' },
  { id: 'patients',   label: 'Patient Management', icon: <Users size={17} />,          path: '/patients' },
  { id: 'users',      label: 'User Management',    icon: <UserCog size={17} />,        path: '/users' },
  { id: 'billing',    label: 'Billing',            icon: <Receipt size={17} />,        path: '/billing' },
  { id: 'settings',   label: 'Settings',           icon: <Settings size={17} />,       path: '/settings' },
];
```

### Active route detection

```ts
if (location.pathname.startsWith('/patients')) return 'patients';
if (location.pathname.startsWith('/users')) return 'users';
if (location.pathname.startsWith('/billing')) return 'billing';
if (location.pathname.startsWith('/messages')) return 'messages';
if (location.pathname.startsWith('/settings')) return 'settings';
return 'dashboard';
```

### Collapsed tooltip

Absolute positioned, `left-[calc(100%+10px)]`, dark `bg-slate-800`, with left-pointing triangle caret. `opacity-0 group-hover/nav:opacity-100 transition-opacity duration-100`.

---

## 4. Top Bar (`src/components/layout/TopBar.tsx`)

```tsx
<TopBar title="Patient Management" subtitle="Patient List" />
```

- Height: `h-20`
- Background: `bg-white border-b border-slate-100`
- Title: `text-[17px] font-bold` with subtitle `text-[12.5px] text-muted-foreground`
- Right side: Bell icon with notification badge + profile pill

---

## 5. Card Pattern

Standard white card used throughout:

```tsx
<div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
  {/* Card header */}
  <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <SomeIcon size={14} className="text-primary" />
    </div>
    <h3 className="text-[12.5px] font-bold text-foreground">Card Title</h3>
    {/* optional count badge */}
    <span className="ml-auto text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15">
      N items
    </span>
  </div>
  {/* Card body */}
  <div className="px-5 py-5">{/* content */}</div>
</div>
```

---

## 6. Table Pattern (TanStack Table + shadcn/ui)

All list views use `useReactTable` with `getCoreRowModel` + `getPaginationRowModel`.

```tsx
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
  autoResetPageIndex: true,
});
```

### Table card wrapper

```tsx
<div className="bg-white border border-slate-200 rounded-[14px] shadow-xs overflow-hidden">
  <Table>
    <TableHeader>
      {table.getHeaderGroups().map((hg) => (
        <TableRow key={hg.id} className="bg-[#FAFAF9] hover:bg-[#FAFAF9] border-b border-slate-200">
          {hg.headers.map((header) => (
            <TableHead
              key={header.id}
              className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground whitespace-nowrap"
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
    <TableBody>
      {table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} className="px-5 py-3.5">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### Pagination footer

```tsx
{
  total > 0 && (
    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
      <p className="text-xs text-muted-foreground">
        Showing{' '}
        <span className="font-semibold text-foreground">
          {from}–{to}
        </span>{' '}
        of <span className="font-semibold text-foreground">{total}</span> results
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft size={14} />
        </Button>
        {Array.from({ length: table.getPageCount() }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => table.setPageIndex(i)}
            className={cn(
              'w-8 h-8 rounded-md text-xs font-medium transition-colors',
              pageIndex === i ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-slate-100'
            )}
          >
            {i + 1}
          </button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="h-8 w-8 p-0"
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
```

---

## 7. Action Button Pattern

Icon-only action buttons — no border, no background by default:

```tsx
{
  /* Standard action (view/edit/download) */
}
<button
  type="button"
  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
>
  <Eye size={14} />
</button>;

{
  /* Destructive action (delete/deactivate) */
}
<button
  type="button"
  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors"
>
  <PowerOff size={14} />
</button>;

{
  /* Action group gap */
}
<div className="flex items-center gap-1">{/* buttons */}</div>;
```

---

## 8. Filter Dropdown Pattern

Custom dropdown with outside-click close via `useRef` + `useEffect` mousedown listener:

```tsx
const filterRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  function onMouseDown(e: MouseEvent) {
    if (filterRef.current && !filterRef.current.contains(e.target as Node)) setOpen(false);
  }
  document.addEventListener('mousedown', onMouseDown);
  return () => document.removeEventListener('mousedown', onMouseDown);
}, []);

<div ref={filterRef} className="relative">
  <button
    type="button"
    className={cn(
      'h-8 px-3 flex items-center gap-2 rounded-lg border text-[12.5px] font-medium transition-colors',
      isActive
        ? 'border-primary/40 bg-primary/5 text-primary'
        : 'border-slate-200 bg-white text-foreground hover:bg-slate-50'
    )}
  >
    <Filter size={12} />
    {label}
    <ChevronDown
      size={12}
      className={cn('text-muted-foreground transition-transform duration-150', open && 'rotate-180')}
    />
  </button>

  {open && (
    <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-44 bg-white rounded-xl border border-slate-200 shadow-xs py-1.5 overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={cn(
            'w-full flex items-center justify-between px-3.5 py-2.5 text-[12.5px] font-medium transition-colors text-left',
            active === opt ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-slate-50'
          )}
        >
          {opt}
          {active === opt && <Check size={12} className="text-primary shrink-0" />}
        </button>
      ))}
    </div>
  )}
</div>;
```

### Multi-select filter (checkbox style)

```tsx
<div
  className={cn(
    'w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0',
    checked ? 'bg-primary border-primary' : 'bg-white border-slate-300'
  )}
>
  {checked && <Check size={10} className="text-primary-foreground" strokeWidth={3} />}
</div>
```

---

## 9. Toolbar Pattern (above table card)

Toolbar lives **outside** the white card, at the same level as it:

```tsx
{
  /* Toolbar — outside the card */
}
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    {/* Search input */}
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        className="h-9 w-72 pl-9 pr-3 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground transition-colors"
        placeholder="Search..."
      />
    </div>
  </div>
  <div className="flex items-center gap-2">
    {/* filter dropdowns */}
    {/* CTA button */}
    <Button className="h-9 px-4 gap-2 text-[13px]">
      <Plus size={14} />
      Add Item
    </Button>
  </div>
</div>;

{
  /* Card below */
}
<div className="bg-white border border-slate-200 rounded-[14px] shadow-xs overflow-hidden">{/* ... */}</div>;
```

---

## 10. Typography Scale

| Use                  | Class                                                                           |
| -------------------- | ------------------------------------------------------------------------------- |
| Page section heading | `text-[15px] font-semibold text-foreground`                                     |
| Card / dialog title  | `text-[14px] font-bold`                                                         |
| Table header cell    | `text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground`     |
| Table body primary   | `text-[13px] font-semibold text-foreground`                                     |
| Table body secondary | `text-[12.5px] font-medium text-foreground`                                     |
| Table sub-text       | `text-[11px] text-muted-foreground`                                             |
| Field label          | `text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]` |
| Field value          | `text-[13.5px] text-foreground font-medium`                                     |
| Section meta label   | `text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em]`       |
| Badge / pill         | `text-[10.5px] font-semibold`                                                   |
| Body / description   | `text-[13px] text-muted-foreground leading-relaxed`                             |
| Timestamp / helper   | `text-[11px] text-muted-foreground`                                             |
| KPI value            | `text-[1.6rem] font-bold leading-none text-foreground`                          |

---

## 11. Status / Program Badge

```tsx
{
  /* Standard pill badge */
}
<span className="inline-flex items-center text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
  Active
</span>;

{
  /* Primary tinted badge (counts, KPI labels) */
}
<span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15">
  3 conditions
</span>;
```

---

## 12. Trend Badge (KPI Cards)

```tsx
<span
  className={cn(
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold',
    isUp
      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
      : 'bg-rose-50 text-rose-500 border border-rose-200'
  )}
>
  {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
  {isUp ? '+' : '-'}
  {percent}% vs last month
</span>
```

---

## 13. Dialog / Modal Pattern

Uses shadcn `<Dialog>` with `DialogContent`, `DialogHeader`, `DialogTitle`.

```tsx
<Dialog
  open={open}
  onOpenChange={(o) => {
    if (!o) onClose();
  }}
>
  <DialogContent className="sm:max-w-[680px] p-0 gap-0 overflow-hidden">
    {/* Header */}
    <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <SomeIcon size={15} className="text-primary" />
        </div>
        <div>
          <DialogTitle className="text-[14px] font-bold leading-tight">Dialog Title</DialogTitle>
          <p className="text-[11.5px] text-muted-foreground mt-0.5">Subtitle or context</p>
        </div>
      </div>
    </DialogHeader>

    {/* Body */}
    <div className="px-6 py-5 overflow-y-auto max-h-[70vh] space-y-5">{/* content */}</div>

    {/* Footer */}
    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
      <button
        type="button"
        onClick={onClose}
        className="h-9 px-4 text-[13px] font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
      >
        Cancel
      </button>
      <Button className="h-9 px-4 text-[13px] gap-2">
        <Download size={13} />
        Confirm
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

### Section dividers inside dialog body

```tsx
<div className="border-t border-slate-100 my-5" />
```

---

## 14. Tab Navigation (Patient Detail)

Line-style tabs with bottom border indicator:

```tsx
<div className="border-b border-slate-200 -mb-1">
  <nav className="flex">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => setActiveTab(tab.id)}
        className={cn(
          'px-4 py-3 text-[13px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
          activeTab === tab.id
            ? 'border-primary text-primary font-semibold'
            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-slate-300'
        )}
      >
        {tab.label}
      </button>
    ))}
  </nav>
</div>
```

---

## 15. MRN Masking (HIPAA)

All MRN values displayed in list tables must be masked:

```ts
function maskMrn(mrn: string): string {
  const dashIdx = mrn.indexOf('-');
  if (dashIdx === -1) return '•'.repeat(Math.max(0, mrn.length - 3)) + mrn.slice(-3);
  const prefix = mrn.slice(0, dashIdx + 1);
  const num = mrn.slice(dashIdx + 1);
  const visibleCount = Math.min(3, num.length);
  return prefix + '•'.repeat(num.length - visibleCount) + num.slice(-visibleCount);
}
// MRN-10041 → MRN-••041
```

PHI fields in JSX must carry `data-phi="true"`.

---

## 16. Session Timeline (BillingTab detail dialog)

Horizontal bar showing session start → end with step log:

```tsx
interface SessionStep {
  time: string;
  label: string;
}
interface SessionTimeline {
  startTime: string; // "Apr 30, 2026 · 9:00 AM"
  endTime: string; // "Apr 30, 2026 · 9:22 AM"
  duration: string; // "22 min"
  steps: SessionStep[];
}
```

**Bar layout:** navy dot (start) → `flex-1 h-px bg-slate-200` lines on each side of a centered duration pill → emerald dot (end). Each endpoint shows the time in bold above the date in muted text, split on `·`.

**Step log:** `bg-slate-50/70 rounded-xl border border-slate-100 divide-y divide-slate-100`. Each row: colored dot (navy = first, emerald = last, `bg-slate-300` = middle) + `w-20` fixed-width bold timestamp + muted label.

---

## 17. Alert Cards (Patient Detail)

Three alert types with distinct color schemes:

| Type   | Icon          | Background     | Border              | Text color        |
| ------ | ------------- | -------------- | ------------------- | ----------------- |
| vitals | AlertTriangle | `bg-rose-50`   | `border-rose-100`   | `text-rose-700`   |
| device | WifiOff       | `bg-amber-50`  | `border-amber-100`  | `text-amber-700`  |
| ai     | Bot           | `bg-violet-50` | `border-violet-100` | `text-violet-700` |

Alert panel: `rounded-[14px] border-2 border-rose-200` with `bg-rose-50` header strip. Always expanded (no accordion). `grid grid-cols-3 gap-3` inside.

---

## 18. Form Pattern

All forms use **React Hook Form + Zod + shadcn/ui Form** components. No exceptions.

```tsx
const schema = z.object({ fieldName: z.string().min(1, 'Required') });
type FormValues = z.infer<typeof schema>;

const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { fieldName: '' } });

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Field Label</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>;
```

---

## 19. Toast Notifications

```tsx
import { toast } from 'sonner';

toast.success('Patient enrolled successfully.');
toast.error('Something went wrong. Please try again.');
```

---

## 20. Calendar / Date Picker (Inside Dialogs)

When a date picker is used inside a scrollable dialog, use `createPortal` to render the calendar at `document.body` level, positioned with `getBoundingClientRect` to avoid clipping:

```tsx
const triggerRef = useRef<HTMLButtonElement>(null);
const calendarRef = useRef<HTMLDivElement>(null);
const [calendarPos, setCalendarPos] = useState<{ top: number; left: number } | null>(null);

function openCalendar(): void {
  if (!triggerRef.current) return;
  const rect = triggerRef.current.getBoundingClientRect();
  setCalendarPos({ top: rect.bottom + 4, left: rect.left });
  setDobOpen(true);
}

// Render:
{dobOpen && calendarPos && createPortal(
  <div ref={calendarRef}
    style={{ position: 'fixed', top: calendarPos.top, left: calendarPos.left, zIndex: 9999 }}
    className="bg-white rounded-md border border-slate-200 shadow-md">
    <Calendar mode="single" captionLayout="dropdown" fromYear={1924} toYear={2026} ... />
  </div>,
  document.body
)}
```

**Never** use Radix `<Popover>` for date pickers inside `overflow-y-auto` containers — the collision detection repositions on native `<select>` open events.

---

## 21. Module Structure

```
src/modules/<feature>/
├── @types/index.ts       # All TypeScript interfaces for this module
├── components/
│   ├── list/             # Table/list view
│   ├── detail/           # Detail view + tabs/
│   ├── form/ or enrollment/
│   └── index.ts
├── service/
│   ├── api.ts
│   └── mapper.ts
├── constants/index.ts
└── index.ts              # Minimal public API
```

### Active modules

| Module            | Path prefix  | Key screens                                   |
| ----------------- | ------------ | --------------------------------------------- |
| `dashboard`       | `/dashboard` | KPI cards, Revenue graph, Billing stats       |
| `patient`         | `/patients`  | List, Detail (10 tabs), Enrollment (5-step)   |
| `user-management` | `/users`     | Staff list, Add user, User detail             |
| `billing`         | `/billing`   | Billing table, CPT code generation            |
| `messages`        | `/messages`  | Read-only conversation list + patient context |
| `settings`        | `/settings`  | Profile, Clinic, EHR, Notifications, Password |
| `onboarding`      | `/login`+    | Invitation flow, Email verify, Create profile |

---

## 22. Patient Detail Tabs

| Tab ID             | Label             | Component               |
| ------------------ | ----------------- | ----------------------- |
| `overview`         | Patient Overview  | Inline in PatientDetail |
| `programs-devices` | Program & Devices | `ProgramsDevicesTab`    |
| `care-plan`        | Care Plan         | `CarePlanTab`           |
| `vitals`           | Vitals            | `VitalsTab`             |
| `medication`       | Medication        | `MedicationTab`         |
| `messages`         | Messages          | `MessagesTab`           |
| `tasks`            | Tasks             | `TasksTab`              |
| `appointments`     | Appointments      | `AppointmentsTab`       |
| `activity`         | Activity Log      | `ActivityLogTab`        |
| `billing`          | Billing           | `BillingTab`            |

---

## 23. Dashboard — KPI Cards

Two rows of 4 cards + one row of 2 cards. Card layout:

```tsx
<div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
  <div className="flex flex-col gap-3 p-5">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-foreground leading-tight">{stat.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{stat.subtitle}</p>
      </div>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-primary/25 text-primary">
        {icon}
      </div>
    </div>
    <div className="flex items-center gap-2.5 flex-wrap">
      <p className="text-[1.6rem] font-bold leading-none text-foreground">{value}</p>
      <TrendBadge direction={trend.direction} percent={trend.percent} />
    </div>
  </div>
</div>
```

**Current KPI cards (11 total):**
Row 1 (4): Total Enrolled, APCM Enrollments, RPM Enrollments, BHI Enrollments
Row 2 (4): Eligible Patients, Consent Pending, Active Monitoring, Enrollment Rate
Row 3 (2): New Enrollments This Month, Disenrollments

---

## 24. Path Aliases

```ts
// Always use @/ prefix for src/
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { patientApi } from '@/modules/patient/service/api';

// Never use relative paths crossing module boundaries
import { x } from '../../modules/patient/...'; // WRONG
```

---

## 25. Key Utility Functions

```ts
import { cn } from '@/lib/utils'; // clsx + tailwind-merge
import { toast } from 'sonner'; // toast notifications
import { logger } from '@/utils/logger'; // PHI-safe logging (never console.log)
import { secureLocalStorage } from '@/utils/secureStorage'; // encrypted storage
```

---

## 26. Approved Libraries Only

| Purpose       | Library                           |
| ------------- | --------------------------------- |
| UI components | shadcn/ui (only UI library)       |
| Styling       | Tailwind CSS v4                   |
| Forms         | React Hook Form + Zod             |
| Data tables   | TanStack Table + shadcn/ui Table  |
| Charts        | shadcn/ui Charts (wraps Recharts) |
| Routing       | React Router v6                   |
| State         | Redux Toolkit (auth + UI only)    |
| Icons         | Lucide React                      |
| Toasts        | Sonner via shadcn/ui              |
| Dates         | date-fns + shadcn/ui Calendar     |
| Utilities     | clsx + tailwind-merge + cva       |

Adding any library not in this list requires team approval.
