export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-9 w-48 bg-muted animate-pulse rounded mb-2" />
        <div className="h-5 w-64 bg-muted/50 animate-pulse rounded" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg border bg-card shadow-sm overflow-hidden"
          >
            <div className="p-6 space-y-1.5">
              <div className="h-7 w-32 bg-muted animate-pulse rounded" />
              <div className="h-5 w-48 bg-muted/50 animate-pulse rounded" />
            </div>
            <div className="px-6 pb-6">
              <div className="h-8 w-12 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
