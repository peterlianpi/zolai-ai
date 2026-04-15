

export interface AdminPost {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  locale: string;
  publishedAt: string | null;
  createdAt: string;
  menuOrder?: number;
}

export interface AdminPostsParams {
  search?: string;
  type?: string;
  status?: string;
  locale?: string;
  orderBy?: "createdAt" | "publishedAt" | "title" | "modifiedAt";
  orderDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}
