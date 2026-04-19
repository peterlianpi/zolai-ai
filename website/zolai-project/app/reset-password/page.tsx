import { ResetPasswordFormWrapper } from "@/features/auth/components/auth-form-wrapper";
import { requireNoAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPageRoute() {
  await requireNoAuth("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ResetPasswordFormWrapper />
    </div>
  );
}
