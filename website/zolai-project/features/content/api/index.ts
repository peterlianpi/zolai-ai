import { client } from "@/lib/api/client";
import type { Taxonomy, TermListResponse, Term } from "../types";
import type { CreateTermInput, UpdateTermInput } from "../schemas/term";

export async function listTaxonomies(): Promise<Taxonomy[]> {
  const response = await client.api.content.taxonomies.$get();
  if (!response.ok) {
    throw new Error("Failed to fetch taxonomies");
  }

  const json = (await response.json()) as {
    success?: boolean;
    data?: Array<{ id: string; slug: string; name: string; _count?: { terms?: number } }>;
  };

  if (!json.success || !json.data) return [];

  return json.data.map((tax) => ({
    id: tax.id,
    slug: tax.slug,
    name: tax.name,
    termCount: tax._count?.terms ?? undefined,
  }));
}

export async function listTerms(params: {
  taxonomyId: string;
  page?: number;
  limit?: number;
}): Promise<TermListResponse> {
  const response = await client.api.content.terms.$get({
    query: {
      taxonomyId: params.taxonomyId,
      page: (params.page ?? 1).toString(),
      limit: (params.limit ?? 100).toString(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch terms");
  }

  const json = (await response.json()) as {
    success?: boolean;
    data?: { terms?: Term[]; meta?: TermListResponse["meta"] };
  };

  if (!json.success || !json.data?.terms || !json.data.meta) {
    return {
      terms: [],
      meta: { total: 0, page: 1, limit: params.limit ?? 100, totalPages: 1 },
    };
  }

  return {
    terms: json.data.terms,
    meta: json.data.meta,
  };
}

export async function createTerm(input: CreateTermInput): Promise<Term> {
  const response = await client.api.content.terms.$post({
    json: input,
  });

  const json = (await response.json()) as {
    success?: boolean;
    data?: Term;
    error?: { message?: string };
  };

  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error?.message || "Failed to create term");
  }

  return json.data;
}

export async function updateTerm(id: string, input: UpdateTermInput): Promise<Term> {
  const response = await client.api.content.terms[":id"].$patch({
    param: { id },
    json: input,
  });

  const json = (await response.json()) as {
    success?: boolean;
    data?: Term;
    error?: { message?: string };
  };

  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error?.message || "Failed to update term");
  }

  return json.data;
}

export async function deleteTerm(id: string): Promise<void> {
  const response = await client.api.content.terms[":id"].$delete({
    param: { id },
  });

  const json = (await response.json()) as {
    success?: boolean;
    error?: { message?: string };
  };

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || "Failed to delete term");
  }
}
