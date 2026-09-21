const NCBI_BASE_URL =
  "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

const NCBI_API_KEY = import.meta.env.VITE_NCBI_API_KEY || "";
const NCBI_EMAIL = import.meta.env.VITE_NCBI_EMAIL || "";

const NCBI_TOOL = "AIIA_CTMS_Research_Search";

const getBaseParams = () => {
  const params = new URLSearchParams({
    tool: NCBI_TOOL,
  });

  if (NCBI_API_KEY) {
    params.set("api_key", NCBI_API_KEY);
  }

  if (NCBI_EMAIL) {
    params.set("email", NCBI_EMAIL);
  }

  return params;
};

const fetchNCBI = async (endpoint, params, signal) => {
  const url = `${NCBI_BASE_URL}/${endpoint}.fcgi?${params.toString()}`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(
      `NCBI request failed (${response.status}). Please try again.`
    );
  }

  return response;
};

/* ---------------- SEARCH ---------------- */

export const searchResearchPapers = async (
  query,
  { start = 0, limit = 10, signal } = {}
) => {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    throw new Error("Please enter a research topic.");
  }

  const params = getBaseParams();

  params.set("db", "pubmed");
  params.set("term", trimmedQuery);
  params.set("retmode", "json");
  params.set("retstart", String(start));
  params.set("retmax", String(limit));
  params.set("sort", "relevance");

  const response = await fetchNCBI("esearch", params, signal);
  const data = await response.json();

  const result = data?.esearchresult;

  if (!result) {
    throw new Error("Invalid response received from NCBI.");
  }

  const ids = result.idlist || [];
  const count = Number(result.count || 0);

  if (!ids.length) {
    return { papers: [], count };
  }

  const summaryParams = getBaseParams();

  summaryParams.set("db", "pubmed");
  summaryParams.set("id", ids.join(","));
  summaryParams.set("retmode", "json");

  const summaryResponse = await fetchNCBI(
    "esummary",
    summaryParams,
    signal
  );

  const summaryData = await summaryResponse.json();
  const summaryResult = summaryData?.result;

  if (!summaryResult) {
    throw new Error("Unable to retrieve paper summaries.");
  }

  const papers = ids
    .map((id) => {
      const paper = summaryResult[id];

      if (!paper || paper.error) return null;

      const doiItem = (paper.articleids || []).find(
        (item) => item.idtype === "doi"
      );

      return {
        id,
        title: paper.title || "Untitled research paper",
        authors: (paper.authors || []).map(
          (author) => author.name
        ),
        journal:
          paper.fulljournalname ||
          paper.source ||
          "Journal not available",
        publicationDate: paper.pubdate || "",
        doi: doiItem?.value || "",
        pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      };
    })
    .filter(Boolean);

  return { papers, count };
};

/* ---------------- DETAIL ---------------- */

const getText = (parent, selector) => {
  return parent.querySelector(selector)?.textContent?.trim() || "";
};

const getAllText = (parent, selector) => {
  return Array.from(parent.querySelectorAll(selector))
    .map((node) => node.textContent.trim())
    .filter(Boolean);
};

const getAuthorName = (author) => {
  const collectiveName = getText(author, "CollectiveName");

  if (collectiveName) return collectiveName;

  const lastName = getText(author, "LastName");
  const foreName = getText(author, "ForeName");
  const initials = getText(author, "Initials");

  const name = [foreName || initials, lastName]
    .filter(Boolean)
    .join(" ");

  return name || "Author name unavailable";
};

const parseAbstract = (article) => {
  const abstractNodes = Array.from(
    article.querySelectorAll("Abstract > AbstractText")
  );

  return abstractNodes.map((node) => ({
    label: node.getAttribute("Label") || "",
    text: node.textContent.trim(),
  })).filter((item) => item.text);
};

const parseArticle = (article) => {
  const medline = article.querySelector("MedlineCitation");
  const articleNode = article.querySelector("Article");

  if (!medline || !articleNode) {
    throw new Error("The PubMed record could not be parsed.");
  }

  const pmid = getText(medline, "PMID");

  const authorNodes = Array.from(
    articleNode.querySelectorAll("AuthorList > Author")
  );

  const authors = authorNodes.map((author) => ({
    name: getAuthorName(author),
    affiliations: getAllText(author, "AffiliationInfo > Affiliation"),
  }));

  const journal = getText(articleNode, "Journal > Title");
  const journalISO = getText(articleNode, "Journal > ISOAbbreviation");

  const publicationDate =
    getText(articleNode, "Journal > JournalIssue > PubDate > MedlineDate") ||
    [
      getText(articleNode, "Journal > JournalIssue > PubDate > Year"),
      getText(articleNode, "Journal > JournalIssue > PubDate > Month"),
      getText(articleNode, "Journal > JournalIssue > PubDate > Day"),
    ]
      .filter(Boolean)
      .join(" ");

  const articleIds = Array.from(
    article.querySelectorAll("PubmedData > ArticleIdList > ArticleId")
  );

  const doi = articleIds.find(
    (node) => node.getAttribute("IdType") === "doi"
  )?.textContent?.trim() || "";

  const keywords = getAllText(medline, "KeywordList > Keyword");

  const meshTerms = Array.from(
    medline.querySelectorAll("MeshHeading")
  ).map((mesh) => {
    const descriptor = getText(mesh, "DescriptorName");

    const qualifiers = getAllText(mesh, "QualifierName");

    return {
      descriptor,
      qualifiers,
    };
  }).filter((item) => item.descriptor);

  const publicationTypes = getAllText(
    articleNode,
    "PublicationTypeList > PublicationType"
  );

  const abstract = parseAbstract(articleNode);

  const articleTitle =
    getText(articleNode, "ArticleTitle") ||
    "Untitled research paper";

  const language = getAllText(articleNode, "Language");

  const volume = getText(
    articleNode,
    "Journal > JournalIssue > Volume"
  );

  const issue = getText(
    articleNode,
    "Journal > JournalIssue > Issue"
  );

  const pages = getText(articleNode, "Pagination > MedlinePgn");

  const elocationId = getText(articleNode, "ELocationID");

  const affiliationSet = new Set(
    authors.flatMap((author) => author.affiliations)
  );

  return {
    id: pmid,
    title: articleTitle,
    authors,
    journal,
    journalISO,
    publicationDate,
    volume,
    issue,
    pages,
    elocationId,
    doi,
    abstract,
    keywords,
    meshTerms,
    publicationTypes,
    language,
    affiliations: [...affiliationSet],
    pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
  };
};

export const fetchResearchPaperDetail = async (
  pmid,
  { signal } = {}
) => {
  if (!pmid || !/^\d+$/.test(String(pmid))) {
    throw new Error("Invalid PubMed ID.");
  }

  const params = getBaseParams();

  params.set("db", "pubmed");
  params.set("id", String(pmid));
  params.set("retmode", "xml");

  const response = await fetchNCBI("efetch", params, signal);
  const xmlText = await response.text();

  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");

  if (xml.querySelector("parsererror")) {
    throw new Error("Unable to read the PubMed record.");
  }

  const article = xml.querySelector("PubmedArticle");

  if (!article) {
    throw new Error("No PubMed record was found for this ID.");
  }

  return parseArticle(article);
};