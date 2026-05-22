import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: SearchInputProps): React.JSX.Element {
  return (
    <div className={cn('relative', className)}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-foreground placeholder:text-slate-400 outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
      />
    </div>
  );
}
