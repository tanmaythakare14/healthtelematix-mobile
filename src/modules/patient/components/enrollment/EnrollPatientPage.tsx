import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ClipboardList,
  Eraser,
  Info,
  Pencil,
  Plus,
  User,
  ShieldCheck,
  Phone,
  Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';
import { secureLocalStorage } from '@/utils/secureStorage';
import type {
  EnrollmentStep1Values,
  EnrollmentStep2Values,
  EmergencyContactStepValues,
  EnrollmentStep3Values,
  MedicalConditionStepValues,
  PatientListItem,
  PatientDetailData,
  ProgramType,
  CareTeamRole,
  DiagnosisFormItem,
  DiagnosisSeverity,
} from '../../@types';
import { PATIENT_BASE_PATH, PATIENT_LIST_STORAGE_KEY, PATIENT_DETAIL_STORAGE_KEY } from '../../constants';
import { USER_LIST_STORAGE_KEY } from '@/modules/user-management/constants';
import type { UserListItem } from '@/modules/user-management/@types';
import { DemographicsStep } from './steps/DemographicsStep';
import { InsuranceStep } from './steps/InsuranceStep';
import { EmergencyContactStep } from './steps/EmergencyContactStep';
import { MedicalConditionStep, DiagnosisDialog } from './steps/MedicalConditionStep';
import { CareTeamStep } from './steps/CareTeamStep';
import { StaffSelect } from './StaffSelect';
import { Checkbox } from '@/components/ui/checkbox';
import type { EHRPrefillData } from './EHRSelector';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateOfBirth(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const r = () => chars[Math.floor(Math.random() * chars.length)];
  return `INV-${r()}${r()}${r()}${r()}-${r()}${r()}${r()}${r()}`;
}

function formatDobView(isoDate?: string): string {
  if (!isoDate) return '—';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

function formatAddressView(data: Partial<EnrollmentStep1Values>): string {
  return (
    [data.addressLine1, data.addressLine2, data.city, data.state, data.zipCode, data.country]
      .filter(Boolean)
      .join(', ') || '—'
  );
}

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Demographics', description: 'Personal info, contact & address' },
  { label: 'Insurance', description: 'Coverage plan & secondary insurance' },
  { label: 'Emergency Contacts', description: 'Emergency contacts & relationships' },
  { label: 'Medical Condition', description: 'Diagnoses & program enrollment' },
  { label: 'Care Team', description: 'Assign physician, nurse & DHN' },
];

const EHR_STEPS = [
  { label: 'Demographics', description: 'Personal info, contact & address' },
  { label: 'Insurance', description: 'Coverage plan & secondary insurance' },
  { label: 'Emergency Contacts', description: 'Emergency contacts & relationships' },
  { label: 'Medical Conditions', description: 'Diagnoses & program enrollment' },
  { label: 'Care Team', description: 'Assign physician, nurse & DHN' },
];

// ─── Vertical Stepper ────────────────────────────────────────────────────────

function VerticalStepper({
  current,
  steps,
}: {
  current: number;
  steps: { label: string; description: string }[];
}): React.JSX.Element {
  return (
    <nav className="flex flex-col">
      {steps.map((s, idx) => {
        const num = idx + 1;
        const done = num < current;
        const active = num === current;
        const isLast = idx === steps.length - 1;

        return (
          <div key={s.label} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 border-2',
                  done
                    ? 'bg-primary border-primary text-white'
                    : active
                      ? 'bg-primary border-primary text-white shadow-[0_0_0_5px_rgba(15,23,42,0.12)]'
                      : 'bg-white border-slate-200 text-slate-400'
                )}
              >
                {done ? (
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path
                      d="M1.5 5.5L5.5 9.5L12.5 1.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className={cn('text-[13px] font-bold', active ? 'text-white' : 'text-slate-400')}>{num}</span>
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-[2px] flex-1 my-2 rounded-full min-h-[44px] transition-colors duration-300',
                    done ? 'bg-primary' : 'bg-slate-100'
                  )}
                />
              )}
            </div>
            <div className={cn('pb-10', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-[13px] font-bold leading-snug transition-colors duration-200 mt-2',
                  active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {s.label}
              </p>
              <p
                className={cn(
                  'text-[11.5px] leading-relaxed mt-1 transition-colors duration-200',
                  active ? 'text-primary/70' : 'text-muted-foreground/70'
                )}
              >
                {s.description}
              </p>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// ─── Success Dialog ───────────────────────────────────────────────────────────

function SuccessDialog({
  open,
  patientName,
  email,
  inviteCode,
  onDone,
}: {
  open: boolean;
  patientName: string;
  email: string;
  inviteCode: string;
  onDone: () => void;
}): React.JSX.Element | null {
  if (!open) return null;
  void email;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-none" />
      <div className="relative z-10 w-full max-w-[560px] mx-4 rounded-2xl bg-white shadow-xs overflow-hidden">
        <div className="bg-gradient-to-b from-emerald-50/80 to-white pt-10 pb-6 flex flex-col items-center px-6">
          <style>{`
            @keyframes enroll-ring-1 { 0% { transform: scale(0.6); opacity: 0.6; } 100% { transform: scale(1.6); opacity: 0; } }
            @keyframes enroll-ring-2 { 0% { transform: scale(0.6); opacity: 0.4; } 100% { transform: scale(1.9); opacity: 0; } }
            @keyframes enroll-circle-in { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.12); opacity: 1; } 80% { transform: scale(0.96); } 100% { transform: scale(1); opacity: 1; } }
            @keyframes enroll-check { from { stroke-dashoffset: 64; } to { stroke-dashoffset: 0; } }
            @keyframes enroll-sparkle { 0% { opacity: 0; transform: scale(0) rotate(0deg); } 50% { opacity: 1; } 100% { opacity: 0; transform: scale(1.4) rotate(25deg); } }
            .enroll-ring-1 { animation: enroll-ring-1 1.2s cubic-bezier(0,0,0.2,1) 0.15s forwards; }
            .enroll-ring-2 { animation: enroll-ring-2 1.4s cubic-bezier(0,0,0.2,1) 0.05s forwards; }
            .enroll-circle { animation: enroll-circle-in 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
            .enroll-check { stroke-dasharray: 64; stroke-dashoffset: 64; animation: enroll-check 0.45s cubic-bezier(0.65,0,0.35,1) 0.5s forwards; }
            .enroll-sparkle-1 { animation: enroll-sparkle 0.7s ease-out 0.55s both; }
            .enroll-sparkle-2 { animation: enroll-sparkle 0.7s ease-out 0.65s both; }
            .enroll-sparkle-3 { animation: enroll-sparkle 0.7s ease-out 0.60s both; }
            .enroll-sparkle-4 { animation: enroll-sparkle 0.7s ease-out 0.70s both; }
          `}</style>
          <div className="relative flex items-center justify-center w-28 h-28">
            <div className="enroll-ring-2 absolute w-20 h-20 rounded-full bg-emerald-400/20" />
            <div className="enroll-ring-1 absolute w-20 h-20 rounded-full bg-emerald-400/30" />
            <div className="enroll-sparkle-1 absolute top-1 right-3 w-2.5 h-2.5 rounded-full bg-emerald-300" />
            <div className="enroll-sparkle-2 absolute bottom-2 right-1 w-2 h-2 rounded-full bg-teal-400" />
            <div className="enroll-sparkle-3 absolute top-2 left-2 w-2 h-2 rounded-full bg-emerald-400" />
            <div className="enroll-sparkle-4 absolute bottom-1 left-4 w-1.5 h-1.5 rounded-full bg-teal-300" />
            <div className="enroll-circle w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">
              <svg width="34" height="27" viewBox="0 0 34 27" fill="none">
                <path
                  className="enroll-check"
                  d="M3 13.5L12.5 23L31 3"
                  stroke="white"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-[18px] font-bold text-foreground mt-5 text-center">Patient Enrolled Successfully!</h3>
          <p className="text-[13px] text-muted-foreground mt-2 text-center leading-relaxed">
            <span className="font-semibold text-foreground" data-phi="true">
              {patientName}
            </span>{' '}
            has been pre-enrolled.
            <br />
            The patient will remain in the <span className="font-semibold text-foreground">Pending</span> state until
            consent approval is received.
            <br />
            Once the consent is approved, the patient status will automatically move to{' '}
            <span className="font-semibold text-emerald-600">Active</span>.
          </p>
        </div>
        <div className="px-6 pb-6 space-y-3.5">
          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] px-5 py-4 text-center space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
              Patient Invite Code
            </p>
            <p className="text-[24px] font-mono font-bold text-primary tracking-widest">{inviteCode}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Share this code with the patient to join the app.
            </p>
          </div>
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-100">
            <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[12.5px] font-semibold text-amber-800">Consent — Waiting for Patient Approval</p>
              <p className="text-[11.5px] text-amber-700 mt-0.5 leading-relaxed">
                Consent will be recorded once the patient joins the app and accepts the terms of service.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDone}
            className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold shadow-xs hover:[background:linear-gradient(135deg,var(--primary)_0%,var(--primary-teal)_100%)] transition-all duration-200"
          >
            Back to Patients
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Enrollment Demo Guide ────────────────────────────────────────────────────

interface EnrollmentDemoGuideProps {
  demoFilled: boolean;
  onFillSample: () => void;
  onReset: () => void;
}

function EnrollmentDemoGuide({ demoFilled, onFillSample, onReset }: EnrollmentDemoGuideProps): React.JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed z-50 bottom-6 right-6 flex flex-col items-end gap-2">
      {open && (
        <div className="rounded-2xl overflow-hidden bg-slate-800 border border-white/[0.08] shadow-xs min-w-[230px]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07]">
            <FlaskConical size={14} className="text-emerald-400" />
            <span className="text-xs font-bold tracking-wide text-slate-100">Enrollment Demo</span>
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">
              Prototype
            </span>
          </div>
          <div className="px-3 py-3 space-y-0.5">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-slate-500 px-3 mb-2">Form Presets</p>
            <button
              type="button"
              onClick={() => {
                onFillSample();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors text-slate-100 hover:bg-white/[0.07]"
            >
              <span className="flex items-center justify-center rounded-lg w-7 h-7 bg-emerald-400/15 shrink-0">
                <ClipboardList size={13} className="text-emerald-400" />
              </span>
              <div>
                <p className="text-xs font-semibold">Fill Sample Patient</p>
                <p className="text-[10px] mt-0.5 text-slate-500">Auto-fill all fields with demo data</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                onReset();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors text-slate-100 hover:bg-white/[0.07]"
            >
              <span className="flex items-center justify-center rounded-lg w-7 h-7 bg-slate-400/15 shrink-0">
                <Eraser size={13} className="text-slate-400" />
              </span>
              <div>
                <p className="text-xs font-semibold">Empty Form</p>
                <p className="text-[10px] mt-0.5 text-slate-500">Reset all fields to blank</p>
              </div>
            </button>
          </div>
          {demoFilled && (
            <div className="mx-3 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <p className="text-[10.5px] text-emerald-400 font-semibold">Sample data active</p>
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setOpen(false);
                }}
                className="ml-auto"
              >
                <RotateCcw size={10} className="text-emerald-400/70 hover:text-emerald-400 transition-colors" />
              </button>
            </div>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-white/10 shadow-xs text-slate-100 hover:bg-[#273449] transition-all"
      >
        <FlaskConical size={13} className="text-emerald-400" />
        <span className="text-xs font-semibold">Demo</span>
        {demoFilled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        {open ? (
          <ChevronDown size={12} className="text-slate-500" />
        ) : (
          <ChevronUp size={12} className="text-slate-500" />
        )}
      </button>
    </div>
  );
}

// ─── EHR View Components ──────────────────────────────────────────────────────

function EhrField({
  label,
  value,
  className,
}: {
  label: string;
  value?: string;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={className}>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground/60 mb-0.5">{label}</p>
      <p className="text-[13px] font-medium text-foreground">{value || '—'}</p>
    </div>
  );
}

interface EhrDataCardProps {
  title: string;
  icon: React.ReactNode;
  onEdit: () => void;
  editLabel?: string;
  children: React.ReactNode;
}

function EhrDataCard({ title, icon, onEdit, editLabel = 'Edit', children }: EhrDataCardProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/[0.07] flex items-center justify-center shrink-0">{icon}</div>
          <p className="text-[13px] font-bold text-foreground">{title}</p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/80">
            EHR Imported
          </span>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary/80 px-3 h-7 rounded-md hover:bg-primary/[0.06] transition-colors"
        >
          <Pencil size={11} />
          {editLabel}
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

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

function DemographicsViewContent({ data }: { data: Partial<EnrollmentStep1Values> }): React.JSX.Element {
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || '—';
  const address = formatAddressView(data);
  const initials = fullName !== '—' ? getInitials(fullName) : '?';
  const avatarColor = fullName !== '—' ? getAvatarColor(fullName) : 'bg-slate-100 text-slate-400';

  return (
    <div className="space-y-4">
      {/* Profile picture row — always visible */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        {data.profilePicture ? (
          <img
            src={data.profilePicture}
            alt="Patient photo"
            className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shrink-0"
          />
        ) : (
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0',
              avatarColor
            )}
          >
            {initials}
          </div>
        )}
        <div>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
            Profile Picture
          </p>
          {/* <p className="text-[13px] font-medium text-foreground mt-0.5">{fullName}</p> */}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <EhrField label="Full Name" value={fullName} />
        <EhrField label="MRN" value={data.mrn} />
        <EhrField label="Date of Birth" value={formatDobView(data.dateOfBirth)} />
        <EhrField label="Gender" value={data.gender} />
        <EhrField label="Email" value={data.email} />
        <EhrField label="Phone" value={data.phone} />
      </div>
      <div>
        <EhrField label="Address" value={address} />
      </div>
    </div>
  );
}

function InsuranceViewContent({ data }: { data: Partial<EnrollmentStep2Values> }): React.JSX.Element {
  const hasSecondary = !!data.secondaryInsurance;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <EhrField label="Insurance Plan" value={data.insurancePlanName} />
        <EhrField label="Plan Type" value={data.planType} />
        <EhrField label="Member ID" value={data.memberId} />
        <EhrField label="Group Number" value={data.groupNumber} />
      </div>
      {hasSecondary && (
        <div className="pt-1 border-t border-slate-100 grid grid-cols-2 gap-x-6 gap-y-4">
          <EhrField label="Secondary Insurance" value={data.secondaryInsurance} />
          <EhrField label="Secondary Member ID" value={data.secondaryMemberId} />
        </div>
      )}
    </div>
  );
}

// ─── Severity badge ───────────────────────────────────────────────────────────

const SEVERITY_STYLE: Record<DiagnosisSeverity, string> = {
  Mild: 'bg-teal-50 text-teal-700 border-teal-100',
  Moderate: 'bg-amber-50 text-amber-700 border-amber-100',
  Severe: 'bg-rose-50 text-rose-700 border-rose-100',
};

function DiagnosesViewContent({ diagnoses }: { diagnoses: DiagnosisFormItem[] }): React.JSX.Element {
  if (diagnoses.length === 0) {
    return (
      <p className="text-[12.5px] text-muted-foreground italic">
        No diagnoses imported from EHR — conditions can be added during enrollment.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {diagnoses.map((d, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-100"
        >
          {/* Index */}
          <div className="w-6 h-6 rounded-full bg-slate-200/70 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-slate-500">{idx + 1}</span>
          </div>

          {/* Condition name + ICD code */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground leading-tight truncate">{d.conditionName}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{d.icdCode}</p>
          </div>

          {/* Severity badge */}
          <span
            className={cn(
              'text-[10.5px] font-semibold px-2.5 py-1 rounded-full border shrink-0',
              SEVERITY_STYLE[d.severity]
            )}
          >
            {d.severity}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmergencyContactsViewContent({ data }: { data: EmergencyContactStepValues }): React.JSX.Element {
  if (!data.contacts || data.contacts.length === 0) {
    return (
      <p className="text-[12.5px] text-muted-foreground italic">
        No emergency contacts imported from EHR — use the button above to add one manually.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.contacts.map((c, i) => (
        <div key={i} className="grid grid-cols-3 gap-x-6 gap-y-1">
          <EhrField label={i === 0 ? 'Primary Contact' : `Contact ${i + 1}`} value={c.name} />
          <EhrField label="Phone" value={c.phone} />
          <EhrField label="Relationship" value={c.relationship} />
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EnrollPatientPage(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const ehrPrefill = (location.state as { ehrPrefill?: EHRPrefillData } | null)?.ehrPrefill;
  const isEhrMode = !!ehrPrefill;
  // Captured before control-flow narrowing so manual-mode JSX can still reference them
  const ehrPrefilledStep1 = ehrPrefill?.step1;
  const ehrPrefilledStep2 = ehrPrefill?.step2;

  const [navCollapsed, setNavCollapsed] = useState(false);

  // ── Manual mode state ─────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 'success'>(1);
  const [step1Data, setStep1Data] = useState<EnrollmentStep1Values | null>(null);
  const [step2Data, setStep2Data] = useState<EnrollmentStep2Values | null>(null);
  const [step3Data, setStep3Data] = useState<EmergencyContactStepValues | null>(null);
  const [step4Data, setStep4Data] = useState<MedicalConditionStepValues | null>(null);

  // ── EHR mode state ────────────────────────────────────────────────────────
  const [ehrDemographics, setEhrDemographics] = useState<Partial<EnrollmentStep1Values>>(ehrPrefill?.step1 ?? {});
  const [ehrInsurance, setEhrInsurance] = useState<Partial<EnrollmentStep2Values>>(ehrPrefill?.step2 ?? {});
  const [ehrEmergencyContacts, setEhrEmergencyContacts] = useState<EmergencyContactStepValues>({ contacts: [] });
  const [ehrDiagnoses, setEhrDiagnoses] = useState<DiagnosisFormItem[]>(ehrPrefill?.diagnoses ?? []);
  const [ehrAddConditionOpen, setEhrAddConditionOpen] = useState(false);
  const [ehrStep, setEhrStep] = useState(1);
  const [ehrPrograms, setEhrPrograms] = useState({ rpm: false, apcm: false, bhi: false });
  const [ehrCareTeam, setEhrCareTeam] = useState({ physician: '', nurse: '', dhn: '' });
  const [ehrCareTeamErrors, setEhrCareTeamErrors] = useState({ physician: false, nurse: false, dhn: false });

  // Inline edit state
  const [inlineEditSection, setInlineEditSection] = useState<'demographics' | 'insurance' | 'emergency' | null>(null);

  // ── Shared state ──────────────────────────────────────────────────────────
  const [inviteCode, setInviteCode] = useState('');
  const [enrolledName, setEnrolledName] = useState('');
  const [enrolledEmail, setEnrolledEmail] = useState('');
  const [formKey, setFormKey] = useState(0);
  const [demoFilled, setDemoFilled] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  const allUsers: UserListItem[] = secureLocalStorage.getItemObject<UserListItem[]>(USER_LIST_STORAGE_KEY) ?? [];
  const physicians = allUsers
    .filter((u) => u.type === 'PHYSICIAN' && u.status === 'Active')
    .map((u) => ({ id: u.id, fullName: u.fullName, npiNumber: u.npiNumber, specialty: u.specialty }));
  const nurses = allUsers
    .filter((u) => u.type === 'NURSE' && u.status === 'Active')
    .map((u) => ({ id: u.id, fullName: u.fullName, specialty: u.specialty }));
  const dhns = allUsers
    .filter((u) => u.type === 'DHN' && u.status === 'Active')
    .map((u) => ({ id: u.id, fullName: u.fullName, specialty: u.specialty }));

  // ── Demo sample data ──────────────────────────────────────────────────────
  const SAMPLE_STEP1: EnrollmentStep1Values = {
    firstName: 'Sarah',
    lastName: 'Mitchell',
    mrn: 'MRN-20481',
    dateOfBirth: '1985-03-14',
    gender: 'Female',
    email: 'sarah.mitchell@email.com',
    phone: '(312) 555-0192',
    zipCode: '60601',
    country: 'USA',
    state: 'IL',
    city: 'Chicago',
    addressLine1: '1247 Oak Street',
    addressLine2: 'Apt 3B',
  };

  const SAMPLE_STEP2: EnrollmentStep2Values = {
    insurancePlanName: 'BlueCross BlueShield',
    planType: 'PPO',
    memberId: 'BCB-4421-9087',
    groupNumber: 'GRP-20031',
    hasSecondaryInsurance: true,
    secondaryInsurance: 'Medicare Part B',
    secondaryMemberId: 'MCR-8811-00214',
  };

  const SAMPLE_STEP3: EmergencyContactStepValues = {
    contacts: [{ name: 'Patricia Mitchell', phone: '(312) 555-0182', relationship: 'Spouse' }],
  };

  function fillSampleDemo(): void {
    setDemoFilled(true);
    setStep1Data(null);
    setStep2Data(null);
    setStep3Data(null);
    setStep4Data(null);
    setFormKey((k) => k + 1);
    setStep(1);
  }

  function resetForm(): void {
    setDemoFilled(false);
    setStep1Data(null);
    setStep2Data(null);
    setStep3Data(null);
    setStep4Data(null);
    setFormKey((k) => k + 1);
    setStep(1);
  }

  function goUp() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Shared enrollment logic ───────────────────────────────────────────────

  function doEnroll(
    s1: EnrollmentStep1Values,
    s2: EnrollmentStep2Values,
    s3: EmergencyContactStepValues,
    data: EnrollmentStep3Values
  ): void {
    const id = `p-${Date.now()}`;
    const fullName = `${s1.firstName} ${s1.lastName}`;
    const programs: ProgramType[] = [
      ...(data.programACPM ? (['APCM'] as ProgramType[]) : []),
      ...(data.programRPM ? (['RPM'] as ProgramType[]) : []),
      ...(data.programBHI ? (['BHI'] as ProgramType[]) : []),
    ];
    const composedAddress = [s1.addressLine1, s1.addressLine2, s1.city, s1.state, s1.zipCode, s1.country]
      .filter(Boolean)
      .join(', ');

    const listItem: PatientListItem = {
      id,
      mrn: s1.mrn,
      fullName,
      dateOfBirth: formatDateOfBirth(s1.dateOfBirth),
      gender: s1.gender,
      email: s1.email,
      phone: s1.phone,
      pcpName: data.careTeamPhysician,
      programs,
      status: 'Active',
    };

    const detailData: PatientDetailData = {
      id,
      mrn: s1.mrn,
      fullName,
      dateOfBirth: formatDateOfBirth(s1.dateOfBirth),
      dobIso: s1.dateOfBirth,
      gender: s1.gender,
      email: s1.email,
      phone: s1.phone,
      address: composedAddress,
      addressLine1: s1.addressLine1,
      addressLine2: s1.addressLine2 ?? '',
      addressCity: s1.city,
      addressState: s1.state,
      addressZipCode: s1.zipCode,
      addressCountry: s1.country,
      pcpName: data.careTeamPhysician,
      programs,
      insurance: {
        planName: s2.insurancePlanName,
        planType: s2.planType,
        memberId: s2.memberId,
        groupNumber: s2.groupNumber,
        secondaryInsurance: s2.hasSecondaryInsurance ? s2.secondaryInsurance || undefined : undefined,
        secondaryMemberId: s2.hasSecondaryInsurance ? s2.secondaryMemberId || undefined : undefined,
      },
      diagnoses: data.diagnoses,
      emergencyContacts: s3.contacts,
      careTeam: [
        ...(data.careTeamPhysician ? [{ role: 'PCP' as CareTeamRole, name: data.careTeamPhysician, email: '' }] : []),
        ...(data.careTeamNurse ? [{ role: 'Nurse' as CareTeamRole, name: data.careTeamNurse, email: '' }] : []),
        ...(data.careTeamDHN ? [{ role: 'DHN' as CareTeamRole, name: data.careTeamDHN, email: '' }] : []),
      ],
      alerts: [],
    };

    try {
      const existingList = secureLocalStorage.getItemObject<PatientListItem[]>(PATIENT_LIST_STORAGE_KEY) ?? [];
      secureLocalStorage.setItemObject(PATIENT_LIST_STORAGE_KEY, [listItem, ...existingList]);
      const existingDetail =
        secureLocalStorage.getItemObject<Record<string, PatientDetailData>>(PATIENT_DETAIL_STORAGE_KEY) ?? {};
      secureLocalStorage.setItemObject(PATIENT_DETAIL_STORAGE_KEY, { ...existingDetail, [id]: detailData });
    } catch {
      toast.error('Failed to save patient data.');
      return;
    }

    setInviteCode(generateInviteCode());
    setEnrolledName(fullName);
    setEnrolledEmail(s1.email);
    if (isEhrMode) {
      setEnrollSuccess(true);
    } else {
      setStep('success');
    }
  }

  // ── Manual flow handlers ──────────────────────────────────────────────────

  function handleStep1(data: EnrollmentStep1Values) {
    setStep1Data(data);
    setStep(2);
    goUp();
  }
  function handleStep2(data: EnrollmentStep2Values) {
    setStep2Data(data);
    setStep(3);
    goUp();
  }
  function handleStep3(data: EmergencyContactStepValues) {
    setStep3Data(data);
    setStep(4);
    goUp();
  }
  function handleStep4(data: MedicalConditionStepValues) {
    setStep4Data(data);
    setStep(5);
    goUp();
  }
  function handleStep5(careTeam: { careTeamPhysician: string; careTeamNurse: string; careTeamDHN: string }) {
    if (!step1Data || !step2Data || !step3Data || !step4Data) return;
    const combined: EnrollmentStep3Values = {
      careTeamPhysician: careTeam.careTeamPhysician,
      careTeamNurse: careTeam.careTeamNurse,
      careTeamDHN: careTeam.careTeamDHN,
      diagnoses: step4Data.diagnoses,
      programRPM: step4Data.programRPM,
      programACPM: step4Data.programACPM,
      programBHI: step4Data.programBHI,
    };
    doEnroll(step1Data, step2Data, step3Data, combined);
  }

  // ── EHR flow handler ──────────────────────────────────────────────────────

  function handleEhrEnroll(): void {
    const errors = {
      physician: !ehrCareTeam.physician,
      nurse: !ehrCareTeam.nurse,
      dhn: !ehrCareTeam.dhn,
    };
    setEhrCareTeamErrors(errors);
    if (errors.physician || errors.nurse || errors.dhn) return;

    const s1: EnrollmentStep1Values = {
      firstName: ehrDemographics.firstName ?? '',
      lastName: ehrDemographics.lastName ?? '',
      mrn: ehrDemographics.mrn ?? '',
      dateOfBirth: ehrDemographics.dateOfBirth ?? '',
      gender: ehrDemographics.gender ?? '',
      email: ehrDemographics.email ?? '',
      phone: ehrDemographics.phone ?? '',
      profilePicture: ehrDemographics.profilePicture,
      zipCode: ehrDemographics.zipCode ?? '',
      country: ehrDemographics.country ?? '',
      state: ehrDemographics.state ?? '',
      city: ehrDemographics.city ?? '',
      addressLine1: ehrDemographics.addressLine1 ?? '',
      addressLine2: ehrDemographics.addressLine2,
    };
    const s2: EnrollmentStep2Values = {
      insurancePlanName: ehrInsurance.insurancePlanName ?? '',
      planType: ehrInsurance.planType ?? '',
      memberId: ehrInsurance.memberId ?? '',
      groupNumber: ehrInsurance.groupNumber ?? '',
      hasSecondaryInsurance: !!ehrInsurance.secondaryInsurance,
      secondaryInsurance: ehrInsurance.secondaryInsurance ?? '',
      secondaryMemberId: ehrInsurance.secondaryMemberId ?? '',
    };
    const data: EnrollmentStep3Values = {
      careTeamPhysician: ehrCareTeam.physician,
      careTeamNurse: ehrCareTeam.nurse,
      careTeamDHN: ehrCareTeam.dhn,
      diagnoses: ehrDiagnoses,
      programRPM: ehrPrograms.rpm,
      programACPM: ehrPrograms.apcm,
      programBHI: ehrPrograms.bhi,
    };
    doEnroll(s1, s2, ehrEmergencyContacts, data);
  }

  // ── Inline edit handlers ──────────────────────────────────────────────────

  function startEhrInlineEdit(section: 'demographics' | 'insurance' | 'emergency'): void {
    setInlineEditSection(section);
  }

  function cancelEhrInlineEdit(): void {
    setInlineEditSection(null);
  }

  const isSuccess = isEhrMode ? enrollSuccess : step === 'success';
  const pageTitle = ehrPrefill ? `EHR Import — ${ehrPrefill.ehrName}` : 'Enroll New Patient';

  // ── EHR Mode Layout ───────────────────────────────────────────────────────

  if (isEhrMode) {
    return (
      <div className="h-screen overflow-hidden flex bg-[#FAFAF9]">
        <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />

        <div
          className={cn(
            'flex-1 flex flex-col min-w-0 transition-[margin-left] duration-[220ms] ease-in-out',
            navCollapsed ? 'ml-[60px]' : 'ml-60'
          )}
        >
          <TopBar title="Patient Management" subtitle={pageTitle} />

          <SuccessDialog
            open={isSuccess}
            patientName={enrolledName}
            email={enrolledEmail}
            inviteCode={inviteCode}
            onDone={() => navigate(`${PATIENT_BASE_PATH}?tab=Pending`)}
          />

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-hidden flex flex-col px-8 py-8 gap-5">
              {/* Back */}
              <button
                type="button"
                onClick={() => navigate(PATIENT_BASE_PATH)}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <ArrowLeft size={14} />
                Back to Patients
              </button>

              {/* Two-panel card */}
              <div className="flex-1 overflow-hidden bg-white rounded-[14px] border border-slate-200 shadow-xs flex">
                {/* Left: Vertical Stepper */}
                <div className="w-[22%] min-w-[180px] shrink-0 bg-slate-50/60 border-r border-slate-100 px-6 py-8 flex flex-col overflow-hidden">
                  <div className="mb-8">
                    <h2 className="text-[13.5px] font-bold text-foreground leading-snug">{pageTitle}</h2>
                    <p className="text-[11.5px] text-muted-foreground mt-1.5 leading-relaxed">
                      Complete all steps to enroll the patient.
                    </p>
                  </div>
                  <VerticalStepper current={ehrStep} steps={EHR_STEPS} />
                </div>

                {/* Right: Step Content */}
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                  {/* Fixed step heading */}
                  <div className="px-8 pt-8 pb-5 shrink-0 border-b border-slate-100">
                    <h3 className="text-[15px] font-bold text-foreground">{EHR_STEPS[ehrStep - 1].label}</h3>
                    <p className="text-[12.5px] text-muted-foreground mt-1">{EHR_STEPS[ehrStep - 1].description}</p>
                  </div>

                  {/* Scrollable step content */}
                  <div className="flex-1 overflow-y-auto px-8 pt-6 pb-4">
                    {/* Step 1: Demographics */}
                    {ehrStep === 1 && (
                      <div className="pb-8">
                        {inlineEditSection === 'demographics' ? (
                          <DemographicsStep
                            key="ehr-inline-demo"
                            mode="edit"
                            defaultValues={ehrDemographics}
                            onNext={(data) => {
                              setEhrDemographics(data);
                              setInlineEditSection(null);
                            }}
                            onCancel={cancelEhrInlineEdit}
                            hideFooter
                            formId="ehr-inline-form"
                          />
                        ) : (
                          <EhrDataCard
                            title="Demographics"
                            icon={<User size={13} className="text-primary" />}
                            onEdit={() => startEhrInlineEdit('demographics')}
                          >
                            <DemographicsViewContent data={ehrDemographics} />
                          </EhrDataCard>
                        )}
                      </div>
                    )}

                    {/* Step 2: Insurance */}
                    {ehrStep === 2 && (
                      <div className="pb-8">
                        {inlineEditSection === 'insurance' ? (
                          <InsuranceStep
                            key="ehr-inline-ins"
                            mode="edit"
                            defaultValues={ehrInsurance}
                            onNext={(data) => {
                              setEhrInsurance(data);
                              setInlineEditSection(null);
                            }}
                            onBack={cancelEhrInlineEdit}
                            onCancel={cancelEhrInlineEdit}
                            hideFooter
                            formId="ehr-inline-form"
                          />
                        ) : (
                          <EhrDataCard
                            title="Insurance"
                            icon={<ShieldCheck size={13} className="text-primary" />}
                            onEdit={() => startEhrInlineEdit('insurance')}
                          >
                            <InsuranceViewContent data={ehrInsurance} />
                          </EhrDataCard>
                        )}
                      </div>
                    )}

                    {/* Step 3: Emergency Contacts */}
                    {ehrStep === 3 && (
                      <div className="pb-8">
                        {inlineEditSection === 'emergency' ? (
                          <EmergencyContactStep
                            key="ehr-inline-emg"
                            mode="edit"
                            defaultValues={ehrEmergencyContacts}
                            onNext={(data) => {
                              setEhrEmergencyContacts(data);
                              setInlineEditSection(null);
                            }}
                            onBack={cancelEhrInlineEdit}
                            onCancel={cancelEhrInlineEdit}
                            hideFooter
                            formId="ehr-inline-form"
                          />
                        ) : (
                          <EhrDataCard
                            title="Emergency Contacts"
                            icon={<Phone size={13} className="text-primary" />}
                            onEdit={() => startEhrInlineEdit('emergency')}
                            editLabel={ehrEmergencyContacts.contacts.length === 0 ? 'Add Contact' : 'Edit'}
                          >
                            <EmergencyContactsViewContent data={ehrEmergencyContacts} />
                          </EhrDataCard>
                        )}
                      </div>
                    )}

                    {/* Step 4: Medical Conditions + Program Enrollment */}
                    {ehrStep === 4 && (
                      <div className="space-y-5 pb-8">
                        <DiagnosisDialog
                          open={ehrAddConditionOpen}
                          onSave={(d) => {
                            setEhrDiagnoses((prev) => [...prev, d]);
                            setEhrAddConditionOpen(false);
                          }}
                          onClose={() => setEhrAddConditionOpen(false)}
                        />

                        {/* Diagnoses card */}
                        <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
                          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-primary/[0.07] flex items-center justify-center shrink-0">
                                <Stethoscope size={13} className="text-primary" />
                              </div>
                              <p className="text-[13px] font-bold text-foreground">Medical Conditions</p>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/80">
                                EHR Imported
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-semibold text-muted-foreground">
                                {ehrDiagnoses.length} condition{ehrDiagnoses.length !== 1 ? 's' : ''}
                              </span>
                              <button
                                type="button"
                                onClick={() => setEhrAddConditionOpen(true)}
                                className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary/80 px-3 h-7 rounded-md hover:bg-primary/[0.06] transition-colors"
                              >
                                <Plus size={12} />
                                Add Condition
                              </button>
                            </div>
                          </div>
                          <div className="px-5 py-4">
                            <DiagnosesViewContent diagnoses={ehrDiagnoses} />
                          </div>
                        </div>

                        {/* Program Enrollment */}
                        <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
                          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                            <p className="text-[13px] font-bold text-foreground">Program Enrollment</p>
                            <p className="text-[11.5px] text-muted-foreground mt-0.5">
                              Select programs to enroll this patient in
                            </p>
                          </div>
                          <div className="px-5 py-4 space-y-2">
                            {(
                              [
                                {
                                  key: 'rpm' as const,
                                  label: 'RPM',
                                  name: 'Remote Patient Monitoring',
                                  desc: 'Continuous monitoring via connected devices',
                                },
                                {
                                  key: 'apcm' as const,
                                  label: 'APCM',
                                  name: 'Advanced Primary Care Management',
                                  desc: 'Comprehensive chronic care coordination',
                                },
                                {
                                  key: 'bhi' as const,
                                  label: 'BHI',
                                  name: 'Behavioral Health Integration',
                                  desc: 'Mental health and wellness support',
                                },
                              ] as const
                            ).map((prog) => (
                              <div
                                key={prog.key}
                                onClick={() => setEhrPrograms((p) => ({ ...p, [prog.key]: !p[prog.key] }))}
                                className={cn(
                                  'flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all select-none',
                                  ehrPrograms[prog.key]
                                    ? 'border-primary/30 bg-primary/[0.04]'
                                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                                )}
                              >
                                <Checkbox
                                  checked={ehrPrograms[prog.key]}
                                  onCheckedChange={(checked) =>
                                    setEhrPrograms((p) => ({ ...p, [prog.key]: !!checked }))
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-0.5 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[13px] font-semibold text-foreground">{prog.name}</p>
                                    <span
                                      className={cn(
                                        'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                                        ehrPrograms[prog.key]
                                          ? 'bg-primary/[0.07] text-primary border-primary/10'
                                          : 'bg-slate-100 text-slate-500 border-slate-200'
                                      )}
                                    >
                                      {prog.label}
                                    </span>
                                  </div>
                                  <p className="text-[11.5px] text-muted-foreground mt-0.5">{prog.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Care Team Assignment */}
                    {ehrStep === 5 && (
                      <div className="space-y-5 pb-8">
                        <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs">
                          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 rounded-t-[14px]">
                            <p className="text-[13px] font-bold text-foreground">Care Team Assignment</p>
                            <p className="text-[11.5px] text-muted-foreground mt-0.5">
                              Assign a care team to this patient
                            </p>
                          </div>
                          <div className="px-5 py-5 space-y-5">
                            {/* Physician */}
                            <div className="space-y-1.5">
                              <label className="text-[12.5px] font-semibold text-foreground">
                                Physician <span className="text-destructive">*</span>{' '}
                                <span className="font-normal text-muted-foreground">(Primary Care Provider)</span>
                              </label>
                              <StaffSelect
                                value={ehrCareTeam.physician}
                                onChange={(v) => {
                                  setEhrCareTeam((t) => ({ ...t, physician: v }));
                                  if (v) setEhrCareTeamErrors((e) => ({ ...e, physician: false }));
                                }}
                                options={physicians}
                                placeholder="Select a physician…"
                                error={ehrCareTeamErrors.physician}
                              />
                              {ehrCareTeamErrors.physician && (
                                <p className="text-[11px] text-destructive">Physician is required</p>
                              )}
                            </div>

                            {/* Nurse */}
                            <div className="space-y-1.5">
                              <label className="text-[12.5px] font-semibold text-foreground">
                                Nurse <span className="text-destructive">*</span>{' '}
                                <span className="font-normal text-muted-foreground">(Registered Nurse)</span>
                              </label>
                              <StaffSelect
                                value={ehrCareTeam.nurse}
                                onChange={(v) => {
                                  setEhrCareTeam((t) => ({ ...t, nurse: v }));
                                  if (v) setEhrCareTeamErrors((e) => ({ ...e, nurse: false }));
                                }}
                                options={nurses}
                                placeholder="Select a nurse…"
                                error={ehrCareTeamErrors.nurse}
                              />
                              {ehrCareTeamErrors.nurse && (
                                <p className="text-[11px] text-destructive">Nurse is required</p>
                              )}
                            </div>

                            {/* DHN */}
                            <div className="space-y-1.5">
                              <label className="text-[12.5px] font-semibold text-foreground">
                                Digital Health Navigator <span className="text-destructive">*</span>{' '}
                                <span className="font-normal text-muted-foreground">(DHN)</span>
                              </label>
                              <StaffSelect
                                value={ehrCareTeam.dhn}
                                onChange={(v) => {
                                  setEhrCareTeam((t) => ({ ...t, dhn: v }));
                                  if (v) setEhrCareTeamErrors((e) => ({ ...e, dhn: false }));
                                }}
                                options={dhns}
                                placeholder="Select a DHN…"
                                error={ehrCareTeamErrors.dhn}
                              />
                              {ehrCareTeamErrors.dhn && (
                                <p className="text-[11px] text-destructive">Digital Health Navigator is required</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sticky footer — inline edit mode or step navigation */}
                  <div className="shrink-0 px-8 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
                    {inlineEditSection ? (
                      <>
                        <button
                          type="button"
                          onClick={cancelEhrInlineEdit}
                          className="h-10 px-5 rounded-lg border border-slate-200 text-[13px] font-semibold text-foreground hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          form="ehr-inline-form"
                          className="h-10 px-6 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold shadow-xs hover:[background:linear-gradient(135deg,var(--primary)_0%,var(--primary-teal)_100%)] transition-all duration-200"
                        >
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <>
                        {ehrStep > 1 ? (
                          <button
                            type="button"
                            onClick={() => setEhrStep(ehrStep - 1)}
                            className="h-10 px-5 rounded-lg border border-slate-200 text-[13px] font-semibold text-foreground hover:bg-slate-50 transition-colors"
                          >
                            Back
                          </button>
                        ) : (
                          <div />
                        )}
                        <button
                          type="button"
                          onClick={ehrStep === 5 ? handleEhrEnroll : () => setEhrStep(ehrStep + 1)}
                          className="h-10 px-6 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold shadow-xs hover:[background:linear-gradient(135deg,var(--primary)_0%,var(--primary-teal)_100%)] transition-all duration-200"
                        >
                          {ehrStep === 5 ? 'Pre-Enroll Patient' : ehrStep === 4 ? 'Next' : 'Review & Next'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Manual Mode Layout ────────────────────────────────────────────────────

  return (
    <div className="h-screen overflow-hidden flex bg-[#FAFAF9]">
      <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[margin-left] duration-[220ms] ease-in-out',
          navCollapsed ? 'ml-[60px]' : 'ml-60'
        )}
      >
        <TopBar title="Patient Management" subtitle={pageTitle} />

        <div className="flex-1 overflow-hidden flex flex-col">
          <SuccessDialog
            open={step === 'success'}
            patientName={enrolledName}
            email={enrolledEmail}
            inviteCode={inviteCode}
            onDone={() => navigate(`${PATIENT_BASE_PATH}?tab=Pending`)}
          />

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-hidden flex flex-col px-8 py-8 gap-5">
              {/* Back */}
              <button
                type="button"
                onClick={() => navigate(PATIENT_BASE_PATH)}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <ArrowLeft size={14} />
                Back to Patients
              </button>

              {/* Two-panel card */}
              <div className="flex-1 overflow-hidden bg-white rounded-[14px] border border-slate-200 shadow-xs flex">
                {/* Left: Vertical Stepper */}
                <div className="w-[22%] min-w-[180px] shrink-0 bg-slate-50/60 border-r border-slate-100 px-6 py-8 flex flex-col overflow-hidden">
                  <div className="mb-8">
                    <h2 className="text-[13.5px] font-bold text-foreground leading-snug">{pageTitle}</h2>
                    <p className="text-[11.5px] text-muted-foreground mt-1.5 leading-relaxed">
                      Complete all steps to enroll the patient.
                    </p>
                  </div>
                  <VerticalStepper current={step === 'success' ? 6 : (step as number)} steps={STEPS} />
                </div>

                {/* Right: Form */}
                <div className="flex-1 min-w-0 overflow-y-auto px-8 pt-8 pb-0">
                  <div className="mb-7">
                    <h3 className="text-[15px] font-bold text-foreground">
                      {STEPS[Math.min(step === 'success' ? 5 : (step as number), 5) - 1].label}
                    </h3>
                    <p className="text-[12.5px] text-muted-foreground mt-1">
                      {STEPS[Math.min(step === 'success' ? 5 : (step as number), 5) - 1].description}
                    </p>
                  </div>

                  {step === 1 && (
                    <DemographicsStep
                      key={`step1-${formKey}`}
                      defaultValues={demoFilled ? SAMPLE_STEP1 : ehrPrefilledStep1}
                      onNext={handleStep1}
                    />
                  )}
                  {step === 2 && (
                    <InsuranceStep
                      key={`step2-${formKey}`}
                      defaultValues={demoFilled ? SAMPLE_STEP2 : ehrPrefilledStep2}
                      onBack={() => setStep(1)}
                      onNext={handleStep2}
                    />
                  )}
                  {step === 3 && (
                    <EmergencyContactStep
                      key={`step3-${formKey}`}
                      defaultValues={step3Data ?? (demoFilled ? SAMPLE_STEP3 : undefined)}
                      onBack={() => setStep(2)}
                      onNext={handleStep3}
                    />
                  )}
                  {step === 4 && (
                    <MedicalConditionStep
                      key={`step4-${formKey}`}
                      defaultDiagnoses={step4Data?.diagnoses}
                      defaultProgramRPM={step4Data?.programRPM}
                      defaultProgramACPM={step4Data?.programACPM}
                      defaultProgramBHI={step4Data?.programBHI}
                      isEdit={false}
                      onBack={() => setStep(3)}
                      onNext={handleStep4}
                    />
                  )}
                  {step === 5 && (
                    <CareTeamStep
                      key={`step5-${formKey}`}
                      isEdit={false}
                      onBack={() => setStep(4)}
                      onSubmit={handleStep5}
                      physicians={physicians}
                      nurses={nurses}
                      dhns={dhns}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EnrollmentDemoGuide demoFilled={demoFilled} onFillSample={fillSampleDemo} onReset={resetForm} />
    </div>
  );
}
