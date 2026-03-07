-- Run this in your database to create the required tables

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
