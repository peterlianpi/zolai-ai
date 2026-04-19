import { OrganizationMembersPage } from "@/features/organization/components/organization-members-page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <OrganizationMembersPage organizationId={id} />;
}
