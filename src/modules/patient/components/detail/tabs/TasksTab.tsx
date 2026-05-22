import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Bot,
  Check,
  ChevronDown,
  CircleDot,
  CheckCircle2,
  ClipboardList,
  Clock,
  Filter,
} from 'lucide-react';
import { StatusTabs } from '@/components/status-tabs';

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
type TaskFilter = 'current' | 'completed';
type StatusFilter = 'all' | 'Pending' | 'In Progress' | 'Overdue';

interface Task {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  assignedTo: string;
  assignedRole: string;
  status: TaskStatus;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CURRENT_TASKS: Task[] = [
  {
    id: 't-001',
    name: 'Blood Pressure Monitoring Review',
    createdBy: 'Dr. Michael Torres',
    createdAt: '04/29/2026',
    assignedTo: 'Maria Chen',
    assignedRole: 'Registered Nurse',
    status: 'In Progress',
  },
  {
    id: 't-002',
    name: 'Diabetes Education Session',
    createdBy: 'Eleanor Vance',
    createdAt: '04/28/2026',
    assignedTo: 'Ethan Brooks',
    assignedRole: 'Digital Health Navigator',
    status: 'Pending',
  },
  {
    id: 't-003',
    name: 'Medication Adherence Follow-Up',
    createdBy: 'Dr. Michael Torres',
    createdAt: '04/27/2026',
    assignedTo: 'Maria Chen',
    assignedRole: 'Registered Nurse',
    status: 'Overdue',
  },
  {
    id: 't-004',
    name: 'Monthly Weight & BMI Tracking',
    createdBy: 'System',
    createdAt: '04/26/2026',
    assignedTo: 'Ethan Brooks',
    assignedRole: 'Digital Health Navigator',
    status: 'Pending',
  },
  {
    id: 't-005',
    name: 'Care Plan Update — Q2 2026',
    createdBy: 'Eleanor Vance',
    createdAt: '04/25/2026',
    assignedTo: 'Dr. Michael Torres',
    assignedRole: 'Physician',
    status: 'In Progress',
  },
];

const COMPLETED_TASKS: Task[] = [
  {
    id: 't-101',
    name: 'Initial Device Setup — BP Cuff',
    createdBy: 'System',
    createdAt: '03/15/2026',
    assignedTo: 'Ethan Brooks',
    assignedRole: 'Digital Health Navigator',
    status: 'Completed',
  },
  {
    id: 't-102',
    name: 'Consent Form Collection',
    createdBy: 'Eleanor Vance',
    createdAt: '03/12/2026',
    assignedTo: 'Maria Chen',
    assignedRole: 'Registered Nurse',
    status: 'Completed',
  },
  {
    id: 't-103',
    name: 'Lab Results Review — HbA1c',
    createdBy: 'Dr. Michael Torres',
    createdAt: '03/08/2026',
    assignedTo: 'Dr. Michael Torres',
    assignedRole: 'Physician',
    status: 'Completed',
  },
  {
    id: 't-104',
    name: 'Q1 2026 Care Plan Review',
    createdBy: 'System',
    createdAt: '02/28/2026',
    assignedTo: 'Dr. Michael Torres',
    assignedRole: 'Physician',
    status: 'Completed',
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string; Icon: React.ElementType }> = {
  Pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock },
  'In Progress': { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border-blue-200', Icon: CircleDot },
  Completed: { label: 'Completed', className: 'bg-teal-50 text-teal-700 border-teal-200', Icon: CheckCircle2 },
  Overdue: { label: 'Overdue', className: 'bg-rose-50 text-rose-700 border-rose-200', Icon: AlertCircle },
};

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Pending', label: 'Pending' },
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Overdue', label: 'Overdue' },
];

const AVATAR_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
];

function nameToColor(name: string): string {
  const idx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// ─── Cells ────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TaskStatus }): React.JSX.Element {
  const cfg = STATUS_CONFIG[status];
  const { Icon } = cfg;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border',
        cfg.className
      )}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function PersonCell({ name, sub }: { name: string; sub?: string }): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0',
          nameToColor(name)
        )}
      >
        {name === 'System' ? <Bot size={10} /> : initials(name)}
      </div>
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium text-foreground truncate">{name}</p>
        {sub && <p className="text-[10.5px] text-muted-foreground truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TasksTab(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('current');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const baseTasks = activeFilter === 'current' ? CURRENT_TASKS : COMPLETED_TASKS;
  const tasks =
    activeFilter === 'current' && statusFilter !== 'all'
      ? baseTasks.filter((t) => t.status === statusFilter)
      : baseTasks;

  const activeStatusLabel = STATUS_FILTERS.find((f) => f.id === statusFilter)?.label ?? 'Status';

  const TABLE_HEADERS = ['Task Name', 'Created By', 'Created On', 'Assigned To', 'Status'];

  return (
    <div className="space-y-4">
      {/* ── Tabs + Status filter ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <StatusTabs
          tabs={[
            { value: 'current', label: 'Current Tasks', count: CURRENT_TASKS.length },
            { value: 'completed', label: 'Completed', count: COMPLETED_TASKS.length },
          ]}
          value={activeFilter}
          onChange={(v) => {
            setActiveFilter(v as TaskFilter);
            setStatusFilter('all');
            setDropdownOpen(false);
          }}
        />

        {/* Status filter dropdown — only for Current tab */}
        {activeFilter === 'current' && (
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className={cn(
                'h-8 px-3 flex items-center gap-2 rounded-lg border text-[12.5px] font-medium transition-colors',
                statusFilter !== 'all'
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-slate-200 bg-slate-50 text-foreground hover:bg-slate-100'
              )}
            >
              <Filter size={12} />
              {statusFilter === 'all' ? 'Status' : activeStatusLabel}
              <ChevronDown
                size={12}
                className={cn('text-muted-foreground transition-transform duration-150', dropdownOpen && 'rotate-180')}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-44 bg-white rounded-xl border border-slate-200 shadow-xs py-1.5 overflow-hidden">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(f.id);
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3.5 py-2.5 text-[12.5px] font-medium transition-colors text-left',
                      statusFilter === f.id ? 'bg-primary/5 text-primary' : 'text-foreground hover:bg-slate-50'
                    )}
                  >
                    {f.label}
                    {statusFilter === f.id && <Check size={12} className="text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
        {/* ── Table ───────────────────────────────────────────────────────────── */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-[#FAFAF9]">
              {TABLE_HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <ClipboardList size={22} className="text-slate-300" />
                    <p className="text-[13px] text-muted-foreground">No tasks found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Task Name */}
                  <td className="px-5 py-3.5 max-w-[220px]">
                    <p className="text-[13px] font-semibold text-foreground leading-snug">{task.name}</p>
                  </td>

                  {/* Created By */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <PersonCell name={task.createdBy} />
                  </td>

                  {/* Created On */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-[12.5px] text-foreground">{task.createdAt}</span>
                  </td>

                  {/* Assigned To */}
                  <td className="px-5 py-3.5">
                    <PersonCell name={task.assignedTo} sub={task.assignedRole} />
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <StatusBadge status={task.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">
            {tasks.length} {activeFilter === 'current' ? 'active' : 'completed'} tasks
          </span>
        </div>
      </div>
    </div>
  );
}
