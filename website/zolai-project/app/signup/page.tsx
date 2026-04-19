import { redirect } from "next/navigation";
import { RegisterFormWrapper } from "@/features/auth/components/auth-form-wrapper";
import { requireNoAuth } from "@/lib/auth/server";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function SignupPageRoute() {
  await requireNoAuth("/dashboard");

  const config = await getSiteConfig();
  if (!config.allowRegistration) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterFormWrapper />
      </div>
    </div>
  );
}
