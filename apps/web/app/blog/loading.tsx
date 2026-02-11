export default function BlogLoading() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <div className="h-9 w-32 bg-muted animate-pulse rounded mb-2" />
        <div className="h-5 w-64 bg-muted/50 animate-pulse rounded" />
      </div>

      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border bg-card shadow-sm overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted/50 animate-pulse rounded" />
                    <div className="h-4 w-full bg-muted/50 animate-pulse rounded" />
                    <div className="h-4 w-2/3 bg-muted/50 animate-pulse rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="h-4 w-32 bg-muted/50 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
