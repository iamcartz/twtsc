<?php
declare(strict_types=1);

session_start();
header("Content-Type: application/json; charset=UTF-8");

function respond(int $code, array $payload): void {
  http_response_code($code);
  echo json_encode($payload);
  exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  respond(405, ["errors" => ["Method not allowed"]]);
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!is_array($data)) {
  respond(400, ["errors" => ["Invalid JSON payload."]]);
}

// Honeypot
if (!empty($data["company"])) {
  respond(200, ["ok" => true]);
}

// ---- CONFIG ----
$SMTP_HOST = "twt.net.au";
$SMTP_USER = "no-reply@twt.net.au";
$SMTP_PASS = "REPLACE_WITH_REAL_PASSWORD";
$SMTP_PORT = 465;

$MAIL_TO = "info@twt.net.au";

$TURNSTILE_SECRET = "REPLACE_WITH_TURNSTILE_SECRET";

// ---- VALIDATE INPUT ----
$name = trim((string)($data["name"] ?? ""));
$email = trim((string)($data["email"] ?? ""));
$service = trim((string)($data["service"] ?? "Not sure"));
$message = trim((string)($data["message"] ?? ""));

$csrf = (string)($data["csrf"] ?? "");
$turnstileToken = (string)($data["turnstileToken"] ?? "");

$errors = [];

if ($name === "") $errors[] = "Name is required.";
if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Valid email is required.";
if ($message === "") $errors[] = "Message is required.";

if (empty($_SESSION["csrf"]) || !hash_equals($_SESSION["csrf"], $csrf)) {
  $errors[] = "Security token mismatch. Please refresh and try again.";
}

if ($turnstileToken === "") {
  $errors[] = "Turnstile token missing.";
}

if ($errors) {
  respond(400, ["errors" => $errors]);
}

// ---- VERIFY TURNSTILE ----
$verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
$postData = http_build_query([
  "secret" => $TURNSTILE_SECRET,
  "response" => $turnstileToken,
  "remoteip" => $_SERVER["REMOTE_ADDR"] ?? ""
]);

$ch = curl_init($verifyUrl);
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => $postData,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 10,
]);

$verifyRaw = curl_exec($ch);
$curlErr = curl_error($ch);
curl_close($ch);

if ($verifyRaw === false) {
  respond(500, ["errors" => ["Turnstile verification failed: $curlErr"]]);
}

$verify = json_decode($verifyRaw, true);
if (!is_array($verify) || empty($verify["success"])) {
  respond(400, ["errors" => ["Security check failed. Please try again."]]);
}

// ---- SEND EMAIL via PHPMailer ----
require __DIR__ . "/PHPMailer/src/Exception.php";
require __DIR__ . "/PHPMailer/src/PHPMailer.php";
require __DIR__ . "/PHPMailer/src/SMTP.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
  $mail = new PHPMailer(true);
  $mail->CharSet = "UTF-8";
  $mail->isSMTP();
  $mail->Host = $SMTP_HOST;
  $mail->SMTPAuth = true;
  $mail->Username = $SMTP_USER;
  $mail->Password = $SMTP_PASS;
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
  $mail->Port = $SMTP_PORT;

  $mail->setFrom($SMTP_USER, "Together We Thrive Website");
  $mail->addAddress($MAIL_TO);

  // lets you reply directly to user
  $mail->addReplyTo($email, $name);

  $subject = "New Contact Enquiry - " . $service;
  $body =
    "New enquiry received:\n\n" .
    "Name: {$name}\n" .
    "Email: {$email}\n" .
    "Preferred service: {$service}\n\n" .
    "Message:\n{$message}\n\n" .
    "IP: " . ($_SERVER["REMOTE_ADDR"] ?? "unknown") . "\n";

  $mail->Subject = $subject;
  $mail->Body = $body;

  $mail->send();

  // rotate csrf after successful post (optional but good)
  $_SESSION["csrf"] = bin2hex(random_bytes(32));

  respond(200, ["ok" => true]);
} catch (Exception $e) {
  respond(500, ["errors" => ["Mailer error: " . $e->getMessage()]]);
}
