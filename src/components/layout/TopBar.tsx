import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { MOCK_NOTIFICATIONS } from '@/components/notifications/mockData';
import type { AppNotification } from '@/components/notifications/types';

const USER = { initials: 'SM', name: 'Sarah Mitchell', role: 'Clinic Admin' };

export interface TopBarProps {
  title: string;
  subtitle: string;
}

export function TopBar({ title, subtitle }: TopBarProps): React.JSX.Element {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const badgeLabel = unreadCount === 0 ? null : unreadCount > 9 ? '9+' : String(unreadCount);

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleMarkRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <div className="sticky top-0 z-30 h-20 bg-white border-b border-slate-200 shadow-xs flex items-center justify-between px-7 shrink-0">
      {/* Left — page title */}
      <div>
        <h1 className="text-[17px] font-bold text-foreground tracking-[-0.01em] leading-tight">{title}</h1>
        <p className="text-[12.5px] text-muted-foreground mt-0.5">{subtitle}</p>
      </div>

      {/* Right — EHR status + bell */}
      <div className="flex items-center gap-5">
        {/* EHR status */}
        <div className="flex items-center gap-2 px-3.5 h-[38px] rounded-md border border-emerald-200 bg-emerald-50/80 shadow-xs">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[12px] font-bold text-emerald-700 tracking-tight">EPIC EHR</span>
          <span className="w-px h-3 bg-emerald-200" />
          <span className="text-[11.5px] font-medium text-emerald-600">Connected</span>
        </div>

        {/* Bell + Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className={cn(
              'relative w-[38px] h-[38px] flex items-center justify-center rounded-lg border transition-colors',
              dropdownOpen
                ? 'border-primary/30 bg-primary/[0.05] text-primary'
                : 'border-slate-200 text-muted-foreground hover:bg-slate-50'
            )}
            aria-label="Notifications"
          >
            <Bell size={17} />

            {/* Dynamic unread badge */}
            {badgeLabel && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 border-2 border-white text-[9.5px] font-bold text-white leading-none px-1">
                {badgeLabel}
              </span>
            )}
          </button>

          <NotificationDropdown
            open={dropdownOpen}
            notifications={notifications}
            onClose={() => setDropdownOpen(false)}
            onMarkAllRead={handleMarkAllRead}
            onMarkRead={handleMarkRead}
          />
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#2563EB] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {USER.initials}
          </div>
          <div className="text-left">
            <p className="text-[12.5px] font-semibold text-foreground leading-tight">{USER.name}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{USER.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
