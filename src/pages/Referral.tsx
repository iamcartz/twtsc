import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { useSeo } from "../hooks/useSeo";
import "../styles/Referral.css";

const EMAIL = "info@twt.net.au";
const PHONE = "0400 000 000"; // change later when ready

const REFERRAL_TYPES = [
  "Not sure",
  "Personal Care & Daily Living",
  "In-Home Support",
  "Social & Community Participation",
  "Transport Support",
  "Capacity Building & Life Skills",
  "Psychosocial Disability / Mental Wellbeing",
  "Support Coordination (when available)",
  "Day Programs (coming soon)"
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);

    setReduced(media.matches);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return reduced;
}

type Faq = { q: string; a: string };

export default function Referral() {
  useSeo({
    title: "Referral | Together We Thrive",
    description:
      "Send a referral to Together We Thrive Support Co. Simple, respectful NDIS disability support across South Western Sydney.",
  });

  const reducedMotion = usePrefersReducedMotion();

  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"" | "success">("");

  // ✅ absolute URL for QR code
  const referralUrl = useMemo(() => {
    // if running in browser
    if (typeof window !== "undefined") return `${window.location.origin}/referral`;
    return "/referral";
  }, []);

  // ✅ for downloading QR
  const qrWrapRef = useRef<HTMLDivElement | null>(null);

  function downloadQrPng() {
    const canvas = qrWrapRef.current?.querySelector("canvas");
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "together-we-thrive-referral-qr.png";
    a.click();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setStatus("");

    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot field (spam trap)
    const company = (data.get("company") || "").toString();
    if (company) return;

    const referrerName = (data.get("referrerName") || "").toString().trim();
    const referrerEmail = (data.get("referrerEmail") || "").toString().trim();
    const referrerPhone = (data.get("referrerPhone") || "").toString().trim();

    const participantName = (data.get("participantName") || "").toString().trim();
    const participantPhone = (data.get("participantPhone") || "").toString().trim();
    const participantEmail = (data.get("participantEmail") || "").toString().trim();

    const referralType = (data.get("referralType") || "Not sure").toString();
    const message = (data.get("message") || "").toString().trim();
    const consent = (data.get("consent") || "").toString();

    const newErrors: string[] = [];

    if (!referrerName) newErrors.push("Please enter your name (referrer).");
    if (!referrerEmail || !/^\S+@\S+\.\S+$/.test(referrerEmail))
      newErrors.push("Please enter a valid referrer email address.");

    if (!participantName) newErrors.push("Please enter the participant’s name.");
    if (!participantPhone && !participantEmail)
      newErrors.push("Please add at least one participant contact (phone or email).");

    if (!message) newErrors.push("Please add a short referral note.");
    if (!consent) newErrors.push("Please confirm consent to share information.");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // For now we only simulate sending (backend later)
    console.log({
      referrerName,
      referrerEmail,
      referrerPhone,
      participantName,
      participantPhone,
      participantEmail,
      referralType,
      message,
      consent: true,
    });

    setStatus("success");
    form.reset();
  }

  return (
    <main className="page" id="main">
      {/* HERO (uniform style) */}
      <div className={`hero ${reducedMotion ? "" : "hero-animate"}`}>
        <div className="hero-content">
          <div className="hero-brand" aria-label="Together We Thrive Support Co">
            <img
              className="hero-brand-logo"
              src="/logo.jpeg"
              alt="Together We Thrive Support Co logo"
            />
            <div className="hero-brand-text">
              <span className="hero-brand-title">Together We Thrive</span>
              <span className="hero-brand-subtitle">Support Co</span>
            </div>
          </div>

          <h1>Referral</h1>

          <p className="lead">
            A simple referral form for participants, families, support coordinators, and health professionals.
          </p>

          <div className="cta-row" aria-label="Referral actions">
            <a className="btn primary" href={`mailto:${EMAIL}`}>
              ✉️ Email referral
            </a>
            <a className="btn ghost" href={`tel:${PHONE.replace(/\s/g, "")}`}>
              📞 Call {PHONE}
            </a>
          </div>

          <p className="muted hero-helper">
            Keep it simple — we’ll respond with clear next steps.
          </p>

          <div className="pill-row" aria-label="Common referral reasons">
            <span className="pill">New supports</span>
            <span className="pill">Community access</span>
            <span className="pill">Psychosocial support</span>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/images/referral-hero.png"
            alt="A friendly support worker helping a participant"
            loading="eager"
          />
        </div>
      </div>

      {/* INTRO */}
      <header className="page-header" style={{ marginTop: "1.25rem" }}>
        <h2>Send a referral</h2>
        <p className="muted">
          Please share only what is needed. We will contact the participant (or their nominee) to confirm details.
        </p>
      </header>

      <div className="ref-grid">
        {/* LEFT: help + QR */}
        <section className="ref-card" aria-label="Referral help">
          <h3>What happens next?</h3>
          <ul className="list">
            <li>We review the referral</li>
            <li>We contact the participant (or nominee)</li>
            <li>We confirm goals, supports, and availability</li>
            <li>We explain the next steps in clear language</li>
          </ul>

          <div className="ref-note" style={{ marginTop: "1rem" }}>
            <strong>Privacy note:</strong> We treat all information as confidential and only use it to respond to this referral.
          </div>

          {/* ✅ QR CODE */}
          <div className="qr-block" aria-label="Referral QR code" style={{ marginTop: "1rem" }}>
            <h4 style={{ margin: "0 0 .35rem" }}>QR code</h4>
            <p className="muted" style={{ margin: "0 0 .75rem" }}>
              Scan to open the referral form on a phone or tablet.
            </p>

            <div className="qr-wrap" ref={qrWrapRef}>
              <QRCodeCanvas
                value={referralUrl}
                size={164}
                includeMargin
                level="M"
              />
            </div>

            <p className="muted" style={{ marginTop: ".6rem" }}>
              Link:{" "}
              <a href={referralUrl} className="text-link">
                {referralUrl}
              </a>
            </p>

            <div className="cta-row" style={{ marginTop: ".75rem" }}>
              <button type="button" className="btn ghost" onClick={downloadQrPng}>
                Download QR
              </button>
            </div>
          </div>

          <div className="cta-row" style={{ marginTop: "1rem" }}>
            <Link className="btn ghost" to="/services">
              View services
            </Link>
            <Link className="btn ghost" to="/contact">
              Contact us
            </Link>
          </div>
        </section>

        {/* RIGHT: form */}
        <section className="ref-card" aria-label="Referral form">
          <h3>Referral form</h3>

          <div className="form-status" aria-live="polite" aria-atomic="true" role="status">
            {errors.length > 0 && (
              <ul className="error-list">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}

            {status === "success" && (
              <p className="ref-success">
                Thank you! Your referral has been sent successfully.
              </p>
            )}
          </div>

          <form className="ref-form" onSubmit={handleSubmit} noValidate>
            {/* Honeypot */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              style={{ display: "none" }}
            />

            <fieldset className="ref-fieldset">
              <legend>Referrer details</legend>

              <label htmlFor="referrerName">
                Your name
                <input id="referrerName" name="referrerName" type="text" autoComplete="name" />
              </label>

              <label htmlFor="referrerEmail">
                Your email
                <input id="referrerEmail" name="referrerEmail" type="email" autoComplete="email" />
              </label>

              <label htmlFor="referrerPhone">
                Your phone (optional)
                <input id="referrerPhone" name="referrerPhone" type="tel" autoComplete="tel" />
              </label>
            </fieldset>

            <fieldset className="ref-fieldset">
              <legend>Participant details</legend>

              <label htmlFor="participantName">
                Participant name
                <input id="participantName" name="participantName" type="text" />
              </label>

              <div className="ref-two">
                <label htmlFor="participantPhone">
                  Participant phone (optional)
                  <input id="participantPhone" name="participantPhone" type="tel" />
                </label>

                <label htmlFor="participantEmail">
                  Participant email (optional)
                  <input id="participantEmail" name="participantEmail" type="email" />
                </label>
              </div>

              <label htmlFor="referralType">
                Support needed
                <select id="referralType" name="referralType" defaultValue="Not sure">
                  {REFERRAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="message">
                Referral notes (short and clear)
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Example: The participant would like support with routines, community access, and wellbeing support."
                />
              </label>

              <label className="ref-check">
                <input id="consent" name="consent" type="checkbox" value="yes" />
                <span>
                  I confirm the participant (or their nominee) has consented to share this information for the purpose of referral.
                </span>
              </label>
            </fieldset>

            <button className="btn primary" type="submit">
              Send referral
            </button>

            <p className="muted ref-helper">
              Prefer email? Send a referral to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
