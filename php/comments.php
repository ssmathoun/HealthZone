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
    // GET COMMENTS
    if ($action === 'get_comments') {
        $post_id = $_GET['post_id'] ?? null;
        if (!$post_id) {
            echo json_encode(["status" => "error", "message" => "Post ID required"]);
            exit;
        }
        $stm = $connection->prepare("
            SELECT c.id, c.post_id, c.user_id, c.text, c.created_at,
                   u.username, u.avatar,
                   (c.user_id = :uid) AS can_delete
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = :post_id
            ORDER BY c.created_at ASC
        ");
        $stm->execute(['post_id' => $post_id, 'uid' => $user_id ?? 0]);
        $comments = $stm->fetchAll(PDO::FETCH_ASSOC);
        // Cast can_delete to bool
        foreach ($comments as &$c) {
            $c['can_delete'] = (bool)$c['can_delete'];
        }
        echo json_encode(["status" => "success", "comments" => $comments]);
        exit;
    }

    // Require auth for write actions
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

        if (!$post_id || $text === '') {
            echo json_encode(["status" => "error", "message" => "Post ID and text required"]);
            exit;
        }

        $stm = $connection->prepare("
            INSERT INTO comments (post_id, user_id, text, created_at)
            VALUES (:post_id, :user_id, :text, NOW())
        ");
        $stm->execute(['post_id' => $post_id, 'user_id' => $user_id, 'text' => $text]);
        echo json_encode(["status" => "success", "id" => $connection->lastInsertId()]);
        exit;
    }

    // DELETE COMMENT
    if ($action === 'delete_comment' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $comment_id = $data['comment_id'] ?? null;

        if (!$comment_id) {
            echo json_encode(["status" => "error", "message" => "Comment ID required"]);
            exit;
        }

        // Verify ownership
        $check = $connection->prepare("SELECT user_id, post_id FROM comments WHERE id = :id");
        $check->execute(['id' => $comment_id]);
        $comment = $check->fetch();

        if (!$comment) {
            echo json_encode(["status" => "error", "message" => "Comment not found"]);
            exit;
        }

        if ($comment->user_id != $user_id) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Unauthorized: you can only delete your own comments"]);
            exit;
        }

        $connection->prepare("DELETE FROM comments WHERE id = :id")->execute(['id' => $comment_id]);
        echo json_encode(["status" => "success", "message" => "Comment deleted"]);
        exit;
    }

    echo json_encode(["status" => "error", "message" => "Invalid action"]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
