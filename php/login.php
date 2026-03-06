<?php
require "autoload.php";

header("Access-Control-Allow-Origin: https://aptitude.cse.buffalo.edu");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Email and password required"]);
    exit;
}

try {
    $query = "SELECT id, username, password FROM users WHERE email = :email LIMIT 1";
    $stm = $connection->prepare($query);
    $stm->execute(['email' => $email]);
    $user = $stm->fetch();

    if ($user && password_verify($password, $user->password)) {
        // Set the session ID used by profile.php and AuthGuard
        $_SESSION['user_id'] = $user->id;
        
        echo json_encode([
            "status" => "success",
            "message" => "Login successful",
            "user" => ["id" => $user->id, "username" => $user->username]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Server error occurred"]);
}