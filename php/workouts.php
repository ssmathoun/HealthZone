<?php
require "autoload.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

try {
    // ========================================================================
    // 1. FETCH PREMADE WORKOUTS (User presses "Log Workout")
    if ($method === 'GET' && $action === 'get_premade_workouts') {
        
        // Fetch all workouts and get the trainer's username
        $query = "
            SELECT w.id, w.name, w.difficulty, w.duration_min as duration, w.calories_burned as calories, 
                   u.username as trainer 
            FROM workouts w
            JOIN users u ON w.trainer_id = u.id
        ";
        $stm = $connection->query($query);
        $workouts = $stm->fetchAll(); // Returns objects due to PDO::FETCH_OBJ in your autoload.php

        // Loop through each workout to attach its exercises
        foreach ($workouts as $workout) {
            $exQuery = "SELECT name, sets, reps, rest_time as rest, weight FROM workout_exercises WHERE workout_id = :workout_id";
            $exStm = $connection->prepare($exQuery);
            $exStm->execute(['workout_id' => $workout->id]);
            
            $workout->exercises = $exStm->fetchAll();
            
            // Add mock muscle groups array so your React frontend maps over it without crashing
            $workout->muscleGroups = ["Full Body"]; 
        }
        
        echo json_encode($workouts);
        exit;
    }

    // ========================================================================
    // 2. LOG FINISHED WORKOUT (User presses "Finish Workout")
    // ========================================================================
    if ($method === 'POST' && $action === 'finish_workout') {
        
        $workout_id = $data['workout_id'] ?? null;
        
        // Grab user_id from session (set in your login.php). 
        // Fallback to JSON payload if session isn't carrying over due to local dev CORS.
        $user_id = $_SESSION['user_id'] ?? $data['user_id'] ?? null;

        if (empty($workout_id) || empty($user_id)) {
            echo json_encode(["status" => "error", "message" => "User ID and Workout ID are required."]);
            exit;
        }

        // Store the record that this user completed this trainer's workout
        $query = "INSERT INTO user_workout_logs (user_id, workout_id) VALUES (:user_id, :workout_id)";
        $stm = $connection->prepare($query);
        
        if ($stm->execute(['user_id' => $user_id, 'workout_id' => $workout_id])) {
            echo json_encode(["status" => "success", "message" => "Workout logged successfully!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to log workout."]);
        }
        exit;
    }

    echo json_encode(["status" => "error", "message" => "Invalid action specified."]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>