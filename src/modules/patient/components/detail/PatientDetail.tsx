import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  WifiOff,
  Bot,
  Pencil,
  Phone,
  Shield,
  PowerOff,
  Users,
  Activity,
  Stethoscope,
  RefreshCw,
  ArrowRight,
  Download,
  FileText,
  Target,
  UserX,
} from 'lucide-react';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { PatientAlert, PatientDetailData, PatientListItem, CareTeamRole } from '@/modules/patient/@types';
import { toast } from 'sonner';
import {
  PATIENT_BASE_PATH,
  PATIENT_LIST_STORAGE_KEY,
  PATIENT_DETAIL_STORAGE_KEY,
  PATIENT_EDIT_PATH,
} from '@/modules/patient/constants';
import { secureLocalStorage } from '@/utils/secureStorage';
import { VitalsTab } from './tabs/VitalsTab';
import { MedicationTab } from './tabs/MedicationTab';
import { ProgramsDevicesTab } from './tabs/ProgramsDevicesTab';
import { CarePlanTab } from './tabs/CarePlanTab';
import { ActivityLogTab } from './tabs/ActivityLogTab';
import { MessagesTab } from './tabs/MessagesTab';
import { AppointmentsTab } from './tabs/AppointmentsTab';
import { TasksTab } from './tabs/TasksTab';
import { BillingTab } from './tabs/BillingTab';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function formatDateMDY(value: string): string {
  if (!value) return '—';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
  // ISO: YYYY-MM-DD
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[2]}/${iso[3]}/${iso[1]}`;
  // "Mon DD, YYYY" / "Mon D, YYYY" — parse via Date
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    const yyyy = parsed.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }
  return value;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab =
  | 'overview'
  | 'vitals'
  | 'medication'
  | 'programs-devices'
  | 'care-plan'
  | 'activity'
  | 'billing'
  | 'messages'
  | 'appointments'
  | 'tasks';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Patient Overview' },
  { id: 'programs-devices', label: 'Program & Devices' },
  { id: 'care-plan', label: 'Care Plan' },
  { id: 'vitals', label: 'Vitals' },
  { id: 'medication', label: 'Medication' },
  { id: 'messages', label: 'Messages' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'activity', label: 'Activity Log' },
  { id: 'billing', label: 'Billing' },
];

// ─── Demo Alerts (injected for 2nd patient in the list) ──────────────────────

const DEMO_ALERTS: PatientAlert[] = [
  {
    id: 'demo-a1',
    type: 'vitals',
    severity: 'critical',
    title: 'High Blood Pressure Detected',
    description:
      'Systolic reading of 178 mmHg — significantly above the 140 mmHg threshold. Immediate clinical review recommended.',
    timestamp: 'Today, 9:14 AM',
  },
  {
    id: 'demo-a2',
    type: 'device',
    severity: 'warning',
    title: 'Device Offline — BP Cuff',
    description: 'Blood Pressure Cuff has not synced in over 26 hours. Check device power and connectivity.',
    timestamp: 'Yesterday, 7:30 AM',
  },
  {
    id: 'demo-a3',
    type: 'ai',
    severity: 'info',
    title: 'AI Risk Flag — Cardiovascular',
    description:
      'Elevated cardiovascular risk pattern detected over the past 7 days based on vitals trend. Clinical review advised.',
    timestamp: 'Today, 6:00 AM',
  },
];

// ─── Build Detail from Stored PatientListItem ─────────────────────────────────
// Fields collected at enrollment (from PatientListItem) are used directly.
// Clinical/administrative fields not yet collected via a form use placeholder data.

function buildDetailFromStored(item: PatientListItem): PatientDetailData {
  return {
    id: item.id,
    mrn: item.mrn,
    fullName: item.fullName,
    dateOfBirth: item.dateOfBirth,
    gender: item.gender,
    email: item.email,
    phone: item.phone,
    address: '1247 Oak Street, Apt 3B, Chicago, IL 60601, USA',
    pcpName: item.pcpName,
    programs: item.programs,
    insurance: {
      planName: 'BlueCross BlueShield PPO',
      planType: 'PPO',
      memberId: 'BCB-4421-9087',
      groupNumber: 'GRP-20031',
      secondaryInsurance: 'Medicare Part B',
      secondaryMemberId: 'MCR-8811-00214',
    },
    diagnoses: [
      { conditionName: 'Hypertension', icdCode: 'I10', severity: 'Moderate' },
      { conditionName: 'Diabetes', icdCode: 'E11.9', severity: 'Mild' },
      { conditionName: 'Heart Failure', icdCode: 'I50.9', severity: 'Moderate' },
    ],
    emergencyContacts: [{ name: 'Patricia Johnson', phone: '(312) 555-0182', relationship: 'Spouse' }],
    careTeam: [
      { role: 'PCP', name: item.pcpName, email: 'pcp@greenvalley.com' },
      { role: 'Nurse', name: 'Maria Chen', email: 'm.chen@greenvalley.com' },
      { role: 'DHN', name: 'Ethan Brooks', email: 'e.brooks@greenvalley.com' },
    ],
    alerts: [],
  };
}

// ─── Alert Card ───────────────────────────────────────────────────────────────

const ALERT_CONFIG = {
  vitals: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    titleClass: 'text-rose-800',
    bodyClass: 'text-rose-700',
    timeClass: 'text-rose-500',
    iconBg: 'bg-rose-100',
    Icon: AlertTriangle,
    iconClass: 'text-rose-500',
  },
  device: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    titleClass: 'text-amber-800',
    bodyClass: 'text-amber-700',
    timeClass: 'text-amber-500',
    iconBg: 'bg-amber-100',
    Icon: WifiOff,
    iconClass: 'text-amber-500',
  },
  ai: {
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    titleClass: 'text-violet-800',
    bodyClass: 'text-violet-700',
    timeClass: 'text-violet-500',
    iconBg: 'bg-violet-100',
    Icon: Bot,
    iconClass: 'text-violet-500',
  },
} as const;

function AlertCard({ alert }: { alert: PatientAlert }): React.JSX.Element {
  const cfg = ALERT_CONFIG[alert.type];
  const { Icon } = cfg;
  return (
    <div className={cn('rounded-xl border p-4', cfg.bg, cfg.border)}>
      <div className="flex items-start gap-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', cfg.iconBg)}>
          <Icon size={14} className={cfg.iconClass} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-[12.5px] font-bold mb-1', cfg.titleClass)}>{alert.title}</p>
          <p className={cn('text-[11.5px] leading-relaxed', cfg.bodyClass)}>{alert.description}</p>
          <p className={cn('text-[10.5px] mt-2 font-medium', cfg.timeClass)}>{alert.timestamp}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, value, phi }: { label: string; value: string; phi?: boolean }): React.JSX.Element {
  return (
    <div>
      <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em] mb-1">{label}</p>
      <p className="text-[13.5px] text-foreground font-medium" {...(phi ? { 'data-phi': 'true' } : {})}>
        {value || '—'}
      </p>
    </div>
  );
}

// ─── Severity Badge ───────────────────────────────────────────────────────────

const SEVERITY_CLASS: Record<string, string> = {
  Mild: 'bg-teal-50 text-teal-700 border-teal-100',
  Moderate: 'bg-amber-50 text-amber-700 border-amber-100',
  Severe: 'bg-rose-50 text-rose-700 border-rose-100',
};

// ─── Coming Soon Tab ──────────────────────────────────────────────────────────

function ComingSoonTab({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Activity size={22} className="text-muted-foreground" />
      </div>
      <p className="text-[13.5px] font-semibold text-foreground mb-1">{label}</p>
      <p className="text-sm text-muted-foreground">This section is coming soon.</p>
    </div>
  );
}

// ─── Care Team Role Label ─────────────────────────────────────────────────────

const ROLE_LABEL: Record<CareTeamRole, string> = {
  PCP: 'Primary Care Physician',
  Nurse: 'Registered Nurse',
  DHN: 'Digital Health Navigator',
};

// ─── Report Data ─────────────────────────────────────────────────────────────

interface ReportMedication {
  drugName: string;
  dosage: string;
  frequency: string;
  condition: string;
  prescribedBy: string;
  source: string;
}

const REPORT_MEDICATIONS: ReportMedication[] = [
  {
    drugName: 'Metformin',
    dosage: '500 mg',
    frequency: 'Twice Daily',
    condition: 'Diabetes',
    prescribedBy: 'Dr. Michael Torres',
    source: 'EHR Imported',
  },
  {
    drugName: 'Empagliflozin',
    dosage: '10 mg',
    frequency: 'Once Daily',
    condition: 'Diabetes',
    prescribedBy: 'Dr. Michael Torres',
    source: 'Provider Added',
  },
  {
    drugName: 'Lisinopril',
    dosage: '10 mg',
    frequency: 'Once Daily',
    condition: 'Hypertension',
    prescribedBy: 'Dr. Michael Torres',
    source: 'EHR Imported',
  },
  {
    drugName: 'Atorvastatin',
    dosage: '20 mg',
    frequency: 'Once Daily',
    condition: 'Hypertension',
    prescribedBy: 'Dr. Sarah Kim',
    source: 'Provider Added',
  },
  {
    drugName: 'Carvedilol',
    dosage: '25 mg',
    frequency: 'Twice Daily',
    condition: 'Heart Failure',
    prescribedBy: 'Dr. Sarah Kim',
    source: 'EHR Imported',
  },
  {
    drugName: 'Vitamin D3',
    dosage: '2000 IU',
    frequency: 'Once Daily',
    condition: 'Other',
    prescribedBy: '—',
    source: 'Patient Added',
  },
  {
    drugName: 'Psyllium Husk',
    dosage: '5 g',
    frequency: 'Once Daily',
    condition: 'Other',
    prescribedBy: '—',
    source: 'Patient Added',
  },
  {
    drugName: 'Fish Oil',
    dosage: '1000 mg',
    frequency: 'Once Daily',
    condition: 'Other',
    prescribedBy: '—',
    source: 'Patient Added',
  },
];

const REPORT_GOALS = [
  {
    name: 'Blood Pressure Control',
    metric: 'Systolic / Diastolic',
    current: '138/88 mmHg',
    target: '<130/80 mmHg',
    progress: 68,
  },
  { name: 'A1c Reduction', metric: 'HbA1c', current: '7.8%', target: '<7.0%', progress: 55 },
  { name: 'Weight Management', metric: 'Body Weight', current: '182 lbs', target: '170 lbs', progress: 40 },
  {
    name: 'Fluid Retention Monitoring',
    metric: 'Daily Weight Check',
    current: 'On Track',
    target: '<2 lb/day swing',
    progress: 80,
  },
];

// ─── Report Helper Components ─────────────────────────────────────────────────

function ReportSection({
  title,
  number,
  children,
}: {
  title: string;
  number: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[9px] font-bold shrink-0">
          {number}
        </span>
        <h3 className="text-[13px] font-bold text-foreground tracking-tight">{title}</h3>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      {children}
    </div>
  );
}

function ReportField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={className}>
      <p className="text-[9.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[12.5px] font-medium text-foreground">{value || '—'}</p>
    </div>
  );
}

// ─── Patient Report Preview Dialog ───────────────────────────────────────────

function PatientReportPreview({
  patient,
  open,
  onClose,
}: {
  patient: PatientDetailData;
  open: boolean;
  onClose: () => void;
}): React.JSX.Element {
  const now = new Date();
  const reportDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const generatedAt = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[1140px] w-[92vw] p-0 overflow-hidden rounded-2xl gap-0 flex flex-col max-h-[92vh]"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText size={15} className="text-primary" />
            </div>
            <div>
              <p className="text-[13.5px] font-bold text-foreground">Patient Health Summary</p>
              <p className="text-[11px] text-muted-foreground">
                {patient.fullName} · {patient.mrn}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground">Generated: {reportDate}</span>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold hover:bg-primary/90 transition-colors"
            >
              <Download size={13} />
              Download PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-200 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable document area */}
        <div className="flex-1 overflow-y-auto bg-slate-100 px-8 py-7">
          {/* Paper */}
          <div className="bg-white mx-auto w-full max-w-[1020px] rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Document header */}
            <div className="bg-primary px-10 py-7 text-primary-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[20px] font-bold tracking-tight leading-tight">Health Telematix</p>
                  <p className="text-[11px] text-primary-foreground/70 mt-0.5">Remote Patient Monitoring Platform</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-primary-foreground/70 uppercase tracking-wider font-semibold">
                    Patient Health Summary
                  </p>
                  <p className="text-[13px] font-semibold mt-1">{reportDate}</p>
                </div>
              </div>
            </div>

            {/* Document body */}
            <div className="px-10 py-10 space-y-10">
              {/* 01 — Demographics */}
              <ReportSection title="Patient Demographics" number="01">
                <div className="grid grid-cols-3 gap-x-10 gap-y-6">
                  <ReportField label="Full Name" value={patient.fullName} />
                  <ReportField label="Date of Birth" value={formatDateMDY(patient.dateOfBirth)} />
                  <ReportField label="Gender" value={patient.gender} />
                  <ReportField label="MRN Number" value={patient.mrn} />
                  <ReportField label="Phone Number" value={patient.phone} />
                  <ReportField label="Email Address" value={patient.email} />
                  <ReportField label="Primary Care Physician" value={patient.pcpName} />
                  <ReportField label="Address" value={patient.address} className="col-span-2" />
                </div>
              </ReportSection>

              {/* 02 — Insurance */}
              <ReportSection title="Insurance Information" number="02">
                <div className="grid grid-cols-3 gap-x-10 gap-y-6">
                  <ReportField label="Primary Insurance" value={patient.insurance.planName} />
                  <ReportField label="Plan Type" value={patient.insurance.planType} />
                  <ReportField label="Member ID" value={patient.insurance.memberId} />
                  <ReportField label="Group Number" value={patient.insurance.groupNumber} />
                  {patient.insurance.secondaryInsurance && (
                    <>
                      <ReportField label="Secondary Insurance" value={patient.insurance.secondaryInsurance} />
                      <ReportField label="Secondary Member ID" value={patient.insurance.secondaryMemberId ?? '—'} />
                    </>
                  )}
                </div>
              </ReportSection>

              {/* 03 — Diagnoses */}
              <ReportSection title="Diagnoses & Medical Conditions" number="03">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left font-bold text-muted-foreground text-[10px] uppercase tracking-wider pb-3">
                        Condition Name
                      </th>
                      <th className="text-left font-bold text-muted-foreground text-[10px] uppercase tracking-wider pb-3">
                        ICD-10 Code
                      </th>
                      <th className="text-left font-bold text-muted-foreground text-[10px] uppercase tracking-wider pb-3">
                        Severity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patient.diagnoses.map((d) => (
                      <tr key={d.icdCode}>
                        <td className="py-2.5 text-[12.5px] font-semibold text-foreground">{d.conditionName}</td>
                        <td className="py-2.5 text-[12px] font-mono text-muted-foreground">{d.icdCode}</td>
                        <td className="py-2.5">
                          <span
                            className={cn(
                              'inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                              SEVERITY_CLASS[d.severity]
                            )}
                          >
                            {d.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ReportSection>

              {/* 04 — Medications */}
              <ReportSection title="Active Medications" number="04">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left font-bold text-muted-foreground text-[10px] uppercase tracking-wider pb-3 w-[28%]">
                        Medication
                      </th>
                      <th className="text-left font-bold text-muted-foreground text-[10px] uppercase tracking-wider pb-3 w-[12%]">
                        Dosage
                      </th>
                      <th className="text-left font-bold text-muted-foreground text-[10px] uppercase tracking-wider pb-3 w-[16%]">
                        Frequency
                      </th>
                      <th className="text-left font-bold text-muted-foreground text-[10px] uppercase tracking-wider pb-3 w-[18%]">
                        Condition
                      </th>
                      <th className="text-left font-bold text-muted-foreground text-[10px] uppercase tracking-wider pb-3">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {REPORT_MEDICATIONS.map((m) => (
                      <tr key={m.drugName}>
                        <td className="py-3">
                          <p className="text-[12.5px] font-semibold text-foreground">{m.drugName}</p>
                          {m.prescribedBy !== '—' && (
                            <p className="text-[10.5px] text-muted-foreground mt-0.5">{m.prescribedBy}</p>
                          )}
                        </td>
                        <td className="py-3 text-[12px] text-muted-foreground">{m.dosage}</td>
                        <td className="py-3 text-[12px] text-muted-foreground">{m.frequency}</td>
                        <td className="py-3 text-[12px] text-muted-foreground">{m.condition}</td>
                        <td className="py-3">
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                            {m.source}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ReportSection>

              {/* 05 — Care Plan */}

              <ReportSection title="Care Plan Summary" number="05">
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-4">
                    <p className="text-[13px] font-bold text-foreground">Chronic Disease Management Care Plan</p>
                    <p className="text-[11.5px] text-muted-foreground mt-1 leading-relaxed">
                      A comprehensive care plan addressing Hypertension, Type 2 Diabetes, and Heart Failure through
                      remote patient monitoring, medication adherence, and lifestyle interventions.
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
                      <ReportField label="Plan Period" value="Jan 10, 2024 – Jan 10, 2025" />
                      <ReportField label="Touchpoint Frequency" value="Bi-weekly" />
                      <ReportField label="Plan Template" value="Comprehensive" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Target size={11} />
                      Active Goals
                    </p>
                    {REPORT_GOALS.map((g) => (
                      <div
                        key={g.name}
                        className="flex items-center gap-4 px-4 py-3 rounded-lg border border-slate-100 bg-white"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-semibold text-foreground">{g.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {g.metric}: <span className="font-medium text-foreground">{g.current}</span>
                            <span className="text-slate-300 mx-1">→</span>
                            Target: <span className="font-medium text-foreground">{g.target}</span>
                          </p>
                        </div>
                        <div className="shrink-0 w-28 text-right">
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-1">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${g.progress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium">{g.progress}% complete</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ReportSection>

              {/* 06 — Assigned Care Team */}
              <ReportSection title="Assigned Care Team" number="06">
                <div className="grid grid-cols-3 gap-4">
                  {patient.careTeam.map((member) => {
                    const roleColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
                      PCP: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', dot: 'bg-blue-400' },
                      Nurse: { bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-700', dot: 'bg-teal-400' },
                      DHN: {
                        bg: 'bg-violet-50',
                        border: 'border-violet-100',
                        text: 'text-violet-700',
                        dot: 'bg-violet-400',
                      },
                    };
                    const colors = roleColors[member.role] ?? roleColors.DHN;
                    const roleFullLabel: Record<string, string> = {
                      PCP: 'Primary Care Physician',
                      Nurse: 'Registered Nurse',
                      DHN: 'Digital Health Navigator',
                    };
                    return (
                      <div key={member.role} className={`rounded-xl border px-4 py-4 ${colors.bg} ${colors.border}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.text}`}>
                            {roleFullLabel[member.role] ?? member.role}
                          </span>
                        </div>
                        <p className="text-[13px] font-bold text-foreground leading-snug">{member.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 break-all">{member.email}</p>
                      </div>
                    );
                  })}
                </div>
              </ReportSection>
            </div>

            {/* Document footer */}
            <div className="px-10 py-6 bg-slate-50 border-t border-slate-200">
              <div className="flex items-start justify-between gap-6">
                <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[480px]">
                  <span className="font-bold text-foreground">CONFIDENTIALITY NOTICE:</span> This document contains
                  protected health information (PHI) covered under HIPAA. It is intended solely for the authorized
                  recipient. Unauthorized disclosure, copying, or distribution is strictly prohibited. If received in
                  error, please notify Health Telematix immediately.
                </p>
                <div className="text-right shrink-0">
                  <p className="text-[10.5px] font-semibold text-foreground">Health Telematix Platform</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {reportDate} at {generatedAt}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Green Valley Medical Clinic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ patient }: { patient: PatientDetailData }): React.JSX.Element {
  // Backward-compat: old stored data may have singular emergencyContact
  const contacts: typeof patient.emergencyContacts =
    patient.emergencyContacts?.length > 0
      ? patient.emergencyContacts
      : (patient as unknown as { emergencyContact?: { name: string; phone: string; relationship: string } })
            .emergencyContact?.name
        ? [
            (patient as unknown as { emergencyContact: { name: string; phone: string; relationship: string } })
              .emergencyContact,
          ]
        : [];

  return (
    <div className="space-y-4">
      {/* ── Row 1: Patient Details | Insurance Details ────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Patient Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users size={14} className="text-primary" />
            </div>
            <h3 className="text-[12.5px] font-bold text-foreground">Patient Details</h3>
          </div>
          <div className="px-5 py-5 grid grid-cols-2 gap-x-8 gap-y-5">
            <Field label="Full Name" value={patient.fullName} phi />
            <Field label="MRN Number" value={patient.mrn} phi />
            <Field label="Date of Birth" value={formatDateMDY(patient.dateOfBirth)} phi />
            <Field label="Gender" value={patient.gender} />
            <Field label="Email Address" value={patient.email} phi />
            <Field label="Phone Number" value={patient.phone} phi />
            <Field label="Primary Care Physician" value={patient.pcpName} />
            <Field label="Address" value={patient.address} phi />
          </div>
        </div>

        {/* Insurance Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Shield size={14} className="text-primary" />
            </div>
            <h3 className="text-[12.5px] font-bold text-foreground">Insurance Details</h3>
          </div>
          <div className="px-5 py-5 grid grid-cols-2 gap-x-8 gap-y-5">
            <Field label="Insurance Plan Name" value={patient.insurance.planName} />
            <Field label="Plan Type" value={patient.insurance.planType} />
            <Field label="Member ID" value={patient.insurance.memberId} phi />
            <Field label="Group Number" value={patient.insurance.groupNumber} phi />
            {patient.insurance.secondaryInsurance ? (
              <>
                <Field label="Secondary Insurance" value={patient.insurance.secondaryInsurance} />
                <Field label="Secondary Member ID" value={patient.insurance.secondaryMemberId ?? '—'} phi />
              </>
            ) : (
              <div className="col-span-2 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <Shield size={12} className="text-muted-foreground shrink-0" />
                <p className="text-[12px] text-muted-foreground">No secondary insurance on file</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 2: Diagnoses & Medical Conditions ─────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Stethoscope size={14} className="text-primary" />
          </div>
          <h3 className="text-[12.5px] font-bold text-foreground">Diagnoses & Medical Conditions</h3>
          {patient.diagnoses.length > 0 && (
            <span className="ml-auto text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15">
              {patient.diagnoses.length} condition{patient.diagnoses.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {/* Column headers */}
        <div className="px-5 pt-3.5 pb-2">
          <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground border-b border-slate-100 pb-2">
            <span className="col-span-5">Condition Name</span>
            <span className="col-span-3">ICD-10 Code</span>
            <span className="col-span-2">Severity</span>
          </div>
        </div>
        <div className="divide-y divide-slate-50 px-2 pb-2">
          {patient.diagnoses.length === 0 ? (
            <p className="px-3 py-5 text-[13px] text-muted-foreground text-center">No diagnoses recorded yet.</p>
          ) : (
            patient.diagnoses.map((d, idx) => (
              <div
                key={d.icdCode}
                className="grid grid-cols-12 items-center px-3 py-3 rounded-xl hover:bg-slate-50/70 transition-colors group"
              >
                <div className="col-span-5 flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-muted-foreground">
                    {idx + 1}
                  </div>
                  <p className="text-[13px] font-semibold text-foreground leading-snug">{d.conditionName}</p>
                </div>
                <div className="col-span-3">
                  <span className="text-[12px] font-mono text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-md">
                    {d.icdCode}
                  </span>
                </div>
                <div className="col-span-2">
                  <span
                    className={cn(
                      'inline-flex text-[10.5px] font-semibold px-2.5 py-1 rounded-full border',
                      SEVERITY_CLASS[d.severity]
                    )}
                  >
                    {d.severity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Row 3: Emergency Contacts | Assigned Care Team ────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Emergency Contacts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Phone size={14} className="text-primary" />
            </div>
            <h3 className="text-[12.5px] font-bold text-foreground">Emergency Contacts</h3>
          </div>
          {contacts.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-muted-foreground">No emergency contacts recorded.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {contacts.map((contact, idx) => (
                <div key={idx} className="px-5 py-4">
                  {contacts.length > 1 && (
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.06em] mb-3">
                      {idx === 0 ? 'Primary Contact' : `Contact ${idx + 1}`}
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-x-5 gap-y-4">
                    <Field label="Contact Name" value={contact.name} />
                    <Field label="Phone Number" value={contact.phone} phi />
                    <Field label="Relationship" value={contact.relationship} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Care Team */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users size={14} className="text-primary" />
            </div>
            <h3 className="text-[12.5px] font-bold text-foreground">Assigned Care Team</h3>
          </div>
          <div className="px-5 py-4 space-y-2.5">
            {patient.careTeam.map((member) => (
              <div
                key={member.role}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200 transition-colors"
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border',
                    getAvatarColor(member.name),
                    'border-current/20'
                  )}
                >
                  {getInitials(member.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground truncate">{member.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{ROLE_LABEL[member.role]}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15 shrink-0">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sync Result ─────────────────────────────────────────────────────────────

interface SyncChange {
  section: string;
  field: string;
  from: string;
  to: string;
}

const SYNC_CHANGES: SyncChange[] = [
  { section: 'Demographics', field: 'Phone Number', from: '(312) 555-0182', to: '(312) 555-0199' },
  { section: 'Demographics', field: 'Address', from: '1247 Oak Street, Apt 3B', to: '892 Maple Ave, Suite 5A' },
  { section: 'Vitals', field: 'Blood Pressure', from: '128/82 mmHg', to: '132/86 mmHg' },
  { section: 'Vitals', field: 'Body Weight', from: '184 lbs', to: '182 lbs' },
];

function SyncResultDialog({
  open,
  onClose,
  syncTime,
}: {
  open: boolean;
  onClose: () => void;
  syncTime: string;
}): React.JSX.Element {
  const sections = [...new Set(SYNC_CHANGES.map((c) => c.section))];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-2xl gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-slate-100">
          <DialogTitle className="text-[16px] font-bold text-foreground leading-tight">
            EHR Refresh Complete
          </DialogTitle>
          <p className="text-[12.5px] text-muted-foreground mt-1">
            The following patient fields have been updated from Epic EHR.
          </p>
          {syncTime && (
            <p className="text-[11px] text-muted-foreground mt-3">
              Last synced at <span className="font-medium text-foreground">{syncTime}</span>
            </p>
          )}
          <span className="inline-flex mt-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {SYNC_CHANGES.length} fields updated
          </span>
        </div>

        {/* Changes list */}
        <div className="px-8 py-6 space-y-6 max-h-[360px] overflow-y-auto">
          {sections.map((section) => (
            <div key={section}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-3">{section}</p>
              <div className="space-y-3">
                {SYNC_CHANGES.filter((c) => c.section === section).map((change) => (
                  <div key={change.field} className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3.5">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-2">{change.field}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[12.5px] text-muted-foreground line-through decoration-slate-300">
                        {change.from}
                      </span>
                      <ArrowRight size={13} className="text-slate-300 shrink-0" />
                      <span className="text-[12.5px] font-semibold text-emerald-700">{change.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100">
          <Button className="w-full h-9 text-[13px] font-semibold" onClick={onClose}>
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign Physician Dialog ──────────────────────────────────────────────────

interface ClinicPhysician {
  id: string;
  name: string;
  specialty: string;
  assignedPatients: number;
}

const CLINIC_PHYSICIANS: ClinicPhysician[] = [
  { id: 'phy-1', name: 'Dr. James Harrington', specialty: 'Internal Medicine', assignedPatients: 34 },
  { id: 'phy-2', name: 'Dr. Priya Nair', specialty: 'Family Medicine', assignedPatients: 28 },
  { id: 'phy-3', name: 'Dr. Marcus Webb', specialty: 'Cardiology', assignedPatients: 21 },
  { id: 'phy-4', name: 'Dr. Sophia Liu', specialty: 'Endocrinology', assignedPatients: 19 },
  { id: 'phy-5', name: 'Dr. Daniel Osei', specialty: 'Geriatrics', assignedPatients: 15 },
  { id: 'phy-6', name: 'Dr. Elena Vasquez', specialty: 'Internal Medicine', assignedPatients: 11 },
];

function AssignPhysicianDialog({
  open,
  onClose,
  patientName,
}: {
  open: boolean;
  onClose: () => void;
  patientName: string;
}): React.JSX.Element {
  const [selected, setSelected] = React.useState<string | null>(null);

  function handleAssign(): void {
    if (!selected) return;
    const physician = CLINIC_PHYSICIANS.find((p) => p.id === selected);
    toast.success(`${physician?.name ?? 'Physician'} assigned to ${patientName}`);
    setSelected(null);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setSelected(null);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 gap-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <Stethoscope size={16} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-[14px] font-bold text-foreground">Assign Physician</DialogTitle>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                Select a physician from this clinic to assign to{' '}
                <span className="font-semibold text-foreground">{patientName}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Physician list */}
        <div className="overflow-y-auto max-h-[360px] divide-y divide-slate-50 px-2 py-2">
          {CLINIC_PHYSICIANS.map((phy) => {
            const initials = phy.name
              .replace(/^Dr\.\s*/, '')
              .split(' ')
              .slice(0, 2)
              .map((n) => n[0])
              .join('')
              .toUpperCase();
            const avatarColor = getAvatarColor(phy.name);
            const isSelected = selected === phy.id;

            return (
              <button
                key={phy.id}
                type="button"
                onClick={() => setSelected(phy.id)}
                className={cn(
                  'w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-left transition-colors',
                  isSelected ? 'bg-primary/8 border border-primary/20' : 'hover:bg-slate-50 border border-transparent'
                )}
              >
                {/* Radio indicator */}
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                    isSelected ? 'border-primary' : 'border-slate-300'
                  )}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>

                {/* Avatar */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0',
                    avatarColor
                  )}
                >
                  {initials}
                </div>

                {/* Name + specialty */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-[13px] font-semibold leading-snug',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {phy.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{phy.specialty}</p>
                </div>

                {/* Patient count badge */}
                <div className="shrink-0 text-right">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border',
                      isSelected
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    )}
                  >
                    <Users size={10} />
                    {phy.assignedPatients} patients
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-4 text-[12px]"
            onClick={() => {
              setSelected(null);
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button size="sm" className="h-8 px-4 text-[12px] font-semibold" disabled={!selected} onClick={handleAssign}>
            Assign Physician
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PatientDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showAssignPhysician, setShowAssignPhysician] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncResult, setShowSyncResult] = useState(false);
  const [syncTime, setSyncTime] = useState('');

  // Load full detail (written at enrollment) first; fall back to list-item summary
  const allDetail =
    secureLocalStorage.getItemObject<Record<string, PatientDetailData>>(PATIENT_DETAIL_STORAGE_KEY) ?? {};
  const allPatients = secureLocalStorage.getItemObject<PatientListItem[]>(PATIENT_LIST_STORAGE_KEY) ?? [];
  const found = allPatients.find((p) => p.id === id);
  const patientRaw: PatientDetailData | null = allDetail[id!] ?? (found ? buildDetailFromStored(found) : null);

  // Demo: inject mock alerts for the 2nd patient in the stored list (index 1)
  const patientIndex = allPatients.findIndex((p) => p.id === id);
  const patient: PatientDetailData | null = patientRaw
    ? {
        ...patientRaw,
        alerts: patientRaw.alerts.length > 0 ? patientRaw.alerts : patientIndex === 1 ? DEMO_ALERTS : [],
      }
    : null;

  // Not-found guard
  if (!patient) {
    return (
      <div className="min-h-screen flex bg-[#FAFAF9]">
        <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />
        <div
          className={cn(
            'flex-1 flex flex-col items-center justify-center gap-3 transition-[margin-left] duration-[220ms] ease-in-out',
            navCollapsed ? 'ml-[60px]' : 'ml-60'
          )}
        >
          <p className="text-sm font-medium text-muted-foreground">Patient not found.</p>
          <Button variant="outline" size="sm" onClick={() => navigate(PATIENT_BASE_PATH)}>
            Back to Patient List
          </Button>
        </div>
      </div>
    );
  }

  function handleSync(): void {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      setSyncTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
      setShowSyncResult(true);
    }, 2000);
  }

  return (
    <div className="min-h-screen flex bg-[#FAFAF9]">
      <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[margin-left] duration-[220ms] ease-in-out',
          navCollapsed ? 'ml-[60px]' : 'ml-60'
        )}
      >
        <TopBar title="Patient Management" subtitle="Patient Details" />

        <main className="flex-1 p-7 flex flex-col gap-5">
          {/* Back link */}
          <button
            type="button"
            onClick={() => navigate(`${PATIENT_BASE_PATH}?tab=${found?.status ?? 'Active'}`)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft size={14} />
            Back to Patient List
          </button>

          {/* ── Alerts & Flags — always visible, prominent ─────────────── */}
          {patient.alerts.length > 0 && (
            <div className="rounded-[14px] border-2 border-rose-200 bg-white shadow-xs overflow-hidden">
              {/* Header strip */}
              <div className="flex items-center gap-3 px-5 py-3 bg-rose-50 border-b border-rose-100">
                <div className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center shrink-0">
                  <AlertTriangle size={14} className="text-white" />
                </div>
                <span className="text-[13px] font-bold text-rose-800 tracking-tight">Alerts & Flags</span>
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none">
                  {patient.alerts.length}
                </span>
              </div>
              {/* Alert cards — always expanded */}
              <div className="p-4 grid grid-cols-3 gap-3">
                {patient.alerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* ── Unassigned Physician Notice (demo: shown for non-first patients) ── */}
          {patientIndex !== 0 && (
            <div className="rounded-[14px] border border-amber-400 bg-amber-50/60 px-5 py-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <UserX size={16} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-amber-800 leading-snug">
                  {patient.fullName} is Currently Unassigned
                </p>
                <p className="text-[12px] text-amber-700/80 mt-1 leading-relaxed">
                  This patient does not have a Primary Care Physician assigned. Their previously assigned physician is
                  no longer active in this clinic. Please assign a physician to restore care continuity.
                </p>
              </div>
              <Button
                size="sm"
                className="h-8 px-4 text-[12px] font-semibold shrink-0 mt-0.5"
                onClick={() => setShowAssignPhysician(true)}
              >
                Assign Physician
              </Button>
            </div>
          )}

          {/* Patient header card */}
          <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs px-5 py-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0',
                  getAvatarColor(patient.fullName)
                )}
              >
                {getInitials(patient.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-[16px] font-bold text-foreground tracking-tight leading-snug mb-1">
                  {patient.fullName}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] text-muted-foreground" data-phi="true">
                    {patient.mrn}
                  </span>
                  <span className="text-slate-300 text-[11px]">·</span>
                  <span className="text-[12px] text-muted-foreground" data-phi="true">
                    {formatDateMDY(patient.dateOfBirth)}
                  </span>
                  <span className="text-slate-300 text-[11px]">·</span>
                  <span className="text-[12px] text-muted-foreground">{patient.gender}</span>
                  {patient.programs.length > 0 && (
                    <>
                      <span className="text-slate-300 text-[11px]">·</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {patient.programs.includes('APCM') && (
                          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                            APCM
                          </span>
                        )}
                        {patient.programs.includes('RPM') && (
                          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            RPM
                          </span>
                        )}
                        {patient.programs.includes('BHI') && (
                          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                            BHI
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* Outlined action CTAs */}
              <div className="flex items-center gap-2 shrink-0 pl-4 self-stretch my-[-2px]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      Last Refresh On: <span className="font-medium text-foreground">Today, 9:14 AM</span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3.5 gap-1.5 text-[12px] font-medium inline-flex items-center"
                      onClick={handleSync}
                      disabled={isSyncing}
                    >
                      <RefreshCw size={13} className={cn('shrink-0', isSyncing && 'animate-spin')} />
                      {isSyncing ? 'Syncing…' : 'Refresh data from EHR'}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3.5 gap-1.5 text-[12px] font-medium inline-flex items-center"
                    onClick={() => navigate(PATIENT_EDIT_PATH.replace(':id', patient.id))}
                  >
                    <Pencil size={13} className="shrink-0" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3.5 gap-1.5 text-[12px] font-medium inline-flex items-center"
                    onClick={() => setShowReport(true)}
                  >
                    <Download size={13} className="shrink-0" />
                    Download Report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3.5 gap-1.5 text-[12px] font-medium inline-flex items-center text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400"
                    onClick={() => setShowDeactivateConfirm(true)}
                  >
                    <PowerOff size={13} className="shrink-0" />
                    Disenroll
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Line tabs */}
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

          {/* Tab content */}
          <div className="pt-1">
            {activeTab === 'overview' && <OverviewTab patient={patient} />}
            {activeTab === 'vitals' && (
              <VitalsTab devices={['Blood Pressure Cuff', 'CGM (Dexcom / FreeStyle Libre)', 'Weight Scale']} />
            )}
            {activeTab === 'medication' && <MedicationTab />}
            {activeTab === 'programs-devices' && <ProgramsDevicesTab programs={patient.programs} />}
            {activeTab === 'care-plan' && <CarePlanTab />}
            {activeTab === 'activity' && <ActivityLogTab />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'appointments' && <AppointmentsTab />}
            {activeTab === 'tasks' && <TasksTab />}
            {activeTab === 'billing' && <BillingTab patient={patient ?? undefined} />}
            {activeTab !== 'overview' &&
              activeTab !== 'vitals' &&
              activeTab !== 'medication' &&
              activeTab !== 'programs-devices' &&
              activeTab !== 'care-plan' &&
              activeTab !== 'activity' &&
              activeTab !== 'messages' &&
              activeTab !== 'appointments' &&
              activeTab !== 'tasks' &&
              activeTab !== 'billing' && <ComingSoonTab label={TABS.find((t) => t.id === activeTab)?.label ?? ''} />}
          </div>
        </main>
      </div>

      {/* Sync Result Dialog */}
      <SyncResultDialog open={showSyncResult} onClose={() => setShowSyncResult(false)} syncTime={syncTime} />

      {/* Patient Report Preview */}
      <PatientReportPreview patient={patient} open={showReport} onClose={() => setShowReport(false)} />

      {/* Assign Physician Dialog */}
      <AssignPhysicianDialog
        open={showAssignPhysician}
        onClose={() => setShowAssignPhysician(false)}
        patientName={patient.fullName}
      />

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={showDeactivateConfirm} onOpenChange={setShowDeactivateConfirm}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex flex-col items-center text-center gap-3 mb-1">
              <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <PowerOff size={22} className="text-amber-500" />
              </div>
              <DialogTitle className="text-[16px] font-bold">Disenroll Patient</DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-[13.5px] text-muted-foreground leading-relaxed text-center">
            Are you sure you want to disenroll{' '}
            <span className="font-semibold text-foreground" data-phi="true">
              {patient.fullName}
            </span>
            ? The patient will be moved to the Deactivated tab and will no longer appear in active lists.
          </p>
          <DialogFooter className="mt-2 gap-2 sm:justify-end">
            <Button variant="outline" size="sm" className="h-9 px-6" onClick={() => setShowDeactivateConfirm(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-9 px-6 bg-amber-500 text-white hover:bg-amber-600"
              onClick={() => {
                const list = secureLocalStorage.getItemObject<PatientListItem[]>(PATIENT_LIST_STORAGE_KEY) ?? [];
                secureLocalStorage.setItemObject(
                  PATIENT_LIST_STORAGE_KEY,
                  list.map((p) =>
                    p.id === patient.id
                      ? {
                          ...p,
                          status: 'Deactivated' as const,
                          deactivatedOn: new Date().toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                          }),
                        }
                      : p
                  )
                );
                setShowDeactivateConfirm(false);
                toast.success('Patient disenrolled successfully.');
                navigate(`${PATIENT_BASE_PATH}?tab=Deactivated`);
              }}
            >
              Disenroll Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
