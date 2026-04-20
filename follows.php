<?php
require "autoload.php";

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$action = $_GET['action'] ?? '';
$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Not logged in"]);
    exit;
}

try {
    // GET FOLLOWING LIST
    if ($action === 'get_following') {
        $stm = $connection->prepare("
            SELECT f.following_id AS user_id, u.username
            FROM follows f
            JOIN users u ON f.following_id = u.id
            WHERE f.follower_id = :uid
        ");
        $stm->execute(['uid' => $user_id]);
        $following = $stm->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "following" => $following]);
        exit;
    }

    // FOLLOW A USER
    if ($action === 'follow' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $target_id = isset($data['user_id']) ? (int)$data['user_id'] : 0;

        if ($target_id <= 0 || $target_id === (int)$user_id) {
            echo json_encode(["status" => "error", "message" => "Invalid user"]);
            exit;
        }

        // Check if already following
        $check = $connection->prepare("SELECT id FROM follows WHERE follower_id = :uid AND following_id = :tid");
        $check->execute(['uid' => $user_id, 'tid' => $target_id]);
        if ($check->fetch()) {
            echo json_encode(["status" => "success", "message" => "Already following"]);
            exit;
        }

        $stm = $connection->prepare("INSERT INTO follows (follower_id, following_id, created_at) VALUES (:uid, :tid, NOW())");
        $stm->execute(['uid' => $user_id, 'tid' => $target_id]);
        echo json_encode(["status" => "success", "message" => "Followed"]);
        exit;
    }

    // UNFOLLOW A USER
    if ($action === 'unfollow' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $target_id = isset($data['user_id']) ? (int)$data['user_id'] : 0;

        if ($target_id <= 0) {
            echo json_encode(["status" => "error", "message" => "Invalid user"]);
            exit;
        }

        $stm = $connection->prepare("DELETE FROM follows WHERE follower_id = :uid AND following_id = :tid");
        $stm->execute(['uid' => $user_id, 'tid' => $target_id]);
        echo json_encode(["status" => "success", "message" => "Unfollowed"]);
        exit;
    }

    echo json_encode(["status" => "error", "message" => "Invalid action"]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Server error"]);
}
