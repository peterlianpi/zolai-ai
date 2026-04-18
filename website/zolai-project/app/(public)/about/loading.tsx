import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-4 max-w-4xl">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="grid gap-4 sm:grid-cols-2 mt-8">
        {Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    </div>
  );
}
