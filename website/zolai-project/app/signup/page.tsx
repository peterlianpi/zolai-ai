import { RegisterFormWrapper } from "@/features/auth/components/auth-form-wrapper";
import { requireNoAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function SignupPageRoute() {
  // Redirect already authenticated users to dashboard
  await requireNoAuth("/dashboard");

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterFormWrapper />
      </div>
    </div>
  );
}
