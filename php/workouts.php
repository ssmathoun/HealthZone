<?php
require "autoload.php";
require_once "challenges_support.php";

// Set up dynamic CORS to support credentials (sessions) from the React frontend
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight CORS requests from React
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

// Get the logged-in user from the session, fallback to 1 for local testing if needed
$current_user_id = $_SESSION['user_id'] ?? $data['user_id'] ?? 1;

try {
    // ========================================================================
    // 1. FETCH WORKOUTS (Trainer Premade + User's Custom)
    // ========================================================================
    if ($method === 'GET' && $action === 'get_premade_workouts') {
        
        $query = "
        SELECT w.id, w.name, w.difficulty, w.duration_min as duration, w.calories_burned as calories, 
               u.username as trainer,
               EXISTS(SELECT 1 FROM workout_favorites f WHERE f.workout_id = w.id AND f.user_id = :user_id) as is_favorite
        FROM workouts w
        JOIN users u ON w.trainer_id = u.id
        WHERE u.role = 'trainer' OR w.trainer_id = :user_id
        ORDER BY w.id DESC
        ";
        $stm = $connection->prepare($query);
        $stm->execute(['user_id' => $current_user_id]);
        
        // Force fetch as associative array to be safe
        $workouts = $stm->fetchAll(PDO::FETCH_ASSOC); 

        // Use a standard loop index to avoid reference (&) syntax errors
        for ($i = 0; $i < count($workouts); $i++) {
            $workoutId = $workouts[$i]['id'];
            
            $exQuery = "SELECT name, sets, reps, rest_time as rest, weight FROM workout_exercises WHERE workout_id = :workout_id";
            $exStm = $connection->prepare($exQuery);
            $exStm->execute(['workout_id' => $workoutId]);
            
            $workouts[$i]['exercises'] = $exStm->fetchAll(PDO::FETCH_ASSOC);
            $workouts[$i]['muscleGroups'] = ["Full Body"]; 
            
            // Ensure is_favorite is a boolean for React
            $workouts[$i]['is_favorite'] = (bool)$workouts[$i]['is_favorite'];
        }
        
        echo json_encode($workouts);
        exit;
    }

    // ========================================================================
    // 2. CREATE CUSTOM WORKOUT
    // ========================================================================
    if ($method === 'POST' && $action === 'create_workout') {
        
        $name = $data['name'] ?? 'Custom Workout';
        $difficulty = $data['difficulty'] ?? 'Intermediate';
        $duration = $data['duration'] ?? 30;
        $calories = $data['calories'] ?? 240;
        $exercises = $data['exercises'] ?? [];

        // Start a database transaction so if exercises fail, the whole workout fails cleanly
        $connection->beginTransaction();

        // Insert into workouts table (trainer_id just acts as the creator's ID here)
        $query = "INSERT INTO workouts (trainer_id, name, difficulty, duration_min, calories_burned) 
                  VALUES (:user_id, :name, :difficulty, :duration, :calories)";
        $stm = $connection->prepare($query);
        $stm->execute([
            'user_id' => $current_user_id,
            'name' => $name,
            'difficulty' => $difficulty,
            'duration' => $duration,
            'calories' => $calories
        ]);

        // Get the ID of the workout we just created
        $workout_id = $connection->lastInsertId();

        // Insert all the nested exercises into the workout_exercises table
        if (!empty($exercises)) {
            $exQuery = "INSERT INTO workout_exercises (workout_id, name, sets, reps, rest_time, weight) 
                        VALUES (:workout_id, :name, :sets, :reps, :rest_time, :weight)";
            $exStm = $connection->prepare($exQuery);

            foreach ($exercises as $ex) {
                $exStm->execute([
                    'workout_id' => $workout_id,
                    'name' => $ex['name'],
                    'sets' => $ex['sets'],
                    'reps' => $ex['reps'],
                    'rest_time' => $ex['rest'], // Frontend uses 'rest'
                    'weight' => $ex['weight']
                ]);
            }
        }

        // Commit the transaction to save to the database
        $connection->commit();

        echo json_encode(["status" => "success", "id" => $workout_id, "message" => "Workout created!"]);
        exit;
    }

    // ========================================================================
    // 3. LOG FINISHED WORKOUT
    // ========================================================================
    if ($method === 'POST' && $action === 'finish_workout') {
        
        $workout_id = $data['workout_id'] ?? null;

        if (empty($workout_id) || empty($current_user_id)) {
            echo json_encode(["status" => "error", "message" => "User ID and Workout ID are required."]);
            exit;
        }

        // Ensure challenge tables exist before opening the workout transaction.
        ensure_challenges_tables($connection);

        $connection->beginTransaction();

        // Store the record that this user completed this template
        $query = "INSERT INTO user_workout_logs (user_id, workout_id) VALUES (:user_id, :workout_id)";
        $stm = $connection->prepare($query);
        
        if ($stm->execute(['user_id' => $current_user_id, 'workout_id' => $workout_id])) {
            increment_workout_challenge_progress($connection, (int) $current_user_id);
            $connection->commit();
            echo json_encode(["status" => "success", "message" => "Workout logged successfully!"]);
        } else {
            $connection->rollBack();
            echo json_encode(["status" => "error", "message" => "Failed to log workout."]);
        }
        exit;
    }

    if ($method === 'POST' && $action === 'toggle_favorite') {
        $workout_id = $data['workout_id'] ?? null;
        if (!$workout_id) { echo json_encode(["status" => "error", "message" => "ID required"]); exit; }
    
        $check = $connection->prepare("SELECT id FROM workout_favorites WHERE user_id = :uid AND workout_id = :wid");
        $check->execute(['uid' => $current_user_id, 'wid' => $workout_id]);
        $existing = $check->fetch(PDO::FETCH_ASSOC); // Fetch as array
    
        if ($existing) {
            $connection->prepare("DELETE FROM workout_favorites WHERE id = :id")->execute(['id' => $existing['id']]);
            $fav = false;
        } else {
            $connection->prepare("INSERT INTO workout_favorites (user_id, workout_id) VALUES (:uid, :wid)")->execute(['uid' => $current_user_id, 'wid' => $workout_id]);
            $fav = true;
        }
        echo json_encode(["status" => "success", "is_favorite" => $fav]);
        exit;
    }

    echo json_encode(["status" => "error", "message" => "Invalid action specified."]);

} catch (PDOException $e) {
    // Rollback the transaction if something fails during the create_workout loop
    if ($connection->inTransaction()) {
        $connection->rollBack();
    }
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
?>
