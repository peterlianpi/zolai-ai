import { requireAuth } from "@/lib/auth/server";
import { AdminTemplatesPage } from "@/features/templates/components/admin/AdminTemplatesPage";

export default async function TemplatesManagementPage() {
  await requireAuth();
  return <AdminTemplatesPage />;
}
