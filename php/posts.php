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
    // GET POSTS
    if ($action === 'get_posts') {
        $stm = $connection->prepare("
            SELECT p.id, p.user_id, p.title, p.body, p.media_url, p.media_type, p.created_at, u.username, u.avatar,
                   (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
                   (SELECT COUNT(*) FROM post_likes l WHERE l.post_id = p.id) AS likes,
                   EXISTS(SELECT 1 FROM post_likes l WHERE l.post_id = p.id AND l.user_id = :uid1) AS liked_by_user,
                   EXISTS(SELECT 1 FROM post_bookmarks b WHERE b.post_id = p.id AND b.user_id = :uid2) AS is_bookmarked
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        ");
        
        // Bind parameters safely
        $stm->execute([
            'uid1' => $user_id ?? 0,
            'uid2' => $user_id ?? 0
        ]);
        
        $posts = $stm->fetchAll(PDO::FETCH_ASSOC);
        
        // Cast boolean values
        for ($i = 0; $i < count($posts); $i++) {
            $posts[$i]['liked_by_user'] = (bool)$posts[$i]['liked_by_user'];
            $posts[$i]['is_bookmarked'] = (bool)$posts[$i]['is_bookmarked'];
        }
        
        echo json_encode(["status" => "success", "posts" => $posts]);
        exit;
    }

    if ($action === 'toggle_like' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $post_id = $data['post_id'] ?? null;
    
        if (!$post_id || !$user_id) {
            echo json_encode(["status" => "error", "message" => "Post ID and Login required"]);
            exit;
        }
    
        // Check if like already exists
        $check = $connection->prepare("SELECT id FROM post_likes WHERE user_id = :uid AND post_id = :pid");
        $check->execute(['uid' => $user_id, 'pid' => $post_id]);
        $existing = $check->fetch();
    
        if ($existing) {
            // TEST #2: Clicked again, so DELETE the like (Unlike)
            $del = $connection->prepare("DELETE FROM post_likes WHERE user_id = :uid AND post_id = :pid");
            $del->execute(['uid' => $user_id, 'pid' => $post_id]);
            $is_liked = false;
        } else {
            // TEST #1: Not liked yet, so INSERT the like
            $ins = $connection->prepare("INSERT INTO post_likes (user_id, post_id) VALUES (:uid, :pid)");
            $ins->execute(['uid' => $user_id, 'pid' => $post_id]);
            $is_liked = true;

            // Notify the post owner (skip if liking own post)
            try {
                $owner = $connection->prepare("SELECT user_id FROM posts WHERE id = :pid LIMIT 1");
                $owner->execute(['pid' => $post_id]);
                $post = $owner->fetch(PDO::FETCH_ASSOC);
                if ($post && (int)$post['user_id'] !== (int)$user_id) {
                    $notif = $connection->prepare("
                        INSERT INTO notifications (user_id, from_user_id, type, message, post_id, is_read, created_at)
                        VALUES (:uid, :from_uid, 'like', 'liked your post', :pid, 0, NOW())
                    ");
                    $notif->execute(['uid' => $post['user_id'], 'from_uid' => $user_id, 'pid' => $post_id]);
                }
            } catch (PDOException $e) {
                // Don't break the like if notification fails
            }
        }

        echo json_encode(["status" => "success", "liked" => $is_liked]);
        exit;
    }
    
    // Require auth for everything below
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Not logged in"]);
        exit;
    }

    // CREATE POST
    if ($action === 'create_post' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $title = $_POST['title'] ?? '';
        $body = $_POST['body'] ?? '';
        $media_url = null;
        $media_type = null;

        if (empty(trim($title)) && empty(trim($body)) && !isset($_FILES['media'])) {
            echo json_encode(["status" => "error", "message" => "Post must contain content"]);
            exit;
        }

        // Handle file upload
        if (isset($_FILES['media']) && $_FILES['media']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['media'];
            $mime = $file['type'];
            $allowed_images = ['image/jpeg', 'image/jpg', 'image/png'];
            $allowed_videos = ['video/mp4'];

            if (in_array($mime, $allowed_images)) {
                $media_type = 'image';
            } elseif (in_array($mime, $allowed_videos)) {
                $media_type = 'video';
            } else {
                echo json_encode(["status" => "error", "message" => "Only JPG, JPEG, PNG images and MP4 videos are allowed"]);
                exit;
            }

            $uploadDir = 'uploads/posts/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0775, true);
            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = "post_" . $user_id . "_" . time() . "." . $ext;
            $targetPath = $uploadDir . $filename;

            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $media_url = $targetPath;
            }
        }

        $stm = $connection->prepare("
            INSERT INTO posts (user_id, title, body, media_url, media_type, created_at)
            VALUES (:user_id, :title, :body, :media_url, :media_type, NOW())
        ");
        $stm->execute([
            'user_id' => $user_id,
            'title' => $title,
            'body' => $body,
            'media_url' => $media_url,
            'media_type' => $media_type
        ]);
        $new_post_id = $connection->lastInsertId();

        // Notify followers that this user posted
        try {
            $followers = $connection->prepare("SELECT follower_id FROM follows WHERE following_id = :uid");
            $followers->execute(['uid' => $user_id]);
            $followerList = $followers->fetchAll(PDO::FETCH_ASSOC);
            foreach ($followerList as $f) {
                $notif = $connection->prepare("
                    INSERT INTO notifications (user_id, from_user_id, type, message, post_id, is_read, created_at)
                    VALUES (:uid, :from_uid, 'new_post', 'posted something new', :pid, 0, NOW())
                ");
                $notif->execute([
                    'uid' => $f['follower_id'],
                    'from_uid' => $user_id,
                    'pid' => $new_post_id
                ]);
            }
        } catch (PDOException $e) {
            // Don't break post creation if notification fails
        }

        echo json_encode(["status" => "success", "id" => $new_post_id]);
        exit;
    }

    if ($action === 'toggle_bookmark' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $post_id = $data['post_id'] ?? null;

        if (!$post_id || !$user_id) {
            echo json_encode(["status" => "error", "message" => "Post ID and Login required"]);
            exit;
        }

        $check = $connection->prepare("SELECT id FROM post_bookmarks WHERE user_id = :uid AND post_id = :pid");
        $check->execute(['uid' => $user_id, 'pid' => $post_id]);
        $existing = $check->fetch();

        if ($existing) {
            $del = $connection->prepare("DELETE FROM post_bookmarks WHERE user_id = :uid AND post_id = :pid");
            $del->execute(['uid' => $user_id, 'pid' => $post_id]);
            $is_bookmarked = false;
        } else {
            $ins = $connection->prepare("INSERT INTO post_bookmarks (user_id, post_id) VALUES (:uid, :pid)");
            $ins->execute(['uid' => $user_id, 'pid' => $post_id]);
            $is_bookmarked = true;
        }

        echo json_encode(["status" => "success", "is_bookmarked" => $is_bookmarked]);
        exit;
    }

    // EDIT POST
    if ($action === 'edit_post' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $post_id = $data['post_id'] ?? null;
        $title = $data['title'] ?? '';
        $body = $data['body'] ?? '';

        if (!$post_id) {
            echo json_encode(["status" => "error", "message" => "Post ID required"]);
            exit;
        }

        if (empty(trim($title)) && empty(trim($body))) {
            echo json_encode(["status" => "error", "message" => "Post content cannot be empty"]);
            exit;
        }

        // Verify ownership
        $check = $connection->prepare("SELECT user_id FROM posts WHERE id = :id");
        $check->execute(['id' => $post_id]);
        $post = $check->fetch();

        if (!$post || $post->user_id != $user_id) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Unauthorized: you can only edit your own posts"]);
            exit;
        }

        $stm = $connection->prepare("UPDATE posts SET title = :title, body = :body WHERE id = :id");
        $stm->execute(['title' => $title, 'body' => $body, 'id' => $post_id]);
        echo json_encode(["status" => "success", "message" => "Post updated"]);
        exit;
    }

    // DELETE POST
    if ($action === 'delete_post' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $post_id = $data['post_id'] ?? null;

        if (!$post_id) {
            echo json_encode(["status" => "error", "message" => "Post ID required"]);
            exit;
        }

        // Verify ownership
        $check = $connection->prepare("SELECT user_id FROM posts WHERE id = :id");
        $check->execute(['id' => $post_id]);
        $post = $check->fetch();

        if (!$post || $post->user_id != $user_id) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Unauthorized: you can only delete your own posts"]);
            exit;
        }

        // Delete associated comments first
        $connection->prepare("DELETE FROM comments WHERE post_id = :id")->execute(['id' => $post_id]);
        // Delete the post
        $connection->prepare("DELETE FROM posts WHERE id = :id")->execute(['id' => $post_id]);
        echo json_encode(["status" => "success", "message" => "Post deleted"]);
        exit;
    }

    echo json_encode(["status" => "error", "message" => "Invalid action"]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}