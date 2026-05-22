import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  Link2,
  Pencil,
  PowerOff,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/search-input/SearchInput';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';
import { StatusTabs } from '@/components/status-tabs';
import { secureLocalStorage } from '@/utils/secureStorage';
import type { PatientListItem, ProgramType } from '@/modules/patient/@types';
import {
  PATIENT_BASE_PATH,
  PATIENT_ENROLL_PATH,
  PATIENT_EDIT_PATH,
  PATIENT_LIST_STORAGE_KEY,
  PATIENT_SEED_KEY,
  DUMMY_PATIENTS,
} from '@/modules/patient/constants';
import type { EHRPrefillData } from '@/modules/patient/components/enrollment/EHRSelector';
import { EHRPatientSearchModal } from '@/modules/patient/components/enrollment/EHRPatientSearchModal';
import type { EHRInfo } from '@/modules/patient/components/enrollment/EHRPatientSearchModal';

// ─── Helpers ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
];

function getAvatarColor(name: string): string {
  const idx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function maskMrn(mrn: string): string {
  const dashIdx = mrn.indexOf('-');
  if (dashIdx === -1) {
    return '•'.repeat(Math.max(0, mrn.length - 3)) + mrn.slice(-3);
  }
  const prefix = mrn.slice(0, dashIdx + 1);
  const num = mrn.slice(dashIdx + 1);
  const visibleCount = Math.min(3, num.length);
  return prefix + '•'.repeat(num.length - visibleCount) + num.slice(-visibleCount);
}

const MONTH_ABBR: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

function formatDateMDY(value: string): string {
  if (!value) return '—';
  // Already MM/DD/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
  // ISO: YYYY-MM-DD
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[2]}/${iso[3]}/${iso[1]}`;
  // "Mon DD, YYYY" e.g. "Mar 15, 1975"
  const named = value.match(/^([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})$/);
  if (named) {
    const mm = MONTH_ABBR[named[1]] ?? '00';
    const dd = named[2].padStart(2, '0');
    return `${mm}/${dd}/${named[3]}`;
  }
  return value;
}

// ─── Empty State Illustrations ───────────────────────────────────────────────

function NoPatientsSVG(): React.JSX.Element {
  return (
    <svg
      width="148"
      height="148"
      viewBox="0 0 148 148"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Soft teal background circle */}
      <circle cx="74" cy="74" r="74" fill="#F0FDFA" />
      {/* Dashed outer ring */}
      <circle cx="74" cy="74" r="58" stroke="#CCFBF1" strokeWidth="1.5" strokeDasharray="5 4" />

      {/* Clipboard body */}
      <rect x="38" y="38" width="72" height="84" rx="12" fill="white" stroke="#99F6E4" strokeWidth="1.5" />

      {/* Clipboard top clip */}
      <rect x="56" y="32" width="36" height="13" rx="6.5" fill="#CCFBF1" stroke="#5EEAD4" strokeWidth="1.5" />

      {/* Patient silhouette — head */}
      <circle cx="74" cy="72" r="11" fill="#CCFBF1" stroke="#2DD4BF" strokeWidth="1.5" />

      {/* Patient silhouette — body/shoulders arc */}
      <path
        d="M52 104c0-12.15 9.85-22 22-22s22 9.85 22 22"
        fill="#E0FDF4"
        stroke="#2DD4BF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* ECG / heartbeat line */}
      <rect x="38" y="108" width="72" height="14" rx="0" fill="#F0FDFA" />
      <polyline
        points="42,115 52,115 56,107 60,123 64,111 68,119 72,115 90,115 94,107 98,123 102,115 110,115"
        stroke="#2DD4BF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Plus badge — bottom right */}
      <circle cx="104" cy="104" r="16" fill="#0D9488" />
      <line x1="104" y1="97" x2="104" y2="111" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="97" y1="104" x2="111" y2="104" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function NoResultsSVG(): React.JSX.Element {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="40" cy="40" r="40" fill="#F8FAFC" />
      <circle cx="36" cy="35" r="14" stroke="#CBD5E1" strokeWidth="2.2" />
      <line x1="46.5" y1="46.5" x2="58" y2="58" stroke="#CBD5E1" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="31" y1="30" x2="41" y2="40" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="41" y1="30" x2="31" y2="40" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PatientList(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Pending' | 'Deactivated'>(() => {
    const tab = searchParams.get('tab');
    if (tab === 'Pending' || tab === 'Deactivated') return tab;
    return 'Active';
  });
  const [programFilters, setProgramFilters] = useState<ProgramType[]>([]);
  const [programDropdownOpen, setProgramDropdownOpen] = useState(false);
  const [enrollDropdownOpen, setEnrollDropdownOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<{ id: string; name: string } | null>(null);
  const [ehrSearchModal, setEhrSearchModal] = useState<{ open: boolean; ehr: EHRInfo | null }>({
    open: false,
    ehr: null,
  });
  const enrollDropdownRef = useRef<HTMLDivElement>(null);
  const programDropdownRef = useRef<HTMLDivElement>(null);

  // Seed dummy data once on first load
  const [patients, setPatients] = useState<PatientListItem[]>(() => {
    const alreadySeeded = secureLocalStorage.getItemObject<boolean>(PATIENT_SEED_KEY);
    if (!alreadySeeded) {
      secureLocalStorage.setItemObject(PATIENT_LIST_STORAGE_KEY, DUMMY_PATIENTS);
      secureLocalStorage.setItemObject(PATIENT_SEED_KEY, true);
      return DUMMY_PATIENTS;
    }
    return secureLocalStorage.getItemObject<PatientListItem[]>(PATIENT_LIST_STORAGE_KEY) ?? [];
  });

  // Close dropdowns on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (enrollDropdownRef.current && !enrollDropdownRef.current.contains(e.target as Node)) {
        setEnrollDropdownOpen(false);
      }
      if (programDropdownRef.current && !programDropdownRef.current.contains(e.target as Node)) {
        setProgramDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  function handleEHRSelect(prefill: EHRPrefillData) {
    navigate(PATIENT_ENROLL_PATH, { state: { ehrPrefill: prefill } });
  }

  function confirmDeactivate() {
    if (!deactivateTarget) return;
    const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const updated = patients.map((p) =>
      p.id === deactivateTarget.id ? { ...p, status: 'Deactivated' as const, deactivatedOn: today } : p
    );
    setPatients(updated);
    secureLocalStorage.setItemObject(PATIENT_LIST_STORAGE_KEY, updated);
    setDeactivateTarget(null);
    toast.success(`${deactivateTarget.name} has been disenrolled.`);
  }

  const columns = useMemo<ColumnDef<PatientListItem>[]>(() => {
    const isDeactivatedTab = statusFilter === 'Deactivated';
    const isPendingTab = statusFilter === 'Pending';
    return [
      {
        accessorKey: 'fullName',
        header: 'Patient Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                isDeactivatedTab ? 'bg-slate-100 text-slate-400' : getAvatarColor(row.original.fullName)
              )}
            >
              {getInitials(row.original.fullName)}
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className={cn(
                  'text-[13.5px] font-semibold leading-tight',
                  isDeactivatedTab ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                {row.original.fullName}
              </span>
              <span className="text-[11.5px] text-muted-foreground leading-tight" data-phi="true">
                {maskMrn(row.original.mrn)}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email Address',
        cell: ({ row }) => (
          <span className="text-[13px] text-muted-foreground" data-phi="true">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: 'dateOfBirth',
        header: 'Date of Birth',
        cell: ({ row }) => (
          <span className="text-[13px] text-foreground" data-phi="true">
            {formatDateMDY(row.original.dateOfBirth)}
          </span>
        ),
      },
      {
        accessorKey: 'gender',
        header: 'Gender',
        cell: ({ row }) => <span className="text-[13px] text-foreground">{row.original.gender}</span>,
      },
      {
        accessorKey: 'phone',
        header: 'Phone Number',
        cell: ({ row }) => (
          <span className="text-[13px] text-foreground" data-phi="true">
            {row.original.phone}
          </span>
        ),
      },
      {
        id: 'programs',
        header: 'Programs',
        cell: ({ row }) => {
          const { programs } = row.original;
          if (!programs.length) {
            return <span className="text-xs text-muted-foreground">—</span>;
          }
          return (
            <div className="flex items-center flex-wrap gap-1.5">
              {programs.includes('APCM') && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                  APCM
                </span>
              )}
              {programs.includes('RPM') && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  RPM
                </span>
              )}
              {programs.includes('BHI') && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                  BHI
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'pcpName',
        header: 'PCP Name',
        cell: ({ row }) => <span className="text-[13px] text-foreground">{row.original.pcpName}</span>,
      },
      ...(isDeactivatedTab
        ? [
            {
              id: 'deactivatedOn',
              header: 'Deactivated On',
              cell: ({ row }: { row: { original: PatientListItem } }) => (
                <span className="text-[13px] text-muted-foreground">
                  {row.original.deactivatedOn ? formatDateMDY(row.original.deactivatedOn) : '—'}
                </span>
              ),
            } satisfies ColumnDef<PatientListItem>,
          ]
        : []),
      ...(isPendingTab
        ? []
        : [
            {
              id: 'actions',
              header: 'Actions',
              cell: ({ row }: { row: { original: PatientListItem } }) => (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {!isDeactivatedTab && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(PATIENT_EDIT_PATH.replace(':id', row.original.id));
                        }}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
                        title="Edit patient"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeactivateTarget({ id: row.original.id, name: row.original.fullName });
                        }}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Disenroll patient"
                      >
                        <PowerOff size={13} />
                      </button>
                    </>
                  )}
                  {isDeactivatedTab && <span className="text-[11px] text-muted-foreground italic">Disenrolled</span>}
                </div>
              ),
            } satisfies ColumnDef<PatientListItem>,
          ]),
    ];
  }, [navigate, statusFilter]);

  const filteredData = useMemo(
    () =>
      patients.filter((p) => {
        const q = search.toLowerCase();
        const matchesSearch = !q || p.fullName.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q);
        if (!matchesSearch) return false;
        if (p.status !== statusFilter) return false;
        if (programFilters.length > 0 && !programFilters.every((f) => p.programs.includes(f))) return false;
        return true;
      }),
    [search, statusFilter, programFilters, patients]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
    autoResetPageIndex: true,
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const total = filteredData.length;
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <div className="min-h-screen flex bg-[#FAFAF9]">
      <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[margin-left] duration-[220ms] ease-in-out',
          navCollapsed ? 'ml-[60px]' : 'ml-60'
        )}
      >
        <TopBar title="Patient Management" subtitle="Manage and monitor all enrolled patients" />

        <main className="flex-1 p-7 flex flex-col gap-5">
          {/* Controls row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {/* Status filter tabs */}
              <StatusTabs
                tabs={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Deactivated', label: 'Disenrolled' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
              />

              {/* Search */}
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by name or MRN..."
                className="w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Programs filter dropdown — multi-select */}
              <div ref={programDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProgramDropdownOpen((o) => !o)}
                  className={cn(
                    'h-9 px-3.5 flex items-center gap-2 rounded-lg border text-sm font-medium transition-colors',
                    programFilters.length > 0
                      ? 'border-primary/40 bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-foreground hover:bg-slate-50'
                  )}
                >
                  <Filter size={13} />
                  {programFilters.length === 0
                    ? 'Programs'
                    : programFilters.length === 1
                      ? programFilters[0]
                      : `${programFilters.length} Programs`}
                  {programFilters.length > 0 && (
                    <span className="ml-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                      {programFilters.length}
                    </span>
                  )}
                  <ChevronDown
                    size={13}
                    className={cn(
                      'text-muted-foreground transition-transform duration-150',
                      programDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {programDropdownOpen && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-48 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-3.5 pt-3 pb-2">
                      {/* <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Filter by Program
                      </p> */}
                    </div>
                    <div className="pb-1.5">
                      {(['APCM', 'RPM', 'BHI'] as const).map((opt) => {
                        const checked = programFilters.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setProgramFilters((prev) => (checked ? prev.filter((p) => p !== opt) : [...prev, opt]))
                            }
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 transition-colors text-left"
                          >
                            <div
                              className={cn(
                                'w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0',
                                checked ? 'bg-primary border-primary' : 'bg-white border-slate-300'
                              )}
                            >
                              {checked && <Check size={10} className="text-primary-foreground" strokeWidth={3} />}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'text-[11px] font-semibold px-1.5 py-0.5 rounded-full border',
                                  opt === 'APCM' && 'bg-teal-50 text-teal-700 border-teal-100',
                                  opt === 'RPM' && 'bg-blue-50 text-blue-700 border-blue-100',
                                  opt === 'BHI' && 'bg-violet-50 text-violet-700 border-violet-100'
                                )}
                              >
                                {opt}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {programFilters.length > 0 && (
                      <>
                        <div className="mx-3.5 border-t border-slate-100" />
                        <button
                          type="button"
                          onClick={() => setProgramFilters([])}
                          className="w-full px-3.5 py-2.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors text-left"
                        >
                          Clear filter
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Enroll dropdown */}
              <div ref={enrollDropdownRef} className="relative">
                <Button
                  className="h-9 px-4 text-sm font-semibold gap-2 shadow-xs"
                  onClick={() => setEnrollDropdownOpen((o) => !o)}
                >
                  <UserPlus size={15} />
                  Enroll New Patient
                  <ChevronDown
                    size={13}
                    className={cn('transition-transform duration-150', enrollDropdownOpen && 'rotate-180')}
                  />
                </Button>

                {enrollDropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-50">
                    <div className="w-52 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden py-1.5">
                      {/* Manual Enroll */}
                      <button
                        type="button"
                        onClick={() => {
                          setEnrollDropdownOpen(false);
                          navigate(PATIENT_ENROLL_PATH);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <ClipboardList size={13} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-[12.5px] font-semibold text-foreground">Manual Enroll</p>
                          <p className="text-[10.5px] text-muted-foreground">Enter details manually</p>
                        </div>
                      </button>

                      {/* Divider */}
                      <div className="mx-3 my-1 border-t border-slate-100" />

                      {/* EHR Linked Enroll */}
                      <button
                        type="button"
                        onClick={() => {
                          setEnrollDropdownOpen(false);
                          setEhrSearchModal({ open: true, ehr: null });
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded-md bg-violet-100 flex items-center justify-center shrink-0">
                          <Link2 size={13} className="text-violet-600" />
                        </div>
                        <div>
                          <p className="text-[12.5px] font-semibold text-foreground">EHR Linked Enroll</p>
                          <p className="text-[10.5px] text-muted-foreground">Import from EHR</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* end flex items-center gap-2 */}
          </div>

          {/* Deactivated empty state — outside table */}
          {statusFilter === 'Deactivated' && filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-10 gap-4">
              <img src="/empty-deactivated.svg" alt="No deactivated patients" className="w-64 h-64 object-contain" />
              <div className="text-center space-y-1.5">
                <p className="text-[14.5px] font-bold text-foreground">No Disenrolled Patients</p>
                <p className="text-[12.5px] text-muted-foreground max-w-[300px] leading-relaxed">
                  Patients you disenroll will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-[14px] shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="bg-[#FAFAF9] hover:bg-[#FAFAF9] border-b border-slate-200"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground py-3.5 first:pl-5"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={columns.length} className="py-0">
                        {patients.filter((p) => p.status === statusFilter).length === 0 ? (
                          /* ── No patients enrolled yet ── */
                          <div className="flex flex-col items-center justify-center py-14 gap-5">
                            <NoPatientsSVG />
                            <div className="text-center space-y-1.5">
                              <p className="text-[14.5px] font-bold text-foreground">No Patients Enrolled Yet</p>
                              <p className="text-[12.5px] text-muted-foreground max-w-[300px] leading-relaxed">
                                Your patient list is empty. Click{' '}
                                <span className="font-semibold text-foreground">Enroll New Patient</span> to get
                                started.
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* ── Search / filter returned nothing ── */
                          <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <NoResultsSVG />
                            <div className="text-center space-y-1">
                              <p className="text-[13.5px] font-semibold text-foreground">No results found</p>
                              <p className="text-[12px] text-muted-foreground">
                                Try adjusting your search or program filter.
                              </p>
                            </div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0"
                        onClick={() => navigate(`${PATIENT_BASE_PATH}/${row.original.id}`)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3.5 first:pl-5">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination — only when there are rows */}
              {total > 0 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                  <p className="text-xs text-muted-foreground">
                    Showing{' '}
                    <span className="font-semibold text-foreground">
                      {from}–{to}
                    </span>{' '}
                    of <span className="font-semibold text-foreground">{total}</span> patients
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
                          pageIndex === i
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-slate-100'
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
              )}
            </div>
          )}
          {/* end deactivated ternary */}
        </main>
      </div>

      {/* EHR Patient Search Modal */}
      <EHRPatientSearchModal
        open={ehrSearchModal.open}
        onClose={() => setEhrSearchModal({ open: false, ehr: null })}
        ehr={ehrSearchModal.ehr}
        onFetch={(prefill) => {
          setEhrSearchModal({ open: false, ehr: null });
          handleEHRSelect(prefill);
        }}
        onManualEnroll={() => navigate(PATIENT_ENROLL_PATH)}
      />

      {/* Deactivate confirmation */}
      <ConfirmDialog
        open={!!deactivateTarget}
        onOpenChange={(o) => {
          if (!o) setDeactivateTarget(null);
        }}
        icon={<PowerOff size={18} />}
        iconClassName="bg-amber-50 text-amber-600"
        title="Disenroll Patient"
        description={
          <>
            Are you sure you want to disenroll{' '}
            <span className="font-semibold text-foreground" data-phi="true">
              {deactivateTarget?.name}
            </span>
            ? The patient will be moved to the Deactivated tab and will no longer appear in active lists.
          </>
        }
        confirmLabel="Disenroll Patient"
        confirmClassName="bg-amber-600 text-white hover:bg-amber-700"
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
