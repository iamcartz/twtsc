<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=UTF-8");

$out = [
  "php" => PHP_VERSION,
  "curl_loaded" => extension_loaded("curl"),
  "openssl_loaded" => extension_loaded("openssl"),
  "allow_url_fopen" => (bool)ini_get("allow_url_fopen"),
  "can_https" => null,
  "phphmailer_paths" => [
    "Exception.php" => file_exists(__DIR__ . "/../PHPMailer/src/Exception.php"),
    "PHPMailer.php" => file_exists(__DIR__ . "/../PHPMailer/src/PHPMailer.php"),
    "SMTP.php" => file_exists(__DIR__ . "/../PHPMailer/src/SMTP.php"),
  ],
];

$testUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
$context = stream_context_create(["http" => ["method" => "GET", "timeout" => 6]]);
$raw = @file_get_contents($testUrl, false, $context);
$out["can_https"] = ($raw !== false);

echo json_encode($out);
