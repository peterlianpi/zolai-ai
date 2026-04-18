import { EditWikiPage } from "@/features/admin/components/EditWikiPage";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditWikiPage id={id} />;
}
