import { useState } from "react";

import { useResearchSearch } from "../hooks/useResearchSearch";
import ResearchPaperCard from "../components/ResearchPaperCard";
import ResearchPaperSkeleton from "../components/ResearchPaperSkeleton";

const ResearchSearchPage = () => {
  const [query, setQuery] = useState("");

  const {
    papers,
    loading,
    loadingMore,
    error,
    totalCount,
    searchedQuery,
    hasSearched,
    hasMore,
    search,
    loadMore,
  } = useResearchSearch();

  const handleSubmit = (event) => {
    event.preventDefault();
    search(query);
  };

  const suggestions = [
    "Diabetes clinical trials",
    "Cancer immunotherapy",
    "Alzheimer's disease",
    "Artificial intelligence in medicine",
  ];

  return (
    <main className="min-h-screen bg-[#f4f6f9] text-[#202b3c]">
      {/* Subtle government portal accent */}
      <div className="h-[4px] w-full bg-[#D1EBE2]" />

      <div className="mx-auto w-full max-w-[1120px] px-4 pb-12 pt-9 sm:px-6 sm:pt-12 lg:px-8">
        {/* Centered page heading */}
        <section className="mx-auto mb-7 max-w-3xl text-center sm:mb-8">
          <h1 className="text-[25px] font-light leading-tight tracking-[-0.025em] text-[#172b4d] sm:text-[25px]">
            Search for research papers
          </h1>

          <p className="mx-auto mt-2.5 max-w-2xl text-[14px] leading-6 text-[#536273] sm:text-[15px]">
            Discover clinical studies and biomedical research publications
            indexed in PubMed.
          </p>
        </section>

        {/* Search area */}
        <section className="mx-auto max-w-[960px] sm:p-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2.5 sm:flex-row sm:gap-3"
          >
            {/* Search input */}
            <div className="relative min-w-0 flex-1">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#75869a]"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="m16 16 4 4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>

              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Enter a topic, condition, author or keyword"
                aria-label="Search research papers"
                className="h-[46px] w-full rounded-[5px] border border-[#cbd5e1] bg-white pl-10 pr-3 text-[14px] text-[#243449] outline-none transition-colors placeholder:text-[#8793a3] focus:border-[#0d0d0d] focus:ring-2 focus:ring-[#245887]/10"
              />
            </div>

            {/* Search button */}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex h-[46px] shrink-0 items-center justify-center gap-2 rounded-[5px] bg-[#aff8ca] px-6 text-[14px] font-medium text-black transition-colors hover:bg-[#0d0d0e] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[150px] cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Searching...
                </>
              ) : (
                <>
                  Search
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>

          <p className="px-0.5 pt-2.5 text-[12px] leading-5 text-[#68778a]">
            Search results are retrieved directly from PubMed.
          </p>
        </section>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="mx-auto mt-5 max-w-[960px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-5 text-red-700"
          >
            <p className="font-semibold">Unable to complete search</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <section
            aria-label="Loading research papers"
            aria-busy="true"
            className="mx-auto mt-7 max-w-[960px] space-y-3"
          >
            <div className="h-3.5 w-36 animate-pulse rounded-[3px] bg-slate-200" />

            {Array.from({ length: 4 }).map((_, index) => (
              <ResearchPaperSkeleton key={index} />
            ))}
          </section>
        )}

        {/* Search results */}
        {!loading && hasSearched && !error && (
          <section className="mx-auto mt-7 max-w-[960px] sm:mt-9">
            {/* Results heading */}
            <div className="mb-4 flex flex-col gap-2 border-b border-[#d6dee8] pb-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-[#172b4d]">
                  Search results
                </h2>

                <p className="mt-1 break-words text-[13px] leading-5 text-[#667589]">
                  Results for{" "}
                  <span className="font-medium text-[#34465c]">
                    “{searchedQuery}”
                  </span>
                </p>
              </div>

              <p className="text-[12px] text-[#68778a]">
                {totalCount.toLocaleString()} papers found
              </p>
            </div>

            {/* Empty state */}
            {papers.length === 0 && (
              <div className="border border-dashed border-[#cbd5e1] bg-white px-5 py-10 text-center">
                <h3 className="text-[15px] font-semibold text-[#26374b]">
                  No research papers found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-[#68778a]">
                  Try a broader keyword, a different spelling, or a related
                  research topic.
                </p>
              </div>
            )}

            {/* Paper cards */}
            {papers.length > 0 && (
              <div className="divide-y divide-[#dce3eb] border-t border-[#dce3eb]">
                {papers.map((paper) => (
                  <ResearchPaperCard key={paper.id} paper={paper} />
                ))}
              </div>
            )}

            {/* Load more */}
            {hasMore && papers.length > 0 && (
              <div className="mt-6 flex flex-col items-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[5px] border border-[#b9c7d6] bg-white px-5 py-2 text-[13px] font-medium text-[#245887] transition-colors hover:border-[#245887] hover:bg-[#f6f9fc] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#cbd5e1] border-t-[#245887]" />
                      Loading papers...
                    </>
                  ) : (
                    "Load more papers"
                  )}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Initial state / topic suggestions */}
        {!hasSearched && (
          <section className="mx-auto mt-7 max-w-[960px] border-t border-[#d6dee8] pt-5 sm:mt-9">
            <h2 className="text-[14px] font-medium text-[#34465c]">
              Start with a research topic
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setQuery(suggestion);
                    search(suggestion);
                  }}
                  className="rounded-[5px] border border-[#d2dce7] bg-white px-3 py-2 text-[12px] leading-5 text-[#43566d] transition-colors hover:border-[#9aafc4] hover:bg-[#f6f9fc] hover:text-[#174a78]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Footer note */}
        <footer className="mx-auto mt-9 max-w-[960px] border-t border-[#d6dee8] pt-4 sm:mt-11">
          <p className="text-[11px] leading-5 text-[#758296]">
            Research records are provided by PubMed, a service of the U.S.
            National Library of Medicine. Publication metadata may be incomplete
            for some records.
          </p>
        </footer>
      </div>
    </main>
  );
};

export default ResearchSearchPage;
