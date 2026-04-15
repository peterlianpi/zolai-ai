import { requireAuth } from "@/lib/auth/server";
import { AdminNewsletterCampaignsPage } from "@/features/newsletter/components/admin/AdminNewsletterCampaignsPage";

export default async function NewsletterCampaignsPage() {
  await requireAuth();
  return <AdminNewsletterCampaignsPage />;
}
