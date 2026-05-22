import * as React from 'react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = DayPickerProps;

// ─── Custom dropdown replacing react-day-picker's native <select> ─────────────

interface DropdownOption {
  value: number;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  value?: string | number | readonly string[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: DropdownOption[];
  className?: string;
}

function CalendarDropdown({ value, onChange, options = [] }: DropdownProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  function handleSelect(optValue: number) {
    if (onChange) {
      // Synthesise a ChangeEvent so react-day-picker's handler works as-is
      const syntheticEvent = {
        target: { value: String(optValue) },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 h-7 rounded-md border border-input bg-background px-2.5 text-[12.5px] font-semibold cursor-pointer hover:bg-accent transition-colors',
          open && 'ring-2 ring-ring ring-offset-1'
        )}
      >
        {selected?.label ?? '—'}
        <ChevronDown
          size={11}
          className={cn('text-muted-foreground transition-transform duration-150 shrink-0', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute z-[60] top-[calc(100%+4px)] left-0 min-w-[110px] bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <ul className="max-h-[200px] overflow-y-auto py-1.5">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'w-full text-left px-3.5 py-1.5 text-[12.5px] transition-colors',
                    opt.disabled && 'opacity-40 cursor-not-allowed',
                    String(value) === String(opt.value)
                      ? 'bg-primary/8 text-primary font-semibold'
                      : 'text-foreground hover:bg-slate-50'
                  )}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps): React.JSX.Element {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col',
        month: 'flex flex-col gap-3',
        month_caption: 'flex justify-center items-center gap-2 h-8 relative',
        caption_label: 'text-[13.5px] font-semibold',
        dropdowns: 'flex items-center gap-1.5',
        nav: 'absolute inset-x-0 top-0 flex items-center justify-between pointer-events-none',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 pointer-events-auto'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 pointer-events-auto'
        ),
        month_grid: 'w-full border-collapse mt-1',
        weekdays: 'flex',
        weekday: 'text-muted-foreground w-9 text-center text-[11px] font-medium pb-1',
        week: 'flex w-full mt-1',
        day: 'relative p-0 text-center',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 text-[13px] font-normal rounded-md aria-selected:opacity-100'
        ),
        selected:
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground rounded-md',
        today: '[&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:font-semibold',
        outside: '[&>button]:text-muted-foreground [&>button]:opacity-40',
        disabled: '[&>button]:text-muted-foreground [&>button]:opacity-30 [&>button]:cursor-not-allowed',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
        Dropdown: (dropdownProps) => <CalendarDropdown {...dropdownProps} />,
      }}
      {...props}
    />
  );
}
