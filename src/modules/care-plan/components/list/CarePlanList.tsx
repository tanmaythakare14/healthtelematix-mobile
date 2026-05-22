import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { StatusTabs } from '@/components/status-tabs';
import { CarePlanCard } from './CarePlanCard';
import type { CarePlanListItem, CarePlanStatus } from '../../@types';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CARE_PLANS: CarePlanListItem[] = [
  {
    id: 'cp-001',
    name: 'Hypertension Management Care Plan',
    conditionName: 'Hypertension',
    enrolledProgram: 'RPM',
    shortDescription:
      'Comprehensive blood pressure monitoring and medication adherence plan with bi-weekly nurse touchpoints and daily BP cuff readings.',
    status: 'active',
    progress: 68,
    lastUpdated: 'May 18, 2026',
    assignedBy: 'Dr. Marcus Reid',
  },
  {
    id: 'cp-002',
    name: 'Type 2 Diabetes Glucose Control Plan',
    conditionName: 'Diabetes',
    enrolledProgram: 'APCM',
    shortDescription:
      'Continuous glucose monitoring with CGM device, dietary coaching, and monthly HbA1c target reviews to maintain fasting glucose within 70–130 mg/dL.',
    status: 'active',
    progress: 45,
    lastUpdated: 'May 20, 2026',
    assignedBy: 'Dr. Sarah Kim',
  },
  {
    id: 'cp-003',
    name: 'Heart Failure Weight & Fluid Management',
    conditionName: 'Heart Failure',
    enrolledProgram: 'RPM',
    shortDescription:
      'Daily weight monitoring via smart scale, fluid intake restriction guidance, and escalation protocol for weight gain exceeding 2 lbs per day.',
    status: 'active',
    progress: 32,
    lastUpdated: 'May 21, 2026',
    assignedBy: 'Dr. Michael Torres',
  },
  {
    id: 'cp-004',
    name: 'Behavioral Health Integration Plan',
    conditionName: 'Other',
    enrolledProgram: 'BHI',
    shortDescription:
      'Monthly behavioral health check-ins, PHQ-9 screening, and care coordination with the assigned Digital Health Navigator.',
    status: 'active',
    progress: 80,
    lastUpdated: 'May 19, 2026',
    assignedBy: 'Dr. Lisa Nguyen',
  },
  {
    id: 'cp-005',
    name: 'Obesity Reduction & Lifestyle Plan',
    conditionName: 'Obesity',
    enrolledProgram: 'APCM',
    shortDescription:
      'Structured 12-month weight reduction program targeting 5% body weight loss through supervised dietary changes and aerobic exercise tracking.',
    status: 'completed',
    progress: 100,
    lastUpdated: 'Jan 10, 2026',
    completedOn: 'Jan 10, 2026',
    assignedBy: 'Dr. Marcus Reid',
  },
  {
    id: 'cp-006',
    name: 'Initial Hypertension Stabilisation Plan',
    conditionName: 'Hypertension',
    enrolledProgram: 'RPM',
    shortDescription:
      'First-phase care plan to reduce systolic BP below 140 mmHg through Lisinopril titration and sodium-restricted dietary guidance over 3 months.',
    status: 'completed',
    progress: 100,
    lastUpdated: 'Apr 10, 2025',
    completedOn: 'Apr 10, 2025',
    assignedBy: 'Dr. Sarah Kim',
  },
];

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
        <ClipboardList size={22} className="text-slate-400" />
      </div>
      <p className="text-[13.5px] font-semibold text-foreground mb-1">No {label} care plans</p>
      <p className="text-[12px] text-muted-foreground">Care plans assigned to this patient will appear here.</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CarePlanList(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<CarePlanStatus>('active');

  const currentPlans = MOCK_CARE_PLANS.filter((p) => p.status === 'active');
  const pastPlans = MOCK_CARE_PLANS.filter((p) => p.status === 'completed');
  const visiblePlans = activeTab === 'active' ? currentPlans : pastPlans;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-foreground leading-tight">Care Plans</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {currentPlans.length} active · {pastPlans.length} completed
          </p>
        </div>
        <StatusTabs
          tabs={[
            { value: 'active' as CarePlanStatus, label: 'Current', count: currentPlans.length },
            { value: 'completed' as CarePlanStatus, label: 'Past', count: pastPlans.length },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* ── Card Grid ── */}
      {visiblePlans.length === 0 ? (
        <EmptyState label={activeTab === 'active' ? 'current' : 'past'} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visiblePlans.map((plan) => (
            <CarePlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
