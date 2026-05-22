export type ProgramType = 'RPM' | 'APCM' | 'BHI';
export type CodeStatus = 'Generated' | 'Pending' | 'Failed';
export type StepRole = 'RN' | 'DHN' | 'Physician' | 'System' | 'Patient';

export interface SessionStep {
  time: string;
  label: string;
  role: StepRole;
  duration: string;
}

export interface SessionTimeline {
  startTime: string;
  endTime: string;
  duration: string;
  steps: SessionStep[];
}

export interface BillingRecord {
  id: string;
  patientFirstName: string;
  patientLastName: string;
  mrn: string;
  pcpName: string;
  npiNumber: string;
  invoiceNumber: string;
  billingMonth: string;
  programs: ProgramType[];
  cptCode: string;
  cptDescription: string;
  generationDate: string;
  status: CodeStatus;
  claimReason: string;
  timeline: SessionTimeline;
}

export interface GeneratedCode {
  id: string;
  cptCode: string;
  description: string;
  status: CodeStatus;
  generatedDate: string;
}
