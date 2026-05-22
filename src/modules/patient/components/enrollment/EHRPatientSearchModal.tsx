import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { CalendarIcon, Check, Loader2, Search, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { EHRPrefillData } from './EHRSelector';

// ─── Exported Types ───────────────────────────────────────────────────────────

export interface EHRInfo {
  id: string;
  name: string;
  color: string;
  initials: string;
}

interface EHRPatientSearchModalProps {
  open: boolean;
  onClose: () => void;
  ehr: EHRInfo | null;
  onFetch: (prefill: EHRPrefillData) => void;
  onManualEnroll: () => void;
}

// ─── Patient Record ───────────────────────────────────────────────────────────

interface EHRPatientRecord {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  mrn: string;
  dob: string; // MM/DD/YYYY
  dobRaw: string; // YYYY-MM-DD
  gender: string;
  initials: string;
  prefill: EHRPrefillData;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const EHR_PATIENTS: EHRPatientRecord[] = [
  {
    id: 'epic-1',
    name: 'Michael Thompson',
    firstName: 'michael',
    lastName: 'thompson',
    mrn: 'EHR-28491',
    dob: '03/15/1975',
    dobRaw: '1975-03-15',
    gender: 'Male',
    initials: 'MT',
    prefill: {
      ehrName: 'Epic',
      step1: {
        firstName: 'Michael',
        lastName: 'Thompson',
        mrn: 'EHR-28491',
        dateOfBirth: '1975-03-15',
        gender: 'Male',
        email: 'michael.thompson@gmail.com',
        phone: '(555) 847-2931',
        pcpName: '',
        addressLine1: '1247 Oak Street',
        addressLine2: '',
        city: 'Chicago',
        state: 'Illinois',
        zipCode: '60601',
        country: 'United States',
      },
      step2: {
        insurancePlanName: 'BlueCross BlueShield',
        planType: 'PPO',
        memberId: 'BCB-849271',
        groupNumber: 'GRP-0042',
        secondaryInsurance: '',
        secondaryMemberId: '',
      },
      diagnoses: [
        { conditionName: 'Hypertension', icdCode: 'I10', severity: 'Moderate' },
        { conditionName: 'Type 2 Diabetes', icdCode: 'E11.9', severity: 'Moderate' },
        { conditionName: 'Heart Failure', icdCode: 'I50.9', severity: 'Severe' },
      ],
    },
  },
  {
    id: 'epic-2',
    name: 'Emily Watson',
    firstName: 'emily',
    lastName: 'watson',
    mrn: 'EHR-38821',
    dob: '07/22/1988',
    dobRaw: '1988-07-22',
    gender: 'Female',
    initials: 'EW',
    prefill: {
      ehrName: 'Epic',
      step1: {
        firstName: 'Emily',
        lastName: 'Watson',
        mrn: 'EHR-38821',
        dateOfBirth: '1988-07-22',
        gender: 'Female',
        email: 'emily.watson@gmail.com',
        phone: '(555) 293-4410',
        pcpName: '',
        addressLine1: '348 Lakeview Drive',
        addressLine2: '',
        city: 'Chicago',
        state: 'Illinois',
        zipCode: '60614',
        country: 'United States',
      },
      step2: {
        insurancePlanName: 'Aetna Health',
        planType: 'HMO',
        memberId: 'AET-293847',
        groupNumber: 'GRP-1192',
        secondaryInsurance: '',
        secondaryMemberId: '',
      },
      diagnoses: [{ conditionName: 'Anxiety', icdCode: 'F41.9', severity: 'Mild' }],
    },
  },
  {
    id: 'epic-3',
    name: "James O'Brien",
    firstName: 'james',
    lastName: "o'brien",
    mrn: 'EHR-49102',
    dob: '11/04/1961',
    dobRaw: '1961-11-04',
    gender: 'Male',
    initials: 'JO',
    prefill: {
      ehrName: 'Epic',
      step1: {
        firstName: 'James',
        lastName: "O'Brien",
        mrn: 'EHR-49102',
        dateOfBirth: '1961-11-04',
        gender: 'Male',
        email: 'james.obrien@yahoo.com',
        phone: '(555) 481-7720',
        pcpName: '',
        addressLine1: '92 Harbor Boulevard',
        addressLine2: '',
        city: 'Evanston',
        state: 'Illinois',
        zipCode: '60201',
        country: 'United States',
      },
      step2: {
        insurancePlanName: 'Cigna Health',
        planType: 'PPO',
        memberId: 'CIG-481920',
        groupNumber: 'GRP-4410',
        secondaryInsurance: 'Medicare Part B',
        secondaryMemberId: 'MED-61102B',
      },
      diagnoses: [
        { conditionName: 'Hypertension', icdCode: 'I10', severity: 'Severe' },
        { conditionName: 'Heart Failure', icdCode: 'I50.9', severity: 'Severe' },
        { conditionName: 'Atrial Fibrillation', icdCode: 'I48.91', severity: 'Moderate' },
      ],
    },
  },
  {
    id: 'epic-4',
    name: 'Sofia Martinez',
    firstName: 'sofia',
    lastName: 'martinez',
    mrn: 'EHR-51294',
    dob: '02/18/1995',
    dobRaw: '1995-02-18',
    gender: 'Female',
    initials: 'SM',
    prefill: {
      ehrName: 'Epic',
      step1: {
        firstName: 'Sofia',
        lastName: 'Martinez',
        mrn: 'EHR-51294',
        dateOfBirth: '1995-02-18',
        gender: 'Female',
        email: 'sofia.martinez@icloud.com',
        phone: '(555) 617-3308',
        pcpName: '',
        addressLine1: '711 Oak Park Avenue',
        addressLine2: '',
        city: 'Chicago',
        state: 'Illinois',
        zipCode: '60302',
        country: 'United States',
      },
      step2: {
        insurancePlanName: 'UnitedHealthcare',
        planType: 'EPO',
        memberId: 'UHC-617295',
        groupNumber: 'GRP-8831',
        secondaryInsurance: '',
        secondaryMemberId: '',
      },
      diagnoses: [{ conditionName: 'Depression', icdCode: 'F32.9', severity: 'Moderate' }],
    },
  },
  {
    id: 'epic-5',
    name: 'Emily Watson',
    firstName: 'emily',
    lastName: 'watson',
    mrn: 'EHR-72341',
    dob: '07/22/1988',
    dobRaw: '1988-07-22',
    gender: 'Female',
    initials: 'EW',
    prefill: {
      ehrName: 'Epic',
      step1: {
        firstName: 'Emily',
        lastName: 'Watson',
        mrn: 'EHR-72341',
        dateOfBirth: '1988-07-22',
        gender: 'Female',
        email: 'emily.watson@outlook.com',
        phone: '(555) 910-2244',
        pcpName: '',
        addressLine1: '502 Riverside Avenue',
        addressLine2: '',
        city: 'Chicago',
        state: 'Illinois',
        zipCode: '60657',
        country: 'United States',
      },
      step2: {
        insurancePlanName: 'Humana Gold Plus',
        planType: 'HMO',
        memberId: 'HUM-910224',
        groupNumber: 'GRP-5521',
        secondaryInsurance: '',
        secondaryMemberId: '',
      },
      diagnoses: [
        { conditionName: 'Anxiety', icdCode: 'F41.9', severity: 'Moderate' },
        { conditionName: 'Hypertension', icdCode: 'I10', severity: 'Mild' },
      ],
    },
  },
];

type SearchState = 'idle' | 'searching' | 'found' | 'not_found';
type SearchSection = 'mrn' | 'demographics';

// ─── Shared input class ───────────────────────────────────────────────────────

const INPUT_CLS =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors hover:border-slate-300 focus:border-ring focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground disabled:opacity-50 disabled:hover:border-input';

// ─── Patient Result Card ──────────────────────────────────────────────────────

function PatientResultCard({
  record,
  selectable,
  selected,
  radioStyle,
  onToggle,
}: {
  record: EHRPatientRecord;
  selectable: boolean;
  selected: boolean;
  radioStyle?: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={selectable ? onToggle : undefined}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left border',
        selected
          ? 'bg-primary/5 border-primary/20 hover:bg-primary/[0.07] hover:border-primary/30'
          : selectable
            ? 'bg-slate-50/80 border-slate-100 hover:bg-slate-100/80 hover:border-slate-200 cursor-pointer'
            : 'bg-slate-50/80 border-slate-100 cursor-default'
      )}
    >
      {/* Radio / check indicator — left side for radio style */}
      {radioStyle && (
        <div
          className={cn(
            'w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors',
            selected ? 'border-primary' : 'border-slate-300 bg-white'
          )}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
        </div>
      )}

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold bg-teal-50 text-teal-700 border border-teal-100">
        {record.initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground leading-tight">{record.name}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[11px] text-muted-foreground font-mono">{record.mrn}</span>
          <span className="text-[11px] text-muted-foreground">·</span>
          <span className="text-[11px] text-muted-foreground">{record.dob}</span>
          <span className="text-[11px] text-muted-foreground">·</span>
          <span className="text-[11px] text-muted-foreground">{record.gender}</span>
        </div>
      </div>

      {/* Check indicator — right side for multi (non-radio) */}
      {selectable && !radioStyle && (
        <div
          className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors',
            selected ? 'bg-primary border-primary' : 'bg-white border-slate-300'
          )}
        >
          {selected && <Check size={10} className="text-white" strokeWidth={3} />}
        </div>
      )}
    </button>
  );
}

// ─── Found Results Block ──────────────────────────────────────────────────────

function FoundBlock({
  results,
  selected,
  forceSelectable,
  onSelect,
}: {
  results: EHRPatientRecord[];
  selected: EHRPatientRecord | null;
  forceSelectable?: boolean;
  onSelect: (r: EHRPatientRecord | null) => void;
}): React.JSX.Element {
  const multi = results.length > 1;
  const selectable = forceSelectable || multi;
  const radioStyle = !!forceSelectable;

  return (
    <div className="space-y-2">
      {/* Status bar */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <Check size={8} className="text-white" strokeWidth={3.5} />
        </div>
        <p className="text-[11.5px] font-semibold text-emerald-700">
          {results.length > 1
            ? `${results.length} patients found — select one to import`
            : forceSelectable
              ? 'Patient found — select to import'
              : 'Patient found'}
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {results.map((record) => (
          <PatientResultCard
            key={record.id}
            record={record}
            selectable={selectable}
            selected={selected?.id === record.id}
            radioStyle={radioStyle}
            onToggle={() => onSelect(selected?.id === record.id ? null : record)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Not Found Block ──────────────────────────────────────────────────────────

function NotFoundBlock({ onManual }: { onManual: () => void }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center">
      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
        <X size={15} className="text-slate-400" />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-foreground">No patient found</p>
        <p className="text-[11.5px] text-muted-foreground mt-0.5">No matching record in EPIC EHR.</p>
      </div>
      <button
        type="button"
        onClick={onManual}
        className="inline-flex items-center gap-1.5 h-8 px-4 text-[12px] font-medium border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors text-foreground"
      >
        <UserPlus size={12} />
        Add Patient Manually
      </button>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EHRPatientSearchModal({
  open,
  onClose,
  onFetch,
  onManualEnroll,
}: EHRPatientSearchModalProps): React.JSX.Element | null {
  // Fields
  const [mrn, setMrn] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dobDate, setDobDate] = useState<Date | undefined>(undefined);
  const [dobOpen, setDobOpen] = useState(false);
  const [calendarPos, setCalendarPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setDobOpen(false);
      }
    }
    if (dobOpen) document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [dobOpen]);

  function openCalendar(): void {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCalendarPos({ top: rect.bottom + 4, left: rect.left });
    setDobOpen(true);
  }

  // Search state
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [activeSection, setActiveSection] = useState<SearchSection | null>(null);
  const [results, setResults] = useState<EHRPatientRecord[]>([]);
  const [selected, setSelected] = useState<EHRPatientRecord | null>(null);
  const [fetching, setFetching] = useState(false);

  // Reset everything on open
  useEffect(() => {
    if (open) {
      setMrn('');
      setFirstName('');
      setLastName('');
      setDobDate(undefined);
      setDobOpen(false);
      setSearchState('idle');
      setActiveSection(null);
      setResults([]);
      setSelected(null);
      setFetching(false);
    }
  }, [open]);

  // ── Clear results when user edits a field after a search ─────────────────
  function clearResults(): void {
    if (searchState !== 'idle') {
      setSearchState('idle');
      setActiveSection(null);
      setResults([]);
      setSelected(null);
    }
  }

  // ── MRN search ────────────────────────────────────────────────────────────
  function handleMrnSearch(): void {
    const q = mrn.trim().replace(/\D/g, '');
    if (!q) return;
    setActiveSection('mrn');
    setSearchState('searching');
    setResults([]);
    setSelected(null);
    setTimeout(() => {
      const found = EHR_PATIENTS.find((p) => p.mrn.replace(/\D/g, '').includes(q));
      if (found) {
        setResults([found]);
        setSelected(found); // auto-select single MRN result
        setSearchState('found');
      } else {
        setSearchState('not_found');
      }
    }, 800);
  }

  // ── Demographics search ───────────────────────────────────────────────────
  function handleDemoSearch(): void {
    const fn = firstName.trim().toLowerCase();
    const ln = lastName.trim().toLowerCase();
    const dobQ = dobDate ? format(dobDate, 'MM/dd/yyyy') : '';
    if (!fn || !ln || !dobQ) return;

    setActiveSection('demographics');
    setSearchState('searching');
    setResults([]);
    setSelected(null);
    setTimeout(() => {
      const matched = EHR_PATIENTS.filter((p) => {
        if (!p.firstName.includes(fn)) return false;
        if (!p.lastName.includes(ln)) return false;
        if (!p.dob.includes(dobQ) && !p.dobRaw.includes(dobQ)) return false;
        return true;
      });
      if (matched.length > 0) {
        setResults(matched);
        // Never auto-select for demographics — user must explicitly pick via radio
        setSearchState('found');
      } else {
        setSearchState('not_found');
      }
    }, 800);
  }

  function handleFetch(): void {
    if (!selected) return;
    setFetching(true);
    setTimeout(() => {
      onFetch(selected.prefill);
    }, 1500);
  }

  function handleManualEnroll(): void {
    onClose();
    onManualEnroll();
  }

  if (!open) return null;

  const mrnSearching = searchState === 'searching' && activeSection === 'mrn';
  const demoSearching = searchState === 'searching' && activeSection === 'demographics';
  const mrnBtnDisabled = !mrn.trim() || searchState === 'searching';
  const demoBtnDisabled = !firstName.trim() || !lastName.trim() || !dobDate || searchState === 'searching';

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!fetching && !o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        {/* Fetching overlay */}
        {fetching && (
          <div className="absolute inset-0 bg-white/96 z-10 flex flex-col items-center justify-center gap-4 rounded-[inherit]">
            <div className="w-12 h-12 rounded-full border-[3px] border-slate-200 border-t-primary animate-spin" />
            <div className="text-center">
              <p className="text-[14px] font-semibold text-foreground">Fetching patient data…</p>
              <p className="text-[12px] text-muted-foreground mt-1">Importing records from EPIC EHR</p>
            </div>
          </div>
        )}

        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
          <DialogTitle className="text-[14px] font-bold">EHR Linked Enrollment</DialogTitle>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Verify a patient by MRN or by name and date of birth before importing.
          </p>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* ── Section 1: MRN ──────────────────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[12.5px] font-semibold text-foreground leading-none">
                MRN Number
                <span className="text-destructive ml-0.5">*</span>
              </label>
              <span className="text-[10.5px] text-muted-foreground">e.g. EHR-28491</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter MRN"
                value={mrn}
                onChange={(e) => {
                  setMrn(e.target.value);
                  clearResults();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleMrnSearch();
                }}
                disabled={fetching}
                autoFocus
                className={cn(INPUT_CLS, 'flex-1')}
              />
              <button
                type="button"
                onClick={handleMrnSearch}
                disabled={mrnBtnDisabled || fetching}
                className="h-9 px-4 flex items-center gap-1.5 text-[12.5px] font-semibold rounded-md border border-slate-200 bg-white text-foreground hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-40 shrink-0"
              >
                {mrnSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                Check
              </button>
            </div>
          </div>

          {/* ── OR divider ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-dashed border-slate-200" />
            <span className="text-[11px] font-semibold text-muted-foreground tracking-widest">OR</span>
            <div className="flex-1 border-t border-dashed border-slate-200" />
          </div>

          {/* ── Section 2: Demographics ──────────────────────────────────── */}
          <div className="space-y-3">
            {/* First + Last */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium leading-none text-foreground">
                  First Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Michael"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    clearResults();
                  }}
                  disabled={fetching}
                  className={INPUT_CLS}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium leading-none text-foreground">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Thompson"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    clearResults();
                  }}
                  disabled={fetching}
                  className={INPUT_CLS}
                />
              </div>
            </div>

            {/* DOB calendar picker + Search button — mirrors MRN row layout */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium leading-none text-foreground">
                Date of Birth <span className="text-destructive">*</span>
              </label>
              <div className="grid gap-2" style={{ gridTemplateColumns: '1fr auto' }}>
                <div className="relative">
                  <button
                    ref={triggerRef}
                    type="button"
                    disabled={fetching}
                    onClick={openCalendar}
                    className={cn(
                      INPUT_CLS,
                      'w-full flex items-center justify-between text-left px-3 cursor-pointer',
                      !dobDate && 'text-muted-foreground'
                    )}
                  >
                    <span>{dobDate ? format(dobDate, 'MM/dd/yyyy') : 'MM/DD/YYYY'}</span>
                    <CalendarIcon size={14} className="text-muted-foreground shrink-0 ml-2" />
                  </button>
                </div>
                {dobOpen &&
                  calendarPos &&
                  createPortal(
                    <div
                      ref={calendarRef}
                      style={{ position: 'fixed', top: calendarPos.top, left: calendarPos.left, zIndex: 9999 }}
                      className="bg-white rounded-md border border-slate-200 shadow-md"
                    >
                      <Calendar
                        mode="single"
                        selected={dobDate}
                        onSelect={(date) => {
                          setDobDate(date);
                          setDobOpen(false);
                          clearResults();
                        }}
                        captionLayout="dropdown"
                        fromYear={1924}
                        toYear={new Date().getFullYear()}
                        defaultMonth={dobDate ?? new Date(1990, 0)}
                      />
                    </div>,
                    document.body
                  )}
                <button
                  type="button"
                  onClick={handleDemoSearch}
                  disabled={demoBtnDisabled || fetching}
                  className="h-9 px-4 flex items-center gap-1.5 text-[12.5px] font-semibold rounded-md border border-slate-200 bg-white text-foreground hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-40 shrink-0"
                >
                  {demoSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* ── Result area ──────────────────────────────────────────────── */}
          {searchState !== 'idle' && (
            <div className="border-t border-slate-100 pt-4">
              {/* Searching (non-button spinner for clarity) */}
              {searchState === 'searching' && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <div className="w-5 h-5 rounded-full border-[2.5px] border-slate-200 border-t-primary animate-spin" />
                  <p className="text-[12px] text-muted-foreground">Searching EPIC EHR…</p>
                </div>
              )}

              {/* Found */}
              {searchState === 'found' && results.length > 0 && (
                <FoundBlock
                  results={results}
                  selected={selected}
                  forceSelectable={activeSection === 'demographics'}
                  onSelect={setSelected}
                />
              )}

              {/* Not found */}
              {searchState === 'not_found' && <NotFoundBlock onManual={handleManualEnroll} />}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[11px] text-muted-foreground">
            {selected ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <Check size={11} className="inline" /> {selected.name} selected
              </span>
            ) : (
              'Select a patient above to import'
            )}
          </p>
          <Button
            onClick={handleFetch}
            disabled={!selected || fetching}
            className="h-9 px-5 text-[13px] gap-2 shadow-xs"
          >
            Fetch Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
