import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Save, History, Clock, BarChart2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

// Import your custom chart components
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart"; 

export function SleepPage() {
  const navigate = useNavigate();
  const [hours, setHours] = useState("8");
  const [minutes, setMinutes] = useState("0");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false); // Added to control message color
  const [history, setHistory] = useState<{ hours: number; created_at: string }[]>([]);

  const API_URL = "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/sleep.php";

  useEffect(() => {
    fetch(`${API_URL}?action=get_history`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { 
        if (Array.isArray(data)) {
          setHistory(data); 
        }
      })
      .catch(() => console.error("Failed to load history"));
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
        setHistory([{ hours: totalHours, created_at: new Date().toISOString() }, ...history]);
        
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

  // Prepare data for the Bar Chart
  const chartData = history.slice().reverse().map(log => ({
    date: new Date(log.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
    hours: Number(log.hours.toFixed(1))
  }));

  const chartConfig = {
    hours: {
      label: "Hours Slept",
      color: "#d97706", 
    },
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] text-white p-4 flex items-center gap-4 sticky top-0 z-50 shadow-md">
        <button onClick={() => navigate('/dashboard')} className="hover:opacity-80 transition-opacity">
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="text-xl font-bold">Sleep Tracker</h1>
      </nav>

      <main className="p-4 max-w-md mx-auto">
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

        {/* Sleep Trends Chart */}
        {chartData.length > 0 && (
          <section className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="size-5 text-[#1e293b]" />
              <h2 className="text-lg font-semibold text-[#1e293b]">Sleep Trends</h2>
            </div>
            
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full mt-4">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <ChartTooltip cursor={{ fill: '#f8fafc' }} content={<ChartTooltipContent />} />
                <Bar dataKey="hours" fill="var(--color-hours)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </section>
        )}

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
                    {log.hours.toFixed(1)} hrs
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