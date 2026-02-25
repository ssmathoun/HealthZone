<?php
require "autoload.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$email           = $data['email'] ?? '';
$username        = $data['username'] ?? '';
$password        = $data['password'] ?? '';
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
    $query = "INSERT INTO users (email, username, password) VALUES (:email, :username, :password)";
    $stm = $connection->prepare($query);
    
    if ($stm->execute(['email' => $email, 'username' => $username, 'password' => $hashedPassword])) {
        echo json_encode(["status" => "success", "message" => "User registered successfully!"]);
    }
} catch (PDOException $e) {
    $msg = ($e->getCode() == 23000) ? "Email or Username already exists" : "Database error";
    echo json_encode(["status" => "error", "message" => $msg]);
}