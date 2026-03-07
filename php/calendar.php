<?php
require "autoload.php";

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

// 1. Try to get user from Session (Multiple Users support)
// 2. Fallback to passed user_id (Local Dev support)
$user_id = $_SESSION['user_id'] ?? $data['user_id'] ?? $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["status" => "error", "message" => "Unauthorized - No user ID found. Please log in."]);
    exit;
}

try {
    // GET: Fetch all scheduled workouts for this specific user
    if ($method === 'GET') {
        $query = "
            SELECT c.id as calendar_id, c.scheduled_date, w.id, w.name, w.difficulty, u.username as trainer 
            FROM calendar c
            JOIN workouts w ON c.workout_id = w.id
            JOIN users u ON w.trainer_id = u.id
            WHERE c.user_id = :user_id
            ORDER BY c.scheduled_date ASC
        ";
        $stm = $connection->prepare($query);
        $stm->execute(['user_id' => $user_id]);
        $results = $stm->fetchAll();
        
        echo json_encode(["status" => "success", "data" => $results]);
        exit;
    }

    // POST: Save a workout to multiple dates
    if ($method === 'POST') {
        $workout_id = $data['workout_id'] ?? null;
        $dates = $data['dates'] ?? []; 

        if (!$workout_id || empty($dates)) {
            echo json_encode(["status" => "error", "message" => "Workout ID and dates are required."]);
            exit;
        }

        $connection->beginTransaction();
        $query = "INSERT INTO calendar (user_id, workout_id, scheduled_date) VALUES (:user_id, :workout_id, :scheduled_date)";
        $stm = $connection->prepare($query);

        foreach ($dates as $date) {
            $formatted_date = date('Y-m-d', strtotime($date));
            $stm->execute([
                'user_id' => $user_id,
                'workout_id' => $workout_id,
                'scheduled_date' => $formatted_date
            ]);
        }
        $connection->commit();

        echo json_encode(["status" => "success", "message" => "Workout scheduled successfully!"]);
        exit;
    }

    // DELETE: Remove a single workout OR all its repeating days
    if ($method === 'DELETE') {
        $workout_id = $data['workout_id'] ?? null;
        $calendar_id = $data['calendar_id'] ?? null;

        if ($calendar_id) {
            // Remove just the SINGLE instance of this workout on a specific day
            $query = "DELETE FROM calendar WHERE user_id = :user_id AND id = :calendar_id";
            $stm = $connection->prepare($query);
            $stm->execute([
                'user_id' => $user_id,
                'calendar_id' => $calendar_id
            ]);
            echo json_encode(["status" => "success", "message" => "Single workout instance removed!"]);
            exit;
        } 
        else if ($workout_id) {
            // Remove ALL repeating instances of this workout for this user
            $query = "DELETE FROM calendar WHERE user_id = :user_id AND workout_id = :workout_id";
            $stm = $connection->prepare($query);
            $stm->execute([
                'user_id' => $user_id,
                'workout_id' => $workout_id
            ]);
            echo json_encode(["status" => "success", "message" => "All recurring workouts removed!"]);
            exit;
        } 
        else {
            echo json_encode(["status" => "error", "message" => "Missing IDs to delete."]);
            exit;
        }
    }

} catch (PDOException $e) {
    if ($connection->inTransaction()) {
        $connection->rollBack();
    }
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}