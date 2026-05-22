import React, { useMemo, useRef, useEffect, useState } from 'react';
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
  Clock,
  Download,
  FileText,
  Filter,
  Receipt,
  Search,
} from 'lucide-react';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/search-input/SearchInput';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { BillingRecord, ProgramType, StepRole } from '../@types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BILLING_RECORDS: BillingRecord[] = [
  {
    id: 'b-001',
    patientFirstName: 'Eleanor',
    patientLastName: 'Vance',
    mrn: 'MRN-10041',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0041',
    billingMonth: 'Apr 2026',
    programs: ['RPM', 'BHI'],
    cptCode: '99457',
    cptDescription: 'RPM — First 20 min clinical staff time',
    generationDate: 'Apr 30, 2026',
    status: 'Generated',
    claimReason:
      'Patient enrolled in RPM with active remote monitoring. Minimum 20 minutes of clinical staff time documented for blood pressure management.',
    timeline: {
      startTime: 'Apr 30, 2026 · 9:00 AM',
      endTime: 'Apr 30, 2026 · 9:22 AM',
      duration: '22 min',
      steps: [
        { time: '9:00 AM', label: 'Session Started', role: 'Patient', duration: '—' },
        { time: '9:08 AM', label: 'Vitals Reviewed', role: 'RN', duration: '8 min' },
        { time: '9:14 AM', label: 'Care Notes Updated', role: 'DHN', duration: '6 min' },
        { time: '9:22 AM', label: 'Session Completed', role: 'Physician', duration: '8 min' },
      ],
    },
  },
  {
    id: 'b-002',
    patientFirstName: 'David',
    patientLastName: 'Chen',
    mrn: 'MRN-10096',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0042',
    billingMonth: 'Apr 2026',
    programs: ['RPM'],
    cptCode: '99458',
    cptDescription: 'RPM — Additional 20 min clinical staff time',
    generationDate: 'Apr 30, 2026',
    status: 'Generated',
    claimReason:
      'Additional 20-minute remote monitoring clinical review completed for hypertension management. Physician-directed care documented with medication adjustments.',
    timeline: {
      startTime: 'Apr 30, 2026 · 9:22 AM',
      endTime: 'Apr 30, 2026 · 9:44 AM',
      duration: '22 min',
      steps: [
        { time: '9:22 AM', label: 'Session Started', role: 'Patient', duration: '—' },
        { time: '9:30 AM', label: 'Medication Reviewed', role: 'RN', duration: '8 min' },
        { time: '9:40 AM', label: 'Physician Consulted', role: 'Physician', duration: '10 min' },
        { time: '9:44 AM', label: 'Session Completed', role: 'Physician', duration: '4 min' },
      ],
    },
  },
  {
    id: 'b-003',
    patientFirstName: 'Robert',
    patientLastName: 'Johnson',
    mrn: 'MRN-10088',
    pcpName: 'Dr. Sarah Kim',
    npiNumber: '9876543210',
    invoiceNumber: 'INV-2026-0039',
    billingMonth: 'Apr 2026',
    programs: ['APCM'],
    cptCode: '99490',
    cptDescription: 'APCM — Chronic care management, 20 min',
    generationDate: 'Apr 30, 2026',
    status: 'Generated',
    claimReason:
      'Chronic care management services for patient with multiple complex conditions. At least 20 minutes of clinical staff time logged with care plan review.',
    timeline: {
      startTime: 'Apr 30, 2026 · 10:00 AM',
      endTime: 'Apr 30, 2026 · 10:22 AM',
      duration: '22 min',
      steps: [
        { time: '10:00 AM', label: 'CCM Session Started', role: 'Patient', duration: '—' },
        { time: '10:09 AM', label: 'Care Plan Reviewed', role: 'RN', duration: '9 min' },
        { time: '10:18 AM', label: 'Referral Coordinated', role: 'DHN', duration: '9 min' },
        { time: '10:22 AM', label: 'Session Completed', role: 'Physician', duration: '4 min' },
      ],
    },
  },
  {
    id: 'b-004',
    patientFirstName: 'Maria',
    patientLastName: 'Gonzalez',
    mrn: 'MRN-10055',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0038',
    billingMonth: 'Apr 2026',
    programs: ['RPM', 'APCM'],
    cptCode: '99457',
    cptDescription: 'RPM — First 20 min clinical staff time',
    generationDate: 'Apr 30, 2026',
    status: 'Generated',
    claimReason:
      'Monthly RPM review completed for patient on dual RPM/APCM program. Vitals data reviewed and care plan updated by clinical staff.',
    timeline: {
      startTime: 'Apr 30, 2026 · 11:00 AM',
      endTime: 'Apr 30, 2026 · 11:21 AM',
      duration: '21 min',
      steps: [
        { time: '11:00 AM', label: 'Session Started', role: 'Patient', duration: '—' },
        { time: '11:08 AM', label: 'Vitals Reviewed', role: 'RN', duration: '8 min' },
        { time: '11:21 AM', label: 'Session Completed', role: 'Physician', duration: '13 min' },
      ],
    },
  },
  {
    id: 'b-005',
    patientFirstName: 'James',
    patientLastName: 'Whitfield',
    mrn: 'MRN-10072',
    pcpName: 'Dr. Sarah Kim',
    npiNumber: '9876543210',
    invoiceNumber: 'INV-2026-0036',
    billingMonth: 'Apr 2026',
    programs: ['APCM', 'BHI'],
    cptCode: '99491',
    cptDescription: 'APCM — Care mgmt, physician directed, 30 min',
    generationDate: 'Apr 29, 2026',
    status: 'Generated',
    claimReason:
      'Physician-directed care management with documented 30 minutes of direct physician time for complex chronic condition monitoring.',
    timeline: {
      startTime: 'Apr 29, 2026 · 2:00 PM',
      endTime: 'Apr 29, 2026 · 2:32 PM',
      duration: '32 min',
      steps: [
        { time: '2:00 PM', label: 'Physician Session Started', role: 'Patient', duration: '—' },
        { time: '2:12 PM', label: 'Vitals & Labs Reviewed', role: 'Physician', duration: '12 min' },
        { time: '2:25 PM', label: 'Treatment Plan Updated', role: 'Physician', duration: '13 min' },
        { time: '2:32 PM', label: 'Session Completed', role: 'Physician', duration: '7 min' },
      ],
    },
  },
  {
    id: 'b-006',
    patientFirstName: 'Linda',
    patientLastName: 'Patel',
    mrn: 'MRN-10063',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0033',
    billingMonth: 'Apr 2026',
    programs: ['RPM'],
    cptCode: '99091',
    cptDescription: 'RPM — Collection & interpretation of data',
    generationDate: 'Apr 28, 2026',
    status: 'Generated',
    claimReason:
      'Physician reviewed and interpreted 30 days of remotely transmitted physiologic data. Adjustments made to medication and monitoring plan.',
    timeline: {
      startTime: 'Apr 1, 2026 · 8:00 AM',
      endTime: 'Apr 28, 2026 · 3:15 PM',
      duration: '28 days',
      steps: [
        { time: 'Apr 1', label: 'Monitoring Period Started', role: 'Patient', duration: '—' },
        { time: 'Apr 28 · 3:00 PM', label: 'Data Interpretation', role: 'Physician', duration: '15 min' },
        { time: 'Apr 28 · 3:15 PM', label: 'Interpretation Completed', role: 'Physician', duration: '—' },
      ],
    },
  },
  {
    id: 'b-007',
    patientFirstName: 'Eleanor',
    patientLastName: 'Vance',
    mrn: 'MRN-10041',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0028',
    billingMonth: 'Mar 2026',
    programs: ['RPM', 'BHI'],
    cptCode: '99457',
    cptDescription: 'RPM — First 20 min clinical staff time',
    generationDate: 'Mar 31, 2026',
    status: 'Generated',
    claimReason:
      'Monthly RPM review completed. Clinical staff reviewed transmitted vitals data and documented 20-minute care coordination.',
    timeline: {
      startTime: 'Mar 31, 2026 · 9:05 AM',
      endTime: 'Mar 31, 2026 · 9:24 AM',
      duration: '19 min',
      steps: [
        { time: '9:05 AM', label: 'Session Started', role: 'Patient', duration: '—' },
        { time: '9:13 AM', label: 'Vitals Data Reviewed', role: 'RN', duration: '8 min' },
        { time: '9:24 AM', label: 'Session Completed', role: 'Physician', duration: '11 min' },
      ],
    },
  },
  {
    id: 'b-008',
    patientFirstName: 'Robert',
    patientLastName: 'Johnson',
    mrn: 'MRN-10088',
    pcpName: 'Dr. Sarah Kim',
    npiNumber: '9876543210',
    invoiceNumber: 'INV-2026-0027',
    billingMonth: 'Mar 2026',
    programs: ['APCM'],
    cptCode: '99490',
    cptDescription: 'APCM — Chronic care management, 20 min',
    generationDate: 'Mar 31, 2026',
    status: 'Generated',
    claimReason:
      'Monthly chronic care management session completed. Updated care plan and coordinated specialist referral for ongoing chronic condition.',
    timeline: {
      startTime: 'Mar 31, 2026 · 2:00 PM',
      endTime: 'Mar 31, 2026 · 2:21 PM',
      duration: '21 min',
      steps: [
        { time: '2:00 PM', label: 'CCM Session Started', role: 'Patient', duration: '—' },
        { time: '2:10 PM', label: 'Care Plan Updated', role: 'RN', duration: '10 min' },
        { time: '2:21 PM', label: 'Session Completed', role: 'Physician', duration: '11 min' },
      ],
    },
  },
  {
    id: 'b-009',
    patientFirstName: 'Maria',
    patientLastName: 'Gonzalez',
    mrn: 'MRN-10055',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0025',
    billingMonth: 'Mar 2026',
    programs: ['RPM', 'APCM'],
    cptCode: '99458',
    cptDescription: 'RPM — Additional 20 min clinical staff time',
    generationDate: 'Mar 31, 2026',
    status: 'Pending',
    claimReason:
      'Additional RPM clinical review session pending billing cycle completion. Physician review of extended monitoring data documented.',
    timeline: {
      startTime: 'Mar 31, 2026 · 10:00 AM',
      endTime: 'Mar 31, 2026 · 10:22 AM',
      duration: '22 min',
      steps: [
        { time: '10:00 AM', label: 'Continuation Started', role: 'Patient', duration: '—' },
        { time: '10:10 AM', label: 'Medication Reviewed', role: 'RN', duration: '10 min' },
        { time: '10:22 AM', label: 'Session Pending', role: 'System', duration: '12 min' },
      ],
    },
  },
  {
    id: 'b-010',
    patientFirstName: 'James',
    patientLastName: 'Whitfield',
    mrn: 'MRN-10072',
    pcpName: 'Dr. Sarah Kim',
    npiNumber: '9876543210',
    invoiceNumber: 'INV-2026-0022',
    billingMonth: 'Mar 2026',
    programs: ['APCM', 'BHI'],
    cptCode: '99487',
    cptDescription: 'APCM — Complex chronic care management, 60 min',
    generationDate: 'Mar 30, 2026',
    status: 'Generated',
    claimReason:
      'Complex chronic care management — 60 minutes of clinical time documented. Multiple comorbidities requiring advanced coordination across care team.',
    timeline: {
      startTime: 'Mar 30, 2026 · 9:00 AM',
      endTime: 'Mar 30, 2026 · 10:03 AM',
      duration: '63 min',
      steps: [
        { time: '9:00 AM', label: 'Complex CCM Started', role: 'Patient', duration: '—' },
        { time: '9:18 AM', label: 'Specialist Coordination', role: 'Physician', duration: '18 min' },
        { time: '9:40 AM', label: 'Care Team Synced', role: 'RN', duration: '22 min' },
        { time: '10:03 AM', label: 'Session Completed', role: 'Physician', duration: '23 min' },
      ],
    },
  },
  {
    id: 'b-011',
    patientFirstName: 'Linda',
    patientLastName: 'Patel',
    mrn: 'MRN-10063',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0019',
    billingMonth: 'Feb 2026',
    programs: ['RPM'],
    cptCode: '99457',
    cptDescription: 'RPM — First 20 min clinical staff time',
    generationDate: 'Feb 28, 2026',
    status: 'Generated',
    claimReason:
      'February RPM monitoring review. Clinical staff documented 20 minutes reviewing vitals trend data and updated patient care notes.',
    timeline: {
      startTime: 'Feb 28, 2026 · 9:00 AM',
      endTime: 'Feb 28, 2026 · 9:20 AM',
      duration: '20 min',
      steps: [
        { time: '9:00 AM', label: 'Session Started', role: 'Patient', duration: '—' },
        { time: '9:08 AM', label: 'Vitals Reviewed', role: 'RN', duration: '8 min' },
        { time: '9:20 AM', label: 'Session Completed', role: 'Physician', duration: '12 min' },
      ],
    },
  },
  {
    id: 'b-012',
    patientFirstName: 'Eleanor',
    patientLastName: 'Vance',
    mrn: 'MRN-10041',
    pcpName: 'Dr. Michael Torres',
    npiNumber: '1234567890',
    invoiceNumber: 'INV-2026-0015',
    billingMonth: 'Feb 2026',
    programs: ['RPM', 'BHI'],
    cptCode: '99091',
    cptDescription: 'RPM — Collection & interpretation of data',
    generationDate: 'Feb 28, 2026',
    status: 'Generated',
    claimReason:
      'Physician reviewed and interpreted remotely transmitted physiologic data across the full February monitoring period. Medication adjustments documented.',
    timeline: {
      startTime: 'Feb 1, 2026 · 8:00 AM',
      endTime: 'Feb 28, 2026 · 3:18 PM',
      duration: '28 days',
      steps: [
        { time: 'Feb 1', label: 'Monitoring Period Started', role: 'Patient', duration: '—' },
        { time: 'Feb 28 · 3:00 PM', label: 'Data Interpretation', role: 'Physician', duration: '18 min' },
        { time: 'Feb 28 · 3:18 PM', label: 'Interpretation Completed', role: 'Physician', duration: '—' },
      ],
    },
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const PROGRAM_STYLE: Record<ProgramType, string> = {
  RPM: 'bg-blue-50 text-blue-700 border-blue-100',
  APCM: 'bg-teal-50 text-teal-700 border-teal-200',
  BHI: 'bg-violet-50 text-violet-700 border-violet-200',
};

// ─── Billing Record Dialog ────────────────────────────────────────────────────

const ROLE_STYLE: Record<StepRole, { dot: string; badge: string }> = {
  Patient: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  RN: { dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700 border-violet-100' },
  DHN: { dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-100' },
  Physician: { dot: 'bg-primary', badge: 'bg-primary/8 text-primary border-primary/15' },
  System: { dot: 'bg-slate-300', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const ROLE_FULL_NAME: Record<StepRole, string> = {
  Patient: 'Patient',
  RN: 'Registered Nurse',
  DHN: 'Digital Health Navigator',
  Physician: 'Physician',
  System: 'System',
};

function DialogField({ label, value }: { label: string; value: React.ReactNode }): React.JSX.Element {
  return (
    <div>
      <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em] mb-1">{label}</p>
      <div className="text-[13.5px] text-foreground font-medium">{value || '—'}</div>
    </div>
  );
}

function BillingRecordDialog({
  record,
  onClose,
}: {
  record: BillingRecord | null;
  onClose: () => void;
}): React.JSX.Element | null {
  if (!record) return null;

  return (
    <Dialog
      open={!!record}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[680px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Receipt size={15} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-[14px] font-bold leading-tight">Billing Record Details</DialogTitle>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">{record.invoiceNumber}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh] space-y-0">
          {/* Invoice & CPT Details */}
          <div className="mb-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-4">
              Invoice &amp; CPT Details
            </p>
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
              <DialogField label="Invoice Number" value={record.invoiceNumber} />
              <DialogField label="Patient Name" value={`${record.patientFirstName} ${record.patientLastName}`} />
              <DialogField
                label="Status"
                value={
                  <span
                    className={cn(
                      'inline-flex items-center text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border',
                      record.status === 'Generated'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    )}
                  >
                    {record.status}
                  </span>
                }
              />
              <DialogField label="CPT Code" value={record.cptCode} />
              <DialogField
                label="Program"
                value={
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {record.programs.map((p) => (
                      <span
                        key={p}
                        className={cn(
                          'inline-flex items-center text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border',
                          PROGRAM_STYLE[p]
                        )}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                }
              />
              <DialogField label="CPT Description" value={record.cptDescription} />
            </div>
          </div>

          {/* Session Timeline */}
          <div className="border-t border-slate-100 my-5" />
          <div className="mb-1">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={13} className="text-muted-foreground" />
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em]">
                Session Timeline
              </p>
              <span className="ml-auto text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15">
                {record.timeline.duration}
              </span>
            </div>
            <div className="relative pl-5">
              {record.timeline.steps.map((step, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === record.timeline.steps.length - 1;
                const style = ROLE_STYLE[step.role];
                return (
                  <div key={idx} className="relative flex gap-4">
                    <div className="flex flex-col items-center shrink-0" style={{ width: 12 }}>
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full shrink-0 ring-4 mt-0.5',
                          isFirst
                            ? 'bg-emerald-500 ring-emerald-100'
                            : isLast
                              ? 'bg-primary ring-primary/15'
                              : style.dot + ' ring-slate-100'
                        )}
                      />
                      {!isLast && <div className="flex-1 w-px border-l-2 border-dashed border-slate-200 my-1.5" />}
                    </div>
                    <div className={cn('flex-1 pb-5', isLast && 'pb-0')}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] font-semibold text-foreground">{step.label}</span>
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', style.badge)}>
                          {ROLE_FULL_NAME[step.role]}
                        </span>
                        {step.duration !== '—' && (
                          <span className="ml-auto text-[10.5px] font-semibold text-muted-foreground tabular-nums bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                            {step.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">{step.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 my-5" />

          {/* Physician & Billing Period */}
          <div className="mb-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-4">
              Physician &amp; Billing Period
            </p>
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
              <DialogField label="PCP Name" value={record.pcpName} />
              <DialogField label="NPI Number" value={record.npiNumber} />
              <DialogField label="Billing Month" value={record.billingMonth} />
              <DialogField label="Generation Date" value={record.generationDate} />
            </div>
          </div>

          <div className="border-t border-slate-100 my-5" />

          {/* Claim Reason */}
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-4">Claim Reason</p>
            <p className="text-[13.5px] text-foreground font-medium leading-relaxed">{record.claimReason}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-[13px] font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <Button
            onClick={() => toast.success(`Invoice ${record.invoiceNumber} downloaded.`)}
            className="h-9 px-4 text-[13px] gap-2"
          >
            <Download size={13} />
            Download Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BillingPage(): React.JSX.Element {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null);
  const [search, setSearch] = useState('');
  const [programFilters, setProgramFilters] = useState<ProgramType[]>([]);
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [patientFilter, setPatientFilter] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [patientOpen, setPatientOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [pcpFilter, setPcpFilter] = useState<string>('');
  const [pcpOpen, setPcpOpen] = useState(false);
  const [pcpSearch, setPcpSearch] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const patientRef = useRef<HTMLDivElement>(null);
  const pcpRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) setMonthOpen(false);
      if (patientRef.current && !patientRef.current.contains(e.target as Node)) {
        setPatientOpen(false);
        setPatientSearch('');
      }
      if (pcpRef.current && !pcpRef.current.contains(e.target as Node)) {
        setPcpOpen(false);
        setPcpSearch('');
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const BILLING_MONTHS = useMemo(() => [...new Set(BILLING_RECORDS.map((r) => r.billingMonth))], []);

  const PATIENT_NAMES = useMemo(
    () => [...new Set(BILLING_RECORDS.map((r) => `${r.patientFirstName} ${r.patientLastName}`))].sort(),
    []
  );

  const PCP_NAMES = useMemo(() => [...new Set(BILLING_RECORDS.map((r) => r.pcpName))].sort(), []);

  const filteredData = useMemo(() => {
    return BILLING_RECORDS.filter((r) => {
      if (programFilters.length > 0 && !programFilters.some((f) => r.programs.includes(f))) return false;
      if (monthFilter && r.billingMonth !== monthFilter) return false;
      if (patientFilter && `${r.patientFirstName} ${r.patientLastName}` !== patientFilter) return false;
      if (pcpFilter && r.pcpName !== pcpFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const fullName = `${r.patientFirstName} ${r.patientLastName}`.toLowerCase();
        if (!r.invoiceNumber.toLowerCase().includes(q) && !fullName.includes(q)) return false;
      }
      return true;
    });
  }, [search, programFilters, monthFilter, patientFilter, pcpFilter]);

  function handleDownload(record: BillingRecord): void {
    toast.success(`Invoice ${record.invoiceNumber} downloaded.`);
  }

  const columns = useMemo<ColumnDef<BillingRecord>[]>(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice Number',
        cell: ({ row }) => (
          <span className="text-[12.5px] font-medium text-foreground">{row.original.invoiceNumber}</span>
        ),
      },
      {
        id: 'patientName',
        header: 'Patient Name',
        cell: ({ row, table }) => {
          const rows = table.getRowModel().rows;
          const idx = rows.findIndex((r) => r.id === row.id);
          const prev = rows[idx - 1];
          const isSame =
            prev &&
            prev.original.patientFirstName === row.original.patientFirstName &&
            prev.original.patientLastName === row.original.patientLastName;
          if (isSame) {
            return <span className="text-[12px] text-slate-300 select-none">—</span>;
          }
          return (
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-semibold text-foreground leading-tight">
                {row.original.patientFirstName} {row.original.patientLastName}
              </span>
              <span className="text-[11.5px] text-muted-foreground mt-0.5 font-mono" data-phi>
                {maskMrn(row.original.mrn)}
              </span>
            </div>
          );
        },
      },
      {
        id: 'pcp',
        header: 'PCP Name & NPI',
        cell: ({ row }) => (
          <div>
            <p className="text-[12.5px] font-medium text-foreground">{row.original.pcpName}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">NPI: {row.original.npiNumber}</p>
          </div>
        ),
      },
      {
        id: 'programs',
        header: 'Program',
        cell: ({ row }) => (
          <div className="flex items-center flex-wrap gap-1.5">
            {(['APCM', 'RPM', 'BHI'] as const).map(
              (p) =>
                row.original.programs.includes(p) && (
                  <span
                    key={p}
                    className={cn(
                      'inline-flex items-center text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border',
                      PROGRAM_STYLE[p]
                    )}
                  >
                    {p}
                  </span>
                )
            )}
          </div>
        ),
      },
      {
        accessorKey: 'billingMonth',
        header: 'Billing Month',
        cell: ({ row }) => <span className="text-[12.5px] text-foreground">{row.original.billingMonth}</span>,
      },
      {
        id: 'cptCode',
        header: 'CPT Code',
        cell: ({ row }) => (
          <div>
            <p className="text-[12.5px] font-semibold text-foreground">{row.original.cptCode}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px] leading-snug">
              {row.original.cptDescription}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'generationDate',
        header: 'Generation Date',
        cell: ({ row }) => <span className="text-[12.5px] text-foreground">{row.original.generationDate}</span>,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              title={`Download ${row.original.invoiceNumber}`}
              onClick={() => handleDownload(row.original)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
            >
              <Download size={14} />
            </button>
          </div>
        ),
      },
    ],
    []
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
        <TopBar title="Billing" subtitle="Manage patient invoices and CPT codes" />

        <main className="flex-1 p-7 flex flex-col gap-5">
          {/* ── Toolbar ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {/* Search */}
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by invoice or patient name…"
                className="w-72"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Month filter */}
              <div ref={monthRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setMonthOpen((o) => !o);
                    setPatientOpen(false);
                    setFilterOpen(false);
                    setPcpOpen(false);
                  }}
                  className={cn(
                    'h-9 px-3.5 flex items-center gap-2 rounded-lg border text-sm font-medium transition-colors',
                    monthFilter
                      ? 'border-primary/40 bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-foreground hover:bg-slate-50'
                  )}
                >
                  <Filter size={13} />
                  {monthFilter || 'Month'}
                  <ChevronDown
                    size={13}
                    className={cn('text-muted-foreground transition-transform duration-150', monthOpen && 'rotate-180')}
                  />
                </button>

                {monthOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-44 bg-white rounded-xl border border-slate-200 shadow-xs py-1.5 overflow-hidden">
                    {BILLING_MONTHS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setMonthFilter(monthFilter === m ? '' : m);
                          setMonthOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-3.5 py-2.5 text-[12.5px] font-medium transition-colors text-left',
                          monthFilter === m ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-slate-50'
                        )}
                      >
                        {m}
                        {monthFilter === m && <Check size={12} className="text-primary shrink-0" />}
                      </button>
                    ))}
                    {monthFilter && (
                      <>
                        <div className="mx-3.5 border-t border-slate-100 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setMonthFilter('');
                            setMonthOpen(false);
                          }}
                          className="w-full px-3.5 py-2.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors text-left"
                        >
                          Clear filter
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Patient Name filter */}
              <div ref={patientRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setPatientOpen((o) => {
                      if (o) setPatientSearch('');
                      return !o;
                    });
                    setMonthOpen(false);
                    setFilterOpen(false);
                    setPcpOpen(false);
                  }}
                  className={cn(
                    'h-9 px-3.5 flex items-center gap-2 rounded-lg border text-sm font-medium transition-colors',
                    patientFilter
                      ? 'border-primary/40 bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-foreground hover:bg-slate-50'
                  )}
                >
                  <Filter size={13} />
                  {patientFilter || 'Patient'}
                  <ChevronDown
                    size={13}
                    className={cn(
                      'text-muted-foreground transition-transform duration-150',
                      patientOpen && 'rotate-180'
                    )}
                  />
                </button>

                {patientOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                    <div className="px-3 pt-3 pb-2 border-b border-slate-100">
                      <div className="relative">
                        <Search
                          size={12}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search patient…"
                          value={patientSearch}
                          onChange={(e) => setPatientSearch(e.target.value)}
                          className="w-full h-7 pl-7 pr-3 rounded-md border border-input bg-background text-[12px] outline-none focus:border-ring focus:ring-1 focus:ring-ring/40 placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-[252px] py-1">
                      {PATIENT_NAMES.filter((n) => n.toLowerCase().includes(patientSearch.trim().toLowerCase()))
                        .length === 0 ? (
                        <p className="px-3.5 py-3 text-[12px] text-muted-foreground text-center">No patients found</p>
                      ) : (
                        PATIENT_NAMES.filter((n) => n.toLowerCase().includes(patientSearch.trim().toLowerCase())).map(
                          (name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => {
                                setPatientFilter(patientFilter === name ? '' : name);
                                setPatientOpen(false);
                                setPatientSearch('');
                              }}
                              className={cn(
                                'w-full flex items-center justify-between px-3.5 py-2.5 text-[12.5px] font-medium transition-colors text-left',
                                patientFilter === name
                                  ? 'bg-primary/5 text-primary'
                                  : 'text-foreground hover:bg-slate-50'
                              )}
                            >
                              <span className="truncate">{name}</span>
                              {patientFilter === name && <Check size={12} className="text-primary shrink-0 ml-2" />}
                            </button>
                          )
                        )
                      )}
                    </div>
                    {patientFilter && (
                      <>
                        <div className="border-t border-slate-100" />
                        <button
                          type="button"
                          onClick={() => {
                            setPatientFilter('');
                            setPatientOpen(false);
                            setPatientSearch('');
                          }}
                          className="w-full px-3.5 py-2.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors text-left"
                        >
                          Clear filter
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* PCP filter */}
              <div ref={pcpRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setPcpOpen((o) => {
                      if (o) setPcpSearch('');
                      return !o;
                    });
                    setMonthOpen(false);
                    setPatientOpen(false);
                    setFilterOpen(false);
                  }}
                  className={cn(
                    'h-9 px-3.5 flex items-center gap-2 rounded-lg border text-sm font-medium transition-colors',
                    pcpFilter
                      ? 'border-primary/40 bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-foreground hover:bg-slate-50'
                  )}
                >
                  <Filter size={13} />
                  {pcpFilter ? pcpFilter.replace('Dr. ', 'Dr. ') : 'PCP'}
                  <ChevronDown
                    size={13}
                    className={cn('text-muted-foreground transition-transform duration-150', pcpOpen && 'rotate-180')}
                  />
                </button>

                {pcpOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                    <div className="px-3 pt-3 pb-2 border-b border-slate-100">
                      <div className="relative">
                        <Search
                          size={12}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search PCP…"
                          value={pcpSearch}
                          onChange={(e) => setPcpSearch(e.target.value)}
                          className="w-full h-7 pl-7 pr-3 rounded-md border border-input bg-background text-[12px] outline-none focus:border-ring focus:ring-1 focus:ring-ring/40 placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-[252px] py-1">
                      {PCP_NAMES.filter((n) => n.toLowerCase().includes(pcpSearch.trim().toLowerCase())).length ===
                      0 ? (
                        <p className="px-3.5 py-3 text-[12px] text-muted-foreground text-center">No PCPs found</p>
                      ) : (
                        PCP_NAMES.filter((n) => n.toLowerCase().includes(pcpSearch.trim().toLowerCase())).map(
                          (name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => {
                                setPcpFilter(pcpFilter === name ? '' : name);
                                setPcpOpen(false);
                                setPcpSearch('');
                              }}
                              className={cn(
                                'w-full flex items-center justify-between px-3.5 py-2.5 text-[12.5px] font-medium transition-colors text-left',
                                pcpFilter === name ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-slate-50'
                              )}
                            >
                              <span className="truncate">{name}</span>
                              {pcpFilter === name && <Check size={12} className="text-primary shrink-0 ml-2" />}
                            </button>
                          )
                        )
                      )}
                    </div>
                    {pcpFilter && (
                      <>
                        <div className="border-t border-slate-100" />
                        <button
                          type="button"
                          onClick={() => {
                            setPcpFilter('');
                            setPcpOpen(false);
                            setPcpSearch('');
                          }}
                          className="w-full px-3.5 py-2.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors text-left"
                        >
                          Clear filter
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Program filter dropdown — multi-select */}
              <div ref={filterRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setFilterOpen((o) => !o);
                    setMonthOpen(false);
                    setPatientOpen(false);
                    setPcpOpen(false);
                  }}
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
                      filterOpen && 'rotate-180'
                    )}
                  />
                </button>

                {filterOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-48 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="pb-1.5 pt-1.5">
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
            </div>
          </div>

          {/* ── Table ───────────────────────────────────────────────────── */}
          <div className="bg-white border border-slate-200 rounded-[14px] shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-[#FAFAF9] hover:bg-[#FAFAF9] border-b border-slate-200">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground py-3.5 first:pl-5"
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columns.length} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={24} className="text-slate-300" />
                        <p className="text-[13px] text-muted-foreground">No billing records found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0"
                      onClick={() => setSelectedRecord(row.original)}
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

            {/* ── Pagination ──────────────────────────────────────────── */}
            {total > 0 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                <p className="text-xs text-muted-foreground">
                  Showing{' '}
                  <span className="font-semibold text-foreground">
                    {from}–{to}
                  </span>{' '}
                  of <span className="font-semibold text-foreground">{total}</span> records
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
        </main>
      </div>

      <BillingRecordDialog record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}
