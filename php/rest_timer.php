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

function ensure_rest_timer_table(PDO $connection): void
{
    $connection->exec("
        CREATE TABLE IF NOT EXISTS rest_timer_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            duration_seconds INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            KEY idx_rest_timer_user (user_id),
            KEY idx_rest_timer_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);
$userId = isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;

if (!$userId) {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized",
    ]);
    exit;
}

try {
    ensure_rest_timer_table($connection);

    if ($method === 'GET' && $action === 'get_logs') {
        $statement = $connection->prepare("
            SELECT id, duration_seconds, created_at
            FROM rest_timer_logs
            WHERE user_id = :user_id
            ORDER BY created_at ASC, id ASC
        ");
        $statement->execute(["user_id" => $userId]);

        echo json_encode([
            "status" => "success",
            "logs" => $statement->fetchAll(),
        ]);
        exit;
    }

    if ($method === 'POST' && $action === 'log_rest') {
        $durationSeconds = isset($data['duration_seconds']) ? (int) $data['duration_seconds'] : 0;

        if ($durationSeconds <= 0) {
            echo json_encode([
                "status" => "error",
                "message" => "Duration must be greater than 0.",
            ]);
            exit;
        }

        $insert = $connection->prepare("
            INSERT INTO rest_timer_logs (user_id, duration_seconds)
            VALUES (:user_id, :duration_seconds)
        ");
        $insert->execute([
            "user_id" => $userId,
            "duration_seconds" => $durationSeconds,
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Rest logged successfully.",
            "id" => (int) $connection->lastInsertId(),
        ]);
        exit;
    }

    if ($method === 'DELETE' && $action === 'delete_log') {
        $logId = isset($data['id']) ? (int) $data['id'] : 0;

        if ($logId <= 0) {
            echo json_encode([
                "status" => "error",
                "message" => "Log ID is required.",
            ]);
            exit;
        }

        $delete = $connection->prepare("
            DELETE FROM rest_timer_logs
            WHERE id = :id
              AND user_id = :user_id
        ");
        $delete->execute([
            "id" => $logId,
            "user_id" => $userId,
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Rest log deleted successfully.",
        ]);
        exit;
    }

    echo json_encode([
        "status" => "error",
        "message" => "Invalid action specified.",
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage(),
    ]);
}
