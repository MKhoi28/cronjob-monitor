export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Title */}
      <div>
        <div className="h-8 w-32 bg-zinc-800 rounded-md mb-2" />
        <div className="h-4 w-64 bg-zinc-800/60 rounded-md" />
      </div>

      {/* 3 stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-zinc-800 rounded-lg p-6 space-y-3">
            <div className="h-3 w-32 bg-zinc-800 rounded" />
            <div className="h-8 w-12 bg-zinc-700 rounded" />
          </div>
        ))}
      </div>

      {/* Recent Pings table */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="h-4 w-28 bg-zinc-700 rounded" />
          <div className="h-4 w-16 bg-zinc-800 rounded" />
        </div>
        {/* Column headers */}
        <div className="grid grid-cols-4 px-6 py-3 border-b border-zinc-800/50">
          {['w-16', 'w-12', 'w-20', 'w-24'].map((w, i) => (
            <div key={i} className={`h-3 ${w} bg-zinc-800 rounded`} />
          ))}
        </div>
        {/* Rows */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="grid grid-cols-4 items-center px-6 py-4 border-b border-zinc-800/30 last:border-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-700" />
              <div className="h-4 w-36 bg-zinc-800 rounded" />
            </div>
            <div className="h-4 w-10 bg-zinc-700 rounded" />
            <div className="h-4 w-10 bg-zinc-800 rounded" />
            <div className="h-4 w-20 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}