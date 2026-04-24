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
    // GET NOTIFICATIONS
    if ($action === 'get_notifications') {
        $stm = $connection->prepare("
            SELECT n.id, n.type, n.message, n.post_id, n.is_read, n.created_at, u.username AS from_username
            FROM notifications n
            LEFT JOIN users u ON n.from_user_id = u.id
            WHERE n.user_id = :uid
            ORDER BY n.created_at DESC
            LIMIT 50
        ");
        $stm->execute(['uid' => $user_id]);
        $notifications = $stm->fetchAll(PDO::FETCH_ASSOC);

        foreach ($notifications as &$n) {
            $n['is_read'] = (bool)$n['is_read'];
            $n['post_id'] = $n['post_id'] ? (int)$n['post_id'] : null;
        }

        echo json_encode(["status" => "success", "notifications" => $notifications]);
        exit;
    }

    // GET UNREAD COUNT
    if ($action === 'unread_count') {
        $stm = $connection->prepare("SELECT COUNT(*) AS count FROM notifications WHERE user_id = :uid AND is_read = 0");
        $stm->execute(['uid' => $user_id]);
        $row = $stm->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["count" => (int)$row['count']]);
        exit;
    }

    // MARK ALL AS READ
    if ($action === 'mark_all_read' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $stm = $connection->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = :uid AND is_read = 0");
        $stm->execute(['uid' => $user_id]);
        echo json_encode(["status" => "success"]);
        exit;
    }

    // MARK SINGLE AS READ
    if ($action === 'mark_read' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $nid = $data['notification_id'] ?? 0;
        $stm = $connection->prepare("UPDATE notifications SET is_read = 1 WHERE id = :id AND user_id = :uid");
        $stm->execute(['id' => $nid, 'uid' => $user_id]);
        echo json_encode(["status" => "success"]);
        exit;
    }

    // CLEAR ALL NOTIFICATIONS
    if ($action === 'clear_notifications' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $stm = $connection->prepare("DELETE FROM notifications WHERE user_id = :uid");
        $stm->execute(['uid' => $user_id]);
        echo json_encode(["status" => "success"]);
        exit;
    }

    echo json_encode(["status" => "error", "message" => "Invalid action"]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Server error"]);
}