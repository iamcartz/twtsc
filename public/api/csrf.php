<?php
declare(strict_types=1);

session_set_cookie_params([
  "lifetime" => 0,
  "path" => "/",
  "secure" => true,     // site uses https
  "httponly" => true,
  "samesite" => "Lax",
]);

session_start();
header("Content-Type: application/json; charset=UTF-8");

if (empty($_SESSION["csrf"])) {
  $_SESSION["csrf"] = bin2hex(random_bytes(32));
}

echo json_encode(["csrf" => $_SESSION["csrf"]]);
