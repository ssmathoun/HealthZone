import { createContext, useContext } from "react";

export type RestTimerContextValue = {
  elapsedSeconds: number;
  isRunning: boolean;
  startTimer: () => void;
  resetTimer: () => void;
};

export const RestTimerContext = createContext<RestTimerContextValue | null>(null);

export function formatRestDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useRestTimer() {
  const context = useContext(RestTimerContext);

  if (!context) {
    throw new Error("useRestTimer must be used within RestTimerProvider");
  }

  return context;
}
