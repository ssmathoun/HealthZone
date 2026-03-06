import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePageMobile } from "./pages/ProfilePageMobile";
import { ProfilePage } from "./pages/ProfilePage";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { RecipesPage } from "./pages/RecipesPage";
import { CommunityPage } from "./pages/CommunityPage";
import { useEffect, useState } from "react";
import { useIsMobile } from "./hooks/useIsMobile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch("https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/profile.php", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      })
      .catch(() => {
        const hasCookie = document.cookie.split(";").some((c) => c.trim().startsWith("PHPSESSID="));
        setAuthenticated(hasCookie);
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#212b36] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#d9822b] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-white text-sm">Verifying Session...</p>
        </div>
      </div>
    );
  }

  // Use Navigate component instead of window.location.href to stay within HashRouter
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const isMobile = useIsMobile();
  
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/*"
          element={
            <AuthGuard>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route 
                  path="/profile" 
                  element={isMobile ? <ProfilePageMobile /> : <ProfilePage />} 
                />
                <Route path="/workouts" element={<WorkoutsPage />} />
                <Route path="/recipes" element={<RecipesPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthGuard>
          }
        />
      </Routes>
    </HashRouter>
  );
}