import { useState } from "react";
import { useSeo } from "../hooks/useSeo";

const EMAIL = "info@twt.net.au";
const PHONE = "0400 000 000"; // change later when ready

type LocationKey = "horsley" | "fivedock";

export default function Contact() {
  useSeo({
    title: "Contact | Together We Thrive",
    description:
      "Contact Together We Thrive Support Co for NDIS disability support in South Western Sydney.",
  });

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

    const newErrors: string[] = [];

    if (!name) newErrors.push("Please enter your name.");
    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      newErrors.push("Please enter a valid email address.");
    if (!message) newErrors.push("Please enter a short message.");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // For now we only simulate sending
    setStatus("success");
    form.reset();
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Contact Us</h1>
        <p className="muted">
          Call or send a message. We will respond as soon as possible.
        </p>
      </header>

      <div className="contact-grid">
        {/* LEFT SIDE */}
        <div className="contact-card">
          <h2>Get in touch</h2>

          <p>
            Phone:{" "}
            <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
          </p>

          <p>
            Email:{" "}
            <a href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
          </p>

          <p className="muted">
            Based in South Western Sydney, with plans to expand across NSW.
          </p>

          <hr style={{ margin: "1rem 0" }} />

          <h3>Our Offices</h3>

          <div style={{ display: "flex", gap: ".5rem", marginBottom: ".75rem" }}>
            <button
              type="button"
              className={`btn ghost`}
              onClick={() => setActiveMap("horsley")}
            >
              Horsley Park
            </button>

            <button
              type="button"
              className={`btn ghost`}
              onClick={() => setActiveMap("fivedock")}
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

              <iframe
                title="Horsley Park Map"
                src="https://www.google.com/maps?q=Suite%201/1840%20The%20Horsley%20Drive%20Horsley%20Park%20NSW&output=embed"
                width="100%"
                height="280"
                loading="lazy"
                style={{ border: 0, borderRadius: 12 }}
              />
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

              <iframe
                title="Five Dock Map"
                src="https://www.google.com/maps?q=Suite%20420/49%20Queens%20Road%20Five%20Dock%20NSW&output=embed"
                width="100%"
                height="280"
                loading="lazy"
                style={{ border: 0, borderRadius: 12 }}
              />
            </>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="contact-card">
          <h2>Send an enquiry</h2>

          <div
            className="form-status"
            aria-live="polite"
            aria-atomic="true"
            role="status"
          >
            {errors.length > 0 && (
              <ul className="error-list">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}

            {status === "success" && (
              <p style={{ color: "var(--teal)", fontWeight: 800 }}>
                Thank you! Your message has been sent successfully.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Honeypot field */}
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

            <label htmlFor="message">
              Message
              <textarea id="message" name="message" rows={5} />
            </label>

            <button className="btn primary" type="submit">
              Send enquiry
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
