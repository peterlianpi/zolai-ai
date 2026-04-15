import type {
  PrismaModel,
  PrismaModelPick,
  PrismaModelWithRelations,
} from "./models";

export type PostAuthor = PrismaModelPick<"user", "id" | "name"> & Partial<PrismaModelPick<"user", "email">>;

export type PostWithFullRelations = PrismaModelWithRelations<"post", {
  author: PostAuthor;
  terms: (PrismaModelWithRelations<"postTerm", {
    term: PrismaModelWithRelations<"term", {
      taxonomy: PrismaModel<"taxonomy">;
    }>;
  }>)[];
  meta: PrismaModel<"postMeta">[];
  featuredMedia: PrismaModel<"media"> | null;
}>;

export type PostListItem = PrismaModelPick<
  "post",
  | "id"
  | "type"
  | "status"
  | "slug"
  | "title"
  | "excerpt"
  | "locale"
  | "publishedAt"
  | "isFeatured"
  | "isPopular"
  | "createdAt"
> & {
  author: PostAuthor;
  featuredMedia: PrismaModel<"media"> | null;
};
