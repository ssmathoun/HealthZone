<?php
require "autoload.php";

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Not logged in"]);
    exit;
}

$userId = (int) $_SESSION['user_id'];

try {
    $logs = [];

    // ── Profile ──────────────────────────────────────────────────────────────
    $stmt = $connection->prepare("SELECT username, email FROM users WHERE id = :uid");
    $stmt->execute([':uid' => $userId]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);
    $logs['profile'] = $profile ?: [];

    // ── Workouts ─────────────────────────────────────────────────────────────
    // user_workout_logs links completed workouts; join workouts for name/details
    try {
        $stmt = $connection->prepare("
            SELECT uwl.id, w.name, w.difficulty, w.duration_min, w.calories_burned, uwl.completed_at
            FROM user_workout_logs uwl
            JOIN workouts w ON uwl.workout_id = w.id
            WHERE uwl.user_id = :uid
            ORDER BY uwl.completed_at DESC
        ");
        $stmt->execute([':uid' => $userId]);
        $logs['workouts'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Try without completed_at column (older schema)
        try {
            $stmt = $connection->prepare("
                SELECT uwl.id, w.name, w.difficulty, w.duration_min, w.calories_burned
                FROM user_workout_logs uwl
                JOIN workouts w ON uwl.workout_id = w.id
                WHERE uwl.user_id = :uid
                ORDER BY uwl.id DESC
            ");
            $stmt->execute([':uid' => $userId]);
            $logs['workouts'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e2) {
            $logs['workouts'] = [];
        }
    }

    // ── Meals ────────────────────────────────────────────────────────────────
    try {
        $stmt = $connection->prepare("
            SELECT id, name, meal_type, calories, protein, carbs, fat, logged_at
            FROM meal
            WHERE user_id = :uid
            ORDER BY logged_at DESC
        ");
        $stmt->execute([':uid' => $userId]);
        $logs['meals'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $logs['meals'] = [];
    }

    // ── Weight ───────────────────────────────────────────────────────────────
    try {
        $stmt = $connection->prepare("
            SELECT id, weight_lbs, logged_at
            FROM weight_logs
            WHERE user_id = :uid
            ORDER BY logged_at DESC
        ");
        $stmt->execute([':uid' => $userId]);
        $logs['weight'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $logs['weight'] = [];
    }

    // ── Sleep ────────────────────────────────────────────────────────────────
    try {
        $stmt = $connection->prepare("
            SELECT id, hours, created_at
            FROM sleep_logs
            WHERE user_id = :uid
            ORDER BY created_at DESC
        ");
        $stmt->execute([':uid' => $userId]);
        $logs['sleep'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $logs['sleep'] = [];
    }

    // ── Rest Timer ───────────────────────────────────────────────────────────
    try {
        $stmt = $connection->prepare("
            SELECT id, duration_seconds, created_at
            FROM rest_timer_logs
            WHERE user_id = :uid
            ORDER BY created_at DESC
        ");
        $stmt->execute([':uid' => $userId]);
        $logs['rest_timer'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $logs['rest_timer'] = [];
    }

    // ── Recipes ──────────────────────────────────────────────────────────────
    try {
        $stmt = $connection->prepare("
            SELECT id, name, category, calories, protein, carbs, fat, prep_time, servings, created_at
            FROM recipes
            WHERE user_id = :uid
            ORDER BY created_at DESC
        ");
        $stmt->execute([':uid' => $userId]);
        $logs['recipes'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $logs['recipes'] = [];
    }

    // ── Challenges ───────────────────────────────────────────────────────────
    try {
        $stmt = $connection->prepare("
            SELECT uc.id, c.name, c.description, uc.progress, c.target_value, c.unit_label,
                   c.points_reward, uc.status, uc.joined_at, uc.updated_at
            FROM user_challenges uc
            JOIN challenges c ON uc.challenge_id = c.id
            WHERE uc.user_id = :uid
            ORDER BY uc.joined_at DESC
        ");
        $stmt->execute([':uid' => $userId]);
        $logs['challenges'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $logs['challenges'] = [];
    }

    // ── Points (computed live from completed challenges, same as leaderboard) ──
    try {
        $stmt = $connection->prepare("
            SELECT COALESCE(SUM(c.points_reward), 0) AS total_points
            FROM user_challenges uc
            JOIN challenges c ON c.id = uc.challenge_id
            WHERE uc.user_id = :uid AND uc.status = 'completed'
        ");
        $stmt->execute([':uid' => $userId]);
        $logs['points'] = $stmt->fetch(PDO::FETCH_ASSOC) ?: ['total_points' => 0];
    } catch (PDOException $e) {
        $logs['points'] = ['total_points' => 0];
    }

    // ── Calendar (Scheduled Workouts) ─────────────────────────────────────────
    try {
        $stmt = $connection->prepare("
            SELECT c.id, w.name, w.difficulty, c.scheduled_date
            FROM calendar c
            JOIN workouts w ON c.workout_id = w.id
            WHERE c.user_id = :uid
            ORDER BY c.scheduled_date DESC
        ");
        $stmt->execute([':uid' => $userId]);
        $logs['scheduled_workouts'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $logs['scheduled_workouts'] = [];
    }

    echo json_encode(["status" => "success", "logs" => $logs]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error"]);
}