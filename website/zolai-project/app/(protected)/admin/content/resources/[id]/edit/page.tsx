import ResourcesEditPage from "@/features/content/components/admin/resources-edit-page";

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ResourcesEditPage id={id} />;
}
