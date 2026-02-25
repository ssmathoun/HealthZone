<?php
require "autoload.php"; // This starts session and connects to DB

$Error = "";

if($_SERVER['REQUEST_METHOD'] == "POST") {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if(!empty($username) && !empty($password)) {
        // Querying the 'users' table specifically
        $query = "SELECT id, username, password FROM users WHERE username = :username LIMIT 1";
        $stm = $connection->prepare($query);
        $stm->execute(['username' => $username]);
        $row = $stm->fetch();

        // Verifying the hashed password
        if($row && password_verify($password, $row->password)) {
            $_SESSION['user_id'] = $row->id;
            $_SESSION['username'] = $row->username;

            header("Location: index.php");
            die;
        } else {
            $Error = "Invalid username or password";
        }
    } else {
        $Error = "All fields are required";
    }
}
?>