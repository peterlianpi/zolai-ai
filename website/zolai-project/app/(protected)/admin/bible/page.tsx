import { AdminBiblePage } from "@/features/admin/components/admin-bible-page";

export default async function Page({ searchParams }: { searchParams: Promise<{ book?: string; q?: string }> }) {
  const { book, q } = await searchParams;
  return <AdminBiblePage book={book} q={q} />;
}
