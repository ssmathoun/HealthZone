# HealthZone 🏋️‍♂️

> **Standardize your fitness journey and community engagement.**

HealthZone is a full-stack health and fitness web application designed to bridge the gap between trainer-led routines and community engagement. Developed as a **0-to-1 MVP**, the project prioritizes a robust relational data schema and secure backend infrastructure to handle complex user interactions and real-time fitness telemetry.

---

## 👥 Team & Agile Methodology
This project was developed by a specialized **5-person team** (4 Developers, 1 Project Manager) operating under a strict **Scrum framework**. 

* **Agile Rituals:** The team utilized bi-weekly Sprint Planning, Daily Stand-ups, and Sprint Retrospectives to maintain high velocity and adapt to shifting requirements.
* **Project Management:** Progress was managed via **Scrum Boards** to track a backlog of features, ensuring a cohesive launch of the MVP within a 14-week cycle.
* **Engineering Culture:** The development cycle focused on balancing the speed of an MVP launch with the technical rigor required for secure, production-ready systems.

## 👨‍💻 My Full-Stack Ownership
While this was an equal-contribution team effort where all developers worked full-stack, I took end-to-end ownership (from MySQL schema to React UI) of several core systems:

* **User Identity & Profile Pipeline:** Built the complete user profile lifecycle. Engineered the secure PHP signup backend, developed the responsive React profile UI, and implemented dynamic "Bio" data flows that propagate throughout the application.
* **Fitness Telemetry & Logistics:** Developed the end-to-end **Sleep Tracker** module and architected complex workout management state. This included building advanced frontend sort/filter algorithms for workout discovery, full-stack "Favorite" workout toggles, and secure backend deletion logic.
* **Community Social Graph:** Engineered the interactive forum features, specifically designing the full-stack bookmarking system (wiring React UI state to the PHP/PDO backend) and dynamically linking user profiles to forum activity to enhance community engagement.

---

## ✨ Features
* **Interactive Workout Execution:** Real-time tracking that allows users to check off sets and reps with persistent state throughout the session.
* **Data Visualization Dashboards:** Integrated **Recharts** for rendering dynamic progress charts, including daily exercise streaks and caloric burn history.
* **Trainer-Guided Discovery:** Advanced filtering and sorting systems to discover workouts by difficulty, duration, and caloric output.
* **Community Intelligence:** A "Social Graph" lite allowing users to engage in forums, view public profiles, and bookmark favorites.

## 🛡️ Engineering Rigor & Security
* **Accessible UI Architecture:** Built with **Radix UI** primitives and **Tailwind CSS** to ensure a highly accessible, unstyled component foundation.
* **Optimized State & Forms:** Utilized **React Hook Form** to minimize re-renders during complex workout logging and profile updates.
* **Data Integrity:** Strict use of **PDO Prepared Statements** across all endpoints to ensure database security.
* **Authentication:** Industry-standard `password_hash()` and `password_verify()` for secure credential storage.
* **Authorization Gates:** Backend logic ensures users can only modify or access data belonging to their unique User ID.

## 🛠️ Tech Stack
* **Frontend:** React 19, TypeScript, Vite, React Router DOM v7
* **UI/Styling:** Tailwind CSS v4, Radix UI, Lucide React, Recharts, Sonner
* **Backend:** PHP 8+ (RESTful API), PDO
* **Database:** MySQL (Relational Schema)
* **DevOps:** Environment abstraction via `autoload.php` for seamless deployment.

---

## 📁 Project Structure
```plaintext
repository-root/
├── healthzone/             # Frontend React application (Vite)
│   ├── public/             # Static frontend assets
│   ├── src/                # Component-driven React code
│   │   ├── components/     # Radix UI & generic modules
│   │   ├── hooks/          # Custom React hooks (Forms, Auth)
│   │   ├── pages/          # Main views (Workouts, Profile, Community)
│   │   └── styles/         # Tailwind CSS configurations
│   ├── schema.sql          # Relational database schema initialization
│   └── package.json        # Frontend dependencies
└── php/                    # Backend RESTful API
    ├── autoload.php        # Database connection & environment config
    ├── profile.php         # Identity & Profile Management
    ├── workouts.php        # The Core Execution Engine
    ├── posts.php           # Social/Community Logic
    └── [*.php]             # Additional service endpoints
```

## 🚀 Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ssmathoun/HealthZone.git
   ```
2. **Schema Initialization**
Import the provided `healthzone/schema.sql` into your MySQL environment to set up the necessary tables and relational constraints.

3. **Environment Configuration**
Map the `API_BASE` in the React frontend to point to your local PHP service layer (e.g., `http://localhost/php/`).

4. **Build the Frontend**

```bash
cd healthzone
npm install
npm run build
```

**Full-Stack Developer:** Shabad Singh Mathoun (Senior CS @ University at Buffalo)

**Project Context:** Developed for CSE 442 (Software Engineering) | May 2026
