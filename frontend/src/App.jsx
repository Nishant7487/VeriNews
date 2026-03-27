import { useState, useEffect } from "react";
import Analyzer from "./Analyzer";
import Dashboard from "./Dashboard";
import Landing from "./Landing";
import Login from "./Login";
import { ShieldCheck, LogOut } from "lucide-react";

const LoadingOverlay = ({ isLoading }) =>
  isLoading ? (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl font-bold text-white tracking-wide">
          Analyzing Content...
        </p>
        <p className="text-slate-400 text-sm mt-1">
          AI processing your news article
        </p>
      </div>
    </div>
  ) : null;

function App() {
  const [activeTab, setActiveTab] = useState("analyzer");
  const [systemInitialized, setSystemInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [authToken, setAuthToken] = useState(localStorage.getItem('verinews_token') || null);

  useEffect(() => {
    const handleLoading = (e) => {
      if (e.detail) setIsLoading(true);
      else setIsLoading(false);
    };
    window.addEventListener("loading", handleLoading);
    return () => window.removeEventListener("loading", handleLoading);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('verinews_token');
    setAuthToken(null);
    setActiveTab("analyzer");
  };

  if (!systemInitialized) {
    return <Landing onEnter={() => setSystemInitialized(true)} />;
  }

  if (!authToken) {
    return <Login setAuthToken={setAuthToken} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 relative">
      <LoadingOverlay isLoading={isLoading} />
      <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 blur-md opacity-40 rounded-full"></div>
              <ShieldCheck className="w-8 h-8 text-cyan-400 relative z-10" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              VeriNews
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-inner">
              <button
                disabled={isLoading}
                className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${isLoading ? "opacity-50 cursor-not-allowed" : ""} ${
                  activeTab === "analyzer"
                    ? "bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
                onClick={() => setActiveTab("analyzer")}
              >
                Scanner
              </button>
              <button
                disabled={isLoading}
                className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${isLoading ? "opacity-50 cursor-not-allowed" : ""} ${
                  activeTab === "dashboard"
                    ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                Metrics & Data
              </button>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-400 transition-all border border-red-500/30 rounded-md hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="p-4">
        {activeTab === "analyzer" ? <Analyzer /> : <Dashboard />}
      </main>
      
      <footer className="max-w-5xl mx-auto p-4 mt-8 border-t border-slate-800/50 text-center">
        <p className="text-xs text-slate-500 font-medium">
          <span className="text-cyan-600 font-bold">DISCLAIMER:</span> VeriNews
          AI is an academic prototype developed for the Master of Computer
          Applications (MCA) submission. The NLP model is trained on the
          historical WELFake dataset (2016-2020) and relies on probabilistic
          TF-IDF vectorization. It is designed to detect linguistic patterns of
          disinformation, but may not accurately classify modern
          out-of-distribution events. This tool should not be used as a
          definitive source of truth for critical geopolitical or financial
          decisions.
        </p>
      </footer>
    </div>
  );
}

export default App;