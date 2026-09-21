import { Link } from "react-router-dom";

const ResearchPaperCard = ({ paper }) => {
  return (
    <article className="border-b border-slate-200 py-6 first:pt-0">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span>PMID : {paper.id}</span>

        {paper.publicationDate && (
          <>
            <span className="text-slate-300">·</span>
            <span>{paper.publicationDate}</span>
          </>
        )}
      </div>

      <h2 className="max-w-4xl text-lg font-semibold leading-7 tracking-tight text-slate-900 sm:text-xl">
        <Link
          to={`/research/paper/${paper.id}`}
          className="transition-colors hover:text-[#174a8b]"
        >
          {paper.title}
        </Link>
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {paper.authors.length
          ? paper.authors.join(", ")
          : "Author information unavailable"}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {paper.journal}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link
          to={`/research/paper/${paper.id}`}
          className="text-sm font-semibold text-[#174a8b] hover:underline"
        >
          View paper details →
        </Link>

        <a
          href={paper.pubmedUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-slate-500 hover:text-slate-800 hover:underline"
        >
          PubMed ↗
        </a>

        {paper.doi && (
          <a
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-slate-500 hover:text-slate-800 hover:underline"
          >
            DOI ↗
          </a>
        )}
      </div>
    </article>
  );
};

export default ResearchPaperCard;