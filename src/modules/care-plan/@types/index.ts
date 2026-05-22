export type CarePlanStatus = 'active' | 'completed';
export type CarePlanProgramType = 'RPM' | 'APCM' | 'BHI';
export type CarePlanCondition =
  | 'Diabetes'
  | 'Hypertension'
  | 'Heart Failure'
  | 'Obesity'
  | 'Atrial Fibrillation'
  | 'Other';

export interface CarePlanDTO {
  id: string;
  name: string;
  conditionName: CarePlanCondition;
  enrolledProgram: CarePlanProgramType;
  shortDescription: string;
  status: CarePlanStatus;
  progress: number;
  startDate: string;
  endDate: string;
  lastUpdated: string;
  completedOn?: string;
  patientId: string;
  assignedBy: string;
}

export interface CarePlanListItem {
  id: string;
  name: string;
  conditionName: CarePlanCondition;
  enrolledProgram: CarePlanProgramType;
  shortDescription: string;
  status: CarePlanStatus;
  progress: number;
  lastUpdated: string;
  completedOn?: string;
  assignedBy: string;
}

export interface CarePlanCardProps {
  plan: CarePlanListItem;
}

export interface CarePlanListProps {
  patientId?: string;
}
