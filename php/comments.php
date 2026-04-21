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

try {
    // GET COMMENTS FOR A POST
    if ($action === 'get_comments') {
        $post_id = $_GET['post_id'] ?? null;
        if (!$post_id) {
            echo json_encode(["status" => "error", "message" => "post_id is required"]);
            exit;
        }
        $stm = $connection->prepare("
            SELECT c.id, c.post_id, c.user_id, c.text, c.created_at, u.username, u.avatar
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = :post_id
            ORDER BY c.created_at ASC
        ");
        $stm->execute(['post_id' => $post_id]);
        $comments = $stm->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "comments" => $comments]);
        exit;
    }

    // Require auth for everything below
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Not logged in"]);
        exit;
    }

    // ADD COMMENT
    if ($action === 'add_comment' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $post_id = $data['post_id'] ?? null;
        $text = trim($data['text'] ?? '');

        if (!$post_id) {
            echo json_encode(["status" => "error", "message" => "post_id is required"]);
            exit;
        }
        if (empty($text)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Comment text is required"]);
            exit;
        }

        $stm = $connection->prepare("
            INSERT INTO comments (post_id, user_id, text, created_at)
            VALUES (:post_id, :user_id, :text, NOW())
        ");
        $stm->execute([
            'post_id' => $post_id,
            'user_id' => $user_id,
            'text' => $text
        ]);

        // Create notification for the post author (if not commenting on own post)
        try {
            $post_owner = $connection->prepare("SELECT user_id FROM posts WHERE id = :pid LIMIT 1");
            $post_owner->execute(['pid' => $post_id]);
            $owner = $post_owner->fetch(PDO::FETCH_ASSOC);
            if ($owner && (int)$owner['user_id'] !== (int)$user_id) {
                $notif = $connection->prepare("
                    INSERT INTO notifications (user_id, from_user_id, type, message, post_id, is_read, created_at)
                    VALUES (:uid, :from_uid, 'comment', 'commented on your post', :pid, 0, NOW())
                ");
                $notif->execute([
                    'uid' => $owner['user_id'],
                    'from_uid' => $user_id,
                    'pid' => $post_id
                ]);
            }
        } catch (PDOException $e) {
            // Notification creation failure shouldn't break the comment
        }

        echo json_encode(["status" => "success", "id" => $connection->lastInsertId(), "message" => "Comment added"]);
        exit;
    }

    echo json_encode(["status" => "error", "message" => "Invalid action"]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
