import { useState } from "react";
import Card from "../components/Card";

const featureData = {
  solution: [
    {
      title: "EDC",
      icon: "shield",
      accentClass: "bg-[#dff5f0] text-[#0d2f72]",
      description:
        "Maximize productivity by capturing, processing, and integrating data from multiple sources and vendors on a compliant electronic data capture (EDC) system.",
    },
    {
      title: "eCOA/ePRO",
      icon: "chat",
      accentClass: "bg-[#f3e4ff] text-[#0d2f72]",
      description:
        "Say goodbye to paper surveys. Capture and manage patient data on a centralized, electronic clinical data platform.",
    },
    {
      title: "eConsent",
      icon: "people",
      accentClass: "bg-[#dffaf2] text-[#0d2f72]",
      description:
        "Create effortless experiences for patients with an all-in-one solution to remotely recruit, screen and enroll patients from the comfort of their home.",
    },
    {
      title: "AI Data Extraction",
      icon: "globe",
      accentClass: "bg-[#fce6ef] text-[#0d2f72]",
      description:
        "AIIA-CTMS uses AI to turn source documents and EHR data into structured, audit-ready records in your EDC. A human reviewer confirms every result before it's committed.",
    },
  ],
  industry: [
    {
      title: "Medical Device & Diagnostics",
      icon: "lab",
      accentClass: "bg-[#dff5f0] text-[#0d2f72]",
      description:
        "Manage data for your entire medical device and diagnostics development lifecycle and reduce time-to-market.",
    },
    {
      title: "Biotech & Pharma",
      icon: "microscope",
      accentClass: "bg-[#f3e4ff] text-[#0d2f72]",
      description:
        "Efficiently build and deploy clinical trials that leverage data from any source on our self-service platform.",
    },
    {
      title: "Contract Research Organizations (CROs)",
      icon: "document",
      accentClass: "bg-[#dffaf2] text-[#0d2f72]",
      description:
        "Deliver the traditional clinical trial approaches of today while offering a pathway to successfully manage hybrid and decentralized trials in the future.",
    },
    {
      title: "Academic Research",
      icon: "cap",
      accentClass: "bg-[#fce6ef] text-[#0d2f72]",
      description:
        "Join thousands of researchers using AIIA-CTMS's user-friendly and powerful platform for their studies.",
    },
  ],
};

const whyAiiaCitmsData = [
  {
    question: "Our core technologies power your research",
    answer:
      "Unlock the full potential of your studies with AIIA-CTMS's powerful yet intuitive core technologies (EDC, eCOA/ePRO, eConsent, and AI data extraction).",
  },
  {
    question: "Not Just Software, A Full-Service Partner",
    answer:
      "From cutting-edge technology to expert consultancy, AIIA-CTMS empowers biopharma, CROs, and medical device companies to navigate trial complexities, drive efficiency, and deliver results.",
  },
  {
    question: "Proven outcomes at scale",
    answer:
      "19,000+ studies, 900+ customers and top ratings on Capterra (4.7/5) and G2 (4.6/5) across 330+ reviews.",
  },
  {
    question: "AI data extraction, built in",
    answer:
      "With AI data extraction, AIIA-CTMS reads source documents and proposes structured eCRF values, accepted by a human before they enter the record.",
  },
];

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("solution");
  const cards = featureData[activeTab];

  return (
    <main className="w-full h-full">
      {/* Hero Section */}
      <div className="hero-page relative -mt-[89px] min-h-screen w-full overflow-hidden bg-white">
        <div className="absolute inset-0">
          <video
            src="/video2.mp4"
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
            <h1 className="left-contents flex max-w-3xl items-center justify-center text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl lg:justify-start lg:text-5xl">
              The AI-native clinical trial platform
            </h1>
          </div>
          <div className="para flex w-full justify-center lg:justify-start">
            <p className="w-full max-w-[34rem] text-base leading-6 text-white sm:text-lg sm:leading-7 md:text-2xl md:leading-8 lg:w-1/2 lg:text-left">
              EDC, eCOA, eConsent, and data management in one platform. AI
              extracts your source data. A human approves every value.
            </p>
          </div>
          <div className="button flex w-full items-center justify-center gap-5 lg:justify-start">
            <button className="cursor-pointer rounded-[5px] bg-blue-500 lg:px-4 lg:py-2 px-5 py-3 font-bold text-white hover:bg-blue-700">
              Book a demo
            </button>
          </div>
        </div>
      </div>

      {/* second page */}
      <div className="second-page flex min-h-screen w-full flex-col items-center justify-center gap-8 px-4 py-12 sm:gap-10 sm:px-6 lg:flex-row lg:gap-[50px] lg:px-0 lg:py-0">
        <div className="left flex w-full items-center justify-center lg:w-1/2">
          <img
            src="/second_page.png"
            alt=""
            className="w-full max-w-[520px] rounded-[5px] object-cover lg:w-[70%]"
          />
        </div>
        <div className="right flex w-full max-w-2xl flex-col gap-6 px-2 sm:gap-8 sm:px-4 lg:mr-[20px] lg:w-[40%] lg:max-w-none lg:gap-[30px] lg:p-15">
          <h1 className="text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
            Smarter Research. Real-World Impact.
          </h1>
          <p className="text-base leading-7 sm:text-lg md:text-xl lg:leading-normal">
            From clinical trials to real-world evidence studies, AIIA-CTMS delivers
            the tools you need to simplify workflows and accelerate
            breakthroughs. Build, manage, and adapt your research effortlessly
            with our powerful, scalable platform designed for the future of
            clinical science.
          </p>
          <button className="w-fit cursor-pointer rounded-[5px] bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
            <span className="text-sm lg:text-md">Learn More about Us</span>
          </button>
        </div>
      </div>
      {/* third page */}
      <div className="third-page mt-6 flex w-full flex-col items-center justify-center px-6 pb-20">
        <div className="up-block flex lg:flex-row flex-col w-full max-w-[1200px] items-center justify-between gap-8">
          <div className="left-block lg:w-[60%] w-full lg:text-[1.5rem] text-2xl font-medium leading-tight text-black lg:text-start text-center">
            Every trial is different. See how
            <span className="block">AIIA-CTMS can help you</span>
          </div>

          <div className="right-block-slider lg:w-[40%] w-full flex items-center gap-2 rounded-[5px] bg-[#eaf1fa] p-2 shadow-[inset_0_0_0_1px_rgba(13,47,114,0.1)]">
            <button
              type="button"
              onClick={() => setActiveTab("solution")}
              className={`cursor-pointer rounded-[5px] w-1/2 px-3 py-3 text-base font-medium transition ${
                activeTab === "solution"
                  ? "bg-white text-[#0d2f72] shadow-[0_1px_2px_rgba(13,47,114,0.1)]"
                  : "text-[#0d2f72]/75"
              }`}
            >
              By solution
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("industry")}
              className={`cursor-pointer rounded-[5px] w-1/2 px-3 py-3 text-base font-medium transition ${
                activeTab === "industry"
                  ? "bg-white text-[#0d2f72]  shadow-[0_1px_2px_rgba(13,47,114,0.1)]"
                  : "text-[#0d2f72]/75"
              }`}
            >
              By industry
            </button>
          </div>
        </div>

        <div className="cards-block mt-10 grid w-full max-w-[1200px] grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Card
              key={card.title}
              title={card.title}
              description={card.description}
              icon={card.icon}
              accentClass={card.accentClass}
            />
          ))}
        </div>
      </div>
      {/* fourth-page */}
      <div className="fourth-page mt-6 flex min-h-0 w-full flex-col items-center justify-center gap-6 bg-[#f4f8fe]/40 px-4 py-8 lg:min-h-screen lg:gap-[10px] lg:px-0 lg:py-2">
        <div className="up flex h-auto w-full flex-col items-center justify-center gap-4 text-center sm:gap-5 lg:h-[20%] lg:gap-[30px]">
          <h1 className="text-2xl font-semibold leading-tight text-black sm:text-3xl lg:text-[2.5rem]">
            AI extracts your source data. A human reviewer approves every value.
          </h1>
          <p className="text-sm leading-6 sm:text-base">
            Against a 6.6% error rate in manual abstraction. Source in, clean
            data out.
          </p>
        </div>
        <div className="down flex h-auto w-full flex-col items-center justify-center gap-6 lg:h-[60vh] lg:flex-row lg:p-10">
          <div className="left flex h-auto w-full flex-col items-center justify-end gap-4 px-2 py-0 sm:gap-5 lg:h-full lg:w-1/2 lg:gap-[20px] lg:px-10 lg:py-3">
            <div className="up flex min-h-[90px] w-full max-w-[300px] flex-col items-center justify-center gap-3 rounded-[15px] border border-black border-[#0d2f72]/20 p-4 shadow-sm sm:min-h-[110px] lg:h-[calc(50%-10px)] lg:w-[70%] lg:max-w-none lg:gap-[30px] lg:p-5">
              <h1 className="text-2xl font-semibold lg:text-2xl">99.8%</h1>
              <p className="text-center text-base font-light sm:text-lg">
                Submission success rate
              </p>
            </div>
            <div className="down flex min-h-[90px] w-full max-w-[300px] flex-col items-center justify-center gap-3 rounded-[15px] border border-black border-[#0d2f72]/20 p-4 shadow-sm sm:min-h-[110px] lg:h-[calc(50%-10px)] lg:w-[70%] lg:max-w-none lg:gap-[30px] lg:p-5">
              <h1 className="text-2xl font-semibold lg:text-2xl">0.8%</h1>
              <p className="text-center text-base font-light sm:text-lg">
                Values changed by the reviewer
              </p>
            </div>
          </div>
          <div className="right flex h-auto w-full items-center justify-center p-0 lg:h-full lg:w-1/2 lg:justify-start">
            <img src="/fourth_page.gif" className="h-auto w-full max-w-[520px] object-contain lg:h-full lg:w-[60%]" />
          </div>
        </div>
        <div className="button flex h-auto w-full items-center justify-center py-2 lg:h-[15vh]">
          <button className="bg-[#1158e5]  text-white px-6 py-3 rounded-[5px] font-medium hover:bg-[#0d2f72]/80 cursor-pointer">
            See how it works
          </button>
        </div>
      </div>
      {/* fifth page */}
      <div className="fifth-page mt-6 flex min-h-0 w-full flex-col items-center justify-center gap-8 bg-[#f4f8fe]/40 px-4 py-8 sm:gap-10 sm:px-6 lg:min-h-screen lg:gap-[50px] lg:p-10">
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
                src="../../public/fifth_page.gif"
                className="h-auto w-full max-w-[520px] lg:w-[80%]"
                alt=""
              />
            </div>
          </div>
        </div>
        <div className="down flex h-auto w-full flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:h-[20%]">
          <button className="w-full max-w-xs rounded-md bg-[#1f67e2] px-4 py-2 text-sm text-white hover:bg-[#071274] sm:w-auto">
            See Why Teams Choose US
          </button>
          <button className="w-full max-w-xs rounded-md bg-[#1f67e2] px-4 py-2 text-sm text-white hover:bg-[#16086f] sm:w-auto">
            Explore AI Features
          </button>
        </div>
      </div>
      {/* sixth page */}
      <div className="sixth-page mt-6 flex min-h-0 w-full items-center bg-[#9893932e] px-4 py-10 sm:px-6 sm:py-12 lg:min-h-screen">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-center gap-8 sm:gap-10 md:flex-row md:items-center md:justify-center">
          <div className="flex w-full max-w-[300px] flex-col items-center justify-center rounded-[5px] bg-[#4b5ae1] px-5 py-6 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] sm:px-6 sm:py-8 md:min-h-[330px]">
            <div className="text-5xl font-semibold leading-none sm:text-[4rem]">#1</div>
            <div className="mt-2 text-2xl font-semibold sm:text-[1.7rem]">Ranked EDC</div>
            <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f9f9f9] text-2xl text-white sm:mt-8 sm:h-20 sm:w-20 sm:text-[2.2rem]">
              ★
            </div>
          </div>

          <div className="grid w-full max-w-[760px] grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-semibold leading-none text-black sm:text-[2.8rem]">
                223K<span className="text-[#4b5ae1]">+</span>
              </div>
              <div className="mt-2 text-base font-medium text-black/90 sm:text-[1.2rem]">
                Happy Users
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-semibold leading-none text-black sm:text-[2.8rem]">
                17K<span className="text-[#4b5ae1]">+</span>
              </div>
              <div className="mt-2 text-base font-medium text-black/90 sm:text-[1.2rem]">
                Studies
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center lg:col-start-3">
              <div className="text-3xl font-semibold leading-none text-black sm:text-[2.8rem]">
                8M<span className="text-[#4b5ae1]">+</span>
              </div>
              <div className="mt-2 text-base font-medium text-black/90 sm:text-[1.2rem]">
                Patients
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-semibold leading-none text-[#4b5ae1] sm:text-[2.8rem]">
                98<span className="text-[#4b5ae1]">%</span>
              </div>
              <div className="mt-2 text-base font-medium text-black/90 sm:text-[1.2rem]">
                Customer Satisfaction
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-semibold leading-none text-[#4b5ae1] sm:text-[2.8rem]">
                95<span className="text-[#4b5ae1]">%</span>
              </div>
              <div className="mt-2 text-base font-medium text-black/90 sm:text-[1.2rem]">
                On time delivery
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* seventh page */}
      <div className="seventh-page relative mt-6 flex min-h-[600px] w-full flex-col items-center justify-center gap-[10px] overflow-hidden bg-[#f4f8fe]/40 lg:min-h-screen">
        <div className="image absolute inset-0">
          <img
            src="/seventh_page.png"
            className="w-full h-full object-cover"
            alt=""
          />
        </div>

        <div className="card relative z-10 flex h-auto min-h-[600px] w-full items-center">
          <div className="left flex h-auto w-full items-center justify-center lg:h-full lg:w-1/2 lg:justify-end">
            <div className="cards flex h-auto w-[calc(100%-2rem)] max-w-[520px] flex-col items-start gap-5 rounded-[15px] border border-[#4b5ae1] bg-white/95 px-5 py-5 shadow-lg sm:gap-7 sm:px-8 lg:h-[55%] lg:w-[55%]">
              <h3 className="text-sm text-[#212d9c] sm:text-base">Feature resource</h3>
              <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">
                520% increase in PMCF study enrollment
              </h1>
              <p className="text-sm leading-6 text-slate-600 sm:text-base sm:leading-normal">
                How one medical device team (MMI, PRIMO study) grew enrollment
                using AIIA-CTMS, with electronic consent to remove the sign-up
                bottleneck.
              </p>
              <button className="cursor-pointer rounded-md bg-[#4b5ae1] px-4 py-2 text-sm text-white hover:bg-[#3a49c5]">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* eighth page */}
      <div className="eight-page flex min-h-0 w-full items-center justify-center gap-6 lg:h-[70vh] lg:gap-[50px]">
        <div className="page flex min-h-[420px] w-full flex-col items-center justify-center gap-6 bg-[#0E3581] px-4 py-10 lg:h-full lg:flex-row lg:gap-[50px] lg:p-1">
          <div className="first-block hidden h-full items-center justify-end lg:flex lg:w-full">
            <img
              src="/public/eight_page_left.svg"
              className="w-[60%] object-cover"
              alt=""
            />
          </div>
          <div className="second-block flex h-auto w-full flex-col items-center justify-center gap-2 text-center text-white lg:h-full lg:gap-[10px]">
            <h1 className="text-lg font-semibold leading-tight sm:text-2xl lg:text-2xl">
              Ready to get started building the
            </h1>
            <h2 className="text-base font-semibold leading-tight sm:text-xl lg:text-2xl">
              right eClinical solution for your trial?
            </h2>
            <button className="mt-6 cursor-pointer rounded-md border border-[#DEFFF5] bg-[#DEFFF5] px-6 py-3 text-[#0E3581] hover:bg-[#0E3581] hover:text-[#DEFFF5] sm:mt-10 sm:px-20">
              <span className="text-base font-semibold sm:text-lg">Book a demo</span>
            </button>
          </div>
          <div className="third-block hidden h-full items-center justify-start lg:flex lg:w-full">
            <img
              src="/public/eight_page_right.svg"
              className="w-[60%] object-cover"
              alt=""
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
