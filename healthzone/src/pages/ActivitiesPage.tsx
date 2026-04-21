import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import { UPCOMING_ACTIVITIES } from "../lib/activities";

export function ActivitiesPage() {
  const navigate = useNavigate();

  const totalParticipants = UPCOMING_ACTIVITIES.reduce(
    (sum, activity) => sum + activity.participants,
    0,
  );

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
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-[#d97706]" />
            <span className="text-white font-semibold text-base">
              Activities
            </span>
          </div>
          <div className="w-9" />
        </div>
      </nav>

      <main className="px-4 py-4 max-w-5xl mx-auto">
        <section className="bg-gradient-to-br from-[#1e293b] to-[#334155] text-white rounded-2xl shadow-md p-5 mb-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70 mb-2">
            This Week
          </p>
          <h1 className="text-2xl font-bold mb-2">Upcoming Activities</h1>
          <p className="text-sm text-white/80 max-w-2xl">
            Browse what is happening around campus and in the HealthZone
            community. These events are seeded for the story, so there are
            already activities ready to view.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/70 mb-1">
                Total Events
              </p>
              <p className="text-xl font-bold">{UPCOMING_ACTIVITIES.length}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/70 mb-1">
                People Going
              </p>
              <p className="text-xl font-bold">{totalParticipants}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-[10px] uppercase tracking-wide text-white/70 mb-1">
                Next Event
              </p>
              <p className="text-base font-bold">
                {UPCOMING_ACTIVITIES[0]?.schedule ?? "Soon"}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {UPCOMING_ACTIVITIES.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#d97706]/10 flex items-center justify-center text-2xl shrink-0">
                  {activity.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-[#1e293b]">
                        {activity.name}
                      </p>
                      <p className="text-sm text-[#64748b]">
                        {activity.group}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#d97706] bg-[#d97706]/10 px-3 py-1 rounded-full whitespace-nowrap">
                      {activity.schedule}
                    </span>
                  </div>

                  <p className="text-sm text-[#475569] mt-3 mb-4">
                    {activity.description}
                  </p>

                  <div className="grid gap-2 text-sm text-[#64748b] sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-[#d97706]" />
                      <span>{activity.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-[#d97706]" />
                      <span>{activity.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-[#d97706]" />
                      <span>{activity.participants} going</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
