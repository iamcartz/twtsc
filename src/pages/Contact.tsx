import { useState } from "react";
import { useSeo } from "../hooks/useSeo";

export default function Contact() {
  useSeo({
    title: "Contact | Together We Thrive",
    description:
      "Contact Together We Thrive Support Co for NDIS disability support in South Western Sydney.",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setStatus("");

    const form = e.currentTarget;
    const data = new FormData(form);

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

    setStatus("Opening your email app…");

    const subject = encodeURIComponent("New enquiry - Together We Thrive Support Co");
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:info@twt.com.au?subject=${subject}&body=${body}`;

    // Optional: reset after launching mail client
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
        <div className="contact-card">
          <h2>Get in touch</h2>
          <p>
            Phone: <a href="tel:0400000000">0400 000 000</a>
          </p>
          <p>
            Email:{" "}
            <a href="mailto:info@twt.com.au">
              info@twt.com.au
            </a>
          </p>
          <p className="muted">
            Based in South Western Sydney, with plans to expand across NSW.
          </p>
        </div>

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
            {status && <p>{status}</p>}
          </div>

          <form onSubmit={handleSubmit} noValidate>
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
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
