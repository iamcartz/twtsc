<?php
declare(strict_types=1);

session_start();
header("Content-Type: application/json; charset=UTF-8");

// -----------------------------
// Helpers
// -----------------------------
function respond(int $code, array $payload): void {
  http_response_code($code);
  echo json_encode($payload);
  exit;
}

// Return JSON even on fatals
register_shutdown_function(function () {
  $err = error_get_last();
  if ($err && in_array($err["type"], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
    http_response_code(500);
    echo json_encode([
      "ok" => false,
      "error" => "Fatal: " . $err["message"],
      "file" => basename($err["file"]),
      "line" => $err["line"],
    ]);
  }
});

function nowMs(): int { return (int) floor(microtime(true) * 1000); }

function safeFilename(string $name): string {
  $name = basename($name);
  $name = preg_replace('/[^a-zA-Z0-9._-]/', '_', $name) ?? "file";
  $name = ltrim($name, "._");
  return $name !== "" ? $name : "file";
}

function detectMime(string $tmpPath): string {
  $finfo = new finfo(FILEINFO_MIME_TYPE);
  $mime = $finfo->file($tmpPath);
  return is_string($mime) ? $mime : "application/octet-stream";
}

// HTML escape
function h($v): string {
  return htmlspecialchars((string)$v, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");
}

// Take POST value, normalize empty to —
function pick(array $fields, string $key, string $fallback = "—"): string {
  $v = $fields[$key] ?? "";
  if (is_array($v)) $v = implode(", ", $v);
  $v = trim((string)$v);
  return $v !== "" ? $v : $fallback;
}

function pickYesNo(array $fields, string $key): string {
  $v = $fields[$key] ?? "";
  $v = is_array($v) ? implode(", ", $v) : (string)$v;
  $v = strtolower(trim($v));
  if ($v === "yes" || $v === "1" || $v === "true") return "Yes";
  if ($v === "no" || $v === "0" || $v === "false") return "No";
  return $v !== "" ? $v : "—";
}

function joinChecks(array $fields, array $map): string {
  $out = [];
  foreach ($map as $k => $label) {
    if (!empty($fields[$k])) $out[] = $label;
  }
  return $out ? implode(", ", $out) : "—";
}

// -----------------------------
// CONFIG - UPDATE THESE
// -----------------------------

// Turnstile secret
$TURNSTILE_SECRET = "0x4AAAAAACZ-mfDplW990B-H8SN2K6OYLzw";

// SMTP
$SMTP_HOST = "twt.net.au";
$SMTP_USER = "no-reply@twt.net.au";
$SMTP_PASS = "4H!cz6NIkb?+}Sa~";
$SMTP_PORT = 465;

$MAIL_TO = "info@twt.net.au";

// Database (MySQL)
$DB_HOST = "localhost";
$DB_NAME = "PUT_YOUR_DB_NAME_HERE";
$DB_USER = "PUT_YOUR_DB_USER_HERE";
$DB_PASS = "PUT_YOUR_DB_PASS_HERE";

// Upload storage (protected)
$UPLOAD_DIR = __DIR__ . "/_uploads_intake"; // public_html/api/_uploads_intake
if (!is_dir($UPLOAD_DIR)) { @mkdir($UPLOAD_DIR, 0700, true); }

// -----------------------------
// PDO
// -----------------------------
function pdo(string $host, string $db, string $user, string $pass): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;

  $dsn = "mysql:host={$host};dbname={$db};charset=utf8mb4";
  $pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
  return $pdo;
}

// -----------------------------
// Rate limiting
// -----------------------------
function rateLimitOrDie(string $ip): void {
  // Session: 3 submissions / 10 minutes
  $windowMs = 10 * 60 * 1000;
  $maxSess = 3;

  $_SESSION["intake_rl"] = $_SESSION["intake_rl"] ?? [];
  $events = array_filter($_SESSION["intake_rl"], function($t) { return is_int($t) && (nowMs() - $t) < $windowMs; });

  if (count($events) >= $maxSess) {
    respond(429, ["ok" => false, "error" => "Too many submissions. Please try again in a few minutes."]);
  }
  $events[] = nowMs();
  $_SESSION["intake_rl"] = array_values($events);

  // IP file-based: 10 submissions / hour
  $ipWindowSec = 3600;
  $maxIp = 10;

  $dir = __DIR__ . "/_ratelimit";
  if (!is_dir($dir)) @mkdir($dir, 0700, true);

  $key = preg_replace('/[^a-zA-Z0-9._-]/', '_', $ip);
  $path = $dir . "/ip_" . $key . ".json";

  $data = ["ts" => []];
  if (is_file($path)) {
    $raw = @file_get_contents($path);
    $json = json_decode((string)$raw, true);
    if (is_array($json) && isset($json["ts"]) && is_array($json["ts"])) $data = $json;
  }

  $now = time();
  $data["ts"] = array_values(array_filter($data["ts"], function($t) use ($now, $ipWindowSec) { return is_int($t) && ($now - $t) < $ipWindowSec; }));

  if (count($data["ts"]) >= $maxIp) {
    respond(429, ["ok" => false, "error" => "Too many submissions from your network. Please try again later."]);
  }

  $data["ts"][] = $now;
  @file_put_contents($path, json_encode($data), LOCK_EX);
}

// -----------------------------
// Request checks
// -----------------------------
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  respond(405, ["ok" => false, "error" => "Method not allowed"]);
}

$ip = $_SERVER["REMOTE_ADDR"] ?? "";
$ua = substr((string)($_SERVER["HTTP_USER_AGENT"] ?? ""), 0, 255);

rateLimitOrDie($ip);

// -----------------------------
// CSRF verify
// -----------------------------
$postedCsrf = (string)($_POST["csrf"] ?? "");
$sessCsrf   = (string)($_SESSION["csrf"] ?? "");
$csrfOk = ($postedCsrf !== "" && $sessCsrf !== "" && hash_equals($sessCsrf, $postedCsrf));

if (!$csrfOk) {
  respond(403, ["ok" => false, "error" => "Invalid security token. Please refresh and try again."]);
}

// -----------------------------
// Turnstile verify
// -----------------------------
$token = (string)($_POST["cf_turnstile_response"] ?? "");
if ($token === "") {
  respond(400, ["ok" => false, "error" => "Missing Turnstile token."]);
}

if (!function_exists("curl_init")) {
  respond(500, ["ok" => false, "error" => "Server missing cURL extension."]);
}

$verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
$postData = http_build_query([
  "secret" => $TURNSTILE_SECRET,
  "response" => $token,
  "remoteip" => $ip,
]);

$ch = curl_init($verifyUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

// If your host has broken outbound SSL, ask host to fix CA.
// TEMP workaround (not recommended long-term):
// curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
// curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);

$verifyResponse = curl_exec($ch);
$curlErr = curl_error($ch);
curl_close($ch);

if ($verifyResponse === false) {
  respond(500, ["ok" => false, "error" => "Turnstile verification failed.", "detail" => $curlErr]);
}

$verifyJson = json_decode((string)$verifyResponse, true);
$turnstileOk = is_array($verifyJson) && !empty($verifyJson["success"]);
if (!$turnstileOk) {
  respond(403, ["ok" => false, "error" => "Turnstile rejected.", "codes" => $verifyJson["error-codes"] ?? []]);
}

// -----------------------------
// PHPMailer load (manual)
// -----------------------------
$ex = __DIR__ . "/../PHPMailer/src/Exception.php";
$ph = __DIR__ . "/../PHPMailer/src/PHPMailer.php";
$sm = __DIR__ . "/../PHPMailer/src/SMTP.php";

if (!file_exists($ex) || !file_exists($ph) || !file_exists($sm)) {
  respond(500, [
    "ok" => false,
    "error" => "PHPMailer files not found. Check folder path.",
    "paths" => ["Exception.php" => $ex, "PHPMailer.php" => $ph, "SMTP.php" => $sm],
  ]);
}

require $ex;
require $ph;
require $sm;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// -----------------------------
// Collect fields (friendly labels)
// -----------------------------
$raw = $_POST;
unset($raw["csrf"], $raw["cf_turnstile_response"]);

$fields = $raw; // keep for DB json

// -----------------------------
// Hardened attachments
// -----------------------------
$maxFiles = 10;
$maxEachBytes = 10 * 1024 * 1024;   // 10MB each
$maxTotalBytes = 25 * 1024 * 1024;  // 25MB total
$totalBytes = 0;

$allowedMimes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

$attachmentsMeta = [];
$storedFiles = []; // for attaching from disk

if (!empty($_FILES["uploads"]) && isset($_FILES["uploads"]["name"]) && is_array($_FILES["uploads"]["name"])) {
  $count = min(count($_FILES["uploads"]["name"]), $maxFiles);

  for ($i = 0; $i < $count; $i++) {
    $origName = (string)($_FILES["uploads"]["name"][$i] ?? "");
    $tmp  = (string)($_FILES["uploads"]["tmp_name"][$i] ?? "");
    $err  = (int)($_FILES["uploads"]["error"][$i] ?? UPLOAD_ERR_NO_FILE);
    $size = (int)($_FILES["uploads"]["size"][$i] ?? 0);

    if ($err === UPLOAD_ERR_NO_FILE) continue;
    if ($err !== UPLOAD_ERR_OK) {
      $attachmentsMeta[] = ["original" => $origName, "skipped" => true, "reason" => "upload_error_" . $err];
      continue;
    }
    if ($tmp === "" || !is_uploaded_file($tmp)) {
      $attachmentsMeta[] = ["original" => $origName, "skipped" => true, "reason" => "not_uploaded_file"];
      continue;
    }
    if ($size <= 0 || $size > $maxEachBytes) {
      $attachmentsMeta[] = ["original" => $origName, "skipped" => true, "reason" => "size_invalid", "size" => $size];
      continue;
    }

    $totalBytes += $size;
    if ($totalBytes > $maxTotalBytes) {
      $attachmentsMeta[] = ["original" => $origName, "skipped" => true, "reason" => "total_size_exceeded"];
      break;
    }

    $mime = detectMime($tmp);
    if (!in_array($mime, $allowedMimes, true)) {
      $attachmentsMeta[] = ["original" => $origName, "skipped" => true, "reason" => "mime_not_allowed", "mime" => $mime];
      continue;
    }

    $safe = safeFilename($origName);
    $storedName = date("Ymd_His") . "_" . bin2hex(random_bytes(4)) . "_" . $safe;
    $storedPath = rtrim($UPLOAD_DIR, "/") . "/" . $storedName;

    if (!@move_uploaded_file($tmp, $storedPath)) {
      $attachmentsMeta[] = ["original" => $origName, "skipped" => true, "reason" => "move_failed"];
      continue;
    }

    $attachmentsMeta[] = ["original" => $origName, "stored" => $storedName, "mime" => $mime, "size" => $size];
    $storedFiles[] = ["path" => $storedPath, "name" => $safe];
  }
}

// -----------------------------
// Build "Intake Form design" email (HTML)
// -----------------------------
$sentAt = date("Y-m-d H:i:s");

// Friendly checkbox summaries
$indigenous = trim((!empty($fields["aboriginal"]) ? "Aboriginal, " : "") . (!empty($fields["tsi"]) ? "Torres Strait Islander, " : ""), ", ");
$indigenous = $indigenous !== "" ? $indigenous : "—";

$prefContact = trim(
  (!empty($fields["prefMobile"]) ? "Mobile, " : "") .
  (!empty($fields["prefLandline"]) ? "Landline, " : "") .
  (!empty($fields["prefEmail"]) ? "Email, " : "") .
  (!empty($fields["prefMail"]) ? "Mail, " : "")
, ", ");
$prefContact = $prefContact !== "" ? $prefContact : "—";

$riskProfile = joinChecks($fields, [
  "riskFalls" => "Falls",
  "riskChoking" => "Choking",
  "riskSeizures" => "Seizures (triggers)",
  "riskPressure" => "Pressure injuries",
  "riskSelfHarm" => "Self-harm (triggers)",
  "riskInjuries" => "Injuries",
  "riskOther" => "Other",
]);

$fears = joinChecks($fields, [
  "fearTouch" => "Touch",
  "fearLoud" => "Loud noises",
  "fearAnxiety" => "Anxiety (triggers)",
  "fearOther" => "Other",
]);

$supportsRequested = joinChecks($fields, [
  "supportInHomeCare" => "In home care",
  "supportCommunity" => "Community participation",
  "supportSkill" => "Skill building",
  "supportCoordination" => "Support coordination",
]);

$docsTicked = joinChecks($fields, [
  "docNdiaPlan" => "Approved NDIA plan",
  "docGpLetter" => "GP letter (medical history)",
  "docConsentNdiaShare" => "Consent for NDIA to share information",
  "docDischarge" => "Discharge letter (last 12 months)",
  "docBehaviourPlans" => "Behaviour plans/assessments",
  "docSafetyPlan" => "Safety plan",
  "docOtAssessment" => "OT/Specialist assessment",
  "docMhRisk" => "Mental health review risk assessment",
  "docOther" => "Other relevant documents",
]);

$sections = [
  "Client Personal Details" => [
    ["Legal name", pick($fields, "legalName"), "Preferred name", pick($fields, "preferredName")],
    ["Gender", pick($fields, "gender"), "Date of birth", pick($fields, "dob")],
    ["Country of birth", pick($fields, "countryOfBirth"), "Indigenous status", $indigenous],
    ["Mobile", pick($fields, "mobile"), "Landline", pick($fields, "landline")],
    ["Email", pick($fields, "email"), "Address", pick($fields, "address")],
    ["Suburb", pick($fields, "suburb"), "Postcode", pick($fields, "postcode")],
    ["Preferred contact method", $prefContact, "", ""],
    ["Beliefs / values", nl2br(h(pick($fields, "beliefsValues"))), "", ""],
    ["Support worker preferences", nl2br(h(pick($fields, "supportWorkerPrefs"))), "", ""],
    ["Emergency contact name", pick($fields, "emergencyName"), "Relationship", pick($fields, "emergencyRelationship")],
    ["Emergency mobile", pick($fields, "emergencyMobile"), "Emergency home", pick($fields, "emergencyHome")],
    ["Guardianship / trustee / financial orders in place?", pickYesNo($fields, "guardianshipOrders"), "", ""],
    ["Guardianship details", nl2br(h(pick($fields, "guardianshipDetails"))), "", ""],
    ["Current living accommodation", nl2br(h(pick($fields, "accommodation"))), "", ""],
  ],

  "Disability / Health Details" => [
    ["Primary disability", pick($fields, "primaryDisability"), "Other disability", pick($fields, "otherDisability")],
    ["Clinical diagnosis (mental health)", pick($fields, "clinicalDiagnosis"), "", ""],
  ],

  "Risks" => [
    ["Allergies?", pickYesNo($fields, "allergy"), "Allergy details", nl2br(h(pick($fields, "allergyDetails")))],
    ["Behaviour of concern?", pickYesNo($fields, "behaviourConcern"), "Behaviour details", nl2br(h(pick($fields, "behaviourDetails")))],
    ["Risk profile", $riskProfile, "Notes / triggers / strategies", nl2br(h(pick($fields, "riskNotes")))],
    ["Fears", $fears, "Triggers / strategies", nl2br(h(pick($fields, "fearNotes")))],
  ],

  "Support Needs" => [
    ["Supports requested", $supportsRequested, "Level of support", pick($fields, "supportLevel")],
    ["Supports description", nl2br(h(pick($fields, "supportsDescription"))), "", ""],
    ["Days / hours required", nl2br(h(pick($fields, "daysHours"))), "", ""],
  ],

  "NDIA Plan Details" => [
    ["NDIS participant reference number", pick($fields, "ndisRef"), "Plan management type", pick($fields, "planType")],
    ["Plan nominee/manager name", pick($fields, "planName"), "Organisation", pick($fields, "planOrg")],
    ["Email", pick($fields, "planEmail"), "Phone", pick($fields, "planPhone")],
    ["Plan start date", pick($fields, "planStart"), "Plan end date", pick($fields, "planEnd")],
    ["Review date", pick($fields, "reviewDate"), "", ""],
  ],

  "Referrer Details (if applicable)" => [
    ["Referrer name", pick($fields, "referrerName"), "Relationship to participant", pick($fields, "referrerRelationship")],
    ["Position", pick($fields, "referrerPosition"), "Organisation", pick($fields, "referrerOrg")],
    ["Email", pick($fields, "referrerEmail"), "Contact number", pick($fields, "referrerContact")],
    ["Address", pick($fields, "referrerAddress"), "", ""],
    ["Signature (typed)", pick($fields, "referrerSignature"), "Date", pick($fields, "referrerDate")],
    ["Consent from participant to make referral?", pickYesNo($fields, "refConsent"), "", ""],
    ["Documents ticked", $docsTicked, "", ""],
  ],

  "Consent for Release of Information" => [
    ["Participant name", pick($fields, "participantName"), "Signature (typed)", pick($fields, "participantSignature")],
    ["Date", pick($fields, "participantDate"), "", ""],
    ["Witness name", pick($fields, "witnessName"), "Relationship", pick($fields, "witnessRelationship")],
    ["Witness signature (typed)", pick($fields, "witnessSignature"), "Witness date", pick($fields, "witnessDate")],
  ],

  "Verbal Consent (staff use only)" => [
    ["Referrer name", pick($fields, "verbalRefName"), "Organisation", pick($fields, "verbalOrg")],
    ["Position", pick($fields, "verbalPos"), "Contact number", pick($fields, "verbalContact")],
    ["Signature (typed)", pick($fields, "verbalSig"), "Date", pick($fields, "verbalDate")],
  ],

  "If No Consent Available (staff use only)" => [
    ["Referrer name", pick($fields, "noConsentRefName"), "Organisation", pick($fields, "noConsentOrg")],
    ["Position", pick($fields, "noConsentPos"), "Contact number", pick($fields, "noConsentContact")],
    ["Signature (typed)", pick($fields, "noConsentSig"), "Date", pick($fields, "noConsentDate")],
  ],
];

// Email-safe table styling
$styles = '
  body{margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;}
  .wrap{max-width:820px;margin:0 auto;padding:18px;}
  .card{background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.06);}
  .head{padding:16px 18px;border-bottom:1px solid #e5e7eb;}
  .kicker{font-size:12px;letter-spacing:.08em;color:#6b7280;font-weight:700;}
  .title{margin:6px 0 0;font-size:20px;}
  .meta{margin-top:6px;font-size:12px;color:#6b7280;}
  .sec{padding:14px 18px;border-top:1px solid #eef2f7;}
  .sec h3{margin:0 0 10px;font-size:14px;color:#0f766e;}
  table{width:100%;border-collapse:separate;border-spacing:0;}
  td{vertical-align:top;padding:8px 10px;border-top:1px solid #f1f5f9;}
  tr:first-child td{border-top:none;}
  .lbl{font-size:12px;color:#6b7280;font-weight:700;margin-bottom:4px;}
  .val{font-size:13px;color:#111827;white-space:normal;word-break:break-word;}
  .half{width:50%;}
  .foot{padding:14px 18px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;}
';

$html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' .
  "<style>$styles</style></head><body><div class=\"wrap\"><div class=\"card\">" .
  '<div class="head">' .
  '<div class="kicker">Together We Thrive Support Co</div>' .
  '<div class="title"><strong>Client Intake Form</strong></div>' .
  '<div class="meta">New submission received • Sent: ' . h($sentAt) . '</div>' .
  '</div>';

foreach ($sections as $secTitle => $rows) {
  $html .= '<div class="sec"><h3>' . h($secTitle) . '</h3><table>';
  foreach ($rows as $r) {
    [$l1, $v1, $l2, $v2] = $r + ["", "", "", ""];

    $v1s = is_string($v1) ? $v1 : h((string)$v1);
    $v2s = is_string($v2) ? $v2 : h((string)$v2);

    if (trim((string)$l2) === "" && trim(strip_tags((string)$v2)) === "") {
      $html .= '<tr><td colspan="2">' .
        '<div class="lbl">' . h($l1) . '</div>' .
        '<div class="val">' . $v1s . '</div>' .
        '</td></tr>';
    } else {
      $html .= '<tr>' .
        '<td class="half"><div class="lbl">' . h($l1) . '</div><div class="val">' . $v1s . '</div></td>' .
        '<td class="half"><div class="lbl">' . h($l2) . '</div><div class="val">' . $v2s . '</div></td>' .
        '</tr>';
    }
  }
  $html .= '</table></div>';
}

$attachSummary = "—";
if (!empty($attachmentsMeta)) {
  $lines = [];
  foreach ($attachmentsMeta as $a) {
    if (!empty($a["skipped"])) continue;
    $lines[] = (string)($a["original"] ?? $a["stored"] ?? "file");
  }
  $attachSummary = $lines ? implode(", ", $lines) : "—";
}

$html .= '<div class="sec"><h3>Attachments</h3><table><tr><td colspan="2">' .
  '<div class="lbl">Files attached</div><div class="val">' . h($attachSummary) . '</div>' .
  '</td></tr></table></div>';

$html .= '<div class="foot">This email was generated automatically from the Intake Form submission.</div></div></div></body></html>';

// Plain text fallback
$plain = "Client Intake Form Submission\nSent: $sentAt\n\n";
foreach ($sections as $secTitle => $rows) {
  $plain .= "== $secTitle ==\n";
  foreach ($rows as $r) {
    [$l1, $v1, $l2, $v2] = $r + ["", "", "", ""];
    $plain .= "- $l1: " . strip_tags((string)$v1) . "\n";
    if (trim((string)$l2) !== "") {
      $plain .= "  $l2: " . strip_tags((string)$v2) . "\n";
    }
  }
  $plain .= "\n";
}

// -----------------------------
// Log to DB (create row first)
// -----------------------------
$submissionId = null;
try {
  $pdo = pdo($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
  $stmt = $pdo->prepare("INSERT INTO intake_submissions
    (ip, user_agent, email, subject, fields_json, attachments_json, mail_ok, mail_error, turnstile_ok, csrf_ok)
    VALUES (:ip,:ua,:email,:subject,:fields,:atts,0,NULL,1,1)");
  $stmt->execute([
    ":ip" => $ip,
    ":ua" => $ua,
    ":email" => (string)($fields["email"] ?? ""),
    ":subject" => "New Intake Form Submission",
    ":fields" => json_encode($fields, JSON_UNESCAPED_UNICODE),
    ":atts" => json_encode($attachmentsMeta, JSON_UNESCAPED_UNICODE),
  ]);
  $submissionId = (int)$pdo->lastInsertId();
} catch (Throwable $e) {
  // continue even if DB fails
}

// -----------------------------
// Send email
// -----------------------------
$mail = new PHPMailer(true);

try {
  $mail->isSMTP();
  $mail->Host       = $SMTP_HOST;
  $mail->SMTPAuth   = true;
  $mail->Username   = $SMTP_USER;
  $mail->Password   = $SMTP_PASS;
  $mail->Port       = (int)$SMTP_PORT;

  if ((int)$SMTP_PORT === 465) {
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
  } else {
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  }

  $mail->setFrom($SMTP_USER, "TWT Intake Form");
  $mail->addAddress($MAIL_TO);

  $userEmail = (string)($fields["email"] ?? "");
  if ($userEmail !== "" && filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
    $mail->addReplyTo($userEmail);
  }

  $mail->isHTML(true);
  $mail->Subject = "New Intake Form Submission" . ($submissionId ? " (#{$submissionId})" : "");
  $mail->Body    = $html;
  $mail->AltBody = $plain;

  // Attach saved files
  foreach ($storedFiles as $f) {
    if (!empty($f["path"]) && is_file($f["path"])) {
      $mail->addAttachment($f["path"], (string)($f["name"] ?? basename($f["path"])));
    }
  }

  $mail->send();

  // update DB mail status
  if ($submissionId) {
    try {
      $pdo = pdo($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
      $u = $pdo->prepare("UPDATE intake_submissions SET mail_ok=1, mail_error=NULL WHERE id=:id");
      $u->execute([":id" => $submissionId]);
    } catch (Throwable $e) {}
  }

  respond(200, [
    "ok" => true,
    "message" => "Your form was submitted successfully. We will contact you soon.",
    "submission_id" => $submissionId,
    "attachments" => count($storedFiles),
  ]);
} catch (Exception $e) {
  $err = $mail->ErrorInfo ?: $e->getMessage();

  if ($submissionId) {
    try {
      $pdo = pdo($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
      $u = $pdo->prepare("UPDATE intake_submissions SET mail_ok=0, mail_error=:err WHERE id=:id");
      $u->execute([":err" => $err, ":id" => $submissionId]);
    } catch (Throwable $ex2) {}
  }

  respond(500, [
    "ok" => false,
    "error" => "Mailer error: " . $err,
    "submission_id" => $submissionId,
  ]);
}