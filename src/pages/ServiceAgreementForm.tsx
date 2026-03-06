import { useEffect, useMemo, useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import "../styles/intakeform.css";

// ✅ Cloudflare Turnstile SITE KEY
const TURNSTILE_SITE_KEY = "0x4AAAAAACZ-mU6ox2cWGFfP";

// ✅ Update if your PHP path differs
const ENDPOINT = "/api/service-agreement.php";

type Status =
  | { type: "idle" }
  | { type: "sending" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export default function ServiceAgreementForm() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const logoUrl = origin ? `${origin}/logo.jpeg` : "/logo.jpeg";

  const formRef = useRef<HTMLFormElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [status, setStatus] = useState<Status>({ type: "idle" });

  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  // ✅ CSRF token from backend
  const [csrf, setCsrf] = useState("");
  useEffect(() => {
    fetch("/api/csrf.php", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((j) => setCsrf(j?.csrf || ""))
      .catch(() => setCsrf(""));
  }, []);

  // ✅ Modal (simple)
  const [modalOpen, setModalOpen] = useState(false);
  const modalTitle =
    status.type === "success"
      ? "Submitted"
      : status.type === "error"
      ? "Not submitted"
      : status.type === "sending"
      ? "Submitting…"
      : "";

  const endpoint = useMemo(() => ENDPOINT, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!formRef.current) return;

    if (!csrf) {
      setStatus({ type: "error", message: "Security token not loaded. Please refresh and try again." });
      setModalOpen(true);
      return;
    }

    if (!turnstileToken) {
      setStatus({ type: "error", message: "Please complete the anti-robot check." });
      setModalOpen(true);
      return;
    }

    setStatus({ type: "sending" });
    setModalOpen(true);

    try {
      const fd = new FormData(formRef.current);

      // CSRF + Turnstile
      fd.set("csrf", csrf);
      fd.set("cf_turnstile_response", turnstileToken);

      // Multi upload: uploads[]
      fd.delete("uploads");
      fd.delete("uploads[]");

      const files = fileRef.current?.files;
      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          fd.append("uploads[]", file, file.name);
        }
      }

      const res = await fetch(endpoint, { method: "POST", body: fd });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // non-json response
      }

      if (!res.ok || !data?.ok) {
        const message =
          data?.error ||
          `Submission failed. Server responded with ${res.status} ${res.statusText}`;
        setStatus({ type: "error", message });

        // Reset turnstile on error
        setTurnstileToken("");
        setTurnstileKey((k) => k + 1);
        return;
      }

      setStatus({
        type: "success",
        message: data?.message || "Submitted successfully!",
      });

      // reset form + turnstile
      formRef.current.reset();
      setTurnstileToken("");
      setTurnstileKey((k) => k + 1);
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err?.message || "Network error. Please try again.",
      });
      setTurnstileToken("");
      setTurnstileKey((k) => k + 1);
    }
  }

  return (
    <main className="intake-wrap">
      <form className="intake" ref={formRef} onSubmit={handleSubmit}>
        {/* Header */}
        <header className="intake-header intake-header-row">
          <div className="intake-logo-wrap">
            <img src={logoUrl} alt="Together We Thrive Support Co" className="intake-logo" />
          </div>

          <div className="intake-header-text">
            <div className="intake-kicker">NDIS</div>
            <h1>SERVICE AGREEMENT</h1>
            <div className="intake-docno">Participant Service Agreement</div>
          </div>
        </header>

        {/* Participant */}
        <section className="card">
          <h2 className="section-title">Participant Details</h2>

          <div className="grid two">
            <label className="field">
              <span className="label">Participant name:</span>
              <input className="input" name="participantName" type="text" required />
            </label>

            <label className="field">
              <span className="label">NDIS number:</span>
              <input className="input" name="ndisNumber" type="text" />
            </label>

            <label className="field">
              <span className="label">Date of birth:</span>
              <input className="input" name="dob" type="date" />
            </label>

            <label className="field">
              <span className="label">Phone:</span>
              <input className="input" name="phone" type="tel" />
            </label>

            <label className="field">
              <span className="label">Email:</span>
              <input className="input" name="email" type="email" />
            </label>

            <label className="field">
              <span className="label">Address:</span>
              <input className="input" name="address" type="text" />
            </label>
          </div>

          <div className="row">
            <div className="field">
              <span className="label">Funding type:</span>
              <div className="checks">
                <label className="check"><input type="radio" name="fundingType" value="self" /> I manage my plan</label>
                <label className="check"><input type="radio" name="fundingType" value="plan_manager" /> A plan manager helps me</label>
                <label className="check"><input type="radio" name="fundingType" value="ndia" /> NDIA manages my plan</label>
              </div>
            </div>
          </div>
        </section>

        {/* Representative */}
        <section className="card">
          <h2 className="section-title">Representative (if applicable)</h2>

          <div className="row">
            <div className="field">
              <span className="label">Do you have a representative?</span>
              <div className="checks">
                <label className="check"><input type="radio" name="hasRepresentative" value="yes" /> Yes</label>
                <label className="check"><input type="radio" name="hasRepresentative" value="no" /> No</label>
              </div>
            </div>
          </div>

          <div className="grid two">
            <label className="field">
              <span className="label">Representative name:</span>
              <input className="input" name="repName" type="text" />
            </label>

            <label className="field">
              <span className="label">Relationship to participant:</span>
              <input className="input" name="repRelationship" type="text" />
            </label>

            <label className="field">
              <span className="label">Representative phone:</span>
              <input className="input" name="repPhone" type="tel" />
            </label>

            <label className="field">
              <span className="label">Representative email:</span>
              <input className="input" name="repEmail" type="email" />
            </label>
          </div>
        </section>

        {/* Agreement purpose + contact prefs */}
        <section className="card">
          <h2 className="section-title">About This Agreement</h2>

          <p className="para">
            This agreement outlines the supports we will provide, when they will be delivered, how pricing works,
            and the rights and responsibilities of everyone involved. Supports are delivered in line with your NDIS plan,
            goals, and assessed needs.
          </p>

          <div className="row">
            <div className="field">
              <span className="label">Preferred contact method:</span>
              <div className="checks">
                <label className="check"><input type="checkbox" name="contactPhone" value="yes" /> Phone</label>
                <label className="check"><input type="checkbox" name="contactEmail" value="yes" /> Email</label>
                <label className="check"><input type="checkbox" name="contactPost" value="yes" /> Letter via post</label>
                <label className="check"><input type="checkbox" name="contactFace" value="yes" /> Face to face</label>
                <label className="check"><input type="checkbox" name="contactEasyRead" value="yes" /> Easy Read format preferred</label>
              </div>
            </div>
          </div>

          <div className="grid two">
            <label className="field">
              <span className="label">Agreement start date:</span>
              <input className="input" name="agreementStart" type="date" />
            </label>

            <label className="field">
              <span className="label">Agreement end date:</span>
              <input className="input" name="agreementEnd" type="date" />
            </label>
          </div>
        </section>

        {/* Supports */}
        <section className="card">
          <h2 className="section-title">Supports Required</h2>

          <div className="subcard">
            <h3 className="sub-title">Core Supports</h3>
            <div className="checks stack">
              <label className="check"><input type="checkbox" name="coreDailyLiving" value="yes" /> Assistance with Daily Living</label>
              <label className="check"><input type="checkbox" name="coreCommunityAccess" value="yes" /> Community Access / Social Participation</label>
              <label className="check"><input type="checkbox" name="coreHouseholdTasks" value="yes" /> Household Tasks</label>
              <label className="check"><input type="checkbox" name="coreMealPrep" value="yes" /> Meal Preparation</label>
              <label className="check"><input type="checkbox" name="coreTransport" value="yes" /> Transport Assistance</label>
              <label className="check"><input type="checkbox" name="corePersonalCare" value="yes" /> Personal Care</label>
              <label className="check"><input type="checkbox" name="coreSIL" value="yes" /> Supported Independent Living (SIL)</label>
            </div>
          </div>

          <div className="subcard">
            <h3 className="sub-title">Capacity Building Supports</h3>
            <div className="checks stack">
              <label className="check"><input type="checkbox" name="capLifeSkills" value="yes" /> Life Skills Development</label>
              <label className="check"><input type="checkbox" name="capImprovedDailyLiving" value="yes" /> Improved Daily Living</label>
              <label className="check"><input type="checkbox" name="capTrainingCarers" value="yes" /> Training for Carers</label>
              <label className="check"><input type="checkbox" name="capSupportCoordination" value="yes" /> Support Coordination</label>
            </div>
          </div>

          <label className="field">
            <span className="label">Other supports (describe):</span>
            <textarea className="textarea" name="otherSupports" rows={4} />
          </label>
        </section>

        {/* Schedule */}
        <section className="card">
          <h2 className="section-title">When Supports Will Happen</h2>
          <p className="hint">Select “As requested” or provide times if scheduled.</p>

          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
            "Public Holidays",
          ].map((day) => {
            const key = day.toLowerCase().replace(/\s+/g, "");
            return (
              <div className="subcard" key={day} style={{ marginTop: 12 }}>
                <h3 className="sub-title">{day}</h3>
                <div className="grid two">
                  <label className="field">
                    <span className="label">Frequency:</span>
                    <select className="input" name={`schedule_${key}_frequency`} defaultValue="as_requested">
                      <option value="as_requested">As requested</option>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </label>

                  <label className="field">
                    <span className="label">Supports required?</span>
                    <select className="input" name={`schedule_${key}_required`} defaultValue="as_requested">
                      <option value="as_requested">As requested</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>

                  <label className="field">
                    <span className="label">Start time:</span>
                    <input className="input" name={`schedule_${key}_start`} type="time" />
                  </label>

                  <label className="field">
                    <span className="label">End time:</span>
                    <input className="input" name={`schedule_${key}_end`} type="time" />
                  </label>
                </div>
              </div>
            );
          })}
        </section>

        {/* Payment details */}
        <section className="card">
          <h2 className="section-title">Payment Management Details</h2>

          <div className="grid two">
            <label className="field">
              <span className="label">Plan manager / company name:</span>
              <input className="input" name="pmCompany" type="text" />
            </label>

            <label className="field">
              <span className="label">Contact person:</span>
              <input className="input" name="pmContact" type="text" />
            </label>

            <label className="field">
              <span className="label">Invoice email address:</span>
              <input className="input" name="pmInvoiceEmail" type="email" />
            </label>

            <label className="field">
              <span className="label">Contact details:</span>
              <input className="input" name="pmContactDetails" type="text" />
            </label>
          </div>
        </section>

        {/* Responsibilities + consents */}
        <section className="card">
          <h2 className="section-title">Privacy, Safety & Agreement</h2>

          <div className="row">
            <div className="field">
              <span className="label">Emergency / disaster changes:</span>
              <div className="checks">
                <label className="check">
                  <input type="checkbox" name="agreeEmergencyChanges" value="yes" /> I understand supports may change in emergencies to keep me safe
                </label>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="field">
              <span className="label">Privacy consent:</span>
              <div className="checks stack">
                <label className="check"><input type="checkbox" name="privacyShareConsent" value="yes" /> I give permission to share/exchange information as outlined</label>
                <label className="check"><input type="checkbox" name="privacyContactBeforeShare" value="yes" /> Please contact me before sharing information</label>
                <label className="check"><input type="checkbox" name="privacyNoShare" value="yes" /> I do not give permission to share information</label>
                <label className="check"><input type="checkbox" name="privacyWithdrawAnytime" value="yes" /> I understand I can withdraw consent at any time</label>
              </div>
            </div>
          </div>

          <label className="field">
            <span className="label">Anyone you do NOT give permission to share information with (optional):</span>
            <textarea className="textarea" name="privacyNoShareWith" rows={3} />
          </label>
        </section>

        {/* Attachments */}
        <section className="card">
          <h2 className="section-title">Attachments</h2>
          <p className="hint">Upload any supporting documents (e.g., plan, approvals, supporting notes).</p>

          <label className="field">
            <span className="label">Upload files:</span>
            <input ref={fileRef} className="input" type="file" name="uploads" multiple />
            <span className="hint">You can select multiple files.</span>
          </label>
        </section>

        {/* Signatures */}
        <section className="card">
          <h2 className="section-title">Signatures</h2>

          <div className="grid two">
            <label className="field">
              <span className="label">Participant / Representative name:</span>
              <input className="input" name="sigParticipantName" type="text" />
            </label>

            <label className="field">
              <span className="label">Relationship (if representative):</span>
              <input className="input" name="sigRelationship" type="text" />
            </label>

            <label className="field">
              <span className="label">Signature (type full name):</span>
              <input className="input" name="sigParticipant" type="text" placeholder="Type full name" />
            </label>

            <label className="field">
              <span className="label">Date:</span>
              <input className="input" name="sigDate" type="date" />
            </label>
          </div>

          <p className="hint">
            By submitting, you confirm the details provided are accurate and you agree to proceed with the service agreement.
          </p>
        </section>

        {/* Footer */}
        <footer className="intake-footer">
          <div className="fineprint">Version 1.0 – Service Agreement (Web Form)</div>

          <div style={{ marginTop: 12 }}>
            <Turnstile
              key={turnstileKey}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken("")}
              onError={() => setTurnstileToken("")}
              options={{ theme: "light" }}
            />
          </div>

          <div className="actions">
            <button
              className="btn primary"
              type="submit"
              disabled={status.type === "sending" || !csrf || !turnstileToken}
              title={
                !csrf ? "Loading security token…" : !turnstileToken ? "Please complete the anti-robot check" : undefined
              }
            >
              {status.type === "sending" ? "Submitting..." : "Submit"}
            </button>
          </div>
        </footer>
      </form>

      {/* Modal */}
      {modalOpen && status.type !== "idle" && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            zIndex: 9999,
          }}
          onClick={() => status.type !== "sending" && setModalOpen(false)}
        >
          <div
            style={{
              width: "min(560px, 100%)",
              background: "#fff",
              borderRadius: 16,
              padding: 18,
              boxShadow: "0 20px 60px rgba(0,0,0,.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <h3 style={{ margin: 0 }}>{modalTitle}</h3>
              <button
                type="button"
                className="btn"
                onClick={() => status.type !== "sending" && setModalOpen(false)}
                disabled={status.type === "sending"}
              >
                Close
              </button>
            </div>

            <div style={{ marginTop: 10 }}>
              {status.type === "sending" && <p style={{ margin: 0 }}>Please wait…</p>}
              {status.type === "success" && <p style={{ margin: 0 }}>{status.message}</p>}
              {status.type === "error" && <p style={{ margin: 0 }}>{status.message}</p>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}