import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import "../styles/Contact.css";
import { Turnstile } from "@marsidev/react-turnstile";

const EMAIL = "info@twt.net.au";
const PHONE = "+61 433 883 614";

const SERVICES = [
  "Not sure",
  "Personal Care & Daily Living",
  "In-Home Support",
  "Social & Community Participation",
  "Transport Support",
  "Capacity Building & Life Skills",
  "Support Coordination",
  "Day Programs (coming soon)",
];

type LocationKey = "horsley" | "fivedock";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);
    setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export default function Contact() {
  useSeo({
    title: "Contact | Together We Thrive",
    description:
      "Contact Together We Thrive Support Co for NDIS disability support in South Western Sydney.",
  });

  const reducedMotion = usePrefersReducedMotion();

  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"" | "success">("");
  const [submitting, setSubmitting] = useState(false);

  const [activeMap, setActiveMap] = useState<LocationKey>("horsley");

  /* 🔐 SAME AS REFERRAL: CSRF */
  const [csrf, setCsrf] = useState("");
  useEffect(() => {
    fetch("/api/csrf.php")
      .then((r) => r.json())
      .then((j) => setCsrf(j?.csrf || ""));
  }, []);

  /* 🛡️ SAME AS REFERRAL: Turnstile */
  const [turnstileToken, setTurnstileToken] = useState("");

  /* animation / scroll target */
  const statusRef = useRef<HTMLDivElement | null>(null);
  const [tick, setTick] = useState(0);

  function revealStatus() {
    setTick((t) => t + 1);
    requestAnimationFrame(() => {
      statusRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setStatus("");

    const form = e.currentTarget;
    const data = new FormData(form);

    /* honeypot */
    if (data.get("company")) return;

    if (!csrf) {
      setErrors(["Security token not ready. Please refresh the page."]);
      revealStatus();
      return;
    }

    if (!turnstileToken) {
      setErrors(["Please complete the security check."]);
      revealStatus();
      return;
    }

    const payload = {
      name: (data.get("name") || "").toString().trim(),
      email: (data.get("email") || "").toString().trim(),
      service: (data.get("service") || "Not sure").toString(),
      message: (data.get("message") || "").toString().trim(),

      /* SAME SECURITY FIELDS */
      csrf,
      turnstileToken,
      company: "",
    };

    setSubmitting(true);

    try {
      const res = await fetch("/api/contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const out = await res.json();

      if (!res.ok) {
        setErrors(out?.errors || ["Something went wrong."]);
        revealStatus();
        return;
      }

      setStatus("success");
      setErrors([]);
      setTurnstileToken("");
      setTick((t) => t + 1);
      form.reset();

      revealStatus();
    } catch {
      setErrors(["Network error. Please try again."]);
      revealStatus();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page" id="main">
      {/* HERO */}
      <div className={`hero ${reducedMotion ? "" : "hero-animate"}`}>
        <div className="hero-content">
          <div className="hero-brand">
            <img className="hero-brand-logo" src="/logo.jpeg" alt="Together We Thrive logo" />
            <div className="hero-brand-text">
              <span className="hero-brand-title">Together We Thrive</span>
              <span className="hero-brand-subtitle">Support Co</span>
            </div>
          </div>

          <h1>Contact Us</h1>

          <p className="lead">
            Call or send a message. We’ll respond as soon as possible.
          </p>

          <div className="cta-row">
            <a className="btn ghost" href={`tel:${PHONE.replace(/\s/g, "")}`}>
              Call {PHONE}
            </a>
            <a className="btn primary" href={`mailto:${EMAIL}`}>
              Email us
            </a>
          </div>
        </div>

        <div className="hero-image">
          <img src="/images/contact-hero.png" alt="Friendly support worker" />
        </div>
      </div>
      <header className="page-header" style={{ marginTop: "1.25rem" }}>
        <h2>How would you like to contact us?</h2>
        <p className="muted">Choose the option that feels easiest. You can call, email, or send an enquiry form.</p>
      </header>
      
      <div className="contact-grid">
        {/* LEFT */}
        <div className="contact-card">
          <h2>📍 Get in touch</h2>

          <p><strong>Phone:</strong> <a href={`tel:${PHONE}`}>{PHONE}</a></p>
          <p><strong>Email:</strong> <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>

          <p className="muted">
            Supporting South Western Sydney, expanding across NSW.
          </p>

          <hr />

          <div className="contact-map-tabs">
            <button
              className={`btn ghost ${activeMap === "horsley" ? "is-active" : ""}`}
              onClick={() => setActiveMap("horsley")}
            >
              Horsley Park
            </button>
            <button
              className={`btn ghost ${activeMap === "fivedock" ? "is-active" : ""}`}
              onClick={() => setActiveMap("fivedock")}
            >
              Five Dock
            </button>
          </div>

          {activeMap === "horsley" && (
            <div className="map-embed">
              <iframe
                title="Horsley Park Map"
                src="https://www.google.com/maps?q=Suite%201/1840%20The%20Horsley%20Drive%20Horsley%20Park%20NSW&output=embed"
                loading="lazy"
              />
            </div>
          )}

          {activeMap === "fivedock" && (
            <div className="map-embed">
              <iframe
                title="Five Dock Map"
                src="https://www.google.com/maps?q=Suite%20420/49%20Queens%20Road%20Five%20Dock%20NSW&output=embed"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="contact-card">
          <h2>📝 Send an enquiry</h2>

          <div
            ref={statusRef}
            className="form-status"
            data-tick={tick}
            aria-live="polite"
            role="status"
          >
            {errors.length > 0 && (
              <ul className="error-list form-pop">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}

            {status === "success" && (
              <p className="contact-success form-pop">
                Thank you! Your message has been sent.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <input type="text" name="company" style={{ display: "none" }} />

            <label>
              Name
              <input name="name" />
            </label>

            <label>
              Email
              <input name="email" type="email" />
            </label>

            <label>
              Preferred service
              <select name="service">
                {SERVICES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>

            <label>
              Message
              <textarea name="message" rows={5} />
            </label>

            {/* SAME TURNSTILE AS REFERRAL */}
            <Turnstile
              siteKey="0x4AAAAAACZ-mU6ox2cWGFfP"
              onSuccess={(t) => setTurnstileToken(t)}
              onExpire={() => setTurnstileToken("")}
              onError={() => setTurnstileToken("")}
            />

            <button
              className="btn primary"
              type="submit"
              disabled={submitting || !turnstileToken}
            >
              {submitting ? "Sending..." : "Send enquiry"}
            </button>

            <p className="muted contact-helper">
              Prefer to browse?{" "}
              <Link to="/services" className="text-link">
                View services →
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
