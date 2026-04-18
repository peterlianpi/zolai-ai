import { EditLessonPage } from "@/features/admin/components/EditLessonPage";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EditLessonPage slug={slug} />;
}
