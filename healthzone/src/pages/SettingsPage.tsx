import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Download } from "lucide-react";

const API_BASE =
  "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php";

export function SettingsPage() {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exportingLogs, setExportingLogs] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [exportError, setExportError] = useState(false);

  const formatDateTime = (raw: unknown): string => {
    if (!raw) return "N/A";
    const d = new Date(String(raw).replace(" ", "T") + "Z");
    if (isNaN(d.getTime())) return String(raw);
    return (
      d.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }) +
      " at " +
      d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  };

  const formatActivityLogs = (logs: Record<string, unknown>): string => {
    const lines: string[] = [];
    const divider = "=".repeat(60);
    const subDivider = "-".repeat(40);

    lines.push("HEALTHZONE - USER ACTIVITY LOGS");
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(divider);

    // Profile
    const profile = logs.profile as Record<string, string> | null;
    if (profile) {
      lines.push("");
      lines.push("PROFILE");
      lines.push(subDivider);
      lines.push(`Username : ${profile.username ?? "N/A"}`);
      lines.push(`Email    : ${profile.email ?? "N/A"}`);
    }

    // Points
    const points = logs.points as Record<string, unknown> | null;
    if (points) {
      lines.push("");
      lines.push("POINTS");
      lines.push(subDivider);
      lines.push(`Total Points : ${points.total_points ?? 0}`);
    }

    // Workouts
    const workouts = logs.workouts as Record<string, unknown>[];
    lines.push("");
    lines.push(`COMPLETED WORKOUTS (${workouts?.length ?? 0} total)`);
    lines.push(subDivider);
    if (workouts?.length) {
      workouts.forEach((w, i) => {
        lines.push(`${i + 1}. ${w.name}`);
        lines.push(`   Difficulty : ${w.difficulty}`);
        lines.push(`   Duration   : ${w.duration_min} min`);
        lines.push(`   Calories   : ${w.calories_burned} kcal`);
        if (w.completed_at)
          lines.push(`   Date       : ${formatDateTime(w.completed_at)}`);
      });
    } else {
      lines.push("No workouts logged.");
    }

    // Meals
    const meals = logs.meals as Record<string, unknown>[];
    lines.push("");
    lines.push(`MEALS (${meals?.length ?? 0} total)`);
    lines.push(subDivider);
    if (meals?.length) {
      meals.forEach((m, i) => {
        lines.push(`${i + 1}. ${m.name} (${m.meal_type})`);
        lines.push(
          `   Calories : ${m.calories} kcal | Protein: ${m.protein}g | Carbs: ${m.carbs}g | Fat: ${m.fat}g`,
        );
        lines.push(`   Date     : ${formatDateTime(m.logged_at)}`);
      });
    } else {
      lines.push("No meals logged.");
    }

    // Weight
    const weight = logs.weight as Record<string, unknown>[];
    lines.push("");
    lines.push(`WEIGHT LOGS (${weight?.length ?? 0} entries)`);
    lines.push(subDivider);
    if (weight?.length) {
      weight.forEach((w, i) => {
        lines.push(
          `${i + 1}. ${w.weight_lbs} lbs  —  ${formatDateTime(w.logged_at)}`,
        );
      });
    } else {
      lines.push("No weight entries logged.");
    }

    // Sleep
    const sleep = logs.sleep as Record<string, unknown>[];
    lines.push("");
    lines.push(`SLEEP LOGS (${sleep?.length ?? 0} entries)`);
    lines.push(subDivider);
    if (sleep?.length) {
      sleep.forEach((s, i) => {
        const h = parseFloat(String(s.hours ?? 0));
        const hrs = Math.floor(h);
        const mins = Math.round((h - hrs) * 60);
        lines.push(
          `${i + 1}. ${hrs}h ${mins}m  —  ${formatDateTime(s.created_at)}`,
        );
      });
    } else {
      lines.push("No sleep entries logged.");
    }

    // Rest Timer
    const rest = logs.rest_timer as Record<string, unknown>[];
    lines.push("");
    lines.push(`REST TIMER SESSIONS (${rest?.length ?? 0} entries)`);
    lines.push(subDivider);
    if (rest?.length) {
      rest.forEach((r, i) => {
        const secs = Number(r.duration_seconds ?? 0);
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        lines.push(`${i + 1}. ${m}m ${s}s  —  ${formatDateTime(r.created_at)}`);
      });
    } else {
      lines.push("No rest timer sessions logged.");
    }

    // Recipes
    const recipes = logs.recipes as Record<string, unknown>[];
    lines.push("");
    lines.push(`SAVED RECIPES (${recipes?.length ?? 0} total)`);
    lines.push(subDivider);
    if (recipes?.length) {
      recipes.forEach((r, i) => {
        lines.push(`${i + 1}. ${r.name} (${r.category})`);
        lines.push(
          `   Calories : ${r.calories} kcal | Protein: ${r.protein}g | Carbs: ${r.carbs}g | Fat: ${r.fat}g`,
        );
        lines.push(`   Prep Time: ${r.prep_time}  |  Servings: ${r.servings}`);
        lines.push(`   Created  : ${formatDateTime(r.created_at)}`);
      });
    } else {
      lines.push("No recipes saved.");
    }

    // Challenges
    const challenges = logs.challenges as Record<string, unknown>[];
    lines.push("");
    lines.push(`CHALLENGES (${challenges?.length ?? 0} joined)`);
    lines.push(subDivider);
    if (challenges?.length) {
      challenges.forEach((c, i) => {
        lines.push(`${i + 1}. ${c.name}  [${c.status}]`);
        lines.push(
          `   Progress : ${c.progress} / ${c.target_value} ${c.unit_label}`,
        );
        lines.push(`   Points   : ${c.points_reward}`);
        lines.push(`   Joined   : ${formatDateTime(c.joined_at)}`);
      });
    } else {
      lines.push("No challenges joined.");
    }

    // Scheduled Workouts
    const scheduled = logs.scheduled_workouts as Record<string, unknown>[];
    lines.push("");
    lines.push(`SCHEDULED WORKOUTS (${scheduled?.length ?? 0} total)`);
    lines.push(subDivider);
    if (scheduled?.length) {
      scheduled.forEach((s, i) => {
        lines.push(
          `${i + 1}. ${s.name} (${s.difficulty})  —  ${formatDateTime(s.scheduled_date)}`,
        );
      });
    } else {
      lines.push("No scheduled workouts.");
    }

    lines.push("");
    lines.push(divider);
    lines.push("End of report.");
    return lines.join("\n");
  };

  const handleExportLogs = async () => {
    setExportingLogs(true);
    setExportMessage("");
    setExportError(false);
    try {
      const response = await fetch(`${API_BASE}/activity_logs.php`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();

      if (result.status !== "success") {
        setExportError(true);
        setExportMessage(result.message || "Failed to retrieve logs.");
        return;
      }

      const content = formatActivityLogs(result.logs);
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `healthzone_activity_logs_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportError(false);
      setExportMessage("Activity logs downloaded successfully!");
    } catch (error) {
      setExportError(true);
      setExportMessage(
        "Network error. Please check your VPN connection and try again.",
      );
    } finally {
      setExportingLogs(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!passwords.oldPassword) {
      setIsError(true);
      setMessage("Current password is required.");
      return;
    }
    if (!passwords.newPassword) {
      setIsError(true);
      setMessage("New password is required.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setIsError(true);
      setMessage("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const params = new URLSearchParams();
      params.append("oldPassword", passwords.oldPassword);
      params.append("newPassword", passwords.newPassword);
      params.append("confirmNewPassword", passwords.confirmNewPassword);

      const response = await fetch(`${API_BASE}/settings.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        setIsError(false);
        setMessage(result.message);
        setPasswords({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } else {
        setIsError(true);
        setMessage(result.message || "An error occurred.");
      }
    } catch (error) {
      setIsError(true);
      console.error("Password reset error:", error);
      setMessage(
        "Network error. Please check your VPN connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white p-2 hover:bg-white/10 rounded-full"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            <span className="text-[#d97706]">Health</span>
            <span className="text-white">Zone</span>
          </button>
          <div className="w-10"></div>
        </div>
      </nav>

      <main className="px-4 py-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1e293b] mb-6">Settings</h1>

        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-base font-semibold text-[#1e293b] mb-2">
            Export Activity Data
          </h2>
          <p className="text-sm text-[#64748b] mb-4">
            Download a complete record of all your workouts, meals, weight,
            sleep, rest sessions, recipes, and challenges.
          </p>
          {exportMessage && (
            <p
              className={`text-sm font-medium mb-3 ${exportError ? "text-red-500" : "text-green-600"}`}
            >
              {exportMessage}
            </p>
          )}
          <button
            type="button"
            onClick={handleExportLogs}
            disabled={exportingLogs}
            className="w-full py-3 rounded-lg font-medium bg-[#1e293b] text-white hover:bg-[#0f172a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Download className="size-4" />
            {exportingLogs
              ? "Retrieving Logs..."
              : "Retrieve All User Activity Logs"}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-base font-semibold text-[#1e293b] mb-4">
            Reset Password
          </h2>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">
                Current Password
              </label>
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-[#64748b] shrink-0" />
                <input
                  type="password"
                  value={passwords.oldPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, oldPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">
                New Password
              </label>
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-[#64748b] shrink-0" />
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">
                Confirm New Password
              </label>
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-[#64748b] shrink-0" />
                <input
                  type="password"
                  value={passwords.confirmNewPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmNewPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]"
                />
              </div>
            </div>

            {message && (
              <p
                className={`text-sm font-medium ${isError ? "text-red-500" : "text-green-600"}`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-lg font-medium bg-[#d97706] text-white hover:bg-[#b45309] transition-colors disabled:opacity-60"
            >
              {saving ? "Saving..." : "Update Password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
