const researchPapers = [
  {
    name: "A Randomized Trial of Intensive versus Standard Blood-Pressure Control",
    researcher: "Wright JT Jr, et al.",
    date: "2015-11-26",
    link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4689591/",
  },
  {
    name: "Dexamethasone in Hospitalized Patients with Covid-19",
    researcher: "The RECOVERY Collaborative Group",
    date: "2021-02-25",
    link: "https://europepmc.org/articles/PMC7383595?pdf=render",
  },
  {
    name: "Remdesivir for the Treatment of Covid-19",
    researcher: "Beigel JH, et al.",
    date: "2020-11-05",
    link: "https://europepmc.org/articles/PMC7262788?pdf=render",
  },
  {
    name: "Once-Weekly Semaglutide in Adults with Overweight or Obesity",
    researcher: "Wilding JPH, et al.",
    date: "2021-03-18",
    link: "https://europepmc.org/articles/PMC8089287?pdf=render",
  },
  {
    name: "Aspirin in the Primary Prevention of Cardiovascular Disease",
    researcher: "Arnett DK, et al.",
    date: "2019-03-17",
    link: "https://europepmc.org/article/MED/30879355",
  },
  {
    name: "The Effect of Intensive Treatment of Diabetes on the Development and Progression of Long-Term Complications",
    researcher: "UK Prospective Diabetes Study Group",
    date: "1998-09-12",
    link: "https://europepmc.org/article/MED/9742976",
  },
  {
    name: "A Trial of E-Cigarettes versus Nicotine-Replacement Therapy",
    researcher: "Hajek P, et al.",
    date: "2019-02-14",
    link: "https://europepmc.org/article/MED/30699054",
  },
  {
    name: "Early High-Dose Vitamin D3 for Critically Ill, Vitamin D-Deficient Patients",
    researcher: "National Heart, Lung, and Blood Institute PETAL Network",
    date: "2019-03-28",
    link: "https://europepmc.org/articles/PMC7306117?pdf=render",
  },
  {
    name: "Nivolumab plus Ipilimumab in Advanced Melanoma",
    researcher: "Larkin J, et al.",
    date: "2015-07-02",
    link: "https://europepmc.org/article/MED/26027431",
  },
  {
    name: "Efficacy and Safety of the mRNA-1273 SARS-CoV-2 Vaccine",
    researcher: "Baden LR, et al.",
    date: "2021-02-04",
    link: "https://europepmc.org/article/MED/33378609",
  },
];

export default function Study() {
  return (
    <div className="min-h-screen bg-[#f6f8fc] px-5 py-8 text-[#16233b] sm:px-8 lg:px-10">
      <div className="w-full">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">
            AIIA-CTMS
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">
            Study
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Research papers and clinical evidence library.
          </p>
        </div>
        <div className="mt-8 overflow-hidden rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-[#fbfcfe]">
                <tr className="border-b border-slate-200">
                  <th className="w-16 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    No.
                  </th>
                  <th className="min-w-[320px] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Paper name
                  </th>
                  <th className="min-w-[190px] px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Researcher
                  </th>
                  <th className="w-32 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                  <th className="w-32 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Paper
                  </th>
                </tr>
              </thead>
              <tbody>
                {researchPapers.map((paper, index) => (
                  <tr
                    key={paper.name}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-5 text-sm font-medium text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-5 py-5 text-sm font-medium leading-6 text-[#17243b]">
                      {paper.name}
                    </td>
                    <td className="px-5 py-5 text-sm text-slate-600">
                      {paper.researcher}
                    </td>
                    <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-500">
                      {paper.date}
                    </td>
                    <td className="px-5 py-5">
                      <a
                        href={paper.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#2d8b62] underline decoration-[#b9dcca] underline-offset-4 transition hover:text-[#216b4b]"
                        aria-label={`Open ${paper.name}`}
                      >
                        View paper
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-slate-100 px-5 py-4 text-xs text-slate-400">
            Articles sourced from Europe PMC. Links open the public article
            record or PDF view.
          </p>
        </div>
      </div>
    </div>
  );
}
