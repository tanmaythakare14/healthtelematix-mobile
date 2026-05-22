import React from 'react';
import { cn } from '@/lib/utils';

// ─── Metric data ──────────────────────────────────────────────────────────────

interface QualityMetric {
  id: string;
  label: string;
  description: string;
  value: number; // percentage 0–100
  target: number;
}

const QUALITY_METRICS: QualityMetric[] = [
  {
    id: 'bp-controlled',
    label: 'BP Controlled',
    description: 'Patients with BP < 130/80 mmHg',
    value: 72,
    target: 80,
  },
  {
    id: 'a1c-control',
    label: 'A1c Under Control',
    description: 'Patients with A1c < 8%',
    value: 64,
    target: 75,
  },
  {
    id: 'wellness-visit',
    label: 'Annual Wellness Visit',
    description: 'Completed annual wellness exam',
    value: 81,
    target: 85,
  },
];

// ─── Performance tier helpers ─────────────────────────────────────────────────

type Tier = 'good' | 'moderate' | 'low';

function getTier(value: number, target: number): Tier {
  const ratio = value / target;
  if (ratio >= 0.95) return 'good';
  if (ratio >= 0.8) return 'moderate';
  return 'low';
}

const TIER_STYLES: Record<Tier, { bar: string; badge: string; label: string }> = {
  good: { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'On Track' },
  moderate: { bar: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Near Target' },
  low: { bar: 'bg-rose-400', badge: 'bg-rose-50 text-rose-600 border-rose-200', label: 'Below Target' },
};

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({ metric }: { metric: QualityMetric }): React.JSX.Element {
  const tier = getTier(metric.value, metric.target);
  const styles = TIER_STYLES[tier];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-foreground leading-tight">{metric.label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{metric.description}</p>
      </div>

      {/* Value */}
      <p className="text-[1.35rem] font-bold leading-none text-foreground">{metric.value}%</p>

      {/* Progress bar */}
      <div>
        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', styles.bar)}
            style={{ width: `${metric.value}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QualityMetrics(): React.JSX.Element {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div>
        <h3 className="text-[15px] font-semibold text-foreground">Quality Measures</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          HEDIS-aligned clinical quality metrics across enrolled population
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4">
        {QUALITY_METRICS.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
}
