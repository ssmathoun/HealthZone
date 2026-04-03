import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Clock,
  ArrowLeft,
  X,
  Trophy,
  Flame,
  Star,
  ChevronRight,
  Filter,
  Heart,
} from "lucide-react";

export function WorkoutsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"history" | "browse">("browse");

  const [trainerWorkouts, setTrainerWorkouts] = useState<any[]>([]);

  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [workoutInProgress, setWorkoutInProgress] = useState(false);
  const [completedSets, setCompletedSets] = useState<{
    [key: string]: boolean;
  }>({});
  const [workoutComplete, setWorkoutComplete] = useState(false);

  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState("date"); // 'date', 'calories', 'duration', 'exercises'
  const [filterBy, setFilterBy] = useState("All");

  const [completedWorkouts, setCompletedWorkouts] = useState<any[]>([
    {
      id: 1,
      name: "Push Day Power",
      trainer: "Coach Sarah Miller",
      exercises: 8,
      duration: "45 min",
      calories: 320,
      date: "Today",
      muscleGroups: ["Chest", "Shoulders", "Triceps"],
    },
    {
      id: 2,
      name: "Leg Day Builder",
      trainer: "Coach Sarah Miller",
      exercises: 6,
      duration: "50 min",
      calories: 410,
      date: "Yesterday",
      muscleGroups: ["Quads", "Hamstrings", "Glutes"],
    },
    {
      id: 3,
      name: "Full Body HIIT",
      trainer: "Dr. James Wilson",
      exercises: 6,
      duration: "30 min",
      calories: 280,
      date: "2 days ago",
      muscleGroups: ["Full Body", "Cardio"],
    },
  ]);

  const totalCalories = completedWorkouts.reduce(
    (sum, w) => sum + w.calories,
    0,
  );
  const totalMinutes = completedWorkouts.reduce(
    (sum, w) => sum + parseInt(w.duration),
    0,
  );

  useEffect(() => {
    fetch(
      "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/workouts.php?action=get_premade_workouts",
      {
        credentials: "include",
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTrainerWorkouts(data);
      })
      .catch((err) => console.error("Error fetching workouts:", err));

    fetch(
      "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/workouts.php?action=get_workout_history",
      { credentials: "include" },
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCompletedWorkouts(data);
      })
      .catch(() => {});
  }, []);

  const processedWorkouts = [...trainerWorkouts]
    .filter((w) => {
      if (filterBy === "All") return true;
      if (filterBy === "Favorites") return !!w.is_favorite; // Filter for test #1 step 5
      return w.difficulty === filterBy;
    })
    .sort((a, b) => {
      if (sortBy === "calories") return b.calories - a.calories;
      if (sortBy === "duration") return b.duration - a.duration;
      if (sortBy === "exercises")
        return (b.exercises?.length || 0) - (a.exercises?.length || 0);
      return b.id - a.id;
    });

  const handleToggleFavorite = async (
    e: React.MouseEvent,
    workoutId: number,
  ) => {
    e.stopPropagation(); // Prevent opening the workout modal
    try {
      const res = await fetch(
        "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/workouts.php?action=toggle_favorite",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ workout_id: workoutId }),
        },
      );
      const data = await res.json();
      if (data.status === "success") {
        setTrainerWorkouts((prev) =>
          prev.map((w) =>
            w.id === workoutId ? { ...w, is_favorite: data.is_favorite } : w,
          ),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSortLabel = () => {
    if (sortBy === "date") return "Date Added";
    if (sortBy === "calories") return "Calories";
    if (sortBy === "duration") return "Duration";
    if (sortBy === "exercises") return "Number of Exercises";
    return "";
  };

  const handleFinishWorkout = async () => {
    try {
      const response = await fetch(
        "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/workouts.php?action=finish_workout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            workout_id: selectedWorkout.id,
          }),
        },
      );

      const data = await response.json();

      if (data.status === "success") {
        setWorkoutComplete(true);
        setCompletedWorkouts((prev) => [
          {
            id: Date.now(),
            name: selectedWorkout.name,
            trainer: selectedWorkout.trainer,
            exercises: selectedWorkout.exercises?.length || 0,
            duration: Number(selectedWorkout.duration),
            calories: selectedWorkout.calories,
            date: "Today",
            muscleGroups: selectedWorkout.muscleGroups ?? ["Full Body"],
          },
          ...prev,
        ]);
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
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white p-2 hover:bg-white/10 rounded-full"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            <span className="text-[#d97706]">Health</span>
            <span className="text-white">Zone</span>
          </button>
          <div className="w-10"></div>
        </div>
      </nav>
      <main className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1e293b] mb-2">Workouts</h1>
            <p className="text-[#64748b]">Track your training progress</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748b] text-xs">This Week</p>
                  <p className="text-xl font-bold text-[#1e293b]">
                    {completedWorkouts.length}
                  </p>
                  <p className="text-xs text-[#64748b]">workouts</p>
                </div>
                <Dumbbell className="size-7 text-[#d97706]" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748b] text-xs">Total Time</p>
                  <p className="text-xl font-bold text-[#1e293b]">
                    {totalMinutes}
                  </p>
                  <p className="text-xs text-[#64748b]">minutes</p>
                </div>
                <Clock className="size-7 text-[#d97706]" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748b] text-xs">Burned</p>
                  <p className="text-xl font-bold text-[#1e293b]">
                    {totalCalories.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#64748b]">calories</p>
                </div>
                <Flame className="size-7 text-[#d97706]" />
              </div>
            </div>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab("browse")}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === "browse" ? "bg-white text-[#1e293b] shadow-sm" : "text-[#64748b]"}`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Star className="size-4" />
                Trainer Workouts
              </div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === "history" ? "bg-white text-[#1e293b] shadow-sm" : "text-[#64748b]"}`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Clock className="size-4" />
                History
              </div>
            </button>
          </div>

          {activeTab === "browse" && (
            <>
              <div className="flex items-center justify-between mb-4 bg-white p-3.5 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-[#64748b]">
                  Sorted by{" "}
                  <span className="text-[#1e293b]">{getSortLabel()}</span>
                  {filterBy !== "All" && ` • ${filterBy}`}
                </p>
                <button
                  onClick={() => setShowSortModal(true)}
                  className="flex items-center gap-2 text-sm font-bold bg-[#fdfcfb] px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-[#d97706] text-[#1e293b] transition-colors shadow-sm"
                >
                  <Filter className="size-4 text-[#d97706]" />
                  Sort/Filter
                </button>
              </div>

              <div className="space-y-3">
                {processedWorkouts.length === 0 ? (
                  <p className="text-center text-[#64748b] py-8">
                    No workouts match your filters.
                  </p>
                ) : (
                  processedWorkouts.map((w) => (
                    <div key={w.id} className="relative group">
                      <button
                        onClick={(e) => handleToggleFavorite(e, w.id)}
                        className="absolute top-3 right-3 z-30 p-2 bg-white rounded-full shadow-md border border-gray-100 hover:scale-110 transition-all active:scale-95"
                        title={w.is_favorite ? "Unfavorite" : "Favorite"}
                      >
                        <Heart
                          className={`size-5 transition-colors ${w.is_favorite ? "fill-[#d97706] text-[#d97706]" : "text-gray-300"}`}
                        />
                      </button>

                      <div
                        onClick={() => setSelectedWorkout(w)}
                        className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg hover:border-[#d97706] border border-transparent transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2 pr-10">
                          <div className="flex-1 min-w-0 pr-10">
                            {" "}
                            {/* pr-10 ensures text doesn't hide behind the heart */}
                            <h3 className="font-semibold text-[#1e293b]">
                              {w.name}
                            </h3>
                            <p className="text-xs text-[#64748b] mt-0.5">
                              by {w.trainer}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${w.difficulty === "Beginner-Friendly" ? "bg-green-100 text-green-700" : "bg-[#d97706]/10 text-[#d97706]"}`}
                          >
                            {w.difficulty}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-[#64748b]">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {w.duration} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Flame className="size-3" />
                              {w.calories} cal
                            </span>
                            <span className="flex items-center gap-1">
                              <Dumbbell className="size-3" />
                              {w.exercises?.length || 0} exercises
                            </span>
                          </div>
                          <ChevronRight className="size-4 text-[#64748b]" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {completedWorkouts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Dumbbell className="size-12 text-[#d97706]/30 mx-auto mb-3" />
                  <p className="text-[#1e293b] font-medium mb-1">
                    No workouts yet
                  </p>
                  <p className="text-sm text-[#64748b] mb-4">
                    Start a trainer workout to see your history
                  </p>
                  <button
                    onClick={() => setActiveTab("browse")}
                    className="px-4 py-2 bg-[#d97706] text-white rounded-lg text-sm font-medium hover:bg-[#b45309]"
                  >
                    Browse Workouts
                  </button>
                </div>
              ) : (
                completedWorkouts.map((w) => (
                  <div key={w.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-[#1e293b]">
                          {w.name}
                        </h3>
                        <p className="text-xs text-[#64748b]">by {w.trainer}</p>
                      </div>
                      <span className="text-xs text-[#64748b] font-medium">
                        {w.date}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {w.muscleGroups.map((mg: string) => (
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
                        <Dumbbell className="size-3" />
                        {w.exercises} exercises
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {w.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="size-3" />
                        {w.calories} cal
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {showSortModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowSortModal(false)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-xl max-w-sm w-full p-6 shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#1e293b]">
                Sort & Filter
              </h2>
              <button
                onClick={() => setShowSortModal(false)}
                className="text-[#64748b] hover:bg-gray-100 p-1.5 rounded-full"
              >
                <X className="size-5" />
              </button>
            </div>

            <h3 className="font-bold text-[#1e293b] mb-3 text-sm uppercase tracking-wider text-[#64748b]">
              Sort By
            </h3>
            <div className="space-y-3 mb-6">
              {[
                { id: "date", label: "Date Added" },
                { id: "calories", label: "Calories" },
                { id: "duration", label: "Duration" },
                { id: "exercises", label: "Number of Exercises" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="sort"
                    className="w-4 h-4 text-[#d97706] focus:ring-[#d97706]"
                    checked={sortBy === opt.id}
                    onChange={() => setSortBy(opt.id)}
                  />
                  <span className="text-[#1e293b] font-medium">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="w-full h-px bg-gray-200 mb-6"></div>

            <h3 className="font-bold text-[#1e293b] mb-3 text-sm uppercase tracking-wider text-[#64748b]">
              Filter By
            </h3>
            <div className="space-y-3 mb-8">
              {[
                "All",
                "Favorites",
                "Beginner-Friendly",
                "Intermediate",
                "Advanced",
              ].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="filter"
                    className="w-4 h-4 text-[#d97706] focus:ring-[#d97706]"
                    checked={filterBy === opt}
                    onChange={() => setFilterBy(opt)}
                  />
                  <span className="text-[#1e293b] font-medium">{opt}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => setShowSortModal(false)}
              className="w-full bg-[#d97706] text-white py-3.5 rounded-xl font-bold hover:bg-[#b45309] transition-colors shadow-md text-lg"
            >
              Sort/Filter
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXISTING WORKOUT EXECUTION MODAL */}
      {/* ========================================================================= */}
      {selectedWorkout && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={resetWorkout}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
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
    </div>
  );
}
