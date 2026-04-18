export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean | null;
  createdAt: string;
  image?: string | null;
}

export interface AdminStats {
  users: number;
  posts: number;
  resources: number;
  comments: number;
}
