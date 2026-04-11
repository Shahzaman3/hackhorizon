export const StatSkeleton = () => (
  <div className="bg-white border border-border rounded-3xl p-6 h-32 animate-pulse flex flex-col justify-between">
    <div className="h-2 w-1/3 bg-surface-2 rounded" />
    <div className="h-6 w-1/2 bg-surface-2 rounded" />
    <div className="h-2 w-1/4 bg-surface-2 rounded" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white border border-border rounded-[2.5rem] p-10 h-[400px] animate-pulse flex flex-col gap-6">
    <div className="flex justify-between">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-surface-2 rounded" />
        <div className="h-2 w-48 bg-surface-2 rounded" />
      </div>
    </div>
    <div className="flex-1 bg-surface-2/50 rounded-2xl" />
  </div>
);

export const TableSkeleton = () => (
  <div className="bg-white border border-border rounded-[2.5rem] overflow-hidden animate-pulse">
    <div className="px-8 py-6 border-b border-border h-16 bg-surface-2/10 flex items-center">
      <div className="h-4 w-40 bg-surface-2 rounded" />
    </div>
    <div className="p-8 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 w-full bg-surface-2/50 rounded-xl" />
      ))}
    </div>
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white border border-border rounded-[2rem] p-8 h-64 animate-pulse flex flex-col gap-4">
    <div className="w-12 h-12 rounded-2xl bg-surface-2" />
    <div className="h-4 w-1/2 bg-surface-2 rounded" />
    <div className="h-2 w-full bg-surface-2 rounded" />
    <div className="mt-auto h-10 w-full bg-surface-2 rounded-xl" />
  </div>
);
