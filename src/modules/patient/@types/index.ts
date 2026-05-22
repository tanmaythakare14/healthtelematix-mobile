export type ProgramType = 'APCM' | 'RPM' | 'BHI';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertType = 'vitals' | 'device' | 'ai';
export type DiagnosisSeverity = 'Mild' | 'Moderate' | 'Severe';
export type CareTeamRole = 'PCP' | 'Nurse' | 'DHN';

export interface PatientDTO {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  email?: string;
  phone?: string;
  primaryCarePhysician?: { fullName: string };
  programs: ProgramType[];
}

export interface PatientListItem {
  id: string;
  mrn: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  pcpName: string;
  programs: ProgramType[];
  status: 'Active' | 'Pending' | 'Deactivated';
  deactivatedOn?: string;
}

export interface PatientAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
}

export interface Diagnosis {
  conditionName: string;
  icdCode: string;
  severity: DiagnosisSeverity;
}

export interface InsuranceInfo {
  planName: string;
  planType: string;
  memberId: string;
  groupNumber: string;
  secondaryInsurance?: string;
  secondaryMemberId?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface CareTeamMember {
  role: CareTeamRole;
  name: string;
  email: string;
}

// ─── Enrollment Form Types ────────────────────────────────────────────────────

export interface DiagnosisFormItem {
  conditionName: string;
  icdCode: string;
  severity: DiagnosisSeverity;
}

export interface EnrollmentStep1Values {
  firstName: string;
  lastName: string;
  mrn: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  pcpName?: string;
  profilePicture?: string;
  zipCode: string;
  country: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  address?: string;
}

export interface EnrollmentStep2Values {
  insurancePlanName: string;
  planType: string;
  memberId: string;
  groupNumber: string;
  hasSecondaryInsurance: boolean;
  secondaryInsurance?: string;
  secondaryMemberId?: string;
}

export interface EmergencyContactStepValues {
  contacts: EmergencyContact[];
}

export interface MedicalConditionStepValues {
  diagnoses: DiagnosisFormItem[];
  programRPM: boolean;
  programACPM: boolean;
  programBHI: boolean;
}

export interface EnrollmentStep3Values {
  careTeamPhysician: string;
  careTeamNurse: string;
  careTeamDHN: string;
  diagnoses: DiagnosisFormItem[];
  programRPM: boolean;
  programACPM: boolean;
  programBHI: boolean;
}

export interface PatientDetailData {
  id: string;
  mrn: string;
  fullName: string;
  dateOfBirth: string;
  dobIso?: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  addressCountry?: string;
  pcpName: string;
  programs: ProgramType[];
  insurance: InsuranceInfo;
  diagnoses: Diagnosis[];
  emergencyContacts: EmergencyContact[];
  careTeam: CareTeamMember[];
  alerts: PatientAlert[];
}
