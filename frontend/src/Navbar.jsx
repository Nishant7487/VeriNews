import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-slate-900 border-b border-slate-700 p-4 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-tighter">
          VeriNews
        </div>
        <div className="flex gap-4">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${location.pathname === "/" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            Analyzer
          </Link>
          <Link
            to="/dashboard"
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${location.pathname === "/dashboard" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            System Metrics
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
