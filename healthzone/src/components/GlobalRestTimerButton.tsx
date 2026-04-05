import { Clock3 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatRestDuration, useRestTimer } from "./restTimer";

export function GlobalRestTimerButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { elapsedSeconds, isRunning } = useRestTimer();

  const isDashboard = location.pathname === "/" || location.pathname === "/dashboard";
  const rightClass = isDashboard ? "right-40 sm:right-48" : "right-4 sm:right-6";

  return (
    <button
      onClick={() => navigate("/rest-timer")}
      className={`fixed top-2.5 ${rightClass} z-[60] rounded-full border px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur transition-colors ${
        isRunning
          ? "border-[#d97706] bg-[#d97706] text-white hover:bg-[#b45309]"
          : "border-white/20 bg-[#1e293b]/90 text-white hover:bg-[#334155]"
      }`}
    >
      <span className="flex items-center gap-2">
        <Clock3 className="size-4" />
        <span>{isRunning ? formatRestDuration(elapsedSeconds) : "Rest Timer"}</span>
      </span>
    </button>
  );
}
