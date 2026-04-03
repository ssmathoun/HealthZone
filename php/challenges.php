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
$userId = isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;

try {
    if ($method === 'GET' && $action === 'get_available_challenges') {
        echo json_encode(get_available_challenges($connection, $userId));
        exit;
    }

    if (!$userId) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Unauthorized',
        ]);
        exit;
    }

    if ($method === 'GET' && $action === 'get_user_challenges') {
        echo json_encode(get_user_challenges($connection, $userId));
        exit;
    }

    if ($method === 'POST' && $action === 'join') {
        $challengeId = isset($data['challenge_id']) ? (int) $data['challenge_id'] : 0;

        if ($challengeId <= 0) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Challenge ID is required.',
            ]);
            exit;
        }

        echo json_encode(join_challenge($connection, $userId, $challengeId));
        exit;
    }

    if ($method === 'POST' && $action === 'join_leaderboard') {
        echo json_encode(join_leaderboard($connection, $userId));
        exit;
    }

    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid action specified.',
    ]);
} catch (PDOException $e) {
    if ($connection->inTransaction()) {
        $connection->rollBack();
    }

    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage(),
    ]);
}