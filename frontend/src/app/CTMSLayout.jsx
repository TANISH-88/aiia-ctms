import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";

export default function CTMSLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => window.innerWidth < 1280,
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="ctms-dashboard flex min-h-screen w-full bg-[#f4f8fb]">
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-x-0 top-14 bottom-0 z-60 bg-[#16324f]/20 lg:hidden"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex h-14 items-center border-b border-[#dfe7ef] bg-white lg:hidden">
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="ml-3 flex h-10 w-10 items-center justify-center rounded-[5px] text-lg text-[#16324f] transition hover:bg-[#f4f8fb]"
          >
            ☰
          </button>
        </div>
        <main className="w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
