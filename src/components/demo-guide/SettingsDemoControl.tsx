import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, PanelLeft, LayoutList, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SETTINGS_PATH } from '@/modules/settings/constants';

// ─── Variations ───────────────────────────────────────────────────────────────

const VARIATIONS = [
  {
    label: 'Sidebar Navigation',
    desc: 'Left panel with section list',
    icon: PanelLeft,
    param: '',
  },
  {
    label: 'Tab Navigation',
    desc: 'Horizontal tab bar layout',
    icon: LayoutList,
    param: 'tabs',
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function SettingsDemoControl(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  // Only show on settings page
  if (!location.pathname.startsWith(SETTINGS_PATH)) return <></>;

  const currentLayout = new URLSearchParams(location.search).get('layout') ?? '';

  return (
    <div className="fixed z-50 flex flex-col bottom-6 left-6 min-w-[210px]">
      {/* Panel */}
      {open && (
        <div className="mb-2 rounded-2xl overflow-hidden bg-slate-800 border border-white/[0.08] shadow-xs">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07]">
            <Settings size={13} className="text-violet-400" />
            <span className="text-xs font-bold tracking-wide text-slate-100">Settings Layout</span>
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-400/15 text-violet-400">
              2 variants
            </span>
          </div>

          {/* Options */}
          <div className="px-3 py-3 space-y-0.5">
            {VARIATIONS.map((v) => {
              const Icon = v.icon;
              const isActive = currentLayout === v.param;
              return (
                <button
                  key={v.label}
                  type="button"
                  onClick={() => navigate(v.param ? `${SETTINGS_PATH}?layout=${v.param}` : SETTINGS_PATH)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors',
                    isActive
                      ? 'bg-white/[0.10] text-white'
                      : 'text-slate-300 hover:bg-white/[0.07] hover:text-slate-100'
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center rounded-lg flex-shrink-0 w-7 h-7',
                      isActive ? 'bg-violet-400/25' : 'bg-white/[0.06]'
                    )}
                  >
                    <Icon size={13} className={isActive ? 'text-violet-300' : 'text-slate-400'} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">{v.label}</p>
                    <p className="text-[10px] mt-0.5 text-slate-500">{v.desc}</p>
                  </div>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toggle pill */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="self-start flex items-center gap-2 px-4 py-2 rounded-full transition-all bg-slate-800 border border-white/10 shadow-xs text-slate-100 hover:bg-[#273449]"
      >
        <Settings size={13} className="text-violet-400" />
        <span className="text-xs font-semibold">Settings View</span>
        {open ? (
          <ChevronDown size={12} className="text-slate-500" />
        ) : (
          <ChevronUp size={12} className="text-slate-500" />
        )}
      </button>
    </div>
  );
}
