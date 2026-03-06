<?php
session_start();
header("Content-Type: application/json");

// ===============================
// LOAD PHPMailer (manual)
// ===============================
require __DIR__ . "/../PHPMailer/src/Exception.php";
require __DIR__ . "/../PHPMailer/src/PHPMailer.php";
require __DIR__ . "/../PHPMailer/src/SMTP.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ===============================
// CONFIG (SERVER SIDE ONLY)
// ===============================
// IMPORTANT: rotate these secrets since they were shared.
// Ideally load from env vars instead of hardcoding.
$SMTP_HOST = "twt.net.au";
$SMTP_USER = "no-reply@twt.net.au";
$SMTP_PASS = "4H!cz6NIkb?+}Sa~";
$SMTP_PORT = 465;

$MAIL_TO = "info@twt.net.au";

$TURNSTILE_SECRET = "0x4AAAAAACZ-mfDplW990B-H8SN2K6OYLzw";

// ===============================
// HELPERS
// ===============================
function clean($v) {
  return trim(htmlspecialchars($v ?? "", ENT_QUOTES, "UTF-8"));
}

function json_fail($code, $errors) {
  http_response_code($code);
  echo json_encode(["errors" => is_array($errors) ? $errors : [$errors]]);
  exit;
}

// ===============================
// ACCEPT multipart/form-data
// ===============================
$data = $_POST;

// Honeypot
if (!empty($data["company"])) {
  echo json_encode(["ok" => true]);
  exit;
}

// ===============================
// CSRF CHECK
// ===============================
if (
  empty($data["csrf"]) ||
  empty($_SESSION["csrf"]) ||
  !hash_equals($_SESSION["csrf"], $data["csrf"])
) {
  json_fail(400, "Security token invalid. Refresh page.");
}

// ===============================
// TURNSTILE VERIFY
// ===============================
if (empty($data["turnstileToken"])) {
  json_fail(400, "Complete the security check.");
}

$verify = curl_init("https://challenges.cloudflare.com/turnstile/v0/siteverify");
curl_setopt_array($verify, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => http_build_query([
    "secret"   => $TURNSTILE_SECRET,
    "response" => $data["turnstileToken"],
    "remoteip" => $_SERVER["REMOTE_ADDR"] ?? ""
  ])
]);

$response = curl_exec($verify);
curl_close($verify);

$result = json_decode($response, true);

if (empty($result["success"])) {
  json_fail(400, "Turnstile verification failed.");
}

// ===============================
// VALIDATE FIELDS
// ===============================
$referrerName  = clean($data["referrerName"] ?? "");
$referrerEmail = clean($data["referrerEmail"] ?? "");
$referrerPhone = clean($data["referrerPhone"] ?? "");

$participantName  = clean($data["participantName"] ?? "");
$participantPhone = clean($data["participantPhone"] ?? "");
$participantEmail = clean($data["participantEmail"] ?? "");

$referralType = clean($data["referralType"] ?? "");
$message      = clean($data["message"] ?? "");
$consent      = !empty($data["consent"]); // expects "yes" or truthy

$errors = [];

if (!$referrerName) $errors[] = "Your name is required.";
if (!filter_var($referrerEmail, FILTER_VALIDATE_EMAIL)) $errors[] = "Valid email required.";
if (!$participantName) $errors[] = "Participant name required.";
if (!$participantPhone && !$participantEmail) $errors[] = "Participant phone or email required.";
if ($participantEmail && !filter_var($participantEmail, FILTER_VALIDATE_EMAIL)) $errors[] = "Participant email looks invalid.";
if (!$message) $errors[] = "Message required.";
if (!$consent) $errors[] = "Consent must be confirmed.";

if ($errors) json_fail(400, $errors);

// ===============================
// OPTIONAL ATTACHMENT (SECURE)
// ===============================
$attachmentTmp  = null;
$attachmentName = null;

if (isset($_FILES["attachment"]) && is_array($_FILES["attachment"]) && ($_FILES["attachment"]["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
  $err = $_FILES["attachment"]["error"] ?? UPLOAD_ERR_OK;
  if ($err !== UPLOAD_ERR_OK) {
    json_fail(400, "Attachment upload failed. Please try again.");
  }

  $maxBytes = 5 * 1024 * 1024; // 5MB
  $size = (int)($_FILES["attachment"]["size"] ?? 0);
  if ($size <= 0) {
    // treat as no file
  } elseif ($size > $maxBytes) {
    json_fail(400, "Attachment is too large. Max 5MB.");
  } else {
    $tmp = $_FILES["attachment"]["tmp_name"] ?? "";
    if (!$tmp || !is_uploaded_file($tmp)) {
      json_fail(400, "Invalid attachment upload.");
    }

    // Extension allowlist
    $original = (string)($_FILES["attachment"]["name"] ?? "attachment");
    $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
    $allowedExt = ["pdf", "jpg", "jpeg", "png"];
    if (!in_array($ext, $allowedExt, true)) {
      json_fail(400, "Invalid attachment type. Only PDF/JPG/PNG allowed.");
    }

    // MIME allowlist using finfo (stronger than relying on browser)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmp);
    $allowedMime = ["application/pdf", "image/jpeg", "image/png"];
    if (!in_array($mime, $allowedMime, true)) {
      json_fail(400, "Invalid attachment content type.");
    }

    // Safe-ish filename for email attachment
    $safeBase = preg_replace('/[^a-zA-Z0-9._-]+/', '_', pathinfo($original, PATHINFO_FILENAME));
    $safeBase = substr($safeBase ?: "attachment", 0, 60);
    $attachmentName = $safeBase . "." . $ext;
    $attachmentTmp  = $tmp;
  }
}

// ===============================
// BUILD EMAIL
// ===============================
$body = "
NEW REFERRAL

Referrer:
Name: $referrerName
Email: $referrerEmail
Phone: $referrerPhone

Participant:
Name: $participantName
Phone: $participantPhone
Email: $participantEmail

Support Needed:
$referralType

Notes:
$message
";

if ($attachmentName) {
  $body .= "\n\nAttachment included: $attachmentName";
} else {
  $body .= "\n\nAttachment: (none)";
}

// ===============================
// SEND MAIL
// ===============================
try {
  $mail = new PHPMailer(true);
  $mail->isSMTP();
  $mail->Host = $SMTP_HOST;
  $mail->SMTPAuth = true;
  $mail->Username = $SMTP_USER;
  $mail->Password = $SMTP_PASS;
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
  $mail->Port = $SMTP_PORT;

  $mail->setFrom($SMTP_USER, "Together We Thrive");
  $mail->addAddress($MAIL_TO);
  $mail->addReplyTo($referrerEmail, $referrerName);

  $mail->Subject = "New Referral - $participantName";
  $mail->Body    = $body;
  $mail->isHTML(false);

  // ✅ Attach ONLY if present (optional)
  if ($attachmentTmp && $attachmentName) {
    $mail->addAttachment($attachmentTmp, $attachmentName);
  }

  $mail->send();

  echo json_encode(["ok" => true]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["errors" => ["Email failed to send."]]);
}
