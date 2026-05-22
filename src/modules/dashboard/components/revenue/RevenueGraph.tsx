import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { generateRevenueData, formatCurrency } from '../../utils';
import type { TimePeriod, ProgramFilter, RevenueDataPoint } from '../../@types';

// ─── Filter Pills ─────────────────────────────────────────────────────────────

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1 rounded-md text-[12px] font-medium transition-all duration-150',
            value === opt.value
              ? 'bg-white text-primary shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Custom Y Axis Tick ───────────────────────────────────────────────────────

function YAxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: number } }): React.JSX.Element {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill="#94a3b8" fontSize={11}>
      {formatCurrency(payload?.value ?? 0)}
    </text>
  );
}

// ─── Trend Badge ──────────────────────────────────────────────────────────────

function TrendBadge({ pct, periodLabel }: { pct: number; periodLabel: string }): React.JSX.Element {
  const isUp = pct >= 0;
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
      {isUp ? '+' : ''}
      {pct}% {periodLabel}
    </span>
  );
}

// ─── Trend computation ────────────────────────────────────────────────────────

function computeTrend(data: RevenueDataPoint[], key: keyof RevenueDataPoint): number {
  if (data.length < 2) return 0;
  const current = data[data.length - 1][key] as number;
  const previous = data[data.length - 2][key] as number;
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const PROGRAM_OPTIONS: { value: ProgramFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'RPM', label: 'RPM' },
  { value: 'APCM', label: 'APCM' },
  { value: 'BHI', label: 'BHI' },
];

const PERIOD_LABEL: Record<TimePeriod, string> = {
  monthly: 'vs last month',
  quarterly: 'vs last quarter',
  yearly: 'vs last year',
};

const COLORS = {
  total: '#4F8EF7',
  apcm: '#0d9488',
  rpm: '#8b5cf6',
  bhi: '#f59e0b',
} as const;

const LINE_CHART_CONFIG = {
  total: { label: 'Total Revenue', color: COLORS.total },
};

const BAR_CHART_CONFIG = {
  apcm: { label: 'APCM', color: COLORS.apcm },
  rpm: { label: 'RPM', color: COLORS.rpm },
  bhi: { label: 'BHI', color: COLORS.bhi },
};

const CONTRIBUTION_PROGRAMS = [
  { key: 'apcm' as const, label: 'APCM', color: COLORS.apcm, barColor: 'bg-teal-500' },
  { key: 'rpm' as const, label: 'RPM', color: COLORS.rpm, barColor: 'bg-violet-500' },
  { key: 'bhi' as const, label: 'BHI', color: COLORS.bhi, barColor: 'bg-amber-400' },
];

// ─── Program Contribution Panel ───────────────────────────────────────────────

function ProgramContribution({ data }: { data: RevenueDataPoint[] }): React.JSX.Element {
  const latest = data[data.length - 1];
  const totalProgramRevenue = (latest.apcm ?? 0) + (latest.rpm ?? 0) + (latest.bhi ?? 0);

  const contributions = CONTRIBUTION_PROGRAMS.map((p) => ({
    ...p,
    value: latest[p.key] as number,
    pct: totalProgramRevenue > 0 ? Math.round(((latest[p.key] as number) / totalProgramRevenue) * 100) : 0,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5">
      <p className="text-[13px] font-semibold text-foreground mb-0.5">Program Contribution</p>
      <p className="text-[11.5px] text-muted-foreground mb-5">Revenue share by program for the latest period</p>

      <div className="space-y-4">
        {contributions.map((c) => (
          <div key={c.key}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-[12.5px] font-semibold text-foreground">{c.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] text-muted-foreground">{formatCurrency(c.value)}</span>
                <span className="text-[12px] font-bold text-foreground">{c.pct}%</span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', c.barColor)}
                style={{ width: `${c.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary row */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11.5px] text-muted-foreground">Total program revenue</span>
        <span className="text-[13px] font-bold text-foreground">{formatCurrency(totalProgramRevenue)}</span>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RevenueGraph(): React.JSX.Element {
  const [period, setPeriod] = useState<TimePeriod>('monthly');
  const [program, setProgram] = useState<ProgramFilter>('all');

  const data = generateRevenueData(period, program);
  const periodLabel = PERIOD_LABEL[period];

  const totalTrend = useMemo(() => computeTrend(data, 'total'), [data]);
  const apcmTrend = useMemo(() => computeTrend(data, 'apcm'), [data]);
  const rpmTrend = useMemo(() => computeTrend(data, 'rpm'), [data]);
  const bhiTrend = useMemo(() => computeTrend(data, 'bhi'), [data]);

  // Weighted avg trend for the bar chart based on selected program
  const barTrend = useMemo(() => {
    if (program === 'APCM') return apcmTrend;
    if (program === 'RPM') return rpmTrend;
    if (program === 'BHI') return bhiTrend;
    // All programs: weighted by latest period totals
    return totalTrend;
  }, [program, apcmTrend, rpmTrend, bhiTrend, totalTrend]);

  return (
    <div className="space-y-4">
      {/* Shared header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">Revenue Overview</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Revenue trends by time period and program type</p>
        </div>
        <div className="flex items-center gap-2">
          <PillGroup options={TIME_OPTIONS} value={period} onChange={setPeriod} />
          <PillGroup options={PROGRAM_OPTIONS} value={program} onChange={setProgram} />
        </div>
      </div>

      {/* Top row — two graph cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left — Line Chart: Total Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-[13px] font-semibold text-foreground mb-0.5">Total Revenue</p>
              <p className="text-[11.5px] text-muted-foreground">Cumulative revenue across all programs</p>
            </div>
            <TrendBadge pct={totalTrend} periodLabel={periodLabel} />
          </div>
          <ChartContainer config={LINE_CHART_CONFIG} className="h-[220px] w-full aspect-auto">
            <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={<YAxisTick />} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                content={({ active, payload, label }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload?.map((p) => ({ name: String(p.name), value: Number(p.value) }))}
                    label={label as string}
                    formatter={(v) => formatCurrency(v)}
                  />
                )}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke={COLORS.total}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: COLORS.total, strokeWidth: 0 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        {/* Right — Bar Chart: Revenue by Program */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-[13px] font-semibold text-foreground mb-0.5">Revenue by Program</p>
              <p className="text-[11.5px] text-muted-foreground">APCM · RPM · BHI breakdown</p>
            </div>
            <TrendBadge pct={barTrend} periodLabel={periodLabel} />
          </div>
          <ChartContainer config={BAR_CHART_CONFIG} className="h-[220px] w-full aspect-auto">
            <BarChart
              data={data}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              barSize={program === 'all' ? 10 : 18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={<YAxisTick />} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                content={({ active, payload, label }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload?.map((p) => ({ name: String(p.name), value: Number(p.value) }))}
                    label={label as string}
                    formatter={(v) => formatCurrency(v)}
                  />
                )}
              />
              {(program === 'all' || program === 'APCM') && (
                <Bar dataKey="apcm" fill={COLORS.apcm} radius={[3, 3, 0, 0]} />
              )}
              {(program === 'all' || program === 'RPM') && (
                <Bar dataKey="rpm" fill={COLORS.rpm} radius={[3, 3, 0, 0]} />
              )}
              {(program === 'all' || program === 'BHI') && (
                <Bar dataKey="bhi" fill={COLORS.bhi} radius={[3, 3, 0, 0]} />
              )}
            </BarChart>
          </ChartContainer>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 justify-center">
            {[
              { key: 'apcm', label: 'APCM', color: COLORS.apcm },
              { key: 'rpm', label: 'RPM', color: COLORS.rpm },
              { key: 'bhi', label: 'BHI', color: COLORS.bhi },
            ]
              .filter((l) => program === 'all' || program === l.key.toUpperCase())
              .map((l) => (
                <div key={l.key} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="text-[11px] text-muted-foreground">{l.label}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Bottom row — Program Contribution */}
      <ProgramContribution data={generateRevenueData(period, 'all')} />
    </div>
  );
}
