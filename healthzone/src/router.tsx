import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfileSettingsPage } from "./pages/ProfileSettingsPage";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { RecipesPage } from "./pages/RecipesPage";
import { CommunityPage } from "./pages/CommunityPage";

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
      Component: ProfileSettingsPage,
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
      path: "/community",
      Component: CommunityPage,
    },
  ],
  {
    basename: "/CSE442/2026-Spring/cse-442v/healthzone",
  }
);
