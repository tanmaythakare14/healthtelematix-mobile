export type TimePeriod = 'monthly' | 'quarterly' | 'yearly';
export type ProgramFilter = 'all' | 'RPM' | 'APCM' | 'BHI';

export interface RevenueDataPoint {
  label: string;
  total: number;
  apcm: number;
  rpm: number;
  bhi: number;
}

export interface KPIStat {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  trend: { direction: 'up' | 'down'; percent: number };
  iconKey:
    | 'users'
    | 'activity'
    | 'heart-pulse'
    | 'percent'
    | 'user-plus'
    | 'user-minus'
    | 'dollar-sign'
    | 'brain'
    | 'shield-check'
    | 'clock'
    | 'monitor-heart';
  color: 'teal' | 'violet' | 'blue' | 'amber' | 'emerald' | 'rose';
}

export interface CPTEntry {
  code: string;
  description: string;
  count: number;
  revenue: number;
}
