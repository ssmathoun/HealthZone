<?php
require "autoload.php";

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
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
        $view_id = $_GET['view_user_id'] ?? $_GET['user_id'] ?? null;
        
        if ($view_id) {
            $query = "SELECT id, username, email, avatar, bio FROM users WHERE id = :id LIMIT 1";
            $stm = $connection->prepare($query);
            $stm->execute(['id' => (int)$view_id]);
            $user = $stm->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                echo json_encode(["status" => "success", "user" => $user]);
            } else {
                echo json_encode(["status" => "error", "message" => "User not found"]);
            }
            exit;
        }

        $query = "SELECT id, username, email, avatar, bio FROM users WHERE id = :id LIMIT 1";
        $stm = $connection->prepare($query);
        $stm->execute(['id' => $user_id]);
        $user = $stm->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "user" => $user]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $hasChanged = false;
        $responseMsgs = [];

        if (isset($_POST['bio'])) {
            $bioText = trim($_POST['bio']);
            $upd = $connection->prepare("UPDATE users SET bio = :bio WHERE id = :id");
            $upd->execute(['bio' => $bioText, 'id' => $user_id]);
            $hasChanged = true;
            $responseMsgs[] = "Bio updated";
        }

        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
            $fileInfo = pathinfo($_FILES['avatar']['name']);
            $extension = strtolower($fileInfo['extension'] ?? '');
            
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $_FILES['avatar']['tmp_name']);
            finfo_close($finfo);
            $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

            if (!in_array($extension, $allowedExtensions) || !in_array($mimeType, $allowedMimeTypes)) {
                echo json_encode(["status" => "error", "message" => "Invalid file type."]);
                exit;
            }

            $uploadDir = 'uploads/avatars/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true); 
            }
            
            $fileName = "avatar_" . $user_id . "_" . time() . "." . $extension;
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['avatar']['tmp_name'], $targetPath)) {
                $upd = $connection->prepare("UPDATE users SET avatar = :avatar WHERE id = :id");
                $upd->execute(['avatar' => $targetPath, 'id' => $user_id]);
                $hasChanged = true;
                $responseMsgs[] = "Avatar updated";
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to save file. Check folder permissions."]);
                exit;
            }
        }

        $newPass = $_POST['newPassword'] ?? '';
        $confirmPass = $_POST['confirmNewPassword'] ?? '';
        $oldPass = $_POST['oldPassword'] ?? '';

        if (!empty($newPass)) {
            if ($newPass !== $confirmPass) {
                echo json_encode(["status" => "error", "message" => "Passwords do not match."]);
                exit;
            }

            $stm = $connection->prepare("SELECT password FROM users WHERE id = :id LIMIT 1");
            $stm->execute(['id' => $user_id]);
            $userRecord = $stm->fetch(PDO::FETCH_ASSOC);

            if ($userRecord && password_verify($oldPass, $userRecord['password'])) {
                $hashed = password_hash($newPass, PASSWORD_DEFAULT);
                $upd = $connection->prepare("UPDATE users SET password = :pass WHERE id = :id");
                $upd->execute(['pass' => $hashed, 'id' => $user_id]);
                $hasChanged = true;
                $responseMsgs[] = "Password updated";
            } else {
                echo json_encode(["status" => "error", "message" => "Current password incorrect."]);
                exit;
            }
        }

        if (!$hasChanged) {
            echo json_encode(["status" => "error", "message" => "No changes provided."]);
        } else {
            echo json_encode(["status" => "success", "message" => implode(" and ", $responseMsgs) . " successfully."]);
        }
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error."]);
}
?>