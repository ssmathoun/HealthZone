<?php
require "autoload.php";

header("Access-Control-Allow-Origin: https://aptitude.cse.buffalo.edu");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$user_id = $_SESSION['user_id'] ?? null;

// Require authentication
if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized. Please log in."]);
    exit;
}

try {
    $action = $_GET['action'] ?? '';

   if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        
        if ($action === 'get_history') {
            $query = "SELECT hours, created_at FROM sleep_logs WHERE user_id = :uid ORDER BY created_at DESC";
            $stm = $connection->prepare($query);
            $stm->execute(['uid' => $user_id]);
            
            $results = $stm->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($results);
            exit;
        }

        if ($action === 'get_latest') {
            $query = "SELECT hours FROM sleep_logs WHERE user_id = :uid AND DATE(created_at) = CURDATE() ORDER BY created_at DESC LIMIT 1";
            $stm = $connection->prepare($query);
            $stm->execute(['uid' => $user_id]);
            
            $result = $stm->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                echo json_encode(["hours" => (float)$result['hours']]);
            } else {
                echo json_encode(["hours" => 0]);
            }
            exit;
        }
    }

   if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $hours = $input['hours'] ?? null;

       if ($hours === null || !is_numeric($hours) || $hours <= 0 || $hours > 24) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid hours provided."]);
            exit;
        }

        $query = "INSERT INTO sleep_logs (user_id, hours, created_at) VALUES (:uid, :hours, NOW())";
        $stm = $connection->prepare($query);
        $stm->execute(['uid' => $user_id, 'hours' => $hours]);

        echo json_encode(["status" => "success", "message" => "Sleep logged successfully."]);
        exit;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}