import React, { useState } from 'react';
import { Activity, Bluetooth, ClipboardList, FileText, Pill, RefreshCw, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusTabs } from '@/components/status-tabs';
import type { Medication } from './MedicationCard';

// ─── Types ────────────────────────────────────────────────────────────────────

type CarePlanTemplate = 'Obesity' | 'Hypertension' | 'Diabetes' | 'Heart Failure' | 'Comprehensive' | 'Custom';
type ItemStatus = 'active' | 'completed';
type Priority = 'High' | 'Medium' | 'Low';
type ActivityCategory = 'Monitoring' | 'Medication' | 'Lifestyle' | 'Follow-up' | 'Education';

type RPMDevice = 'Blood Pressure Cuff' | 'CGM (Dexcom / FreeStyle Libre)' | 'Weight Scale' | 'Pulse Oximeter';

interface CarePlanGoal {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ItemStatus;
  progress: number;
  metric: string;
  current: string;
  target: string;
  priority: Priority;
  condition: string;
  device: RPMDevice;
}

interface CarePlanActivity {
  id: string;
  goalId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ItemStatus;
  progress: number;
  metric: string;
  current: string;
  target: string;
  priority: Priority;
  frequency: string;
  category: ActivityCategory;
}

interface CarePlan {
  id: string;
  template: CarePlanTemplate;
  name: string;
  description: string;
  touchpointFrequency: string;
  startDate: string;
  endDate: string;
  goals: CarePlanGoal[];
  activities: CarePlanActivity[];
  notes?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CARE_PLAN: CarePlan = {
  id: 'cp-001',
  template: 'Comprehensive',
  name: 'Chronic Disease Management Care Plan',
  description:
    'A comprehensive care plan addressing Hypertension, Type 2 Diabetes, and Heart Failure through remote patient monitoring, medication adherence, lifestyle interventions, and regular clinical touchpoints. All goals and monitoring activities are directly tied to the three assigned RPM devices — Blood Pressure Cuff, CGM (Dexcom / FreeStyle Libre), and Weight Scale.',
  touchpointFrequency: 'Bi-weekly',
  startDate: 'Jan 10, 2024',
  endDate: 'Jan 10, 2025',
  goals: [
    {
      id: 'g-001',
      name: 'Blood Pressure Control',
      description:
        'Maintain systolic BP consistently below 130 mmHg and diastolic below 80 mmHg through Lisinopril adherence, low-sodium diet, and twice-daily readings via the Blood Pressure Cuff. Nurse escalation triggered if systolic >180 mmHg.',
      startDate: 'Jan 10, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
      progress: 68,
      metric: 'Systolic / Diastolic (mmHg)',
      current: '128/82 mmHg',
      target: '< 130/80 mmHg',
      priority: 'High',
      condition: 'Hypertension',
      device: 'Blood Pressure Cuff',
    },
    {
      id: 'g-002',
      name: 'Fasting Blood Glucose Management',
      description:
        'Maintain fasting blood glucose within 70–130 mg/dL daily, tracked continuously via CGM (Dexcom / FreeStyle Libre). Weekly nurse review of CGM trend data. Escalation alert auto-triggered if reading exceeds 250 mg/dL.',
      startDate: 'Feb 05, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
      progress: 72,
      metric: 'Fasting Glucose (mg/dL)',
      current: '118 mg/dL',
      target: '70–130 mg/dL',
      priority: 'High',
      condition: 'Diabetes',
      device: 'CGM (Dexcom / FreeStyle Libre)',
    },
    {
      id: 'g-004',
      name: 'Body Weight Reduction — 5% Target',
      description:
        'Achieve a minimum 5% reduction in body weight over 12 months through supervised dietary changes, sodium restriction, and an aerobic exercise program. Progress tracked daily via assigned Weight Scale.',
      startDate: 'Feb 01, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
      progress: 45,
      metric: 'Body Weight (lbs)',
      current: '184 lbs',
      target: '≤ 174 lbs',
      priority: 'Medium',
      condition: 'Heart Failure',
      device: 'Weight Scale',
    },
    {
      id: 'g-005',
      name: 'Reduce Resting Heart Rate',
      description:
        'Achieve and maintain a resting heart rate below 80 bpm through Lisinopril adherence, stress reduction techniques, and a structured aerobic exercise program. Monitored via twice-daily Blood Pressure Cuff readings.',
      startDate: 'Mar 01, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
      progress: 38,
      metric: 'Resting Heart Rate (bpm)',
      current: '88 bpm',
      target: '< 80 bpm',
      priority: 'Medium',
      condition: 'Hypertension',
      device: 'Blood Pressure Cuff',
    },
    {
      id: 'g-006',
      name: 'Establish Consistent CGM Reading Compliance',
      description:
        'Achieve 95% or above daily CGM reading compliance over a continuous 60-day period using the Dexcom / FreeStyle Libre. Baseline logging habits confirmed and validated by the care team at the 60-day review.',
      startDate: 'Jan 10, 2024',
      endDate: 'Mar 10, 2024',
      status: 'completed',
      progress: 100,
      metric: 'CGM Compliance Rate',
      current: '97%',
      target: '≥ 95%',
      priority: 'High',
      condition: 'Diabetes',
      device: 'CGM (Dexcom / FreeStyle Libre)',
    },
    {
      id: 'g-007',
      name: 'Reduce Systolic BP Below 140 mmHg',
      description:
        'Achieve an initial reduction of systolic blood pressure below 140 mmHg as a first-phase milestone, through Lisinopril titration and sodium-restricted diet. Goal confirmed at the 3-month clinical review.',
      startDate: 'Jan 10, 2024',
      endDate: 'Apr 10, 2024',
      status: 'completed',
      progress: 100,
      metric: 'Systolic BP (mmHg)',
      current: '136 mmHg',
      target: '< 140 mmHg',
      priority: 'High',
      condition: 'Hypertension',
      device: 'Blood Pressure Cuff',
    },
  ],
  activities: [
    {
      id: 'a-001',
      goalId: 'g-001',
      name: 'Twice-Daily BP Readings — Blood Pressure Cuff',
      description:
        'Patient records BP and resting heart rate at 7 AM and 7 PM using the Blood Pressure Cuff. Readings auto-sync to the portal.',
      startDate: 'Jan 10, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
      progress: 82,
      metric: 'Compliance Rate',
      current: '82%',
      target: '≥ 90%',
      priority: 'High',
      frequency: 'Twice Daily (7 AM & 7 PM)',
      category: 'Monitoring',
    },
    {
      id: 'a-002',
      goalId: 'g-002',
      name: 'Daily Fasting & Post-Meal CGM Logging',
      description:
        'CGM continuously logs glucose. Patient confirms fasting reading each morning and 2-hour post-meal readings after each main meal.',
      startDate: 'Feb 05, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
      progress: 78,
      metric: 'Daily Readings Logged',
      current: '78%',
      target: '≥ 95%',
      priority: 'High',
      frequency: '4× Daily (Fasting + After Each Meal)',
      category: 'Monitoring',
    },
    {
      id: 'a-003',
      goalId: 'g-004',
      name: 'Morning Weight Check — Weight Scale',
      description: 'Patient steps on the Weight Scale each morning before eating or drinking. Readings auto-sync.',
      startDate: 'Feb 01, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
      progress: 91,
      metric: 'Daily Check Compliance',
      current: '91%',
      target: '≥ 95%',
      priority: 'High',
      frequency: 'Once Daily (Morning)',
      category: 'Monitoring',
    },
    {
      id: 'a-004',
      goalId: 'g-005',
      name: 'Structured Aerobic Exercise & HR Tracking',
      description: 'Patient completes 150 minutes per week of moderate-intensity aerobic activity (walking, cycling).',
      startDate: 'Mar 01, 2024',
      endDate: 'Jan 10, 2025',
      status: 'active',
      progress: 55,
      metric: 'Weekly Exercise Minutes',
      current: '83 min',
      target: '150 min / week',
      priority: 'Medium',
      frequency: 'Weekly Tracking',
      category: 'Lifestyle',
    },
    {
      id: 'a-005',
      goalId: 'g-001',
      name: 'Lisinopril Titration & BP Response Review',
      description:
        'Completed 8-week structured titration of Lisinopril from 5 mg to 10 mg daily, with weekly BP Cuff readings reviewed by RN Maria Chen.',
      startDate: 'Jan 10, 2024',
      endDate: 'Mar 05, 2024',
      status: 'completed',
      progress: 100,
      metric: 'Completion',
      current: 'Done',
      target: '1 review cycle',
      priority: 'High',
      frequency: 'Weekly Reviews',
      category: 'Medication',
    },
    {
      id: 'a-006',
      goalId: 'g-002',
      name: 'CGM Calibration & Accuracy Validation',
      description:
        'Completed initial CGM calibration. Sensor accuracy validated against fingerstick readings over a 14-day period.',
      startDate: 'Feb 05, 2024',
      endDate: 'Feb 19, 2024',
      status: 'completed',
      progress: 100,
      metric: 'Completion',
      current: 'Done',
      target: '14-day validation',
      priority: 'High',
      frequency: 'One-Time',
      category: 'Monitoring',
    },
  ],
  notes:
    'Patient shows strong motivation and good family support — reinforce positive behavior at every clinical touchpoint. RPM compliance is strongest for Weight Scale (91%) and CGM morning readings (88%); BP Cuff adherence (82%) and medication self-report (78%) need improvement. RN Maria Chen to initiate an unscheduled escalation call if systolic BP >180 mmHg on 2 consecutive readings, weight gain >2 lbs/day, or fasting glucose >250 mg/dL. PCP Dr. Marcus Reid to re-evaluate all plan goals at the 12-month mark and update targets based on updated HbA1c, BNP, and LDL lab results.',
};

// ─── Care Plan Medications ────────────────────────────────────────────────────

const CARE_PLAN_MEDICATIONS: Medication[] = [
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
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toMDY(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${d.getFullYear()}`;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CONDITION_CHIP_STYLE: Record<string, string> = {
  Diabetes: 'bg-amber-50 text-amber-700 border-amber-200',
  Hypertension: 'bg-rose-50 text-rose-700 border-rose-200',
  'Heart Failure': 'bg-sky-50 text-sky-700 border-sky-200',
  Obesity: 'bg-teal-50 text-teal-700 border-teal-200',
  'Atrial Fibrillation': 'bg-purple-50 text-purple-700 border-purple-200',
  Other: 'bg-slate-100 text-slate-600 border-slate-300',
};

const CATEGORY_STYLE: Record<ActivityCategory, string> = {
  Monitoring: 'text-sky-600 bg-sky-50 border-sky-100',
  Medication: 'text-violet-600 bg-violet-50 border-violet-100',
  Lifestyle: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  'Follow-up': 'text-amber-600 bg-amber-50 border-amber-100',
  Education: 'text-teal-600 bg-teal-50 border-teal-100',
};

// ─── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({ activity }: { activity: CarePlanActivity }): React.JSX.Element {
  const catStyle = CATEGORY_STYLE[activity.category];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-4 flex flex-col gap-3">
      {/* Row 1: icon + name inline, category badge right */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
            <Activity size={13} className="text-sky-500" />
          </div>
          <p className="text-[13px] font-semibold text-foreground leading-snug">{activity.name}</p>
        </div>
        <span className={cn('text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0', catStyle)}>
          {activity.category}
        </span>
      </div>

      {/* Frequency — labeled field */}
      <div className="pt-2.5 border-t border-slate-100">
        <p className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1">Frequency</p>
        <p className="text-[12.5px] font-medium text-foreground">{activity.frequency}</p>
      </div>
    </div>
  );
}

// ─── Section Divider ──────────────────────────────────────────────────────────

function SectionDivider({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <p className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-[0.1em]">{label}</p>
      <span className="text-[10px] font-semibold text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded-full leading-none">
        {count}
      </span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

// ─── Goal Medication Card ─────────────────────────────────────────────────────

function GoalMedicationCard({ med }: { med: Medication }): React.JSX.Element {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            <Pill size={13} className="text-violet-500" />
          </div>
          <p className="text-[13px] font-semibold text-foreground leading-snug">{med.drugName}</p>
        </div>
        <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 text-violet-600 bg-violet-50 border-violet-100">
          Medication
        </span>
      </div>
      <div className="pt-2.5 border-t border-slate-100">
        <p className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1">Details</p>
        <p className="text-[12.5px] font-medium text-foreground">
          {med.dosageMg}
          {med.unit} · {med.pillsPerDose} pill per dose · {med.frequency} · {med.mealTime}
        </p>
      </div>
    </div>
  );
}

// ─── Goal Accordion ───────────────────────────────────────────────────────────

function GoalAccordion({
  goal,
  relatedActivities,
  relatedMedications,
}: {
  goal: CarePlanGoal;
  relatedActivities: CarePlanActivity[];
  relatedMedications: Medication[];
  defaultOpen?: boolean;
}): React.JSX.Element {
  const condStyle = CONDITION_CHIP_STYLE[goal.condition] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  const activeActivities = relatedActivities.filter((a) => a.status === 'active').slice(0, 2);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
        {/* Goal name */}
        <span className="flex-1 min-w-0 text-[13.5px] font-semibold text-foreground leading-snug">{goal.name}</span>

        {/* Condition chip */}
        <span className={cn('text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0', condStyle)}>
          {goal.condition}
        </span>

        {/* Device chip */}
        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 bg-slate-800 text-white border-slate-700">
          <Bluetooth size={9} />
          {goal.device}
        </span>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-6 space-y-6">
        {/* ── 1. Goal Details ──────────────────────────────────── */}
        <div>
          <p className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2.5">Goal Details</p>
          <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-4">{goal.description}</p>
          <div className="grid grid-cols-4 rounded-xl border border-slate-100 overflow-hidden divide-x divide-slate-100 bg-slate-50/50">
            {[
              { label: 'Start Date', value: toMDY(goal.startDate) },
              { label: 'End Date', value: toMDY(goal.endDate) },
              { label: 'Current', value: goal.current },
              { label: 'Target', value: goal.target },
            ].map((item) => (
              <div key={item.label} className="px-4 py-3">
                <p className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-1">
                  {item.label}
                </p>
                <p className="text-[13px] font-semibold text-foreground leading-tight">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. Activities & Medications side by side ─────────── */}
        {(activeActivities.length > 0 || relatedMedications.length > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {activeActivities.length > 0 && (
              <div>
                <SectionDivider
                  icon={<Activity size={11} className="text-sky-500 shrink-0" />}
                  label="Activities"
                  count={activeActivities.length}
                />
                <div className="space-y-3">
                  {activeActivities.map((a) => (
                    <ActivityCard key={a.id} activity={a} />
                  ))}
                </div>
              </div>
            )}
            {relatedMedications.length > 0 && (
              <div>
                <SectionDivider
                  icon={<Pill size={11} className="text-violet-500 shrink-0" />}
                  label="Medications"
                  count={relatedMedications.length}
                />
                <div className="space-y-3">
                  {relatedMedications.map((m) => (
                    <GoalMedicationCard key={m.id} med={m} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section Tab Toggle ───────────────────────────────────────────────────────

function SectionTabToggle({
  icon,
  label,
  iconBg,
  iconColor,
  activeCount,
  completedCount,
  selected,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  iconBg: string;
  iconColor: string;
  activeCount: number;
  completedCount: number;
  selected: ItemStatus;
  onSelect: (v: ItemStatus) => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
        <span className={iconColor}>{icon}</span>
      </div>
      <span className="text-[13px] font-bold text-foreground">{label}</span>
      <StatusTabs
        tabs={[
          { value: 'active' as ItemStatus, label: 'Active', count: activeCount },
          { value: 'completed' as ItemStatus, label: 'Completed', count: completedCount },
        ]}
        value={selected}
        onChange={onSelect}
        className="w-fit"
      />
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CarePlanTab(): React.JSX.Element {
  const [goalTab, setGoalTab] = useState<ItemStatus>('active');

  const plan = CARE_PLAN;

  const activeGoals = plan.goals.filter((g) => g.status === 'active');
  const completedGoals = plan.goals.filter((g) => g.status === 'completed');
  const activeActivities = plan.activities.filter((a) => a.status === 'active');
  const completedActivities = plan.activities.filter((a) => a.status === 'completed');

  const [selectedGoalId, setSelectedGoalId] = useState<string>(activeGoals[0]?.id ?? '');

  // Keep selected goal valid when toggling Active ↔ Completed
  const currentList = (goalTab === 'active' ? activeGoals : completedGoals).slice(0, 2);
  const resolvedGoalId = currentList.find((g) => g.id === selectedGoalId)?.id ?? currentList[0]?.id ?? '';
  const selectedGoal = currentList.find((g) => g.id === resolvedGoalId) ?? null;

  const activityByGoal = plan.activities.reduce<Record<string, CarePlanActivity[]>>((acc, a) => {
    acc[a.goalId] = [...(acc[a.goalId] ?? []), a];
    return acc;
  }, {});

  const medsByCondition = CARE_PLAN_MEDICATIONS.reduce<Record<string, Medication[]>>((acc, m) => {
    if (m.condition) acc[m.condition] = [...(acc[m.condition] ?? []), m];
    return acc;
  }, {});

  const planConditions = [...new Set(plan.goals.map((g) => g.condition))];

  // Dot color per condition (for goal tabs)
  const CONDITION_DOT: Record<string, string> = {
    Diabetes: 'bg-amber-400',
    Hypertension: 'bg-rose-400',
    'Heart Failure': 'bg-sky-400',
    Obesity: 'bg-teal-400',
    'Atrial Fibrillation': 'bg-purple-400',
    Other: 'bg-slate-400',
  };

  return (
    <div className="space-y-5">
      {/* ── Plan Header ──────────────────────────────────────────────────────── */}
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
            <ClipboardList size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-foreground leading-tight">{plan.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {planConditions.map((cond) => (
                <span
                  key={cond}
                  className={cn(
                    'inline-flex items-center text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border',
                    CONDITION_CHIP_STYLE[cond] ?? 'bg-slate-100 text-slate-600 border-slate-300'
                  )}
                >
                  {cond}
                </span>
              ))}
              <span className="text-slate-300 text-[11px]">·</span>
              <span className="text-[11.5px] text-muted-foreground">
                {toMDY(plan.startDate)} → {toMDY(plan.endDate)}
              </span>
              <span className="text-slate-300 text-[11px]">·</span>
              <span className="text-[11.5px] text-muted-foreground flex items-center gap-1">
                <RefreshCw size={10} />
                {plan.touchpointFrequency}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        </div>

        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-[12.5px] text-muted-foreground leading-relaxed">{plan.description}</p>
        </div>

        <div className="grid grid-cols-4 divide-x divide-slate-100">
          {[
            { label: 'Active Goals', value: activeGoals.length, accent: 'text-emerald-600' },
            { label: 'Completed Goals', value: completedGoals.length, accent: 'text-slate-400' },
            { label: 'Active Activities', value: activeActivities.length, accent: 'text-blue-600' },
            { label: 'Completed Activities', value: completedActivities.length, accent: 'text-slate-400' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 px-5 py-3.5">
              <span className={cn('text-[26px] font-bold leading-none tabular-nums', stat.accent)}>{stat.value}</span>
              <span className="text-[11.5px] text-muted-foreground leading-tight">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Goals ────────────────────────────────────────────────────────────── */}
      <div>
        {/* Row: label + Active/Completed toggle */}
        <SectionTabToggle
          icon={<Target size={14} />}
          label="Goals"
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          activeCount={activeGoals.length}
          completedCount={completedGoals.length}
          selected={goalTab}
          onSelect={(v) => {
            setGoalTab(v);
            const nextList = v === 'active' ? activeGoals : completedGoals;
            setSelectedGoalId(nextList[0]?.id ?? '');
          }}
        />

        {currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center rounded-2xl border border-slate-100 bg-white">
            <p className="text-[13px] font-semibold text-foreground mb-1">No {goalTab} goals</p>
            <p className="text-[12px] text-muted-foreground">All goals in this category will appear here.</p>
          </div>
        ) : (
          <>
            {/* ── Goal N tabs ── */}
            <div className="flex items-end gap-1 mb-4 border-b border-slate-200 overflow-x-auto">
              {currentList.map((goal, idx) => {
                const isActive = goal.id === resolvedGoalId;
                const dot = CONDITION_DOT[goal.condition] ?? 'bg-slate-400';
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setSelectedGoalId(goal.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2.5 border-b-2 -mb-px transition-colors whitespace-nowrap shrink-0 text-[12px] font-semibold',
                      isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:border-slate-300 hover:text-foreground'
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', isActive ? dot : 'bg-slate-300')} />
                    Goal {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* ── Selected goal detail ── */}
            {selectedGoal && (
              <GoalAccordion
                key={selectedGoal.id}
                goal={selectedGoal}
                relatedActivities={activityByGoal[selectedGoal.id] ?? []}
                relatedMedications={medsByCondition[selectedGoal.condition] ?? []}
                defaultOpen={true}
              />
            )}
          </>
        )}
      </div>

      {/* ── Clinical Notes ───────────────────────────────────────────────────── */}
      {plan.notes && (
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <FileText size={14} className="text-slate-500" />
            </div>
            <span className="text-[13px] font-bold text-foreground">Clinical Notes</span>
            <div className="flex-1 h-px bg-slate-100 ml-1" />
          </div>
          <div className="rounded-[14px] border border-slate-200 bg-white shadow-xs px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="w-1 self-stretch rounded-full bg-slate-200 shrink-0" />
              <p className="text-[13px] text-foreground leading-relaxed">{plan.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
