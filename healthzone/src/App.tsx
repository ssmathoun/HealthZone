import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { RecipesPage } from "./pages/RecipesPage";
import { CommunityPage } from "./pages/CommunityPage";
import { CalendarPage } from "./pages/CalendarPage"; // <-- IMPORT ADDED HERE
import { useEffect, useState } from "react";

const LOGIN_URL =
  "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/healthzone/#/login";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user has a session by calling the PHP backend
    // Updated to use your profile.php endpoint which confirms if user is logged in
    fetch(
      "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/profile.php",
      {
        credentials: "include",
      },
    )
      .then((res) => res.json())
      .then((data) => {
        // If the backend returns a success status, the session is valid
        if (data.status === "success") {
          setAuthenticated(true);
        } else {
          window.location.href = LOGIN_URL;
        }
      })
      .catch(() => {
        // Fallback: strictly check for the existence of the PHP Session ID cookie
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
          <p className="text-[#64748b] text-sm">Verifying Session...</p>
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/calendar" element={<CalendarPage />} />{" "}
          {/* <-- ROUTE ADDED HERE */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGuard>
    </HashRouter>
  );
}
