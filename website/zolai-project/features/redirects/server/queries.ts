import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function getRedirectById(id: string) {
  const redirect = await prisma.redirect.findUnique({ where: { id } });
  if (!redirect) notFound();
  return redirect;
}
