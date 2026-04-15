import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { RedirectForm } from "@/features/redirects/components/admin/redirect-form";

interface EditRedirectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRedirectPage({ params }: EditRedirectPageProps) {
  const { id } = await params;
  const redirect = await prisma.redirect.findUnique({ where: { id } });

  if (!redirect) {
    notFound();
  }

  return (
    <RedirectForm
      initialData={{
        id: redirect.id,
        source: redirect.source,
        destination: redirect.destination,
        statusCode: redirect.statusCode,
        enabled: redirect.enabled,
      }}
      isEdit
    />
  );
}
