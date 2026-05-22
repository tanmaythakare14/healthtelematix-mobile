export type SettingsSectionId =
  | 'admin-profile'
  | 'change-password'
  | 'clinic-profile'
  | 'ehr-settings'
  | 'notifications'
  | 'terms-privacy'
  | 'faqs'
  | 'help-support';

export interface NotificationPreferences {
  criticalPatientAlerts: boolean;
  deviceThresholdAlerts: boolean;
  carePlanUpdates: boolean;
  newMessageNotifications: boolean;
  dailySummaryEmail: boolean;
}

export interface NotificationChannels {
  inApp: boolean;
  email: boolean;
  sms: boolean;
}

export interface AdminProfileFormValues {
  phone: string;
}

export interface ClinicProfileFormValues {
  clinicName: string;
  email: string;
  phone: string;
  tinNumber: string;
  npiNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface HelpQueryFormValues {
  subject: string;
  message: string;
}

export interface EhrDetailsFormValues {
  currentEhr: string;
  smartAppUrl: string;
  integrationStatus: 'active' | 'inactive' | 'pending';
}
