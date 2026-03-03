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

// Import your new UI components if you want to use them,
// otherwise we use standard HTML to ensure it doesn't crash.
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";

export function HomePage() {
  const navigate = useNavigate();

  // === ALL ORIGINAL STATE KEPT INTACT ===
  const [trainerWorkouts, setTrainerWorkouts] = useState<any[]>([]);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [workoutInProgress, setWorkoutInProgress] = useState(false);
  const [completedSets, setCompletedSets] = useState<{
    [key: string]: boolean;
  }>({});
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  const [showMealModal, setShowMealModal] = useState(false);
  const [loggedMeals, setLoggedMeals] = useState<any[]>([
    {
      id: 1,
      name: "Oatmeal with Berries",
      type: "breakfast",
      calories: 350,
      protein: 12,
      carbs: 55,
      fat: 8,
    },
    {
      id: 2,
      name: "Chicken Salad",
      type: "lunch",
      calories: 480,
      protein: 42,
      carbs: 20,
      fat: 18,
    },
  ]);

  // === API CALLS KEPT INTACT ===
  useEffect(() => {
    fetch(
      "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/workouts.php?action=get_premade_workouts",
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTrainerWorkouts(data);
      })
      .catch((err) => console.error("Error fetching workouts:", err));
  }, []);

  const stats = {
    caloriesConsumed: 1850,
    caloriesGoal: 2400,
    proteinsConsumed: 145,
    proteinsGoal: 180,
    sleepHours: 7.5,
    sleepGoal: 8,
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      {/* Navigation */}
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate("/dashboard")}
            className="font-semibold text-lg"
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
              className="text-white p-2 hover:bg-white/10 rounded-full"
              onClick={() =>
                (window.location.href =
                  "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/jaspreet/#/login")
              }
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="px-4 py-4 max-w-4xl mx-auto">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-[#1e293b]">
            Welcome back! 💪
          </h1>
          <p className="text-[#64748b] text-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard
            icon={<Activity className="size-5 text-[#d97706]" />}
            label="Calories"
            value={stats.caloriesConsumed}
            goal={stats.caloriesGoal}
            percentage={77}
          />
          <StatCard
            icon={<Heart className="size-5 text-[#d97706]" />}
            label="Protein"
            value={stats.proteinsConsumed}
            goal={stats.proteinsGoal}
            percentage={80}
          />
          <button
            onClick={() => navigate("/workouts")}
            className="bg-white rounded-lg shadow-md p-3 text-left border border-transparent hover:border-[#d97706] transition-all"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Dumbbell className="size-5 text-[#d97706]" />
              <span className="text-xs text-[#64748b]">Workouts</span>
            </div>
            <div className="text-sm font-bold text-[#d97706]">View All →</div>
          </button>
          <StatCard
            icon={<Moon className="size-5 text-[#d97706]" />}
            label="Sleep"
            value={stats.sleepHours}
            goal={stats.sleepGoal}
            percentage={93}
            unit="hrs"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-base font-semibold text-[#1e293b] mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowWorkoutModal(true)}
              className="bg-[#d97706] text-white rounded-lg p-3 flex flex-col items-center gap-1.5 hover:opacity-90"
            >
              <Plus className="size-6" />
              <span className="text-xs font-medium">Log Workout</span>
            </button>
            <button
              onClick={() => setShowMealModal(true)}
              className="bg-[#1e293b] text-white rounded-lg p-3 flex flex-col items-center gap-1.5 hover:opacity-90"
            >
              <UtensilsCrossed className="size-6" />
              <span className="text-xs font-medium">Log Meal</span>
            </button>
            <button
              onClick={() => navigate("/recipes")}
              className="bg-[#64748b] text-white rounded-lg p-3 flex flex-col items-center gap-1.5 hover:opacity-90"
            >
              <BookOpen className="size-6" />
              <span className="text-xs font-medium">Recipes</span>
            </button>
            <button
              onClick={() => navigate("/community")}
              className="bg-[#d97706] text-white rounded-lg p-3 flex flex-col items-center gap-1.5 hover:opacity-90"
            >
              <Users className="size-6" />
              <span className="text-xs font-medium">Activity</span>
            </button>

            {/* THE NEW CALENDAR BUTTON */}
            <button
              onClick={() => navigate("/calendar")}
              className="col-span-2 bg-[#d97706] text-white rounded-lg p-3 flex items-center justify-center gap-2 hover:bg-[#b45309] transition-colors"
            >
              <Calendar className="size-6" />
              <span className="text-sm font-medium">View Calendar Split</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modals and other logic should remain here exactly as they were in your working version */}
    </div>
  );
}

function StatCard({ icon, label, value, goal, percentage, unit = "" }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-3">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs text-[#64748b]">{label}</span>
      </div>
      <div className="text-lg font-bold text-[#1e293b] mb-1">
        {value}
        {unit} / {goal}
        {unit}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-[#d97706] h-1.5 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
