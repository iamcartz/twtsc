<?php
session_start();
header("Content-Type: application/json");

// ===============================
// LOAD PHPMailer (manual)
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
$SMTP_PASS = "4H!cz6NIkb?+}Sa~";
$SMTP_PORT = 465;

$MAIL_TO = "info@twt.net.au";

$TURNSTILE_SECRET = "0x4AAAAAACZ-mfDplW990B-H8SN2K6OYLzw";

// ===============================
// READ JSON INPUT
// ===============================
$data = json_decode(file_get_contents("php://input"), true);

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
    http_response_code(400);
    echo json_encode(["errors" => ["Security token invalid. Refresh page."]]);
    exit;
}

// ===============================
// TURNSTILE VERIFY
// ===============================
if (empty($data["turnstileToken"])) {
    http_response_code(400);
    echo json_encode(["errors" => ["Complete the security check."]]);
    exit;
}

$verify = curl_init("https://challenges.cloudflare.com/turnstile/v0/siteverify");

curl_setopt_array($verify, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query([
        "secret" => $TURNSTILE_SECRET,
        "response" => $data["turnstileToken"],
        "remoteip" => $_SERVER["REMOTE_ADDR"]
    ])
]);

$response = curl_exec($verify);
curl_close($verify);

$result = json_decode($response, true);

if (empty($result["success"])) {
    http_response_code(400);
    echo json_encode(["errors" => ["Turnstile verification failed."]]);
    exit;
}

// ===============================
// VALIDATE FIELDS
// ===============================

function clean($v) {
    return trim(htmlspecialchars($v ?? ""));
}

$referrerName  = clean($data["referrerName"]);
$referrerEmail = clean($data["referrerEmail"]);
$referrerPhone = clean($data["referrerPhone"]);

$participantName  = clean($data["participantName"]);
$participantPhone = clean($data["participantPhone"]);
$participantEmail = clean($data["participantEmail"]);

$referralType = clean($data["referralType"]);
$message      = clean($data["message"]);
$consent      = $data["consent"] ?? false;

$errors = [];

if (!$referrerName) $errors[] = "Your name is required.";
if (!filter_var($referrerEmail, FILTER_VALIDATE_EMAIL))
    $errors[] = "Valid email required.";
if (!$participantName) $errors[] = "Participant name required.";
if (!$participantPhone && !$participantEmail)
    $errors[] = "Participant phone or email required.";
if (!$message) $errors[] = "Message required.";
if (!$consent) $errors[] = "Consent must be confirmed.";

if ($errors) {
    http_response_code(400);
    echo json_encode(["errors" => $errors]);
    exit;
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

    $mail->send();

    echo json_encode(["ok" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "errors" => ["Email failed to send."]
    ]);
}
