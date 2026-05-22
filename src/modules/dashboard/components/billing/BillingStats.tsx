import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { secureLocalStorage } from '@/utils/secureStorage';
import { PATIENT_LIST_STORAGE_KEY } from '@/modules/patient/constants';
import type { PatientListItem, ProgramType } from '@/modules/patient/@types';
import type { CPTEntry } from '../../@types';

// ─── CPT code mapping ─────────────────────────────────────────────────────────

const CPT_MAP: Record<ProgramType, { code: string; description: string; rate: number }> = {
  APCM: { code: '99490', description: 'Chronic Care Mgmt — APCM', rate: 62 },
  RPM: { code: '99091', description: 'Remote Patient Monitoring', rate: 57 },
  BHI: { code: '99492', description: 'Behavioral Health Integration', rate: 52 },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function BillingStats(): React.JSX.Element {
  const cptEntries = useMemo<CPTEntry[]>(() => {
    const patients = secureLocalStorage.getItemObject<PatientListItem[]>(PATIENT_LIST_STORAGE_KEY) ?? [];
    return (Object.keys(CPT_MAP) as ProgramType[]).map((prog) => {
      const count = patients.filter((p) => p.programs.includes(prog)).length;
      return {
        code: CPT_MAP[prog].code,
        description: CPT_MAP[prog].description,
        count,
        revenue: count * CPT_MAP[prog].rate,
      };
    });
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[15px] font-semibold text-foreground">CPT Codes Billed This Month</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Codes generated from enrolled program patients this month
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-2 gap-3">
          {cptEntries.map((entry) => (
            <div
              key={entry.code}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={cn(
                    'text-[12px] font-bold px-2 py-1 rounded-lg shrink-0',
                    entry.code === '99490'
                      ? 'bg-teal-50 text-teal-700 border border-teal-100'
                      : 'bg-violet-50 text-violet-700 border border-violet-100'
                  )}
                >
                  {entry.code}
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium text-foreground truncate">{entry.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {entry.count} patient{entry.count !== 1 ? 's' : ''} billed
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[14px] font-bold text-emerald-600">${entry.revenue.toLocaleString()}</p>
                <p className="text-[10.5px] text-muted-foreground">this month</p>
              </div>
            </div>
          ))}
          {cptEntries.every((e) => e.count === 0) && (
            <p className="text-[11.5px] text-muted-foreground col-span-2">No billable codes this month</p>
          )}
        </div>
      </div>
    </div>
  );
}
