export { default as DeviceManagementPage } from './components/device-management-page';
export { default as SecurityAlertsPage } from './components/security-alerts-page';
export { Captcha } from './components/captcha';
export { LanguageSwitcher, CompactLanguageSwitcher } from './components/language-switcher';

export {
  useDeviceSessions,
  useRevokeDeviceSession,
  useRevokeAllOtherSessions,
  useSecurityEvents,
  useSecurityAlerts,
  useMarkAlertAsRead,
  useResolveAlert,
  useSecuritySettings,
  useUpdateSecuritySettings,
} from './hooks/use-security';

export type {
  DeviceSession,
  SecurityEvent,
  SecurityAlert,
  SecuritySettings,
  SecurityEventType,
  SecuritySeverity,
  SecurityAlertType,
  PasswordPolicy,
  AccountLockout,
} from './types';