import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import "../styles/Contact.css";
import { Turnstile } from "@marsidev/react-turnstile";
import { useNavigate } from "react-router-dom";

const EMAIL = "info@twt.net.au";
const PHONE = "(02) 9188 3644";

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

function useContactJsonLdSchema() {
  
  const schemaGraph = useMemo(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "/contact";

    const pageUrl = origin ? `${origin}${pathname}` : "/contact";
    const siteUrl = origin || "";
    const orgId = siteUrl ? `${siteUrl}#organization` : "#organization";
    const websiteId = siteUrl ? `${siteUrl}#website` : "#website";
    const webpageId = pageUrl ? `${pageUrl}#webpage` : "#webpage";
    const breadcrumbsId = pageUrl ? `${pageUrl}#breadcrumbs` : "#breadcrumbs";

    const logoUrl = origin ? `${origin}/logo.jpeg` : "/logo.jpeg";
    const heroImg = origin
      ? `${origin}/images/contact-hero.png`
      : "/images/contact-hero.png";

    const breadcrumbs = [
      { name: "Home", item: origin ? `${origin}/` : "/" },
      { name: "Contact", item: pageUrl },
    ];

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["Organization", "LocalBusiness"],
          "@id": orgId,
          name: "Together We Thrive Support Co",
          url: siteUrl || undefined,
          email: EMAIL,
          telephone: PHONE,
          logo: logoUrl,
          image: heroImg,
          areaServed: {
            "@type": "AdministrativeArea",
            name: "New South Wales, Australia",
          },
          description:
            "NDIS disability support provider in South Western Sydney offering in-home support, personal care, community participation and psychosocial disability support.",
          contactPoint: [
            {
              "@type": "ContactPoint",
              telephone: PHONE,
              contactType: "customer support",
              email: EMAIL,
              areaServed: "AU-NSW",
              availableLanguage: ["en"],
            },
          ],
        },
        {
          "@type": "WebSite",
          "@id": websiteId,
          url: siteUrl || undefined,
          name: "Together We Thrive Support Co",
          publisher: { "@id": orgId },
          inLanguage: "en-AU",
        },
        {
          "@type": "WebPage",
          "@id": webpageId,
          url: pageUrl,
          name: "Contact | Together We Thrive Support Co",
          isPartOf: { "@id": websiteId },
          about: { "@id": orgId },
          inLanguage: "en-AU",
        },
        {
          "@type": "ContactPage",
          "@id": pageUrl ? `${pageUrl}#contactpage` : "#contactpage",
          url: pageUrl,
          name: "Contact",
          isPartOf: { "@id": websiteId },
          about: { "@id": orgId },
          mainEntity: { "@id": orgId },
        },
        {
          "@type": "Place",
          "@id": siteUrl ? `${siteUrl}#horsley-park` : "#horsley-park",
          name: "Together We Thrive Support Co — Horsley Park",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Suite 1/1840 The Horsley Drive",
            addressLocality: "Horsley Park",
            addressRegion: "NSW",
            addressCountry: "AU",
          },
        },
        {
          "@type": "Place",
          "@id": siteUrl ? `${siteUrl}#five-dock` : "#five-dock",
          name: "Together We Thrive Support Co — Five Dock",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Suite 420/49 Queens Road",
            addressLocality: "Five Dock",
            addressRegion: "NSW",
            addressCountry: "AU",
          },
        },
        {
          "@type": "BreadcrumbList",
          "@id": breadcrumbsId,
          itemListElement: breadcrumbs.map((b, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: b.name,
            item: b.item,
          })),
        },
      ],
    };
  }, []);

  useEffect(() => {
    const id = "twt-jsonld-contact";
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.text = JSON.stringify(schemaGraph);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [schemaGraph]);
}

async function readResponseSafely(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return await res.json();
  }
  // fallback: could be HTML/php error
  const text = await res.text();
  return { errors: [text?.slice(0, 300) || "Server returned a non-JSON error."] };
}

export default function Contact() {
  useSeo({
    title: "Contact | Together We Thrive Support Co",
    description:
      "Contact Together We Thrive Support Co for person-centred disability support services and NDIS support services in South Western Sydney. Call, email, or send an enquiry online.",
  });

  useContactJsonLdSchema();

  const reducedMotion = usePrefersReducedMotion();

  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"" | "success">("");
  const [submitting, setSubmitting] = useState(false);

  const [activeMap, setActiveMap] = useState<LocationKey>("horsley");

  // CSRF
  const [csrf, setCsrf] = useState("");
  const [csrfReady, setCsrfReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/csrf.php", { credentials: "include" });
        const j = await r.json();
        if (!cancelled) {
          setCsrf(j?.csrf || "");
          setCsrfReady(true);
        }
      } catch {
        if (!cancelled) {
          setCsrf("");
          setCsrfReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Turnstile token
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  // status scroll
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

    // honeypot
    if (!String(data.get("company") || "")) {
      // ok
    } else {
      return;
    }

    if (!csrf) {
      setErrors([
        "Security token not ready. Please refresh the page and try again.",
      ]);
      revealStatus();
      return;
    }

    if (!turnstileToken) {
      setErrors(["Please complete the security check."]);
      revealStatus();
      return;
    }

    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      contactNo: String(data.get("contactNo") || "").trim(),
      service: String(data.get("service") || "Not sure"),
      message: String(data.get("message") || "").trim(),
      source: "Website Contact Form",
      csrf,
      turnstileToken,
      company: "", // keep honeypot empty
    };

    // quick client validation
    const vErrors: string[] = [];
    if (!payload.name) vErrors.push("Please enter your name.");
    if (!payload.email) vErrors.push("Please enter your email.");
    if (!payload.contactNo) vErrors.push("Please enter your phone number.");
    if (!payload.message) vErrors.push("Please enter a message.");
    if (vErrors.length) {
      setErrors(vErrors);
      revealStatus();
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/contact.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const out = await readResponseSafely(res);

      if (!res.ok) {
        setErrors(out?.errors || ["Something went wrong."]);
        revealStatus();
        return;
      }

      setStatus("success");
      setErrors([]);
      form.reset();

      // reset turnstile state
      setTurnstileToken("");
      setTurnstileResetKey((k) => k + 1);

      revealStatus();

      navigate("/thank-you");
    } catch {
      setErrors(["Network error. Please try again."]);
      revealStatus();
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    !submitting && csrfReady && !!csrf && !!turnstileToken;

  return (
    <main className="page" id="main">
      <div className={`hero ${reducedMotion ? "" : "hero-animate"}`}>
        <div className="hero-content">
          <div className="hero-brand">
            <img
              className="hero-brand-logo"
              src="/logo.jpeg"
              alt="Together We Thrive logo"
            />
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
        <p className="muted">
          Choose the option that feels easiest. You can call, email, or send an
          enquiry form.
        </p>
      </header>

      <div className="contact-grid">
        <div className="contact-card">
          <h2>📍 Get in touch</h2>

          <p>
            <strong>Phone:</strong>{" "}
            <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
          </p>
          <p>
            <strong>Email:</strong> <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </p>

          <p className="muted">
            Supporting South Western Sydney, expanding across NSW.
          </p>

          <hr />

          <div className="contact-map-tabs">
            <button
              type="button"
              className={`btn ghost ${activeMap === "horsley" ? "is-active" : ""}`}
              onClick={() => setActiveMap("horsley")}
            >
              Horsley Park
            </button>
            <button
              type="button"
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
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
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
              <input name="name" autoComplete="name" required />
            </label>

            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>

            <label>
              Phone Number
              <input name="contactNo" type="tel" autoComplete="tel" required />
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
              <textarea name="message" rows={5} required />
            </label>

            <Turnstile
              key={turnstileResetKey}
              siteKey="0x4AAAAAACZ-mU6ox2cWGFfP"
              onSuccess={(t) => setTurnstileToken(t)}
              onExpire={() => setTurnstileToken("")}
              onError={() => setTurnstileToken("")}
            />

            <button className="btn primary" type="submit" disabled={!canSubmit}>
              {submitting ? "Sending..." : "Send enquiry"}
            </button>

            {!csrfReady && (
              <p className="muted" style={{ marginTop: ".5rem" }}>
                Loading security token…
              </p>
            )}

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
