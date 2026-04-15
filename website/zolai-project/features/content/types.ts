export interface Taxonomy {
  id: string;
  slug: string;
  name: string;
  termCount?: number;
}

export interface TermTaxonomyRef {
  id: string;
  slug: string;
  name: string;
}

export interface Term {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  count?: number;
  taxonomy?: TermTaxonomyRef;
}

export interface TermListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TermListResponse {
  terms: Term[];
  meta: TermListMeta;
}
