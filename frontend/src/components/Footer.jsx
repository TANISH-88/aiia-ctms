const footerColumns = [
  {
    title: "Products & Services",
    links: [
      "Electronic Data Capture (EDC)",
      "Clinical Data Management",
      "System (CDMS)",
      "Electronic Clinical Outcome Assessments (eCOA)",
      "eConsent",
      "Decentralized Clinical Trials (DCT)",
      "AI Data Extraction",
      "Real-World Evidence",
      "Data Management",
      "Professional Services",
    ],
  },
  {
    title: "Industries",
    links: [
      "Biotech",
      "Medical Device & Diagnostics",
      "Biopharma",
      "Contract Research Organizations",
      "Academic Research",
      "Therapeutic Areas",
      "Overview",
      "Oncology",
      "Rare Disease",
      "Obesity & Metabolic Cardiovascular",
    ],
  },
  {
    title: "AIIA Resources",
    links: [
      "Comparisons & Competition",
      "EDC Software Comparison",
      "eCOA Software Comparison",
      "eConsent Software Comparison",
      "RWE Platform Comparison",
      "EDC Platform Comparison",
      "Success Stories",
      "Competitor pages",
      "Resources",
      "Articles",
      "Training & Certification",
    ],
  },
  {
    title: "Company",
    links: [
      "About Us",
      "Clinical Research Excellence",
      "AI in Clinical Trials",
      "Careers",
      "News",
      "Contact Support",
      "Contact Us",
      "Legal & Compliance",
      "Terms of Use",
      "Privacy & Cookie Statement",
      "Patient Privacy Statement",
      "Patient Terms of Service",
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-[#edf4fb] px-6 pb-10 pt-8 text-[#0d2f72]">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="max-w-[520px] text-2xl font-medium leading-tight tracking-[-0.04em] text-black">
            Stay up to date with the{" "}
            <span className="text-[#4b5ae1]">latest</span>
            <span className="block">from AIIA-CTMS!</span>
          </h3>

          <div className="grid w-full max-w-[600px] gap-4 md:grid-cols-2">
            <label className="flex items-center rounded-[5px] border border-[#bfd1ee] bg-white px-4 py-3 shadow-[0_0_0_1px_rgba(13,47,114,0.04)]">
              <input
                type="text"
                placeholder="Name *"
                className="w-full border-0 bg-transparent text-base text-[#0d2f72] placeholder:text-[#6078a8] focus:outline-none"
              />
            </label>

            <label className="flex items-center rounded-[5px] border border-[#bfd1ee] bg-white px-4 py-3 shadow-[0_0_0_1px_rgba(13,47,114,0.04)]">
              <input
                type="email"
                placeholder="Email *"
                className="w-full border-0 bg-transparent text-base text-[#0d2f72] placeholder:text-[#6078a8] focus:outline-none"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-8 border-t border-[#d6e4f7] pt-10 md:grid-cols-2 xl:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title} className="min-w-0">
              <h4 className="mb-5 text-[1rem] font-semibold text-black">
                {column.title}
              </h4>

              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="cursor-pointer text-[0.9rem] leading-relaxed text-[#203c66] transition duration-200 hover:text-[#0d2f72] hover:underline hover:decoration-2 hover:underline-offset-4"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
