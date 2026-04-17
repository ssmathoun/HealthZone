import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Save, History, Clock } from 'lucide-react';
import { SafeTrendChart } from "../components/SafeTrendChart";

export function SleepPage() {
  const navigate = useNavigate();
  const [hours, setHours] = useState("8");
  const [minutes, setMinutes] = useState("0");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false); // Added to control message color
  const [history, setHistory] = useState<{ hours: number; created_at: string }[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const API_URL = "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/sleep.php";

  useEffect(() => {
    fetch(`${API_URL}?action=get_history`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { 
        if (Array.isArray(data)) {
          setHistory(data); 
          return;
        }

        setHistory([]);
      })
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleSave = async () => {
    // 1. Strict Validation Checks
    const parsedHours = parseInt(hours, 10);
    const parsedMinutes = parseInt(minutes, 10);

    if (isNaN(parsedHours) || parsedHours < 0 || parsedHours > 24) {
      setIsError(true);
      setMessage("Please enter valid hours (0 - 24).");
      return;
    }
    if (isNaN(parsedMinutes) || parsedMinutes < 0 || parsedMinutes > 59) {
      setIsError(true);
      setMessage("Please enter valid minutes (0 - 59).");
      return;
    }
    if (parsedHours === 0 && parsedMinutes === 0) {
      setIsError(true);
      setMessage("Sleep duration must be greater than 0.");
      return;
    }

    // 2. Calculate and Send Valid Data
    const totalHours = parsedHours + (parsedMinutes / 60);
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ hours: totalHours })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setIsError(false);
        setMessage("Sleep logged successfully!");
        
        // Optimistic UI Update for instant feedback
        setHistory((current) => [
          { hours: totalHours, created_at: new Date().toISOString() },
          ...current,
        ]);
        
        // Reset form
        setHours("8");
        setMinutes("0");
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage("");
          setIsError(false);
        }, 3000);
      } else {
        setIsError(true);
        setMessage("Server error: " + data.message);
      }
    } catch (err) {
      setIsError(true);
      setMessage("Network error saving sleep log.");
    }
  };

  const recentChartData = [...history]
    .slice(0, 14)
    .reverse()
    .reduce<{ label: string; value: number }[]>((points, log) => {
      const createdAt = new Date(log.created_at);
      const hoursValue = Number(log.hours);

      if (Number.isNaN(createdAt.getTime()) || !Number.isFinite(hoursValue)) {
        return points;
      }

      points.push({
        label: createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: hoursValue,
      });

      return points;
    }, []);

  const latestSleep = history.length > 0 ? Number(history[0].hours) : null;
  const averageRecentSleep =
    recentChartData.length > 0
      ? recentChartData.reduce((sum, point) => sum + point.value, 0) /
        recentChartData.length
      : null;

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] text-white p-4 flex items-center gap-4 sticky top-0 z-50 shadow-md">
        <button onClick={() => navigate('/dashboard')} className="hover:opacity-80 transition-opacity">
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="text-xl font-bold">Sleep Tracker</h1>
      </nav>

      <main className="p-4 max-w-xl mx-auto">
        {/* Log Sleep Section */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 border-[#d97706]">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="size-5 text-[#d97706]" />
            <h2 className="text-lg font-semibold text-[#1e293b]">Log Sleep</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-bold text-[#64748b] uppercase">Hours</label>
              <input 
                type="text" 
                inputMode="numeric"
                value={hours} 
                onChange={(e) => {
                  const val = e.target.value;
                  // Regex allows empty string (for backspacing) or digits only. No minus signs.
                  if (val === "" || /^\d+$/.test(val)) {
                    setHours(val);
                    setMessage(""); // Clear error when user types
                  }
                }}
                className="w-full border-2 border-gray-100 rounded-lg p-3 focus:border-[#d97706] outline-none transition-colors"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#64748b] uppercase">Minutes</label>
              <input 
                type="text" 
                inputMode="numeric"
                value={minutes} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d+$/.test(val)) {
                    setMinutes(val);
                    setMessage(""); // Clear error when user types
                  }
                }}
                className="w-full border-2 border-gray-100 rounded-lg p-3 focus:border-[#d97706] outline-none transition-colors"
                placeholder="0"
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-[#d97706] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#b45309] transition-colors shadow-sm"
          >
            <Save className="size-5" /> Save Sleep
          </button>
          
          {/* Dynamic Message Display */}
          {message && (
            <p className={`text-center mt-3 font-medium ${isError ? 'text-red-600' : 'text-green-600 animate-pulse'}`}>
              {message}
            </p>
          )}
        </section>

        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1e293b]">
                Sleep Trend
              </h2>
              <p className="text-xs text-[#64748b] mt-1">
                Showing your most recent 14 sleep logs.
              </p>
            </div>
            <span className="text-xs font-medium text-[#d97706] bg-[#d97706]/10 px-2.5 py-1 rounded-full">
              Last 14
            </span>
          </div>

          {latestSleep !== null && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg bg-[#f8fafc] p-3 text-center">
                <p className="text-[10px] text-[#64748b] mb-1">Latest</p>
                <p className="text-lg font-bold text-[#1e293b]">
                  {latestSleep.toFixed(1)}
                </p>
                <p className="text-[10px] text-[#64748b]">hrs</p>
              </div>
              <div className="rounded-lg bg-[#f8fafc] p-3 text-center">
                <p className="text-[10px] text-[#64748b] mb-1">Average</p>
                <p className="text-lg font-bold text-[#1e293b]">
                  {averageRecentSleep === null ? "—" : averageRecentSleep.toFixed(1)}
                </p>
                <p className="text-[10px] text-[#64748b]">hrs</p>
              </div>
              <div className="rounded-lg bg-[#f8fafc] p-3 text-center">
                <p className="text-[10px] text-[#64748b] mb-1">Entries</p>
                <p className="text-lg font-bold text-[#1e293b]">
                  {history.length}
                </p>
                <p className="text-[10px] text-[#64748b]">total</p>
              </div>
            </div>
          )}

          {historyLoading ? (
            <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-[#f8fafc] text-sm text-[#64748b]">
              Loading sleep trend...
            </div>
          ) : (
            <SafeTrendChart
              data={recentChartData}
              emptyMessage="Log some sleep to see your recent trend here."
              valueFormatter={(value) => `${value.toFixed(1)} hrs`}
              lineColor="#1e293b"
              fillColor="rgba(30, 41, 59, 0.24)"
            />
          )}
        </section>

        {/* Sleep History List */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="size-5 text-[#1e293b]" />
            <h2 className="text-lg font-semibold text-[#1e293b]">Sleep History</h2>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {history.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No sleep logs found.</p>
            ) : (
              history.map((log, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#d97706]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Clock className="size-4 text-[#64748b]" />
                    <span className="text-sm font-medium text-[#1e293b]">
                      {new Date(log.created_at).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#d97706] bg-[#d97706]/10 px-2 py-1 rounded-md">
                    {Number(log.hours).toFixed(1)} hrs
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
