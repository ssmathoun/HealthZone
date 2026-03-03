<?php
// nutrition_today.php
require "autoload.php";

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");


if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit;
}


if (!isset($_SESSION["user_id"])) {
  http_response_code(401);
  echo json_encode(["status" => "error", "message" => "Not logged in"]);
  exit;
}

$userId = (int) $_SESSION["user_id"];

try {
  
  $goals = [
    "calories" => 2400,
    "protein" => 180,
    "carbs" => 300,
    "fat" => 70
  ];

  $g = $connection->prepare("
    SELECT calorie_goal, protein_goal, carb_goal, fat_goal
    FROM nutrition_goals
    WHERE user_id = :uid
    LIMIT 1
  ");
  $g->execute(["uid" => $userId]);
  $goalRow = $g->fetch();

  if ($goalRow) {
    $goals["calories"] = (int)$goalRow->calorie_goal;
    $goals["protein"]  = (int)$goalRow->protein_goal;
    $goals["carbs"]    = (int)$goalRow->carb_goal;
    $goals["fat"]      = (int)$goalRow->fat_goal;
  }


  $start = date("Y-m-d 00:00:00");
  $end   = date("Y-m-d 23:59:59");

  $s = $connection->prepare("
    SELECT
      COALESCE(SUM(calories), 0) AS calories,
      COALESCE(SUM(protein), 0)  AS protein,
      COALESCE(SUM(carbs), 0)    AS carbs,
      COALESCE(SUM(fat), 0)      AS fat
    FROM meal
        WHERE (user_id = :uid OR user_id = 0)
        AND logged_at BETWEEN :start AND :end
    ");
  $s->execute([
    "uid" => $userId,
    "start" => $start,
    "end" => $end
  ]);
  $sum = $s->fetch();

  $consumed = [
    "calories" => (int) round((float)$sum->calories),
    "protein"  => (int) round((float)$sum->protein),
    "carbs"    => (int) round((float)$sum->carbs),
    "fat"      => (int) round((float)$sum->fat)
  ];

  $percent = function($val, $goal) {
    if ($goal <= 0) return 0;
    $p = ($val / $goal) * 100;
    if ($p < 0) $p = 0;
    return round($p, 1);
  };

  echo json_encode([
    "status" => "success",
    "date" => date("Y-m-d"),
    "goals" => $goals,
    "consumed" => $consumed,
    "percent" => [
      "calories" => $percent($consumed["calories"], $goals["calories"]),
      "protein"  => $percent($consumed["protein"],  $goals["protein"]),
      "carbs"    => $percent($consumed["carbs"],    $goals["carbs"]),
      "fat"      => $percent($consumed["fat"],      $goals["fat"])
    ]
  ]);

} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(["status" => "error", "message" => "Server error"]);
}