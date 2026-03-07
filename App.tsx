import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfileSettingsPage } from "./pages/ProfileSettingsPage";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { RecipesPage } from "./pages/RecipesPage";
import { CreateRecipePage } from "./pages/CreateRecipePage";
import { CreateWorkoutPage } from "./pages/CreateWorkoutPage";
import { LogMealPage } from "./pages/LogMealPage";
import { CommunityPage } from "./pages/CommunityPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { useEffect, useState } from "react";

const LOGIN_PATH = "/login";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch("https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/check_session.php", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn === true) {
          setAuthenticated(true);
        } else {
          window.location.hash = LOGIN_PATH;
        }
        setChecking(false);
      })
      .catch(() => {
        window.location.hash = LOGIN_PATH;
      });
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
      <Routes>
        {/* Public routes - no auth required */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes - auth required */}
        <Route path="/" element={<AuthGuard><DashboardPage /></AuthGuard>} />
        <Route path="/dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><ProfileSettingsPage /></AuthGuard>} />
        <Route path="/workouts" element={<AuthGuard><WorkoutsPage /></AuthGuard>} />
        <Route path="/recipes" element={<AuthGuard><RecipesPage /></AuthGuard>} />
        <Route path="/create-recipe" element={<AuthGuard><CreateRecipePage /></AuthGuard>} />
        <Route path="/create-workout" element={<AuthGuard><CreateWorkoutPage /></AuthGuard>} />
        <Route path="/log-meal" element={<AuthGuard><LogMealPage /></AuthGuard>} />
        <Route path="/community" element={<AuthGuard><CommunityPage /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
