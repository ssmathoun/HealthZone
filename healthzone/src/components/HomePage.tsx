import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Heart,
  Dumbbell,
  Moon,
  Plus,
  UtensilsCrossed,
  LogOut,
  User,
  Settings,
  Scale,
  Bell,
  BookOpen,
  Users,
  Trophy,
  Calendar,
  ArrowLeft,
  X,
  Flame,
  MessageCircle,
  MapPin,
  Star,
} from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();

  // =========================================================================
  // WORKOUT LOGGER STATE & API INTEGRATION
  // =========================================================================
  const [trainerWorkouts, setTrainerWorkouts] = useState<any[]>([]);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [workoutInProgress, setWorkoutInProgress] = useState(false);
  const [completedSets, setCompletedSets] = useState<{
    [key: string]: boolean;
  }>({});
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  // =========================================================================
  // NUTRITION STATS (TODAY) — fetched from backend
  // =========================================================================
  const NUTRITION_URL =
    "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/nutrition_today.php";

  type NutritionToday = {
    goals: { calories: number; protein: number; carbs: number; fat: number };
    consumed: { calories: number; protein: number; carbs: number; fat: number };
    percent: { calories: number; protein: number; carbs: number; fat: number };
  };

  const [nutrition, setNutrition] = useState<NutritionToday | null>(null);
  const [nutritionLoading, setNutritionLoading] = useState(true);

  // Sleep tracking
  const SLEEP_URL =
    "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/sleep.php";
  const [latestSleep, setLatestSleep] = useState<number>(0);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // =========================================================================
  // LEADERBOARD & CHALLENGES STATE
  // =========================================================================
  const LEADERBOARD_URL =
    "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/leaderboard.php";
  const CHALLENGES_URL =
    "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/challenges.php";

  type LeaderboardEntry = {
    id: number;
    username: string;
    total_points: number;
  };
  type Challenge = {
    challenge_id: number;
    name: string;
    description: string;
    icon_name: string;
    metric_key: string;
    target_value: number;
    unit_label: string;
    points_reward: number;
    progress: number;
    progress_percent: number;
    progress_text: string;
    participant_count: number;
    status: string;
    is_joined: boolean;
  };

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myPoints, setMyPoints] = useState(0);
  const [myUsername, setMyUsername] = useState("You");
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // =========================================================================
  // MEAL STATE — fetched from backend, no local modal needed
  // =========================================================================
  const [loggedMeals, setLoggedMeals] = useState<any[]>([]);

  // Fetch Workouts from your actual Database API
  useEffect(() => {
    fetch(
      "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/workouts.php?action=get_premade_workouts",
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTrainerWorkouts(data);
        }
      })
      .catch((err) => console.error("Error fetching workouts:", err));

    // Fetch nutrition stats for today
    fetch(NUTRITION_URL, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.consumed) {
          setNutrition(data);
        }
      })
      .catch(() => {})
      .finally(() => setNutritionLoading(false));

    // Fetch today's meals from backend
    fetch(
      "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/meals.php?action=get_meals",
      { credentials: "include" },
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLoggedMeals(data);
        }
      })
      .catch(() => {});

    // Fetch latest sleep log
    fetch(`${SLEEP_URL}?action=get_history`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLatestSleep(Number(data[0].hours));
        }
      })
      .catch(() => {});

    // Fetch latest weight entry
    fetch(
      "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/weight_tracker.php?days=3650",
      { credentials: "include" },
    )
      .then((res) => res.json())
      .then((data) => {
        if (
          data.status === "success" &&
          Array.isArray(data.logs) &&
          data.logs.length > 0
        ) {
          setLatestWeight(data.logs[data.logs.length - 1].weight_lbs);
        }
      })
      .catch(() => {});

    // Fetch unread notification count
    fetch(
      "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/notifications.php?action=unread_count",
      { credentials: "include" },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.count !== undefined) setUnreadCount(data.count);
      })
      .catch(() => {});

    // Fetch leaderboard
    fetch(LEADERBOARD_URL, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setLeaderboard(data.leaderboard || []);
          setMyRank(data.my_rank ?? null);
          setMyPoints(data.my_points || 0);
          setMyUsername(data.my_username || "You");
        }
      })
      .catch(() => {});

    // Fetch challenges
    fetch(`${CHALLENGES_URL}?action=get_available_challenges`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setChallenges(data);
      })
      .catch(() => {});
  }, []);

  // Post the completed workout to the Database API
  const handleFinishWorkout = async () => {
    try {
      const response = await fetch(
        "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/workouts.php?action=finish_workout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workout_id: selectedWorkout.id,
            user_id: 1, // Fallback if session isn't carrying over during dev
          }),
        },
      );

      const data = await response.json();

      if (data.status === "success") {
        setWorkoutComplete(true);
        // Refresh challenges and leaderboard — workout completion may award points
        Promise.all([
          fetch(`${CHALLENGES_URL}?action=get_available_challenges`, {
            credentials: "include",
          }).then((r) => r.json()),
          fetch(LEADERBOARD_URL, { credentials: "include" }).then((r) =>
            r.json(),
          ),
        ])
          .then(([challengesData, leaderboardData]) => {
            if (Array.isArray(challengesData)) setChallenges(challengesData);
            if (leaderboardData.status === "success") {
              setLeaderboard(leaderboardData.leaderboard || []);
              setMyRank(leaderboardData.my_rank ?? null);
              setMyPoints(leaderboardData.my_points || 0);
              setMyUsername(leaderboardData.my_username || "You");
            }
          })
          .catch(() => {});
      } else {
        alert("Failed to log workout: " + data.message);
      }
    } catch (error) {
      console.error("Error logging workout:", error);
      alert("Something went wrong connecting to the server.");
    }
  };

  const resetWorkout = () => {
    setSelectedWorkout(null);
    setWorkoutInProgress(false);
    setCompletedSets({});
    setWorkoutComplete(false);
    setShowWorkoutModal(false);
  };

  // =========================================================================
  // COMPUTED STATS — uses real nutrition API data with fallback defaults
  // =========================================================================
  const stats = nutrition
    ? {
        caloriesConsumed: nutrition.consumed.calories,
        caloriesGoal: nutrition.goals.calories,
        proteinsConsumed: nutrition.consumed.protein,
        proteinsGoal: nutrition.goals.protein,
      }
    : {
        caloriesConsumed: loggedMeals.reduce(
          (s, m) => s + (parseInt(m.calories) || 0),
          0,
        ),
        caloriesGoal: 2400,
        proteinsConsumed: loggedMeals.reduce(
          (s, m) => s + (parseInt(m.protein) || 0),
          0,
        ),
        proteinsGoal: 180,
      };

  const ICON_EMOJI: Record<string, string> = {
    flame: "🔥",
    activity: "⚡",
    dumbbell: "💪",
    trophy: "🏆",
    heart: "❤️",
    star: "⭐",
  };

  const handleJoinChallenge = async (challengeId: number) => {
    try {
      const res = await fetch(`${CHALLENGES_URL}?action=join`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_id: challengeId }),
      });
      const data = await res.json();
      if (data.status === "success") {
        const updated = await fetch(
          `${CHALLENGES_URL}?action=get_available_challenges`,
          { credentials: "include" },
        ).then((r) => r.json());
        if (Array.isArray(updated)) setChallenges(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      {/* Navigation */}
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate("/dashboard")}
            className="font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            <span className="text-[#d97706]">Health</span>
            <span className="text-white">Zone</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              className="text-white p-2 hover:bg-white/10 rounded-full"
              onClick={() => navigate("/profile")}
            >
              <User className="size-5" />
            </button>
            <button
              className="text-white p-2 hover:bg-white/10 rounded-full relative"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button
              className="text-white p-2 hover:bg-white/10 rounded-full"
              onClick={() => navigate("/settings")}
            >
              <Settings className="size-5" />
            </button>
            <button
              className="text-white p-2 hover:bg-white/10 rounded-full"
              onClick={() => {
                fetch(
                  "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/logout.php",
                  { method: "POST", credentials: "include" },
                ).finally(() => {
                  window.location.hash = "/login";
                });
              }}
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 py-4 max-w-4xl mx-auto">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1e293b] mb-1">
            Welcome back! 💪
          </h1>
          <p className="text-[#64748b] text-xs sm:text-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Stats Grid — Calories & Protein from backend, Workouts from DB */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard
            icon={<Activity className="size-5 text-[#d97706]" />}
            label="Calories"
            value={stats.caloriesConsumed}
            goal={stats.caloriesGoal}
            percentage={
              stats.caloriesGoal > 0
                ? Math.round(
                    (stats.caloriesConsumed / stats.caloriesGoal) * 100,
                  )
                : 0
            }
          />
          <StatCard
            icon={<Heart className="size-5 text-[#d97706]" />}
            label="Protein"
            value={stats.proteinsConsumed}
            goal={stats.proteinsGoal}
            percentage={
              stats.proteinsGoal > 0
                ? Math.round(
                    (stats.proteinsConsumed / stats.proteinsGoal) * 100,
                  )
                : 0
            }
          />
          <button
            onClick={() => setShowWorkoutModal(true)}
            className="bg-white rounded-lg shadow-md p-2.5 sm:p-3 text-left hover:shadow-lg hover:border-[#d97706] border border-transparent transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
              <Dumbbell className="size-5 text-[#d97706]" />
              <span className="text-[10px] sm:text-xs text-[#64748b]">
                Workouts
              </span>
            </div>
            <div className="text-sm font-bold text-[#d97706] mb-1">
              View All →
            </div>
            <div className="text-[10px] sm:text-xs text-[#64748b]">
              Track & log workouts
            </div>
          </button>
          {/* Functional Sleep tracking widget */}
          <button
            onClick={() => navigate("/sleep")}
            className="bg-white rounded-lg shadow-md p-2.5 sm:p-3 text-left hover:shadow-lg hover:border-[#d97706] border border-transparent transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
              <Moon className="size-5 text-[#d97706]" />
              <span className="text-[10px] sm:text-xs text-[#64748b]">
                Sleep
              </span>
            </div>
            <div className="text-sm sm:text-lg font-bold text-[#1e293b] mb-1">
              {latestSleep > 0 ? `${latestSleep.toFixed(1)} hrs` : "Log now"}
            </div>
            <div className="text-[10px] sm:text-xs text-[#64748b]">
              {latestSleep > 0 ? "Logged today" : "No data"}
            </div>
          </button>
          {/* Weight Tracker card */}
          <button
            onClick={() => navigate("/weight-tracker")}
            className="bg-white rounded-lg shadow-md p-2.5 sm:p-3 text-left hover:shadow-lg hover:border-[#d97706] border border-transparent transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
              <Scale className="size-5 text-[#d97706]" />
              <span className="text-[10px] sm:text-xs text-[#64748b]">
                Weight
              </span>
            </div>
            {latestWeight !== null ? (
              <>
                <div className="text-sm sm:text-lg font-bold text-[#1e293b] mb-1">
                  {latestWeight} lbs
                </div>
                <div className="text-[10px] sm:text-xs text-[#64748b]">
                  Latest entry
                </div>
              </>
            ) : (
              <>
                <div className="text-sm sm:text-lg font-bold text-[#d97706] mb-1">
                  Track →
                </div>
                <div className="text-[10px] sm:text-xs text-[#64748b]">
                  Log your weight
                </div>
              </>
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-base font-semibold text-[#1e293b] mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate("/log-workout")}
              className="bg-[#d97706] text-white rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <Dumbbell className="size-6" />
              <span className="text-xs font-medium">Log Workout</span>
            </button>
            <button
              onClick={() => navigate("/create-workout")}
              className="bg-[#d97706] text-white rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <Plus className="size-6" />
              <span className="text-xs font-medium">Create Workout</span>
            </button>
            <button
              onClick={() => navigate("/log-meal")}
              className="bg-[#1e293b] text-white rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <UtensilsCrossed className="size-6" />
              <span className="text-xs font-medium">Log Meal</span>
            </button>
            <button
              onClick={() => navigate("/create-recipe")}
              className="bg-[#64748b] text-white rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <BookOpen className="size-6" />
              <span className="text-xs font-medium">Create Recipe</span>
            </button>
            <button
              onClick={() => navigate("/calendar")}
              className="bg-[#1e293b] text-white rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <Calendar className="size-6" />
              <span className="text-xs font-medium">Calendar</span>
            </button>
            <button
              onClick={() => navigate("/forum")}
              className="bg-[#d97706] text-white rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="size-6" />
              <span className="text-xs font-medium">Forum</span>
            </button>
          </div>
        </div>
        {/* Today's Meals */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="size-5 text-[#d97706]" />
              <h2 className="text-base font-semibold text-[#1e293b]">
                Today's Meals
              </h2>
            </div>
            <button
              onClick={() => navigate("/log-meal")}
              className="text-xs text-[#d97706] font-medium"
            >
              + Add
            </button>
          </div>
          {loggedMeals.length === 0 ? (
            <p className="text-sm text-[#64748b] text-center py-4">
              No meals logged yet today
            </p>
          ) : (
            <div className="space-y-2">
              {loggedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between p-2.5 sm:p-3 border border-gray-200 rounded-lg gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1e293b] text-sm truncate">
                      {meal.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#64748b] capitalize">
                      {meal.meal_type || meal.type} • {meal.protein}g P •{" "}
                      {meal.carbs}g C • {meal.fat}g F
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-[#d97706] text-sm">
                      {meal.calories}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#64748b]">cal</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                <span className="text-sm font-medium text-[#1e293b]">
                  Total
                </span>
                <span className="text-sm font-bold text-[#d97706]">
                  {loggedMeals.reduce(
                    (s, m) => s + (parseInt(m.calories) || 0),
                    0,
                  )}{" "}
                  cal
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Challenges — Dynamic from backend */}
        <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-lg shadow-md p-4 mb-4 text-white relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="size-5 text-[#d97706]" />
            <h2 className="text-base font-semibold">Challenges</h2>
            {myPoints > 0 && (
              <span className="text-[10px] bg-[#d97706] text-white px-2 py-0.5 rounded-full font-medium">
                {myPoints.toLocaleString()} pts
              </span>
            )}
          </div>
          {challenges.length === 0 ? (
            <p className="text-sm text-white/60 text-center py-4">
              No challenges available yet
            </p>
          ) : (
            <div className="space-y-3">
              {challenges.map((challenge) => (
                <div
                  key={challenge.challenge_id}
                  className={`bg-white/10 rounded-lg p-3 ${challenge.status === "completed" ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {ICON_EMOJI[challenge.icon_name] ?? "🏆"} {challenge.name}
                    </span>
                    <span className="text-xs text-[#d97706] font-semibold">
                      +{challenge.points_reward} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
                    <span>
                      {challenge.participant_count.toLocaleString()}{" "}
                      participants
                    </span>
                    <span>{challenge.progress_text}</span>
                  </div>
                  {challenge.is_joined && challenge.status !== "completed" && (
                    <div className="w-full bg-white/20 rounded-full h-1.5 mb-2">
                      <div
                        className="bg-[#d97706] h-1.5 rounded-full transition-all"
                        style={{ width: `${challenge.progress_percent}%` }}
                      />
                    </div>
                  )}
                  {challenge.status === "completed" ? (
                    <span className="text-xs text-green-400 font-medium">
                      ✓ Completed — {challenge.points_reward} pts earned
                    </span>
                  ) : challenge.is_joined ? (
                    <span className="text-xs text-white/50">
                      Log workouts to advance progress
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        handleJoinChallenge(challenge.challenge_id)
                      }
                      className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium hover:bg-white/30 transition-colors"
                    >
                      Join Challenge
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard — Dynamic from backend */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="size-5 text-[#d97706]" />
            <h2 className="text-base font-semibold text-[#1e293b]">
              Leaderboard
            </h2>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-[#64748b] text-center py-2 mb-3">
              No rankings yet — complete challenges to earn points!
            </p>
          ) : (
            <div className="space-y-2 mb-3">
              {leaderboard.map((entry, idx) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm w-6">
                        {medals[idx] || `#${idx + 1}`}
                      </span>
                      <span className="text-sm text-[#1e293b]">
                        {entry.username}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#64748b]">
                      {Number(entry.total_points).toLocaleString()} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#d97706]/10 border border-[#d97706]/30">
              <div className="flex items-center gap-2">
                <span className="text-sm w-6 text-[#d97706] font-bold">
                  {myRank !== null ? `#${myRank}` : "—"}
                </span>
                <span className="text-sm font-bold text-[#d97706]">
                  {myUsername}
                </span>
              </div>
              <span className="text-sm font-semibold text-[#64748b]">
                {myPoints.toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>

        {/* Recommended Recipes */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-[#d97706]" />
              <h2 className="text-base font-semibold text-[#1e293b]">
                Recommended Recipes
              </h2>
            </div>
            <button
              onClick={() => navigate("/recipes")}
              className="text-xs text-[#d97706] font-medium"
            >
              See All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                name: "Protein Buddha Bowl",
                cal: 480,
                time: "15 min",
                img: "🥗",
              },
              { name: "Grilled Chicken", cal: 420, time: "25 min", img: "🍗" },
            ].map((recipe) => (
              <div
                key={recipe.name}
                onClick={() => navigate("/recipes")}
                className="border border-gray-200 rounded-lg p-3 hover:border-[#d97706] cursor-pointer transition-colors"
              >
                <div className="text-2xl mb-2">{recipe.img}</div>
                <p className="font-medium text-[#1e293b] text-sm mb-1">
                  {recipe.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                  <span>🔥 {recipe.cal} cal</span>
                  <span>⏱️ {recipe.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Activities */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="size-5 text-[#d97706]" />
              <h2 className="text-base font-semibold text-[#1e293b]">
                Upcoming Activities
              </h2>
            </div>
            <button
              onClick={() => navigate("/community")}
              className="text-xs text-[#d97706] font-medium"
            >
              See All
            </button>
          </div>
          <div className="space-y-2">
            {[
              {
                name: "Basketball Game",
                group: "FitSquad",
                time: "Today, 6:00 PM",
                location: "Alumni Arena",
                participants: 8,
                icon: "🏀",
              },
              {
                name: "Morning Run",
                group: "Runners United",
                time: "Tomorrow, 6:30 AM",
                location: "Delaware Park",
                participants: 12,
                icon: "🏃",
              },
              {
                name: "Yoga Session",
                group: "Yoga Warriors",
                time: "Sat, 9:00 AM",
                location: "Student Union",
                participants: 15,
                icon: "🧘",
              },
            ].map((activity) => (
              <div
                key={activity.name}
                className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 border border-gray-200 rounded-lg hover:border-[#d97706] transition-colors cursor-pointer"
              >
                <div className="text-xl sm:text-2xl flex-shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1e293b] text-sm truncate">
                    {activity.name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-[#64748b] truncate">
                    {activity.group} • {activity.time}
                  </p>
                  <p className="text-[10px] sm:text-xs text-[#64748b] flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="size-3 flex-shrink-0" />
                    {activity.location} • {activity.participants} going
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connect with Experts */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="size-5 text-[#d97706]" />
            <h2 className="text-base font-semibold text-[#1e293b]">
              Connect with Experts
            </h2>
          </div>
          <div className="space-y-2">
            {[
              {
                id: 1,
                name: "Coach Sarah Miller",
                specialty: "Strength Training",
                rating: 4.9,
                emoji: "💪",
                bio: "NSCA Certified Strength & Conditioning Specialist with 8+ years of experience. Specializes in progressive overload training and powerlifting programs.",
                clients: 142,
                certifications: ["NSCA-CSCS", "NASM-CPT", "First Aid/CPR"],
                workouts: [
                  "Push Day Power",
                  "Leg Day Builder",
                  "Pull Day Strength",
                ],
              },
              {
                id: 2,
                name: "Dr. James Wilson",
                specialty: "Nutrition & Performance",
                rating: 4.8,
                emoji: "🥗",
                bio: "PhD in Sports Nutrition from UB. Helps athletes optimize their performance through evidence-based nutrition strategies and functional fitness routines.",
                clients: 98,
                certifications: [
                  "PhD Sports Nutrition",
                  "ISSN-CISSN",
                  "ACE-CPT",
                ],
                workouts: ["Full Body HIIT", "Core & Mobility"],
              },
            ].map((trainer) => (
              <div
                key={trainer.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
              >
                <div className="w-10 h-10 bg-[#d97706]/20 rounded-full flex items-center justify-center text-lg">
                  {trainer.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#1e293b] text-sm">
                    {trainer.name}
                  </p>
                  <p className="text-xs text-[#64748b]">
                    {trainer.specialty} • ⭐ {trainer.rating}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTrainer(trainer)}
                  className="text-xs text-[#d97706] font-medium px-3 py-1 border border-[#d97706] rounded-full hover:bg-[#d97706] hover:text-white transition-colors"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* WORKOUT MODALS */}
      {/* ========================================================================= */}

      {/* 1. Modal to select a workout */}
      {showWorkoutModal && !selectedWorkout && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShowWorkoutModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-md p-4 sm:p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-1 pb-2 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1e293b]">
                Log Workout
              </h2>
              <button
                onClick={() => setShowWorkoutModal(false)}
                className="text-[#64748b] hover:text-[#1e293b]"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="text-sm text-[#64748b] mb-4">
              Choose a premade workout from our certified trainers
            </p>

            {/* List rendered from PHP database */}
            <div className="space-y-3">
              {trainerWorkouts.length === 0 && (
                <p className="text-center text-sm text-gray-500 py-4">
                  Loading workouts from database...
                </p>
              )}
              {trainerWorkouts.map((w) => (
                <div
                  key={w.id}
                  onClick={() => setSelectedWorkout(w)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#d97706] transition-colors cursor-pointer hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1e293b] text-sm">
                        {w.name}
                      </h3>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        by {w.trainer}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${w.difficulty === "Beginner-Friendly" ? "bg-green-100 text-green-700" : "bg-[#d97706]/10 text-[#d97706]"}`}
                    >
                      {w.difficulty}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {w.muscleGroups &&
                      w.muscleGroups.map((mg: string) => (
                        <span
                          key={mg}
                          className="text-xs bg-[#1e293b]/5 text-[#1e293b] px-2 py-0.5 rounded"
                        >
                          {mg}
                        </span>
                      ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1">
                      ⏱️ {w.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      🔥 {w.calories} cal
                    </span>
                    <span className="flex items-center gap-1">
                      🏋️ {w.exercises?.length || 0} exercises
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal for Active/Selected Workout */}
      {selectedWorkout && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
          onClick={resetWorkout}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-1 pb-2 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  if (workoutInProgress && !workoutComplete)
                    setWorkoutInProgress(false);
                  else resetWorkout();
                }}
                className="text-[#64748b] hover:text-[#1e293b] flex items-center gap-1 text-sm"
              >
                <ArrowLeft className="size-4" />
                {workoutInProgress && !workoutComplete ? "Overview" : "Back"}
              </button>
              <button
                onClick={resetWorkout}
                className="text-[#64748b] hover:text-[#1e293b]"
              >
                <X className="size-5" />
              </button>
            </div>

            {workoutComplete ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-[#1e293b] mb-2">
                  Workout Complete!
                </h2>
                <p className="text-[#64748b] mb-6">
                  Great job finishing {selectedWorkout.name}
                </p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-[#fdfcfb] rounded-lg p-3 border border-gray-200">
                    <div className="text-xl font-bold text-[#d97706]">
                      {selectedWorkout.duration} min
                    </div>
                    <div className="text-xs text-[#64748b]">Duration</div>
                  </div>
                  <div className="bg-[#fdfcfb] rounded-lg p-3 border border-gray-200">
                    <div className="text-xl font-bold text-[#d97706]">
                      {selectedWorkout.calories}
                    </div>
                    <div className="text-xs text-[#64748b]">Calories</div>
                  </div>
                  <div className="bg-[#fdfcfb] rounded-lg p-3 border border-gray-200">
                    <div className="text-xl font-bold text-[#d97706]">
                      {selectedWorkout.exercises?.length || 0}
                    </div>
                    <div className="text-xs text-[#64748b]">Exercises</div>
                  </div>
                </div>
                <button
                  onClick={resetWorkout}
                  className="w-full bg-[#d97706] text-white py-3 rounded-lg hover:bg-[#b45309] font-medium"
                >
                  Done
                </button>
              </div>
            ) : workoutInProgress ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#1e293b]">
                    {selectedWorkout.name}
                  </h2>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    In Progress
                  </span>
                </div>
                <div className="space-y-3 mb-6">
                  {selectedWorkout.exercises &&
                    selectedWorkout.exercises.map((ex: any, idx: number) => {
                      const allDone = Array.from(
                        { length: ex.sets },
                        (_, s) => completedSets[`${idx}-${s}`],
                      ).every(Boolean);
                      return (
                        <div
                          key={idx}
                          className={`border rounded-lg p-3 transition-colors ${allDone ? "border-green-300 bg-green-50" : "border-gray-200"}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-[#1e293b] text-sm">
                                {ex.name}
                              </h4>
                              <p className="text-xs text-[#64748b]">
                                {ex.weight} • Rest {ex.rest}
                              </p>
                            </div>
                            {allDone && (
                              <span className="text-green-600 text-lg">✓</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {Array.from({ length: ex.sets }, (_, s) => (
                              <button
                                key={s}
                                onClick={() =>
                                  setCompletedSets((prev) => ({
                                    ...prev,
                                    [`${idx}-${s}`]: !prev[`${idx}-${s}`],
                                  }))
                                }
                                className={`flex-1 py-2 rounded text-xs font-medium transition-all ${completedSets[`${idx}-${s}`] ? "bg-[#d97706] text-white" : "bg-gray-100 text-[#64748b] hover:bg-gray-200"}`}
                              >
                                <div>Set {s + 1}</div>
                                <div className="text-[10px] opacity-80">
                                  {ex.reps}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
                {(() => {
                  const total = selectedWorkout.exercises
                    ? selectedWorkout.exercises.reduce(
                        (a: number, e: any) => a + e.sets,
                        0,
                      )
                    : 0;
                  const done =
                    Object.values(completedSets).filter(Boolean).length;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-[#64748b] mb-1">
                        <span>
                          {done}/{total} sets
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#d97706] h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })()}
                <button
                  onClick={handleFinishWorkout}
                  className="w-full bg-[#d97706] text-white py-3 rounded-lg hover:bg-[#b45309] font-medium flex items-center justify-center gap-2"
                >
                  <Trophy className="size-4" />
                  Finish Workout
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-[#1e293b] mb-1">
                  {selectedWorkout.name}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#d97706]/20 flex items-center justify-center text-sm">
                    👤
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1e293b]">
                      {selectedWorkout.trainer}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#fdfcfb] rounded-lg p-3 text-center border border-gray-200">
                    <div className="text-lg font-bold text-[#d97706]">
                      {selectedWorkout.duration} min
                    </div>
                    <div className="text-xs text-[#64748b]">Duration</div>
                  </div>
                  <div className="bg-[#fdfcfb] rounded-lg p-3 text-center border border-gray-200">
                    <div className="text-lg font-bold text-[#d97706]">
                      {selectedWorkout.calories}
                    </div>
                    <div className="text-xs text-[#64748b]">Calories</div>
                  </div>
                  <div className="bg-[#fdfcfb] rounded-lg p-3 text-center border border-gray-200">
                    <div className="text-lg font-bold text-[#d97706]">
                      {selectedWorkout.exercises?.length || 0}
                    </div>
                    <div className="text-xs text-[#64748b]">Exercises</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {selectedWorkout.muscleGroups &&
                    selectedWorkout.muscleGroups.map((mg: string) => (
                      <span
                        key={mg}
                        className="text-xs bg-[#1e293b]/5 text-[#1e293b] px-2 py-1 rounded-full"
                      >
                        {mg}
                      </span>
                    ))}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${selectedWorkout.difficulty === "Beginner-Friendly" ? "bg-green-100 text-green-700" : "bg-[#d97706]/10 text-[#d97706]"}`}
                  >
                    {selectedWorkout.difficulty}
                  </span>
                </div>
                <h3 className="font-semibold text-[#1e293b] text-sm mb-3 flex items-center gap-2">
                  <Dumbbell className="size-4 text-[#d97706]" />
                  Exercises ({selectedWorkout.exercises?.length || 0})
                </h3>
                <div className="space-y-2 mb-6">
                  {selectedWorkout.exercises &&
                    selectedWorkout.exercises.map((ex: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 border border-gray-200 rounded-lg p-3"
                      >
                        <div className="w-7 h-7 bg-[#d97706] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#1e293b] text-sm">
                            {ex.name}
                          </p>
                          <p className="text-xs text-[#64748b]">
                            {ex.sets} sets × {ex.reps} • {ex.weight}
                          </p>
                        </div>
                        <span className="text-xs text-[#64748b] flex-shrink-0">
                          {ex.rest}
                        </span>
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => setWorkoutInProgress(true)}
                  className="w-full bg-[#d97706] text-white py-3 rounded-lg hover:bg-[#b45309] font-medium flex items-center justify-center gap-2"
                >
                  <Dumbbell className="size-4" />
                  Start Workout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trainer Detail Modal */}
      {selectedTrainer && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setSelectedTrainer(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-md p-4 sm:p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-1 pb-2 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1e293b]">
                Trainer Profile
              </h2>
              <button
                onClick={() => setSelectedTrainer(null)}
                className="text-[#64748b] hover:text-[#1e293b]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-[#d97706]/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-3">
                {selectedTrainer.emoji}
              </div>
              <h3 className="text-xl font-bold text-[#1e293b]">
                {selectedTrainer.name}
              </h3>
              <p className="text-sm text-[#64748b]">
                {selectedTrainer.specialty}
              </p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#d97706]">
                    ⭐ {selectedTrainer.rating}
                  </div>
                  <div className="text-xs text-[#64748b]">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#d97706]">
                    {selectedTrainer.clients}
                  </div>
                  <div className="text-xs text-[#64748b]">Clients</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-[#1e293b] text-sm mb-2">
                About
              </h4>
              <p className="text-sm text-[#64748b] leading-relaxed">
                {selectedTrainer.bio}
              </p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-[#1e293b] text-sm mb-2">
                Certifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedTrainer.certifications.map((cert: string) => (
                  <span
                    key={cert}
                    className="text-xs bg-[#1e293b]/5 text-[#1e293b] px-2 py-1 rounded-full"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-[#1e293b] text-sm mb-2">
                Workouts by {selectedTrainer.name.split(" ")[1]}
              </h4>
              <div className="space-y-2">
                {selectedTrainer.workouts.map((w: string) => (
                  <div
                    key={w}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Dumbbell className="size-4 text-[#d97706]" />
                      <span className="text-sm font-medium text-[#1e293b]">
                        {w}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedTrainer(null);
                navigate("/workouts");
              }}
              className="w-full bg-[#d97706] text-white py-3 rounded-lg hover:bg-[#b45309] font-medium flex items-center justify-center gap-2"
            >
              <Dumbbell className="size-4" />
              View Their Workouts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Small helper component for the top stat grid
function StatCard({
  icon,
  label,
  value,
  goal,
  percentage,
  unit = "",
}: {
  icon: any;
  label: string;
  value: number;
  goal: number;
  percentage: number;
  unit?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-2.5 sm:p-3">
      <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
        {icon}
        <span className="text-[10px] sm:text-xs text-[#64748b]">{label}</span>
      </div>
      <div className="text-sm sm:text-lg font-bold text-[#1e293b] mb-1">
        {value}
        {unit}{" "}
        <span className="text-[10px] sm:text-xs font-normal text-[#64748b]">
          / {goal}
          {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-[#d97706] h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <div className="text-[10px] sm:text-xs text-[#64748b] mt-1">
        {percentage}%
      </div>
    </div>
  );
}
