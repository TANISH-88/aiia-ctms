const Line = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
);

const ResearchDetailSkeleton = () => {
  return (
    <div
      aria-label="Loading research paper"
      aria-busy="true"
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <Line className="mb-8 h-3 w-28" />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <Line className="mb-4 h-3 w-32" />

          <div className="mb-6 space-y-3">
            <Line className="h-7 w-full" />
            <Line className="h-7 w-5/6" />
            <Line className="h-7 w-2/3" />
          </div>

          <Line className="mb-3 h-4 w-4/5" />
          <Line className="mb-8 h-4 w-1/2" />

          <div className="border-t border-slate-200 pt-7">
            <Line className="mb-5 h-5 w-28" />

            <div className="space-y-3">
              <Line className="h-3 w-full" />
              <Line className="h-3 w-full" />
              <Line className="h-3 w-11/12" />
              <Line className="h-3 w-full" />
              <Line className="h-3 w-4/5" />
              <Line className="h-3 w-full" />
              <Line className="h-3 w-3/4" />
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-7">
            <Line className="mb-5 h-5 w-36" />

            <div className="space-y-3">
              <Line className="h-3 w-full" />
              <Line className="h-3 w-5/6" />
              <Line className="h-3 w-full" />
              <Line className="h-3 w-2/3" />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="border-t border-slate-200 pt-4">
            <Line className="mb-4 h-4 w-24" />
            <Line className="mb-2 h-3 w-full" />
            <Line className="mb-2 h-3 w-4/5" />
            <Line className="h-3 w-2/3" />
          </div>

          <div className="border-t border-slate-200 pt-4">
            <Line className="mb-4 h-4 w-28" />
            <Line className="mb-2 h-3 w-full" />
            <Line className="h-3 w-5/6" />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ResearchDetailSkeleton;