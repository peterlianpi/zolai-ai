export interface MailPayload {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}
