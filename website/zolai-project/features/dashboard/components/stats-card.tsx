import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  animate?: boolean;
  isLoading?: boolean;
  error?: boolean;
}

function Counter({
  value,
  duration = 1000,
}: {
  value: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = typeof value === "string" ? parseInt(value, 10) : value;
    if (isNaN(end)) return;

    const startTime = performance.now();
    let cancelled = false;

    const animate = (currentTime: number) => {
      if (cancelled) return;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * easeOut));

      if (progress < 1 && !cancelled) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    return () => {
      cancelled = true;
    };
  }, [value, duration]);

  return <>{count}</>;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-muted-foreground",
  animate = true,
  isLoading = false,
  error = false,
}: StatsCardProps) {
  const numericValue = typeof value === "string" ? parseInt(value, 10) : value;
  const isNumeric = !isNaN(numericValue);

  const displayValue = () => {
    if (isLoading) {
      return <Skeleton className="h-8 w-20" />;
    }
    if (error) {
      return <div className="text-2xl font-bold text-red-500">Error</div>;
    }
    if (animate && isNumeric) {
      return <Counter value={numericValue} />;
    }
    return value;
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue()}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
