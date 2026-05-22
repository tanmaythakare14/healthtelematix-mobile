import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { secureLocalStorage } from '@/utils/secureStorage';
import { USER_LIST_STORAGE_KEY } from '@/modules/user-management/constants';
import type { UserListItem } from '@/modules/user-management/@types';
import { StatusTabs } from '@/components/status-tabs';

// ─── Types ────────────────────────────────────────────────────────────────────

type AppointmentType = 'In-Person' | 'Telemedicine' | 'Phone Call';
type AppointmentStatus = 'upcoming' | 'completed';

interface AppointmentTemplate {
  id: string;
  physicianIndex: number; // index into the physicians array (cycled if fewer physicians)
  date: string;
  time: string;
  type: AppointmentType;
  note: string;
  status: AppointmentStatus;
}

// ─── Dummy physician fallback ─────────────────────────────────────────────────

const DUMMY_PHYSICIANS = [
  { name: 'Dr. Michael Torres', specialty: 'Internal Medicine' },
  { name: 'Dr. Sarah Collins', specialty: 'Cardiology' },
  { name: 'Dr. James Patel', specialty: 'Endocrinology' },
];

// ─── Static appointment templates (physician resolved at runtime) ──────────────

const APPOINTMENT_TEMPLATES: AppointmentTemplate[] = [
  {
    id: 'appt-001',
    physicianIndex: 0,
    date: 'May 5, 2026',
    time: '10:00 AM',
    type: 'In-Person',
    note: 'Routine follow-up for blood pressure management and medication review.',
    status: 'upcoming',
  },
  {
    id: 'appt-002',
    physicianIndex: 1,
    date: 'May 14, 2026',
    time: '2:30 PM',
    type: 'Telemedicine',
    note: 'Cardiology consult — review recent ECG results and adjust treatment plan.',
    status: 'upcoming',
  },
  {
    id: 'appt-003',
    physicianIndex: 0,
    date: 'Jun 2, 2026',
    time: '9:00 AM',
    type: 'Phone Call',
    note: 'Lab results discussion — HbA1c and lipid panel follow-up.',
    status: 'upcoming',
  },
  {
    id: 'appt-004',
    physicianIndex: 0,
    date: 'Mar 18, 2026',
    time: '11:00 AM',
    type: 'In-Person',
    note: 'Annual physical exam. Reviewed vitals, updated prescriptions for metformin.',
    status: 'completed',
  },
  {
    id: 'appt-005',
    physicianIndex: 2,
    date: 'Feb 7, 2026',
    time: '3:00 PM',
    type: 'Telemedicine',
    note: 'Diabetes management consultation. HbA1c at 7.4%, adjusted insulin dosage.',
    status: 'completed',
  },
  {
    id: 'appt-006',
    physicianIndex: 1,
    date: 'Jan 22, 2026',
    time: '1:15 PM',
    type: 'In-Person',
    note: 'Post-hypertension episode check. BP stabilised at 132/84. Continue current medication.',
    status: 'completed',
  },
  {
    id: 'appt-007',
    physicianIndex: 0,
    date: 'Dec 10, 2025',
    time: '10:30 AM',
    type: 'Phone Call',
    note: 'Flu symptoms check-in. Recommended rest and fluids. No medication change.',
    status: 'completed',
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

// ─── Appointment Card ─────────────────────────────────────────────────────────

interface ResolvedAppointment extends AppointmentTemplate {
  physicianName: string;
  physicianSpecialty: string;
}

function AppointmentCard({ appt }: { appt: ResolvedAppointment }): React.JSX.Element {
  return (
    <div className="rounded-[14px] border bg-white border-slate-200 shadow-xs p-5 transition-all flex flex-col gap-4">
      {/* Row 1 — Physician */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 border-primary/20">
          <User size={15} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-tight text-foreground truncate">{appt.physicianName}</p>
          <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">{appt.physicianSpecialty}</p>
        </div>
      </div>

      {/* Row 2 — Date & Time */}
      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
          <Calendar size={13} className="text-muted-foreground shrink-0" />
          <div>
            <p className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-[0.06em]">Date</p>
            <p className="text-[12.5px] font-semibold text-foreground leading-tight">{appt.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
          <Clock size={13} className="text-muted-foreground shrink-0" />
          <div>
            <p className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-[0.06em]">Time</p>
            <p className="text-[12.5px] font-semibold text-foreground leading-tight">{appt.time}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type SubTab = 'upcoming' | 'completed';

export function AppointmentsTab(): React.JSX.Element {
  const [subTab, setSubTab] = useState<SubTab>('upcoming');

  const appointments = useMemo<ResolvedAppointment[]>(() => {
    const physicians = (secureLocalStorage.getItemObject<UserListItem[]>(USER_LIST_STORAGE_KEY) ?? []).filter(
      (u) => u.type === 'PHYSICIAN' && u.status === 'Active'
    );

    return APPOINTMENT_TEMPLATES.map((tmpl) => {
      const physician = physicians.length > 0 ? physicians[tmpl.physicianIndex % physicians.length] : null;

      const dummy = DUMMY_PHYSICIANS[tmpl.physicianIndex % DUMMY_PHYSICIANS.length];
      return {
        ...tmpl,
        physicianName: physician ? physician.fullName : dummy.name,
        physicianSpecialty: physician?.specialty || dummy.specialty,
      };
    });
  }, []);

  const upcoming = appointments.filter((a) => a.status === 'upcoming');
  const completed = appointments.filter((a) => a.status === 'completed');
  const list = subTab === 'upcoming' ? upcoming : completed;

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <StatusTabs
        tabs={[
          { value: 'upcoming', label: 'Upcoming', count: upcoming.length },
          { value: 'completed', label: 'Completed', count: completed.length },
        ]}
        value={subTab}
        onChange={(v) => setSubTab(v as SubTab)}
        className="w-fit"
      />

      {/* Cards */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Calendar size={22} className="text-muted-foreground" />
          </div>
          <p className="text-[13.5px] font-semibold text-foreground mb-1">No {subTab} appointments</p>
          <p className="text-sm text-muted-foreground">
            {subTab === 'upcoming'
              ? 'No appointments scheduled yet.'
              : 'No completed appointments in the last 12 months.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {list.map((appt) => (
            <AppointmentCard key={appt.id} appt={appt} />
          ))}
        </div>
      )}
    </div>
  );
}
