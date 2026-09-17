import { useEffect, useState } from "react";

const Skeleton = ({ className, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!isVisible) {
    return <div className={`bg-[#e9edf1] ${className}`} />;
  }

  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-[#e9edf1] via-[#f4f8fb] to-[#e9edf1] bg-[length:200%_100%] ${className}`}
    />
  );
};

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f4f8fb]">
      <main className="mx-auto max-w-[1400px] px-6 py-9">
        {/* Overview Section Skeleton */}
        <section>
          <div className="mb-7">
            <Skeleton className="h-7 w-48 rounded" delay={0} />
            <Skeleton className="mt-2 h-4 w-64 rounded" delay={100} />
          </div>

          {/* KPI Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[...Array(5)].map((_, index) => (
              <KPICardSkeleton key={index} delay={index * 100} />
            ))}
          </div>
        </section>

        {/* Study Performance Section Skeleton */}
        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <Skeleton className="h-7 w-56 rounded" delay={500} />
              <Skeleton className="mt-2 h-4 w-72 rounded" delay={600} />
            </div>
            <Skeleton className="hidden h-5 w-24 rounded sm:block" delay={700} />
          </div>

          {/* Table Skeleton */}
          <div className="overflow-hidden rounded-[6px] border border-[#dfe7ef] bg-white shadow-[0_1px_2px_rgba(19,52,80,0.08)]">
            <TableSkeleton rows={3} delay={800} />
          </div>
        </section>

        {/* Attention Required Section Skeleton */}
        <section className="mt-10 pb-10">
          <div className="mb-6">
            <Skeleton className="h-7 w-52 rounded" delay={1200} />
            <Skeleton className="mt-2 h-4 w-80 rounded" delay={1300} />
          </div>

          <AttentionCardSkeleton delay={1400} />
        </section>
      </main>
    </div>
  );
}

function KPICardSkeleton({ delay }) {
  return (
    <div className="rounded-[6px] border border-[#dfe7ef] bg-white p-5 shadow-[0_1px_2px_rgba(19,52,80,0.08)]">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24 rounded" delay={delay} />
        <Skeleton className="h-2.5 w-2.5 rounded-full" delay={delay + 50} />
      </div>
      <Skeleton className="mt-4 h-8 w-16 rounded" delay={delay + 100} />
      <Skeleton className="mt-2 h-3 w-20 rounded" delay={delay + 150} />
    </div>
  );
}

function TableSkeleton({ rows = 3, delay }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-[#dfe7ef] bg-[#f8fafc]">
            {[...Array(6)].map((_, index) => (
              <th
                key={index}
                className={`px-6 py-4 text-left ${
                  index === 0 ? "px-6" : index === 5 ? "px-6" : "px-5"
                }`}
              >
                <Skeleton className="h-3 w-16 rounded" delay={delay + index * 50} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-[#dfe7ef] last:border-b-0"
            >
              <td className="px-6 py-5">
                <Skeleton className="h-5 w-48 rounded" delay={delay + 300 + rowIndex * 100} />
                <Skeleton className="mt-1.5 h-3 w-24 rounded" delay={delay + 350 + rowIndex * 100} />
              </td>
              <td className="px-5 py-5">
                <Skeleton className="h-6 w-20 rounded-full" delay={delay + 400 + rowIndex * 100} />
              </td>
              <td className="px-5 py-5">
                <div className="w-[245px]">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16 rounded" delay={delay + 450 + rowIndex * 100} />
                    <Skeleton className="h-4 w-8 rounded" delay={delay + 500 + rowIndex * 100} />
                  </div>
                  <Skeleton className="mt-2 h-1.5 w-full rounded-full" delay={delay + 550 + rowIndex * 100} />
                </div>
              </td>
              <td className="px-5 py-5">
                <Skeleton className="h-4 w-6 rounded" delay={delay + 600 + rowIndex * 100} />
              </td>
              <td className="px-5 py-5">
                <Skeleton className="h-4 w-6 rounded" delay={delay + 650 + rowIndex * 100} />
              </td>
              <td className="px-6 py-5">
                <Skeleton className="h-4 w-6 rounded" delay={delay + 700 + rowIndex * 100} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AttentionCardSkeleton({ delay }) {
  return (
    <div className="max-w-[690px] rounded-[6px] border border-[#dfe7ef] bg-white p-6 shadow-[0_1px_2px_rgba(19,52,80,0.08)]">
      <div className="flex items-start gap-4">
        <Skeleton className="h-11 w-11 shrink-0 rounded-full" delay={delay} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-5">
            <div className="flex-1">
              <Skeleton className="h-5 w-72 rounded" delay={delay + 50} />
              <Skeleton className="mt-1 h-4 w-48 rounded" delay={delay + 100} />
            </div>
            <Skeleton className="h-4 w-16 rounded" delay={delay + 150} />
          </div>
          <div className="mt-5 flex items-center gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index}>
                <Skeleton className="h-2.5 w-12 rounded" delay={delay + 200 + index * 50} />
                <Skeleton className="mt-2 h-4 w-6 rounded" delay={delay + 250 + index * 50} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f4f8fb]">
      <main className="mx-auto max-w-[1400px] px-6 py-9">
        {/* Admin Governance Section Skeleton */}
        <section className="mb-10">
          <div className="mb-6">
            <Skeleton className="h-7 w-64 rounded" delay={0} />
            <Skeleton className="mt-2 h-4 w-72 rounded" delay={100} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <GovernanceCardSkeleton key={index} delay={index * 100} />
            ))}
          </div>
        </section>

        {/* System Overview Section Skeleton */}
        <section>
          <div className="mb-7">
            <Skeleton className="h-7 w-56 rounded" delay={300} />
            <Skeleton className="mt-2 h-4 w-80 rounded" delay={400} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[...Array(5)].map((_, index) => (
              <KPICardSkeleton key={index} delay={500 + index * 100} />
            ))}
          </div>
        </section>

        {/* Study Performance Section Skeleton */}
        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <Skeleton className="h-7 w-56 rounded" delay={1000} />
              <Skeleton className="mt-2 h-4 w-72 rounded" delay={1100} />
            </div>
            <Skeleton className="hidden h-5 w-24 rounded sm:block" delay={1200} />
          </div>

          <div className="overflow-hidden rounded-[6px] border border-[#dfe7ef] bg-white shadow-[0_1px_2px_rgba(19,52,80,0.08)]">
            <TableSkeleton rows={3} delay={1300} />
          </div>
        </section>

        {/* Attention Required Section Skeleton */}
        <section className="mt-10 pb-10">
          <div className="mb-6">
            <Skeleton className="h-7 w-52 rounded" delay={1700} />
            <Skeleton className="mt-2 h-4 w-80 rounded" delay={1800} />
          </div>

          <AttentionCardSkeleton delay={1900} />
        </section>
      </main>
    </div>
  );
}

function GovernanceCardSkeleton({ delay }) {
  return (
    <div className="rounded-[6px] border border-[#dfe7ef] bg-white p-5 shadow-[0_1px_2px_rgba(19,52,80,0.08)]">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24 rounded" delay={delay} />
        <Skeleton className="h-2.5 w-2.5 rounded-full" delay={delay + 50} />
      </div>
      <Skeleton className="mt-4 h-5 w-40 rounded" delay={delay + 100} />
      <Skeleton className="mt-2 h-3 w-48 rounded" delay={delay + 150} />
    </div>
  );
}

// ─── Study Coordinator skeleton ───────────────────────────────────────────────

export function StudyCoordinatorDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f4f8fb]">
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">

        {/* Page header */}
        <div className="mb-6 border-b border-[#dfe7ef] pb-5 sm:mb-8 sm:pb-6">
          <Skeleton className="h-3 w-40 rounded" delay={0} />
          <Skeleton className="mt-3 h-6 w-56 rounded sm:h-7 sm:w-64" delay={80} />
          <Skeleton className="mt-2 h-4 w-64 rounded sm:w-72" delay={160} />
        </div>

        {/* Quick actions */}
        <div className="mb-6 sm:mb-8">
          <Skeleton className="mb-2 h-3 w-24 rounded" delay={200} />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-36 rounded-[5px]" delay={260} />
            <Skeleton className="h-9 w-28 rounded-[5px]" delay={310} />
          </div>
        </div>

        {/* KPI strip — 2 cols mobile, 4 cols lg+ */}
        <section className="mb-8 sm:mb-10">
          <Skeleton className="mb-3 h-5 w-44 rounded sm:mb-4" delay={380} />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-[6px] border border-[#dfe7ef] bg-white p-4 shadow-[0_1px_2px_rgba(19,52,80,0.06)] sm:p-5"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20 rounded sm:h-4 sm:w-24" delay={440 + i * 55} />
                  <Skeleton className="h-2 w-2 rounded-full" delay={460 + i * 55} />
                </div>
                <Skeleton className="mt-3 h-7 w-12 rounded sm:mt-4 sm:h-8 sm:w-14" delay={500 + i * 55} />
                <Skeleton className="mt-1.5 h-3 w-16 rounded sm:mt-2 sm:w-20" delay={540 + i * 55} />
              </div>
            ))}
          </div>
        </section>

        {/* Open AEs */}
        <section className="mb-8 sm:mb-10">
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <Skeleton className="h-5 w-44 rounded" delay={700} />
            <Skeleton className="h-4 w-16 rounded" delay={740} />
          </div>
          <div className="overflow-hidden rounded-[6px] border border-[#dfe7ef] bg-white shadow-[0_1px_2px_rgba(19,52,80,0.06)]">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`px-4 py-4 sm:px-5 ${i < 2 ? "border-b border-[#dfe7ef]" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="mt-0.5 h-7 w-7 shrink-0 rounded-full" delay={780 + i * 75} />
                  <div className="min-w-0 flex-1">
                    <div className="flex gap-1.5">
                      <Skeleton className="h-5 w-18 rounded-[4px]" delay={820 + i * 75} />
                      <Skeleton className="h-5 w-14 rounded" delay={845 + i * 75} />
                    </div>
                    <Skeleton className="mt-1.5 h-4 w-3/4 rounded" delay={870 + i * 75} />
                    <Skeleton className="mt-1 h-3 w-1/2 rounded" delay={895 + i * 75} />
                  </div>
                  {/* review button — hidden on mobile skeleton too */}
                  <Skeleton className="hidden h-4 w-16 rounded sm:block" delay={920 + i * 75} />
                </div>
                {/* mobile review button */}
                <Skeleton className="mt-3 h-9 w-full rounded-[5px] sm:hidden" delay={950 + i * 75} />
              </div>
            ))}
          </div>
        </section>

        {/* Recent subjects */}
        <section className="mb-8 sm:mb-10">
          <Skeleton className="mb-3 h-5 w-36 rounded sm:mb-4" delay={1080} />
          <div className="overflow-hidden rounded-[6px] border border-[#dfe7ef] bg-white shadow-[0_1px_2px_rgba(19,52,80,0.06)]">
            {/* Table header — sm+ only */}
            <div className="hidden border-b border-[#dfe7ef] bg-[#f8fafc] px-6 py-3.5 sm:block">
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-3 w-20 rounded" delay={1140 + i * 35} />
                ))}
              </div>
            </div>
            {/* Table rows — sm+ */}
            <div className="hidden sm:block">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-4 gap-4 px-6 py-4 ${i < 2 ? "border-b border-[#dfe7ef]" : ""}`}
                >
                  <Skeleton className="h-4 w-20 rounded" delay={1280 + i * 75} />
                  <Skeleton className="h-4 w-40 rounded" delay={1315 + i * 75} />
                  <Skeleton className="h-5 w-20 rounded-[4px]" delay={1350 + i * 75} />
                  <Skeleton className="h-4 w-24 rounded" delay={1385 + i * 75} />
                </div>
              ))}
            </div>
            {/* Card rows — mobile only */}
            <div className="divide-y divide-[#dfe7ef] sm:hidden">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-4 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-4 w-20 rounded" delay={1280 + i * 75} />
                    <Skeleton className="h-5 w-18 rounded-[4px]" delay={1310 + i * 75} />
                  </div>
                  <Skeleton className="mt-1.5 h-3 w-3/4 rounded" delay={1340 + i * 75} />
                  <Skeleton className="mt-1 h-3 w-1/3 rounded" delay={1365 + i * 75} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Assigned studies grid */}
        <section className="pb-8 sm:pb-10">
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <Skeleton className="h-5 w-40 rounded" delay={1520} />
            <Skeleton className="h-4 w-16 rounded" delay={1560} />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="rounded-[6px] border border-[#dfe7ef] bg-white p-4 shadow-[0_1px_2px_rgba(19,52,80,0.06)] sm:p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 rounded" delay={1620 + i * 75} />
                    <Skeleton className="mt-1.5 h-3 w-1/3 rounded" delay={1660 + i * 75} />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-[4px]" delay={1680 + i * 75} />
                </div>
                <Skeleton className="mb-1 h-3 w-28 rounded" delay={1710 + i * 75} />
                <Skeleton className="h-1.5 w-full rounded-full" delay={1740 + i * 75} />
                <div className="mt-3 flex items-center justify-between border-t border-[#f0f4f8] pt-3 sm:mt-4 sm:pt-4">
                  <div className="flex gap-4 sm:gap-5">
                    <div>
                      <Skeleton className="h-4 w-5 rounded" delay={1780 + i * 75} />
                      <Skeleton className="mt-1 h-3 w-12 rounded" delay={1800 + i * 75} />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-5 rounded" delay={1820 + i * 75} />
                      <Skeleton className="mt-1 h-3 w-12 rounded" delay={1840 + i * 75} />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16 rounded" delay={1860 + i * 75} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
