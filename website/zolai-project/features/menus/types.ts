export interface MenuItem {
  id: string;
  parentId?: string | null;
  label: string;
  url: string | null;
  target: "_blank" | "_self" | null;
  classes: string | null;
  order: number;
  children?: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  items: MenuItem[];
}
