import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown, Filter, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusTabs } from '@/components/status-tabs';
import {
  MedicationCard,
  SOURCE_CONFIG,
  CONDITION_CHIP,
  type Medication,
  type MedicationCondition,
  type MedicationSource,
} from './MedicationCard';

// ─── Condition display order ──────────────────────────────────────────────────

const CONDITION_ORDER: MedicationCondition[] = [
  'Diabetes',
  'Hypertension',
  'Heart Failure',
  'Obesity',
  'Atrial Fibrillation',
  'Other',
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MEDICATIONS: Medication[] = [
  // ── Diabetes ──
  {
    id: 'm-001',
    drugName: 'Metformin',
    dosageMg: 500,
    unit: 'mg',
    pillsPerDose: 2,
    mealTime: 'After Meal',
    startDate: 'Jan 10, 2024',
    endDate: null,
    frequency: 'Twice Daily',
    prescribedBy: 'Dr. Michael Torres',
    prescribedBySpecialty: 'Internal Medicine',
    status: 'active',
    condition: 'Diabetes',
    source: 'EHR Imported',
    linkedCarePlan: 'Diabetes Management Plan',
  },
  {
    id: 'm-010',
    drugName: 'Empagliflozin',
    dosageMg: 10,
    unit: 'mg',
    pillsPerDose: 1,
    mealTime: 'No Restriction',
    startDate: 'Mar 20, 2024',
    endDate: null,
    frequency: 'Once Daily',
    prescribedBy: 'Dr. Michael Torres',
    prescribedBySpecialty: 'Internal Medicine',
    status: 'active',
    condition: 'Diabetes',
    source: 'Provider Added',
    linkedCarePlan: 'Diabetes Management Plan',
  },
  // ── Hypertension ──
  {
    id: 'm-002',
    drugName: 'Lisinopril',
    dosageMg: 10,
    unit: 'mg',
    pillsPerDose: 1,
    mealTime: 'No Restriction',
    startDate: 'Feb 05, 2024',
    endDate: null,
    frequency: 'Once Daily',
    prescribedBy: 'Dr. Michael Torres',
    prescribedBySpecialty: 'Internal Medicine',
    status: 'active',
    condition: 'Hypertension',
    source: 'EHR Imported',
    linkedCarePlan: 'Hypertension Care Plan',
  },
  {
    id: 'm-003',
    drugName: 'Atorvastatin',
    dosageMg: 20,
    unit: 'mg',
    pillsPerDose: 1,
    mealTime: 'After Meal',
    startDate: 'Mar 01, 2024',
    endDate: null,
    frequency: 'Once Daily',
    prescribedBy: 'Dr. Sarah Kim',
    prescribedBySpecialty: 'Cardiology',
    status: 'active',
    condition: 'Hypertension',
    source: 'Provider Added',
    linkedCarePlan: 'Hypertension Care Plan',
  },
  // ── Heart Failure ──
  {
    id: 'm-011',
    drugName: 'Carvedilol',
    dosageMg: 25,
    unit: 'mg',
    pillsPerDose: 1,
    mealTime: 'With Meal',
    startDate: 'Jan 15, 2024',
    endDate: null,
    frequency: 'Twice Daily',
    prescribedBy: 'Dr. Sarah Kim',
    prescribedBySpecialty: 'Cardiology',
    status: 'active',
    condition: 'Heart Failure',
    source: 'EHR Imported',
    linkedCarePlan: 'Heart Failure Care Plan',
  },
  // ── Other (vitamins, supplements, OTC) ──
  {
    id: 'm-007',
    drugName: 'Vitamin D3',
    dosageMg: 2000,
    unit: 'IU',
    pillsPerDose: 1,
    mealTime: 'With Meal',
    startDate: 'Feb 01, 2024',
    endDate: null,
    frequency: 'Once Daily',
    prescribedBy: 'Self',
    prescribedBySpecialty: 'Patient Reported',
    status: 'active',
    condition: 'Other',
    source: 'Patient Added',
    linkedCarePlan: null,
  },
  // ── Inactive ──
  {
    id: 'm-005',
    drugName: 'Amoxicillin',
    dosageMg: 500,
    unit: 'mg',
    pillsPerDose: 1,
    mealTime: 'Before Meal',
    startDate: 'Oct 10, 2023',
    endDate: 'Oct 20, 2023',
    frequency: 'Three Times Daily',
    prescribedBy: 'Dr. Michael Torres',
    prescribedBySpecialty: 'Internal Medicine',
    status: 'inactive',
    condition: 'Other',
    source: 'EHR Imported',
    linkedCarePlan: null,
    notes: 'Course completed',
  },
  {
    id: 'm-006',
    drugName: 'Prednisone',
    dosageMg: 10,
    unit: 'mg',
    pillsPerDose: 2,
    mealTime: 'With Meal',
    startDate: 'Aug 01, 2023',
    endDate: 'Aug 14, 2023',
    frequency: 'Once Daily',
    prescribedBy: 'Dr. James Patel',
    prescribedBySpecialty: 'Rheumatology',
    status: 'inactive',
    condition: 'Other',
    source: 'Provider Added',
    linkedCarePlan: null,
    notes: 'Tapered and discontinued',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function MedicationTab(): React.JSX.Element {
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');
  const [conditionFilter, setConditionFilter] = useState<MedicationCondition | 'All'>('All');
  const [sourceFilter, setSourceFilter] = useState<MedicationSource | 'All'>('All');
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [conditionDropdownOpen, setConditionDropdownOpen] = useState(false);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  const conditionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(e.target as Node)) {
        setSourceDropdownOpen(false);
      }
      if (conditionDropdownRef.current && !conditionDropdownRef.current.contains(e.target as Node)) {
        setConditionDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const availableConditions = CONDITION_ORDER.filter((cond) =>
    MEDICATIONS.some((m) => m.status === statusFilter && m.condition === cond)
  );

  const filtered = MEDICATIONS.filter(
    (m) =>
      m.status === statusFilter &&
      (conditionFilter === 'All' || m.condition === conditionFilter) &&
      (sourceFilter === 'All' || m.source === sourceFilter)
  );

  const activeCount = MEDICATIONS.filter((m) => m.status === 'active').length;
  const inactiveCount = MEDICATIONS.filter((m) => m.status === 'inactive').length;

  const sourceDisplayLabel = sourceFilter === 'All' ? 'Added By' : SOURCE_CONFIG[sourceFilter].label;

  function handleStatusChange(s: 'active' | 'inactive') {
    setStatusFilter(s);
    const conditionsForStatus = CONDITION_ORDER.filter((c) =>
      MEDICATIONS.some((m) => m.status === s && m.condition === c)
    );
    if (conditionFilter !== 'All' && !conditionsForStatus.includes(conditionFilter as MedicationCondition)) {
      setConditionFilter('All');
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Row 1: Status + filter dropdowns ───────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <StatusTabs
          tabs={[
            { value: 'active', label: 'Active Medications', count: activeCount },
            { value: 'inactive', label: 'Inactive Medications', count: inactiveCount },
          ]}
          value={statusFilter}
          onChange={handleStatusChange}
        />

        {/* Condition + Source dropdowns */}
        <div className="flex items-center gap-2">
          {/* Condition filter */}
          <div ref={conditionDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setConditionDropdownOpen((o) => !o)}
              className={cn(
                'h-9 px-3.5 flex items-center gap-2 rounded-lg border text-sm font-medium transition-colors',
                conditionFilter !== 'All'
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-slate-200 bg-slate-50 text-foreground hover:bg-slate-100'
              )}
            >
              <Filter size={13} />
              {conditionFilter === 'All' ? 'All Conditions' : conditionFilter}
              <ChevronDown
                size={13}
                className={cn(
                  'text-muted-foreground transition-transform duration-150',
                  conditionDropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {conditionDropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden py-1.5">
                {(['All', ...availableConditions] as const).map((opt) => {
                  const isSelected = conditionFilter === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setConditionFilter(opt);
                        setConditionDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium transition-colors text-left',
                        isSelected ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-slate-50'
                      )}
                    >
                      {opt !== 'All' && (
                        <span className={cn('w-2 h-2 rounded-full shrink-0', CONDITION_CHIP[opt].split(' ')[0])} />
                      )}
                      {opt === 'All' ? 'All Conditions' : opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Source filter */}
          <div ref={sourceDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setSourceDropdownOpen((o) => !o)}
              className={cn(
                'h-9 px-3.5 flex items-center gap-2 rounded-lg border text-sm font-medium transition-colors',
                sourceFilter !== 'All'
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-slate-200 bg-slate-50 text-foreground hover:bg-slate-100'
              )}
            >
              <Filter size={13} />
              {sourceDisplayLabel}
              <ChevronDown
                size={13}
                className={cn(
                  'text-muted-foreground transition-transform duration-150',
                  sourceDropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {sourceDropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-40 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden py-1.5">
                {(['All', 'EHR Imported', 'Provider Added', 'Patient Added'] as const).map((opt) => {
                  const isSelected = sourceFilter === opt;
                  const cfg = opt !== 'All' ? SOURCE_CONFIG[opt] : null;
                  const Icon = cfg?.Icon;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSourceFilter(opt);
                        setSourceDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium transition-colors text-left',
                        isSelected ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-slate-50'
                      )}
                    >
                      {Icon && cfg && (
                        <span
                          className={cn('w-5 h-5 rounded flex items-center justify-center border shrink-0', cfg.style)}
                        >
                          <Icon size={11} />
                        </span>
                      )}
                      {opt === 'All' ? 'All' : cfg!.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Pill size={24} className="text-slate-400" />
          </div>
          <p className="text-[13.5px] font-semibold text-foreground">No medications found</p>
          <p className="text-[12px] text-muted-foreground mt-1">Try adjusting the condition or source filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((med) => (
            <MedicationCard key={med.id} med={med} />
          ))}
        </div>
      )}
    </div>
  );
}
