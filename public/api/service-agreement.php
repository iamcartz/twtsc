<?php
declare(strict_types=1);

session_start();
header("Content-Type: application/json; charset=UTF-8");

function respond(int $code, array $payload): void {
  http_response_code($code);
  echo json_encode($payload);
  exit;
}

register_shutdown_function(function () {
  $err = error_get_last();
  if ($err && in_array($err["type"], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Fatal: ".$err["message"]]);
  }
});

function nowMs(): int { return (int) floor(microtime(true) * 1000); }
function h($v): string { return htmlspecialchars((string)$v, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8"); }
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

function pick(array $fields, string $key, string $fallback = "—"): string {
  $v = $fields[$key] ?? "";
  if (is_array($v)) $v = implode(", ", $v);
  $v = trim((string)$v);
  return $v !== "" ? $v : $fallback;
}

function joinChecks(array $fields, array $map): string {
  $out = [];
  foreach ($map as $k => $label) {
    if (!empty($fields[$k])) $out[] = $label;
  }
  return $out ? implode(", ", $out) : "—";
}

function rateLimitOrDie(string $ip): void {
  // Session: 3 / 10 minutes
  $windowMs = 10 * 60 * 1000;
  $maxSess = 3;

  $_SESSION["sa_rl"] = $_SESSION["sa_rl"] ?? [];
  $events = array_filter($_SESSION["sa_rl"], function($t) { return is_int($t) && (nowMs() - $t) < $windowMs; });

  if (count($events) >= $maxSess) {
    respond(429, ["ok" => false, "error" => "Too many submissions. Please try again in a few minutes."]);
  }
  $events[] = nowMs();
  $_SESSION["sa_rl"] = array_values($events);

  // IP: 10 / hour (file-based)
  $dir = __DIR__ . "/_ratelimit";
  if (!is_dir($dir)) @mkdir($dir, 0700, true);

  $key = preg_replace('/[^a-zA-Z0-9._-]/', '_', $ip);
  $path = $dir . "/sa_ip_" . $key . ".json";

  $data = ["ts" => []];
  if (is_file($path)) {
    $raw = @file_get_contents($path);
    $json = json_decode((string)$raw, true);
    if (is_array($json) && isset($json["ts"]) && is_array($json["ts"])) $data = $json;
  }

  $now = time();
  $data["ts"] = array_values(array_filter($data["ts"], function($t) use ($now) { return is_int($t) && ($now - $t) < 3600; }));

  if (count($data["ts"]) >= 10) {
    respond(429, ["ok" => false, "error" => "Too many submissions from your network. Please try again later."]);
  }

  $data["ts"][] = $now;
  @file_put_contents($path, json_encode($data), LOCK_EX);
}

// -------------------- CONFIG --------------------
$TURNSTILE_SECRET = "0x4AAAAAACZ-mfDplW990B-H8SN2K6OYLzw";

$SMTP_HOST = "twt.net.au";
$SMTP_USER = "no-reply@twt.net.au";
$SMTP_PASS = "4H!cz6NIkb?+}Sa~";
$SMTP_PORT = 465;
$MAIL_TO   = "info@twt.net.au";

// DB
$DB_HOST = "localhost";
$DB_NAME = "PUT_YOUR_DB_NAME_HERE";
$DB_USER = "PUT_YOUR_DB_USER_HERE";
$DB_PASS = "PUT_YOUR_DB_PASS_HERE";

// Upload storage
$UPLOAD_DIR = __DIR__ . "/_uploads_service_agreement";
if (!is_dir($UPLOAD_DIR)) { @mkdir($UPLOAD_DIR, 0700, true); }

// PDO
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

// -------------------- Request checks --------------------
if ($_SERVER["REQUEST_METHOD"] !== "POST") respond(405, ["ok" => false, "error" => "Method not allowed"]);

$ip = (string)($_SERVER["REMOTE_ADDR"] ?? "");
$ua = substr((string)($_SERVER["HTTP_USER_AGENT"] ?? ""), 0, 255);

rateLimitOrDie($ip);

// CSRF
$postedCsrf = (string)($_POST["csrf"] ?? "");
$sessCsrf   = (string)($_SESSION["csrf"] ?? "");
if (!$postedCsrf || !$sessCsrf || !hash_equals($sessCsrf, $postedCsrf)) {
  respond(403, ["ok" => false, "error" => "Invalid security token. Please refresh and try again."]);
}

// Turnstile
$token = (string)($_POST["cf_turnstile_response"] ?? "");
if ($token === "") respond(400, ["ok" => false, "error" => "Missing Turnstile token."]);
if (!function_exists("curl_init")) respond(500, ["ok" => false, "error" => "Server missing cURL extension."]);

$verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
$postData = http_build_query(["secret" => $TURNSTILE_SECRET, "response" => $token, "remoteip" => $ip]);

$ch = curl_init($verifyUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$verifyResponse = curl_exec($ch);
$curlErr = curl_error($ch);
curl_close($ch);

if ($verifyResponse === false) respond(500, ["ok" => false, "error" => "Turnstile verification failed.", "detail" => $curlErr]);

$verifyJson = json_decode((string)$verifyResponse, true);
if (!is_array($verifyJson) || empty($verifyJson["success"])) {
  respond(403, ["ok" => false, "error" => "Turnstile rejected.", "codes" => $verifyJson["error-codes"] ?? []]);
}

// -------------------- PHPMailer load --------------------
$ex = __DIR__ . "/../PHPMailer/src/Exception.php";
$ph = __DIR__ . "/../PHPMailer/src/PHPMailer.php";
$sm = __DIR__ . "/../PHPMailer/src/SMTP.php";

if (!file_exists($ex) || !file_exists($ph) || !file_exists($sm)) {
  respond(500, ["ok" => false, "error" => "PHPMailer files not found. Check folder path."]);
}

require $ex; require $ph; require $sm;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// -------------------- Fields --------------------
$fields = $_POST;
unset($fields["csrf"], $fields["cf_turnstile_response"]);

// Friendly summaries
$contactPrefs = joinChecks($fields, [
  "contactPhone" => "Phone",
  "contactEmail" => "Email",
  "contactPost" => "Letter via post",
  "contactFace" => "Face to face",
  "contactEasyRead" => "Easy Read preferred",
]);

$supportsCore = joinChecks($fields, [
  "coreDailyLiving" => "Assistance with Daily Living",
  "coreCommunityAccess" => "Community Access / Social Participation",
  "coreHouseholdTasks" => "Household Tasks",
  "coreMealPrep" => "Meal Preparation",
  "coreTransport" => "Transport Assistance",
  "corePersonalCare" => "Personal Care",
  "coreSIL" => "Supported Independent Living (SIL)",
]);

$supportsCapacity = joinChecks($fields, [
  "capLifeSkills" => "Life Skills Development",
  "capImprovedDailyLiving" => "Improved Daily Living",
  "capTrainingCarers" => "Training for Carers",
  "capSupportCoordination" => "Support Coordination",
]);

// -------------------- Attachments (hardened) --------------------
$maxFiles = 10;
$maxEachBytes = 10 * 1024 * 1024;
$maxTotalBytes = 25 * 1024 * 1024;
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
$storedFiles = [];

if (!empty($_FILES["uploads"]) && isset($_FILES["uploads"]["name"]) && is_array($_FILES["uploads"]["name"])) {
  $count = min(count($_FILES["uploads"]["name"]), $maxFiles);

  for ($i = 0; $i < $count; $i++) {
    $orig = (string)($_FILES["uploads"]["name"][$i] ?? "");
    $tmp  = (string)($_FILES["uploads"]["tmp_name"][$i] ?? "");
    $err  = (int)($_FILES["uploads"]["error"][$i] ?? UPLOAD_ERR_NO_FILE);
    $size = (int)($_FILES["uploads"]["size"][$i] ?? 0);

    if ($err === UPLOAD_ERR_NO_FILE) continue;
    if ($err !== UPLOAD_ERR_OK) { $attachmentsMeta[] = ["original"=>$orig,"skipped"=>true,"reason"=>"upload_error_$err"]; continue; }
    if (!$tmp || !is_uploaded_file($tmp)) { $attachmentsMeta[] = ["original"=>$orig,"skipped"=>true,"reason"=>"not_uploaded_file"]; continue; }
    if ($size <= 0 || $size > $maxEachBytes) { $attachmentsMeta[] = ["original"=>$orig,"skipped"=>true,"reason"=>"size_invalid","size"=>$size]; continue; }

    $totalBytes += $size;
    if ($totalBytes > $maxTotalBytes) { $attachmentsMeta[] = ["original"=>$orig,"skipped"=>true,"reason"=>"total_size_exceeded"]; break; }

    $mime = detectMime($tmp);
    if (!in_array($mime, $allowedMimes, true)) { $attachmentsMeta[] = ["original"=>$orig,"skipped"=>true,"reason"=>"mime_not_allowed","mime"=>$mime]; continue; }

    $safe = safeFilename($orig);
    $storedName = date("Ymd_His") . "_" . bin2hex(random_bytes(4)) . "_" . $safe;
    $storedPath = rtrim($UPLOAD_DIR, "/") . "/" . $storedName;

    if (!@move_uploaded_file($tmp, $storedPath)) { $attachmentsMeta[] = ["original"=>$orig,"skipped"=>true,"reason"=>"move_failed"]; continue; }

    $attachmentsMeta[] = ["original"=>$orig,"stored"=>$storedName,"mime"=>$mime,"size"=>$size];
    $storedFiles[] = ["path"=>$storedPath,"name"=>$safe];
  }
}

// -------------------- Build HTML email (like your form) --------------------
$sentAt = date("Y-m-d H:i:s");
$styles = '
  body{margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;}
  .wrap{max-width:820px;margin:0 auto;padding:18px;}
  .card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.06);}
  .head{padding:16px 18px;border-bottom:1px solid #e5e7eb;display:flex;gap:12px;align-items:center;}
  .logo{height:46px;width:auto;border-radius:10px;border:1px solid #e5e7eb;}
  .kicker{font-size:12px;letter-spacing:.08em;color:#6b7280;font-weight:700;}
  .title{margin:6px 0 0;font-size:18px;}
  .meta{margin-top:4px;font-size:12px;color:#6b7280;}
  .sec{padding:14px 18px;border-top:1px solid #eef2f7;}
  .sec h3{margin:0 0 10px;font-size:14px;color:#0f766e;}
  table{width:100%;border-collapse:separate;border-spacing:0;}
  td{vertical-align:top;padding:8px 10px;border-top:1px solid #f1f5f9;}
  tr:first-child td{border-top:none;}
  .lbl{font-size:12px;color:#6b7280;font-weight:700;margin-bottom:4px;}
  .val{font-size:13px;color:#111827;word-break:break-word;}
  .half{width:50%;}
  .foot{padding:14px 18px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;}
';

$logo = "https://www.twt.net.au/logo.jpeg";
$rows = [
  "Participant Details" => [
    ["Participant name", pick($fields,"participantName"), "NDIS number", pick($fields,"ndisNumber")],
    ["Date of birth", pick($fields,"dob"), "Phone", pick($fields,"phone")],
    ["Email", pick($fields,"email"), "Address", pick($fields,"address")],
    ["Funding type", pick($fields,"fundingType"), "Preferred contact", $contactPrefs],
  ],
  "Representative (if applicable)" => [
    ["Has representative?", pick($fields,"hasRepresentative"), "Representative name", pick($fields,"repName")],
    ["Relationship", pick($fields,"repRelationship"), "Representative phone", pick($fields,"repPhone")],
    ["Representative email", pick($fields,"repEmail"), "", ""],
  ],
  "Agreement Period" => [
    ["Start date", pick($fields,"agreementStart"), "End date", pick($fields,"agreementEnd")],
  ],
  "Supports Required" => [
    ["Core supports", $supportsCore, "Capacity building", $supportsCapacity],
    ["Other supports", nl2br(h(pick($fields,"otherSupports"))), "", ""],
  ],
  "Payment Management" => [
    ["Plan manager/company", pick($fields,"pmCompany"), "Contact person", pick($fields,"pmContact")],
    ["Invoice email", pick($fields,"pmInvoiceEmail"), "Contact details", pick($fields,"pmContactDetails")],
  ],
  "Privacy & Safety" => [
    ["Emergency changes agreed", !empty($fields["agreeEmergencyChanges"]) ? "Yes" : "No", "", ""],
    ["Privacy notes", nl2br(h(pick($fields,"privacyNoShareWith"))), "", ""],
  ],
  "Signatures" => [
    ["Name", pick($fields,"sigParticipantName"), "Relationship", pick($fields,"sigRelationship")],
    ["Signature (typed)", pick($fields,"sigParticipant"), "Date", pick($fields,"sigDate")],
  ],
];

$html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />'.
  "<style>$styles</style></head><body><div class=\"wrap\"><div class=\"card\">".
  '<div class="head">'.
  '<img class="logo" src="'.h($logo).'" alt="Together We Thrive Support Co" />'.
  '<div>'.
  '<div class="kicker">Together We Thrive Support Co</div>'.
  '<div class="title"><strong>Service Agreement Submission</strong></div>'.
  '<div class="meta">Sent: '.h($sentAt).'</div>'.
  '</div></div>';

foreach ($rows as $secTitle => $secRows) {
  $html .= '<div class="sec"><h3>'.h($secTitle).'</h3><table>';
  foreach ($secRows as $r) {
    [$l1,$v1,$l2,$v2] = $r + ["","","",""];
    $v1s = is_string($v1) ? $v1 : h((string)$v1);
    $v2s = is_string($v2) ? $v2 : h((string)$v2);

    if (trim((string)$l2)==="" && trim(strip_tags((string)$v2))==="") {
      $html .= '<tr><td colspan="2"><div class="lbl">'.h($l1).'</div><div class="val">'.$v1s.'</div></td></tr>';
    } else {
      $html .= '<tr>'.
        '<td class="half"><div class="lbl">'.h($l1).'</div><div class="val">'.$v1s.'</div></td>'.
        '<td class="half"><div class="lbl">'.h($l2).'</div><div class="val">'.$v2s.'</div></td>'.
      '</tr>';
    }
  }
  $html .= '</table></div>';
}

$attachNames = [];
foreach ($attachmentsMeta as $a) {
  if (!empty($a["skipped"])) continue;
  $attachNames[] = (string)($a["original"] ?? $a["stored"] ?? "file");
}
$attachSummary = $attachNames ? implode(", ", $attachNames) : "—";

$html .= '<div class="sec"><h3>Attachments</h3><table><tr><td colspan="2">'.
  '<div class="lbl">Files attached</div><div class="val">'.h($attachSummary).'</div>'.
  '</td></tr></table></div>';

$html .= '<div class="foot">This message was generated automatically from the Service Agreement web form.</div>'.
  '</div></div></body></html>';

$plain = "Service Agreement Submission\nSent: $sentAt\n\n".
  "Participant: ".pick($fields,"participantName")."\n".
  "Email: ".pick($fields,"email")."\n".
  "Funding type: ".pick($fields,"fundingType")."\n";

// -------------------- Log to DB --------------------
$submissionId = null;
try {
  $pdo = pdo($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
  $stmt = $pdo->prepare("INSERT INTO service_agreement_submissions
    (ip, user_agent, email, fields_json, attachments_json, mail_ok, mail_error)
    VALUES (:ip,:ua,:email,:fields,:atts,0,NULL)");
  $stmt->execute([
    ":ip" => $ip,
    ":ua" => $ua,
    ":email" => (string)($fields["email"] ?? ""),
    ":fields" => json_encode($fields, JSON_UNESCAPED_UNICODE),
    ":atts" => json_encode($attachmentsMeta, JSON_UNESCAPED_UNICODE),
  ]);
  $submissionId = (int)$pdo->lastInsertId();
} catch (Throwable $e) {
  // DB optional; continue
}

// -------------------- Send email --------------------
$mail = new PHPMailer(true);

try {
  $mail->isSMTP();
  $mail->Host       = $SMTP_HOST;
  $mail->SMTPAuth   = true;
  $mail->Username   = $SMTP_USER;
  $mail->Password   = $SMTP_PASS;
  $mail->Port       = (int)$SMTP_PORT;
  $mail->SMTPSecure = ((int)$SMTP_PORT === 465)
    ? PHPMailer::ENCRYPTION_SMTPS
    : PHPMailer::ENCRYPTION_STARTTLS;

  $mail->setFrom($SMTP_USER, "TWT Service Agreement");
  $mail->addAddress($MAIL_TO);

  $userEmail = (string)($fields["email"] ?? "");
  if ($userEmail !== "" && filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
    $mail->addReplyTo($userEmail);
  }

  $mail->isHTML(true);
  $mail->Subject = "New Service Agreement Submission" . ($submissionId ? " (#{$submissionId})" : "");
  $mail->Body    = $html;
  $mail->AltBody = $plain;

  foreach ($storedFiles as $f) {
    if (!empty($f["path"]) && is_file($f["path"])) {
      $mail->addAttachment($f["path"], (string)($f["name"] ?? basename($f["path"])));
    }
  }

  $mail->send();

  if ($submissionId) {
    try {
      $pdo = pdo($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
      $u = $pdo->prepare("UPDATE service_agreement_submissions SET mail_ok=1, mail_error=NULL WHERE id=:id");
      $u->execute([":id"=>$submissionId]);
    } catch (Throwable $e) {}
  }

  respond(200, [
    "ok" => true,
    "message" => "Service Agreement submitted successfully. We will contact you soon.",
    "submission_id" => $submissionId,
    "attachments" => count($storedFiles),
  ]);
} catch (Exception $e) {
  $err = $mail->ErrorInfo ?: $e->getMessage();

  if ($submissionId) {
    try {
      $pdo = pdo($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
      $u = $pdo->prepare("UPDATE service_agreement_submissions SET mail_ok=0, mail_error=:err WHERE id=:id");
      $u->execute([":err"=>$err, ":id"=>$submissionId]);
    } catch (Throwable $ex2) {}
  }

  respond(500, [
    "ok" => false,
    "error" => "Mailer error: " . $err,
    "submission_id" => $submissionId,
  ]);
}