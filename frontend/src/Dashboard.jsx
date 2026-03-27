import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Database, Trash2, Activity, ShieldAlert, ShieldCheck } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('verinews_token');
        const response = await fetch(`${API_URL}/history`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // --- PROTECTION LOGIC START ---
        if (response.status === 401) {
          localStorage.removeItem('verinews_token');
          window.location.reload();
          return;
        }
        // --- PROTECTION LOGIC END ---

        if (!response.ok) throw new Error("Database connection failed");
        const data = await response.json();
        setHistory(data.history);
      } catch (err) {
        setError("Could not retrieve secure analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm("WARNING: Proceed?")) return;
    try {
      const token = localStorage.getItem('verinews_token');
      const response = await fetch(`${API_URL}/history`, { 
          method: "DELETE",
          headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('verinews_token');
        window.location.reload();
        return;
      }

      if (!response.ok) throw new Error("Failed to purge database");
      setHistory([]);
    } catch (err) {
      alert("System Error: " + err.message);
    }
  };
  
  const fakeCount = history.filter((h) => h.prediction_result === "Fake News").length;
  const realCount = history.filter((h) => h.prediction_result === "Real News").length;

  const chartData = [
    { name: "Disinformation Detected", value: fakeCount, color: "#ef4444" },
    { name: "Verified Authentic", value: realCount, color: "#10b981" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 flex flex-col gap-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl">
          <Activity className="w-8 h-8 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">System Analytics Matrix</h1>
          <p className="text-slate-400 font-mono text-sm mt-1">Live Telemetry & Historical Verification Logs</p>
        </div>
      </header>

      {!loading && !error && history.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analytics Overview */}
          <div className="lg:col-span-1 bg-slate-900/80 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-md shadow-xl flex flex-col justify-center">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-6 text-center">Traffic Distribution</h2>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", borderRadius: "12px", fontFamily: "monospace", fontSize: "12px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px", fontFamily: "monospace", color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
                <span className="text-3xl font-black text-white">{history.length}</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Total Scans</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-6">
            <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-2xl flex flex-col justify-between backdrop-blur-md shadow-xl">
               <ShieldAlert className="w-8 h-8 text-red-500 mb-4 opacity-50" />
               <div>
                  <p className="text-5xl font-black text-red-500 tracking-tighter">{fakeCount}</p>
                  <p className="text-xs font-mono text-red-400/70 uppercase tracking-widest mt-2">Threats Intercepted</p>
               </div>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-900/50 p-6 rounded-2xl flex flex-col justify-between backdrop-blur-md shadow-xl">
               <ShieldCheck className="w-8 h-8 text-emerald-500 mb-4 opacity-50" />
               <div>
                  <p className="text-5xl font-black text-emerald-500 tracking-tighter">{realCount}</p>
                  <p className="text-xs font-mono text-emerald-400/70 uppercase tracking-widest mt-2">Authentic Sources</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Feed */}
      <div className="w-full bg-slate-900/80 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-md shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-slate-200">Live Secure Database Feed</h2>
          </div>
          <button
            onClick={handleClearHistory}
            disabled={history.length === 0}
            className="text-xs bg-red-950/50 hover:bg-red-900/80 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg font-mono uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Purge Records
          </button>
        </div>

        {loading ? (
          <div className="text-center text-cyan-500 font-mono uppercase tracking-widest py-12 animate-pulse flex flex-col items-center gap-3">
            <Database className="w-8 h-8 animate-bounce" />
            Syncing with Supabase Nodes...
          </div>
        ) : error ? (
          <div className="text-center text-red-400 font-mono py-12 bg-red-950/20 rounded-xl border border-red-900/50">{error}</div>
        ) : history.length === 0 ? (
          <div className="text-center text-slate-500 font-mono py-16 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
            [ DATA VAULT EMPTY ]<br/>Execute a scan in the Analyzer to populate logs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-xs font-mono uppercase tracking-widest bg-slate-950/50">
                  <th className="py-4 pl-4 rounded-tl-lg">Timestamp (UTC)</th>
                  <th className="py-4">Payload Snippet</th>
                  <th className="py-4 text-center">System Verdict</th>
                  <th className="py-4 text-center rounded-tr-lg">Confidence</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {history.map((record, idx) => (
                  <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors group">
                    <td className="py-4 pl-4 text-slate-400 font-mono text-xs whitespace-nowrap">
                      {new Date(record.timestamp + "Z").toLocaleString()}
                    </td>
                    <td className="py-4 pr-4 text-slate-300 max-w-md">
                      <p className="truncate font-serif italic text-slate-400 group-hover:text-slate-200 transition-colors">"{record.news_text.substring(0, 70)}..."</p>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest font-mono ${
                          record.prediction_result === "Fake News"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {record.prediction_result}
                      </span>
                    </td>
                    <td className="py-4 text-center font-mono text-slate-300 font-bold">
                      {record.confidence_score}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;