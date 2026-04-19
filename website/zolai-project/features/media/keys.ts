export const mediaKeys = {
  all: ["media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: (params?: object) => [...mediaKeys.lists(), params] as const,
  infinite: (params?: object) => [...mediaKeys.all, "infinite", params] as const,
  detail: (id: string) => [...mediaKeys.all, "detail", id] as const,
};
