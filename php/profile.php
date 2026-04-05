<?php
// profile.php
require "autoload.php";

header("Access-Control-Allow-Origin: https://aptitude.cse.buffalo.edu");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $query = "SELECT username, email, avatar FROM users WHERE id = :id LIMIT 1";
        $stm = $connection->prepare($query);
        $stm->execute(['id' => $user_id]);
        $user = $stm->fetch();
        echo json_encode(["status" => "success", "user" => $user]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $hasChanged = false;
        $responseMsgs = [];

        // 1. Handle Avatar
        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/avatars/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0775, true);
            $fileName = "avatar_" . $user_id . "_" . time() . "." . pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['avatar']['tmp_name'], $targetPath)) {
                $upd = $connection->prepare("UPDATE users SET avatar = :avatar WHERE id = :id");
                $upd->execute(['avatar' => $targetPath, 'id' => $user_id]);
                $hasChanged = true;
                $responseMsgs[] = "Avatar updated";
            }
        }

        // 2. Handle Username Update
        $newUsername = $_POST['username'] ?? '';
        if (!empty($newUsername)) {
            // Check if username is already taken (excluding current user)
            $stm = $connection->prepare("SELECT id FROM users WHERE username = :username AND id != :id LIMIT 1");
            $stm->execute(['username' => $newUsername, 'id' => $user_id]);
            if ($stm->fetch()) {
                echo json_encode(["status" => "error", "message" => "Username already taken."]);
                exit;
            }
            $upd = $connection->prepare("UPDATE users SET username = :username WHERE id = :id");
            $upd->execute(['username' => $newUsername, 'id' => $user_id]);
            $hasChanged = true;
            $responseMsgs[] = "Username updated";
        }

        // 3. Handle Email Update
        $newEmail = $_POST['email'] ?? '';
        if (!empty($newEmail)) {
            // Validate email format
            if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(["status" => "error", "message" => "Invalid email format."]);
                exit;
            }
            // Check if email is already taken (excluding current user)
            $stm = $connection->prepare("SELECT id FROM users WHERE email = :email AND id != :id LIMIT 1");
            $stm->execute(['email' => $newEmail, 'id' => $user_id]);
            if ($stm->fetch()) {
                echo json_encode(["status" => "error", "message" => "Email already in use."]);
                exit;
            }
            $upd = $connection->prepare("UPDATE users SET email = :email WHERE id = :id");
            $upd->execute(['email' => $newEmail, 'id' => $user_id]);
            $hasChanged = true;
            $responseMsgs[] = "Email updated";
        }

        if (!$hasChanged) {
            echo json_encode(["status" => "error", "message" => "No changes were provided."]);
        } else {
            echo json_encode(["status" => "success", "message" => implode(" and ", $responseMsgs) . " successfully."]);
        }
        exit;
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Server error."]);
}