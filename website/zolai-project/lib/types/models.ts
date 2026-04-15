import type {
  CommentModel,
  MediaModel,
  MenuItemModel,
  MenuModel,
  PostMetaModel,
  PostModel,
  PostTermModel,
  RedirectModel,
  SiteSettingModel,
  TaxonomyModel,
  TermModel,
  UserModel,
} from "@/lib/generated/prisma/models";

export interface PrismaModelMap {
  comment: CommentModel;
  media: MediaModel;
  menu: MenuModel;
  menuItem: MenuItemModel;
  post: PostModel;
  postMeta: PostMetaModel;
  postTerm: PostTermModel;
  redirect: RedirectModel;
  siteSetting: SiteSettingModel;
  taxonomy: TaxonomyModel;
  term: TermModel;
  user: UserModel;
}

export type PrismaModelName = keyof PrismaModelMap;

export type PrismaModel<N extends PrismaModelName> = PrismaModelMap[N];

export type PrismaModelPick<
  N extends PrismaModelName,
  K extends keyof PrismaModel<N>,
> = Pick<PrismaModel<N>, K>;

export type PrismaModelWithRelations<
  N extends PrismaModelName,
  R extends object = Record<string, never>,
> = PrismaModel<N> & R;

type SerializedValue<T> =
  T extends Date ? string
  : T extends Array<infer U> ? SerializedValue<U>[]
  : T extends object ? { [K in keyof T]: SerializedValue<T[K]> }
  : T;

export type SerializedPrismaModel<N extends PrismaModelName> = SerializedValue<PrismaModel<N>>;

export type SerializedPrismaModelPick<
  N extends PrismaModelName,
  K extends keyof SerializedPrismaModel<N>,
> = Pick<SerializedPrismaModel<N>, K>;

export type SerializedPrismaModelWithRelations<
  N extends PrismaModelName,
  R extends object = Record<string, never>,
> = SerializedPrismaModel<N> & R;
