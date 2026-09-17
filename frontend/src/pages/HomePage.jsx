import Card from "../components/Card";
import { useNavigate } from "react-router-dom";
const featureData = [
  {
    title: "Study Management & KPIs",
    icon: "shield",
    accentClass: "bg-[#dff5f0] text-[#0d2f72]",
    description:
      "Track studies, sites, participants, visits, enrollment progress, and key performance indicators through a centralized dashboard.",
  },
  {
    title: "Pharmacovigilance & Safety",
    icon: "chat",
    accentClass: "bg-[#f3e4ff] text-[#0d2f72]",
    description:
      "Record Adverse Events and Serious Adverse Events, monitor reporting deadlines, and support the Coordinator–Ethics Committee review workflow.",
  },
  {
    title: "Role-Based Collaboration",
    icon: "people",
    accentClass: "bg-[#dffaf2] text-[#0d2f72]",
    description:
      "Provide tailored access for Investigators, Coordinators, Ethics Committees, Monitors, Pharmacovigilance teams, and Administrators.",
  },
  {
    title: "Interoperability & Data Standards",
    icon: "globe",
    accentClass: "bg-[#fce6ef] text-[#0d2f72]",
    description:
      "Demonstrate FHIR R4 bundles, CTRI tracking, ABDM linkage placeholders, and SDTM DM/AE exports using real study data.",
  },
];

const whyAiiaCitmsData = [
  {
    question: "Centralized Clinical Trial Management",
    answer:
      "Manage studies, research sites, participants, visits, and study progress through one cloud-based dashboard.",
  },
  {
    question: "Role-Based Access & Accountability",
    answer:
      "Dedicated access for Investigators, Coordinators, Ethics Committees, Monitors, Pharmacovigilance teams, and Administrators, supported by audit logging.",
  },
  {
    question: "Pharmacovigilance & Safety Monitoring",
    answer:
      "Record Adverse Events and Serious Adverse Events, track reporting deadlines, and support the review workflow between Coordinators and Ethics Committees.",
  },
  {
    question: "Standards-Ready Interoperability",
    answer:
      "Demonstrate FHIR R4 Bundle viewing, CTRI status, ABDM linkage placeholders, and SDTM DM/AE dataset exports using real application data.",
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <main className="w-full h-full">
      {/* Hero Section */}
      <div className="hero-page relative -mt-[89px] min-h-screen w-full overflow-hidden bg-white">
        <div className="absolute inset-0">
          <video
            src="/video2.mp4"
            alt="AIIA-CTMS"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-8 px-4 pt-24 text-center text-content sm:gap-10 lg:items-start lg:justify-center lg:px-6 lg:pl-30 lg:pt-0 lg:text-left">
          <div className="heading flex w-full items-center justify-center lg:justify-start">
            <h1 className="left-contents flex max-w-3xl items-center justify-center text-3xl font-semibold leading-tight text-black sm:text-4xl md:text-5xl lg:justify-start lg:text-5xl">
              One dashboard for every Ayurveda clinical trial at AIIA
            </h1>
          </div>
          <div className="para flex w-full justify-center lg:justify-start">
            <p className="w-full max-w-[34rem] text-base leading-6 text-black font-medium sm:text-lg sm:leading-7 md:text-2xl md:leading-8 lg:w-1/2 lg:text-left">
              Real-time study tracking, automatic AE/SAE safety deadlines,
              role-based access for every stakeholder, and a tamper-proof audit
              trail — built for GCP-ASU, CTRI, and NDCT Rules 2019 compliance.
            </p>
          </div>
          <div className="button flex w-full items-center justify-center gap-5 lg:justify-start">
            <button
              className="cursor-pointer rounded-[5px] bg-blue-500 lg:px-4 lg:py-2 px-5 py-3 font-bold text-white hover:bg-blue-700"
              onClick={() => {
                navigate("/apply");
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* second page */}
      <div className="second-page flex min-h-screen w-full flex-col items-center justify-center gap-8 px-4 py-12 sm:gap-10 sm:px-6 lg:flex-row lg:gap-[50px] lg:px-0 lg:py-0">
        <div className="left flex w-full items-center justify-center lg:w-1/2">
          <img
            src="/second_page.jpeg"
            alt="AIIA-CTMS"
            className="w-full max-w-[520px] rounded-[5px] object-cover lg:w-[70%]"
          />
        </div>
        <div className="right flex w-full max-w-2xl flex-col gap-6 px-2 sm:gap-8 sm:px-4 lg:mr-[20px] lg:w-[40%] lg:max-w-none lg:gap-[30px] lg:p-15">
          <h1 className="text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
            One dashboard. Every trial. Full compliance.
          </h1>
          <p className="text-base leading-7 sm:text-lg md:text-xl lg:leading-normal">
            AIIA-CTMS gives every study a single, real-time home — from ethics
            approval through AE/SAE reporting to close-out. Role-based access
            keeps Investigators, Coordinators, Ethics Committee and
            Pharmacovigilance teams each seeing exactly what they need, with
            every action logged in an immutable audit trail. Built to align with
            CTRI, GCP-ASU and CDISC/FHIR data standards, so your research stays
            inspection-ready from day one.
          </p>
          <button className="w-fit cursor-pointer rounded-[5px] bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
            <span className="text-sm lg:text-md">Learn More about Us</span>
          </button>
        </div>
      </div>
      {/* second page */}
      <div className="second-page mt-6 flex w-full flex-col items-center justify-center px-4 pb-20 sm:px-6">
        <div className="up-block flex w-full max-w-[1200px] flex-col items-center justify-between gap-8">
          <div className="left-block w-full text-center text-xl font-medium leading-tight text-black sm:text-2xl lg:text-[1.5rem]">
            One platform to manage studies, safety, compliance, and research
            data.
          </div>
        </div>

        <div className="cards-block mt-10 grid w-full max-w-[1200px] grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featureData.map((card) => (
            <Card
              key={card.title}
              title={card.title}
              description={card.description}
              icon={card.icon}
              accentClass={card.accentClass}
            />
          ))}
        </div>

        <div className="mt-12 w-full max-w-[1000px] text-center">
          <p className="text-base font-medium leading-relaxed text-[#0d2f72] sm:text-lg lg:text-xl">
            From study tracking to safety reporting — AIIA-CTMS brings clinical
            research into one accountable platform.
          </p>
        </div>
      </div>
     

      {/* third page */}
      <div className="third-page mt-6 flex min-h-0 w-full flex-col items-center justify-center gap-8 bg-[#f4f8fe]/40 px-4 py-8 sm:gap-10 sm:px-6 lg:min-h-screen lg:gap-[50px] lg:p-10">
        <div className="up flex h-auto w-full flex-col items-center justify-center gap-8 lg:h-[80%] lg:flex-row lg:gap-[50px]">
          <div className="left h-auto w-full lg:h-full lg:w-1/2">
            <div className="flex h-full flex-col items-start justify-center gap-6 sm:gap-8 lg:items-end lg:pl-8 lg:pr-4">
              <div className="heading flex w-full items-center justify-start gap-4 lg:w-3/4">
                <h1 className="text-2xl font-bold leading-tight text-black sm:text-3xl lg:text-4xl">
                  Why AIIA-CTMS?
                </h1>
              </div>

              <div className="w-full space-y-5 sm:space-y-8 lg:w-3/4">
                {whyAiiaCitmsData.map((item) => (
                  <div key={item.question} className="flex items-start gap-4">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d9f5ee] text-[#12a57b]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                      >
                        <path
                          d="M6.5 12.5L10 16L17.5 8.5"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <div className="space-y-2">
                      <h2 className="text-base font-semibold leading-snug text-black sm:text-lg lg:text-base">
                        {item.question}
                      </h2>
                      <p className="text-sm leading-relaxed text-[#112d52]/80 sm:text-base lg:text-sm">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="right h-auto w-full lg:h-full lg:w-1/2">
            <div className="image flex h-full w-full items-center justify-center lg:justify-start">
              <img
                src="/fourth_page.jpeg"
                className="h-auto w-full max-w-[520px] lg:w-[80%]"
                alt="AIIA-CTMS"
              />
            </div>
          </div>
        </div>
      </div>

      {/* fourth page */}
      <div className="fourth-page relative mt-6 flex min-h-[600px] w-full flex-col items-center justify-center gap-[10px] overflow-hidden bg-[#f4f8fe]/40 lg:min-h-screen">
        <div className="image absolute inset-0">
          <img
            src="/fifth_page.jpeg"
            className="w-full h-full object-cover"
            alt="AIIA-CTMS"
          />
        </div>

        <div className="card relative z-10 flex h-auto min-h-[600px] w-full items-center">
          <div className="left flex h-auto w-full items-center justify-center lg:h-full lg:w-1/2 lg:justify-end">
            <div className="cards flex h-auto w-[calc(100%-2rem)] max-w-[520px] flex-col items-start gap-5 rounded-[15px] border border-[#4b5ae1] bg-white/95 px-5 py-5 shadow-lg sm:gap-7 sm:px-8 lg:h-[55%] lg:w-[55%]">
              <h3 className="text-sm text-[#212d9c] sm:text-base">
                Feature resource
              </h3>
              <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">
                Real-time AE/SAE deadline tracking
              </h1>
              <p className="text-sm leading-6 text-slate-600 sm:text-base sm:leading-normal">
                Built for AIIA's regulatory reporting requirements — the system
                automatically flags an adverse event report the moment it
                approaches its 24-hour or 15-day deadline, so nothing slips past
                compliance.
              </p>
              <button className="cursor-pointer rounded-md bg-[#4b5ae1] px-4 py-2 text-sm text-white hover:bg-[#3a49c5]">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* fifth page */}
      <div className="fifth-page flex min-h-0 w-full items-center justify-center">
        <div
          className="page relative flex min-h-[420px] w-full items-center justify-center overflow-hidden  px-4 py-10 sm:px-6 lg:h-[70vh] lg:min-h-0 lg:px-10"
          style={{
            backgroundImage: "url('/sixth_page.jpeg')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          {/* Optional overlay for better text readability */}
          <div className="absolute inset-0 bg-[#0E3581]/70"></div>

          <div className="second-block relative z-10 flex h-full w-full max-w-4xl flex-col items-center justify-center gap-6 text-center text-white sm:gap-8 lg:gap-[10px]">
            <h1 className="max-w-3xl text-lg font-semibold leading-tight sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl">
              Real-time KPIs, role-based access, and audit-ready reporting —
              built for AIIA's clinical research.
            </h1>

            <button
              className="cursor-pointer rounded-md border border-[#DEFFF5] bg-[#DEFFF5] px-6 py-3 text-[#0E3581] transition-colors duration-200 hover:bg-[#0E3581] hover:text-[#DEFFF5] sm:mt-6 sm:px-12 sm:py-3 lg:mt-10 lg:px-20"
              onClick={() => {
                navigate("/dashboard");
              }}
            >
              <span className="text-sm font-semibold sm:text-base lg:text-lg">
                View the Dashboard
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
