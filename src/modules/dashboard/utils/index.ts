import type { RevenueDataPoint, TimePeriod, ProgramFilter } from '../@types';

const MONTHLY_BASE = [
  { label: 'Jan', total: 18400, apcm: 9200, rpm: 6800, bhi: 2400 },
  { label: 'Feb', total: 21200, apcm: 10600, rpm: 7400, bhi: 3200 },
  { label: 'Mar', total: 19800, apcm: 9900, rpm: 7100, bhi: 2800 },
  { label: 'Apr', total: 24600, apcm: 12300, rpm: 8900, bhi: 3400 },
  { label: 'May', total: 23100, apcm: 11550, rpm: 8200, bhi: 3350 },
  { label: 'Jun', total: 27300, apcm: 13650, rpm: 9800, bhi: 3850 },
  { label: 'Jul', total: 25800, apcm: 12900, rpm: 9200, bhi: 3700 },
  { label: 'Aug', total: 29400, apcm: 14700, rpm: 10500, bhi: 4200 },
  { label: 'Sep', total: 31200, apcm: 15600, rpm: 11100, bhi: 4500 },
  { label: 'Oct', total: 28900, apcm: 14450, rpm: 10300, bhi: 4150 },
  { label: 'Nov', total: 33600, apcm: 16800, rpm: 12000, bhi: 4800 },
  { label: 'Dec', total: 36100, apcm: 18050, rpm: 12900, bhi: 5150 },
];

const QUARTERLY_BASE: RevenueDataPoint[] = [
  { label: 'Q1', total: 59400, apcm: 29700, rpm: 21300, bhi: 8400 },
  { label: 'Q2', total: 75000, apcm: 37500, rpm: 26900, bhi: 10600 },
  { label: 'Q3', total: 86400, apcm: 43200, rpm: 30800, bhi: 12400 },
  { label: 'Q4', total: 98600, apcm: 49300, rpm: 35200, bhi: 14100 },
];

const YEARLY_BASE: RevenueDataPoint[] = [
  { label: '2022', total: 184000, apcm: 92000, rpm: 65800, bhi: 26200 },
  { label: '2023', total: 247000, apcm: 123500, rpm: 88200, bhi: 35300 },
  { label: '2024', total: 319400, apcm: 159700, rpm: 114000, bhi: 45700 },
  { label: '2025', total: 412600, apcm: 206300, rpm: 147500, bhi: 58800 },
];

export function generateRevenueData(period: TimePeriod, program: ProgramFilter): RevenueDataPoint[] {
  let base: RevenueDataPoint[];
  if (period === 'monthly') base = MONTHLY_BASE;
  else if (period === 'quarterly') base = QUARTERLY_BASE;
  else base = YEARLY_BASE;

  if (program === 'all') return base;

  // Filter to show only the selected program's revenue
  return base.map((d) => {
    const value = program === 'RPM' ? d.rpm : program === 'APCM' ? d.apcm : d.bhi;
    return {
      ...d,
      total: value,
      apcm: program === 'APCM' ? d.apcm : 0,
      rpm: program === 'RPM' ? d.rpm : 0,
      bhi: program === 'BHI' ? d.bhi : 0,
    };
  });
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}
