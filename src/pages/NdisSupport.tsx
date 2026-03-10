import { useEffect, useMemo, useRef, useState } from "react";
import { useSeo } from "../hooks/useSeo";
import { Turnstile } from "@marsidev/react-turnstile";
import "../styles/NdisSupport.css";
import { useNavigate } from "react-router-dom";

const PHONE = "(02) 9188 3644";
const PHONE_LINK = "0291883644";
const EMAIL = "info@twt.net.au";

function useNdisSupportJsonLdSchema() {
  const schemaGraph = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "/ndis-support";

    const pageUrl = origin ? `${origin}${pathname}` : "/ndis-support";
    const siteUrl = origin || "";
    const orgId = siteUrl ? `${siteUrl}#organization` : "#organization";
    const websiteId = siteUrl ? `${siteUrl}#website` : "#website";
    const webpageId = `${pageUrl}#webpage`;
    const logoUrl = origin ? `${origin}/logo.jpeg` : "/logo.jpeg";
    const heroUrl =
      origin ? `${origin}/images/ndis-support-hero.png` : "/images/ndis-support-hero.png";

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["Organization", "LocalBusiness"],
          "@id": orgId,
          name: "Together We Thrive Support Co",
          url: siteUrl || undefined,
          telephone: PHONE,
          email: EMAIL,
          logo: logoUrl,
          image: heroUrl,
          description:
            "Together We Thrive Support Co provides psychosocial disability support and mental health and wellbeing support as part of our NDIS support services in South Western Sydney, alongside daily living support, community access, personal care and support planning.",
          areaServed: {
            "@type": "AdministrativeArea",
            name: "South Western Sydney, New South Wales, Australia",
          },
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
          name: "Psychosocial Disability & Mental Health Support | Together We Thrive Support Co",
          isPartOf: { "@id": websiteId },
          about: { "@id": orgId },
          inLanguage: "en-AU",
        },
      ],
    };
  }, []);

  useEffect(() => {
    const id = "twt-jsonld-ndis-support";
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
  const text = await res.text();
  return { errors: [text?.slice(0, 300) || "Server returned a non-JSON error."] };
}

function IconMentalHealth() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 22c0-5.2 4.1-9 9.2-9 4.8 0 8.8 4 8.8 8.8 0 9.6-9.1 14.5-18 22.2-8.9-7.7-18-12.6-18-22.2 0-4.8 4-8.8 8.8-8.8 5.1 0 9.2 3.8 9.2 9z" />
      <path d="M20 36h6l3-6 6 14 4-8h5" />
    </svg>
  );
}

function IconDailyLiving() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M10 29.5 32 13l22 16.5v22a2.5 2.5 0 0 1-2.5 2.5h-12V39H24.5v15H12.5A2.5 2.5 0 0 1 10 51.5z" />
      <path d="M24 54V39h16v15" />
    </svg>
  );
}

function IconCommunity() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="20" r="7" />
      <circle cx="17" cy="24" r="5.5" />
      <circle cx="47" cy="24" r="5.5" />
      <path d="M22 46c0-5.8 4.5-10 10-10s10 4.2 10 10v5H22z" />
      <path d="M8 48c0-4.5 3.5-7.8 8-7.8 3 0 5.3 1 6.8 3V51H8z" />
      <path d="M41.2 43c1.5-2 3.8-3 6.8-3 4.5 0 8 3.3 8 7.8V51H41.2z" />
    </svg>
  );
}

function IconPersonalCare() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 22c0-5.2 4.1-9 9.2-9 4.8 0 8.8 4 8.8 8.8 0 9.6-9.1 14.5-18 22.2-8.9-7.7-18-12.6-18-22.2 0-4.8 4-8.8 8.8-8.8 5.1 0 9.2 3.8 9.2 9z" />
      <path d="M15 52c5-3 10.8-4.5 17-4.5S44 49 49 52" />
    </svg>
  );
}

const supportItems = [
  {
    title: "Psychosocial Disability & Mental Health Support",
    text: "Calm, practical Mental Health and Wellbeing Support for participants living with psychosocial disability and mental health support needs.",
    Icon: IconMentalHealth,
    featured: true,
  },
  {
    title: "Daily Living Support",
    text: "Help with routines, daily tasks and building confidence in everyday life.",
    Icon: IconDailyLiving,
  },
  {
    title: "Community Access",
    text: "Support for appointments, outings and meaningful participation in the community.",
    Icon: IconCommunity,
  },
  {
    title: "Personal Care",
    text: "Respectful personal care delivered with dignity, privacy and compassion.",
    Icon: IconPersonalCare,
  },
];

const testimonials = [
  {
    quote:
      "The team is caring, respectful and easy to communicate with. They make the support process feel less overwhelming.",
    name: "Participant Family",
  },
  {
    quote:
      "We value the calm and practical approach. Their support is thoughtful, person-centred and focused on real progress.",
    name: "Support Coordinator",
  },
  {
    quote:
      "Together We Thrive genuinely listens and tailors support to the participant’s needs and goals.",
    name: "Carer Feedback",
  },
];

export default function NdisSupport() {
  useSeo({
    title:
      "Psychosocial Disability & Mental Health Support | Together We Thrive Support Co",
    description:
      "Looking for psychosocial disability and mental health support in South Western Sydney? Together We Thrive Support Co provides calm, practical Mental Health and Wellbeing Support, daily living support, community access and personal care.",
  });

  useNdisSupportJsonLdSchema();
  
  const navigate = useNavigate();
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"" | "success">("");
  const [submitting, setSubmitting] = useState(false);

  const [csrf, setCsrf] = useState("");
  const [csrfReady, setCsrfReady] = useState(false);

  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const statusRef = useRef<HTMLDivElement | null>(null);
  const [tick, setTick] = useState(0);

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

    if (String(data.get("company") || "")) {
      return;
    }

    if (!csrf) {
      setErrors(["Security token not ready. Please refresh the page and try again."]);
      revealStatus();
      return;
    }

    if (!turnstileToken) {
      setErrors(["Please complete the security check."]);
      revealStatus();
      return;
    }

    const selectedService =
      String(data.get("service") || "").trim() ||
      "Psychosocial Disability & Mental Health Support";

    const message = String(data.get("message") || "").trim();

    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      service: selectedService,
      message,
      source: "NDIS Support Landing Page",
      csrf,
      turnstileToken,
      company: "",
    };

    const vErrors: string[] = [];
    if (!payload.name) vErrors.push("Please enter your name.");
    if (!payload.email) vErrors.push("Please enter your email.");
    if (!message) vErrors.push("Please enter a message.");
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

  const canSubmit = !submitting && csrfReady && !!csrf && !!turnstileToken;

  return (
    <main className="ndis-support-page">
      <section className="ndis-hero">
        <div className="ndis-hero-shell">
          <div className="ndis-hero-copy">
            <div className="ndis-brand">
              <img src="/logo.jpeg" alt="Together We Thrive Support Co logo" />
              <div className="ndis-brand-text">
                <span className="ndis-brand-title">Together We Thrive</span>
                <span className="ndis-brand-subtitle">Support Co</span>
              </div>
            </div>

            <p className="ndis-eyebrow">NDIS Support Services</p>

            <h1>
              Psychosocial Disability &
              <span> Mental Health Support</span>
            </h1>

            <p className="ndis-lead">
              We support people living with psychosocial disability and mental
              health support needs with calm, practical
              <strong> Mental Health and Wellbeing Support</strong> that helps
              build routine, confidence and meaningful connection at your pace.
            </p>

            <p className="ndis-service-area">
              Servicing <strong>all of NSW</strong> with local support across
              South Western Sydney including Horsley Park and Five Dock.
            </p>

            <div className="ndis-pill-row">
              <span className="ndis-pill">Psychosocial Support</span>
              <span className="ndis-pill">Mental Health & Wellbeing</span>
              <span className="ndis-pill">South Western Sydney</span>
            </div>

            <div className="ndis-cta-row">
              <a href={`tel:${PHONE_LINK}`} className="ndis-btn ndis-btn-primary">
                Call {PHONE}
              </a>
              <a href="#ndis-enquiry" className="ndis-btn ndis-btn-outline">
                Get Support Today
              </a>
            </div>

            <div className="ndis-contact-inline">
              <span>{EMAIL}</span>
              <span>Horsley Park & Five Dock</span>
            </div>
          </div>

          <div className="ndis-hero-image-wrap">
            <div className="ndis-hero-image-ring">
              <img
                src="/images/ndis-support-hero.png"
                alt="People smiling together in a supportive community setting"
                className="ndis-hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="ndis-badges-section">
        <div className="ndis-container">
          <div className="ndis-badges-grid">
            <div className="ndis-badge-card">Person-Centred Support</div>
            <div className="ndis-badge-card">Calm & Practical Approach</div>
            <div className="ndis-badge-card">Families, Carers & Coordinators</div>
            <div className="ndis-badge-card">Local South Western Sydney Support</div>
          </div>
        </div>
      </section>

      <section className="ndis-services-overview">
        <div className="ndis-container">
          <div className="ndis-services-grid">
            {supportItems.map(({ title, text, Icon, featured }) => (
              <article
                className={`ndis-service-card ${featured ? "is-featured" : ""}`}
                key={title}
              >
                <div className="ndis-service-icon">
                  <Icon />
                </div>
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ndis-proof">
        <div className="ndis-container ndis-proof-grid">
          <div className="ndis-proof-card">
            <h2>Why families choose us</h2>
            <ul className="ndis-check-list">
              <li>Support tailored to the participant’s goals and pace</li>
              <li>Calm, respectful and practical approach</li>
              <li>Compassionate support for psychosocial disability needs</li>
              <li>Clear communication with participants, carers and families</li>
            </ul>
          </div>

          <div className="ndis-proof-card ndis-proof-card-accent">
            <h2>Who we support</h2>
            <p>
              We support people living with psychosocial disability and mental
              health support needs, as well as participants needing daily
              assistance, community access and respectful ongoing care.
            </p>
            <div className="ndis-proof-actions">
              <a href={`tel:${PHONE_LINK}`} className="ndis-btn ndis-btn-primary">
                Speak With Our Team
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="ndis-testimonials-section">
        <div className="ndis-container">
          <div className="ndis-section-heading">
            <p className="ndis-eyebrow">Trusted Support</p>
            <h2>What people value about our approach</h2>
          </div>

          <div className="ndis-testimonials-grid">
            {testimonials.map((item) => (
              <article className="ndis-testimonial-card" key={item.name}>
                <div className="ndis-testimonial-mark" aria-hidden="true">
                  “
                </div>
                <p className="ndis-testimonial-quote">{item.quote}</p>
                <div className="ndis-testimonial-footer">
                  <span className="ndis-testimonial-line" aria-hidden="true" />
                  <p className="ndis-testimonial-name">{item.name}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="ndis-enquiry" className="ndis-form-section">
        <div className="ndis-container ndis-form-grid">
          <div className="ndis-form-copy">
            <p className="ndis-eyebrow">Start Support Today</p>
            <h2>Request a call from our team</h2>
            <p>
              Tell us a little about the support you need and our team will
              contact you to discuss how we can help with psychosocial
              disability support, mental health and wellbeing support, and other
              daily supports.
            </p>

            <ul className="ndis-check-list">
              <li>NDIS participants</li>
              <li>Families and carers</li>
              <li>Support coordinators</li>
            </ul>
          </div>

          <div>
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

            <form className="ndis-lead-form" onSubmit={handleSubmit} noValidate>
              <input type="text" name="company" style={{ display: "none" }} />

              <div className="ndis-form-field">
                <label htmlFor="name">Name</label>
                <input id="name" type="text" name="name" autoComplete="name" required />
              </div>

              <div className="ndis-form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="ndis-form-field">
                <label htmlFor="service">Main support needed</label>
                <select
                  id="service"
                  name="service"
                  defaultValue="Psychosocial Disability & Mental Health Support"
                >
                  <option value="Psychosocial Disability & Mental Health Support">
                    Psychosocial Disability & Mental Health Support
                  </option>
                  <option value="Daily Living Support">Daily Living Support</option>
                  <option value="Community Access">Community Access</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>

              <div className="ndis-form-field">
                <label htmlFor="message">How can we help?</label>
                <textarea id="message" name="message" rows={4} required />
              </div>

              <Turnstile
                key={turnstileResetKey}
                siteKey="0x4AAAAAACZ-mU6ox2cWGFfP"
                onSuccess={(t) => setTurnstileToken(t)}
                onExpire={() => setTurnstileToken("")}
                onError={() => setTurnstileToken("")}
              />

              <button
                type="submit"
                className="ndis-btn ndis-btn-primary ndis-submit-btn"
                disabled={!canSubmit}
              >
                {submitting ? "Sending..." : "Request a Call"}
              </button>

              {!csrfReady && (
                <p className="muted" style={{ marginTop: ".5rem" }}>
                  Loading security token…
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      <section className="ndis-contact-section">
        <div className="ndis-container ndis-contact-grid">
          <div className="ndis-contact-copy">
            <p className="ndis-eyebrow ndis-eyebrow-light">Get in touch today</p>
            <h2>Ready to talk about support?</h2>
            <p>
              Whether you are a participant, family member, carer or support
              coordinator, we are here to help you get started with clear,
              respectful and person-centred support.
            </p>

            <div className="ndis-cta-row">
              <a href={`tel:${PHONE_LINK}`} className="ndis-btn ndis-btn-primary">
                Call {PHONE}
              </a>
              <a href="#ndis-enquiry" className="ndis-btn ndis-btn-outline-light">
                Send an Enquiry
              </a>
            </div>
          </div>

          <aside className="ndis-contact-card">
            <div className="ndis-contact-row">
              <div>
                <h3>Phone</h3>
                <p>{PHONE}</p>
              </div>
            </div>

            <div className="ndis-contact-row">
              <div>
                <h3>Email</h3>
                <p>{EMAIL}</p>
              </div>
            </div>

            <div className="ndis-contact-row">
              <div>
                <h3>Locations</h3>
                <p>Suite 1/1840 The Horsley Drive, Horsley Park NSW 2175</p>
                <p>Suite 420/49 Queens Road, Five Dock NSW 2046</p>
              </div>
            </div>

            <div className="ndis-registered-box">
              <span>Registered</span>
              <strong>NDIS</strong>
            </div>
          </aside>
        </div>
      </section>

      <div className="ndis-mobile-sticky-cta">
        <a href={`tel:${PHONE_LINK}`} className="ndis-btn ndis-btn-primary">
          Call Now
        </a>
        <a href="#ndis-enquiry" className="ndis-btn ndis-btn-outline">
          Enquire
        </a>
      </div>
    </main>
  );
}