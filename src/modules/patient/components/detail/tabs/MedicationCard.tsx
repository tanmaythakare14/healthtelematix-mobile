import React from 'react';
import { ClipboardList, Database, Pill, Stethoscope, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MedicationStatus = 'active' | 'inactive';
export type MealTime = 'Before Meal' | 'After Meal' | 'With Meal' | 'No Restriction';
export type Frequency = 'Once Daily' | 'Twice Daily' | 'Three Times Daily' | 'Every 8 Hours' | 'As Needed' | 'Weekly';
export type MedicationCondition =
  | 'Diabetes'
  | 'Hypertension'
  | 'Heart Failure'
  | 'Obesity'
  | 'Atrial Fibrillation'
  | 'Other';
export type MedicationSource = 'EHR Imported' | 'Provider Added' | 'Patient Added';

export interface Medication {
  id: string;
  drugName: string;
  dosageMg: number;
  unit: string;
  pillsPerDose: number;
  mealTime: MealTime;
  startDate: string;
  endDate: string | null;
  frequency: Frequency;
  prescribedBy: string;
  prescribedBySpecialty: string;
  status: MedicationStatus;
  condition: MedicationCondition;
  source: MedicationSource;
  linkedCarePlan: string | null;
  notes?: string;
}

// ─── Source config ────────────────────────────────────────────────────────────

export const SOURCE_CONFIG: Record<MedicationSource, { style: string; Icon: React.ElementType; label: string }> = {
  'EHR Imported': { style: 'bg-blue-50 text-blue-700 border-blue-100', Icon: Database, label: 'EHR' },
  'Provider Added': { style: 'bg-teal-50 text-teal-700 border-teal-100', Icon: Stethoscope, label: 'Doctor' },
  'Patient Added': { style: 'bg-violet-50 text-violet-700 border-violet-100', Icon: User, label: 'Patient' },
};

// ─── Condition chip colours ───────────────────────────────────────────────────

export const CONDITION_CHIP: Record<MedicationCondition, string> = {
  Diabetes: 'bg-amber-50 text-amber-700 border-amber-200',
  Hypertension: 'bg-rose-50 text-rose-700 border-rose-200',
  'Heart Failure': 'bg-sky-50 text-sky-700 border-sky-200',
  Obesity: 'bg-teal-50 text-teal-700 border-teal-200',
  'Atrial Fibrillation': 'bg-purple-50 text-purple-700 border-purple-200',
  Other: 'bg-slate-100 text-slate-600 border-slate-300',
};

// ─── Info chip ────────────────────────────────────────────────────────────────

function InfoChip({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn(className)}>
      <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">{label}</p>
      <p className="text-[13px] font-medium text-foreground mt-0.5">{value}</p>
    </div>
  );
}

// ─── Medication Card ──────────────────────────────────────────────────────────

export interface MedicationCardProps {
  med: Medication;
}

export function MedicationCard({ med }: MedicationCardProps): React.JSX.Element {
  const src = SOURCE_CONFIG[med.source];

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-xs p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          <Pill size={18} className="text-slate-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-[14.5px] font-bold text-foreground leading-tight truncate">{med.drugName}</h4>
            {/* Condition chip + Care plan badge */}
            <div className="flex items-center gap-1 shrink-0">
              <span
                className={cn(
                  'inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded-full border',
                  CONDITION_CHIP[med.condition]
                )}
              >
                {med.condition}
              </span>
              {med.linkedCarePlan && (
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 max-w-[130px]"
                  title={med.linkedCarePlan}
                >
                  <ClipboardList size={9} className="shrink-0" />
                  <span className="truncate">{med.linkedCarePlan}</span>
                </span>
              )}
            </div>
          </div>
          <p className="text-[12px] text-muted-foreground">
            {med.dosageMg} {med.unit} &middot; {med.pillsPerDose} {med.pillsPerDose === 1 ? 'pill' : 'pills'} per dose
          </p>
        </div>
      </div>

      {/* Details row 1: Frequency | Start Date | End Date */}
      <div className="grid grid-cols-3 divide-x divide-slate-100">
        <InfoChip label="Frequency" value={med.frequency} className="pr-4" />
        <InfoChip label="Start Date" value={med.startDate} className="px-4" />
        <InfoChip label="End Date" value={med.endDate ?? 'Ongoing'} className="pl-4" />
      </div>

      {/* Details row 2: Meal Time | Added By (aligned under Start Date) */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 mt-4 pt-4 border-t border-slate-100">
        <InfoChip label="Meal Time" value={med.mealTime} className="pr-4" />
        <InfoChip label="Added By" value={src.label} className="px-4" />
      </div>
    </div>
  );
}
