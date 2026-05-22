// ─── Notification Types ───────────────────────────────────────────────────────

export type NotificationCategory = 'enrollment' | 'staff' | 'billing';

export type NotificationType =
  | 'patient_enrolled'
  | 'patient_consent_received'
  | 'ehr_import_completed'
  | 'staff_invitation_sent'
  | 'staff_invitation_accepted'
  | 'billing_report_ready'
  | 'cpt_code_generated';

export interface AppNotification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionPath?: string;
}
