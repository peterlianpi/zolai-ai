export interface Form {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  fields: unknown;
  isActive: boolean;
  submitCount: number;
  createdAt: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: unknown;
  isSpam: boolean;
  createdAt: string;
}
