<?php
declare(strict_types=1);

session_start();
header("Content-Type: application/json; charset=UTF-8");

function respond(int $code, array $payload): void {
  http_response_code($code);
  echo json_encode($payload);
  exit;
}

function clean_text(string $value): string {
  $value = trim($value);
  $value = preg_replace("/\r\n|\r|\n/", "\n", $value);
  return $value ?? "";
}

function esc_html(string $value): string {
  return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");
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
$SMTP_PASS = "4H!cz6NIkb?+}Sa~";
$SMTP_PORT = 465;

$MAIL_TO = "info@twt.net.au";

$TURNSTILE_SECRET = "0x4AAAAAACZ-mfDplW990B-H8SN2K6OYLzw";

// ---- VALIDATE INPUT ----
$name = clean_text((string)($data["name"] ?? ""));
$email = clean_text((string)($data["email"] ?? ""));
$service = clean_text((string)($data["service"] ?? "Not sure"));
$contactNo = clean_text((string)($data["contactNo"] ?? ""));
$message = clean_text((string)($data["message"] ?? ""));
$source = clean_text((string)($data["source"] ?? "Website Contact Form"));

$csrf = (string)($data["csrf"] ?? "");
$turnstileToken = (string)($data["turnstileToken"] ?? "");

$allowedSources = [
  "Website Contact Form",
  "NDIS Support Landing Page",
];

if (!in_array($source, $allowedSources, true)) {
  $source = "Website Contact Form";
}

$errors = [];

if ($name === "") {
  $errors[] = "Name is required.";
}

if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  $errors[] = "Valid email is required.";
}

if ($contactNo === "") {
  $errors[] = "Phone number is required.";
}

if ($message === "") {
  $errors[] = "Message is required.";
}

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
require __DIR__ . "/../PHPMailer/src/Exception.php";
require __DIR__ . "/../PHPMailer/src/PHPMailer.php";
require __DIR__ . "/../PHPMailer/src/SMTP.php";

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
  $mail->addReplyTo($email, $name);

  $ipAddress = $_SERVER["REMOTE_ADDR"] ?? "unknown";
  $submittedAt = date("Y-m-d H:i:s");

  $subject = $source === "NDIS Support Landing Page"
    ? "New NDIS Landing Page Enquiry - " . $service
    : "New Contact Enquiry - " . $service;

  $plainBody =
    "New enquiry received\n\n" .
    "Source: {$source}\n" .
    "Name: {$name}\n" .
    "Phone Number: {$contactNo}\n" .
    "Email: {$email}\n" .
    "Preferred service: {$service}\n" .
    "Submitted: {$submittedAt}\n" .
    "IP: {$ipAddress}\n\n" .
    "Message:\n{$message}\n";

  $htmlBody = '
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#16324a;">
      <h2 style="margin:0 0 16px;color:#123357;">New enquiry received</h2>

      <table cellpadding="8" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:720px;">
        <tr>
          <td style="width:180px;font-weight:700;border-bottom:1px solid #e5edf2;">Source</td>
          <td style="border-bottom:1px solid #e5edf2;">' . esc_html($source) . '</td>
        </tr>
        <tr>
          <td style="font-weight:700;border-bottom:1px solid #e5edf2;">Name</td>
          <td style="border-bottom:1px solid #e5edf2;">' . esc_html($name) . '</td>
        </tr>
        <tr>
          <td style="font-weight:700;border-bottom:1px solid #e5edf2;">Email</td>
          <td style="border-bottom:1px solid #e5edf2;">' . esc_html($email) . '</td>
        </tr>
         <tr>
          <td style="font-weight:700;border-bottom:1px solid #e5edf2;">Phone Number</td>
          <td style="border-bottom:1px solid #e5edf2;">' . esc_html($contactNo) . '</td>
        </tr>
        <tr>
          <td style="font-weight:700;border-bottom:1px solid #e5edf2;">Preferred service</td>
          <td style="border-bottom:1px solid #e5edf2;">' . esc_html($service) . '</td>
        </tr>
        <tr>
          <td style="font-weight:700;border-bottom:1px solid #e5edf2;">Submitted</td>
          <td style="border-bottom:1px solid #e5edf2;">' . esc_html($submittedAt) . '</td>
        </tr>
        <tr>
          <td style="font-weight:700;border-bottom:1px solid #e5edf2;">IP</td>
          <td style="border-bottom:1px solid #e5edf2;">' . esc_html($ipAddress) . '</td>
        </tr>
      </table>

      <div style="margin-top:20px;">
        <div style="font-weight:700;margin-bottom:8px;color:#123357;">Message</div>
        <div style="padding:14px 16px;background:#f7fafc;border:1px solid #e5edf2;border-radius:10px;white-space:pre-wrap;">' . nl2br(esc_html($message)) . '</div>
      </div>
    </div>
  ';

  $mail->isHTML(true);
  $mail->Subject = $subject;
  $mail->Body = $htmlBody;
  $mail->AltBody = $plainBody;

  $mail->send();

  $_SESSION["csrf"] = bin2hex(random_bytes(32));

  respond(200, ["ok" => true]);
} catch (Exception $e) {
  respond(500, ["errors" => ["Mailer error: " . $e->getMessage()]]);
}