export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: string;
  twoFactorEnabled: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  ipAddress: string;
  deviceName?: string | null;
  deviceType?: string | null;
  osName?: string | null;
  browserName?: string | null;
  country?: string | null;
  city?: string | null;
  isCurrentSession: boolean;
  createdAt: string;
}
