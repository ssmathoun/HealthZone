-- Run this in your database to create the required tables
-- =========================================================
-- CHALLENGES & LEADERBOARD
-- NOTE: challenges/user_challenges are auto-created by challenges_support.php
-- Only run these if setting up the DB manually.
-- =========================================================

-- challenges table (managed by challenges_support.php)
CREATE TABLE IF NOT EXISTS challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    icon_name VARCHAR(40) NOT NULL DEFAULT 'trophy',
    metric_key VARCHAR(40) NOT NULL DEFAULT 'workouts_completed',
    target_value INT NOT NULL DEFAULT 1,
    unit_label VARCHAR(40) NOT NULL DEFAULT 'workouts',
    points_reward INT NOT NULL DEFAULT 100,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- user_challenges table (managed by challenges_support.php)
CREATE TABLE IF NOT EXISTS user_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT NOT NULL,
    progress INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_challenge (user_id, challenge_id),
    KEY idx_user_challenges_user (user_id),
    KEY idx_user_challenges_challenge (challenge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- user_points table (managed by challenges_support.php)
CREATE TABLE IF NOT EXISTS user_points (
    user_id INT PRIMARY KEY,
    total_points INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================

CREATE TABLE IF NOT EXISTS meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    meal_type VARCHAR(50) DEFAULT 'lunch',
    calories INT DEFAULT 0,
    protein INT DEFAULT 0,
    carbs INT DEFAULT 0,
    fat INT DEFAULT 0,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_date (user_id, logged_at)
);

CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'Lunch',
    calories INT DEFAULT 0,
    protein INT DEFAULT 0,
    carbs INT DEFAULT 0,
    fat INT DEFAULT 0,
    prep_time VARCHAR(50) DEFAULT '15 min',
    servings INT DEFAULT 4,
    ingredients TEXT,
    instructions TEXT,
    image VARCHAR(500) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id)
);
