export interface DeviceSession {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: {
    country: string;
    city: string;
    region: string;
  };
  lastActivity: Date;
  createdAt: Date;
  isCurrentSession: boolean;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  type: SecurityEventType;
  description: string;
  severity: SecuritySeverity;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    region: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED',
  TWO_FACTOR_BACKUP_CODES_GENERATED = 'TWO_FACTOR_BACKUP_CODES_GENERATED',
  DEVICE_SESSION_CREATED = 'DEVICE_SESSION_CREATED',
  DEVICE_SESSION_REVOKED = 'DEVICE_SESSION_REVOKED',
  SUSPICIOUS_LOGIN_DETECTED = 'SUSPICIOUS_LOGIN_DETECTED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  BREACHED_PASSWORD_DETECTED = 'BREACHED_PASSWORD_DETECTED',
  CAPTCHA_FAILED = 'CAPTCHA_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface SecurityAlert {
  id: string;
  userId: string;
  type: SecurityAlertType;
  title: string;
  message: string;
  severity: SecuritySeverity;
  isRead: boolean;
  isResolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export enum SecurityAlertType {
  SUSPICIOUS_LOGIN = 'SUSPICIOUS_LOGIN',
  NEW_DEVICE_LOGIN = 'NEW_DEVICE_LOGIN',
  MULTIPLE_FAILED_LOGINS = 'MULTIPLE_FAILED_LOGINS',
  PASSWORD_BREACH_DETECTED = 'PASSWORD_BREACH_DETECTED',
  UNUSUAL_LOCATION_LOGIN = 'UNUSUAL_LOCATION_LOGIN',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
}

export interface SecuritySettings {
  userId: string;
  twoFactorEnabled: boolean;
  emailNotificationsEnabled: boolean;
  suspiciousActivityAlerts: boolean;
  newDeviceAlerts: boolean;
  locationBasedAlerts: boolean;
  sessionTimeout: number; // in minutes
  allowedCountries: string[];
  blockedCountries: string[];
  trustedDevices: string[];
  maxSessions: number;
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  preventBreachedPasswords: boolean;
  preventReuse: number; // number of previous passwords to remember
  maxAge: number; // days before password expires
}

export interface AccountLockout {
  userId: string;
  isLocked: boolean;
  lockoutCount: number;
  lockedAt?: Date;
  unlockAt?: Date;
  reason: string;
  adminNotes?: string;
}