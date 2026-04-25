export type ActivityEvent = {
  id: string;
  name: string;
  location: string;
  startsAt: string;
  description: string;
  createdBy: string;
  rsvpCount: number;
  createdAt: string;
};

export type CreateActivityEventInput = {
  name: string;
  location: string;
  startsAt: string;
  description: string;
  createdBy?: string;
};

const ACTIVITIES_KEY = "healthzone-user-activities";
const RSVP_EVENT_IDS_KEY = "healthzone-rsvp-event-ids";
export const ACTIVITIES_UPDATED_EVENT = "healthzone:activities-updated";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNonEmptyString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function toNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeActivityEvent(value: unknown): ActivityEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  const legacyLocation = toNonEmptyString(value.address) || toNonEmptyString(value.location);
  const createdBy =
    toNonEmptyString(value.createdBy) ||
    toNonEmptyString(value.group) ||
    "HealthZone member";
  const startsAt =
    toNonEmptyString(value.startsAt) ||
    toNonEmptyString(value.schedule) ||
    new Date().toISOString();

  const name = toNonEmptyString(value.name);
  const description = toNonEmptyString(value.description, "No description provided.");

  if (!name) {
    return null;
  }

  return {
    id: String(value.id ?? `activity-${Date.now()}`),
    name,
    location: legacyLocation || "Location TBD",
    startsAt,
    description,
    createdBy,
    rsvpCount: Math.max(
      0,
      toNumber(value.rsvpCount, toNumber(value.participants, 0)),
    ),
    createdAt: toNonEmptyString(value.createdAt, new Date().toISOString()),
  };
}

function normalizeActivityEvents(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((event) => normalizeActivityEvent(event))
    .filter((event): event is ActivityEvent => event !== null);
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures so the UI does not crash in restricted browsers.
  }
}

function notifyActivitiesUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.dispatchEvent(new Event(ACTIVITIES_UPDATED_EVENT));
  } catch {
    // Ignore dispatch failures in older or restricted environments.
  }
}

function sortActivities(activities: ActivityEvent[]) {
  return [...activities].sort(
    (a, b) =>
      new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime() ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getActivityEvents() {
  return sortActivities(normalizeActivityEvents(readJson<unknown>(ACTIVITIES_KEY, [])));
}

export function createActivityEvent({
  name,
  location,
  startsAt,
  description,
  createdBy = "You",
}: CreateActivityEventInput) {
  const nextEvent: ActivityEvent = {
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `activity-${Date.now()}`,
    name: name.trim(),
    location: location.trim(),
    startsAt,
    description: description.trim(),
    createdBy,
    rsvpCount: 0,
    createdAt: new Date().toISOString(),
  };

  const nextEvents = sortActivities([nextEvent, ...getActivityEvents()]);
  writeJson(ACTIVITIES_KEY, nextEvents);
  notifyActivitiesUpdated();
  return nextEvent;
}

export function getRsvpedActivityIds() {
  const value = readJson<unknown>(RSVP_EVENT_IDS_KEY, []);
  return Array.isArray(value)
    ? value.filter((eventId): eventId is string => typeof eventId === "string")
    : [];
}

export function isActivityRsvped(eventId: string) {
  return getRsvpedActivityIds().includes(eventId);
}

export function toggleActivityRsvp(eventId: string) {
  const rsvpedIds = new Set(getRsvpedActivityIds());
  const isGoing = rsvpedIds.has(eventId);
  const nextRsvpedIds = new Set(rsvpedIds);

  if (isGoing) {
    nextRsvpedIds.delete(eventId);
  } else {
    nextRsvpedIds.add(eventId);
  }

  const nextEvents = getActivityEvents().map((event) => {
    if (event.id !== eventId) {
      return event;
    }

    return {
      ...event,
      rsvpCount: Math.max(0, event.rsvpCount + (isGoing ? -1 : 1)),
    };
  });

  writeJson(ACTIVITIES_KEY, nextEvents);
  writeJson(RSVP_EVENT_IDS_KEY, [...nextRsvpedIds]);
  notifyActivitiesUpdated();

  return {
    events: sortActivities(nextEvents),
    rsvpedIds: [...nextRsvpedIds],
  };
}

export function formatActivitySchedule(startsAt: string) {
  const eventDate = new Date(startsAt);

  if (Number.isNaN(eventDate.getTime())) {
    return "Date TBD";
  }

  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffInDays = Math.round(
    (eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const timeLabel = eventDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (diffInDays === 0) {
    return `Today, ${timeLabel}`;
  }

  if (diffInDays === 1) {
    return `Tomorrow, ${timeLabel}`;
  }

  return eventDate.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
