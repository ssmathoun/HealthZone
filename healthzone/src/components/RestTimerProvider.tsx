import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { RestTimerContext, type RestTimerContextValue } from "./restTimer";

const REST_TIMER_COOKIE_NAME = "healthzone_rest_started_at";
const REST_TIMER_COOKIE_MAX_AGE = 60 * 60 * 12;

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const parts = document.cookie.split(";").map((value) => value.trim());
  const match = parts.find((value) => value.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

function writeCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${REST_TIMER_COOKIE_MAX_AGE}; samesite=lax`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

function getCookieStartTime(): number | null {
  const raw = readCookie(REST_TIMER_COOKIE_NAME);
  const parsed = raw ? Number(raw) : NaN;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function RestTimerProvider({ children }: { children: ReactNode }) {
  const [startedAt, setStartedAt] = useState<number | null>(() => getCookieStartTime());
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [startedAt]);

  useEffect(() => {
    const syncFromCookie = () => {
      setStartedAt(getCookieStartTime());
      setNow(Date.now());
    };

    window.addEventListener("focus", syncFromCookie);
    return () => {
      window.removeEventListener("focus", syncFromCookie);
    };
  }, []);

  const value = useMemo<RestTimerContextValue>(() => {
    const elapsedSeconds = startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;

    return {
      elapsedSeconds,
      isRunning: startedAt !== null,
      startTimer: () => {
        if (startedAt !== null) {
          return;
        }

        const stamp = Date.now();
        setStartedAt(stamp);
        setNow(stamp);
        writeCookie(REST_TIMER_COOKIE_NAME, String(stamp));
      },
      resetTimer: () => {
        setStartedAt(null);
        setNow(Date.now());
        deleteCookie(REST_TIMER_COOKIE_NAME);
      },
    };
  }, [now, startedAt]);

  return <RestTimerContext.Provider value={value}>{children}</RestTimerContext.Provider>;
}
