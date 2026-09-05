import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "../features/user/hooks/useUser";

const sections = [
  {
    label: "MAIN",
    items: [
      ["Dashboard", "/dashboard", "grid", ["admin", "study_coordinator", "ethics_committee", "principal_investigator"]],
      ["Clinical Trials", "/clinical-trials", "clipboard", ["admin", "study_coordinator", "principal_investigator"]],
      ["Participants", "/participants", "users", ["admin", "study_coordinator", "principal_investigator"]],
      ["Study", "/study", "file", ["admin", "study_coordinator"]],
      ["Sites", null, "pin", ["admin"]],
      ["Protocols", null, "book", ["admin", "study_coordinator"]],
    ],
  },
  {
    label: "COMPLIANCE",
    items: [
      ["Study Submissions", "/ethics/submissions", "check", ["admin", "ethics_committee", "principal_investigator"]],
      ["CTRI", "/interoperability", "landmark", ["admin"]],
      ["Audit Trail", "/audit-trail", "history", ["admin"]],
    ],
  },
  {
    label: "SAFETY",
    items: [
      ["Pharmacovigilance", null, "shield", ["admin"]],
      ["Adverse Events", "/adverse-events", "alert", ["admin", "study_coordinator", "ethics_committee", "principal_investigator"]],
      ["Safety Signals", null, "activity", ["admin"]],
    ],
  },
  {
    label: "DATA",
    items: [
      ["Analytics", null, "chart", ["admin"]],
      ["FHIR and CDISC", "/interoperability", "database", ["admin"]],
      ["Data Export", null, "download", ["admin"]],
    ],
  },
];

const iconPaths = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  clipboard: "M8 4h8v3H8zM6 5H4v15h16V5h-2v4H6zM8 13h8v2H8z",
  users:
    "M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-7a4 4 0 0 1 0 7.75M22 20v-2a4 4 0 0 0-3-3.87",
  file: "M6 2h8l4 4v16H6V2Zm8 1v4h4M9 12h6M9 16h6",
  pin: "M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  book: "M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4V4Zm16 0h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6V4Z",
  check:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-2-5-4-4 1.4-1.4L10 14.2l6.6-6.6L18 9l-8 8Z",
  landmark: "M3 20h18M5 18V9m4 9V9m6 9V9m4 9V9M3 7l9-5 9 5H3Zm3 0h12",
  history: "M3 12a9 9 0 1 0 3-6.7M3 4v6h6M12 7v5l3 2",
  shield: "m12 2 8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3Z",
  alert: "M12 3 2 21h20L12 3Zm0 5v6m0 4v.1",
  activity: "M3 12h4l2-6 4 12 2-6h6",
  chart: "M4 19V5m0 14h16M8 16v-4m4 4V8m4 8v-7",
  database:
    "M4 6c0-2 3.6-3 8-3s8 1 8 3-3.6 3-8 3-8-1-8-3Zm0 0v6c0 2 3.6 3 8 3s8-1 8-3V6m-16 6v6c0 2 3.6 3 8 3s8-1 8-3v-6",
  download: "M12 3v12m0 0 4-4m-4 4-4-4M4 19h16",
};

function Icon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4.5 w-4.5 shrink-0"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

export default function Sidebar({
  collapsed,
  onToggle,
  isMobileOpen,
  onClose,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user: profile,
    loading: profileLoading,
    initialized: profileInitialized,
    loadUser,
  } = useUser();

  useEffect(() => {
    if (!profile && !profileLoading && !profileInitialized) {
      loadUser().catch(() => {});
    }
  }, [profile, profileLoading, profileInitialized, loadUser]);

  const handleNavigate = (path) => {
    if (!path) {
      return;
    }

    navigate(path);
    onClose?.();
  };

  return (
    <aside
      className={`fixed inset-x-0 top-22 bottom-0 left-0 z-70 flex w-66 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:inset-y-0 lg:z-auto lg:translate-x-0 lg:transition-[width] lg:duration-300 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "lg:w-19" : "lg:w-66"}`}
    >
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        {sections.map((section) => {
          const items = section.items.filter(([, , , roles]) =>
            roles.includes(profile?.role),
          );

          if (items.length === 0) {
            return null;
          }

          return (
          <div key={section.label} className="mb-6 last:mb-0 ">
            <p
              className={`mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-slate-400 ${collapsed ? "lg:hidden" : ""}`}
            >
              {section.label}
            </p>
            <div className="grid gap-1">
              {items.map(([label, path, icon]) => {
                const active =
                  path &&
                  (location.pathname === path ||
                    (path !== "/dashboard" &&
                      location.pathname.startsWith(path)));
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleNavigate(path)}
                    title={collapsed ? label : undefined}
                    className={`flex h-10 w-full items-center gap-3 rounded-[5px] px-3 text-left text-[13px] font-medium transition ${active ? "bg-[#7cc2ff] text-[#f2fff9]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 cursor-pointer"} ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
                  >
                    <Icon name={icon} />
                    <span className={collapsed ? "lg:hidden" : ""}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-18 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-xs text-slate-500 shadow-sm transition hover:text-slate-900 lg:flex"
      >
        {collapsed ? "▶" : "◀"}
      </button>
    </aside>
  );
}
