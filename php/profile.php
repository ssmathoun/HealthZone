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

        // 2. Handle Password Logic
        $newPass = $_POST['newPassword'] ?? '';
        $confirmPass = $_POST['confirmNewPassword'] ?? '';
        $oldPass = $_POST['oldPassword'] ?? '';

        if (!empty($newPass)) {
            // Check if they match first
            if ($newPass !== $confirmPass) {
                echo json_encode(["status" => "error", "message" => "New and confirm passwords do not match."]);
                exit;
            }

            // Verify current password from DB
            $stm = $connection->prepare("SELECT password FROM users WHERE id = :id LIMIT 1");
            $stm->execute(['id' => $user_id]);
            $userRecord = $stm->fetch();

            if ($userRecord && password_verify($oldPass, $userRecord->password)) {
                $hashed = password_hash($newPass, PASSWORD_DEFAULT);
                $upd = $connection->prepare("UPDATE users SET password = :pass WHERE id = :id");
                $upd->execute(['pass' => $hashed, 'id' => $user_id]);
                $hasChanged = true;
                $responseMsgs[] = "Password updated";
            } else {
                // If old password is wrong, we stop here
                echo json_encode(["status" => "error", "message" => "Current password is incorrect."]);
                exit;
            }
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