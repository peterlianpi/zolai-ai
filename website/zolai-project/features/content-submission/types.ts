export interface Submission {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  resourceType: string;
  status: string;
  createdAt: string;
  author: { id: string; name: string };
}

export interface SubmissionStats {
  total: number;
  review: number;
  published: number;
}
