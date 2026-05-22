import React, { useState } from 'react';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';
import { KPICards } from './overview/KPICards';
import { RevenueGraph } from './revenue/RevenueGraph';
import { PopulationHealth } from './population/PopulationHealth';
import { QualityMetrics } from './quality/QualityMetrics';

export function Dashboard(): React.JSX.Element {
  const [navCollapsed, setNavCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FAFAF9]">
      <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[margin-left] duration-[220ms] ease-in-out',
          navCollapsed ? 'ml-[60px]' : 'ml-60'
        )}
      >
        <TopBar title="Dashboard" subtitle="Overview" />
        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          <KPICards />
          <RevenueGraph />
          <PopulationHealth />
          <QualityMetrics />
        </main>
      </div>
    </div>
  );
}
