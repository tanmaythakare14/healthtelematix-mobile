import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User2, Shield, Phone, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { secureLocalStorage } from '@/utils/secureStorage';
import type {
  EnrollmentStep1Values,
  EnrollmentStep2Values,
  EmergencyContactStepValues,
  EnrollmentStep3Values,
  PatientListItem,
  PatientDetailData,
  ProgramType,
  CareTeamRole,
  InsuranceInfo,
} from '../../@types';
import { PATIENT_LIST_STORAGE_KEY, PATIENT_DETAIL_STORAGE_KEY } from '../../constants';
import { USER_LIST_STORAGE_KEY } from '@/modules/user-management/constants';
import type { UserListItem } from '@/modules/user-management/@types';
import { DemographicsStep } from '../enrollment/steps/DemographicsStep';
import { InsuranceStep } from '../enrollment/steps/InsuranceStep';
import { EmergencyContactStep } from '../enrollment/steps/EmergencyContactStep';
import { ClinicalStep } from '../enrollment/steps/ClinicalStep';

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

function formattedDateToISO(formatted: string): string {
  if (!formatted || formatted === '—') return '';
  const d = new Date(formatted);
  if (isNaN(d.getTime())) return '';
  return format(d, 'yyyy-MM-dd');
}

function buildDetailFromStored(item: PatientListItem): PatientDetailData {
  return {
    id: item.id,
    mrn: item.mrn,
    fullName: item.fullName,
    dateOfBirth: item.dateOfBirth,
    gender: item.gender,
    email: item.email,
    phone: item.phone,
    address: '',
    pcpName: item.pcpName,
    programs: item.programs,
    insurance: { planName: '', planType: '', memberId: '', groupNumber: '' },
    diagnoses: [],
    emergencyContacts: [],
    careTeam: [{ role: 'PCP', name: item.pcpName, email: '' }],
    alerts: [],
  };
}

// ─── Tab config ───────────────────────────────────────────────────────────────

type EditTab = 'personal' | 'insurance' | 'emergency' | 'clinical';

const EDIT_TABS: {
  id: EditTab;
  label: string;
  description: string;
  Icon: React.ElementType;
}[] = [
  {
    id: 'personal',
    label: 'Personal Info',
    description: 'Name, contact details & address',
    Icon: User2,
  },
  {
    id: 'insurance',
    label: 'Insurance',
    description: 'Coverage plan & secondary insurance',
    Icon: Shield,
  },
  {
    id: 'emergency',
    label: 'Emergency Contacts',
    description: 'Emergency contacts & relationships',
    Icon: Phone,
  },
  {
    id: 'clinical',
    label: 'Clinical Details',
    description: 'Care team, diagnoses & enrolled programs',
    Icon: Stethoscope,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function EditPatientPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<EditTab>('personal');

  // ── Load patient ──────────────────────────────────────────────────────────
  const allDetail =
    secureLocalStorage.getItemObject<Record<string, PatientDetailData>>(PATIENT_DETAIL_STORAGE_KEY) ?? {};
  const allPatients = secureLocalStorage.getItemObject<PatientListItem[]>(PATIENT_LIST_STORAGE_KEY) ?? [];
  const found = allPatients.find((p) => p.id === id);
  const patient: PatientDetailData | null = allDetail[id!] ?? (found ? buildDetailFromStored(found) : null);

  // ── Load staff ────────────────────────────────────────────────────────────
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

  // ── Not found guard ───────────────────────────────────────────────────────
  if (!patient) {
    return (
      <div className="h-screen overflow-hidden flex bg-[#FAFAF9]">
        <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />
        <div
          className={cn(
            'flex-1 flex flex-col items-center justify-center gap-3 transition-[margin-left] duration-[220ms] ease-in-out',
            navCollapsed ? 'ml-[60px]' : 'ml-60'
          )}
        >
          <p className="text-sm font-medium text-muted-foreground">Patient not found.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/patients')}>
            Back to Patient List
          </Button>
        </div>
      </div>
    );
  }

  // ── Pre-fill defaults for each section ───────────────────────────────────
  const step1Defaults: Partial<EnrollmentStep1Values> = {
    firstName: patient.fullName.split(' ')[0] ?? '',
    lastName: patient.fullName.split(' ').slice(1).join(' ') ?? '',
    mrn: patient.mrn,
    dateOfBirth: patient.dobIso ?? formattedDateToISO(patient.dateOfBirth),
    gender: patient.gender,
    email: patient.email,
    phone: patient.phone,
    pcpName: patient.pcpName,
    addressLine1: patient.addressLine1 ?? patient.address,
    addressLine2: patient.addressLine2 ?? '',
    zipCode: patient.addressZipCode ?? '',
    country: patient.addressCountry ?? '',
    state: patient.addressState ?? '',
    city: patient.addressCity ?? '',
  };

  const step2Defaults: Partial<EnrollmentStep2Values> = {
    insurancePlanName: patient.insurance.planName === '—' ? '' : patient.insurance.planName,
    planType: patient.insurance.planType === '—' ? '' : patient.insurance.planType,
    memberId: patient.insurance.memberId === '—' ? '' : patient.insurance.memberId,
    groupNumber: patient.insurance.groupNumber === '—' ? '' : patient.insurance.groupNumber,
    hasSecondaryInsurance: !!(patient.insurance.secondaryInsurance && patient.insurance.secondaryInsurance !== '—'),
    secondaryInsurance: patient.insurance.secondaryInsurance ?? '',
    secondaryMemberId: patient.insurance.secondaryMemberId ?? '',
  };

  const step3Defaults: Partial<EmergencyContactStepValues> = {
    contacts:
      patient.emergencyContacts.length > 0 ? patient.emergencyContacts : [{ name: '', phone: '', relationship: '' }],
  };

  const clinicalDefaults = {
    careTeamPhysician: patient.careTeam.find((m) => m.role === 'PCP')?.name ?? '',
    careTeamNurse: patient.careTeam.find((m) => m.role === 'Nurse')?.name ?? '',
    careTeamDHN: patient.careTeam.find((m) => m.role === 'DHN')?.name ?? '',
  };

  // ── Cancel handler ────────────────────────────────────────────────────────
  const handleCancel = () => navigate(`/patients/${id}`);

  // ── Save handlers (each saves only its section) ───────────────────────────

  function handleSavePersonal(data: EnrollmentStep1Values): void {
    const fullName = `${data.firstName} ${data.lastName}`;
    const dob = formatDateOfBirth(data.dateOfBirth);
    const address = [data.addressLine1, data.addressLine2, data.city, data.state, data.zipCode, data.country]
      .filter(Boolean)
      .join(', ');

    // Update list item
    const list = secureLocalStorage.getItemObject<PatientListItem[]>(PATIENT_LIST_STORAGE_KEY) ?? [];
    secureLocalStorage.setItemObject(
      PATIENT_LIST_STORAGE_KEY,
      list.map((p) =>
        p.id === id
          ? {
              ...p,
              mrn: data.mrn,
              fullName,
              dateOfBirth: dob,
              gender: data.gender,
              email: data.email,
              phone: data.phone,
              pcpName: data.pcpName,
            }
          : p
      )
    );

    // Update detail
    const detail =
      secureLocalStorage.getItemObject<Record<string, PatientDetailData>>(PATIENT_DETAIL_STORAGE_KEY) ?? {};
    const current = detail[id!] ?? patient;
    secureLocalStorage.setItemObject(PATIENT_DETAIL_STORAGE_KEY, {
      ...detail,
      [id!]: {
        ...current,
        mrn: data.mrn,
        fullName,
        dateOfBirth: dob,
        dobIso: data.dateOfBirth,
        gender: data.gender,
        email: data.email,
        phone: data.phone,
        pcpName: data.pcpName,
        address,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 ?? '',
        addressCity: data.city,
        addressState: data.state,
        addressZipCode: data.zipCode,
        addressCountry: data.country,
      },
    });

    toast.success('Personal information saved successfully.');
    navigate(`/patients/${id}`);
  }

  function handleSaveInsurance(data: EnrollmentStep2Values): void {
    const insurance: InsuranceInfo = {
      planName: data.insurancePlanName,
      planType: data.planType,
      memberId: data.memberId,
      groupNumber: data.groupNumber,
      secondaryInsurance: data.hasSecondaryInsurance && data.secondaryInsurance ? data.secondaryInsurance : undefined,
      secondaryMemberId: data.hasSecondaryInsurance && data.secondaryMemberId ? data.secondaryMemberId : undefined,
    };

    const detail =
      secureLocalStorage.getItemObject<Record<string, PatientDetailData>>(PATIENT_DETAIL_STORAGE_KEY) ?? {};
    const current = detail[id!] ?? patient;
    secureLocalStorage.setItemObject(PATIENT_DETAIL_STORAGE_KEY, {
      ...detail,
      [id!]: { ...current, insurance },
    });

    toast.success('Insurance information saved successfully.');
    navigate(`/patients/${id}`);
  }

  function handleSaveEmergency(data: EmergencyContactStepValues): void {
    const detail =
      secureLocalStorage.getItemObject<Record<string, PatientDetailData>>(PATIENT_DETAIL_STORAGE_KEY) ?? {};
    const current = detail[id!] ?? patient;
    secureLocalStorage.setItemObject(PATIENT_DETAIL_STORAGE_KEY, {
      ...detail,
      [id!]: { ...current, emergencyContacts: data.contacts },
    });

    toast.success('Emergency contacts saved successfully.');
    navigate(`/patients/${id}`);
  }

  function handleSaveClinical(data: EnrollmentStep3Values): void {
    const programs: ProgramType[] = [
      ...(data.programACPM ? (['APCM'] as ProgramType[]) : []),
      ...(data.programRPM ? (['RPM'] as ProgramType[]) : []),
      ...(data.programBHI ? (['BHI'] as ProgramType[]) : []),
    ];

    const careTeam = [
      ...(data.careTeamPhysician ? [{ role: 'PCP' as CareTeamRole, name: data.careTeamPhysician, email: '' }] : []),
      ...(data.careTeamNurse ? [{ role: 'Nurse' as CareTeamRole, name: data.careTeamNurse, email: '' }] : []),
      ...(data.careTeamDHN ? [{ role: 'DHN' as CareTeamRole, name: data.careTeamDHN, email: '' }] : []),
    ];

    // Update list item programs
    const list = secureLocalStorage.getItemObject<PatientListItem[]>(PATIENT_LIST_STORAGE_KEY) ?? [];
    secureLocalStorage.setItemObject(
      PATIENT_LIST_STORAGE_KEY,
      list.map((p) => (p.id === id ? { ...p, programs } : p))
    );

    // Update detail
    const detail =
      secureLocalStorage.getItemObject<Record<string, PatientDetailData>>(PATIENT_DETAIL_STORAGE_KEY) ?? {};
    const current = detail[id!] ?? patient;
    secureLocalStorage.setItemObject(PATIENT_DETAIL_STORAGE_KEY, {
      ...detail,
      [id!]: { ...current, programs, careTeam, diagnoses: data.diagnoses },
    });

    toast.success('Clinical details saved successfully.');
    navigate(`/patients/${id}`);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const activeTabConfig = EDIT_TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="h-screen overflow-hidden flex bg-[#FAFAF9]">
      <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 overflow-hidden transition-[margin-left] duration-[220ms] ease-in-out',
          navCollapsed ? 'ml-[60px]' : 'ml-60'
        )}
      >
        <TopBar title="Patient Management" subtitle="Edit Patient" />

        <div className="flex-1 overflow-hidden flex flex-col px-7 pt-5 pb-7 gap-4">
          {/* ── Back link ── */}
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors w-fit shrink-0"
          >
            <ArrowLeft size={14} />
            Back to {patient.fullName}
          </button>

          {/* ── Main edit card — flex-1, contains tabs + scrollable form ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Tab navigation */}
            <div className="border-b border-slate-200 px-6 shrink-0">
              <nav className="flex">
                {EDIT_TABS.map(({ id: tabId, label, Icon }) => (
                  <button
                    key={tabId}
                    type="button"
                    onClick={() => setActiveTab(tabId)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3.5 text-[13px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                      activeTab === tabId
                        ? 'border-primary text-primary font-semibold'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-slate-300'
                    )}
                  >
                    <Icon size={14} className="shrink-0" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab content area — section heading + scrollable form */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {/* Section heading (fixed, above scroll) */}
              <div className="px-8 pt-6 pb-4 shrink-0 border-b border-slate-50">
                <h2 className="text-[15px] font-bold text-foreground">{activeTabConfig.label}</h2>
                <p className="text-[12.5px] text-muted-foreground mt-0.5">{activeTabConfig.description}</p>
              </div>

              {/* Scrollable form container — sticky bottom bar sticks here */}
              <div className="flex-1 overflow-y-auto px-8 pt-5 pb-0">
                {/* Personal Info */}
                <div className={cn(activeTab !== 'personal' && 'hidden')}>
                  <DemographicsStep
                    defaultValues={step1Defaults}
                    onNext={handleSavePersonal}
                    mode="edit"
                    onCancel={handleCancel}
                  />
                </div>

                {/* Insurance */}
                <div className={cn(activeTab !== 'insurance' && 'hidden')}>
                  <InsuranceStep
                    defaultValues={step2Defaults}
                    onBack={handleCancel}
                    onNext={handleSaveInsurance}
                    mode="edit"
                    onCancel={handleCancel}
                  />
                </div>

                {/* Emergency Contacts */}
                <div className={cn(activeTab !== 'emergency' && 'hidden')}>
                  <EmergencyContactStep
                    defaultValues={step3Defaults}
                    onBack={handleCancel}
                    onNext={handleSaveEmergency}
                    mode="edit"
                    onCancel={handleCancel}
                  />
                </div>

                {/* Clinical Details */}
                <div className={cn(activeTab !== 'clinical' && 'hidden')}>
                  <ClinicalStep
                    defaultValues={clinicalDefaults}
                    defaultDiagnoses={patient.diagnoses}
                    defaultProgramRPM={patient.programs.includes('RPM')}
                    defaultProgramACPM={patient.programs.includes('APCM')}
                    defaultProgramBHI={patient.programs.includes('BHI')}
                    isEdit={true}
                    onBack={handleCancel}
                    onSubmit={handleSaveClinical}
                    physicians={physicians}
                    nurses={nurses}
                    dhns={dhns}
                    onCancel={handleCancel}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
