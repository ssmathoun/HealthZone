<?php
require "autoload.php";

header("Access-Control-Allow-Origin: https://aptitude.cse.buffalo.edu");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents("php://input"), true);
$email    = $data['email'] ?? '';
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';
$confirmPassword = $data['confirmPassword'] ?? '';

if (empty($email) || empty($username) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "All fields are required"]);
    exit;
}
if ($password !== $confirmPassword) {
    echo json_encode(["status" => "error", "message" => "Passwords do not match"]);
    exit;
}

try {
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $defaultAvatar = 'default_avatar.png';

    $query = "INSERT INTO users (email, username, password, avatar) VALUES (:email, :username, :password, :avatar)";
    $stm = $connection->prepare($query);
    
    if ($stm->execute([
        'email'    => $email, 
        'username' => $username, 
        'password' => $hashedPassword, 
        'avatar'   => $defaultAvatar
    ])) {
        echo json_encode(["status" => "success", "message" => "User registered successfully!"]);
    }
} catch (PDOException $e) {
    $msg = ($e->getCode() == 23000) ? "Email or Username already exists" : "Database error: " . $e->getMessage();
    echo json_encode(["status" => "error", "message" => $msg]);
}