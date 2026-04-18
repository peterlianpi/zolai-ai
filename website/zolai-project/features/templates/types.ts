export interface PageTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  htmlTemplate: string;
  cssTemplate?: string | null;
  slots: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}
