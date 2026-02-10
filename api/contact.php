<?php
session_start();
header("Content-Type: application/json");

// ===============================
// LOAD PHPMailer (manual include)
// ===============================
require __DIR__ . "/PHPMailer/src/Exception.php";
require __DIR__ . "/PHPMailer/src/PHPMailer.php";
require __DIR__ . "/PHPMailer/src/SMTP.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ===============================
// CONFIG (SERVER SIDE ONLY)
// ===============================

$SMTP_HOST = "twt.net.au";
$SMTP_USER = "no-reply@twt.net.au";
$SMTP_PASS = "4H!cz6NIkb?+}Sa~";          // <- put your real password here (server only)
$SMTP_PORT = 465;

$MAIL_TO = "info@twt.net.au";

$TURNSTILE_SECRET = "0x4AAAAAACZ-mfDplW990B-H8SN2K6OYLzw"; // <- server only

// ===============================
// READ JSON INPUT
// ===============================
$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) $input = [];

// Honeypot (bots)
if (!empty($input["company"] ?? "")) {
  echo json_encode(["ok" => true]);
  exit;
}

// ===============================
// CSRF CHECK
// ===============================
$csrf = (string)($input["csrf"] ?? "");
if (
  empty($csrf) ||
  empty($_SESSION["csrf"]) ||
  !hash_equals($_SESSION["csrf"], $csrf)
) {
  http_response_code(400);
  echo json_encode(["errors" => ["Security token invalid. Please refresh the page."]]);
  exit;
}

// ===============================
// TURNSTILE VERIFY
// ===============================
$turnstileToken = (string)($input["turnstileToken"] ?? "");
if (!$turnstileToken) {
  http_response_code(400);
  echo json_encode(["errors" => ["Please complete the security check."]]);
  exit;
}

$ch = curl_init("https://challenges.cloudflare.com/turnstile/v0/siteverify");
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => http_build_query([
    "secret" => $TURNSTILE_SECRET,
    "response" => $turnstileToken,
    "remoteip" => $_SERVER["REMOTE_ADDR"] ?? "",
  ]),
  CURLOPT_TIMEOUT => 10,
]);
$resp = curl_exec($ch);
curl_close($ch);

$verify = json_decode($resp ?: "", true);
if (!is_array($verify) || empty($verify["success"])) {
  http_response_code(400);
  echo json_encode(["errors" => ["Turnstile verification failed. Please try again."]]);
  exit;
}

// ===============================
// SANITIZE + VALIDATE FIELDS
// ===============================
function clean($v): string {
  return trim((string)($v ?? ""));
}

$name    = clean($input["name"] ?? "");
$email   = clean($input["email"] ?? "");
$service = clean($input["service"] ?? "Not sure");
$message = clean($input["message"] ?? "");

$errors = [];
if ($name === "") $errors[] = "Please enter your name.";
if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Please enter a valid email address.";
if ($message === "") $errors[] = "Please enter a message.";

if ($errors) {
  http_response_code(400);
  echo json_encode(["errors" => $errors]);
  exit;
}

// ===============================
// BUILD EMAIL BODY
// ===============================
$plainBody = "NEW CONTACT ENQUIRY\n\n"
  . "Name: {$name}\n"
  . "Email: {$email}\n"
  . "Preferred Service: {$service}\n\n"
  . "Message:\n{$message}\n\n"
  . "IP: " . ($_SERVER["REMOTE_ADDR"] ?? "unknown") . "\n"
  . "Time (UTC): " . gmdate("Y-m-d H:i:s") . "\n";

// ===============================
// SEND EMAIL
// ===============================
try {
  $mail = new PHPMailer(true);
  $mail->CharSet = "UTF-8";

  $mail->isSMTP();
  $mail->Host = $SMTP_HOST;
  $mail->SMTPAuth = true;
  $mail->Username = $SMTP_USER;
  $mail->Password = $SMTP_PASS;

  // Port 465 = implicit TLS
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
  $mail->Port = $SMTP_PORT;

  $mail->setFrom($SMTP_USER, "Together We Thrive");
  $mail->addAddress($MAIL_TO);

  // Replies go back to the sender
  $mail->addReplyTo($email, $name);

  $mail->Subject = "New Contact Enquiry: {$name} ({$service})";
  $mail->Body = $plainBody;

  $mail->send();

  // optional: rotate CSRF after success
  $_SESSION["csrf"] = bin2hex(random_bytes(32));

  echo json_encode(["ok" => true]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["errors" => ["Message failed to send. Please try again later."]]);
}
