import React, { useMemo } from 'react';
import {
  Users,
  Activity,
  HeartPulse,
  Percent,
  UserPlus,
  UserMinus,
  Brain,
  ShieldCheck,
  Clock,
  Stethoscope,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KPIStat } from '../../@types';

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<KPIStat['iconKey'], React.JSX.Element> = {
  users: <Users size={18} />,
  activity: <Activity size={18} />,
  'heart-pulse': <HeartPulse size={18} />,
  percent: <Percent size={18} />,
  'user-plus': <UserPlus size={18} />,
  'user-minus': <UserMinus size={18} />,
  'dollar-sign': <DollarSign size={18} />,
  brain: <Brain size={18} />,
  'shield-check': <ShieldCheck size={18} />,
  clock: <Clock size={18} />,
  'monitor-heart': <Stethoscope size={18} />,
};

// ─── Trend badge ──────────────────────────────────────────────────────────────

function TrendBadge({ direction, percent }: { direction: 'up' | 'down'; percent: number }): React.JSX.Element {
  const isUp = direction === 'up';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold',
        isUp
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
          : 'bg-rose-50 text-rose-500 border border-rose-200'
      )}
    >
      {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {isUp ? '+' : '-'}
      {percent}% vs last month
    </span>
  );
}

// ─── Primary card (top row — 3 cols) ─────────────────────────────────────────

function KPICardPrimary({ stat }: { stat: KPIStat }): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-foreground leading-tight">{stat.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{stat.subtitle}</p>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-primary/25 text-primary">
          {ICON_MAP[stat.iconKey]}
        </div>
      </div>
      <div className="flex items-center gap-2.5 flex-wrap">
        <p className="text-[1.6rem] font-bold leading-none text-foreground">{stat.value}</p>
        <TrendBadge direction={stat.trend.direction} percent={stat.trend.percent} />
      </div>
    </div>
  );
}

// ─── Secondary card (bottom row — 4 cols) ────────────────────────────────────

function KPICardSecondary({ stat }: { stat: KPIStat }): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-foreground leading-tight">{stat.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{stat.subtitle}</p>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-primary/25 text-primary">
          {ICON_MAP[stat.iconKey]}
        </div>
      </div>
      <div className="flex items-center gap-2.5 flex-wrap">
        <p className="text-[1.6rem] font-bold leading-none text-foreground">{stat.value}</p>
        <TrendBadge direction={stat.trend.direction} percent={stat.trend.percent} />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KPICards(): React.JSX.Element {
  const stats = useMemo<KPIStat[]>(() => {
    return [
      // ── Row 1 ──
      {
        id: 'total-enrolled',
        title: 'Total Enrolled Patients',
        value: (3847).toLocaleString(),
        subtitle: 'Active patients across all programs',
        trend: { direction: 'up', percent: 12 },
        iconKey: 'users',
        color: 'teal',
      },
      {
        id: 'apcm',
        title: 'Total APCM Enrollments',
        value: (1563).toLocaleString(),
        subtitle: 'Accountable Primary Care Model',
        trend: { direction: 'up', percent: 8 },
        iconKey: 'activity',
        color: 'violet',
      },
      {
        id: 'rpm',
        title: 'Total RPM Enrollments',
        value: (1284).toLocaleString(),
        subtitle: 'Remote Patient Monitoring',
        trend: { direction: 'up', percent: 15 },
        iconKey: 'heart-pulse',
        color: 'blue',
      },
      {
        id: 'bhi',
        title: 'Total BHI Enrollments',
        value: (1248).toLocaleString(),
        subtitle: 'Behavioral Health Integration',
        trend: { direction: 'up', percent: 10 },
        iconKey: 'brain',
        color: 'violet',
      },
      // ── Row 2 ──
      {
        id: 'eligible-patients',
        title: 'Eligible Patients',
        value: (642).toLocaleString(),
        subtitle: 'Total Medicare-eligible population',
        trend: { direction: 'up', percent: 3 },
        iconKey: 'shield-check',
        color: 'teal',
      },
      {
        id: 'consent-pending',
        title: 'Consent Pending',
        value: (318).toLocaleString(),
        subtitle: 'Invited but not fully enrolled',
        trend: { direction: 'down', percent: 8 },
        iconKey: 'clock',
        color: 'amber',
      },
      {
        id: 'active-monitoring',
        title: 'Active Monitoring Patients',
        value: (318).toLocaleString(),
        subtitle: 'Actively submitting RPM data',
        trend: { direction: 'up', percent: 11 },
        iconKey: 'monitor-heart',
        color: 'emerald',
      },
      {
        id: 'enrollment-rate',
        title: 'Enrollment Rate',
        value: '78%',
        subtitle: 'Enrolled vs eligible population',
        trend: { direction: 'up', percent: 4 },
        iconKey: 'percent',
        color: 'amber',
      },
      // ── Row 3 ──
      {
        id: 'new-enrollments',
        title: 'New Enrollments This Month',
        value: 142,
        subtitle: 'Added in the current month',
        trend: { direction: 'up', percent: 18 },
        iconKey: 'user-plus',
        color: 'emerald',
      },
      {
        id: 'disenrollments',
        title: 'Disenrollments',
        value: 23,
        subtitle: 'Voluntary withdrawal · Insurance lapse',
        trend: { direction: 'down', percent: 12 },
        iconKey: 'user-minus',
        color: 'rose',
      },
    ] as KPIStat[];
  }, []);

  const row1 = stats.slice(0, 4);
  const row2 = stats.slice(4, 8);
  const row3 = stats.slice(8);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[15px] font-semibold text-foreground">Enrollment Overview</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">Live patient enrollment stats across all programs</p>
      </div>

      {/* Row 1 — 4 cards */}
      <div className="grid grid-cols-4 gap-4">
        {row1.map((stat) => (
          <div key={stat.id} className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <KPICardPrimary stat={stat} />
          </div>
        ))}
      </div>

      {/* Row 2 — 4 cards */}
      <div className="grid grid-cols-4 gap-4">
        {row2.map((stat) => (
          <div key={stat.id} className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <KPICardSecondary stat={stat} />
          </div>
        ))}
      </div>

      {/* Row 3 — 3 cards */}
      <div className="grid grid-cols-4 gap-4">
        {row3.map((stat) => (
          <div key={stat.id} className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <KPICardSecondary stat={stat} />
          </div>
        ))}
      </div>
    </div>
  );
}
