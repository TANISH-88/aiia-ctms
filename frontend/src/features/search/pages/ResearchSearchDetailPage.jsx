import { Link, useParams } from "react-router-dom";

import { useResearchDetail } from "../hooks/useResearchSearch";
import ResearchDetailSkeleton from "../components/ResearchDetailSkeleton";

const SectionHeading = ({ children }) => (
  <h2 className="mb-4 text-base font-semibold tracking-tight text-slate-900">
    {children}
  </h2>
);

const MetadataRow = ({ label, children }) => {
  if (!children) return null;

  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0">
      <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="break-words text-sm leading-6 text-slate-700">
        {children}
      </dd>
    </div>
  );
};

const ResearchSearchDetailPage = () => {
  const { id } = useParams();

  const { paper, loading, error } = useResearchDetail(id);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <ResearchDetailSkeleton />
      </main>
    );
  }

  if (error || !paper) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/research/search"
            className="text-sm font-medium text-[#174a8b] hover:underline"
          >
            ← Back to research search
          </Link>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h1 className="text-xl font-semibold text-slate-900">
              Unable to load research paper
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {error || "This PubMed record could not be found."}
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Check the PubMed ID or try opening the record directly
              on PubMed.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const authorNames = paper.authors.map((author) => author.name);

  const publicationInfo = [
    paper.journalISO || paper.journal,
    paper.publicationDate,
    paper.volume ? `Vol. ${paper.volume}` : "",
    paper.issue ? `Issue ${paper.issue}` : "",
    paper.pages,
  ].filter(Boolean).join(" · ");

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-7 sm:px-6 sm:pt-9 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500"
        >
          <Link
            to="/research/search"
            className="transition hover:text-[#174a8b]"
          >
            Research
          </Link>

          <span aria-hidden="true">/</span>

          <span className="text-slate-700">Paper details</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-14">
          {/* Main article */}
          <article className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              <span>PubMed record</span>
              <span className="text-slate-300">/</span>
              <span>PMID : {paper.id}</span>
            </div>

            <h1 className="max-w-4xl text-[1.75rem] font-normal leading-tight tracking-[-0.035em] text-slate-950 sm:text-3xl lg:text-[2.4rem]">
              {paper.title}
            </h1> 

            {/* Authors */}
            <div className="mt-6">
              <p className="text-sm leading-6 text-slate-700">
                {authorNames.length
                  ? authorNames.join(", ")
                  : "Author information unavailable"}
              </p>
            </div>

            {/* Journal / publication line */}
            {publicationInfo && (
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {publicationInfo}
              </p>
            )}

            {/* External source links */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-slate-200 pb-6">
              <a
                href={paper.pubmedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#174a8b] hover:underline"
              >
                View on PubMed <span aria-hidden="true">↗</span>
              </a>

              {paper.doi && (
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-slate-600 hover:text-[#174a8b] hover:underline"
                >
                  DOI <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>

            {/* Abstract */}
            <section className="border-b border-slate-200 py-7">
              <SectionHeading>Abstract</SectionHeading>

              {paper.abstract.length > 0 ? (
                <div className="space-y-5">
                  {paper.abstract.map((item, index) => (
                    <div key={`${item.label}-${index}`}>
                      {item.label && (
                        <h3 className="mb-1.5 text-sm font-semibold text-slate-800">
                          {item.label}
                        </h3>
                      )}

                      <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  No abstract is available in this PubMed record.
                  You can check the source record for additional
                  information.
                </p>
              )}
            </section>

            {/* Keywords */}
            {paper.keywords.length > 0 && (
              <section className="border-b border-slate-200 py-7">
                <SectionHeading>Keywords</SectionHeading>

                <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((keyword, index) => (
                    <span
                      key={`${keyword}-${index}`}
                      className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs leading-5 text-slate-600"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* MeSH terms */}
            {paper.meshTerms.length > 0 && (
              <section className="border-b border-slate-200 py-7">
                <SectionHeading>MeSH terms</SectionHeading>

                <div className="flex flex-wrap gap-2">
                  {paper.meshTerms.map((mesh, index) => (
                    <span
                      key={`${mesh.descriptor}-${index}`}
                      title={mesh.qualifiers.join(", ")}
                      className="rounded-md bg-slate-50 px-2.5 py-1.5 text-xs leading-5 text-slate-600"
                    >
                      {mesh.descriptor}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Author affiliations */}
            {paper.affiliations.length > 0 && (
              <section className="border-b border-slate-200 py-7">
                <SectionHeading>Author affiliations</SectionHeading>

                <ol className="list-decimal space-y-3 pl-5">
                  {paper.affiliations.map((affiliation, index) => (
                    <li
                      key={`${affiliation}-${index}`}
                      className="pl-1 text-sm leading-6 text-slate-600"
                    >
                      {affiliation}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Publication types */}
            {paper.publicationTypes.length > 0 && (
              <section className="py-7">
                <SectionHeading>Publication types</SectionHeading>

                <div className="flex flex-wrap gap-2">
                  {paper.publicationTypes.map((type, index) => (
                    <span
                      key={`${type}-${index}`}
                      className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Metadata sidebar */}
          <aside className="min-w-0">
            <div className="border-t border-slate-300 pt-4">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">
                Article information
              </h2>

              <dl>
                <MetadataRow label="PubMed ID">
                  {paper.id}
                </MetadataRow>

                <MetadataRow label="Journal">
                  {paper.journal}
                </MetadataRow>

                <MetadataRow label="Publication date">
                  {paper.publicationDate}
                </MetadataRow>

                <MetadataRow label="Volume">
                  {paper.volume}
                </MetadataRow>

                <MetadataRow label="Issue">
                  {paper.issue}
                </MetadataRow>

                <MetadataRow label="Pages">
                  {paper.pages}
                </MetadataRow>

                <MetadataRow label="Language">
                  {paper.language.join(", ")}
                </MetadataRow>

                <MetadataRow label="DOI">
                  {paper.doi}
                </MetadataRow>
              </dl>
            </div>

            <div className="mt-8 border-t border-slate-300 pt-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Source
              </h2>

              <p className="text-sm leading-6 text-slate-600">
                This record is retrieved from PubMed, maintained by
                the U.S. National Library of Medicine.
              </p>

              <a
                href={paper.pubmedUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm font-semibold text-[#174a8b] hover:underline"
              >
                Open original record ↗
              </a>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 pt-5">
          <p className="text-xs leading-5 text-slate-500">
            Article metadata is provided by PubMed. Availability
            and completeness of abstract, affiliations, and other
            fields depend on the original record.
          </p>
        </footer>
      </div>
    </main>
  );
};

export default ResearchSearchDetailPage;