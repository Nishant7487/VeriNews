import { ShieldCheck, Database, Cpu } from "lucide-react";

function Landing({ onEnter }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden relative z-0">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-4xl text-center z-10">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-40 rounded-full"></div>
            <ShieldCheck className="w-20 h-20 text-cyan-400 relative z-10 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          VeriNews AI
        </h1>
        <p className="text-lg text-slate-300 mb-12 max-w-2xl mx-auto font-medium">
          An enterprise-grade Natural Language Processing pipeline designed to
          classify textual disinformation using Machine Learning.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-md">
            <Cpu className="w-8 h-8 text-cyan-400 mb-4 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <h3 className="font-bold text-white mb-1">TF-IDF Engine</h3>
            <p className="text-sm text-slate-400">
              Mathematical vocabulary extraction.
            </p>
          </div>
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-md">
            <Database className="w-8 h-8 text-purple-400 mb-4 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            <h3 className="font-bold text-white mb-1">WELFake Dataset</h3>
            <p className="text-sm text-slate-400">
              Trained on 72,134 labeled articles.
            </p>
          </div>
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-md">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <h3 className="font-bold text-white mb-1">High Accuracy</h3>
            <p className="text-sm text-slate-400">
              Optimized Logistic Regression.
            </p>
          </div>
        </div>

        <button
          onClick={onEnter}
          className="relative inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white transition-all duration-200 bg-cyan-600 border border-transparent rounded-full hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
        >
          Initialize System
        </button>
      </div>
    </div>
  );
}

export default Landing;
