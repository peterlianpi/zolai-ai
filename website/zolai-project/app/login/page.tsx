import { LoginPageWrapper } from "@/features/auth/components/auth-form-wrapper";
import { requireNoAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function LoginPageRoute({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string }>;
}) {
  const { callbackURL } = await searchParams;

  // Check if user is already authenticated
  await requireNoAuth(callbackURL || "/dashboard");

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginPageWrapper redirectUrl={callbackURL} />
      </div>
    </div>
  );
}
