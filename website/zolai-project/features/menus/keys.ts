export const menuKeys = {
  all: ["menus"] as const,
  public: () => [...menuKeys.all, "public"] as const,
  location: (location?: string) =>
    [...menuKeys.public(), location ?? "all"] as const,
};
