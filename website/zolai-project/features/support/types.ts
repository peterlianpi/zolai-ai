export type SupportCategory = "general" | "bug" | "feature" | "language" | "account" | "other";

export interface SupportTicket {
  name: string;
  email: string;
  subject: string;
  category: SupportCategory;
  message: string;
}
