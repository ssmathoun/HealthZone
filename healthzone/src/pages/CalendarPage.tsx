import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalendarIcon,
  Dumbbell,
  Plus,
  Trash2,
} from "lucide-react";

export function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledWorkouts, setScheduledWorkouts] = useState<
    Record<string, any[]>
  >({});
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [trainerWorkouts, setTrainerWorkouts] = useState<any[]>([]);

  useEffect(() => {
    fetch(
      "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/workouts.php?action=get_premade_workouts",
      { credentials: "include" },
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTrainerWorkouts(data);
      })
      .catch((err) => console.error("Error fetching workouts:", err));
  }, []);

  const fetchCalendar = () => {
    fetch(
      "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/calendar.php",
      { credentials: "include" },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && Array.isArray(data.data)) {
          const formattedSchedule: Record<string, any[]> = {};
          data.data.forEach((row: any) => {
            const dateObj = new Date(row.scheduled_date + "T00:00:00");
            const key = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
            if (!formattedSchedule[key]) formattedSchedule[key] = [];
            formattedSchedule[key].push(row);
          });
          setScheduledWorkouts(formattedSchedule);
        }
      })
      .catch((err) => console.error("Error fetching calendar:", err));
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

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
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const realToday = new Date();
  const isToday = (day: number) =>
    day === realToday.getDate() &&
    currentDate.getMonth() === realToday.getMonth() &&
    currentYear === realToday.getFullYear();
  const isPast = (day: number) =>
    new Date(currentYear, currentDate.getMonth(), day) <
    new Date(
      realToday.getFullYear(),
      realToday.getMonth(),
      realToday.getDate(),
    );

  const nextMonth = () =>
    setCurrentDate(new Date(currentYear, currentDate.getMonth() + 1, 1));
  const prevMonth = () =>
    setCurrentDate(new Date(currentYear, currentDate.getMonth() - 1, 1));

  const openModalForDate = (day: number) => {
    if (!isPast(day)) {
      setSelectedDateStr(`${currentYear}-${currentDate.getMonth() + 1}-${day}`);
      setShowWorkoutModal(true);
    }
  };

  // --- SAVE WORKOUT (SINGLE OR REPEATING) ---
  const handleScheduleWorkout = async (workout: any, isSingle: boolean) => {
    if (!selectedDateStr) return;

    const [yStr, mStr, dStr] = selectedDateStr.split("-");
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10) - 1;
    const startDay = parseInt(dStr, 10);

    const datesToSave: string[] = [];
    const localStateUpdates: { key: string; workout: any }[] = [];

    let loopDate = new Date(year, month, startDay);
    const loopLimit = isSingle ? 1 : 52; // Loop once for single, 52 times for full year

    for (let i = 0; i < loopLimit; i++) {
      const iterY = loopDate.getFullYear();
      const iterM = String(loopDate.getMonth() + 1).padStart(2, "0");
      const iterD = String(loopDate.getDate()).padStart(2, "0");

      datesToSave.push(`${iterY}-${iterM}-${iterD}`);

      localStateUpdates.push({
        key: `${iterY}-${loopDate.getMonth() + 1}-${loopDate.getDate()}`,
        workout: workout,
      });

      loopDate.setDate(loopDate.getDate() + 7);
    }

    try {
      const response = await fetch(
        "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/calendar.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            workout_id: workout.id,
            user_id: 1, // Fallback
            dates: datesToSave,
          }),
        },
      );

      const result = await response.json();

      if (result.status === "success") {
        // Refetch calendar to ensure we get the fresh 'calendar_id' for accurate single deletion later
        fetchCalendar();
      } else {
        alert("Failed to save to database: " + result.message);
      }
    } catch (err) {
      console.error("Failed to connect to server:", err);
    }

    setShowWorkoutModal(false);
    setSelectedDateStr(null);
  };

  // --- REMOVE WORKOUT (SINGLE OR ALL) ---
  const handleRemoveWorkout = async (
    e: React.MouseEvent,
    calendarId: number,
    workoutId: number,
    isSingle: boolean,
  ) => {
    e.stopPropagation();

    if (isSingle) {
      if (!confirm("Remove this workout from this single day?")) return;
    } else {
      if (
        !confirm(
          "Are you sure you want to remove this workout and ALL its repeating days?",
        )
      )
        return;
    }

    try {
      const response = await fetch(
        "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/calendar.php",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            calendar_id: isSingle ? calendarId : null,
            workout_id: isSingle ? null : workoutId,
            user_id: 1, // Fallback
          }),
        },
      );

      const result = await response.json();

      if (result.status === "success") {
        setScheduledWorkouts((prev) => {
          const nextState = { ...prev };
          for (const dateKey in nextState) {
            if (isSingle) {
              // Filter out the exact instance
              nextState[dateKey] = nextState[dateKey].filter(
                (w) => w.calendar_id !== calendarId,
              );
            } else {
              // Filter out ALL instances of the workout
              nextState[dateKey] = nextState[dateKey].filter(
                (w) => w.id !== workoutId,
              );
            }
            if (nextState[dateKey].length === 0) delete nextState[dateKey];
          }
          return nextState;
        });
      } else {
        alert("Failed to remove: " + result.message);
      }
    } catch (err) {
      console.error("Failed to connect to server:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      {/* Navigation */}
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

      <main className="px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1e293b] mb-1">
              Workout Calendar
            </h1>
            <p className="text-[#64748b]">
              Schedule single days or repeat weekly for a full year.
            </p>
          </div>
          <CalendarIcon className="size-8 text-[#d97706]" />
        </div>

        {/* Calendar Header */}
        <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="size-6 text-[#64748b]" />
          </button>
          <h2 className="text-xl font-bold text-[#1e293b]">
            {currentMonthName} {currentYear}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="size-6 text-[#64748b]" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white shadow-md rounded-b-lg p-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-[#64748b] py-2"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[100px] p-2 bg-gray-50 rounded-lg opacity-50 border border-transparent"
              ></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${currentDate.getMonth() + 1}-${day}`;
              const dayWorkouts = scheduledWorkouts[dateStr] || [];
              const todayFlag = isToday(day);
              const pastFlag = isPast(day);

              const canAdd = !pastFlag;

              return (
                <div
                  key={day}
                  onClick={() => openModalForDate(day)}
                  className={`
                    min-h-[120px] p-2 border rounded-lg flex flex-col transition-all relative overflow-hidden
                    ${canAdd ? "cursor-pointer hover:border-[#d97706] group" : "cursor-default"}
                    ${todayFlag ? "border-[#d97706] bg-[#d97706]/5 shadow-sm" : "border-gray-200"}
                    ${pastFlag && !todayFlag ? "bg-gray-50/80 opacity-80 hover:opacity-100" : "bg-white"}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-bold ${todayFlag ? "text-[#d97706]" : "text-[#1e293b]"}`}
                    >
                      {day}
                    </span>
                    {todayFlag && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#d97706] bg-[#d97706]/10 px-1.5 py-0.5 rounded">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Scheduled Workouts List */}
                  <div className="flex-1 overflow-y-auto space-y-1 mb-6">
                    {dayWorkouts.map((w, idx) => (
                      <div
                        key={idx}
                        className={`text-[10px] font-semibold p-1.5 rounded flex items-center justify-between gap-1 group/item ${pastFlag ? "bg-gray-200 text-gray-700" : "bg-[#d97706]/10 text-[#d97706]"}`}
                      >
                        <div className="flex items-center gap-1 truncate">
                          <Dumbbell className="size-3 shrink-0" />
                          <span className="truncate">{w.name}</span>
                        </div>
                        {/* Remove Workout Buttons */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={(e) =>
                              handleRemoveWorkout(e, w.calendar_id, w.id, true)
                            }
                            className="hover:text-red-500 hover:bg-red-100 p-1 rounded transition-colors"
                            title="Remove from THIS day only"
                          >
                            <X className="size-3" />
                          </button>
                          <button
                            onClick={(e) =>
                              handleRemoveWorkout(e, w.calendar_id, w.id, false)
                            }
                            className="hover:text-red-700 hover:bg-red-100 p-1 rounded transition-colors"
                            title="Remove ALL repeating workouts"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {canAdd && (
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1 text-xs text-[#d97706] font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 py-1 rounded">
                      <Plus className="size-3" /> Add
                    </div>
                  )}
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
              <h2 className="text-lg font-semibold text-[#1e293b]">
                Schedule Workout
              </h2>
              <button
                onClick={() => setShowWorkoutModal(false)}
                className="text-[#64748b] hover:text-[#1e293b]"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="text-sm text-[#64748b] mb-4">
              Choose a workout to add to the calendar.
            </p>

            <div className="space-y-3">
              {trainerWorkouts.length === 0 && (
                <p className="text-center text-sm text-gray-500 py-4">
                  Loading workouts...
                </p>
              )}
              {trainerWorkouts.map((w) => (
                <div
                  key={w.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:border-[#d97706] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1e293b] text-sm">
                        {w.name}
                      </h3>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        by {w.trainer}
                      </p>
                    </div>
                    {/* Schedule Option Buttons */}
                    <div className="flex flex-col gap-1.5 shrink-0 ml-3">
                      <button
                        onClick={() => handleScheduleWorkout(w, true)}
                        className="text-[10px] font-medium bg-[#1e293b] text-white px-2.5 py-1.5 rounded hover:bg-[#334155] transition-colors"
                      >
                        Add Once
                      </button>
                      <button
                        onClick={() => handleScheduleWorkout(w, false)}
                        className="text-[10px] font-medium bg-[#d97706] text-white px-2.5 py-1.5 rounded hover:bg-[#b45309] transition-colors"
                      >
                        Repeat Weekly
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {w.muscleGroups &&
                      w.muscleGroups.map((mg: string) => (
                        <span
                          key={mg}
                          className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                        >
                          {mg}
                        </span>
                      ))}
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
