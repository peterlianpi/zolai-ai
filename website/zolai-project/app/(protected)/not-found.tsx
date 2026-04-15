import { ProtectedStatusPage } from "@/features/admin/components/protected-status-page";

export default function NotFound() {
  return (
    <ProtectedStatusPage
      code="404"
      title="Page Not Found"
      description="The protected page you are looking for does not exist or may have moved."
    />
  );
}
