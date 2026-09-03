import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";

export default function CTMSLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => window.innerWidth < 1280,
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#f6f8fc]">
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
          className="fixed inset-x-0 top-22 bottom-0 z-60 bg-slate-900/25 lg:hidden"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center border-b border-slate-200 bg-white lg:hidden">
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="ml-3 flex h-11 w-11 items-center justify-center rounded-md text-xl text-slate-600 hover:bg-slate-100"
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
