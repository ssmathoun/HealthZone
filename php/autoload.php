<?php
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => 'aptitude.cse.buffalo.edu', 
    'secure' => true,
    'httponly' => true,
    'samesite' => 'None'
]);

session_start();

$host = 'localhost';
$db   = 'cse442_2026_spring_team_v_db';
$user = 'radinhas';
$pass = '50534181';

try {
    $connection = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    header("Content-Type: application/json");
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}