export const contentKeys = {
  all: ["content"] as const,
  taxonomies: () => [...contentKeys.all, "taxonomies"] as const,
  terms: () => [...contentKeys.all, "terms"] as const,
  termsByTaxonomy: (taxonomyId?: string | null) =>
    [...contentKeys.terms(), taxonomyId ?? "all"] as const,
  termsList: (params?: { taxonomyId?: string; page?: number; limit?: number }) =>
    [...contentKeys.terms(), "list", params ?? {}] as const,
};
