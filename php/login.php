<?php
// login.php
require "autoload.php";

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

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
        $_SESSION['user_id'] = $user->id;
        echo json_encode([
            "status" => "success",
            "user" => ["id" => $user->id, "username" => $user->username]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Server error"]);
}