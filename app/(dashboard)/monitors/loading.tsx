export default function MonitorsLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Title + New Monitor button */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-zinc-800 rounded-md mb-2" />
          <div className="h-4 w-56 bg-zinc-800/60 rounded-md" />
        </div>
        <div className="h-9 w-32 bg-zinc-800 rounded-md" />
      </div>

      {/* Search bar */}
      <div className="h-10 w-full bg-zinc-800/60 rounded-md" />

      {/* Monitor rows */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/40 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-zinc-700" />
              <div className="h-4 w-40 bg-zinc-800 rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-5 w-12 bg-zinc-700 rounded-full" />
              <div className="h-4 w-20 bg-zinc-800 rounded" />
              <div className="h-8 w-24 bg-zinc-800 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}