<?php
require "autoload.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://aptitude.cse.buffalo.edu");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "GET" && $_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

$action = $_GET["action"] ?? "get_posts";
$current_user_id = $_SESSION["user_id"] ?? null;
$data = json_decode(file_get_contents("php://input"), true) ?? [];

function quote_identifier($identifier) {
    return "`" . str_replace("`", "``", $identifier) . "`";
}

function first_existing_table($connection, $candidates) {
    $stm = $connection->prepare("
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = DATABASE() AND table_name = :table_name
        LIMIT 1
    ");

    foreach ($candidates as $candidate) {
        $stm->execute(["table_name" => $candidate]);
        $table = $stm->fetchColumn();
        if ($table) {
            return $table;
        }
    }

    return null;
}

function first_existing_column($connection, $table, $candidates) {
    $stm = $connection->prepare("
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = :table_name AND column_name = :column_name
        LIMIT 1
    ");

    foreach ($candidates as $candidate) {
        $stm->execute([
            "table_name" => $table,
            "column_name" => $candidate,
        ]);
        $column = $stm->fetchColumn();
        if ($column) {
            return $column;
        }
    }

    return null;
}

function format_time_ago($timestamp) {
    if (!$timestamp) {
        return "";
    }

    $created = strtotime($timestamp);
    if ($created === false) {
        return "";
    }

    $diff = time() - $created;

    if ($diff < 60) {
        return "Just now";
    }

    if ($diff < 3600) {
        return floor($diff / 60) . "m ago";
    }

    if ($diff < 86400) {
        return floor($diff / 3600) . "h ago";
    }

    if ($diff < 604800) {
        return floor($diff / 86400) . "d ago";
    }

    return date("M j, Y", $created);
}

try {
    if ($action === "delete_post") {
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method not allowed"]);
            exit;
        }

        if (!$current_user_id) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            exit;
        }

        $post_table = first_existing_table($connection, [
            "forum_posts",
            "community_posts",
            "posts",
            "forum_post",
            "community_post",
        ]);

        if (!$post_table) {
            echo json_encode(["status" => "error", "message" => "Forum post table not found"]);
            exit;
        }

        $post_id_col = first_existing_column($connection, $post_table, ["id", "post_id"]);
        $post_user_col = first_existing_column($connection, $post_table, ["user_id", "author_id", "created_by"]);
        $post_id = (int) ($data["post_id"] ?? 0);

        if (!$post_id_col || !$post_user_col || !$post_id) {
            echo json_encode(["status" => "error", "message" => "Post ID is required"]);
            exit;
        }

        $delete_query = "
            DELETE FROM " . quote_identifier($post_table) . "
            WHERE " . quote_identifier($post_id_col) . " = :post_id
              AND " . quote_identifier($post_user_col) . " = :user_id
            LIMIT 1
        ";
        $delete_stm = $connection->prepare($delete_query);
        $delete_stm->execute([
            "post_id" => $post_id,
            "user_id" => $current_user_id,
        ]);

        if ($delete_stm->rowCount() === 0) {
            echo json_encode(["status" => "error", "message" => "Post not found or not owned by user"]);
            exit;
        }

        echo json_encode(["status" => "success", "message" => "Post deleted successfully"]);
        exit;
    }

    if ($action !== "get_posts") {
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
        exit;
    }

    $post_table = first_existing_table($connection, [
        "forum_posts",
        "community_posts",
        "posts",
        "forum_post",
        "community_post",
    ]);

    if (!$post_table) {
        echo json_encode(["status" => "success", "posts" => []]);
        exit;
    }

    $post_id_col = first_existing_column($connection, $post_table, ["id", "post_id"]);
    $post_user_col = first_existing_column($connection, $post_table, ["user_id", "author_id", "created_by"]);
    $post_content_col = first_existing_column($connection, $post_table, ["content", "body", "post_content", "text", "message"]);
    $post_title_col = first_existing_column($connection, $post_table, ["title", "subject"]);
    $post_image_col = first_existing_column($connection, $post_table, ["image", "image_url", "media_url", "photo", "attachment"]);
    $post_created_col = first_existing_column($connection, $post_table, ["created_at", "posted_at", "created_on", "timestamp"]);

    if (!$post_id_col || !$post_user_col || !$post_content_col) {
        echo json_encode([
            "status" => "error",
            "message" => "Forum post table is missing required columns",
        ]);
        exit;
    }

    $comment_table = first_existing_table($connection, [
        "post_comments",
        "forum_comments",
        "community_comments",
        "comments",
    ]);
    $comment_post_col = $comment_table
        ? first_existing_column($connection, $comment_table, ["post_id", "forum_post_id", "community_post_id"])
        : null;

    $like_table = first_existing_table($connection, [
        "post_likes",
        "forum_likes",
        "community_likes",
        "likes",
    ]);
    $like_post_col = $like_table
        ? first_existing_column($connection, $like_table, ["post_id", "forum_post_id", "community_post_id"])
        : null;
    $like_user_col = $like_table
        ? first_existing_column($connection, $like_table, ["user_id", "liked_by", "created_by"])
        : null;

    $post_table_sql = quote_identifier($post_table);
    $post_id_sql = quote_identifier($post_id_col);
    $post_user_sql = quote_identifier($post_user_col);
    $post_content_sql = quote_identifier($post_content_col);

    $title_select = $post_title_col
        ? "p." . quote_identifier($post_title_col) . " AS title"
        : "NULL AS title";
    $image_select = $post_image_col
        ? "p." . quote_identifier($post_image_col) . " AS image"
        : "NULL AS image";
    $created_select = $post_created_col
        ? "p." . quote_identifier($post_created_col) . " AS created_at"
        : "NULL AS created_at";
    $order_by = $post_created_col
        ? "p." . quote_identifier($post_created_col) . " DESC"
        : "p." . $post_id_sql . " DESC";

    $comments_select = "0 AS comments";
    if ($comment_table && $comment_post_col) {
        $comments_select = "(SELECT COUNT(*) FROM " . quote_identifier($comment_table) . " c WHERE c." . quote_identifier($comment_post_col) . " = p." . $post_id_sql . ") AS comments";
    }

    $likes_select = "0 AS likes";
    if ($like_table && $like_post_col) {
        $likes_select = "(SELECT COUNT(*) FROM " . quote_identifier($like_table) . " l WHERE l." . quote_identifier($like_post_col) . " = p." . $post_id_sql . ") AS likes";
    }

    $liked_by_user_select = "0 AS liked_by_user";
    $params = [];
    if ($like_table && $like_post_col && $like_user_col && $current_user_id) {
        $liked_by_user_select = "(SELECT COUNT(*) > 0 FROM " . quote_identifier($like_table) . " ul WHERE ul." . quote_identifier($like_post_col) . " = p." . $post_id_sql . " AND ul." . quote_identifier($like_user_col) . " = :current_user_id) AS liked_by_user";
        $params["current_user_id"] = $current_user_id;
    }

    $query = "
        SELECT
            p.$post_id_sql AS id,
            p.$post_content_sql AS content,
            $title_select,
            $image_select,
            $created_select,
            p.$post_user_sql AS user_id,
            u.username,
            u.avatar,
            $likes_select,
            $comments_select,
            $liked_by_user_select,
            " . ($current_user_id ? "CASE WHEN p.$post_user_sql = :viewer_user_id THEN 1 ELSE 0 END" : "0") . " AS can_delete
        FROM $post_table_sql p
        JOIN users u ON u.id = p.$post_user_sql
        ORDER BY $order_by
        LIMIT 50
    ";

    if ($current_user_id) {
        $params["viewer_user_id"] = $current_user_id;
    }

    $stm = $connection->prepare($query);
    $stm->execute($params);
    $posts = $stm->fetchAll();

    foreach ($posts as $post) {
        $post->user = $post->username ?? "";
        $post->time = format_time_ago($post->created_at ?? null);
        $post->likes = (int) ($post->likes ?? 0);
        $post->comments = (int) ($post->comments ?? 0);
        $post->liked_by_user = (bool) ($post->liked_by_user ?? false);
        $post->can_delete = (bool) ($post->can_delete ?? false);
    }

    echo json_encode(["status" => "success", "posts" => $posts]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Server error"]);
}
