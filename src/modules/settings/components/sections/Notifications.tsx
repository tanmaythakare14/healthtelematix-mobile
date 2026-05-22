import React, { useState } from 'react';
import { AlertTriangle, Activity, ClipboardList, MessageSquare, Mail, Bell, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { NotificationPreferences } from '../../@types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ItemChannels {
  inApp: boolean;
  email: boolean;
  sms: boolean;
}
type AllItemChannels = Record<keyof NotificationPreferences, ItemChannels>;

// ─── Config ───────────────────────────────────────────────────────────────────

const NOTIFICATION_ITEMS: {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'criticalPatientAlerts',
    label: 'Critical Patient Alerts',
    description: 'Get notified immediately when a patient has a critical vitals reading.',
    icon: <AlertTriangle size={15} className="text-rose-500" />,
  },
  {
    key: 'deviceThresholdAlerts',
    label: 'Device Threshold Alerts',
    description: 'Receive alerts when a patient device exceeds defined thresholds.',
    icon: <Activity size={15} className="text-amber-500" />,
  },
  {
    key: 'carePlanUpdates',
    label: 'Care Plan Updates',
    description: 'Notifications when a care plan is created, updated, or completed.',
    icon: <ClipboardList size={15} className="text-blue-500" />,
  },
  {
    key: 'newMessageNotifications',
    label: 'New Message Notifications',
    description: 'Get notified when you receive a new message from a patient or care team.',
    icon: <MessageSquare size={15} className="text-violet-500" />,
  },
  {
    key: 'dailySummaryEmail',
    label: 'Daily Summary Email',
    description: 'Receive a daily digest of patient activity and pending tasks.',
    icon: <Mail size={15} className="text-teal-500" />,
  },
];

const CHANNEL_OPTIONS: { key: keyof ItemChannels; label: string; icon: React.ReactNode }[] = [
  { key: 'inApp', label: 'In-App', icon: <Bell size={12} /> },
  { key: 'email', label: 'Email', icon: <Mail size={12} /> },
  { key: 'sms', label: 'SMS', icon: <Smartphone size={12} /> },
];

const DEFAULT_PREFS: NotificationPreferences = {
  criticalPatientAlerts: true,
  deviceThresholdAlerts: true,
  carePlanUpdates: false,
  newMessageNotifications: true,
  dailySummaryEmail: false,
};

const DEFAULT_CHANNELS: AllItemChannels = {
  criticalPatientAlerts: { inApp: true, email: true, sms: true },
  deviceThresholdAlerts: { inApp: true, email: true, sms: false },
  carePlanUpdates: { inApp: true, email: false, sms: false },
  newMessageNotifications: { inApp: true, email: false, sms: false },
  dailySummaryEmail: { inApp: false, email: true, sms: false },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Notifications(): React.JSX.Element {
  const [savedPrefs, setSavedPrefs] = useState<NotificationPreferences>({ ...DEFAULT_PREFS });
  const [savedChannels, setSavedChannels] = useState<AllItemChannels>(structuredClone(DEFAULT_CHANNELS));
  const [prefs, setPrefs] = useState<NotificationPreferences>({ ...DEFAULT_PREFS });
  const [itemChannels, setItemChannels] = useState<AllItemChannels>(structuredClone(DEFAULT_CHANNELS));

  const isDirty =
    (Object.keys(prefs) as (keyof NotificationPreferences)[]).some((k) => prefs[k] !== savedPrefs[k]) ||
    (Object.keys(itemChannels) as (keyof NotificationPreferences)[]).some((k) =>
      (Object.keys(itemChannels[k]) as (keyof ItemChannels)[]).some(
        (ch) => itemChannels[k][ch] !== savedChannels[k][ch]
      )
    );

  function togglePref(key: keyof NotificationPreferences) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleChannel(key: keyof NotificationPreferences, ch: keyof ItemChannels) {
    setItemChannels((prev) => ({
      ...prev,
      [key]: { ...prev[key], [ch]: !prev[key][ch] },
    }));
  }

  function handleSave() {
    setSavedPrefs({ ...prefs });
    setSavedChannels(structuredClone(itemChannels));
    toast.success('Notification preferences saved');
  }

  function handleCancel() {
    setPrefs({ ...savedPrefs });
    setItemChannels(structuredClone(savedChannels));
  }

  return (
    <div className="bg-white rounded-[14px] border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-[13.5px] font-bold text-foreground">Notification Settings</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Choose which notifications you want to receive and how.
        </p>
      </div>

      {/* Column header */}
      <div className="flex items-center px-6 py-2.5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex-1 min-w-0" />
        <div className="flex items-center gap-10 shrink-0">
          <div className="flex items-center gap-6">
            {CHANNEL_OPTIONS.map((ch) => (
              <span
                key={ch.key}
                className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.07em] text-muted-foreground w-14 justify-center"
              >
                {ch.label}
              </span>
            ))}
          </div>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-muted-foreground w-12 text-center">
            Active
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {NOTIFICATION_ITEMS.map((item) => {
          const enabled = prefs[item.key];
          const channels = itemChannels[item.key];

          return (
            <div key={item.key} className="flex items-center px-6 py-4 hover:bg-slate-50/50 transition-colors gap-4">
              {/* Icon + label */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <p className={cn('text-[13px] font-semibold', enabled ? 'text-foreground' : 'text-muted-foreground')}>
                    {item.label}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                </div>
              </div>

              {/* Channel checkboxes + toggle */}
              <div className="flex items-center gap-10 shrink-0">
                {/* Checkboxes */}
                <div className="flex items-center gap-6">
                  {CHANNEL_OPTIONS.map((ch) => (
                    <div key={ch.key} className="flex items-center justify-center w-14">
                      <Checkbox
                        id={`${item.key}-${ch.key}`}
                        checked={channels[ch.key]}
                        disabled={!enabled}
                        onCheckedChange={() => toggleChannel(item.key, ch.key)}
                        className={cn(!enabled && 'opacity-35 cursor-not-allowed')}
                      />
                      <Label htmlFor={`${item.key}-${ch.key}`} className="sr-only">
                        {ch.label}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-center w-12">
                  <Switch checked={enabled} onCheckedChange={() => togglePref(item.key)} aria-label={item.label} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="default"
          className="px-7 h-9"
          disabled={!isDirty}
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button size="default" disabled={!isDirty} onClick={handleSave} className="px-7 h-9 shadow-xs">
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
