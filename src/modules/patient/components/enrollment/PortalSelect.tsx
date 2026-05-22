/**
 * Portal-rendered dropdown select.
 * Renders the option list into document.body via a React portal so it is never
 * clipped by an ancestor's overflow:auto (e.g. the enrollment modal).
 */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortalSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  error?: boolean;
}

export function PortalSelect({ value, onChange, options, placeholder, error }: PortalSelectProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click (handles both trigger and portal dropdown)
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      const inTrigger = triggerRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inTrigger && !inDropdown) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function handleOpen() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    setOpen((o) => !o);
  }

  return (
    <>
      <div
        ref={triggerRef}
        role="combobox"
        aria-expanded={open}
        onClick={handleOpen}
        className={cn(
          'flex items-center h-9 rounded-md border bg-background pl-3 pr-9 text-sm cursor-pointer relative select-none',
          error ? 'border-destructive' : 'border-input',
          open && 'ring-2 ring-ring ring-offset-1',
          !value && 'text-muted-foreground'
        )}
      >
        <span className="flex-1 min-w-0 truncate">{value || placeholder}</span>
        <span className="absolute right-3 flex items-center pointer-events-none text-muted-foreground">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>

      {open &&
        pos &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
            className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
          >
            <ul className="max-h-[224px] overflow-y-auto py-1.5">
              {options.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-[13px] transition-colors',
                      value === opt ? 'bg-primary/8 text-primary font-semibold' : 'text-foreground hover:bg-slate-50'
                    )}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </>
  );
}
