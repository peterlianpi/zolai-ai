import { requireAuth } from "@/lib/auth/server";
import { AdminSubscribersPage } from "@/features/newsletter/components/admin/AdminSubscribersPage";

export default async function NewsletterSubscribersPage() {
  await requireAuth();
  return <AdminSubscribersPage />;
}
