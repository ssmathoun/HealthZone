import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePageMobile } from "./pages/ProfilePageMobile";
import { ProfilePage } from "./pages/ProfilePage";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { RecipesPage } from "./pages/RecipesPage";
import { CommunityPage } from "./pages/CommunityPage";
import { CalendarPage } from "./pages/CalendarPage";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import { CreateRecipePage } from "./pages/CreateRecipePage";
import { CreateWorkoutPage } from "./pages/CreateWorkoutPage";
import { LogMealPage } from "./pages/LogMealPage";
import { SleepPage } from "./pages/SleepPage";
import { RestTimerPage } from "./pages/RestTimerPage";
import { SettingsPage } from "./pages/SettingsPage";
import { WeightTrackerPage } from "./pages/WeightTrackerPage";
import { GlobalRestTimerButton } from "./components/GlobalRestTimerButton";
import { RestTimerProvider } from "./components/RestTimerProvider";
import { useEffect, useState } from "react";
import { useIsMobile } from "./hooks/useIsMobile";
import { BookmarksPage } from "./pages/BookmarksPage";
import { ContactPage } from "./pages/ContactPage";
import { TrainerDirectoryPage } from "./pages/TrainerDirectoryPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { GroupForumPage } from "./pages/GroupForumPage";
import { ActivitiesPage } from "./pages/ActivitiesPage";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch(
      "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/profile.php",
      {
        credentials: "include",
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      })
      .catch(() => {
        const hasCookie = document.cookie
          .split(";")
          .some((c) => c.trim().startsWith("PHPSESSID="));
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
              <RestTimerProvider>
                <GlobalRestTimerButton />
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
                  <Route path="/forum" element={<CommunityPage />} />
                  <Route path="/community/group/:groupSlug" element={<GroupForumPage />} />
                  <Route path="/forum/group/:groupSlug" element={<GroupForumPage />} />
                  <Route path="/create-recipe" element={<CreateRecipePage />} />
                  <Route path="/create-workout" element={<CreateWorkoutPage />} />
                  <Route path="/log-meal" element={<LogMealPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/activities" element={<ActivitiesPage />} />
                  <Route path="/sleep" element={<SleepPage />} />
                  <Route path="/rest-timer" element={<RestTimerPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/weight-tracker" element={<WeightTrackerPage />} />
                  <Route path="/log-workout" element={<WorkoutsPage />} />
                  <Route path="/bookmarks" element={<BookmarksPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/trainers" element={<TrainerDirectoryPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                </Routes>
              </RestTimerProvider>
            </AuthGuard>
          }
        />
      </Routes>
    </HashRouter>
  );
}
