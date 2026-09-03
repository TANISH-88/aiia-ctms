const IconBadge = ({ type }) => {
  const iconMap = {
    shield: (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 2.75 18.5 5v5.8c0 4.36-2.6 8.27-6.5 10.45C8.1 19.07 5.5 15.16 5.5 10.8V5L12 2.75Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8.6 12.2 10.8 14.3 15.4 9.7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    chat: (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6.5 17.5V8.8A2.8 2.8 0 0 1 9.3 6h9.4a2.8 2.8 0 0 1 2.8 2.8v5.4a2.8 2.8 0 0 1-2.8 2.8H10l-3.5 3v-3.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9 10.2h8.5M9 13h5.6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    people: (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="9"
          cy="8.5"
          r="2.8"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle
          cx="16.5"
          cy="9.4"
          r="2.2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M5 17.5c.6-2.2 2.6-3.6 5-3.6s4.4 1.4 5 3.6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M13.8 17.5c.4-1.6 1.7-2.7 3.4-2.7 1.8 0 3.2 1.1 3.7 2.7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    globe: (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="7.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M4.5 12h15M12 4.5c2.2 2.3 3.3 5 3.3 7.5S14.2 17.2 12 19.5c-2.2-2.3-3.3-5-3.3-7.5S9.8 6.8 12 4.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
    lab: (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8.8 3.8h6.4v2.8L14 8v6.1a3.8 3.8 0 1 1-4 0V8l-1.2-1.4V3.8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9.7 12h4.6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    microscope: (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7.7 6.5h8.6M10 6.5V4.8M14 6.5V4.8M8.3 10.5h7.4a2.3 2.3 0 0 1 2.3 2.3v2.7a4.7 4.7 0 0 1-4.7 4.7h-2.6a4.7 4.7 0 0 1-4.7-4.7v-2.7a2.3 2.3 0 0 1 2.3-2.3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 9V6.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    document: (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 4.5h7.5L18 8v11.5H7A2.5 2.5 0 0 1 4.5 17V7A2.5 2.5 0 0 1 7 4.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 4.5V8H18M9 12.2h6M9 15.2h6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    cap: (
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3.5 9.5 12 5l8.5 4.5L12 14 3.5 9.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8 11.5v3.7c0 1.5 1.8 2.8 4 2.8s4-1.3 4-2.8v-3.7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  };

  return (
    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#0d2f72]/20 bg-white shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full text-[#0d2f72] shadow-inner">
        {iconMap[type]}
      </div>
    </div>
  );
};

const Card = ({ title, description, icon, accentClass }) => {
  return (
    <div className="flex h-full lg:min-h-[420px] md:h-fit  flex-col rounded-[5px] border border-[#d6e3f3] bg-[#f4f8fe]/40 p-6 shadow-[0_0_0_1px_rgba(13,47,114,0.02)] cursor-pointer hover:scale-[1.02] transition-transform duration-300 hover:border-black ">
      <div
        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${accentClass}`}
      >
        <IconBadge type={icon} />
      </div>

      <h3 className="mb-5 lg:text-[1.2rem] font-semibold leading-tight text-black sm:text-[1.35rem]">
        {title}
      </h3>

      <p className="lg:text-[0.9rem] leading-7 text-[#2c3d5b] sm:text-base">
        {description}
      </p>

      <div className="mt-auto pt-6">
        <button
          type="button"
          className="cursor-pointer text-[0.9rem] font-semibold text-[#0d2f72] underline-offset-4 hover:underline"
        >
          Learn more
        </button>
      </div>
    </div>
  );
};

export default Card;
