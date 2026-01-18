import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Skeleton className="h-10 w-[150px]" />

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-[80px]" />
          <Skeleton className="h-6 w-[100px]" />
        </div>
        <Skeleton className="h-8 w-[400px]" />
        <Skeleton className="h-4 w-[250px]" />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>

      {/* Info cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[200px] rounded-lg md:col-span-2" />
        <Skeleton className="h-[200px] rounded-lg" />
        <Skeleton className="h-[200px] rounded-lg" />
      </div>

      {/* Comments and Timeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[300px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    </div>
  );
}
