import React, { useEffect, useRef } from 'react';
import { Bell, CheckCheck, Receipt, UserPlus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AppNotification, NotificationCategory } from './types';

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<NotificationCategory, { label: string; Icon: React.ElementType; style: string }> = {
  enrollment: {
    label: 'Enrollment',
    Icon: UserPlus,
    style: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  staff: {
    label: 'Staff',
    Icon: Users,
    style: 'bg-violet-50 text-violet-600 border-violet-100',
  },
  billing: {
    label: 'Billing',
    Icon: Receipt,
    style: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationDropdownProps {
  open: boolean;
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

// ─── Notification Row ─────────────────────────────────────────────────────────

function NotificationRow({
  n,
  onMarkRead,
}: {
  n: AppNotification;
  onMarkRead: (id: string) => void;
}): React.JSX.Element {
  const cfg = CATEGORY_CONFIG[n.category];
  const Icon = cfg.Icon;

  return (
    <button
      type="button"
      onClick={() => onMarkRead(n.id)}
      className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50/80 transition-colors text-left relative border-b border-slate-100 last:border-0"
    >
      {/* Unread dot */}
      {!n.read && <span className="absolute left-2 top-[22px] w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}

      {/* Category icon */}
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5', cfg.style)}>
        <Icon size={15} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-[13px] leading-tight',
              n.read ? 'font-medium text-foreground' : 'font-semibold text-foreground'
            )}
          >
            {n.title}
          </p>
          <span className="text-[10.5px] text-muted-foreground shrink-0 mt-0.5">{n.timestamp}</span>
        </div>
        <p className="text-[11.5px] text-muted-foreground mt-1 leading-snug line-clamp-2">{n.message}</p>
      </div>
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationDropdown({
  open,
  notifications,
  onClose,
  onMarkAllRead,
  onMarkRead,
}: NotificationDropdownProps): React.JSX.Element | null {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-[calc(100%+8px)] w-[400px] bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden z-50 flex flex-col"
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-foreground" />
          <p className="text-[14px] font-bold text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary/80 px-2.5 py-1.5 rounded-lg hover:bg-primary/[0.06] transition-colors"
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* ── Notification List ──────────────────────────────────────────── */}
      <div className="overflow-y-auto max-h-[420px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Bell size={18} className="text-muted-foreground" />
            </div>
            <p className="text-[13px] font-semibold text-foreground">No notifications</p>
            <p className="text-[11.5px] text-muted-foreground mt-1">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => <NotificationRow key={n.id} n={n} onMarkRead={onMarkRead} />)
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-slate-100 shrink-0 bg-slate-50/60">
        <p className="text-[11px] text-muted-foreground text-center">
          {unreadCount > 0 ? `${unreadCount} unread · ` : ''}
          {notifications.length} notifications
        </p>
      </div>
    </div>
  );
}
