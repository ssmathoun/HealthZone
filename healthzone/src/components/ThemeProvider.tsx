import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ThemeContext, type Theme } from "../context/theme-context";

const STORAGE_KEY = "healthzone-theme";

const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    applyTheme(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures so the app still renders in restricted browsers.
    }
  }, [theme]);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
  };

  const toggleTheme = () => {
    setThemeState((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark",
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
