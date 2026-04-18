import { LessonPlanPage } from "@/features/lessons/components/LessonPlanPage";
export default async function Page({ params }: { params: Promise<{ planSlug: string }> }) {
  const { planSlug } = await params;
  return <LessonPlanPage planSlug={planSlug} />;
}
