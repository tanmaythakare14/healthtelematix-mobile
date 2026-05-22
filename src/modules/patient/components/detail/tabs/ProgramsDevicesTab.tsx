import React from 'react';
import { Activity, Brain, Calendar, HeartPulse, MonitorSmartphone, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProgramType } from '@/modules/patient/@types';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProgramCode = 'APCM' | 'RPM' | 'BHI';
type ProgramStatus = 'active' | 'inactive' | 'pending';
type DeviceStatus = 'active' | 'inactive';

interface EnrolledProgram {
  id: string;
  code: ProgramCode;
  label: string;
  fullName: string;
  status: ProgramStatus;
  enrolledDate: string;
}

interface Device {
  id: string;
  name: string;
  vitalsCovered: string;
  frequency: string;
  lastSync: string;
  status: DeviceStatus;
  condition: string;
}

// ─── 4 confirmed RPM devices mapped to patient conditions ────────────────────

const RPM_DEVICES: Device[] = [
  {
    id: 'd-001',
    name: 'Blood Pressure Cuff',
    vitalsCovered: 'Systolic/Diastolic BP, Heart Rate',
    frequency: 'Twice Daily',
    lastSync: 'Today, 8:42 AM',
    status: 'active',
    condition: 'Hypertension',
  },
  {
    id: 'd-002',
    name: 'CGM (Dexcom / FreeStyle Libre)',
    vitalsCovered: 'Blood Glucose',
    frequency: 'Continuous',
    lastSync: 'Today, 9:15 AM',
    status: 'active',
    condition: 'Diabetes',
  },
  {
    id: 'd-003',
    name: 'Weight Scale',
    vitalsCovered: 'Body Weight, BMI',
    frequency: 'Once Daily',
    lastSync: 'Today, 7:30 AM',
    status: 'active',
    condition: 'Heart Failure',
  },
];

const PROGRAM_META: Record<
  ProgramCode,
  { label: string; fullName: string; enrolledDate: string; status: ProgramStatus }
> = {
  APCM: { label: 'APCM', fullName: 'Advanced Primary Care Management', enrolledDate: 'Jan 10, 2024', status: 'active' },
  RPM: { label: 'RPM', fullName: 'Remote Patient Monitoring', enrolledDate: 'Feb 5, 2024', status: 'active' },
  BHI: { label: 'BHI', fullName: 'Behavioral Health Integration', enrolledDate: 'Mar 1, 2024', status: 'active' },
};

// ─── Config ───────────────────────────────────────────────────────────────────

const PROGRAM_CONFIG: Record<
  ProgramCode,
  {
    icon: React.JSX.Element;
    iconBg: string;
    accentText: string;
    deviceIconBg: string;
    deviceIconColor: string;
  }
> = {
  APCM: {
    icon: <Activity size={20} className="text-teal-600" />,
    iconBg: 'bg-teal-50',
    accentText: 'text-teal-700',
    deviceIconBg: 'bg-slate-100',
    deviceIconColor: 'text-slate-500',
  },
  RPM: {
    icon: <HeartPulse size={20} className="text-blue-700" />,
    iconBg: 'bg-blue-50',
    accentText: 'text-blue-700',
    deviceIconBg: 'bg-slate-100',
    deviceIconColor: 'text-slate-500',
  },
  BHI: {
    icon: <Brain size={20} className="text-violet-600" />,
    iconBg: 'bg-violet-50',
    accentText: 'text-violet-700',
    deviceIconBg: 'bg-slate-100',
    deviceIconColor: 'text-slate-500',
  },
};

const STATUS_STYLE: Record<ProgramStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  inactive: 'bg-rose-50 text-rose-700 border-rose-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
};

const STATUS_DOT: Record<ProgramStatus, string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-rose-500',
  pending: 'bg-amber-400',
};

// ─── Device Card ──────────────────────────────────────────────────────────────

const CONDITION_CHIP_DEVICE: Record<string, string> = {
  Hypertension: 'bg-rose-50 text-rose-700 border-rose-200',
  Diabetes: 'bg-amber-50 text-amber-700 border-amber-200',
  'Heart Failure': 'bg-sky-50 text-sky-700 border-sky-200',
};

function DeviceCard({ device }: { device: Device }): React.JSX.Element {
  const isActive = device.status === 'active';
  const conditionStyle = CONDITION_CHIP_DEVICE[device.condition] ?? 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-xs p-4">
      <div className={cn(!isActive && 'opacity-40')}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <MonitorSmartphone size={17} className="text-slate-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[14px] font-bold text-foreground leading-tight truncate">{device.name}</h4>
              <span
                className={cn(
                  'inline-flex text-[10.5px] font-semibold px-2 py-0.5 rounded-full border shrink-0',
                  conditionStyle
                )}
              >
                {device.condition}
              </span>
            </div>
            <div
              className={cn(
                'flex items-center gap-1 mt-0.5 text-[11px] font-medium',
                isActive ? 'text-emerald-600' : 'text-muted-foreground'
              )}
            >
              {isActive ? <Wifi size={11} /> : <WifiOff size={11} />}
              {isActive ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100">
          <div className="pr-4">
            <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">Frequency</p>
            <p className="text-[13px] font-medium text-foreground mt-0.5">{device.frequency}</p>
          </div>
          <div className="px-4">
            <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">Last Sync</p>
            <p className="text-[13px] font-medium text-foreground mt-0.5">{device.lastSync}</p>
          </div>
          <div className="pl-4">
            <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">
              Vitals Covered
            </p>
            <p className="text-[13px] font-medium text-foreground mt-0.5">{device.vitalsCovered}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProgramsDevicesTab({ programs }: { programs: ProgramType[] }): React.JSX.Element {
  const enrolledCodes = programs.filter((p): p is ProgramCode => p in PROGRAM_CONFIG);

  if (enrolledCodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <HeartPulse size={24} className="text-slate-400" />
        </div>
        <p className="text-[13.5px] font-semibold text-foreground">No program enrolled</p>
        <p className="text-[12px] text-muted-foreground mt-1">This patient has not been enrolled in a program yet.</p>
      </div>
    );
  }

  const enrolledPrograms: EnrolledProgram[] = enrolledCodes.map((code) => {
    const meta = PROGRAM_META[code];
    return {
      id: `prog-${code}`,
      code,
      label: meta.label,
      fullName: meta.fullName,
      status: meta.status,
      enrolledDate: meta.enrolledDate,
    };
  });

  const allDevices = RPM_DEVICES;

  return (
    <div className="space-y-5">
      {/* Program cards — side by side */}
      <div className="grid grid-cols-3 gap-4">
        {enrolledPrograms.map((program) => {
          const cfg = PROGRAM_CONFIG[program.code];
          return (
            <div key={program.code} className="rounded-[14px] border border-slate-200 bg-white shadow-xs p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', cfg.iconBg)}>
                  {cfg.icon}
                </div>
                <div>
                  <h4 className={cn('text-[15px] font-bold leading-tight', cfg.accentText)}>{program.label}</h4>
                  <p className={cn('text-[11.5px] font-medium mt-0.5 opacity-80', cfg.accentText)}>
                    {program.fullName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                  <Calendar size={11} className="text-slate-400" />
                  Enrolled: {program.enrolledDate}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
                    STATUS_STYLE[program.status]
                  )}
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[program.status])} />
                  {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Devices section */}
      <div>
        <p className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-[0.06em] mb-3">
          Assigned Devices
        </p>
        {allDevices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <MonitorSmartphone size={20} className="text-slate-400" />
            </div>
            <p className="text-[13px] font-semibold text-foreground">No devices assigned</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {allDevices.map((d) => (
              <DeviceCard key={d.id} device={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
