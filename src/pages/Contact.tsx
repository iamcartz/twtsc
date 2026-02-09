import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import "../styles/Contact.css";

const EMAIL = "info@twt.net.au";
const PHONE = "0400 000 000"; // change later when ready

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

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
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
  const [activeMap, setActiveMap] = useState<LocationKey>("horsley");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setStatus("");

    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot field (spam trap)
    const company = (data.get("company") || "").toString();
    if (company) return;

    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();
    const service = (data.get("service") || "Not sure").toString();

    const newErrors: string[] = [];
    if (!name) newErrors.push("Please enter your name.");
    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      newErrors.push("Please enter a valid email address.");
    if (!message) newErrors.push("Please enter a short message.");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // For now we only simulate sending (backend later)
    console.log({ name, email, service, message });

    setStatus("success");
    form.reset();
  }

  return (
    <main className="page" id="main">
      {/* HERO (uniform with other pages) */}
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

          <h1>Contact Us</h1>

          <p className="lead">
            Call or send a message. We will respond as soon as possible.
          </p>

          <div className="cta-row" aria-label="Contact actions">
            <a className="btn ghost" href={`tel:${PHONE.replace(/\s/g, "")}`}>
              📞 Call {PHONE}
            </a>
            <a className="btn primary" href={`mailto:${EMAIL}`}>
              ✉️ Email us
            </a>
          </div>

          <p className="muted hero-helper">
            Based in <strong>South Western Sydney</strong> • Expanding across{" "}
            <strong>NSW</strong> as we grow
          </p>

          <div className="pill-row" aria-label="Quick contact topics">
            <span className="pill">New enquiries</span>
            <span className="pill">NDIS support questions</span>
            <span className="pill">Psychosocial support</span>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/images/contact-hero.png"
            alt="A friendly support worker speaking with a participant"
            loading="eager"
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <header className="page-header" style={{ marginTop: "1.25rem" }}>
        <h2>How would you like to contact us?</h2>
        <p className="muted">
          Choose the option that feels easiest. You can call, email, or send an enquiry form.
        </p>
      </header>

      <div className="contact-grid">
        {/* LEFT SIDE */}
        <div className="contact-card">
          <h2>📍 Get in touch</h2>

          <p>
            <strong>Phone:</strong>{" "}
            <a
              href={`tel:${PHONE.replace(/\s/g, "")}`}
              aria-label={`Call ${PHONE}`}
            >
              {PHONE}
            </a>
          </p>

          <p>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${EMAIL}`} aria-label={`Email ${EMAIL}`}>
              {EMAIL}
            </a>
          </p>

          <p className="muted">
            We support participants across South Western Sydney, with plans to expand across NSW.
          </p>

          <hr className="contact-divider" />

          <h3>🏢 Our Offices</h3>

          <div
            className="contact-map-tabs"
            role="tablist"
            aria-label="Office locations"
          >
            <button
              type="button"
              className={`btn ghost ${activeMap === "horsley" ? "is-active" : ""}`}
              onClick={() => setActiveMap("horsley")}
              role="tab"
              aria-selected={activeMap === "horsley"}
            >
              Horsley Park
            </button>

            <button
              type="button"
              className={`btn ghost ${activeMap === "fivedock" ? "is-active" : ""}`}
              onClick={() => setActiveMap("fivedock")}
              role="tab"
              aria-selected={activeMap === "fivedock"}
            >
              Five Dock
            </button>
          </div>

          {activeMap === "horsley" && (
            <>
              <p>
                <strong>Horsley Park</strong>
                <br />
                Suite 1/1840 The Horsley Drive
                <br />
                Horsley Park NSW
              </p>

              <div className="map-embed">
                <iframe
                  title="Horsley Park Map"
                  src="https://www.google.com/maps?q=Suite%201/1840%20The%20Horsley%20Drive%20Horsley%20Park%20NSW&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </>
          )}

          {activeMap === "fivedock" && (
            <>
              <p>
                <strong>Five Dock</strong>
                <br />
                Suite 420/49 Queens Road
                <br />
                Five Dock NSW
              </p>

              <div className="map-embed">
                <iframe
                  title="Five Dock Map"
                  src="https://www.google.com/maps?q=Suite%20420/49%20Queens%20Road%20Five%20Dock%20NSW&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="contact-card">
          <h2>📝 Send an enquiry</h2>

          <div className="form-status" aria-live="polite" aria-atomic="true" role="status">
            {errors.length > 0 && (
              <ul className="error-list">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}

            {status === "success" && (
              <p className="contact-success">
                Thank you! Your message has been sent successfully.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Honeypot */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              style={{ display: "none" }}
            />

            <label htmlFor="name">
              Name
              <input id="name" name="name" type="text" autoComplete="name" />
            </label>

            <label htmlFor="email">
              Email
              <input id="email" name="email" type="email" autoComplete="email" />
            </label>

            <label htmlFor="service">
              Preferred service
              <select id="service" name="service" defaultValue="Not sure">
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="message">
              Message
              <textarea id="message" name="message" rows={5} />
            </label>

            <button className="btn primary" type="submit">
              Send enquiry
            </button>

            <p className="muted contact-helper">
              Prefer not to type? You can call us instead.
              <Link className="text-link" to="/services">
                {" "}View services →
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
