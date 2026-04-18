export interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface ApiKeyCreated extends ApiKey {
  key: string;
}
