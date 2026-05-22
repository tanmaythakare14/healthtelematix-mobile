export const CARE_PLAN_BASE_PATH = '/care-plan';

export const CONDITION_CHIP_STYLE: Record<string, string> = {
  Diabetes: 'bg-amber-50 text-amber-700 border-amber-200',
  Hypertension: 'bg-rose-50 text-rose-700 border-rose-200',
  'Heart Failure': 'bg-sky-50 text-sky-700 border-sky-200',
  Obesity: 'bg-teal-50 text-teal-700 border-teal-200',
  'Atrial Fibrillation': 'bg-purple-50 text-purple-700 border-purple-200',
  Other: 'bg-slate-100 text-slate-600 border-slate-300',
};

export const PROGRAM_CHIP_STYLE: Record<string, string> = {
  RPM: 'bg-blue-50 text-blue-700 border-blue-200',
  APCM: 'bg-violet-50 text-violet-700 border-violet-200',
  BHI: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const PROGRESS_COLOR = (progress: number): string => {
  if (progress >= 75) return 'bg-emerald-500';
  if (progress >= 40) return 'bg-amber-400';
  return 'bg-rose-400';
};
