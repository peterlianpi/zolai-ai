import { LessonDetailPage } from "@/features/lessons/components/LessonDetailPage";
export default async function Page({ params }: { params: Promise<{ planSlug: string; lessonId: string }> }) {
  const { planSlug, lessonId } = await params;
  return <LessonDetailPage planSlug={planSlug} lessonId={lessonId} />;
}
