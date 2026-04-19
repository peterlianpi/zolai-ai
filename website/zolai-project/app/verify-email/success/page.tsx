import { Suspense } from "react";
import { VerifyEmailPage } from "@/features/auth/components/verify-email-page";
import { redirect } from "next/navigation";

export default async function VerificationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string }>;
}) {
  const { callbackURL } = await searchParams;
  const dashboardUrl = callbackURL || "/dashboard";

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <VerifyEmailPage
          callbackUrl={dashboardUrl}
          onGoToDashboard={() => {
            redirect(dashboardUrl);
          }}
        />
      </Suspense>
    </div>
  );
}
