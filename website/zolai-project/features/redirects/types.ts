export interface Redirect {
  id: string;
  source: string;
  destination: string;
  statusCode: number;
  enabled: boolean;
  hitCount: number;
  lastHitAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RedirectListResponse {
  success: boolean;
  data: {
    redirects: Redirect[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
