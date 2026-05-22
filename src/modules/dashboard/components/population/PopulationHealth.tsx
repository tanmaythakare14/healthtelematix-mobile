import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

// ─── Patient population totals ────────────────────────────────────────────────
// Hypertension: patients with hypertension medical condition diagnosis
// Diabetes:     patients with diabetes medical condition diagnosis
// Weight:       ALL enrolled patients (318 total)

const HTN_PATIENTS = 186;
const DM_PATIENTS = 134;
const ALL_ENROLLED = 318;

// ─── Time-range types ─────────────────────────────────────────────────────────

type TimeRange = 'monthly' | 'quarterly' | 'yearly';

// ─── Monthly data ─────────────────────────────────────────────────────────────
// Hypertension: 186 patients diagnosed with hypertension

const HTN_MONTHLY = [
  { period: 'Jan', controlled: 107, uncontrolled: 79 },
  { period: 'Feb', controlled: 114, uncontrolled: 72 },
  { period: 'Mar', controlled: 117, uncontrolled: 69 },
  { period: 'Apr', controlled: 121, uncontrolled: 65 },
  { period: 'May', controlled: 124, uncontrolled: 62 },
  { period: 'Jun', controlled: 127, uncontrolled: 59 },
  { period: 'Jul', controlled: 130, uncontrolled: 56 },
  { period: 'Aug', controlled: 132, uncontrolled: 54 },
  { period: 'Sep', controlled: 134, uncontrolled: 52 },
  { period: 'Oct', controlled: 134, uncontrolled: 52 },
  { period: 'Nov', controlled: 138, uncontrolled: 48 },
  { period: 'Dec', controlled: 140, uncontrolled: 46 },
];

// Diabetes: 134 patients diagnosed with diabetes

const DM_MONTHLY = [
  { period: 'Jan', controlled: 64, uncontrolled: 70 },
  { period: 'Feb', controlled: 68, uncontrolled: 66 },
  { period: 'Mar', controlled: 72, uncontrolled: 62 },
  { period: 'Apr', controlled: 77, uncontrolled: 57 },
  { period: 'May', controlled: 79, uncontrolled: 55 },
  { period: 'Jun', controlled: 82, uncontrolled: 52 },
  { period: 'Jul', controlled: 85, uncontrolled: 49 },
  { period: 'Aug', controlled: 87, uncontrolled: 47 },
  { period: 'Sep', controlled: 89, uncontrolled: 45 },
  { period: 'Oct', controlled: 92, uncontrolled: 42 },
  { period: 'Nov', controlled: 94, uncontrolled: 40 },
  { period: 'Dec', controlled: 97, uncontrolled: 37 },
];

// Weight: all 318 enrolled patients

const WT_MONTHLY = [
  { period: 'Jan', onTrack: 69, needsAttention: 249 },
  { period: 'Feb', onTrack: 90, needsAttention: 228 },
  { period: 'Mar', onTrack: 102, needsAttention: 216 },
  { period: 'Apr', onTrack: 114, needsAttention: 204 },
  { period: 'May', onTrack: 126, needsAttention: 192 },
  { period: 'Jun', onTrack: 139, needsAttention: 179 },
  { period: 'Jul', onTrack: 143, needsAttention: 175 },
  { period: 'Aug', onTrack: 151, needsAttention: 167 },
  { period: 'Sep', onTrack: 163, needsAttention: 155 },
  { period: 'Oct', onTrack: 167, needsAttention: 151 },
  { period: 'Nov', onTrack: 175, needsAttention: 143 },
  { period: 'Dec', onTrack: 179, needsAttention: 139 },
];

// ─── Quarterly data (avg of 3-month blocks) ───────────────────────────────────

const HTN_QUARTERLY = [
  { period: 'Q1', controlled: 113, uncontrolled: 73 },
  { period: 'Q2', controlled: 124, uncontrolled: 62 },
  { period: 'Q3', controlled: 132, uncontrolled: 54 },
  { period: 'Q4', controlled: 137, uncontrolled: 49 },
];

const DM_QUARTERLY = [
  { period: 'Q1', controlled: 68, uncontrolled: 66 },
  { period: 'Q2', controlled: 79, uncontrolled: 55 },
  { period: 'Q3', controlled: 87, uncontrolled: 47 },
  { period: 'Q4', controlled: 94, uncontrolled: 40 },
];

const WT_QUARTERLY = [
  { period: 'Q1', onTrack: 87, needsAttention: 231 },
  { period: 'Q2', onTrack: 126, needsAttention: 192 },
  { period: 'Q3', onTrack: 152, needsAttention: 166 },
  { period: 'Q4', onTrack: 174, needsAttention: 144 },
];

// ─── Yearly data (full-year average) ─────────────────────────────────────────

const HTN_YEARLY = [{ period: '2024', controlled: 127, uncontrolled: 59 }];
const DM_YEARLY = [{ period: '2024', controlled: 83, uncontrolled: 51 }];
const WT_YEARLY = [{ period: '2024', onTrack: 135, needsAttention: 183 }];

// ─── Chart configs ────────────────────────────────────────────────────────────

const HTN_CONFIG = {
  controlled: { label: 'Controlled', color: '#0d9488' },
  uncontrolled: { label: 'Uncontrolled', color: '#f43f5e' },
};

const DM_CONFIG = {
  controlled: { label: 'Controlled', color: '#0d9488' },
  uncontrolled: { label: 'Uncontrolled', color: '#f59e0b' },
};

const WEIGHT_CONFIG = {
  onTrack: { label: 'On Track', color: '#4F8EF7' },
  needsAttention: { label: 'Needs Attention', color: '#cbd5e1' },
};

// ─── Outcome KPI data ─────────────────────────────────────────────────────────

interface OutcomeKPI {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  goodDirection: 'up' | 'down';
  changeValue: string;
  changeLabel: string;
}

const OUTCOME_KPIS: OutcomeKPI[] = [
  {
    id: 'bp-control',
    title: 'BP Control Rate',
    subtitle: 'Patients below 130/80 mmHg',
    value: '75%',
    goodDirection: 'up',
    changeValue: '+5%',
    changeLabel: 'vs last quarter',
  },
  {
    id: 'a1c-improvement',
    title: 'Avg A1c Improvement',
    subtitle: 'Mean reduction from baseline',
    value: '↓ 1.4%',
    goodDirection: 'down',
    changeValue: '↓ 0.2%',
    changeLabel: 'vs last quarter',
  },
  {
    id: 'weight-reduction',
    title: 'Weight Reduction',
    subtitle: 'Avg cumulative loss per patient',
    value: '↓ 6.2 lbs',
    goodDirection: 'down',
    changeValue: '↓ 0.5 lbs',
    changeLabel: 'vs last month',
  },
];

// ─── Outcome KPI Card ─────────────────────────────────────────────────────────

function OutcomeCard({ kpi }: { kpi: OutcomeKPI }): React.JSX.Element {
  const isPositive = kpi.goodDirection === 'down' ? kpi.changeValue.startsWith('↓') : kpi.changeValue.startsWith('+');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 flex flex-col gap-2.5">
      <div>
        <p className="text-[12.5px] font-semibold text-foreground leading-tight">{kpi.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{kpi.subtitle}</p>
      </div>
      <p className="text-[1.35rem] font-bold leading-none text-foreground">{kpi.value}</p>
      <span
        className={cn(
          'inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[11px] font-semibold',
          isPositive
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            : 'bg-rose-50 text-rose-500 border border-rose-200'
        )}
      >
        {isPositive ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
        {kpi.changeValue} {kpi.changeLabel}
      </span>
    </div>
  );
}

// ─── Device badge ─────────────────────────────────────────────────────────────

function DeviceBadge({ name }: { name: string }): React.JSX.Element {
  return (
    <span className="inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 shrink-0">
      {name}
    </span>
  );
}

// ─── Chart summary pills ──────────────────────────────────────────────────────

function SummaryPills({
  items,
  total,
  totalLabel,
}: {
  items: { label: string; count: number; color: string }[];
  total: number;
  totalLabel: string;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
          <span className="font-semibold text-foreground">{item.count}</span>
          {item.label}
        </span>
      ))}
      <span className="text-[11px] text-slate-400 ml-auto">
        of {total} {totalLabel}
      </span>
    </div>
  );
}

// ─── Time range filter pills ──────────────────────────────────────────────────

const TIME_RANGES: { id: TimeRange; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'yearly', label: 'Yearly' },
];

function TimeFilter({ value, onChange }: { value: TimeRange; onChange: (v: TimeRange) => void }): React.JSX.Element {
  return (
    <div className="inline-flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
      {TIME_RANGES.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onChange(r.id)}
          className={cn(
            'px-3 py-1 rounded-md text-[11.5px] font-medium transition-colors',
            value === r.id ? 'bg-white text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PopulationHealth(): React.JSX.Element {
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

  const htnData = timeRange === 'monthly' ? HTN_MONTHLY : timeRange === 'quarterly' ? HTN_QUARTERLY : HTN_YEARLY;
  const dmData = timeRange === 'monthly' ? DM_MONTHLY : timeRange === 'quarterly' ? DM_QUARTERLY : DM_YEARLY;
  const wtData = timeRange === 'monthly' ? WT_MONTHLY : timeRange === 'quarterly' ? WT_QUARTERLY : WT_YEARLY;

  const latestHtn = htnData[htnData.length - 1];
  const latestDm = dmData[dmData.length - 1];
  const latestWt = wtData[wtData.length - 1];

  const barSize = timeRange === 'yearly' ? 40 : timeRange === 'quarterly' ? 28 : 10;

  return (
    <div className="space-y-4">
      {/* Section header + time filter */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">Population Health Outcomes</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Clinical outcome metrics tracked across enrolled patient population
          </p>
        </div>
        <TimeFilter value={timeRange} onChange={setTimeRange} />
      </div>

      {/* ── Outcome KPI cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {OUTCOME_KPIS.map((kpi) => (
          <OutcomeCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* ── Trend graphs ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Hypertension Trends */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5">
          <div className="mb-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-h-[36px]">
                <p className="text-[13px] font-semibold text-foreground">Hypertension Trends</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Patients with hypertension diagnosis — BP {'<'} 130/80 mmHg
                </p>
              </div>
              <DeviceBadge name="Blood Pressure Cuff" />
            </div>
            <SummaryPills
              items={[
                { label: 'Controlled', count: latestHtn.controlled, color: HTN_CONFIG.controlled.color },
                { label: 'Uncontrolled', count: latestHtn.uncontrolled, color: HTN_CONFIG.uncontrolled.color },
              ]}
              total={HTN_PATIENTS}
              totalLabel="hypertension patients"
            />
          </div>
          <ChartContainer config={HTN_CONFIG} className="h-[180px] w-full aspect-auto">
            <BarChart data={htnData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={barSize}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={28}
                domain={[0, HTN_PATIENTS + 15]}
              />
              <Tooltip
                content={({ active, payload, label }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload?.map((p) => ({ name: String(p.name), value: Number(p.value) }))}
                    label={label as string}
                    formatter={(v) => `${v} patients`}
                  />
                )}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" iconSize={7} />
              <Bar
                dataKey="controlled"
                stackId="a"
                fill={HTN_CONFIG.controlled.color}
                name="Controlled"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="uncontrolled"
                stackId="a"
                fill={HTN_CONFIG.uncontrolled.color}
                name="Uncontrolled"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Diabetes Trends */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5">
          <div className="mb-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-h-[36px]">
                <p className="text-[13px] font-semibold text-foreground">Diabetes Trends</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Patients with diabetes diagnosis — A1c {'<'} 8%
                </p>
              </div>
              <DeviceBadge name="Dexcom CGM / FreeStyle Libre" />
            </div>
            <SummaryPills
              items={[
                { label: 'Controlled', count: latestDm.controlled, color: DM_CONFIG.controlled.color },
                { label: 'Uncontrolled', count: latestDm.uncontrolled, color: DM_CONFIG.uncontrolled.color },
              ]}
              total={DM_PATIENTS}
              totalLabel="diabetes patients"
            />
          </div>
          <ChartContainer config={DM_CONFIG} className="h-[180px] w-full aspect-auto">
            <BarChart data={dmData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={barSize}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={28}
                domain={[0, DM_PATIENTS + 10]}
              />
              <Tooltip
                content={({ active, payload, label }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload?.map((p) => ({ name: String(p.name), value: Number(p.value) }))}
                    label={label as string}
                    formatter={(v) => `${v} patients`}
                  />
                )}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" iconSize={7} />
              <Bar
                dataKey="controlled"
                stackId="a"
                fill={DM_CONFIG.controlled.color}
                name="Controlled"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="uncontrolled"
                stackId="a"
                fill={DM_CONFIG.uncontrolled.color}
                name="Uncontrolled"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Weight Trends */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5">
          <div className="mb-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-h-[36px]">
                <p className="text-[13px] font-semibold text-foreground">Weight Trends</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  All enrolled patients — monthly weight goal tracking
                </p>
              </div>
              <DeviceBadge name="Weight Scale" />
            </div>
            <SummaryPills
              items={[
                { label: 'On Track', count: latestWt.onTrack, color: WEIGHT_CONFIG.onTrack.color },
                { label: 'Needs Attention', count: latestWt.needsAttention, color: WEIGHT_CONFIG.needsAttention.color },
              ]}
              total={ALL_ENROLLED}
              totalLabel="enrolled patients"
            />
          </div>
          <ChartContainer config={WEIGHT_CONFIG} className="h-[180px] w-full aspect-auto">
            <BarChart data={wtData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={barSize}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={28}
                domain={[0, ALL_ENROLLED + 20]}
              />
              <Tooltip
                content={({ active, payload, label }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload?.map((p) => ({ name: String(p.name), value: Number(p.value) }))}
                    label={label as string}
                    formatter={(v) => `${v} patients`}
                  />
                )}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" iconSize={7} />
              <Bar
                dataKey="onTrack"
                stackId="a"
                fill={WEIGHT_CONFIG.onTrack.color}
                name="On Track"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="needsAttention"
                stackId="a"
                fill={WEIGHT_CONFIG.needsAttention.color}
                name="Needs Attention"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
