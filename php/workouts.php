<?php
require "autoload.php";
require_once "challenges_support.php";

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);
$current_user_id = $_SESSION['user_id'] ?? $data['user_id'] ?? 1;

try {
    if ($method === 'GET' && $action === 'get_premade_workouts') {
        $query = "
            SELECT w.id, w.name, w.difficulty, w.duration_min as duration, w.calories_burned as calories, 
                   u.username as trainer,
                   EXISTS(SELECT 1 FROM workout_favorites f WHERE f.workout_id = w.id AND f.user_id = :uid1) as is_favorite
            FROM workouts w
            JOIN users u ON w.trainer_id = u.id
            WHERE u.role = 'trainer' OR w.trainer_id = :uid2
            ORDER BY w.id DESC
        ";
        $stm = $connection->prepare($query);
        $stm->execute([
            'uid1' => $current_user_id,
            'uid2' => $current_user_id
        ]);
        
        $workouts = $stm->fetchAll(PDO::FETCH_ASSOC); 
        $result = [];

        foreach ($workouts as $row) {
            $exQuery = "SELECT name, sets, reps, rest_time as rest, weight FROM workout_exercises WHERE workout_id = :workout_id";
            $exStm = $connection->prepare($exQuery);
            $exStm->execute(['workout_id' => $row['id']]);
            
            $row['exercises'] = $exStm->fetchAll(PDO::FETCH_ASSOC);
            $row['muscleGroups'] = ["Full Body"]; 
            $row['is_favorite'] = (bool)$row['is_favorite'];
            
            $result[] = $row;
        }
        
        echo json_encode($result);
        exit;
    }

    if ($method === 'POST' && $action === 'create_workout') {
        $name = $data['name'] ?? 'Custom Workout';
        $difficulty = $data['difficulty'] ?? 'Intermediate';
        $duration = $data['duration'] ?? 30;
        $calories = $data['calories'] ?? 240;
        $exercises = $data['exercises'] ?? [];

        $connection->beginTransaction();

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

        $workout_id = $connection->lastInsertId();

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
                    'rest_time' => $ex['rest'],
                    'weight' => $ex['weight']
                ]);
            }
        }

        $connection->commit();
        echo json_encode(["status" => "success", "id" => $workout_id]);
        exit;
    }

    if ($method === 'POST' && $action === 'finish_workout') {
        $workout_id = $data['workout_id'] ?? null;

        if (empty($workout_id) || empty($current_user_id)) {
            echo json_encode(["status" => "error", "message" => "Required fields missing"]);
            exit;
        }

        ensure_challenges_tables($connection);
        $connection->beginTransaction();

        $query = "INSERT INTO user_workout_logs (user_id, workout_id, completed_at) VALUES (:user_id, :workout_id, NOW())";
        $stm = $connection->prepare($query);
        
        if ($stm->execute(['user_id' => $current_user_id, 'workout_id' => $workout_id])) {
            increment_workout_challenge_progress($connection, (int) $current_user_id);
            $connection->commit();
            echo json_encode(["status" => "success"]);
        } else {
            $connection->rollBack();
            echo json_encode(["status" => "error"]);
        }
        exit;
    }

    if ($method === 'GET' && $action === 'get_history') {
        try {
            $stmt = $connection->prepare("
                SELECT uwl.id, w.name, w.difficulty,
                       w.duration_min AS duration,
                       w.calories_burned AS calories,
                       u.username AS trainer,
                       uwl.completed_at
                FROM user_workout_logs uwl
                JOIN workouts w ON uwl.workout_id = w.id
                JOIN users u ON w.trainer_id = u.id
                WHERE uwl.user_id = :uid
                ORDER BY uwl.completed_at DESC
            ");
            $stmt->execute(['uid' => $current_user_id]);
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "logs" => $logs]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "success", "logs" => []]);
        }
        exit;
    }

    if ($method === 'GET' && $action === 'get_streak') {
        try {
            $stmt = $connection->prepare("
                SELECT DISTINCT DATE(completed_at) AS workout_day
                FROM user_workout_logs
                WHERE user_id = :uid AND completed_at IS NOT NULL
                ORDER BY workout_day DESC
            ");
            $stmt->execute(['uid' => $current_user_id]);
        } catch (PDOException) {
            echo json_encode(["status" => "success", "streak" => 0]);
            exit;
        }

        $days = array_values(array_filter($stmt->fetchAll(PDO::FETCH_COLUMN), fn($d) => !empty($d)));

        $streak = 0;
        if (!empty($days)) {
            $today     = date('Y-m-d');
            $yesterday = date('Y-m-d', strtotime('-1 day'));

            if ($days[0] === $today || $days[0] === $yesterday) {
                $expected = $days[0];
                foreach ($days as $day) {
                    if ($day === $expected) {
                        $streak++;
                        $expected = date('Y-m-d', strtotime($expected . ' -1 day'));
                    } else {
                        break;
                    }
                }
            }
        }

        echo json_encode(["status" => "success", "streak" => $streak]);
        exit;
    }

    if ($method === 'POST' && $action === 'toggle_favorite') {
        $workout_id = $data['workout_id'] ?? null;
        if (!$workout_id) { 
            echo json_encode(["status" => "error"]); 
            exit; 
        }
    
        $check = $connection->prepare("SELECT id FROM workout_favorites WHERE user_id = :uid AND workout_id = :wid");
        $check->execute(['uid' => $current_user_id, 'wid' => $workout_id]);
        $existing = $check->fetch(PDO::FETCH_ASSOC);
    
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

    if ($method === 'POST' && $action === 'delete_workout') {
        $workout_id = $data['workout_id'] ?? null;

        if (empty($workout_id) || empty($current_user_id)) {
            echo json_encode(["status" => "error", "message" => "Workout ID is required"]);
            exit;
        }

        $checkStm = $connection->prepare("SELECT trainer_id FROM workouts WHERE id = :wid");
        $checkStm->execute(['wid' => $workout_id]);
        $workout = $checkStm->fetch(PDO::FETCH_ASSOC);

        if (!$workout) {
            echo json_encode(["status" => "error", "message" => "Workout not found"]);
            exit;
        }

        if ((int)$workout['trainer_id'] !== (int)$current_user_id) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Unauthorized: You can only delete your own workouts"]);
            exit;
        }

        $connection->beginTransaction();

        try {
            $connection->prepare("DELETE FROM workout_exercises WHERE workout_id = :wid")->execute(['wid' => $workout_id]);
            $connection->prepare("DELETE FROM workout_favorites WHERE workout_id = :wid")->execute(['wid' => $workout_id]);
            $connection->prepare("DELETE FROM user_workout_logs WHERE workout_id = :wid")->execute(['wid' => $workout_id]);
            
            $delStm = $connection->prepare("DELETE FROM workouts WHERE id = :wid");
            $delStm->execute(['wid' => $workout_id]);

            $connection->commit();
            echo json_encode(["status" => "success", "message" => "Workout deleted successfully"]);
        } catch (Exception $e) {
            $connection->rollBack();
            echo json_encode(["status" => "error", "message" => "Failed to delete workout"]);
        }
        exit;
    }

    echo json_encode(["status" => "error"]);

} catch (PDOException $e) {
    if ($connection->inTransaction()) {
        $connection->rollBack();
    }
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
