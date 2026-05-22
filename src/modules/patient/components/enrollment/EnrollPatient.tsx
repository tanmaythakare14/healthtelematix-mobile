import React, { useState } from 'react';
import { Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
} from '../../@types';
import { PATIENT_LIST_STORAGE_KEY, PATIENT_DETAIL_STORAGE_KEY } from '../../constants';
import { USER_LIST_STORAGE_KEY } from '@/modules/user-management/constants';
import type { UserListItem } from '@/modules/user-management/@types';
import { DemographicsStep } from './steps/DemographicsStep';
import { InsuranceStep } from './steps/InsuranceStep';
import { EmergencyContactStep } from './steps/EmergencyContactStep';
import { MedicalConditionStep } from './steps/MedicalConditionStep';
import { CareTeamStep } from './steps/CareTeamStep';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateOfBirth(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
}

/** "MM/DD/YYYY" or legacy "Jan 10, 2024" → "2024-01-10" for form pre-fill */
function formattedDateToISO(formatted: string): string {
  if (!formatted || formatted === '—') return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(formatted)) {
    const [mm, dd, yyyy] = formatted.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }
  const d = new Date(formatted);
  if (isNaN(d.getTime())) return '';
  return format(d, 'yyyy-MM-dd');
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand = (n: number) => Math.floor(Math.random() * n);
  return `INV-${chars[rand(chars.length)]}${chars[rand(chars.length)]}${chars[rand(chars.length)]}${chars[rand(chars.length)]}-${chars[rand(chars.length)]}${chars[rand(chars.length)]}${chars[rand(chars.length)]}${chars[rand(chars.length)]}`;
}

function persistPatients(list: PatientListItem[]): void {
  try {
    secureLocalStorage.setItemObject(PATIENT_LIST_STORAGE_KEY, list);
  } catch {
    toast.error('Failed to save patient data.');
  }
}

function persistDetail(record: Record<string, PatientDetailData>): void {
  try {
    secureLocalStorage.setItemObject(PATIENT_DETAIL_STORAGE_KEY, record);
  } catch {
    toast.error('Failed to save patient details.');
  }
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Demographics' },
  { label: 'Insurance' },
  { label: 'Emergency Contacts' },
  { label: 'Medical Condition' },
  { label: 'Care Team' },
];

function StepIndicator({ current }: { current: number }): React.JSX.Element {
  return (
    <div className="flex items-center gap-0 mb-6 mt-1">
      {STEPS.map((s, idx) => {
        const num = idx + 1;
        const done = num < current;
        const active = num === current;
        return (
          <React.Fragment key={s.label}>
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors',
                  done
                    ? 'border-primary bg-primary text-primary-foreground'
                    : active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-slate-200 bg-white text-muted-foreground'
                )}
              >
                {done ? (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                    <path
                      d="M1 4.5L4.5 8L11 1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  num
                )}
              </div>
              <span
                className={cn(
                  'text-[10.5px] font-medium whitespace-nowrap',
                  active ? 'text-primary font-semibold' : done ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {s.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-[2px] mx-2 mb-5 rounded-full transition-colors',
                  num < current ? 'bg-primary' : 'bg-slate-200'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Success View ─────────────────────────────────────────────────────────────

function SuccessView({
  patientName,
  email,
  inviteCode,
  isEdit,
  onClose,
}: {
  patientName: string;
  email: string;
  inviteCode: string;
  isEdit: boolean;
  onClose: () => void;
}): React.JSX.Element {
  return (
    <div className="flex flex-col">
      {/* ── Animated header ── */}
      <div className="bg-gradient-to-b from-emerald-50/90 via-emerald-50/40 to-white px-8 pt-10 pb-6 flex flex-col items-center text-center">
        {/* Pulsing icon */}
        <div className="relative mb-5">
          <span className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping pointer-events-none" />
          <span className="absolute -inset-3 rounded-full bg-emerald-400/10 animate-pulse pointer-events-none" />
          <div className="relative w-[72px] h-[72px] rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">
            <Check size={34} className="text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h3 className="text-[19px] font-bold text-foreground leading-tight">
          {isEdit ? 'Patient Updated Successfully!' : 'Patient Enrolled Successfully!'}
        </h3>
        <p className="text-[13px] text-muted-foreground max-w-[340px] leading-relaxed mt-2">
          {isEdit ? (
            <>
              <span className="font-semibold text-foreground" data-phi="true">
                {patientName}
              </span>
              's information has been updated successfully.
            </>
          ) : (
            <>
              <span className="font-semibold text-foreground" data-phi="true">
                {patientName}
              </span>{' '}
              has been enrolled. An invitation email has been sent to{' '}
              <span className="font-semibold text-foreground" data-phi="true">
                {email}
              </span>
              .
            </>
          )}
        </p>
      </div>

      {/* ── Body ── */}
      <div className="px-6 pb-6 space-y-3">
        {/* Invite code */}
        {!isEdit && (
          <div className="rounded-xl border border-dashed border-primary/35 bg-primary/[0.03] px-5 py-4 text-center space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em]">
              Patient Invite Code
            </p>
            <p className="text-[24px] font-mono font-bold text-primary tracking-widest">{inviteCode}</p>
            <p className="text-[11px] text-muted-foreground">Share this code with the patient to join the app.</p>
          </div>
        )}

        {/* Consent notice */}
        {!isEdit && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
            <Info size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[12.5px] font-semibold text-amber-700">Consent — Waiting for Patient Approval</p>
              <p className="text-[11.5px] text-amber-600 mt-0.5 leading-relaxed">
                Consent will be recorded once the patient joins the app and accepts the terms of service.
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <Button className="w-full h-10 shadow-xs" onClick={onClose}>
          {isEdit ? 'Done' : 'Back to Patients'}
        </Button>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EnrollPatientProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnrolled: (patient: PatientListItem) => void;
  /** When provided, the modal opens in edit mode for this patient */
  editPatient?: PatientDetailData;
  onUpdated?: (patient: PatientListItem) => void;
  /** When provided, pre-fills the form with EHR-imported data */
  ehrPrefill?: {
    ehrName: string;
    step1: Partial<EnrollmentStep1Values>;
    step2: Partial<EnrollmentStep2Values>;
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EnrollPatient({
  open,
  onOpenChange,
  onEnrolled,
  editPatient,
  onUpdated,
  ehrPrefill,
}: EnrollPatientProps): React.JSX.Element {
  const isEdit = !!editPatient;

  // Pre-fill step1 defaults from editPatient
  const editStep1Defaults: Partial<EnrollmentStep1Values> | undefined = editPatient
    ? {
        firstName: editPatient.fullName.split(' ')[0] ?? '',
        lastName: editPatient.fullName.split(' ').slice(1).join(' ') ?? '',
        mrn: editPatient.mrn,
        dateOfBirth: formattedDateToISO(editPatient.dateOfBirth),
        gender: editPatient.gender,
        email: editPatient.email,
        phone: editPatient.phone,
        pcpName: editPatient.pcpName,
        addressLine1: editPatient.address,
        addressLine2: '',
        zipCode: '',
        country: '',
        state: '',
        city: '',
      }
    : undefined;

  // Pre-fill step2 defaults from editPatient
  const editStep2Defaults: Partial<EnrollmentStep2Values> | undefined = editPatient
    ? {
        insurancePlanName: editPatient.insurance.planName === '—' ? '' : editPatient.insurance.planName,
        planType: editPatient.insurance.planType === '—' ? '' : editPatient.insurance.planType,
        memberId: editPatient.insurance.memberId === '—' ? '' : editPatient.insurance.memberId,
        groupNumber: editPatient.insurance.groupNumber === '—' ? '' : editPatient.insurance.groupNumber,
        secondaryInsurance: editPatient.insurance.secondaryInsurance ?? '',
        secondaryMemberId: editPatient.insurance.secondaryMemberId ?? '',
      }
    : undefined;

  // Pre-fill step3 defaults from editPatient
  const editStep3Defaults: Partial<EmergencyContactStepValues> | undefined = editPatient
    ? {
        contacts:
          editPatient.emergencyContacts.length > 0
            ? editPatient.emergencyContacts
            : [{ name: '', phone: '', relationship: '' }],
      }
    : undefined;

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 'success'>(1);
  const [step1Data, setStep1Data] = useState<EnrollmentStep1Values | null>(null);
  const [step2Data, setStep2Data] = useState<EnrollmentStep2Values | null>(null);
  const [step3Data, setStep3Data] = useState<EmergencyContactStepValues | null>(null);
  const [step4Data, setStep4Data] = useState<MedicalConditionStepValues | null>(null);
  const [ehrStep2Prefill, setEhrStep2Prefill] = useState<Partial<EnrollmentStep2Values> | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [enrolledName, setEnrolledName] = useState('');
  const [enrolledEmail, setEnrolledEmail] = useState('');

  // Load staff from user storage
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

  function handleClose() {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setStep1Data(null);
      setStep2Data(null);
      setStep3Data(null);
      setStep4Data(null);
      setEhrStep2Prefill(null);
    }, 300);
  }

  function handleStep1(data: EnrollmentStep1Values) {
    setStep1Data(data);
    setStep(2);
  }

  function handleStep2(data: EnrollmentStep2Values) {
    setStep2Data(data);
    setStep(3);
  }

  function handleStep3(data: EmergencyContactStepValues) {
    setStep3Data(data);
    setStep(4);
  }

  function handleStep4(data: MedicalConditionStepValues) {
    setStep4Data(data);
    setStep(5);
  }

  function handleStep5(careTeam: { careTeamPhysician: string; careTeamNurse: string; careTeamDHN: string }) {
    if (!step1Data || !step2Data || !step3Data || !step4Data) return;

    const combinedStep4: EnrollmentStep3Values = {
      careTeamPhysician: careTeam.careTeamPhysician,
      careTeamNurse: careTeam.careTeamNurse,
      careTeamDHN: careTeam.careTeamDHN,
      diagnoses: step4Data.diagnoses,
      programRPM: step4Data.programRPM,
      programACPM: step4Data.programACPM,
      programBHI: step4Data.programBHI,
    };

    handleFinalSubmit(combinedStep4);
  }

  function handleFinalSubmit(data: EnrollmentStep3Values) {
    if (!step1Data || !step2Data || !step3Data) return;

    const id = isEdit ? editPatient!.id : `p-${Date.now()}`;
    const fullName = `${step1Data.firstName} ${step1Data.lastName}`;
    const programs: ProgramType[] = [
      ...(data.programACPM ? (['APCM'] as ProgramType[]) : []),
      ...(data.programRPM ? (['RPM'] as ProgramType[]) : []),
      ...(data.programBHI ? (['BHI'] as ProgramType[]) : []),
    ];

    const listItem: PatientListItem = {
      id,
      mrn: step1Data.mrn,
      fullName,
      dateOfBirth: formatDateOfBirth(step1Data.dateOfBirth),
      gender: step1Data.gender,
      email: step1Data.email,
      phone: step1Data.phone,
      pcpName: data.careTeamPhysician,
      programs,
      status: 'Active',
    };

    const detailData: PatientDetailData = {
      id,
      mrn: step1Data.mrn,
      fullName,
      dateOfBirth: formatDateOfBirth(step1Data.dateOfBirth),
      gender: step1Data.gender,
      email: step1Data.email,
      phone: step1Data.phone,
      address: [
        step1Data.addressLine1,
        step1Data.addressLine2,
        step1Data.city,
        step1Data.state,
        step1Data.zipCode,
        step1Data.country,
      ]
        .filter(Boolean)
        .join(', '),
      pcpName: data.careTeamPhysician,
      programs,
      insurance: {
        planName: step2Data.insurancePlanName,
        planType: step2Data.planType,
        memberId: step2Data.memberId,
        groupNumber: step2Data.groupNumber,
        secondaryInsurance: step2Data.secondaryInsurance || undefined,
        secondaryMemberId: step2Data.secondaryMemberId || undefined,
      },
      diagnoses: data.diagnoses,
      emergencyContacts: step3Data.contacts,
      careTeam: [
        ...(data.careTeamPhysician ? [{ role: 'PCP' as CareTeamRole, name: data.careTeamPhysician, email: '' }] : []),
        ...(data.careTeamNurse ? [{ role: 'Nurse' as CareTeamRole, name: data.careTeamNurse, email: '' }] : []),
        ...(data.careTeamDHN ? [{ role: 'DHN' as CareTeamRole, name: data.careTeamDHN, email: '' }] : []),
      ],
      alerts: isEdit ? (editPatient?.alerts ?? []) : [],
    };

    if (isEdit) {
      // Update existing list item
      const existingList = secureLocalStorage.getItemObject<PatientListItem[]>(PATIENT_LIST_STORAGE_KEY) ?? [];
      persistPatients(existingList.map((p) => (p.id === id ? listItem : p)));

      // Update existing detail
      const existingDetail =
        secureLocalStorage.getItemObject<Record<string, PatientDetailData>>(PATIENT_DETAIL_STORAGE_KEY) ?? {};
      persistDetail({ ...existingDetail, [id]: detailData });

      onUpdated?.(listItem);
    } else {
      // Persist new list item
      const existingList = secureLocalStorage.getItemObject<PatientListItem[]>(PATIENT_LIST_STORAGE_KEY) ?? [];
      persistPatients([listItem, ...existingList]);

      // Persist new detail
      const existingDetail =
        secureLocalStorage.getItemObject<Record<string, PatientDetailData>>(PATIENT_DETAIL_STORAGE_KEY) ?? {};
      persistDetail({ ...existingDetail, [id]: detailData });

      onEnrolled(listItem);
    }

    const code = generateInviteCode();
    setInviteCode(code);
    setEnrolledName(fullName);
    setEnrolledEmail(step1Data.email);
    setStep('success');
  }

  const editClinicalDefaults = editPatient
    ? {
        careTeamPhysician: editPatient.careTeam.find((m) => m.role === 'PCP')?.name ?? '',
        careTeamNurse: editPatient.careTeam.find((m) => m.role === 'Nurse')?.name ?? '',
        careTeamDHN: editPatient.careTeam.find((m) => m.role === 'DHN')?.name ?? '',
      }
    : undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className={cn('sm:max-w-[540px] max-h-[90vh] overflow-y-auto', step === 'success' && 'p-0')}>
        {step === 'success' ? (
          <SuccessView
            patientName={enrolledName}
            email={enrolledEmail}
            inviteCode={inviteCode}
            isEdit={isEdit}
            onClose={handleClose}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-[15px] font-bold">
                {isEdit ? 'Edit Patient' : ehrPrefill ? `EHR Import — ${ehrPrefill.ehrName}` : 'Enroll New Patient'}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-2">
              <StepIndicator current={step} />

              {step === 1 && (
                <DemographicsStep
                  defaultValues={step1Data ?? ehrPrefill?.step1 ?? editStep1Defaults}
                  onNext={handleStep1}
                />
              )}
              {step === 2 && (
                <InsuranceStep
                  defaultValues={step2Data ?? ehrStep2Prefill ?? ehrPrefill?.step2 ?? editStep2Defaults}
                  onBack={() => setStep(1)}
                  onNext={handleStep2}
                />
              )}
              {step === 3 && (
                <EmergencyContactStep
                  defaultValues={step3Data ?? editStep3Defaults}
                  onBack={() => setStep(2)}
                  onNext={handleStep3}
                />
              )}
              {step === 4 && (
                <MedicalConditionStep
                  defaultDiagnoses={step4Data?.diagnoses ?? editPatient?.diagnoses}
                  defaultProgramRPM={step4Data?.programRPM ?? editPatient?.programs.includes('RPM')}
                  defaultProgramACPM={step4Data?.programACPM ?? editPatient?.programs.includes('APCM')}
                  defaultProgramBHI={step4Data?.programBHI ?? editPatient?.programs.includes('BHI')}
                  isEdit={isEdit}
                  onBack={() => setStep(3)}
                  onNext={handleStep4}
                />
              )}
              {step === 5 && (
                <CareTeamStep
                  defaultValues={editClinicalDefaults}
                  isEdit={isEdit}
                  onBack={() => setStep(4)}
                  onSubmit={handleStep5}
                  physicians={physicians}
                  nurses={nurses}
                  dhns={dhns}
                />
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
