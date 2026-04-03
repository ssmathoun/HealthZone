<?php
// settings.php
require "autoload.php";

header("Access-Control-Allow-Origin: https://aptitude.cse.buffalo.edu");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $newPass    = $_POST['newPassword'] ?? '';
        $confirmPass = $_POST['confirmNewPassword'] ?? '';
        $oldPass    = $_POST['oldPassword'] ?? '';

        if (empty($newPass)) {
            echo json_encode(["status" => "error", "message" => "New password is required."]);
            exit;
        }

        if ($newPass !== $confirmPass) {
            echo json_encode(["status" => "error", "message" => "New and confirm passwords do not match."]);
            exit;
        }

        $stm = $connection->prepare("SELECT password FROM users WHERE id = :id LIMIT 1");
        $stm->execute(['id' => $user_id]);
        $userRecord = $stm->fetch();

        if ($userRecord && password_verify($oldPass, $userRecord->password)) {
            $hashed = password_hash($newPass, PASSWORD_DEFAULT);
            $upd = $connection->prepare("UPDATE users SET password = :pass WHERE id = :id");
            $upd->execute(['pass' => $hashed, 'id' => $user_id]);
            echo json_encode(["status" => "success", "message" => "Password updated successfully."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Current password is incorrect."]);
        }
        exit;
    }

    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Server error."]);
}