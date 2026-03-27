import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Analyzer() {
  const [news, setNews] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const samples = [
    {
      label: "Politics",
      text: "WASHINGTON (Reuters) - The United States Senate overwhelmingly passed a sweeping bipartisan infrastructure bill on Thursday, allocating billions of dollars toward repairing aging bridges, expanding broadband access, and upgrading the national power grid. The legislation, which saw support from both sides of the aisle, now heads to the House of Representatives where leadership has promised a swift vote before the upcoming congressional recess.",
    },
    {
      label: "Conspiracy",
      text: "BREAKING: A massive leak of classified documents from an anonymous whistleblower has just exposed a terrifying deep-state conspiracy. Shadowy government elites have allegedly been funneling billions of taxpayer dollars into secret offshore accounts to fund a globalist agenda. Mainstream media networks are completely ignoring this explosive story in a coordinated cover-up to protect high-ranking politicians before the upcoming elections.",
    },
    {
      label: "Global",
      text: "BERLIN - European leaders convened an emergency summit to address the ongoing geopolitical tensions in Eastern Europe and the resulting fluctuations in the global energy market. The coalition released a joint statement reaffirming their commitment to diplomatic resolutions while simultaneously pledging to increase investments in domestic renewable energy infrastructure to reduce reliance on foreign fossil fuel imports over the next decade.",
    },
    {
      label: "Election",
      text: "OUTRAGEOUS! Caught on a hot mic, a top Washington insider was just heard laughing about how they successfully rigged the latest national polls to manipulate the American public. Unnamed intelligence sources confirm that voting machines across three critical swing states were directly tampered with by foreign operatives linked to the Clinton Foundation. Patriots are demanding immediate military tribunals for everyone involved in this treasonous plot.",
    },
    {
      label: "Economy",
      text: "NEW YORK (Reuters) - The Federal Reserve announced a quarter-point increase in benchmark interest rates on Wednesday, citing a need to curb inflation which has reached a four-decade high. Following the announcement, major Wall Street indices experienced moderate sell-offs, with technology and consumer discretionary stocks leading the decline as investors adjusted their forecasts for future corporate earnings.",
    },
    {
      label: "Health Cover-up",
      text: "SHOCKING REPORT: Top CDC scientists are blowing the whistle on a massive pharmaceutical cover-up. Secret internal memos prove that government health agencies have been intentionally poisoning the water supply with experimental mind-control chemicals to keep the population docile. Big Pharma CEOs are reportedly making trillions off the resulting illnesses while threatening any honest doctors who dare to speak the truth to the public.",
    },
    {
      label: "Science/Health",
      text: "GENEVA - The World Health Organization has published comprehensive guidelines for nations seeking to bolster their pandemic preparedness infrastructure. The report emphasizes the critical need for transparent, real-time data sharing between international health ministries and recommends significant funding increases for epidemiological research to identify and contain potential zoonotic virus outbreaks before they achieve global transmission.",
    },
    {
      label: "Scandal",
      text: "BOMBSHELL: The FBI has just raided the heavily guarded compound of a prominent billionaire after intercepting encrypted messages proving they are funding violent anarchist mobs across the country. Police reportedly found stacks of illegal ballots and hard drives containing highly illegal blackmail material on every major Supreme Court Justice. The mainstream media is in full panic mode trying to bury this definitive proof.",
    },
    {
      label: "Technology",
      text: "SAN FRANCISCO - Major technology companies have agreed to a new set of international regulatory standards aimed at increasing user data privacy and limiting the reach of targeted algorithmic advertising. The historic agreement, brokered by European Union privacy advocates, will require platforms to obtain explicit opt-in consent before tracking cross-site user behavior, fundamentally altering the digital marketing landscape.",
    },
    {
      label: "Sensational",
      text: "WAKE UP AMERICA! The President just secretly signed an unconstitutional executive order that will allow the United Nations to deploy foreign military troops on US soil to confiscate firearms from law-abiding citizens. Liberal judges have already signed off on the mass arrest warrants. Share this article immediately before the tech giants delete it and shut down our entire internet grid in retaliation!",
    },
  ];

  const currentWords = news
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const handleUrlScrape = async () => {
    if (!urlInput.trim() || !urlInput.includes("http")) {
      setError("Please enter a valid URL (starting with http/https)");
      return;
    }

    setLoading(true);
    setLoadingMsg("Extracting article from URL...");
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("verinews_token");
      const response = await fetch(`${API_URL}/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: urlInput }),
      });

      // --- PROTECTION LOGIC START ---
      if (response.status === 401) {
        localStorage.removeItem('verinews_token');
        window.location.reload(); 
        return;
      }
      // --- PROTECTION LOGIC END ---

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not scrape this site.");

      setNews(data.text);
      setUrlInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeNews = async () => {
    setResult(null);
    setError("");
    if (currentWords < 50) {
      setError(`Text is too short (${currentWords}/50 words). Please provide more context.`);
      return;
    }

    setLoading(true);
    setLoadingMsg("AI is analyzing text & verifying facts...");
    try {
      const token = localStorage.getItem("verinews_token");
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: news }),
      });

      // --- PROTECTION LOGIC START ---
      if (response.status === 401) {
        localStorage.removeItem('verinews_token');
        window.location.reload();
        return;
      }
      // --- PROTECTION LOGIC END ---

      const data = await response.json();
      console.log("Backend Response:", data);
      if (!response.ok) throw new Error(data.detail || "Server error");
      setResult(data);
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Backend server is offline." : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setNews("");
    setResult(null);
    setError("");
    setCopied(false);
    setUrlInput("");
  };

  const copyToClipboard = () => {
    const textToCopy = `VeriNews Analysis:\nPrediction: ${result.prediction}\nConfidence: ${result.confidence}%\nAnalyzed Text: "${news.substring(0, 50)}..."`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex flex-col items-center py-10 w-full max-w-4xl mx-auto px-4">
      {/* Full Screen Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold text-white tracking-widest animate-pulse">
            {loadingMsg}
          </h2>
        </div>
      )}

      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
          Fake News Detection Engine
        </h1>
        <p className="text-slate-400">
          Paste an article or URL below to analyze its authenticity using NLP &
          OSINT.
        </p>
      </header>

      {/* NEW URL SCRAPER INPUT */}
      <div className="flex flex-col sm:flex-row gap-2 w-full mb-8 bg-slate-800/50 p-4 rounded-2xl border border-slate-700 shadow-lg">
        <input
          type="text"
          placeholder="🔗 Paste news link (URL) here to auto-extract text..."
          className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-600 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
        <button
          onClick={handleUrlScrape}
          disabled={loading || !urlInput.trim()}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all disabled:bg-slate-700 whitespace-nowrap"
        >
          Fetch Article
        </button>
      </div>

      {/* SAMPLES ROW */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center w-full">
        {samples.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setNews(s.text);
              setError("");
              setResult(null);
            }}
            className="text-xs md:text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 md:px-4 py-2 rounded-full border border-slate-600 transition-all font-medium"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="relative w-full shadow-2xl">
        <textarea
          className={`w-full h-[250px] md:h-64 min-h-[150px] p-6 rounded-2xl bg-slate-900 text-white placeholder-slate-500 border-2 ${currentWords > 0 && currentWords < 50 ? "border-red-500" : "border-slate-700"} focus:border-indigo-500 outline-none resize-none leading-relaxed`}
          placeholder="Paste news article content here (minimum 50 words)..."
          value={news}
          onChange={(e) => setNews(e.target.value)}
        />
        <div
          className={`absolute bottom-4 right-4 text-xs font-bold px-3 py-1.5 rounded-md bg-slate-800 border ${currentWords < 50 ? "border-red-500/50 text-red-400" : "border-emerald-500/50 text-emerald-400"}`}
        >
          {currentWords} / 50 Words
        </div>
      </div>

      <div className="flex gap-4 mt-6 w-full">
        <button
          onClick={analyzeNews}
          disabled={loading || currentWords < 50}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-800 text-white p-4 rounded-xl font-black text-lg tracking-wide transition-all shadow-lg"
        >
          VERIFY CONTENT
        </button>
        <button
          onClick={handleClear}
          disabled={loading}
          className="px-8 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-xl font-bold transition-all"
        >
          CLEAR
        </button>
      </div>

      {error && (
        <div className="mt-6 w-full p-4 bg-red-900/40 border-l-4 border-red-500 rounded-r-xl text-red-200 font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* FULL RESULTS SECTION */}
      {result && (
        <div className="mt-10 w-full p-6 md:p-8 bg-slate-800/80 backdrop-blur rounded-3xl border border-slate-600 shadow-2xl">
          <h2 className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-6 text-center">
            Detailed Analysis Report
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
            <div className="text-center md:text-left flex-1">
              <div
                className={`text-5xl md:text-6xl font-black mb-2 ${result.prediction === "Fake News" ? "text-red-500" : "text-emerald-400"}`}
              >
                {result.prediction.toUpperCase()}
              </div>
              <p className="text-slate-300 font-medium">
                AI Confidence:{" "}
                <span className="text-white font-bold">
                  {result.confidence}%
                </span>
              </p>
            </div>

            <div className="w-full md:w-1/2 bg-slate-900 h-6 rounded-full overflow-hidden border border-slate-700 relative">
              <div
                className={`h-full transition-all duration-1000 ${result.prediction === "Fake News" ? "bg-gradient-to-r from-red-600 to-red-400" : "bg-gradient-to-r from-emerald-600 to-emerald-400"}`}
                style={{ width: `${result.confidence}%` }}
              ></div>
            </div>
          </div>

          {/* Suspicious/Authentic Words */}
          {result.top_words && result.top_words.length > 0 && (
            <div className="mb-8 p-5 bg-slate-900/50 rounded-2xl border border-slate-700">
              <h3
                className={`font-bold mb-4 text-sm uppercase tracking-wider ${result.prediction === "Fake News" ? "text-red-400" : "text-emerald-400"}`}
              >
                {result.prediction === "Fake News"
                  ? "Flagged Suspicious Patterns:"
                  : "Verified Authentic Patterns:"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.top_words.map((word, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-sm text-cyan-300 font-mono shadow-sm"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fact-Check Card */}
          {result.fact_check && (
            <div className="mb-8 p-6 bg-indigo-900/30 border border-indigo-500/50 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <div className="flex items-center gap-3 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
                <h3 className="text-indigo-300 font-black uppercase tracking-widest text-sm">
                  Live OSINT Match
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">
                    Claim Investigated:
                  </p>
                  <p className="text-white italic text-lg leading-relaxed">
                    "{result.fact_check.claim_made}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-xl">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">
                      Source
                    </p>
                    <p className="text-cyan-400 font-black tracking-wide">
                      {result.fact_check.publisher}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">
                      Official Verdict
                    </p>
                    <p className="text-red-400 font-black tracking-wide">
                      {result.fact_check.rating}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    window.open(result.fact_check.source_url, "_blank")
                  }
                  className="w-full py-3 bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all border border-indigo-400/30"
                >
                  READ FULL INVESTIGATION ↗
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            {result.prediction === "Fake News" && !result.fact_check && (
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/search?q=${news.split(/\s+/).slice(0, 8).join("+")}+fact+check`,
                    "_blank",
                  )
                }
                className="flex-1 py-3 px-4 bg-red-900/30 text-red-400 border border-red-500/50 rounded-xl font-bold hover:bg-red-900/50 transition-all"
              >
                Search on Google
              </button>
            )}
            <button
              onClick={copyToClipboard}
              className="flex-1 py-3 px-4 bg-slate-700 text-white border border-slate-600 rounded-xl font-bold hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
            >
              {copied ? "✅ COPIED TO CLIPBOARD" : "📄 COPY REPORT"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analyzer;
