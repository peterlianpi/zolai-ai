export interface InboundEmail {
  id: string;
  to: string;
  from: string;
  fromName?: string | null;
  subject: string;
  text?: string | null;
  html?: string | null;
  replyTo?: string | null;
  isRead: boolean;
  isReplied: boolean;
  repliedAt?: string | null;
  createdAt: string;
}
