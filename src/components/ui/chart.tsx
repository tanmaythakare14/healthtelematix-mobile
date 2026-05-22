'use client';

import * as React from 'react';
import { ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

// ─── Chart Config ─────────────────────────────────────────────────────────────

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  }
>;

interface ChartContextProps {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart(): ChartContextProps {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error('useChart must be used within a ChartContainer');
  return context;
}

// ─── ChartContainer ───────────────────────────────────────────────────────────

interface ChartContainerProps extends React.ComponentProps<'div'> {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>['children'];
}

export function ChartContainer({ id, className, children, config, ...props }: ChartContainerProps): React.JSX.Element {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`;

  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {};
    Object.entries(config).forEach(([key, value]) => {
      if (value.color) {
        vars[`--color-${key}`] = value.color;
      }
    });
    return vars;
  }, [config]);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        id={chartId}
        style={cssVars as React.CSSProperties}
        className={cn('flex aspect-video justify-center text-xs', className)}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

// ─── ChartTooltip ─────────────────────────────────────────────────────────────

export const ChartTooltip = Tooltip;

// ─── ChartTooltipContent ──────────────────────────────────────────────────────

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
  labelFormatter?: (label: string) => React.ReactNode;
  formatter?: (value: number, name: string) => React.ReactNode;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: 'dot' | 'line' | 'dashed';
  className?: string;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  formatter,
  hideLabel = false,
  hideIndicator = false,
  indicator = 'dot',
  className,
}: ChartTooltipContentProps): React.JSX.Element | null {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  const displayLabel = labelFormatter ? labelFormatter(label ?? '') : label;

  return (
    <div
      className={cn(
        'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xs',
        className
      )}
    >
      {!hideLabel && displayLabel && <p className="font-medium text-foreground">{displayLabel}</p>}
      <div className="grid gap-1">
        {payload.map((item) => {
          const key = (item.dataKey as string) ?? item.name;
          const cfgEntry = config[key];
          const color = item.color ?? cfgEntry?.color ?? 'hsl(var(--primary))';
          const displayName = cfgEntry?.label ?? item.name;
          const displayValue = formatter ? formatter(item.value, item.name) : item.value;

          return (
            <div key={key} className="flex w-full flex-wrap items-stretch gap-2">
              {!hideIndicator && (
                <div
                  className={cn(
                    'shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)',
                    indicator === 'dot' && 'h-2.5 w-2.5 self-center rounded-full',
                    indicator === 'line' && 'w-1',
                    indicator === 'dashed' && 'w-0 border-[1.5px] border-dashed bg-transparent'
                  )}
                  style={{ '--color-bg': color, '--color-border': color } as React.CSSProperties}
                />
              )}
              <div className="flex flex-1 justify-between gap-2 leading-none">
                <span className="text-muted-foreground">{displayName}</span>
                <span className="font-mono font-medium tabular-nums text-foreground">{displayValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ChartLegend ─────────────────────────────────────────────────────────────

export const ChartLegend = Legend;

interface ChartLegendContentProps {
  payload?: Array<{ value: string; color?: string }>;
  className?: string;
}

export function ChartLegendContent({ payload, className }: ChartLegendContentProps): React.JSX.Element | null {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      {payload.map((item) => {
        const cfgEntry = config[item.value];
        const color = item.color ?? cfgEntry?.color ?? 'hsl(var(--primary))';
        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground">{cfgEntry?.label ?? item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
