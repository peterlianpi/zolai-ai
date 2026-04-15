import { ProtectedStatusPage } from "@/features/admin/components/protected-status-page";

export default function Forbidden() {
  return <ProtectedStatusPage code="403" title="Access Denied" description="You do not have permission to access this page." retryLabel="Refresh" />;
}
