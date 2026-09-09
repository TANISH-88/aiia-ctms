import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const AppLayout = () => {
  const { pathname } = useLocation();
  const isCtmsRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/clinical-trials") ||
    pathname.startsWith("/participants") ||
    pathname.startsWith("/study") ||
    pathname.startsWith("/studies/") ||
    pathname.startsWith("/ethics/") ||
    pathname.startsWith("/adverse-events") ||
    pathname.startsWith("/alerts") ||
    pathname.startsWith("/audit-trail") ||
    pathname.startsWith("/interoperability");

  return (
    <div className="relative min-h-screen overflow-visible bg-[#edf4fb] text-slate-900">
      {!isCtmsRoute && <Navbar />}
      <main className="relative z-0 flex-1 overflow-visible">
        <Outlet />
      </main>
      {!isCtmsRoute && <Footer />}
    </div>
  );
};

export default AppLayout;
