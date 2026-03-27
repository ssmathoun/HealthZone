import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scale, Plus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const API_BASE =
  "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php";

type WeightLog = {
  id: number;
  weight_lbs: number;
  logged_at: string;
};

type Timeframe = { label: string; days: number };

const TIMEFRAMES: Timeframe[] = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
];

function formatDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  if (days <= 7) {
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function WeightTrackerPage() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>(
    TIMEFRAMES[1],
  );

  const [weightInput, setWeightInput] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchLogs = (days: number) => {
    setLoading(true);
    fetch(`${API_BASE}/weight_tracker.php?days=${days}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setLogs(data.logs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs(activeTimeframe.days);
  }, [activeTimeframe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      setError("Please enter a valid weight.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/weight_tracker.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ weight_lbs: weight }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setWeightInput("");
        setSuccessMsg("Weight logged!");
        fetchLogs(activeTimeframe.days);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setError(data.message || "Failed to log weight.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Chart data — use numeric index as x key so each dot is always unique,
  // even when multiple entries share the same formatted date string.
  const chartData = logs.map((l, i) => ({
    index: i,
    label: formatDate(l.logged_at, activeTimeframe.days),
    fullDate: new Date(l.logged_at).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: new Date(l.logged_at).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    weight: l.weight_lbs,
  }));

  const weights = logs.map((l) => l.weight_lbs);
  const minWeight = weights.length ? Math.min(...weights) : 0;
  const maxWeight = weights.length ? Math.max(...weights) : 0;
  const latest = logs.length ? logs[logs.length - 1].weight_lbs : null;
  const earliest = logs.length > 1 ? logs[0].weight_lbs : null;
  const change =
    latest !== null && earliest !== null
      ? +(latest - earliest).toFixed(1)
      : null;
  const yMin = weights.length ? Math.floor(minWeight - 5) : 0;
  const yMax = weights.length ? Math.ceil(maxWeight + 5) : 300;

  // Dynamic x-axis: pick ~6 evenly-spaced tick indices
  const MAX_X_TICKS = 6;
  const tickIndices: number[] = (() => {
    const n = chartData.length;
    if (n <= MAX_X_TICKS) return chartData.map((_, i) => i);
    const step = (n - 1) / (MAX_X_TICKS - 1);
    return Array.from({ length: MAX_X_TICKS }, (_, i) => Math.round(i * step));
  })();

  // Zoom transition on timeframe change
  const [chartVisible, setChartVisible] = useState(true);
  const prevTf = useRef(activeTimeframe.label);
  useEffect(() => {
    if (prevTf.current !== activeTimeframe.label) {
      setChartVisible(false);
      const t = setTimeout(() => {
        setChartVisible(true);
        prevTf.current = activeTimeframe.label;
      }, 160);
      return () => clearTimeout(t);
    }
  }, [activeTimeframe]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#1e293b] text-white px-3 py-2 rounded-lg text-xs shadow-lg">
          <p className="font-semibold">{d.weight} lbs</p>
          <p className="text-[#94a3b8]">{d.fullDate}</p>
          <p className="text-[#94a3b8]">{d.time}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      {/* Nav */}
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white p-2 hover:bg-white/10 rounded-full"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <Scale className="size-5 text-[#d97706]" />
            <span className="text-white font-semibold text-base">
              Weight Tracker
            </span>
          </div>
          <div className="w-9" />
        </div>
      </nav>

      <main className="px-4 py-4 max-w-2xl mx-auto">
        {/* Log Weight Form */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-base font-semibold text-[#1e293b] mb-3">
            Log Today's Weight
          </h2>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="number"
                step="0.1"
                min="1"
                max="1500"
                placeholder="e.g. 175.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748b]">
                lbs
              </span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#d97706] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-60"
            >
              <Plus className="size-4" />
              {submitting ? "Saving..." : "Log"}
            </button>
          </form>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          {successMsg && (
            <p className="text-green-600 text-xs mt-2">{successMsg}</p>
          )}
        </div>

        {/* Summary Stats */}
        {latest !== null && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-md p-3 text-center">
              <p className="text-[10px] text-[#64748b] mb-1">Current</p>
              <p className="text-lg font-bold text-[#1e293b]">{latest}</p>
              <p className="text-[10px] text-[#64748b]">lbs</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 text-center">
              <p className="text-[10px] text-[#64748b] mb-1">Change</p>
              <p
                className={`text-lg font-bold ${
                  change === null
                    ? "text-[#64748b]"
                    : change < 0
                      ? "text-green-600"
                      : change > 0
                        ? "text-red-500"
                        : "text-[#1e293b]"
                }`}
              >
                {change === null ? "—" : `${change > 0 ? "+" : ""}${change}`}
              </p>
              <p className="text-[10px] text-[#64748b]">lbs</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 text-center">
              <p className="text-[10px] text-[#64748b] mb-1">Entries</p>
              <p className="text-lg font-bold text-[#1e293b]">{logs.length}</p>
              <p className="text-[10px] text-[#64748b]">
                {activeTimeframe.label}
              </p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#1e293b]">Progress</h2>
            <div className="flex gap-1 bg-[#f1f5f9] rounded-lg p-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.label}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                    activeTimeframe.label === tf.label
                      ? "bg-[#d97706] text-white shadow-sm"
                      : "text-[#64748b] hover:text-[#1e293b]"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length < 2 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Scale className="size-10 text-[#cbd5e1] mb-3" />
              <p className="text-sm text-[#64748b]">
                {logs.length === 0
                  ? "No entries yet. Log your first weight above!"
                  : "Log at least 2 entries to see your progress chart."}
              </p>
            </div>
          ) : (
            <div
              className="transition-all duration-150 ease-in-out"
              style={{
                opacity: chartVisible ? 1 : 0,
                transform: chartVisible ? "scale(1)" : "scale(0.97)",
              }}
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  key={activeTimeframe.label}
                  data={chartData}
                  margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="index"
                    type="number"
                    domain={[0, chartData.length - 1]}
                    ticks={tickIndices}
                    tickFormatter={(i) => chartData[i]?.label ?? ""}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[yMin, yMax]}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {change !== null && (
                    <ReferenceLine
                      y={earliest!}
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      strokeWidth={1}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#d97706"
                    strokeWidth={2.5}
                    dot={{ fill: "#d97706", r: 3.5, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#d97706", strokeWidth: 0 }}
                    isAnimationActive={true}
                    animationDuration={500}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Entries */}
        {logs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-base font-semibold text-[#1e293b] mb-3">
              Entries
            </h2>
            <div className="space-y-2">
              {[...logs]
                .reverse()
                .slice(0, 20)
                .map((log) => {
                  const d = new Date(log.logged_at);
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <span className="text-sm text-[#64748b]">
                          {d.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-xs text-[#94a3b8] ml-2">
                          {d.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[#1e293b]">
                        {log.weight_lbs} lbs
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
