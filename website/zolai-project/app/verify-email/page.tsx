import { redirect } from "next/navigation";

// Better Auth sends verification emails with a link to /verify-email?token=...
// Redirect to /verify-email/success which handles the token
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; callbackURL?: string }>;
}) {
  const { token, callbackURL } = await searchParams;
  const params = new URLSearchParams();
  if (token) params.set("token", token);
  if (callbackURL) params.set("callbackURL", callbackURL);
  redirect(`/verify-email/success?${params.toString()}`);
}
