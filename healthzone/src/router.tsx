import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { RecipesPage } from "./pages/RecipesPage";
import { CalendarPage } from "./pages/CalendarPage";
import { CommunityPage } from "./pages/CommunityPage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      Component: LandingPage,
    },
    {
      path: "/dashboard",
      Component: DashboardPage,
    },
    {
      path: "/profile",
      Component: ProfilePage,
    },
    {
      path: "/workouts",
      Component: WorkoutsPage,
    },
    {
      path: "/recipes",
      Component: RecipesPage,
    },
    {
      path: "/calendar",
      Component: CalendarPage,
    },
    {
      path: "/community",
      Component: CommunityPage,
    },
    {
      path: "/settings",
      Component: SettingsPage,
    },
  ],
  {
    basename: "/CSE442/2026-Spring/cse-442v/healthzone",
  },
);
