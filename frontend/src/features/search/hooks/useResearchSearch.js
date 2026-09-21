import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  searchResearchPapers,
  fetchResearchPaperDetail,
} from "../api/ncbiAPI.js";

const PAGE_SIZE = 10;

/* =========================================
   RESEARCH SEARCH HOOK
========================================= */

export const useResearchSearch = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const controllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const nextStartRef = useRef(0);

  // Prevent duplicate pagination requests.
  const loadingMoreRef = useRef(false);

  /* ---------------- RUN SEARCH ---------------- */

  const runSearch = useCallback(
    async (query, append = false) => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery) {
        setError("Please enter a research topic.");
        return;
      }

      // Don't start another pagination request while one is running.
      if (append && loadingMoreRef.current) {
        return;
      }

      // Cancel the previous request.
      controllerRef.current?.abort();

      const controller = new AbortController();
      controllerRef.current = controller;

      const requestId = ++requestIdRef.current;

      setError("");

      if (append) {
        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else {
        loadingMoreRef.current = false;
        setLoadingMore(false);

        setLoading(true);
        setPapers([]);
        setTotalCount(0);
        setSearchedQuery(trimmedQuery);
        setHasSearched(true);

        nextStartRef.current = 0;
      }

      const start = append ? nextStartRef.current : 0;

      try {
        const result = await searchResearchPapers(
          trimmedQuery,
          {
            start,
            limit: PAGE_SIZE,
            signal: controller.signal,
          }
        );

        // Ignore stale or cancelled requests.
        if (
          controller.signal.aborted ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        setPapers((previous) => {
          if (!append) {
            return result.papers;
          }

          // Avoid duplicate papers if the API returns overlapping IDs.
          const existingIds = new Set(
            previous.map((paper) => paper.id)
          );

          const newPapers = result.papers.filter(
            (paper) => !existingIds.has(paper.id)
          );

          return [...previous, ...newPapers];
        });

        setTotalCount(result.count);

        /*
         * IMPORTANT:
         * Advance by the requested PubMed ID page size,
         * not by result.papers.length.
         *
         * Some IDs may not have a usable ESummary record.
         * Advancing by returned papers could repeat a page.
         */
        nextStartRef.current = start + PAGE_SIZE;
      } catch (err) {
        if (
          err.name === "AbortError" ||
          controller.signal.aborted ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        setError(
          err.message || "Unable to search PubMed right now."
        );
      } finally {
        // Only the latest request may update loading states.
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
          loadingMoreRef.current = false;
        }
      }
    },
    []
  );

  /* ---------------- SEARCH ACTION ---------------- */

  const search = useCallback(
    (query) => {
      return runSearch(query, false);
    },
    [runSearch]
  );

  /* ---------------- LOAD MORE ---------------- */

  const loadMore = useCallback(() => {
    if (
      loading ||
      loadingMoreRef.current ||
      !searchedQuery ||
      nextStartRef.current >= totalCount
    ) {
      return;
    }

    return runSearch(searchedQuery, true);
  }, [
    loading,
    searchedQuery,
    totalCount,
    runSearch,
  ]);

  /* ---------------- CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      // Invalidate pending responses on unmount.
      requestIdRef.current += 1;

      controllerRef.current?.abort();
    };
  }, []);

  return {
    papers,
    loading,
    loadingMore,
    error,
    totalCount,
    searchedQuery,
    hasSearched,

    hasMore: nextStartRef.current < totalCount,

    search,
    loadMore,
  };
};

/* =========================================
   RESEARCH DETAIL HOOK
========================================= */

export const useResearchDetail = (pmid) => {
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadPaper = async () => {
      if (!pmid || !/^\d+$/.test(String(pmid))) {
        setPaper(null);
        setLoading(false);
        setError("Invalid PubMed ID.");
        return;
      }

      setLoading(true);
      setError("");
      setPaper(null);

      try {
        const result = await fetchResearchPaperDetail(
          pmid,
          {
            signal: controller.signal,
          }
        );

        if (!controller.signal.aborted) {
          setPaper(result);
        }
      } catch (err) {
        if (
          err.name === "AbortError" ||
          controller.signal.aborted
        ) {
          return;
        }

        setError(
          err.message || "Unable to load this research paper."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadPaper();

    return () => {
      controller.abort();
    };
  }, [pmid]);

  return {
    paper,
    loading,
    error,
  };
};