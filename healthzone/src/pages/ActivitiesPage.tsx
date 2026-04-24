import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Plus } from "lucide-react";
import {
  ACTIVITIES_UPDATED_EVENT,
  ActivityEvent,
  createActivityEvent,
  formatActivitySchedule,
  getActivityEvents,
} from "../lib/activities";

const EMPTY_FORM = {
  name: "",
  location: "",
  startsAt: "",
  description: "",
};

export function ActivitiesPage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityEvent[]>(() =>
    getActivityEvents(),
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const syncActivities = () => {
      setActivities(getActivityEvents());
    };

    window.addEventListener("storage", syncActivities);
    window.addEventListener(ACTIVITIES_UPDATED_EVENT, syncActivities);

    return () => {
      window.removeEventListener("storage", syncActivities);
      window.removeEventListener(ACTIVITIES_UPDATED_EVENT, syncActivities);
    };
  }, []);

  const creatorCount = new Set(
    activities.map((activity) => activity.createdBy),
  ).size;

  const handleCreateEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.location.trim() ||
      !form.startsAt.trim() ||
      !form.description.trim()
    ) {
      setFormError("Fill out every field to create your event.");
      return;
    }

    if (Number.isNaN(new Date(form.startsAt).getTime())) {
      setFormError("Choose a valid date and time.");
      return;
    }

    createActivityEvent(form);
    setActivities(getActivityEvents());
    setForm(EMPTY_FORM);
    setFormError("");
    setShowCreateForm(false);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="sticky top-0 z-50 bg-[#1e293b] shadow-md">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-full p-2 text-white hover:bg-white/10"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-[#d97706]" />
            <span className="text-base font-semibold text-white">
              Activities
            </span>
          </div>
          <div className="w-9" />
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-4">
        <section className="mb-5 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#334155] p-5 text-white shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/70">
                Community Plans
              </p>
              <h1 className="mb-2 text-2xl font-bold">Create Your Own Event</h1>
              <p className="max-w-2xl text-sm text-white/80">
                Only events created by HealthZone members show up here now.
                Start something new, share the plan, and keep the activities
                page focused on member-created events.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCreateForm((current) => !current);
                setFormError("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d97706] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#b45309] sm:self-center"
            >
              <Plus className="size-4" />
              {showCreateForm ? "Hide Form" : "Create Event"}
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="mb-1 text-[10px] uppercase tracking-wide text-white/70">
                Total Events
              </p>
              <p className="text-xl font-bold">{activities.length}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="mb-1 text-[10px] uppercase tracking-wide text-white/70">
                Active Hosts
              </p>
              <p className="text-xl font-bold">{creatorCount}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="mb-1 text-[10px] uppercase tracking-wide text-white/70">
                Next Event
              </p>
              <p className="text-base font-bold">
                {activities[0]
                  ? formatActivitySchedule(activities[0].startsAt)
                  : "Create one"}
              </p>
            </div>
          </div>
        </section>

        {showCreateForm ? (
          <section className="mb-5 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#1e293b]">
                Create an event
              </h2>
              <p className="mt-1 text-sm text-[#64748b]">
                Add your own activity so it appears in the upcoming events list.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleCreateEvent}>
              <div className="space-y-2">
                <label
                  htmlFor="activity-name"
                  className="block text-sm font-medium text-[#1e293b]"
                >
                  Event name
                </label>
                <input
                  id="activity-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Flag Football Game"
                  className="h-10 w-full rounded-md border border-[#cbd5e1] bg-white px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="activity-location"
                  className="block text-sm font-medium text-[#1e293b]"
                >
                  Location
                </label>
                <input
                  id="activity-location"
                  value={form.location}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  placeholder="Big Park"
                  className="h-10 w-full rounded-md border border-[#cbd5e1] bg-white px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="activity-starts-at"
                  className="block text-sm font-medium text-[#1e293b]"
                >
                  Date and time
                </label>
                <input
                  id="activity-starts-at"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      startsAt: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-[#cbd5e1] bg-white px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="activity-description"
                  className="block text-sm font-medium text-[#1e293b]"
                >
                  Description
                </label>
                <textarea
                  id="activity-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="A fun flag football game for anyone who wants to join."
                  className="min-h-28 w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-sm text-[#0f172a] outline-none transition focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20"
                />
              </div>

              {formError ? (
                <p className="text-sm font-medium text-red-600">{formError}</p>
              ) : null}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setForm(EMPTY_FORM);
                    setFormError("");
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-[#cbd5e1] px-4 py-2 text-sm font-medium text-[#1e293b] transition hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-[#d97706] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#b45309]"
                >
                  Create Event
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {activities.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-[#1e293b]">
              No user-created events yet
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#64748b]">
              Create the first event for the community and it will show up here
              for everyone to browse.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-[#d97706] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#b45309]"
            >
              <Plus className="size-4" />
              Create Your First Event
            </button>
          </section>
        ) : (
          <section className="space-y-3">
            {activities.map((activity) => {
              return (
                <div
                  key={activity.id}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-md sm:p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#d97706]/10 text-[#d97706]">
                      <Calendar className="size-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-[#1e293b]">
                            {activity.name}
                          </p>
                          <p className="text-sm text-[#64748b]">
                            Created by {activity.createdBy}
                          </p>
                        </div>
                        <span className="whitespace-nowrap rounded-full bg-[#d97706]/10 px-3 py-1 text-xs font-semibold text-[#d97706]">
                          {formatActivitySchedule(activity.startsAt)}
                        </span>
                      </div>

                      <p className="mb-4 mt-3 text-sm text-[#475569]">
                        {activity.description}
                      </p>

                      <div className="grid gap-2 text-sm text-[#64748b] sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-[#d97706]" />
                          <span>{formatActivitySchedule(activity.startsAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4 text-[#d97706]" />
                          <span>{activity.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
