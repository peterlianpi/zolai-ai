import { getServerSession } from "@/lib/auth/server";
import { forbidden } from "next/navigation";
import { isSuperAdmin } from "@/lib/auth/roles";
import { AdminDevopsPage } from "@/features/admin/components/admin-devops-page";

export default async function Page() {
  const session = await getServerSession();
  if (!isSuperAdmin(session?.user?.role)) forbidden();
  return <AdminDevopsPage />;
}
