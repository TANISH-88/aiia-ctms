import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";

const menuPanels = {
  "About AIIA-CTMS": {
    left: [
      {
        title: "Platform overview",
        description: "One connected platform for all your trial data.",
      },
      {
        title: "Study setup",
        description:
          "Structure and manage your clinical operations in one place.",
      },
      {
        title: "Integration",
        description: "Connect your workflows with secure, flexible tooling.",
      },
    ],
    right: [
      {
        title: "Why teams choose AIIA-CTMS",
        description: "One connected platform for every clinical workflow.",
      },
      {
        title: "Built for study teams",
        description: "Faster setup, better visibility, fewer manual handoffs.",
      },
    ],
    buttonText: "Explore platform",
  },

  "Platform & Solutions": {
    left: [
      {
        title: "EDC",
        description: "Capture clean clinical data from every study site.",
      },
      {
        title: "eCOA / ePRO",
        description:
          "Patient-reported outcomes captured anywhere, on any device.",
      },
      {
        title: "CDMS",
        description: "Manage, clean, and lock your study data faster.",
      },
      {
        title: "eConsent",
        description: "Enroll and consent participants remotely or on site.",
      },
      {
        title: "AI Data Extraction",
        description: "AI extracts source data and a human reviews everything.",
      },
      {
        title: "Data Management",
        description: "Our experts build, clean, and deliver your data.",
      },
    ],
    right: [
      {
        title: "Data Management",
        description: "Our experts build, clean, and deliver your data.",
      },
      {
        title: "eCOA services",
        description:
          "Translations, licensing, and device logistics managed for you",
      },
      {
        title: "Training & Certification",
        description:
          "Training & certification to help teams build studies with confidence",
      },
      {
        title: "Customer support",
        description:
          "Fast, knowledgeable support from real clinical research people",
      },
    ],
    buttonText: "See all services",
    heading: "Services",
  },

  Solutions: {
    left: [
      {
        title: "Industry",
        description: "Built for the way your organization runs research",
      },
      {
        title: "MedTech",
        description: "PMCF and MDR evidence without the heavy lifting",
      },
      {
        title: "BioTech",
        description: "Launch faster with your lean team and budget",
      },
      {
        title: "CRO",
        description: "Win and deliver more studies for your sponsors",
      },
      {
        title: "Academic",
        description:
          "Investigator friendly tools for grant funded clinical research",
      },
      {
        title: "BioPharma",
        description: "Scale global programs without the integration tax",
      },
    ],
    middle: [
      {
        title: "Study type",
        description: "From first-in-human to post-market, one platform",
      },
      {
        title: "Interventional trials",
        description: "Randomized and controlled trials from startup to lock",
      },
      {
        title: "Chart review",
        description:
          "Observational research at scale without extra site burden",
      },
      {
        title: "Patient registries",
        description: "Long term registries that keep every participant engaged",
      },
      {
        title: "Post-market follow-up",
        description:
          "Post-market follow-up studies that satisfy EU MDR requirements",
      },
    ],
    right: [
      {
        title: "Use cases",
        description: "See what teams automate and accelerate with AIIA-CTMS",
      },
      {
        title: "Direct to patient data retrieval",
        description: "Patients share records, AI extracts the source data",
      },
      {
        title: "AI data extraction",
        description:
          "Turn source documents into structured, human reviewed data",
      },
      {
        title: "DCT",
        description:
          "Run decentralized and hybrid trials patients actually finish",
      },
      {
        title: "AIIA Essentials",
        description: "Compliant studies for lean teams, live in weeks",
      },
      {
        title: "RWE",
        description: "Generate real world evidence from routine care data",
      },
    ],
    tertiary: [
      {
        title: "Therapeutic areas",
        description:
          "Deep experience across the therapeutic areas you research",
      },
      {
        title: "Oncology",
        description: "",
      },
      {
        title: "Rare disease",
        description: "",
      },
      {
        title: "Infectious disease",
        description: "",
      },
      {
        title: "Obesity & Metabolic",
        description: "",
      },
      {
        title: "Cardiovascular",
        description: "",
      },
      {
        title: "CNS & Neurology",
        description: "",
      },
    ],
    buttonText: "All therapeutic areas",
    footerText: "See how AIIA-CTMS compares",
  },

  Resources: {
    left: [
      {
        title: "Industry knowledge",
        description: "Learn from the people running modern clinical trials",
      },
      {
        title: "Articles",
        description: "Practical guidance on running modern clinical trials",
      },
      {
        title: "Webinars & on-demand",
        description: "Live sessions and every past recording",
      },
      {
        title: "White papers",
        description: "Deep dives into evidence, methods, and regulation",
      },
      {
        title: "Insight briefs",
        description: "Short reads on regulatory and industry shifts",
      },
    ],
    middle: [
      {
        title: "Platform & services",
        description: "See the AIIA-CTMS platform and services in action",
      },
      {
        title: "Fact sheets",
        description: "Product overviews you can share with your team",
      },
      {
        title: "Demos",
        description: "See the platform in action, on demand",
      },
      {
        title: "Product spotlights",
        description: "Short walkthroughs of specific platform capabilities",
      },
    ],
    right: [
      {
        title: "Case studies",
        description: "Real results from teams running studies on AIIA-CTMS",
      },
      {
        title: "MedTech",
        description: "How device teams meet EU MDR evidence requirements",
      },
      {
        title: "Biotech",
        description: "How emerging biotechs launch their studies in weeks",
      },
      {
        title: "CRO",
        description: "How CROs deliver more studies with lean teams",
      },
    ],
    buttonText: "Browse resources",
  },

  Company: {
    left: [
      {
        title: "About us",
        description: "The team behind AIIA-CTMS",
      },
      {
        title: "News",
        description: "AIIA-CTMS product and company news",
      },
      {
        title: "Careers",
        description: "Join the team changing clinical research",
      },
    ],
    middle: [
      {
        title: "Contact us",
        description: "Talk to our team, wherever you are",
      },
      {
        title: "Team",
        description: "Meet the AIIA-CTMS team",
      },
    ],
    right: [
      {
        title: "Events",
        description: "Meet the AIIA-CTMS team in person",
      },
      {
        title: "In-person events",
        description: "Conferences and industry events",
      },
    ],
    buttonText: "Meet the team",
  },

  Pricing: {
    left: [
      {
        title: "Plan overview",
        description: "Flexible packages for research teams of every size.",
      },
      {
        title: "Use cases",
        description: "See which plan matches your study requirements.",
      },
    ],
    right: [
      {
        title: "Simple pricing",
        description: "Choose the setup that fits your team and study goals.",
      },
      {
        title: "Talk to sales",
        description: "Get a recommendation based on your workflows and scale.",
      },
    ],
    buttonText: "See pricing",
  },
};

const navMenus = [
  {
    label: "About AIIA-CTMS",
    items: [
      {
        title: "Platform overview",
        description: "One connected platform for all your trial data.",
      },
      {
        title: "Study setup",
        description:
          "Structure and manage your clinical operations in one place.",
      },
      {
        title: "Integration",
        description: "Connect your workflows with secure, flexible tooling.",
      },
    ],
  },

  {
    label: "Platform & Solutions",
    items: [
      {
        title: "EDC",
        description: "Capture clean clinical data from every study site.",
      },
      {
        title: "eCOA / ePRO",
        description:
          "Patient-reported outcomes captured anywhere, on any device.",
      },
      {
        title: "CDMS",
        description: "Manage, clean, and lock your study data faster.",
      },
      {
        title: "eConsent",
        description:
          "Patient-reported outcomes captured anywhere, on any device.",
      },
      {
        title: "Catalyst",
        description: "AI extracts source data and a human reviews everything.",
      },
      {
        title: "Data Management",
        description: "Our experts build, clean, and deliver your data.",
      },
    ],
  },

  {
    label: "Solutions",
    items: [
      {
        title: "Clinical strategy",
        description: "Improve outcomes across all study lifecycle stages.",
      },
      {
        title: "Biopharma",
        description: "Run clinical programs with speed and compliance.",
      },
      {
        title: "Medical devices",
        description:
          "Support trials with real-time patient and site visibility.",
      },
      {
        title: "Diagnostics",
        description: "Capture evidence and operational insights in one view.",
      },
    ],
  },

  {
    label: "Resources",
    items: [
      {
        title: "Articles",
        description: "Actionable guidance for research teams and study leads.",
      },
      {
        title: "Webinars",
        description: "Learn from experts and practical case studies.",
      },
      {
        title: "Research library",
        description:
          "Explore best practices, insight briefs, and documentation.",
      },
    ],
  },

  {
    label: "Company",
    items: [
      {
        title: "About us",
        description: "Learn how we support modern clinical science.",
      },
      {
        title: "Careers",
        description: "Join a team building a better clinical experience.",
      },
      {
        title: "Contact",
        description: "Talk with our experts about your next study.",
      },
    ],
  },

  {
    label: "Pricing",
    items: [
      {
        title: "Plan overview",
        description: "Flexible packages for research teams of every size.",
      },
      {
        title: "Use cases",
        description: "See which plan matches your study requirements.",
      },
    ],
  },
  {
    label: "Participate",
    items: [
      {
        title: "Apply",
        description: "Submit your details to participate in a clinical study.",
      },
    ],
  },
];

// How long the dropdown stays open after the cursor leaves both the
// trigger and the panel.
const CLOSE_DELAY_MS = 200;

// Reusable horizontal divider.
const HorizontalLine = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={`h-px w-full bg-slate-300/80 ${className}`}
  />
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // NEW: account dropdown state
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const navigate = useNavigate();

  // NEW: auth
  const { isAuthenticated, logout } = useAuth();

  // Existing menu timer
  const closeTimerRef = useRef(null);

  // NEW: account dropdown ref
  const accountRef = useRef(null);

  const headerRef = useRef(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(
    (label) => {
      clearCloseTimer();
      setActiveMenu(label);
    },
    [clearCloseTimer],
  );

  const scheduleClose = useCallback(() => {
    clearCloseTimer();

    closeTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // NEW: close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleMobileMenuOutsideClick = (event) => {
      if (
        isOpen &&
        headerRef.current &&
        !headerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleMobileMenuOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleMobileMenuOutsideClick);
    };
  }, [isOpen]);

  // NEW: logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsAccountOpen(false);
      setIsOpen(false);
      navigate("/auth/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-[60] overflow-visible border-b transition-all duration-300 ${
          isScrolled || isOpen
            ? "border-slate-200 bg-white"
            : "border-transparent/30 bg-transparent"
        }`}
      >
        <div className="relative mx-auto w-full max-w-[1800px] px-4 sm:px-5 lg:px-6 xl:px-8">
          <nav className="flex min-h-[88px] w-full items-center justify-around gap-3 py-3">
            <div
              className="flex shrink-0 items-center gap-3"
              onClick={() => navigate("/")}
            >
              <span className="whitespace-nowrap text-[1rem] font-medium tracking-[-0.08em] text-black sm:text-[2.5rem]">
                AIIA-CTMS
              </span>
            </div>

            <div className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
              <ul className="flex items-center justify-center gap-1 text-[0.8rem] font-semibold text-black 2xl:gap-3 2xl:text-[0.9rem]">
                {navMenus.map((item) => (
                  <li key={item.label} className="group relative">
                    <div
                      className="relative"
                      onMouseEnter={() => openMenu(item.label)}
                      onMouseLeave={scheduleClose}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          activeMenu === item.label
                            ? scheduleClose()
                            : openMenu(item.label)
                        }
                        className={`navbar-links flex cursor-pointer items-center gap-1 rounded-xl px-3 py-2 transition ${
                          activeMenu === item.label
                            ? "bg-white/60 text-[#0d2f72]"
                            : "hover:bg-white/10 hover:text-[#0d2f72]"
                        }`}
                      >
                        <span>{item.label}</span>

                        {item.label !== "Pricing" && (
                          <svg
                            viewBox="0 0 20 20"
                            className="h-4 w-4 text-current"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              d="M5 7.5 10 12.5 15 7.5"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>

                      {activeMenu === item.label && (
                        <div
                          onMouseEnter={() => openMenu(item.label)}
                          onMouseLeave={scheduleClose}
                          className="fixed left-1/2 top-[88px] z-[200] w-[min(1200px,78vw)] -translate-x-1/2 rounded-[10px] border border-slate-200 bg-white/95 p-6 text-black shadow-[0_30px_80px_rgba(15,63,146,0.12)] backdrop-blur-md"
                        >
                          {item.label === "Participate" ? (
                            <div className="flex flex-col gap-4">
                              <div className="text-[1.5rem] font-medium tracking-[-0.05em] text-black">
                                Participate
                              </div>
                              <HorizontalLine />
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenu(null);
                                  navigate("/apply");
                                }}
                                className="block w-full max-w-md cursor-pointer self-start rounded-[5px] border-0 bg-transparent p-2 text-left text-[#0f3f92] transition hover:text-[#0055d9]"
                              >
                                <div className="inline-block text-[1rem] font-medium text-black underline-offset-4 transition hover:underline">
                                  Apply
                                </div>
                                <div className="mt-1 text-[0.8rem] leading-5 text-slate-500">
                                  Submit your details to participate in a
                                  clinical study.
                                </div>
                              </button>
                            </div>
                          ) : item.label === "Solutions" ? (
                            <>
                              <div className="grid gap-8 md:grid-cols-[1fr_1fr_1fr] md:items-start">
                                <div className="flex min-h-full flex-col">
                                  {(menuPanels[item.label]?.left || []).map(
                                    (entry, index) => (
                                      <div key={entry.title}>
                                        <div className="py-2 first:pt-0">
                                          <div className="subheading-navbar-links inline-block cursor-pointer text-[0.7rem] font-medium underline-offset-4 transition-all duration-200 hover:underline hover:decoration-2 hover:decoration-[#0f3f92] sm:text-[1.2rem]">
                                            {entry.title}
                                          </div>

                                          {entry.description && (
                                            <div className="mt-1 text-[0.7rem] leading-6 text-slate-500">
                                              {entry.description}
                                            </div>
                                          )}
                                        </div>

                                        {index === 0 && (
                                          <HorizontalLine className="my-3" />
                                        )}
                                      </div>
                                    ),
                                  )}
                                </div>

                                <div className="flex min-h-full flex-col">
                                  {(menuPanels[item.label]?.middle || []).map(
                                    (entry, index) => (
                                      <div key={entry.title}>
                                        <div className="py-2 first:pt-0">
                                          <div className="subheading-navbar-links inline-block cursor-pointer text-[0.8rem] font-medium underline-offset-4 transition-all duration-200 hover:underline hover:decoration-2 hover:decoration-[#0f3f92] sm:text-[1.2rem]">
                                            {entry.title}
                                          </div>

                                          {entry.description && (
                                            <div className="mt-1 text-[0.8rem] leading-6 text-slate-500">
                                              {entry.description}
                                            </div>
                                          )}
                                        </div>

                                        {index === 0 && (
                                          <HorizontalLine className="my-3" />
                                        )}
                                      </div>
                                    ),
                                  )}
                                </div>

                                <div className="flex min-h-full flex-col">
                                  {(menuPanels[item.label]?.tertiary || []).map(
                                    (entry, index) => (
                                      <div key={entry.title}>
                                        <div className="py-2 first:pt-0">
                                          <div className="subheading-navbar-links inline-block cursor-pointer text-[0.8rem] font-light underline-offset-4 transition-all duration-200 hover:underline hover:decoration-2 hover:decoration-[#0f3f92] sm:text-[1.2rem]">
                                            {entry.title}
                                          </div>

                                          {entry.description && (
                                            <div className="mt-1 text-[0.8rem] leading-6 text-slate-500">
                                              {entry.description}
                                            </div>
                                          )}
                                        </div>

                                        {index === 0 && (
                                          <HorizontalLine className="my-3" />
                                        )}
                                      </div>
                                    ),
                                  )}

                                  <div className="pt-4">
                                    <button
                                      type="button"
                                      className="cursor-pointer rounded-[5px] bg-[#0b1d40] px-3 py-3 text-[0.8rem] font-bold text-white shadow-md"
                                    >
                                      {menuPanels[item.label]?.buttonText}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 pt-4">
                                <HorizontalLine className="mb-4" />

                                <button
                                  type="button"
                                  className="cursor-pointer text-[1.1rem] font-medium text-[#0f3f92]"
                                >
                                  {menuPanels[item.label]?.footerText}{" "}
                                  <span aria-hidden="true">›</span>
                                </button>
                              </div>
                            </>
                          ) : item.label === "Company" ? (
                            <div className="grid gap-8 md:grid-cols-3 md:items-start">
                              {[
                                menuPanels[item.label]?.left || [],
                                menuPanels[item.label]?.middle || [],
                                menuPanels[item.label]?.right || [],
                              ].map((column, columnIndex) => (
                                <div
                                  key={columnIndex}
                                  className="flex min-h-full flex-col"
                                >
                                  {column.map((entry, index) => (
                                    <div key={entry.title}>
                                      <div className="py-2 first:pt-0">
                                        <div className="inline-block cursor-pointer text-[1rem] font-medium text-black underline-offset-4 transition-all duration-200 hover:underline hover:decoration-2 hover:decoration-[#0f3f92]">
                                          {entry.title}
                                        </div>

                                        {entry.description && (
                                          <div className="mt-1 text-[0.8rem] leading-6 text-slate-500">
                                            {entry.description}
                                          </div>
                                        )}
                                      </div>

                                      {index === 0 && (
                                        <HorizontalLine className="my-3" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          ) : item.label === "Resources" ? (
                            <div className="grid gap-8 md:grid-cols-3 md:items-start">
                              {[
                                menuPanels[item.label]?.left || [],
                                menuPanels[item.label]?.middle || [],
                                menuPanels[item.label]?.right || [],
                              ].map((column, columnIndex) => (
                                <div
                                  key={columnIndex}
                                  className="flex min-h-full flex-col"
                                >
                                  {column.map((entry, index) => (
                                    <div key={entry.title}>
                                      <div className="py-2 first:pt-0">
                                        <div
                                          className={`${
                                            index === 0
                                              ? "text-[1rem] font-medium"
                                              : "text-[1rem] font-medium"
                                          } inline-block cursor-pointer text-black underline-offset-4 transition-all duration-200 hover:underline hover:decoration-2 hover:decoration-[#0f3f92]`}
                                        >
                                          {entry.title}
                                        </div>

                                        {entry.description && (
                                          <div className="mt-1 text-[0.8rem] leading-6 text-slate-500">
                                            {entry.description}
                                          </div>
                                        )}
                                      </div>

                                      {index === 0 && (
                                        <HorizontalLine className="my-3" />
                                      )}
                                    </div>
                                  ))}

                                  {columnIndex === 0 && (
                                    <button
                                      type="button"
                                      className="mt-4 w-fit cursor-pointer text-[1rem] font-medium text-[#22bfa0]"
                                    >
                                      All resources{" "}
                                      <span aria-hidden="true">›</span>
                                    </button>
                                  )}

                                  {columnIndex === 1 && (
                                    <button
                                      type="button"
                                      className="mt-4 w-fit cursor-pointer text-[1rem] font-medium text-[#22bfa0]"
                                    >
                                      All platform & services{" "}
                                      <span aria-hidden="true">›</span>
                                    </button>
                                  )}

                                  {columnIndex === 2 && (
                                    <button
                                      type="button"
                                      className="mt-4 w-fit cursor-pointer text-[1rem] font-medium text-[#22bfa0]"
                                    >
                                      All case studies{" "}
                                      <span aria-hidden="true">›</span>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-start">
                              <div className="flex min-h-full flex-col">
                                <div className="mb-3 flex h-[72px] items-center justify-between gap-3">
                                  <div className="text-[1.5rem] font-medium tracking-[-0.05em] text-black">
                                    {item.label}
                                  </div>

                                  <button
                                    type="button"
                                    className="cursor-pointer rounded-[5px] bg-[#060606] px-3 py-3 text-[0.55rem] font-medium text-white shadow-md"
                                  >
                                    {item.label === "Platform & Services"
                                      ? "Platform overview"
                                      : menuPanels[item.label]?.buttonText ||
                                        "Explore"}
                                  </button>
                                </div>

                                <HorizontalLine className="mb-3" />

                                <div className="grid gap-5 sm:grid-cols-2">
                                  {(menuPanels[item.label]?.left || []).map(
                                    (entry) => (
                                      <div
                                        key={entry.title}
                                        className="flex cursor-pointer items-start gap-3 rounded-[5px] border border-transparent p-2 transition hover:border-[#0055d9] hover:bg-[#e6f2ff]"
                                      >
                                        <div>
                                          <div className="inline-block cursor-pointer text-[1rem] font-medium text-black underline-offset-4 transition-all duration-200 hover:underline hover:decoration-2 hover:decoration-[#0f3f92]">
                                            {entry.title}
                                          </div>

                                          <div className="mt-1 text-[0.8rem] leading-5 text-slate-500">
                                            {entry.description}
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>

                              <div className="flex min-h-full flex-col">
                                <div className="mb-3 flex h-[72px] items-center justify-between gap-3">
                                  <div className="text-[1.5rem] font-medium tracking-[-0.05em] text-black">
                                    {menuPanels[item.label]?.heading}
                                  </div>

                                  {menuPanels[item.label]?.heading && (
                                    <button
                                      type="button"
                                      className="cursor-pointer rounded-[8px] bg-[#0b1d40] px-4 py-3 text-sm font-bold text-white shadow-md"
                                    >
                                      {menuPanels[item.label].buttonText}
                                    </button>
                                  )}
                                </div>

                                <HorizontalLine className="mb-3" />

                                <div className="space-y-4 text-slate-600">
                                  {(menuPanels[item.label]?.right || []).map(
                                    (entry) => (
                                      <button
                                        key={entry.title}
                                        type="button"
                                        className="block w-full cursor-pointer rounded-none border-0 bg-transparent p-0 text-left"
                                      >
                                        <div className="inline-block cursor-pointer text-[1rem] font-medium text-black underline-offset-4 transition-all duration-200 hover:underline hover:decoration-2 hover:decoration-[#0f3f92]">
                                          {entry.title}
                                        </div>

                                        <div className="mt-1 text-[0.8rem] leading-7 text-slate-500">
                                          {entry.description}
                                        </div>
                                      </button>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* DESKTOP AUTH / ACCOUNT */}
            <div className="hidden shrink-0 items-center gap-2 2xl:gap-3 xl:flex">
              {isAuthenticated ? (
                <div ref={accountRef} className="relative">
                  <button
                    type="button"
                    aria-label="Account menu"
                    aria-expanded={isAccountOpen}
                    onClick={() => setIsAccountOpen((value) => !value)}
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#1b5ec7]/30 bg-white/20 text-[#0f3f92] transition hover:bg-white/40"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-7 w-7"
                      aria-hidden="true"
                    >
                      <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12.1597 16C10.1243 16 8.29182 16.8687 7.01276 18.2556C8.38039 19.3474 10.114 20 12 20C13.9695 20 15.7727 19.2883 17.1666 18.1081C15.8956 16.8074 14.1219 16 12.1597 16ZM12 4C7.58172 4 4 7.58172 4 12C4 13.8106 4.6015 15.4807 5.61557 16.8214C7.25639 15.0841 9.58144 14 12.1597 14C14.6441 14 16.8933 15.0066 18.5218 16.6342C19.4526 15.3267 20 13.7273 20 12C20 7.58172 16.4183 4 12 4ZM12 5C14.2091 5 16 6.79086 16 9C16 11.2091 14.2091 13 12 13C9.79086 13 8 11.2091 8 9C8 6.79086 9.79086 5 12 5ZM12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7Z"></path>
                    </svg>
                  </button>

                  {isAccountOpen && (
                    <div className="absolute right-0 top-[52px] z-[300] w-52 rounded-[7px] border border-[#dfe7ef] bg-white p-1.5 text-[#16324f] shadow-[0_14px_32px_rgba(19,52,80,0.14)]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountOpen(false);
                          navigate("/dashboard");
                        }}
                        className="w-full cursor-pointer rounded-[5px] px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[#f4f8fb] hover:text-[#145db5]"
                      >
                        Dashboard
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountOpen(false);
                          navigate("/user/profile");
                        }}
                        className="w-full cursor-pointer rounded-[5px] px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[#f4f8fb] hover:text-[#145db5]"
                      >
                        My Profile
                      </button>

                      <div className="my-1.5 h-px bg-[#dfe7ef]" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full cursor-pointer rounded-[5px] px-3 py-2.5 text-left text-sm font-medium text-[#b4232d] transition hover:bg-[#fff1f2]"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="cursor-pointer rounded-[5px] border border-[#1b5ec7] bg-white/10 px-3 py-1 text-[1.05rem] font-medium text-black shadow-[inset_0_0_0_1px_rgba(27,94,199,0.3)] transition hover:bg-white/20"
                    onClick={() => navigate("/auth/login")}
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/auth/login")}
                    className="cursor-pointer rounded-[5px] bg-[#1d5edb] px-3 py-2 text-[1.05rem] font-semibold text-white shadow-[0_14px_28px_rgba(29,94,219,0.24)] transition hover:bg-[#174ec0]"
                  >
                    Book a demo
                  </button>
                </>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              onClick={() => {
                setIsOpen((value) => !value);
                setActiveMenu(null);
              }}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#1b5ec7]/30 bg-white/20 text-[#0f3f92] shadow-sm xl:hidden"
            >
              {isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </nav>

          {isOpen && (
            <div className="max-h-[calc(100vh-88px)] space-y-2 overflow-y-auto overscroll-contain border-t border-[#1b5ec7]/15 bg-white px-2 py-3 xl:hidden">
              {navMenus.map((item) => (
                <div key={item.label}>
                  <button
                    type="button"
                    aria-expanded={activeMenu === item.label}
                    onClick={() =>
                      setActiveMenu((value) =>
                        value === item.label ? null : item.label,
                      )
                    }
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-3 text-left text-base font-semibold text-[#0f3f92] transition hover:bg-white/40"
                  >
                    <span>{item.label}</span>

                    <svg
                      viewBox="0 0 20 20"
                      className={`h-4 w-4 transition-transform ${activeMenu === item.label ? "rotate-180" : ""}`}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 7.5 10 12.5 15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {activeMenu === item.label && (
                    <div className="space-y-1 border-l border-[#1b5ec7]/20 pb-2 pl-3">
                      {item.items.map((entry) => (
                        <button
                          key={entry.title}
                          type="button"
                          onClick={() => {
                            if (
                              item.label === "Participate" &&
                              entry.title === "Apply"
                            ) {
                              setIsOpen(false);
                              setActiveMenu(null);
                              navigate("/apply");
                            }
                          }}
                          className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left transition hover:bg-white/60"
                        >
                          <span className="block text-sm font-medium text-[#0f3f92] hover:underline">
                            {entry.title}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            {entry.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="grid gap-2 border-t border-[#dfe7ef] pt-3">
                {isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/dashboard");
                      }}
                      className="rounded-[5px] px-4 py-3 text-left text-base font-semibold text-[#16324f] transition hover:bg-[#f4f8fb]"
                    >
                      Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/user/profile");
                      }}
                      className="rounded-[5px] px-4 py-3 text-left text-base font-semibold text-[#16324f] transition hover:bg-[#f4f8fb]"
                    >
                      My Profile
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-[5px] px-4 py-3 text-left text-base font-semibold text-[#b4232d] transition hover:bg-[#fff1f2]"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/auth/login");
                      }}
                      className="rounded-[5px] border border-[#1b5ec7] bg-white px-4 py-3 text-base font-semibold text-[#0f3f92]"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className="rounded-[5px] bg-[#1d5edb] px-4 py-3 text-base font-semibold text-white"
                    >
                      Book a demo
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Navbar;
