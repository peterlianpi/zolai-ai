import AdminResourcesPage from "@/features/content/components/admin/admin-resources-page";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    status?: string;
    locale?: string;
    page?: string;
    search?: string;
  }>;
}) {
  return <AdminResourcesPage searchParams={searchParams} />;
}
