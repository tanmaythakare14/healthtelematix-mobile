import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StaffSelectOption {
  id: string;
  fullName: string;
  specialty: string;
}

interface StaffSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: StaffSelectOption[];
  placeholder: string;
  error?: boolean;
}

export function StaffSelect({ value, onChange, options, placeholder, error }: StaffSelectProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter((o) => !query || o.fullName.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={cn(
          'flex items-center h-10 rounded-md border bg-background pl-3 pr-3 cursor-pointer relative gap-2',
          error ? 'border-destructive' : 'border-input',
          open && 'ring-2 ring-ring ring-offset-1'
        )}
      >
        <input
          ref={inputRef}
          value={open ? query : value}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm min-w-0 placeholder:text-muted-foreground cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        />
        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X size={13} />
          </button>
        ) : (
          <ChevronDown size={13} className="shrink-0 text-muted-foreground" />
        )}
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <ul className="max-h-[160px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-[12.5px] text-muted-foreground text-center">
                {options.length === 0 ? 'None available' : 'No matches'}
              </li>
            ) : (
              filtered.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.fullName);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors',
                      value === o.fullName && 'bg-primary/5'
                    )}
                  >
                    <p className="text-[13px] font-medium text-foreground">{o.fullName}</p>
                    <p className="text-[11px] text-muted-foreground">{o.specialty}</p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
