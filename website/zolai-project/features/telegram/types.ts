export interface TelegramStatus {
  linked: boolean;
  chatId?: string | null;
  enabled: boolean;
}

export interface TelegramLinkToken {
  token: string;
}
