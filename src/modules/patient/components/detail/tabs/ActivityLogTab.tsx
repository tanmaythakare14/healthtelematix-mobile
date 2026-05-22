import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category =
  | 'Vitals & Device Data'
  | 'Clinical Review & Decisions'
  | 'Patient Communication'
  | 'Care Coordination'
  | 'Program/Billing Events'
  | 'Alerts & System Events';

type AlertLevel = 'elevated' | 'critical' | null;

interface EventDetail {
  fields: { label: string; value: string }[];
}

interface ActivityEvent {
  id: string;
  category: Category;
  title: string;
  description: string;
  time: string;
  alert?: AlertLevel;
  actor: string;
  detail?: EventDetail;
}

interface DayGroup {
  label: string;
  date: string;
  daysAgo: number;
  events: ActivityEvent[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TIMELINE: DayGroup[] = [
  {
    label: 'Today',
    date: 'May 6, 2026',
    daysAgo: 0,
    events: [
      {
        id: 'e-001',
        category: 'Vitals & Device Data',
        title: 'Blood Pressure Reading Received',
        description: 'Automated reading from Blood Pressure Cuff: 148/92 mmHg — above target range.',
        time: '8:32 AM',
        alert: 'elevated',
        actor: 'Blood Pressure Cuff',
        detail: {
          fields: [
            { label: 'Reading', value: '148 / 92 mmHg' },
            { label: 'Vital Type', value: 'Blood Pressure' },
            { label: 'Device', value: 'Blood Pressure Cuff' },
            { label: 'Target Range', value: '< 130 / 80 mmHg' },
          ],
        },
      },
      {
        id: 'e-002',
        category: 'Vitals & Device Data',
        title: 'Fasting Glucose Reading Received',
        description: 'Morning fasting glucose from CGM (Dexcom / FreeStyle Libre): 138 mg/dL.',
        time: '7:00 AM',
        alert: 'elevated',
        actor: 'CGM (Dexcom / FreeStyle Libre)',
        detail: {
          fields: [
            { label: 'Reading', value: '138 mg/dL' },
            { label: 'Vital Type', value: 'Blood Glucose (Fasting)' },
            { label: 'Device', value: 'CGM (Dexcom / FreeStyle Libre)' },
            { label: 'Target Range', value: '80 – 130 mg/dL' },
          ],
        },
      },
      {
        id: 'e-003',
        category: 'Clinical Review & Decisions',
        title: 'Nurse Reviewed Elevated BP Reading',
        description:
          'RN Jessica Park reviewed the morning BP alert and messaged patient to confirm medication adherence.',
        time: '8:45 AM',
        alert: null,
        actor: 'RN Jessica Park',
        detail: {
          fields: [
            { label: 'Reading Reviewed', value: '148 / 92 mmHg' },
            { label: 'Reviewed By', value: 'RN Jessica Park' },
            { label: 'Action Taken', value: 'Patient messaged. Follow-up scheduled for tomorrow.' },
          ],
        },
      },
      {
        id: 'e-004',
        category: 'Alerts & System Events',
        title: 'RPM Compliance Threshold Warning',
        description: 'Patient has 12 of 16 required reading days this month. 4 more days needed to meet threshold.',
        time: '6:00 AM',
        alert: null,
        actor: 'System',
      },
    ],
  },
  {
    label: 'Yesterday',
    date: 'May 5, 2026',
    daysAgo: 1,
    events: [
      {
        id: 'e-005',
        category: 'Vitals & Device Data',
        title: 'Evening Blood Pressure Reading',
        description: 'Reading from Blood Pressure Cuff: 132/84 mmHg — within acceptable range.',
        time: '6:20 PM',
        alert: null,
        actor: 'Blood Pressure Cuff',
        detail: {
          fields: [
            { label: 'Reading', value: '132 / 84 mmHg' },
            { label: 'Vital Type', value: 'Blood Pressure' },
            { label: 'Device', value: 'Blood Pressure Cuff' },
          ],
        },
      },
      {
        id: 'e-006',
        category: 'Patient Communication',
        title: 'Staff Replied to Patient Message',
        description:
          "RN Jessica Park responded to the patient's question about Metformin timing and stomach discomfort.",
        time: '4:30 PM',
        alert: null,
        actor: 'RN Jessica Park',
      },
      {
        id: 'e-007',
        category: 'Alerts & System Events',
        title: 'AI Alert — Elevated Glucose Trend',
        description: 'Automated alert generated for elevated morning glucose trend over 3 consecutive days.',
        time: '9:05 AM',
        alert: 'elevated',
        actor: 'AI Engine',
      },
      {
        id: 'e-008',
        category: 'Vitals & Device Data',
        title: 'Morning Glucose Reading Received',
        description: 'Fasting glucose from CGM (Dexcom / FreeStyle Libre): 141 mg/dL.',
        time: '7:02 AM',
        alert: 'elevated',
        actor: 'CGM (Dexcom / FreeStyle Libre)',
        detail: {
          fields: [
            { label: 'Reading', value: '141 mg/dL' },
            { label: 'Vital Type', value: 'Blood Glucose (Fasting)' },
            { label: 'Device', value: 'CGM (Dexcom / FreeStyle Libre)' },
          ],
        },
      },
    ],
  },
  {
    label: 'May 3, 2026',
    date: 'May 3, 2026',
    daysAgo: 3,
    events: [
      {
        id: 'e-009',
        category: 'Clinical Review & Decisions',
        title: 'Care Plan Updated',
        description:
          'Dr. Michael Torres updated the Diabetes Management Plan with revised HbA1c targets and medication dosage.',
        time: '3:15 PM',
        alert: null,
        actor: 'Dr. Michael Torres',
        detail: {
          fields: [
            { label: 'Updated By', value: 'Dr. Michael Torres' },
            { label: 'Plan', value: 'Comprehensive Diabetes Management Plan' },
            { label: 'Change', value: 'HbA1c target revised to < 7.0%. Metformin dosage increased to 1000 mg.' },
          ],
        },
      },
      {
        id: 'e-010',
        category: 'Vitals & Device Data',
        title: 'Device Sync Completed',
        description: 'Blood Pressure Cuff synced 14 readings successfully. All data transmitted to RPM platform.',
        time: '11:00 AM',
        alert: null,
        actor: 'Blood Pressure Cuff',
        detail: {
          fields: [
            { label: 'Device', value: 'Blood Pressure Cuff' },
            { label: 'Readings Synced', value: '14' },
            { label: 'Status', value: 'All data transmitted successfully' },
          ],
        },
      },
      {
        id: 'e-011',
        category: 'Patient Communication',
        title: 'Patient Sent a Message',
        description: 'Patient asked about adjusting Metformin timing to reduce stomach discomfort after meals.',
        time: '9:30 AM',
        alert: null,
        actor: 'Sarah Mitchell',
      },
      {
        id: 'e-012',
        category: 'Care Coordination',
        title: 'Referral Sent to Endocrinologist',
        description:
          'Dr. Michael Torres sent a referral to Dr. Anita Sharma (Endocrinology) for specialist review of glucose management.',
        time: '8:00 AM',
        alert: null,
        actor: 'Dr. Michael Torres',
        detail: {
          fields: [
            { label: 'Referred To', value: 'Dr. Anita Sharma — Endocrinology' },
            { label: 'Reason', value: 'Persistent elevated fasting glucose despite medication adjustment' },
            { label: 'Urgency', value: 'Routine (within 2 weeks)' },
          ],
        },
      },
    ],
  },
  {
    label: 'April 28, 2026',
    date: 'April 28, 2026',
    daysAgo: 8,
    events: [
      {
        id: 'e-013',
        category: 'Program/Billing Events',
        title: 'RPM Billing Code Generated',
        description: 'CPT 99457 generated for April — 20+ minutes of staff interaction time logged.',
        time: '5:00 PM',
        alert: null,
        actor: 'System',
        detail: {
          fields: [
            { label: 'CPT Code', value: '99457' },
            { label: 'Billing Month', value: 'April 2026' },
            { label: 'Staff Interaction', value: '24 min logged' },
            { label: 'Reading Days', value: '18 / 16 required' },
          ],
        },
      },
      {
        id: 'e-014',
        category: 'Care Coordination',
        title: 'Appointment Scheduled',
        description: 'Follow-up telehealth appointment scheduled with Dr. Michael Torres for May 10, 2026 at 2:00 PM.',
        time: '2:30 PM',
        alert: null,
        actor: 'DHN Ethan Brooks',
      },
      {
        id: 'e-015',
        category: 'Clinical Review & Decisions',
        title: 'Monthly Physician Review Completed',
        description:
          'Dr. Michael Torres completed the monthly RPM data review. BP trend improving; glucose requires monitoring.',
        time: '11:30 AM',
        alert: null,
        actor: 'Dr. Michael Torres',
        detail: {
          fields: [
            { label: 'Reviewed By', value: 'Dr. Michael Torres' },
            { label: 'BP Assessment', value: 'Improving — average 134/86 mmHg' },
            { label: 'Glucose Assessment', value: 'Requires monitoring — 3-day elevated trend' },
            { label: 'Next Review', value: 'May 28, 2026' },
          ],
        },
      },
    ],
  },
  {
    label: 'April 20, 2026',
    date: 'April 20, 2026',
    daysAgo: 16,
    events: [
      {
        id: 'e-016',
        category: 'Program/Billing Events',
        title: 'Patient Enrolled in RPM Program',
        description: 'Sarah Mitchell successfully enrolled in the Remote Patient Monitoring (RPM) program.',
        time: '10:00 AM',
        alert: null,
        actor: 'RN Jessica Park',
        detail: {
          fields: [
            { label: 'Program', value: 'Remote Patient Monitoring (RPM)' },
            { label: 'Enrolled By', value: 'RN Jessica Park' },
            { label: 'Devices Assigned', value: 'Blood Pressure Cuff, CGM (Dexcom / FreeStyle Libre), Weight Scale' },
          ],
        },
      },
      {
        id: 'e-017',
        category: 'Program/Billing Events',
        title: 'Patient Consent Recorded',
        description:
          'Written consent obtained for RPM program participation, data collection, and cost-sharing disclosure.',
        time: '9:45 AM',
        alert: null,
        actor: 'RN Jessica Park',
      },
      {
        id: 'e-018',
        category: 'Alerts & System Events',
        title: 'Device Setup Confirmed',
        description:
          'Blood Pressure Cuff, CGM (Dexcom / FreeStyle Libre), and Weight Scale successfully paired and transmitted first readings.',
        time: '9:00 AM',
        alert: null,
        actor: 'System',
      },
    ],
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const ALERT_STYLE: Record<'elevated' | 'critical', { badge: string; leftBar: string }> = {
  elevated: { badge: 'bg-amber-50 text-amber-700 border-amber-200', leftBar: 'border-l-amber-400' },
  critical: { badge: 'bg-rose-50 text-rose-600 border-rose-200', leftBar: 'border-l-rose-500' },
};

const CATEGORY_CONFIG: Record<Category, { dot: string; bg: string; text: string }> = {
  'Vitals & Device Data': { dot: 'bg-rose-400', bg: 'bg-rose-50', text: 'text-rose-600' },
  'Clinical Review & Decisions': { dot: 'bg-violet-400', bg: 'bg-violet-50', text: 'text-violet-600' },
  'Patient Communication': { dot: 'bg-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  'Care Coordination': { dot: 'bg-sky-400', bg: 'bg-sky-50', text: 'text-sky-600' },
  'Program/Billing Events': { dot: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-600' },
  'Alerts & System Events': { dot: 'bg-slate-400', bg: 'bg-slate-100', text: 'text-slate-500' },
};

// ─── Category Tag ─────────────────────────────────────────────────────────────

function CategoryTag({ category }: { category: Category }): React.JSX.Element {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {category}
    </span>
  );
}

// ─── Detail Field ─────────────────────────────────────────────────────────────

function DetailField({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.07em] mb-0.5">{label}</p>
      <p className="text-[13px] font-medium text-foreground leading-snug">{value}</p>
    </div>
  );
}

// ─── Event Row ────────────────────────────────────────────────────────────────

function EventRow({ event }: { event: ActivityEvent }): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = !!event.detail;
  const alertStyle = event.alert ? ALERT_STYLE[event.alert] : null;

  return (
    <div
      className={cn('border-b border-slate-100 last:border-0', alertStyle && `border-l-[3px] ${alertStyle.leftBar}`)}
    >
      {/* Main row */}
      <div
        className={cn(
          'flex items-start justify-between gap-4 px-5 py-3.5',
          hasDetail && 'cursor-pointer hover:bg-slate-50/60 transition-colors'
        )}
        onClick={() => hasDetail && setExpanded((o) => !o)}
      >
        <div className="min-w-0 flex-1">
          {/* Title + alert badge */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[13px] font-semibold text-foreground leading-tight">{event.title}</span>
            {event.alert && (
              <span
                className={cn(
                  'inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full border',
                  ALERT_STYLE[event.alert].badge
                )}
              >
                {event.alert.charAt(0).toUpperCase() + event.alert.slice(1)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-[12px] text-muted-foreground leading-relaxed mb-1.5">{event.description}</p>

          {/* Category tag + actor */}
          <div className="flex items-center gap-2">
            <CategoryTag category={event.category} />
            <span className="text-slate-300 text-[10px]">·</span>
            <span className="text-[11px] text-muted-foreground">{event.actor}</span>
          </div>
        </div>

        {/* Time + chevron */}
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          <span className="text-[11.5px] text-muted-foreground font-medium tabular-nums">{event.time}</span>
          {hasDetail && (
            <span className="text-slate-300 ml-0.5">
              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {hasDetail && expanded && event.detail && (
        <div className="mx-5 mb-3.5 rounded-xl border border-slate-100 bg-slate-50/50 px-5 py-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3.5">
            {event.detail.fields.map((f) => (
              <DetailField key={f.label} label={f.label} value={f.value} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Filter Config ────────────────────────────────────────────────────────────

type FilterRange = 'week' | '15days' | '30days' | 'all';

const FILTERS: { key: FilterRange; label: string; maxDays: number | null }[] = [
  { key: 'week', label: 'Last Week', maxDays: 7 },
  { key: '15days', label: 'Last 15 Days', maxDays: 15 },
  { key: '30days', label: 'Last 30 Days', maxDays: 30 },
  { key: 'all', label: 'All Time', maxDays: null },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ActivityLogTab(): React.JSX.Element {
  const [filter, setFilter] = useState<FilterRange>('all');

  const activeCfg = FILTERS.find((f) => f.key === filter)!;

  const filteredTimeline = TIMELINE.filter((g) => activeCfg.maxDays === null || g.daysAgo <= activeCfg.maxDays);

  return (
    <div className="space-y-5">
      {/* ── Date range filter ────────────────────────────────────────────────── */}
      <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 border border-slate-200">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-3 py-1 rounded-md text-[11.5px] font-semibold transition-all',
              filter === f.key
                ? 'bg-white text-foreground shadow-xs border border-slate-200'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────────── */}
      {filteredTimeline.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
          <Activity size={28} className="text-slate-200" />
          <p className="text-[13px] text-muted-foreground">No activity found for this period.</p>
        </div>
      )}

      {/* ── Timeline groups ───────────────────────────────────────────────────── */}
      {filteredTimeline.map((group) => (
        <div key={group.date}>
          {/* Day divider */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-bold text-muted-foreground">
                {group.label === 'Today' || group.label === 'Yesterday' ? `${group.label} — ${group.date}` : group.date}
              </span>
              <div className="h-px w-20 bg-slate-100" />
            </div>
            <span className="text-[11px] text-muted-foreground">{group.events.length} events</span>
          </div>

          {/* Events card */}
          <div className="rounded-[14px] border border-slate-200 bg-white shadow-xs overflow-hidden">
            {group.events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
