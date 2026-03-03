import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Dumbbell,
  Calendar as CalendarIcon,
} from "lucide-react";

export function CalendarPage() {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number | null>(
    null,
  );

  // State to hold our recurring split: { 0: [workouts for Sunday], 1: [workouts for Monday], etc. }
  const [workoutSplit, setWorkoutSplit] = useState<{
    [dayOfWeek: number]: any[];
  }>({});

  // Fetch available workouts from your database
  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([]);

  useEffect(() => {
    fetch(
      "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/workouts.php?action=get_premade_workouts",
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAvailableWorkouts(data);
      })
      .catch((err) => console.error("Error fetching workouts:", err));
  }, []);

  // Calendar Math
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const handleNextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

  const openModalForDay = (dayOfWeek: number) => {
    setSelectedDayOfWeek(dayOfWeek);
    setShowWorkoutModal(true);
  };

  const addWorkoutToSplit = (workout: any) => {
    if (selectedDayOfWeek !== null) {
      setWorkoutSplit((prev) => ({
        ...prev,
        [selectedDayOfWeek]: [...(prev[selectedDayOfWeek] || []), workout],
      }));
    }
    setShowWorkoutModal(false);
    setSelectedDayOfWeek(null);
  };

  const removeWorkoutFromSplit = (
    dayOfWeek: number,
    workoutIndex: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setWorkoutSplit((prev) => {
      const updatedDay = [...(prev[dayOfWeek] || [])];
      updatedDay.splice(workoutIndex, 1);
      return { ...prev, [dayOfWeek]: updatedDay };
    });
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      {/* Navigation */}
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white p-2 hover:bg-white/10 rounded-full flex items-center gap-2"
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

      {/* Main Content */}
      <main className="px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <CalendarIcon className="size-8 text-[#d97706]" />
          <div>
            <h1 className="text-3xl font-bold text-[#1e293b] mb-1">
              My Workout Split
            </h1>
            <p className="text-[#64748b]">
              Plan your weekly recurring workouts
            </p>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-t-lg shadow-md border-b border-gray-100 p-4 flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#64748b]"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h2 className="text-lg font-bold text-[#1e293b]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#64748b]"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-b-lg shadow-md p-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-bold text-[#64748b] uppercase tracking-wider py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Blank cells for start of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div
                key={`blank-${i}`}
                className="min-h-[100px] bg-gray-50 rounded-lg border border-transparent opacity-50"
              ></div>
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const cellDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                dayNum,
              );
              const dayOfWeek = cellDate.getDay();
              const dayWorkouts = workoutSplit[dayOfWeek] || [];
              const isToday =
                new Date().toDateString() === cellDate.toDateString();

              return (
                <div
                  key={dayNum}
                  className={`min-h-[100px] bg-white rounded-lg border ${isToday ? "border-[#d97706] shadow-sm" : "border-gray-200"} p-2 flex flex-col transition-colors hover:border-[#d97706]/50`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`text-sm font-semibold ${isToday ? "bg-[#d97706] text-white size-6 flex items-center justify-center rounded-full" : "text-[#1e293b]"}`}
                    >
                      {dayNum}
                    </span>
                    <button
                      onClick={() => openModalForDay(dayOfWeek)}
                      className="text-[#64748b] hover:text-[#d97706] hover:bg-[#d97706]/10 p-1 rounded transition-colors"
                      title={`Add workout to all ${dayNames[dayOfWeek]}s`}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>

                  {/* Render workouts for this day of the week */}
                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {dayWorkouts.map((w, idx) => (
                      <div
                        key={idx}
                        className="group relative bg-[#d97706]/10 border border-[#d97706]/20 rounded p-1.5 flex items-center justify-between"
                      >
                        <div
                          className="truncate text-[10px] font-medium text-[#d97706]"
                          title={w.name}
                        >
                          {w.name}
                        </div>
                        <button
                          onClick={(e) =>
                            removeWorkoutFromSplit(dayOfWeek, idx, e)
                          }
                          className="opacity-0 group-hover:opacity-100 text-[#d97706] hover:text-red-500 transition-opacity"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Select Workout Modal */}
      {showWorkoutModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowWorkoutModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-[#1e293b]">
                  Add to Split
                </h2>
                <p className="text-xs text-[#64748b]">
                  Select a workout to repeat every{" "}
                  {selectedDayOfWeek !== null
                    ? dayNames[selectedDayOfWeek]
                    : "day"}
                  .
                </p>
              </div>
              <button
                onClick={() => setShowWorkoutModal(false)}
                className="text-[#64748b] hover:text-[#1e293b]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3">
              {availableWorkouts.length === 0 && (
                <p className="text-center text-sm text-gray-500 py-4">
                  Loading workouts...
                </p>
              )}
              {availableWorkouts.map((w) => (
                <div
                  key={w.id}
                  onClick={() => addWorkoutToSplit(w)}
                  className="border border-gray-200 rounded-lg p-3 hover:border-[#d97706] transition-colors cursor-pointer flex items-center gap-3"
                >
                  <div className="bg-[#d97706]/10 p-2 rounded-lg">
                    <Dumbbell className="size-5 text-[#d97706]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1e293b] text-sm">
                      {w.name}
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      {w.duration} min • {w.muscleGroups?.[0] || "Mixed"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
