const ResearchPaperSkeleton = () => {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4">
        {/* Metadata */}
        <div className="flex gap-2">
          <div className="h-6 w-24 rounded-md bg-slate-100" />
          <div className="h-6 w-32 rounded-md bg-slate-100" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 w-full rounded bg-slate-100" />
          <div className="h-5 w-4/5 rounded bg-slate-100" />
        </div>

        {/* Authors */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-2/3 rounded bg-slate-100" />
        </div>

        {/* Journal */}
        <div className="border-t border-slate-100 pt-4">
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </div>

        {/* Link placeholders */}
        <div className="flex gap-4 pt-1">
          <div className="h-4 w-28 rounded bg-slate-100" />
          <div className="h-4 w-12 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
};

export default ResearchPaperSkeleton;