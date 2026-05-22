import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  UserCog,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} />, path: '/dashboard' },
  { id: 'patients', label: 'Patient Management', icon: <Users size={17} />, path: '/patients' },
  { id: 'users', label: 'User Management', icon: <UserCog size={17} />, path: '/users' },
  { id: 'billing', label: 'Billing', icon: <Receipt size={17} />, path: '/billing' },
  { id: 'settings', label: 'Settings', icon: <Settings size={17} />, path: '/settings' },
];

export interface LeftNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

function NavButton({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <div className="relative group/nav">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'group w-full flex items-center rounded-[9px] transition-all duration-150',
          collapsed ? 'justify-center p-2.5' : 'gap-[11px] px-3 py-[9px]',
          active
            ? 'bg-[rgba(79,142,247,0.15)] text-white font-semibold'
            : 'text-[rgba(255,255,255,0.52)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[rgba(255,255,255,0.85)] font-normal'
        )}
      >
        <span
          className={cn(
            'flex items-center shrink-0 transition-colors duration-150',
            active ? 'text-[#4F8EF7]' : 'text-[rgba(255,255,255,0.38)] group-hover:text-[rgba(255,255,255,0.85)]'
          )}
        >
          {item.icon}
        </span>
        {!collapsed && <span className="flex-1 text-left text-[13.5px] truncate">{item.label}</span>}
        {!collapsed && item.badge !== undefined && (
          <span
            className={cn(
              'text-[10.5px] font-bold px-1.5 py-0.5 rounded-full leading-[1.4]',
              active ? 'bg-white/25 text-white' : 'bg-[#4F8EF7] text-white'
            )}
          >
            {item.badge}
          </span>
        )}
      </button>

      {/* Collapsed tooltip */}
      {collapsed && (
        <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[12.5px] font-medium px-3 py-1.5 rounded-[7px] whitespace-nowrap pointer-events-none z-[200] shadow-xs opacity-0 group-hover/nav:opacity-100 transition-opacity duration-100">
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[5px] border-r-slate-800" />
          {item.label}
          {item.badge !== undefined && (
            <span className="ml-1.5 text-[10px] bg-[#4F8EF7] text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function LeftNav({ collapsed, onToggle }: LeftNavProps): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  function getActiveId(): string {
    if (location.pathname.startsWith('/patients')) return 'patients';
    if (location.pathname.startsWith('/users')) return 'users';
    if (location.pathname.startsWith('/billing')) return 'billing';
    if (location.pathname.startsWith('/messages')) return 'messages';
    if (location.pathname.startsWith('/settings')) return 'settings';
    return 'dashboard';
  }

  const activeId = getActiveId();

  return (
    <div
      className={cn(
        'fixed top-0 left-0 h-screen z-40 flex flex-col bg-[#0F1B2D]',
        'transition-[width] duration-[220ms] ease-in-out',
        collapsed ? 'w-[60px]' : 'w-60'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-20 shrink-0 border-b border-[rgba(255,255,255,0.06)]',
          collapsed ? 'justify-center px-0' : 'px-5 gap-3'
        )}
      >
        <div className="flex items-center justify-center rounded-xl bg-[rgba(79,142,247,0.20)] w-9 h-9 shrink-0">
          <Activity size={18} className="text-[#4F8EF7]" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-[13.5px] text-white leading-tight truncate">Health Telematix</p>
            <p className="text-[11px] text-[rgba(255,255,255,0.52)]">Clinic Portal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 px-3 py-4 space-y-1.5', collapsed ? 'overflow-hidden' : 'overflow-y-auto')}>
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={activeId === item.id}
            collapsed={collapsed}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-[rgba(255,255,255,0.06)] p-3 shrink-0">
        <div className="relative group/nav">
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className={cn(
              'w-full flex items-center rounded-[9px] transition-colors duration-150 text-[rgba(255,255,255,0.45)] hover:text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.08)]',
              collapsed ? 'justify-center p-2.5' : 'gap-[11px] px-3 py-[9px]'
            )}
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && <span className="text-[13.5px] font-normal">Log Out</span>}
          </button>
          {collapsed && (
            <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[12.5px] font-medium px-3 py-1.5 rounded-[7px] whitespace-nowrap pointer-events-none z-[200] shadow-xs opacity-0 group-hover/nav:opacity-100 transition-opacity duration-100">
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[5px] border-r-slate-800" />
              Log Out
            </div>
          )}
        </div>
      </div>

      {/* Logout confirmation dialog */}
      <Dialog
        open={logoutOpen}
        onOpenChange={(open) => {
          if (!open) setLogoutOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden rounded-2xl">
          <div className="px-7 pt-7 pb-6 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
              <LogOut size={24} className="text-red-500" />
            </div>

            {/* Title */}
            <DialogTitle className="text-[17px] font-bold text-foreground mb-2">Log Out</DialogTitle>

            {/* Description */}
            <p className="text-[13.5px] text-muted-foreground leading-relaxed">
              Are you sure you want to log out? Any unsaved changes will be lost.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 px-7 pb-7">
            <Button
              variant="outline"
              className="flex-1 h-10 text-[13.5px] font-medium"
              onClick={() => setLogoutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-10 text-[13.5px] font-semibold bg-red-500 hover:bg-red-600 text-white border-0 shadow-none"
              onClick={() => {
                setLogoutOpen(false);
                navigate('/login');
              }}
            >
              Log Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1A2D45] border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(255,255,255,0.52)] shadow-xs z-50 hover:bg-[#4F8EF7] hover:border-[#4F8EF7] hover:text-white transition-colors duration-150"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </div>
  );
}
