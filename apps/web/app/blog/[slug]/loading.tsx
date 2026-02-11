export default function BlogPostLoading() {
  return (
    <article className="max-w-4xl mx-auto space-y-8">
      <header className="space-y-4 border-b pb-8">
        <div className="flex items-center gap-3">
          <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
          <div className="h-4 w-32 bg-muted/50 animate-pulse rounded" />
        </div>
        <div className="h-10 w-3/4 bg-muted animate-pulse rounded" />
      </header>

      <div className="space-y-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 w-full bg-muted/50 animate-pulse rounded" />
            <div className="h-4 w-full bg-muted/50 animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-muted/50 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </article>
  );
}
