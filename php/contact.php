<?php
require "autoload.php";

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $_SESSION['user_id'] ?? null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $reason = trim($data['reason'] ?? '');

    if (empty($name) || empty($email) || empty($phone) || empty($reason)) {
        echo json_encode(["status" => "failed", "message" => "All fields required"]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "failed", "message" => "Invalid email format"]);
        exit;
    }

    if (!preg_match('/^\d{10}$/', $phone)) {
        echo json_encode(["status" => "failed", "message" => "Invalid phone number"]);
        exit;
    }

    try {
        $stm = $connection->prepare("INSERT INTO contacts (user_id, name, email, phone, reason) VALUES (:uid, :name, :email, :phone, :reason)");
        $stm->execute([
            'uid' => $user_id,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'reason' => $reason
        ]);
        
        echo json_encode(["status" => "success", "message" => "Contact form submitted successfully"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "failed", "message" => "Database error: " . $e->getMessage()]);
    }
    exit;
}

echo json_encode(["status" => "failed", "message" => "Invalid request method"]);
?>