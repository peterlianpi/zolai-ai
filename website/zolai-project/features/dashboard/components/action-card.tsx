import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActionCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  iconColor?: string;
  maxDescriptionLength?: number;
}

export function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  buttonText,
  iconColor,
  maxDescriptionLength = 100,
}: ActionCardProps) {
  const isTruncated = description.length > maxDescriptionLength;
  const displayDescription = isTruncated
    ? description.slice(0, maxDescriptionLength) + "..."
    : description;

  return (
    <Link href={href} className="block h-full">
      <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColor || ""}`} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {displayDescription}
            {isTruncated && (
              <span className="text-primary ml-1 cursor-pointer hover:underline">
                read more
              </span>
            )}
          </p>
          <Button variant="outline" className="w-full">
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
