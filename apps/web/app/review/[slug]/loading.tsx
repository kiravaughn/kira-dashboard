export default function ReviewSlugLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <div className="h-9 w-3/4 bg-muted animate-pulse rounded mb-2" />
        <div className="h-5 w-64 bg-muted/50 animate-pulse rounded" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Content preview skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <div className="h-4 w-full bg-muted/50 animate-pulse rounded" />
            <div className="h-4 w-full bg-muted/50 animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-muted/50 animate-pulse rounded" />
            <div className="h-4 w-full bg-muted/50 animate-pulse rounded" />
            <div className="h-4 w-4/5 bg-muted/50 animate-pulse rounded" />
          </div>
        </div>

        {/* Feedback form skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted/50 animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="h-10 w-24 bg-muted animate-pulse rounded" />
                <div className="h-10 w-24 bg-muted animate-pulse rounded" />
                <div className="h-10 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted/50 animate-pulse rounded" />
              <div className="h-32 w-full bg-muted animate-pulse rounded" />
            </div>
            <div className="h-10 w-full bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
