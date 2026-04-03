import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatRestDuration, useRestTimer } from "../components/restTimer";

const API_URL = "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/rest_timer.php";

type RestLog = {
  id: number;
  duration_seconds: number;
  created_at: string;
};

export function RestTimerPage() {
  const navigate = useNavigate();
  const { elapsedSeconds, isRunning, resetTimer, startTimer } = useRestTimer();
  const [logs, setLogs] = useState<RestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<RestLog | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}?action=get_logs`, { credentials: "include" });
      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.logs)) {
        setLogs(data.logs);
        setError("");
      } else {
        setError(data.message || "Unable to load rest history.");
      }
    } catch {
      setError("Unable to load rest history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, []);

  const handleEndRest = async () => {
    const durationSeconds = Math.max(elapsedSeconds, 1);

    setSaving(true);
    setError("");
    resetTimer();

    try {
      const response = await fetch(`${API_URL}?action=log_rest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          duration_seconds: durationSeconds,
        }),
      });
      const data = await response.json();

      if (data.status === "success") {
        await fetchLogs();
      } else {
        setError(data.message || "Rest ended, but the log could not be saved.");
      }
    } catch {
      setError("Rest ended, but the log could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`${API_URL}?action=delete_log`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: pendingDelete.id }),
      });
      const data = await response.json();

      if (data.status === "success") {
        setLogs((current) => current.filter((log) => log.id !== pendingDelete.id));
        setPendingDelete(null);
      } else {
        setError(data.message || "Unable to delete rest log.");
      }
    } catch {
      setError("Unable to delete rest log.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate("/dashboard")} className="text-white p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="size-5" />
          </button>
          <button onClick={() => navigate("/dashboard")} className="font-semibold text-lg hover:opacity-80 transition-opacity">
            <span className="text-[#d97706]">Health</span><span className="text-white">Zone</span>
          </button>
          <div className="w-10" />
        </div>
      </nav>

      <main className="px-4 py-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Clock3 className="size-5 text-[#d97706]" />
            <h1 className="text-xl font-semibold text-[#1e293b]">Rest Timer</h1>
          </div>

          <div className="text-center mb-6">
            <div className="text-6xl sm:text-7xl font-bold tracking-tight text-[#1e293b] mb-3">
              {formatRestDuration(elapsedSeconds)}
            </div>
            <p className="text-sm text-[#64748b]">
              {isRunning ? "Your rest timer is running. End rest to log this interval." : "Start tracking your rest between sets."}
            </p>
          </div>

          <div className="space-y-3">
            {!isRunning ? (
              <button
                onClick={startTimer}
                className="w-full bg-[#d97706] text-white py-3 rounded-xl font-bold hover:bg-[#b45309] transition-colors"
              >
                Track Rest
              </button>
            ) : (
              <button
                onClick={() => void handleEndRest()}
                disabled={saving}
                className="w-full bg-[#1e293b] text-white py-3 rounded-xl font-bold hover:bg-[#334155] transition-colors disabled:opacity-60"
              >
                {saving ? "Ending Rest..." : "End Rest"}
              </button>
            )}
          </div>

          {error && <p className="text-sm text-red-600 mt-4 text-center">{error}</p>}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Logged Rest Times</h2>
          {loading ? (
            <p className="text-sm text-[#64748b] text-center py-6">Loading rest logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-[#64748b] text-center py-6">No rest times logged yet.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1e293b]">Rest #{index + 1}</p>
                    <p className="text-xs text-[#64748b]">
                      {new Date(log.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#d97706]/10 px-3 py-1 text-sm font-semibold text-[#d97706]">
                      {formatRestDuration(Number(log.duration_seconds))}
                    </span>
                    <button
                      onClick={() => setPendingDelete(log)}
                      className="text-[#64748b] hover:text-red-600 transition-colors"
                      aria-label={`Delete rest log ${index + 1}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {pendingDelete && (
        <div
          className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-[#1e293b] mb-2">Confirm Delete Rest Time</h2>
            <p className="text-sm text-[#64748b] mb-6">This rest entry will be removed from your history.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 border border-gray-300 text-[#1e293b] py-2.5 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
