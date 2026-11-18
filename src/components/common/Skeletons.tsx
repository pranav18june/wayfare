export function ResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-[#ECE8DF]" />
              <div className="h-4 w-32 rounded bg-[#ECE8DF]" />
            </div>
            <div className="h-6 w-24 rounded bg-[#ECE8DF]" />
          </div>

          <div className="grid grid-cols-4 gap-4 py-2 border-t border-b border-[var(--line)]">
            <div className="h-4 w-20 rounded bg-[#ECE8DF]" />
            <div className="h-4 w-16 rounded bg-[#ECE8DF]" />
            <div className="h-4 w-20 rounded bg-[#ECE8DF]" />
            <div className="h-4 w-24 rounded bg-[#ECE8DF]" />
          </div>

          <div className="flex justify-end">
            <div className="h-8 w-28 rounded bg-[#ECE8DF]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-6 max-w-4xl mx-auto p-4">
      <div className="h-8 w-2/3 rounded bg-[#ECE8DF]" />
      <div className="h-64 w-full rounded bg-[#ECE8DF]" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 rounded bg-[#ECE8DF]" />
        <div className="h-24 rounded bg-[#ECE8DF]" />
        <div className="h-24 rounded bg-[#ECE8DF]" />
      </div>
    </div>
  );
}
