<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION["csrf"])) {
    $_SESSION["csrf"] = bin2hex(random_bytes(32));
}

echo json_encode([
    "csrf" => $_SESSION["csrf"]
]);
