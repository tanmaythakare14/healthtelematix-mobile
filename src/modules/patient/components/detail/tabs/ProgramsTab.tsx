import React from 'react';
import { Activity, HeartPulse, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProgramStatus = 'active' | 'inactive' | 'pending';

interface EnrolledProgram {
  id: string;
  code: 'APCM' | 'RPM';
  fullName: string;
  status: ProgramStatus;
  enrolledDate: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PROGRAMS: EnrolledProgram[] = [
  {
    id: 'prog-001',
    code: 'APCM',
    fullName: 'Advanced Primary Care Management',
    status: 'active',
    enrolledDate: 'Jan 10, 2024',
  },
  {
    id: 'prog-002',
    code: 'RPM',
    fullName: 'Remote Patient Monitoring',
    status: 'active',
    enrolledDate: 'Feb 05, 2024',
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const PROGRAM_CONFIG = {
  APCM: {
    icon: <Activity size={22} className="text-teal-600" />,
    iconBg: 'bg-teal-100',
    cardBg: 'bg-teal-50/40 border-teal-100',
    accentText: 'text-teal-700',
  },
  RPM: {
    icon: <HeartPulse size={22} className="text-indigo-500" />,
    iconBg: 'bg-indigo-100',
    cardBg: 'bg-indigo-50/40 border-indigo-100',
    accentText: 'text-indigo-600',
  },
} as const;

const STATUS_STYLE: Record<ProgramStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  inactive: 'bg-rose-50 text-rose-700 border-rose-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
};

const STATUS_DOT: Record<ProgramStatus, string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-rose-500',
  pending: 'bg-amber-400',
};

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({ program }: { program: EnrolledProgram }): React.JSX.Element {
  const cfg = PROGRAM_CONFIG[program.code];

  return (
    <div className={cn('rounded-[14px] border p-4', cfg.cardBg)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', cfg.iconBg)}>
            {cfg.icon}
          </div>
          <div>
            <h4 className={cn('text-[15px] font-bold leading-tight', cfg.accentText)}>{program.code}</h4>
            <p className={cn('text-[12px] font-medium mt-0.5', cfg.accentText, 'opacity-80')}>{program.fullName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {/* Enrolled date chip */}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
            <Calendar size={11} className="text-slate-400" />
            Enrolled on: {program.enrolledDate}
          </span>

          {/* Status badge */}
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
              STATUS_STYLE[program.status]
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[program.status])} />
            {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProgramsTab(): React.JSX.Element {
  if (PROGRAMS.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <Activity size={24} className="text-slate-400" />
        </div>
        <p className="text-[13.5px] font-semibold text-foreground">No programs enrolled</p>
        <p className="text-[12px] text-muted-foreground mt-1">
          This patient has not been enrolled in any programs yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {PROGRAMS.map((program) => (
        <ProgramCard key={program.id} program={program} />
      ))}
    </div>
  );
}
