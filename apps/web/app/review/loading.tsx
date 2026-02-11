export default function ReviewLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-9 w-48 bg-muted animate-pulse rounded mb-2" />
        <div className="h-5 w-64 bg-muted/50 animate-pulse rounded" />
      </div>

      {/* Filter controls skeleton */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-full md:w-64 bg-muted animate-pulse rounded" />
      </div>

      {/* Content grid skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-lg border bg-card shadow-sm p-6 space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted/50 animate-pulse rounded" />
                <div className="h-4 w-5/6 bg-muted/50 animate-pulse rounded" />
              </div>
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-muted/50 animate-pulse rounded-full" />
              <div className="h-5 w-16 bg-muted/50 animate-pulse rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
