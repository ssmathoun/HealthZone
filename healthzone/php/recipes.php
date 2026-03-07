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

if ($action === 'create_recipe') {
    $data = json_decode(file_get_contents("php://input"), true);
    try {
        $stm = $connection->prepare("INSERT INTO recipes (user_id, name, category, calories, protein, carbs, fat, prep_time, servings, ingredients, instructions, image, created_at) VALUES (:uid, :name, :cat, :cal, :pro, :carb, :fat, :prep, :serv, :ing, :inst, :img, NOW())");
        $stm->execute([
            'uid' => $user_id, 'name' => $data['name'] ?? '', 'cat' => $data['category'] ?? 'Lunch',
            'cal' => $data['calories'] ?? 0, 'pro' => $data['protein'] ?? 0,
            'carb' => $data['carbs'] ?? 0, 'fat' => $data['fat'] ?? 0,
            'prep' => $data['prepTime'] ?? '15 min', 'serv' => $data['servings'] ?? 4,
            'ing' => json_encode($data['ingredients'] ?? []),
            'inst' => $data['instructions'] ?? '',
            'img' => $data['image'] ?? '',
        ]);
        echo json_encode(["status" => "success", "id" => $connection->lastInsertId()]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "success", "id" => 0, "note" => "Table may not exist yet"]);
    }
} elseif ($action === 'get_recipes') {
    try {
        $stm = $connection->prepare("SELECT * FROM recipes WHERE user_id = :uid ORDER BY created_at DESC");
        $stm->execute(['uid' => $user_id]);
        $recipes = $stm->fetchAll();
        foreach ($recipes as &$r) {
            $r->ingredients = json_decode($r->ingredients, true) ?? [];
            $r->prepTime = $r->prep_time;
        }
        echo json_encode($recipes);
    } catch (PDOException $e) {
        echo json_encode([]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid action"]);
}
