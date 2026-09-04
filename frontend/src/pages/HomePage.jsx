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
      <div className="hero-page relative -mt-[89px] h-screen w-full overflow-hidden bg-white">
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

        <div className="relative z-10 flex h-full w-full flex-col item-center justify-center gap-[50px] lg:px-6 lg:pl-30 text-content">
          <div className="heading flex w-full  lg:justify-start justify-center items-center">
            <h1 className="left-contents flex  items-center lg:justify-start md:justify-start justify-center  font-semibold text-white lg:text-5xl md:text-5xl sm:text-4xl text-2xl">
              The AI-native clinical trial platform
            </h1>
          </div>
          <div className="para w-full   ">
            <p className="lg:w-1/2 md:w-full w-full lg:text-2xl md:text-2xl text-xl lg:text-start  text-center text-white">
              EDC, eCOA, eConsent, and data management in one platform. AI
              extracts your source data. A human approves every value.
            </p>
          </div>
          <div className="button flex w-full lg:justify-start  justify-center items-center gap-[20px]">
            <button className="cursor-pointer rounded-[5px] bg-blue-500 lg:px-4 lg:py-2 px-5 py-3 font-bold text-white hover:bg-blue-700">
              Book a demo
            </button>
          </div>
        </div>
      </div>

      {/* second page */}
      <div className="second-page  flex lg:flex-row flex-col  min-h-screen w-full items-center justify-center gap-[50px] ">
        <div className="left flex lg:w-1/2 w-full items-center justify-center">
          <img
            src="/second_page.png"
            alt=""
            className="lg:w-[70%]  w-[80%] object-cover"
          />
        </div>
        <div className="right lg:mr-[20px] flex lg:w-[40%] w-full flex-col  gap-[30px]  p-15">
          <h1 className="lg:text-4xl md:text-3xl text-2xl font-semibold">
            Smarter Research. Real-World Impact.
          </h1>
          <p className="lg:text-lg md:text-xl text-lg">
            From clinical trials to real-world evidence studies, AIIA-CTMS delivers
            the tools you need to simplify workflows and accelerate
            breakthroughs. Build, manage, and adapt your research effortlessly
            with our powerful, scalable platform designed for the future of
            clinical science.
          </p>
          <button className="lg:w-1/2 md:w-[60%] w-[70%] cursor-pointer rounded-[5px] bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
            <span className="lg:text-md text-sm">Learn More about Us</span>
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
      <div className="fourth-page w-full min-h-screen flex flex-col items-center justify-center lg:gap-[10px] gap-[30px]  bg-[#f4f8fe]/40 mt-6 py-2 ">
        <div className="up flex w-full lg:h-[20%] h-[35vh] flex-col items-center justify-center gap-[30px] ">
          <h1 className="text-center lg:text-[2.5rem] text-3xl font-semibold leading-tight text-black">
            AI extracts your source data. A human reviewer approves every value.
          </h1>
          <p className="text-center">
            Against a 6.6% error rate in manual abstraction. Source in, clean
            data out.
          </p>
        </div>
        <div className=" down w-full h-[60vh] flex lg:flex-row flex-col items-center justify-center  lg:p-10 ">
          <div className=" left lg:w-1/2 w-full h-full py-3 flex flex-col items-center justify-end px-10 gap-[20px]">
            <div className="up lg:w-[70%] w-[80%] h-[calc(50%-10px)] rounded-[15px] border border-[#0d2f72]/20  shadow-sm flex flex-col items-center justify-center gap-[30px]  border-black border-1 p-5">
              <h1 className="lg:text-2xl text-3xl font-semibold">99.8%</h1>
              <p className="text-center font-light lg:text-lg text-xl">
                Submission success rate
              </p>
            </div>
            <div className="down lg:w-[70%] w-[80%] h-[calc(50%-10px)] rounded-[15px] border border-[#0d2f72]/20  shadow-sm flex flex-col items-center justify-center gap-[30px]  border-black border-1">
              <h1 className="lg:text-2xl text-3xl font-semibold">0.8%</h1>
              <p className="text-center font-light lg:text-lg text-xl">
                Values changed by the reviewer
              </p>
            </div>
          </div>
          <div className="right lg:w-1/2 w-full h-full flex items-center justify-start lg:p-0 p-5">
            <img src="/fourth_page.gif" className="lg:w-[60%] w-full h-full" />
          </div>
        </div>
        <div className="button w-full h-[15vh] flex items-center justify-center ">
          <button className="bg-[#1158e5]  text-white px-6 py-3 rounded-[5px] font-medium hover:bg-[#0d2f72]/80 cursor-pointer">
            See how it works
          </button>
        </div>
      </div>
      {/* fifth page */}
      <div className="fifth-page w-full min-h-screen flex flex-col items-center justify-center gap-[50px] bg-[#f4f8fe]/40 mt-6 py-2 p-10">
        <div className="up w-full h-[80%] flex lg:flex-row flex-col items-center justify-center gap-[50px]">
          <div className="left lg:w-1/2 w-full h-full ">
            <div className="flex h-full flex-col lg:items-end items-start justify-center gap-8 lg:pl-8 lg:pr-4">
              <div className="heading flex lg:w-3/4 w-full items-center justify-start gap-4">
                <h1 className="lg:text-4xl md:text-5xl text-2xl font-bold leading-tight  text-black">
                  Why AIIA-CTMS?
                </h1>
              </div>

              <div className="space-y-8 lg:w-3/4 ">
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
                      <h2 className="lg:text-base text-lg font-semibold leading-snug text-black">
                        {item.question}
                      </h2>
                      <p className="lg:text-sm text-md leading-relaxed text-[#112d52]/80">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="right lg:w-1/2 w-full h-full">
            <div className="image flex w-full h-full items-center justify-start">
              <img
                src="../../public/fifth_page.gif"
                className="lg:w-[80%] flex "
                alt=""
              />
            </div>
          </div>
        </div>
        <div className="down w-full h-[20%] flex items-center justify-center gap-4">
          <button className="bg-[#1f67e2] text-white py-2 px-4 rounded-md hover:bg-[#071274]">
            See Why Teams Choose US
          </button>
          <button className="bg-[#1f67e2] text-white py-2 px-4 rounded-md hover:bg-[#16086f]">
            Explore AI Features
          </button>
        </div>
      </div>
      {/* sixth page */}
      <div className="sixth-page mt-6 w-full min-h-screen bg-[#9893932e] px-6 py-12  flex items-center">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-center gap-8 md:flex-row md:items-center md:justify-center">
          <div className="flex w-full max-w-[300px] flex-col items-center justify-center rounded-[5px]  bg-[#4b5ae1] px-6 py-8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] md:min-h-[330px] text-white">
            <div className="text-[4rem] font-semibold leading-none">#1</div>
            <div className="mt-2 text-[1.7rem] font-semibold">Ranked EDC</div>
            <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-[#f9f9f9] text-[2.2rem] text-white">
              ★
            </div>
          </div>

          <div className="grid w-full max-w-[760px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-[2.8rem] font-semibold leading-none text-black">
                223K<span className="text-[#4b5ae1]">+</span>
              </div>
              <div className="mt-2 text-[1.2rem] font-medium text-black/90">
                Happy Users
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-[2.8rem] font-semibold leading-none text-black">
                17K<span className="text-[#4b5ae1]">+</span>
              </div>
              <div className="mt-2 text-[1.2rem] font-medium text-black/90">
                Studies
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center lg:col-start-3">
              <div className="text-[2.8rem] font-semibold leading-none text-black">
                8M<span className="text-[#4b5ae1]">+</span>
              </div>
              <div className="mt-2 text-[1.2rem] font-medium text-black/90">
                Patients
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-[2.8rem] font-semibold leading-none text-[#4b5ae1]">
                98<span className="text-[#4b5ae1]">%</span>
              </div>
              <div className="mt-2 text-[1.2rem] font-medium text-black/90">
                Customer Satisfaction
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-[2.8rem] font-semibold leading-none text-[#4b5ae1]">
                95<span className="text-[#4b5ae1]">%</span>
              </div>
              <div className="mt-2 text-[1.2rem] font-medium text-black/90">
                On time delivery
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* seventh page */}
      <div className="seventh-page relative w-full min-h-screen flex flex-col items-center justify-center gap-[10px] bg-[#f4f8fe]/40 ">
        <div className="image absolute inset-0">
          <img
            src="/seventh_page.png"
            className="w-full h-full object-cover"
            alt=""
          />
        </div>

        <div className="card relative z-50 w-full h-screen ">
          <div className="left lg:w-1/2 w-full h-full flex items-center lg:justify-end justify-center ">
            <div className="cards lg:w-[55%] w-[70%] lg:h-[55%] border-1 border-[#4b5ae1] bg-white rounded-[15px] shadow-lg flex flex-col items-start  gap-9 px-8 py-5">
              <h3 className="text-md text-[#212d9c]">Feature resource</h3>
              <h1 className="text-3xl font-semibold">
                520% increase in PMCF study enrollment
              </h1>
              <p className="text-base text-slate-600">
                How one medical device team (MMI, PRIMO study) grew enrollment
                using AIIA-CTMS, with electronic consent to remove the sign-up
                bottleneck.
              </p>
              <button className="bg-[#4b5ae1] text-white py-2 px-4 rounded-md hover:bg-[#3a49c5]">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* eighth page */}
      <div className="eight-page w-full  h-[70vh] flex items-center justify-center gap-[50px]">
        <div className="page w-full h-full flex items-center justify-center gap-[50px] p-1 bg-[#0E3581]  ">
          <div className="first-block lg:w-full w-0 h-full  flex items-center justify-end">
            <img
              src="/public/eight_page_left.svg"
              className="w-[60%] object-cover"
              alt=""
            />
          </div>
          <div className="second-block w-full h-full  flex flex-col items-center justify-center gap-[10px]  text-white">
            <h1 className="lg:text-2xl text-2xl font-semibold">
              Ready to get started building the
            </h1>
            <h2 className="lg:text-2xl text-xl font-semibold">
              right eClinical solution for your trial?
            </h2>
            <button className="bg-[#DEFFF5] text-[#0E3581]  rounded-md hover:bg-[#0E3581] mt-10 px-20 py-3 hover:text-[#DEFFF5]  hover:border-[#DEFFF5] border-1 cursor-pointer ">
              <span className="text-lg font-semibold">Book a demo</span>
            </button>
          </div>
          <div className="third-block lg:w-full w-0 h-full  flex items-center justify-start">
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
