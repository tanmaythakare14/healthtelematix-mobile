import React, { useState } from 'react';
import { User, Building2, Bell, Database, Lock, FileText, HelpCircle, Headphones } from 'lucide-react';
import { LeftNav } from '@/components/layout/LeftNav';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';
import type { SettingsSectionId } from '../@types';
import { AdminProfile } from './sections/AdminProfile';
import { ClinicProfile } from './sections/ClinicProfile';
import { Notifications } from './sections/Notifications';
import { ChangePassword } from './sections/ChangePassword';
import { EhrSettings } from './sections/EhrSettings';
import { TermsAndPrivacy } from './sections/TermsAndPrivacy';
import { FAQ } from './sections/FAQ';
import { HelpAndSupport } from './sections/HelpAndSupport';

// ─── Nav config ───────────────────────────────────────────────────────────────

interface NavItem {
  id: SettingsSectionId;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'admin-profile', label: 'Admin Profile', icon: <User size={15} /> },
  { id: 'change-password', label: 'Change Password', icon: <Lock size={15} /> },
  { id: 'clinic-profile', label: 'Clinic Profile', icon: <Building2 size={15} /> },
  { id: 'ehr-settings', label: 'EHR / EMR Settings', icon: <Database size={15} /> },
  { id: 'notifications', label: 'Notification Settings', icon: <Bell size={15} /> },
  { id: 'terms-privacy', label: 'Terms & Privacy', icon: <FileText size={15} /> },
  { id: 'faqs', label: 'FAQs', icon: <HelpCircle size={15} /> },
  { id: 'help-support', label: 'Help & Support', icon: <Headphones size={15} /> },
];

// ─── Content router ───────────────────────────────────────────────────────────

function SectionContent({ active }: { active: SettingsSectionId }): React.JSX.Element {
  switch (active) {
    case 'admin-profile':
      return <AdminProfile />;
    case 'clinic-profile':
      return <ClinicProfile />;
    case 'ehr-settings':
      return <EhrSettings />;
    case 'notifications':
      return <Notifications />;
    case 'change-password':
      return <ChangePassword />;
    case 'terms-privacy':
      return <TermsAndPrivacy />;
    case 'faqs':
      return <FAQ />;
    case 'help-support':
      return <HelpAndSupport />;
  }
}

// ─── Sidebar Layout ───────────────────────────────────────────────────────────

function SidebarLayout({
  active,
  onSelect,
}: {
  active: SettingsSectionId;
  onSelect: (id: SettingsSectionId) => void;
}): React.JSX.Element {
  return (
    <div className="flex gap-5 p-5 h-[calc(100vh-64px)]">
      {/* Settings sidebar — fixed height, never scrolls */}
      <aside className="w-64 bg-white rounded-[14px] border border-slate-200 shadow-xs flex-shrink-0 py-3 px-3 h-full overflow-hidden">
        <ul className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12.5px] font-medium transition-colors text-left',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-slate-100'
                  )}
                >
                  <span className={cn(isActive ? 'text-primary' : 'text-muted-foreground')}>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Section content — only this panel scrolls */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <SectionContent active={active} />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Settings(): React.JSX.Element {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('admin-profile');

  return (
    <div className="h-screen overflow-hidden flex bg-[#FAFAF9]">
      <LeftNav collapsed={navCollapsed} onToggle={() => setNavCollapsed((o) => !o)} />

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[margin-left] duration-[220ms] ease-in-out',
          navCollapsed ? 'ml-[60px]' : 'ml-60'
        )}
      >
        <TopBar title="Settings" subtitle="Manage your account, clinic, and preferences" />

        <div className="flex-1 overflow-hidden">
          <SidebarLayout active={activeSection} onSelect={setActiveSection} />
        </div>
      </div>
    </div>
  );
}
