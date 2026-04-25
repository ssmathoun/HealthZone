import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scale, Plus } from "lucide-react";
import { SafeTrendChart } from "../components/SafeTrendChart";

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
        if (data.status === "success" && Array.isArray(data.logs)) {
          setLogs(data.logs);
          return;
        }

        setLogs([]);
      })
      .catch(() => setLogs([]))
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

  const latest = logs.length ? logs[logs.length - 1].weight_lbs : null;
  const earliest = logs.length > 1 ? logs[0].weight_lbs : null;
  const change =
    latest !== null && earliest !== null
      ? +(latest - earliest).toFixed(1)
      : null;
  const chartData = logs.reduce<{ label: string; value: number }[]>(
    (points, log) => {
      const loggedAt = new Date(log.logged_at);

      if (Number.isNaN(loggedAt.getTime()) || !Number.isFinite(log.weight_lbs)) {
        return points;
      }

      points.push({
        label: loggedAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: Number(log.weight_lbs),
      });

      return points;
    },
    [],
  );

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

        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#1e293b]">
                Weight Trend
              </h2>
              <p className="text-xs text-[#64748b] mt-1">
                Visualize your weight changes without risking a page crash.
              </p>
            </div>
            <span className="text-xs font-medium text-[#d97706] bg-[#d97706]/10 px-2.5 py-1 rounded-full">
              {activeTimeframe.label}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
            {TIMEFRAMES.map((timeframe) => {
              const isActive = timeframe.days === activeTimeframe.days;

              return (
                <button
                  key={timeframe.days}
                  type="button"
                  onClick={() => setActiveTimeframe(timeframe)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-[#d97706] text-white"
                      : "bg-[#f8fafc] text-[#64748b] hover:bg-[#d97706]/10 hover:text-[#d97706]"
                  }`}
                >
                  {timeframe.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-[#f8fafc] text-sm text-[#64748b]">
              Loading weight trend...
            </div>
          ) : (
            <SafeTrendChart
              data={chartData}
              emptyMessage="Log your first weight entry to see the trend here."
              valueFormatter={(value) => `${value.toFixed(1)} lbs`}
            />
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

        {/* Entries */}
        {logs.length > 0 ? (
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
        ) : !loading ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-sm text-[#64748b]">
            No weight entries yet. Add one above and the chart will update
            automatically.
          </div>
        ) : null}
      </main>
    </div>
  );
}
