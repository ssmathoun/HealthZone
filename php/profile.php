<?php
require "autoload.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$user_id = $_SESSION['user_id'] ?? $data['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["status" => "error", "message" => "Unauthorized access"]);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $query = "SELECT username, email, role, avatar FROM users WHERE id = :id LIMIT 1";
        $stm = $connection->prepare($query);
        $stm->execute(['id' => $user_id]);
        $user = $stm->fetch();
        echo json_encode(["status" => "success", "user" => $user]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $response = ["status" => "success", "message" => "Profile updated"];

        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/avatars/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

            $fileExtension = pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);
            $fileName = "avatar_" . $user_id . "_" . time() . "." . $fileExtension;
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['avatar']['tmp_name'], $targetPath)) {
                $upd = $connection->prepare("UPDATE users SET avatar = :avatar WHERE id = :id");
                $upd->execute(['avatar' => $targetPath, 'id' => $user_id]);
                $response['avatar_url'] = $targetPath;
            }
        }

        if (!empty($_POST['newPassword'])) {
            $oldPass = $_POST['oldPassword'] ?? '';
            $newPass = $_POST['newPassword'];
            
            $stm = $connection->prepare("SELECT password FROM users WHERE id = :id");
            $stm->execute(['id' => $user_id]);
            $user = $stm->fetch();

            if ($user && password_verify($oldPass, $user->password)) {
                $hashed = password_hash($newPass, PASSWORD_DEFAULT);
                $upd = $connection->prepare("UPDATE users SET password = :pass WHERE id = :id");
                $upd->execute(['pass' => $hashed, 'id' => $user_id]);
                $response['message'] .= " and password changed";
            } else {
                echo json_encode(["status" => "error", "message" => "Incorrect old password"]);
                exit;
            }
        }

        echo json_encode($response);
        exit;
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>