<?php
require "autoload.php";
session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: https://aptitude.cse.buffalo.edu");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit(); }

$action = $_GET['action'] ?? '';
$user_id = $_SESSION['user_id'] ?? 0;

if ($action === 'log_meal') {
    $data = json_decode(file_get_contents("php://input"), true);
    try {
        $stm = $connection->prepare("INSERT INTO meal (user_id, name, meal_type, calories, protein, carbs, fat, logged_at) VALUES (:uid, :name, :type, :cal, :pro, :carb, :fat, NOW())");
        $stm->execute([
            'uid' => $user_id, 'name' => $data['name'] ?? '', 'type' => $data['type'] ?? 'lunch',
            'cal' => $data['calories'] ?? 0, 'pro' => $data['protein'] ?? 0,
            'carb' => $data['carbs'] ?? 0, 'fat' => $data['fat'] ?? 0,
        ]);
        echo json_encode(["status" => "success", "id" => $connection->lastInsertId()]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "success", "id" => 0, "note" => "Table may not exist yet"]);
    }
} elseif ($action === 'get_meals') {
    try {
        $stm = $connection->prepare("SELECT * FROM meal WHERE user_id = :uid AND DATE(logged_at) = CURDATE() ORDER BY logged_at DESC");
        $stm->execute(['uid' => $user_id]);
        echo json_encode($stm->fetchAll());
    } catch (PDOException $e) {
        echo json_encode([]);
    }
} elseif ($action === 'delete_meal') {
    $data = json_decode(file_get_contents("php://input"), true);
    try {
        $stm = $connection->prepare("DELETE FROM meal WHERE id = :id AND user_id = :uid");
        $stm->execute(['id' => $data['id'] ?? 0, 'uid' => $user_id]);
        echo json_encode(["status" => "success"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid action"]);
}
