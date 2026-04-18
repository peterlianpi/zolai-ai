import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Prisma } from "@/lib/generated/prisma";
type MediaWhereInput = Prisma.MediaWhereInput;
import { cn } from "@/lib/utils";
import { Trash2, Check } from "lucide-react";

interface MediaGridProps {
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  showDelete?: boolean;
  limit?: number;
  mimeType?: string;
}

async function isAdmin(): Promise<boolean> {
  const cookie = (await headers()).get("cookie");
  const headersObj: Record<string, string> = cookie ? { Cookie: cookie } : {};
  const session = await auth.api.getSession({ headers: headersObj });
  if (!session?.user) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export default async function MediaGrid({
  onSelect,
  selectedId,
  showDelete = false,
  limit = 20,
  mimeType,
}: MediaGridProps) {
  const admin = await isAdmin();

  const where: MediaWhereInput = {};
  if (mimeType) where.mimeType = mimeType;

  const media = await prisma.media.findMany({
    where,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  if (!media.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">No media files found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {media.map((item) => {
        const isImage = item.mimeType.startsWith("image/");
        const isSelected = selectedId === item.id;

        return (
          <div
            key={item.id}
            className={cn(
              "group relative overflow-hidden rounded-lg border transition-all",
              isSelected && "ring-2 ring-primary",
              onSelect && "cursor-pointer hover:border-primary",
            )}
            onClick={() => onSelect?.(item.id)}
          >
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt={item.altText || "Media file"}
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-muted">
                <span className="text-xs text-muted-foreground">
                  {item.mimeType.split("/")[1]?.toUpperCase() || "FILE"}
                </span>
              </div>
            )}

            {isSelected && (
              <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                <Check className="h-3 w-3" />
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="truncate text-xs text-white" title={item.altText || item.filePath || ""}>
                {item.altText || item.filePath || "Unnamed"}
              </p>
              {item.fileSize && (
                <p className="text-xs text-muted-foreground">
                  {(item.fileSize / 1024).toFixed(1)} KB
                </p>
              )}
            </div>

            {showDelete && admin && (
              <form
                action={async () => {
                  "use server";
                  const cookie = (await headers()).get("cookie");
                  const headersObj: Record<string, string> = cookie ? { Cookie: cookie } : {};
                  const session = await auth.api.getSession({ headers: headersObj });
                  if (!session?.user) return;

                  const user = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { role: true },
                  });
                  if (user?.role !== "ADMIN") return;

                  await prisma.media.delete({ where: { id: item.id } });
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="submit"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity hover:bg-destructive/80 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
