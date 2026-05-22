import React from 'react';
import { CalendarDays, ClipboardList, RefreshCw, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONDITION_CHIP_STYLE, PROGRAM_CHIP_STYLE, PROGRESS_COLOR } from '../../constants';
import type { CarePlanCardProps } from '../../@types';

export function CarePlanCard({ plan }: CarePlanCardProps): React.JSX.Element {
  const isCompleted = plan.status === 'completed';
  const condStyle = CONDITION_CHIP_STYLE[plan.conditionName] ?? 'bg-slate-100 text-slate-600 border-slate-300';
  const progStyle = PROGRAM_CHIP_STYLE[plan.enrolledProgram] ?? 'bg-slate-100 text-slate-600 border-slate-300';
  const barColor = isCompleted ? 'bg-slate-400' : PROGRESS_COLOR(plan.progress);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
          <ClipboardList size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-bold text-foreground leading-snug mb-1.5 line-clamp-2">{plan.name}</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn('text-[10.5px] font-semibold px-2 py-0.5 rounded-full border', condStyle)}>
              {plan.conditionName}
            </span>
            <span className={cn('text-[10.5px] font-semibold px-2 py-0.5 rounded-full border', progStyle)}>
              {plan.enrolledProgram}
            </span>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      <div className="px-5 py-3.5 border-b border-slate-100">
        <p className="text-[12.5px] text-muted-foreground leading-relaxed line-clamp-2">{plan.shortDescription}</p>
      </div>

      {/* ── Progress bar ── */}
      <div className="px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-[0.07em]">Progress</p>
          <span
            className={cn(
              'text-[11px] font-bold tabular-nums',
              isCompleted
                ? 'text-slate-500'
                : plan.progress >= 75
                  ? 'text-emerald-600'
                  : plan.progress >= 40
                    ? 'text-amber-600'
                    : 'text-rose-500'
            )}
          >
            {plan.progress}%
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${plan.progress}%` }} />
        </div>
      </div>

      {/* ── Footer meta ── */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
          {isCompleted ? (
            <>
              <CalendarDays size={12} className="shrink-0" />
              <span>
                Completed <span className="font-semibold text-foreground">{plan.completedOn ?? '—'}</span>
              </span>
            </>
          ) : (
            <>
              <RefreshCw size={12} className="shrink-0" />
              <span>
                Updated <span className="font-semibold text-foreground">{plan.lastUpdated}</span>
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground shrink-0">
          <UserCheck size={12} className="shrink-0" />
          <span className="font-medium truncate max-w-[140px]">{plan.assignedBy}</span>
        </div>
      </div>
    </div>
  );
}
