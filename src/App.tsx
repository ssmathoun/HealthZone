import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { CalendarPage } from "./pages/CalendarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfileSettingsPage } from "./pages/ProfileSettingsPage";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { RecipesPage } from "./pages/RecipesPage";
import { CommunityPage } from "./pages/CommunityPage";
import { useEffect, useState } from "react";

const LOGIN_URL =
  "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/jaspreet/#/login";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user has a session by calling the PHP backend
    fetch(
      "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/check_session.php",
      {
        credentials: "include",
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn) {
          setAuthenticated(true);
        } else {
          window.location.href = LOGIN_URL;
        }
      })
      .catch(() => {
        // If the session check endpoint doesn't exist yet, fall back to cookie check
        const hasCookie = document.cookie
          .split(";")
          .some((c) => c.trim().startsWith("PHPSESSID="));
        if (hasCookie) {
          setAuthenticated(true);
        } else {
          window.location.href = LOGIN_URL;
        }
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-[#64748b] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;
  return <>{children}</>;
}

export default function App() {
  return (
    <HashRouter>
      <AuthGuard>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfileSettingsPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGuard>
    </HashRouter>
  );
}
