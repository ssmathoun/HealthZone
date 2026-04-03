<?php
require "autoload.php";

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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
$action = $_GET["action"] ?? "";

try {
    // GET: fetch weight logs for a given timeframe
    if ($_SERVER["REQUEST_METHOD"] === "GET") {
        // timeframe: 7, 30, 90, 180 (days)
        $days = isset($_GET["days"]) ? (int) $_GET["days"] : 30;
        if ($days < 1)    $days = 1;
        if ($days > 3650) $days = 3650;

        $stmt = $connection->prepare("
            SELECT id, weight_lbs, logged_at
            FROM weight_logs
            WHERE user_id = :uid
              AND logged_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
            ORDER BY logged_at ASC
        ");
        $stmt->bindValue(":uid", $userId, PDO::PARAM_INT);
        $stmt->bindValue(":days", $days, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $logs = array_map(function($r) {
            return [
                "id"         => (int) $r["id"],
                "weight_lbs" => (float) $r["weight_lbs"],
                "logged_at"  => $r["logged_at"],
            ];
        }, $rows);

        echo json_encode(["status" => "success", "logs" => $logs]);
        exit;
    }

    // POST: log a new weight entry
    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $body = json_decode(file_get_contents("php://input"), true);
        $weight = isset($body["weight_lbs"]) ? (float) $body["weight_lbs"] : null;

        if ($weight === null || $weight <= 0 || $weight > 1500) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid weight value"]);
            exit;
        }

        $stmt = $connection->prepare("
            INSERT INTO weight_logs (user_id, weight_lbs, logged_at)
            VALUES (:uid, :weight, NOW())
        ");
        $stmt->execute([":uid" => $userId, ":weight" => $weight]);
        $id = (int) $connection->lastInsertId();

        echo json_encode([
            "status" => "success",
            "log" => [
                "id"         => $id,
                "weight_lbs" => $weight,
                "logged_at"  => date("Y-m-d H:i:s"),
            ]
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error"]);
}
