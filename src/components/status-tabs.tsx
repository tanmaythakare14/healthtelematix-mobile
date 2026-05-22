import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusTab<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

export interface StatusTabsProps<T extends string = string> {
  tabs: StatusTab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function StatusTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: StatusTabsProps<T>): React.JSX.Element {
  return (
    <div className={cn('flex items-center bg-slate-100 rounded-md p-1 gap-0.5', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
            value === tab.value
              ? 'bg-white text-primary shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                value === tab.value ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
