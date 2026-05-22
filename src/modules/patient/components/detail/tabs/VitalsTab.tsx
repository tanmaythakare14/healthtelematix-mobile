import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  type ChartOptions,
  type ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Search, ChevronDown, MonitorSmartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = '24h' | '7d' | '30d' | '90d';
type VitalFilter = 'All Vitals' | 'BP' | 'HR' | 'Weight' | 'Glucose';
type StatusFilter = 'All Statuses' | 'Normal' | 'Borderline' | 'Critical';
type SourceFilter = 'All Sources' | 'RPM Device' | 'EHR';

// ─── Mock Data Generation ─────────────────────────────────────────────────────

function genDates(days: number): string[] {
  const result: string[] = [];
  const end = new Date('2026-04-08');
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    result.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return result;
}

function jitter(base: number, range: number): number {
  return Math.round((base + (Math.random() - 0.5) * range) * 10) / 10;
}

const DATES_90 = genDates(90);
const DATES_30 = genDates(30);
const DATES_7 = genDates(7);

const BP_SYS_90 = DATES_90.map(() => jitter(128, 30));
const BP_DIA_90 = DATES_90.map(() => jitter(78, 16));
const HR_90 = DATES_90.map(() => jitter(76, 24));
const WEIGHT_90 = DATES_90.map(() => jitter(184, 10));
const GLUCOSE_90 = DATES_90.map(() => jitter(132, 50));

function sliceByRange(arr: number[], range: TimeRange): number[] {
  if (range === '90d') return arr;
  if (range === '30d') return arr.slice(-30);
  if (range === '7d') return arr.slice(-7);
  return arr.slice(-1);
}

function labelsByRange(range: TimeRange): string[] {
  if (range === '90d') return DATES_90;
  if (range === '30d') return DATES_30;
  if (range === '7d') return DATES_7;
  return ['Today'];
}

// ─── Mock History Rows ────────────────────────────────────────────────────────

interface VitalRow {
  id: string;
  date: string;
  time: string;
  vitalType: 'Blood Pressure' | 'Heart Rate' | 'Weight' | 'Glucose';
  reading: string;
  unit: string;
  status: 'Normal' | 'Borderline' | 'Critical';
  sourceName: string;
  sourceDevice?: string;
  enteredBy: string;
  isOutOfRange: boolean;
}

const MOCK_HISTORY: VitalRow[] = [
  {
    id: 'v-01',
    date: 'Apr 8, 2026',
    time: '7:28 AM',
    vitalType: 'Blood Pressure',
    reading: '135/84',
    unit: 'mmHg',
    status: 'Borderline',
    sourceName: 'EHR',
    enteredBy: 'EHR',
    isOutOfRange: true,
  },
  {
    id: 'v-02',
    date: 'Apr 8, 2026',
    time: '11:08 AM',
    vitalType: 'Heart Rate',
    reading: '76',
    unit: 'bpm',
    status: 'Normal',
    sourceName: 'RPM Device',
    sourceDevice: 'Blood Pressure Cuff',
    enteredBy: 'Device',
    isOutOfRange: false,
  },
  {
    id: 'v-03',
    date: 'Apr 8, 2026',
    time: '15:12 PM',
    vitalType: 'Weight',
    reading: '183',
    unit: 'lbs',
    status: 'Normal',
    sourceName: 'RPM Device',
    sourceDevice: 'Weight Scale',
    enteredBy: 'Device',
    isOutOfRange: false,
  },
  {
    id: 'v-04',
    date: 'Apr 7, 2026',
    time: '7:03 AM',
    vitalType: 'Glucose',
    reading: '145',
    unit: 'mg/dL',
    status: 'Borderline',
    sourceName: 'RPM Device',
    sourceDevice: 'Dexcom CGM',
    enteredBy: 'Device',
    isOutOfRange: true,
  },
  {
    id: 'v-05',
    date: 'Apr 7, 2026',
    time: '11:58 AM',
    vitalType: 'Blood Pressure',
    reading: '138/79',
    unit: 'mmHg',
    status: 'Borderline',
    sourceName: 'RPM Device',
    sourceDevice: 'Blood Pressure Cuff',
    enteredBy: 'Device',
    isOutOfRange: true,
  },
  {
    id: 'v-06',
    date: 'Apr 7, 2026',
    time: '15:36 PM',
    vitalType: 'Heart Rate',
    reading: '88',
    unit: 'bpm',
    status: 'Normal',
    sourceName: 'RPM Device',
    sourceDevice: 'Blood Pressure Cuff',
    enteredBy: 'Device',
    isOutOfRange: false,
  },
  {
    id: 'v-07',
    date: 'Apr 6, 2026',
    time: '7:34 AM',
    vitalType: 'Weight',
    reading: '184',
    unit: 'lbs',
    status: 'Normal',
    sourceName: 'RPM Device',
    sourceDevice: 'Weight Scale',
    enteredBy: 'Device',
    isOutOfRange: false,
  },
  {
    id: 'v-08',
    date: 'Apr 6, 2026',
    time: '11:02 AM',
    vitalType: 'Glucose',
    reading: '120',
    unit: 'mg/dL',
    status: 'Normal',
    sourceName: 'EHR',
    enteredBy: 'EHR',
    isOutOfRange: false,
  },
  {
    id: 'v-09',
    date: 'Apr 6, 2026',
    time: '15:42 PM',
    vitalType: 'Blood Pressure',
    reading: '123/77',
    unit: 'mmHg',
    status: 'Normal',
    sourceName: 'RPM Device',
    sourceDevice: 'Blood Pressure Cuff',
    enteredBy: 'Device',
    isOutOfRange: false,
  },
  {
    id: 'v-10',
    date: 'Apr 5, 2026',
    time: '7:34 AM',
    vitalType: 'Heart Rate',
    reading: '77',
    unit: 'bpm',
    status: 'Normal',
    sourceName: 'RPM Device',
    sourceDevice: 'Blood Pressure Cuff',
    enteredBy: 'Device',
    isOutOfRange: false,
  },
  {
    id: 'v-11',
    date: 'Apr 5, 2026',
    time: '11:56 AM',
    vitalType: 'Weight',
    reading: '188',
    unit: 'lbs',
    status: 'Borderline',
    sourceName: 'RPM Device',
    sourceDevice: 'Weight Scale',
    enteredBy: 'Device',
    isOutOfRange: true,
  },
  {
    id: 'v-12',
    date: 'Apr 5, 2026',
    time: '15:57 PM',
    vitalType: 'Glucose',
    reading: '123',
    unit: 'mg/dL',
    status: 'Normal',
    sourceName: 'EHR',
    enteredBy: 'EHR',
    isOutOfRange: false,
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<string, string> = {
  Normal: 'bg-teal-50 text-teal-700 border-teal-100',
  Borderline: 'bg-amber-50 text-amber-700 border-amber-100',
  Critical: 'bg-rose-50 text-rose-700 border-rose-100',
};

const STATUS_DOT: Record<string, string> = {
  Normal: 'bg-emerald-500',
  Borderline: 'bg-amber-500',
  Critical: 'bg-rose-500',
};

const VITAL_DOT: Record<string, string> = {
  'Blood Pressure': 'bg-rose-500',
  'Heart Rate': 'bg-amber-500',
  Weight: 'bg-blue-500',
  Glucose: 'bg-violet-500',
};

const VITAL_COLOR: Record<string, string> = {
  'Blood Pressure': 'text-rose-500',
  'Heart Rate': 'text-amber-500',
  Weight: 'text-blue-500',
  Glucose: 'text-violet-500',
};

// ─── Normal range bands (painted as a gradient stop on the chart) ─────────────

function makeLineOptions(yMin: number, yMax: number, normalLow: number, normalHigh: number): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#cbd5e1',
        bodyColor: '#f1f5f9',
        padding: 10,
        cornerRadius: 8,
        titleFont: { size: 11 },
        bodyFont: { size: 12, weight: 'bold' },
        yAlign: 'bottom',
        usePointStyle: true,
        boxWidth: 7,
        boxHeight: 7,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 }, maxTicksLimit: 8, maxRotation: 0 },
      },
      y: {
        min: yMin,
        max: yMax,
        grid: { color: '#f1f5f9' },
        border: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 }, stepSize: Math.round((yMax - yMin) / 4) },
      },
    },
    elements: { point: { radius: 0, hoverRadius: 4 }, line: { tension: 0.4, borderWidth: 2 } },
    interaction: { mode: 'index', intersect: false },
    // paint normal band via a background plugin
    _normalBand: { low: normalLow, high: normalHigh },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

// Custom plugin to draw the normal-range band
const normalBandPlugin = {
  id: 'normalBand',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeDraw(chart: any) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (chart.options as any)._normalBand as { low: number; high: number } | undefined;
    if (!meta) return;
    const y1 = scales.y.getPixelForValue(meta.high);
    const y2 = scales.y.getPixelForValue(meta.low);
    ctx.save();
    ctx.fillStyle = 'rgba(209,250,229,0.45)';
    ctx.fillRect(chartArea.left, y1, chartArea.right - chartArea.left, y2 - y1);
    ctx.restore();
  },
};

ChartJS.register(normalBandPlugin);

function makeDataset(
  label: string,
  data: number[],
  color: string,
  dashed = false
): ChartData<'line'>['datasets'][number] {
  return {
    label,
    data,
    borderColor: color,
    backgroundColor: 'transparent',
    borderDash: dashed ? [5, 4] : [],
    pointRadius: 0,
    pointHoverRadius: 4,
    tension: 0.4,
    borderWidth: 2,
  };
}

// ─── Chart card ───────────────────────────────────────────────────────────────

function ChartCard({
  title,
  dotClass,
  currentValue,
  unit,
  valueClass,
  chartData,
  chartOptions,
  legend,
  source,
  normalLabel,
}: {
  title: string;
  dotClass: string;
  currentValue: string;
  unit: string;
  valueClass: string;
  chartData: ChartData<'line'>;
  chartOptions: ChartOptions<'line'>;
  legend?: React.ReactNode;
  source: string;
  normalLabel: string;
}): React.JSX.Element {
  return (
    <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full shrink-0', dotClass)} />
          <span className="text-[13px] font-bold text-foreground">{title}</span>
          <span className="text-slate-300 text-[11px]">·</span>
          <span className="text-[11px] text-muted-foreground">{source}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-[22px] font-bold leading-none', valueClass)}>{currentValue}</span>
          <span className="text-[11px] text-muted-foreground">{unit}</span>
        </div>
      </div>

      <div className="h-[180px]">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-slate-100">
        <div className="flex items-center gap-4">{legend ?? <span />}</div>
        <span className="text-[11px] text-muted-foreground">Normal: {normalLabel}</span>
      </div>
    </div>
  );
}

// ─── Devices map ─────────────────────────────────────────────────────────────

const DEVICE_VITAL_MAP: Record<string, VitalFilter[]> = {
  'Blood Pressure Cuff': ['BP', 'HR'],
  'CGM (Dexcom / FreeStyle Libre)': ['Glucose'],
  'Weight Scale': ['Weight'],
};

// ─── Dropdown ─────────────────────────────────────────────────────────────────

function FilterDropdown({
  value,
  defaultLabel,
  options,
  onChange,
}: {
  value: string;
  defaultLabel: string;
  options: string[];
  onChange: (v: string) => void;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = value !== options[0];

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'h-8 px-3 flex items-center gap-1.5 rounded-lg border text-[12.5px] font-medium transition-colors',
          isActive
            ? 'border-primary/40 bg-primary/5 text-primary'
            : 'border-slate-200 bg-slate-50 text-foreground hover:bg-slate-100'
        )}
      >
        {isActive ? value : defaultLabel}
        <ChevronDown
          size={12}
          className={cn('text-muted-foreground transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[160px] bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden py-1.5">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                'w-full flex items-center px-3.5 py-2.5 text-[13px] font-medium transition-colors text-left',
                value === opt ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-slate-50'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VitalsTab({ devices }: { devices: string[] }): React.JSX.Element {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartVitalFilter, setChartVitalFilter] = useState<VitalFilter>('BP');
  const [historySearch, setHistorySearch] = useState('');
  const [historyVital, setHistoryVital] = useState<VitalFilter | 'All Vitals'>('All Vitals');
  const [historyStatus, setHistoryStatus] = useState<StatusFilter>('All Statuses');
  const [historySource, setHistorySource] = useState<SourceFilter>('All Sources');

  const activeVitals = [...new Set(devices.flatMap((d) => DEVICE_VITAL_MAP[d] ?? []))] as VitalFilter[];
  const labels = labelsByRange(timeRange);

  const bpSys = useMemo(() => sliceByRange(BP_SYS_90, timeRange), [timeRange]);
  const bpDia = useMemo(() => sliceByRange(BP_DIA_90, timeRange), [timeRange]);
  const hr = useMemo(() => sliceByRange(HR_90, timeRange), [timeRange]);
  const weight = useMemo(() => sliceByRange(WEIGHT_90, timeRange), [timeRange]);
  const glucose = useMemo(() => sliceByRange(GLUCOSE_90, timeRange), [timeRange]);

  const showBP = activeVitals.includes('BP') && (chartVitalFilter === 'All Vitals' || chartVitalFilter === 'BP');
  const showHR = activeVitals.includes('HR') && (chartVitalFilter === 'All Vitals' || chartVitalFilter === 'HR');
  const showWeight =
    activeVitals.includes('Weight') && (chartVitalFilter === 'All Vitals' || chartVitalFilter === 'Weight');
  const showGlucose =
    activeVitals.includes('Glucose') && (chartVitalFilter === 'All Vitals' || chartVitalFilter === 'Glucose');

  const filteredHistory = useMemo(() => {
    return MOCK_HISTORY.filter((r) => {
      if (historyVital !== 'All Vitals') {
        const map: Record<string, string> = {
          BP: 'Blood Pressure',
          HR: 'Heart Rate',
          Weight: 'Weight',
          Glucose: 'Glucose',
        };
        if (r.vitalType !== map[historyVital]) return false;
      }
      if (historyStatus !== 'All Statuses' && r.status !== historyStatus) return false;
      if (historySource !== 'All Sources' && r.sourceName !== historySource) return false;
      if (historySearch) {
        const q = historySearch.toLowerCase();
        if (!r.vitalType.toLowerCase().includes(q) && !r.reading.includes(q) && !r.date.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [historySearch, historyVital, historyStatus, historySource]);

  // ── No devices empty state
  if (activeVitals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <MonitorSmartphone size={26} className="text-muted-foreground" />
        </div>
        <p className="text-[14px] font-semibold text-foreground mb-1">No Devices Assigned</p>
        <p className="text-sm text-muted-foreground max-w-[320px] leading-relaxed">
          No RPM devices are connected to this patient. Assign devices to start tracking vitals automatically.
        </p>
      </div>
    );
  }

  const bpOptions = {
    ...makeLineOptions(60, 175, 90, 130),
    _normalBand: { low: 90, high: 130 },
  } as ChartOptions<'line'>;

  const hrOptions = {
    ...makeLineOptions(40, 130, 60, 100),
    _normalBand: { low: 60, high: 100 },
  } as ChartOptions<'line'>;

  const weightOptions = {
    ...makeLineOptions(160, 200, 170, 185),
    _normalBand: { low: 170, high: 185 },
  } as ChartOptions<'line'>;

  const glucoseOptions = {
    ...makeLineOptions(45, 190, 70, 130),
    _normalBand: { low: 70, high: 130 },
  } as ChartOptions<'line'>;

  return (
    <div className="space-y-6">
      {/* ── Trend Charts ── */}
      <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
        {/* Chart toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-foreground">Vital Trend Charts</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Time range */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
              {(['24h', '7d', '30d', '90d'] as TimeRange[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeRange(t)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-[11.5px] font-medium transition-all',
                    timeRange === t
                      ? 'bg-white text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === '24h' ? '24 Hours' : t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>

            {/* Vital type filter */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
              {activeVitals.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setChartVitalFilter(v)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-[11.5px] font-medium transition-all whitespace-nowrap',
                    chartVitalFilter === v
                      ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Charts grid */}
        {(() => {
          const cards: React.ReactNode[] = [];
          if (showBP)
            cards.push(
              <ChartCard
                key="bp"
                title="Blood Pressure"
                dotClass="bg-rose-500"
                currentValue={`${bpSys[bpSys.length - 1]}/${bpDia[bpDia.length - 1]}`}
                unit="mmHg"
                valueClass="text-rose-500"
                chartData={{
                  labels,
                  datasets: [
                    makeDataset('Systolic', bpSys, '#ef4444'),
                    makeDataset('Diastolic', bpDia, '#fb923c', true),
                  ],
                }}
                chartOptions={bpOptions}
                legend={
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-5 h-0.5 bg-rose-500 rounded" />
                      <span className="text-[11px] text-muted-foreground">Systolic</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-5 h-0.5 bg-orange-400 rounded border-dashed"
                        style={{ borderTop: '2px dashed #fb923c', background: 'none' }}
                      />
                      <span className="text-[11px] text-muted-foreground">Diastolic</span>
                    </div>
                  </div>
                }
                source="Blood Pressure Cuff"
                normalLabel="90–130 mmHg"
              />
            );
          if (showHR)
            cards.push(
              <ChartCard
                key="hr"
                title="Heart Rate"
                dotClass="bg-amber-500"
                currentValue={String(hr[hr.length - 1])}
                unit="bpm"
                valueClass="text-amber-600"
                chartData={{ labels, datasets: [makeDataset('Heart Rate', hr, '#d97706')] }}
                chartOptions={hrOptions}
                source="Blood Pressure Cuff"
                normalLabel="60–100 bpm"
              />
            );
          if (showWeight)
            cards.push(
              <ChartCard
                key="weight"
                title="Weight"
                dotClass="bg-blue-500"
                currentValue={String(weight[weight.length - 1])}
                unit="lbs"
                valueClass="text-blue-500"
                chartData={{ labels, datasets: [makeDataset('Weight', weight, '#3b82f6')] }}
                chartOptions={weightOptions}
                source="Weight Scale"
                normalLabel="170–185 lbs"
              />
            );
          if (showGlucose)
            cards.push(
              <ChartCard
                key="glucose"
                title="Glucose"
                dotClass="bg-violet-500"
                currentValue={String(glucose[glucose.length - 1])}
                unit="mg/dL"
                valueClass="text-violet-500"
                chartData={{ labels, datasets: [makeDataset('Glucose', glucose, '#8b5cf6')] }}
                chartOptions={glucoseOptions}
                source="Dexcom CGM"
                normalLabel="70–130 mg/dL"
              />
            );

          if (cards.length === 1) {
            return <div className="p-5">{cards[0]}</div>;
          }
          if (cards.length === 3) {
            return (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {cards[0]}
                  {cards[1]}
                </div>
                <div>{cards[2]}</div>
              </div>
            );
          }
          return <div className="p-5 grid grid-cols-2 gap-4">{cards}</div>;
        })()}
      </div>

      {/* ── Vital History ── */}
      <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
        {/* History toolbar — heading + filters inline */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
          <span className="text-[13px] font-bold text-foreground shrink-0">Vital History</span>
          <div className="flex items-center gap-2.5 ml-auto">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                placeholder="Search readings..."
                className="pl-8 h-8 w-48 text-[12.5px]"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>
            <FilterDropdown
              value={historyVital}
              defaultLabel="All Vitals"
              options={['All Vitals', 'BP', 'HR', 'Weight', 'Glucose']}
              onChange={(v) => setHistoryVital(v as VitalFilter)}
            />
            <FilterDropdown
              value={historyStatus}
              defaultLabel="All Statuses"
              options={['All Statuses', 'Normal', 'Borderline', 'Critical']}
              onChange={(v) => setHistoryStatus(v as StatusFilter)}
            />
            <FilterDropdown
              value={historySource}
              defaultLabel="All Sources"
              options={['All Sources', 'RPM Device', 'EHR']}
              onChange={(v) => setHistorySource(v as SourceFilter)}
            />
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-[#FAFAF9]">
              {['Date & Time', 'Vital Type', 'Reading', 'Status', 'Source', 'Entered By'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  No readings match your filters.
                </td>
              </tr>
            ) : (
              filteredHistory.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-semibold text-foreground">{row.date}</p>
                    <p className="text-[11px] text-muted-foreground">{row.time}</p>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full shrink-0', VITAL_DOT[row.vitalType])} />
                      <span className="text-[13px] text-foreground">{row.vitalType}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        'text-[13px] font-semibold',
                        row.isOutOfRange ? VITAL_COLOR[row.vitalType] : 'text-foreground'
                      )}
                    >
                      {row.reading}
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-1">{row.unit}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
                        STATUS_CLASS[row.status]
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[row.status])} />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[13px] text-foreground">{row.sourceName}</p>
                    {row.sourceDevice && <p className="text-[11px] text-muted-foreground">{row.sourceDevice}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[13px] text-foreground">{row.enteredBy}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">{filteredHistory.length} readings</span>
          <div className="flex items-center gap-3 text-[12.5px] font-semibold text-muted-foreground">
            <button type="button" className="hover:text-foreground transition-colors">
              Prev
            </button>
            <span className="text-foreground">1 / 2</span>
            <button type="button" className="hover:text-foreground transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
