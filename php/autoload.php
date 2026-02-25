<?php

// 1. Initialize the session for the entire application
session_start();

// 2. Database Configuration for Team V
$host = 'localhost';
$db   = 'cse442_2026_spring_team_v_db';
$user = 'radinhas';
$pass = '50534181';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

// 3. PDO Options for security and error handling
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $connection = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     // In production, you might want to log this instead of echoing
     die("Database Connection Error: " . $e->getMessage());
}

// 4. Include common functions (Optional but recommended)
// include "functions.php";