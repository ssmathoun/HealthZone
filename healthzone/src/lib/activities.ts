export type ActivityEvent = {
  id: number;
  name: string;
  group: string;
  schedule: string;
  location: string;
  address: string;
  participants: number;
  icon: string;
  description: string;
};

export const UPCOMING_ACTIVITIES: ActivityEvent[] = [
  {
    id: 1,
    name: "Basketball Game",
    group: "FitSquad",
    schedule: "Today, 6:00 PM",
    location: "Alumni Arena",
    address: "Main Court, Alumni Arena",
    participants: 8,
    icon: "🏀",
    description: "Join a competitive pickup game and meet other hoopers.",
  },
  {
    id: 2,
    name: "Morning Run",
    group: "Runners United",
    schedule: "Tomorrow, 6:30 AM",
    location: "Delaware Park",
    address: "Ring Road entrance, Delaware Park",
    participants: 12,
    icon: "🏃",
    description: "Easy-paced group run with a coffee stop after the cooldown.",
  },
  {
    id: 3,
    name: "Yoga Session",
    group: "Yoga Warriors",
    schedule: "Sat, 9:00 AM",
    location: "Student Union",
    address: "Wellness Room 204, Student Union",
    participants: 15,
    icon: "🧘",
    description: "Reset with a guided morning flow focused on mobility and breath.",
  },
  {
    id: 4,
    name: "HIIT Bootcamp",
    group: "Campus Burn",
    schedule: "Mon, 7:00 AM",
    location: "Clark Hall Track",
    address: "North entrance, Clark Hall Track",
    participants: 18,
    icon: "🔥",
    description: "Fast-paced interval circuit to kick off the week strong.",
  },
  {
    id: 5,
    name: "Cycling Meetup",
    group: "Pedal Crew",
    schedule: "Mon, 5:30 PM",
    location: "Ellicott Bike Station",
    address: "Bike rack plaza, Ellicott Complex",
    participants: 9,
    icon: "🚴",
    description: "Neighborhood loop ride with beginner-friendly pacing.",
  },
  {
    id: 6,
    name: "Powerlifting Workshop",
    group: "Barbell Club",
    schedule: "Tue, 6:00 PM",
    location: "Alumni Arena",
    address: "Weight Room A, Alumni Arena",
    participants: 14,
    icon: "🏋️",
    description: "Form breakdowns for squat, bench, and deadlift with spotters.",
  },
  {
    id: 7,
    name: "Meal Prep Hangout",
    group: "Meal Preppers",
    schedule: "Wed, 5:00 PM",
    location: "Student Union Kitchen",
    address: "Demo Kitchen, Student Union Lower Level",
    participants: 11,
    icon: "🥗",
    description: "Swap quick recipe ideas and prep a few balanced meals together.",
  },
  {
    id: 8,
    name: "Zumba Night",
    group: "Dance Fit",
    schedule: "Thu, 7:30 PM",
    location: "Dance Studio",
    address: "Studio B, Recreation Center",
    participants: 20,
    icon: "💃",
    description: "High-energy cardio session with beginner and intermediate tracks.",
  },
  {
    id: 9,
    name: "Recovery Stretch Lab",
    group: "Move Better",
    schedule: "Fri, 4:00 PM",
    location: "Rec Center Studio B",
    address: "Stretching Zone, Recreation Center",
    participants: 10,
    icon: "🤸",
    description: "Guided stretching and recovery work for sore legs and tight hips.",
  },
  {
    id: 10,
    name: "Beginner Swim Clinic",
    group: "Lap Squad",
    schedule: "Sun, 10:00 AM",
    location: "Alumni Pool",
    address: "Lane 3 check-in, Alumni Pool",
    participants: 7,
    icon: "🏊",
    description: "Work on comfort in the water, breathing, and lap fundamentals.",
  },
];
