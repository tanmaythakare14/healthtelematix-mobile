import React, { useState } from 'react';
import { MonitorSmartphone, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type DeviceStatus = 'active' | 'inactive';
type Program = 'APCM' | 'RPM';

interface Device {
  id: string;
  name: string;
  vitalsCovered: string;
  frequency: string;
  lastSync: string;
  status: DeviceStatus;
  program: Program;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DEVICES: Device[] = [
  {
    id: 'd-001',
    name: 'Blood Pressure Cuff',
    vitalsCovered: 'Blood Pressure, Heart Rate',
    frequency: 'Twice Daily',
    lastSync: 'Today, 8:42 AM',
    status: 'active',
    program: 'RPM',
  },
  {
    id: 'd-002',
    name: 'Dexcom CGM',
    vitalsCovered: 'Blood Glucose',
    frequency: 'Continuous',
    lastSync: 'Today, 9:15 AM',
    status: 'active',
    program: 'RPM',
  },
  {
    id: 'd-003',
    name: 'Weight Scale',
    vitalsCovered: 'Body Weight',
    frequency: 'Once Daily',
    lastSync: 'Yesterday, 7:30 AM',
    status: 'active',
    program: 'RPM',
  },
  {
    id: 'd-004',
    name: 'FreeStyle Libre CGM',
    vitalsCovered: 'Blood Glucose',
    frequency: 'Continuous',
    lastSync: 'Oct 12, 2023',
    status: 'inactive',
    program: 'RPM',
  },
  {
    id: 'd-005',
    name: 'Pulse Oximeter',
    vitalsCovered: 'Oxygen Saturation, Heart Rate',
    frequency: 'Once Daily',
    lastSync: 'Today, 10:00 AM',
    status: 'active',
    program: 'APCM',
  },
  {
    id: 'd-006',
    name: 'Digital Thermometer',
    vitalsCovered: 'Body Temperature',
    frequency: 'As Needed',
    lastSync: 'Nov 01, 2023',
    status: 'inactive',
    program: 'APCM',
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const PROGRAM_CONFIG = {
  APCM: {
    iconBg: 'bg-teal-100',
    accentText: 'text-teal-700',
    pillActive: 'bg-white text-teal-700 shadow-xs font-semibold',
    countActive: 'bg-teal-50 text-teal-700',
  },
  RPM: {
    iconBg: 'bg-indigo-100',
    accentText: 'text-indigo-600',
    pillActive: 'bg-white text-indigo-600 shadow-xs font-semibold',
    countActive: 'bg-indigo-50 text-indigo-600',
  },
} as const;

// ─── Device Card ──────────────────────────────────────────────────────────────

function DeviceCard({ device, program }: { device: Device; program: Program }): React.JSX.Element {
  const cfg = PROGRAM_CONFIG[program];
  const isActive = device.status === 'active';

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-xs p-4">
      {/* Content — dimmed for inactive */}
      <div className={cn(!isActive && 'opacity-40')}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', cfg.iconBg)}>
              <MonitorSmartphone size={17} className={cfg.accentText} />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-foreground leading-tight">{device.name}</h4>
            </div>
          </div>

          {/* Connection status */}
          <div
            className={cn(
              'flex items-center gap-1.5 text-[11px] font-medium shrink-0',
              isActive ? 'text-emerald-600' : 'text-muted-foreground'
            )}
          >
            {isActive ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isActive ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Details */}
        <div className="flex items-start gap-4">
          <div className="w-1/4 shrink-0">
            <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">Frequency</p>
            <p className="text-[13px] font-medium text-foreground mt-0.5">{device.frequency}</p>
          </div>
          <div className="w-1/4 shrink-0">
            <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">Last Sync</p>
            <p className="text-[13px] font-medium text-foreground mt-0.5">{device.lastSync}</p>
          </div>
          <div className="w-1/2">
            <p className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">
              Vitals Covered
            </p>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {device.vitalsCovered.split(', ').map((vital) => (
                <span
                  key={vital}
                  className="inline-flex items-center text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap"
                >
                  {vital}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const PROGRAMS: Program[] = ['APCM', 'RPM'];

export function DevicesTab(): React.JSX.Element {
  const [activeProgram, setActiveProgram] = useState<Program>('APCM');

  const filtered = DEVICES.filter((d) => d.program === activeProgram);

  return (
    <div className="space-y-5">
      {/* Program filter pills */}
      <div className="flex items-center bg-slate-100 rounded-full p-1 gap-0.5 w-fit">
        {PROGRAMS.map((prog) => {
          const cfg = PROGRAM_CONFIG[prog];
          const count = DEVICES.filter((d) => d.program === prog).length;
          const isSelected = activeProgram === prog;
          return (
            <button
              key={prog}
              type="button"
              onClick={() => setActiveProgram(prog)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all',
                isSelected ? cfg.pillActive : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {prog}
              <span
                className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                  isSelected ? cfg.countActive : 'bg-slate-200 text-slate-500'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Device cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <MonitorSmartphone size={24} className="text-slate-400" />
          </div>
          <p className="text-[13.5px] font-semibold text-foreground">No devices for {activeProgram}</p>
          <p className="text-[12px] text-muted-foreground mt-1">No devices have been assigned to this program.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((d) => (
            <DeviceCard key={d.id} device={d} program={activeProgram} />
          ))}
        </div>
      )}
    </div>
  );
}
