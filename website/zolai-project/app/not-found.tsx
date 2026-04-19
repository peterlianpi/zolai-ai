import { PublicStatusPage } from "@/features/public/components/public-status-page";

export default function NotFound() {
  return <PublicStatusPage code="404" title="Page Not Found" description="The page you're looking for doesn't exist or has been moved." />;
}
