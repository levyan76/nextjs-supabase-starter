export default function DashboardLoading() {
  return (
    <div className="flex flex-1 animate-pulse flex-col gap-6 p-8 pt-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="bg-muted h-8 w-48 rounded-lg" />
        <div className="bg-muted h-9 w-28 rounded-lg" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card space-y-3 rounded-xl border p-6">
            <div className="bg-muted h-4 w-24 rounded" />
            <div className="bg-muted h-8 w-16 rounded" />
            <div className="bg-muted h-3 w-32 rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-card overflow-hidden rounded-xl border">
        <div className="bg-muted/50 flex gap-4 border-b px-4 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-muted h-4 w-24 rounded" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b px-4 py-4 last:border-0"
          >
            <div className="bg-muted size-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="bg-muted h-4 w-40 rounded" />
              <div className="bg-muted h-3 w-56 rounded" />
            </div>
            <div className="bg-muted h-6 w-16 rounded-full" />
            <div className="bg-muted h-6 w-16 rounded-full" />
            <div className="ml-auto flex gap-1">
              <div className="bg-muted size-8 rounded" />
              <div className="bg-muted size-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
