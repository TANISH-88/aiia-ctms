import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const AppLayout = () => {
  return (
    <div className="relative min-h-screen overflow-visible bg-[#edf4fb] text-slate-900">
      <Navbar />
      <main className="relative z-0 flex-1 overflow-visible">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
