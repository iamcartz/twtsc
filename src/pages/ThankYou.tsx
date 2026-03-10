import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import "../styles/thankyou.css";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const PHONE = "(02) 9188 3644";
const PHONE_LINK = "0291883644";
const EMAIL = "info@twt.net.au";
const CONVERSION_ID = "AW-18002433997/p55uCo7LjoUcEM2vnYhD";

function useThankYouJsonLdSchema() {
  const schemaGraph = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "/thank-you";

    const pageUrl = origin ? `${origin}${pathname}` : "/thank-you";
    const siteUrl = origin || "";
    const orgId = siteUrl ? `${siteUrl}#organization` : "#organization";
    const websiteId = siteUrl ? `${siteUrl}#website` : "#website";
    const webpageId = `${pageUrl}#webpage`;
    const logoUrl = origin ? `${origin}/logo.jpeg` : "/logo.jpeg";

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
          name: "Thank You | Together We Thrive Support Co",
          isPartOf: { "@id": websiteId },
          about: { "@id": orgId },
          inLanguage: "en-AU",
        },
      ],
    };
  }, []);

  useEffect(() => {
    const id = "twt-jsonld-thank-you";
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

function IconCheck() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="24" />
      <path d="M20 33.5 28 41l16-18" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M22.5 12h8l3 11-5 4c2.8 5.5 7.2 10 12.8 12.8l4-5 11 3v8c0 2.2-1.8 4-4 4C29.5 60 4 34.5 4 16c0-2.2 1.8-4 4-4h8l3.5 10-5 4" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M10 18h44a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V22a4 4 0 0 1 4-4z" />
      <path d="M8 22l24 16 24-16" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 58s18-16.6 18-31A18 18 0 1 0 14 27c0 14.4 18 31 18 31z" />
      <circle cx="32" cy="27" r="7" />
    </svg>
  );
}

export default function ThankYou() {
  useSeo({
    title: "Thank You | Together We Thrive Support Co",
    description:
      "Thank you for contacting Together We Thrive Support Co. Our team will contact you shortly regarding your NDIS support enquiry.",
  });

  useThankYouJsonLdSchema();

  const hasTrackedRef = useRef(false);

  useEffect(() => {
    function fireConversion() {
      if (hasTrackedRef.current) return;
      if (typeof window === "undefined" || typeof window.gtag !== "function") return;

      window.gtag("event", "conversion", {
        send_to: CONVERSION_ID,
        value: 1.0,
        currency: "AUD",
      });

      hasTrackedRef.current = true;
    }

    fireConversion();

    const timeout = window.setTimeout(fireConversion, 1200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <main className="ndis-support-page thankyou-page">
      <section className="thankyou-hero">
        <div className="ndis-container">
          <div className="thankyou-shell">
            <div className="thankyou-bg-orb thankyou-bg-orb-a" aria-hidden="true" />
            <div className="thankyou-bg-orb thankyou-bg-orb-b" aria-hidden="true" />

            <div className="thankyou-card">
              <div className="ndis-brand thankyou-brand">
                <img src="/logo.jpeg" alt="Together We Thrive Support Co logo" />
                <div className="ndis-brand-text">
                  <span className="ndis-brand-title">Together We Thrive</span>
                  <span className="ndis-brand-subtitle">Support Co</span>
                </div>
              </div>

              <div className="thankyou-badge">
                <span className="thankyou-badge-icon">
                  <IconCheck />
                </span>
                <span>Enquiry Received</span>
              </div>

              <p className="ndis-eyebrow">Thank You</p>

              <h1 className="thankyou-title">Thank you for getting in touch</h1>

              <p className="thankyou-lead">
                We have received your enquiry and one of our team members will
                contact you shortly to discuss your support needs.
              </p>

              <div className="thankyou-highlight">
                <strong>Together We Thrive Support Co</strong> provides calm,
                respectful and person-centred support across
                <strong> all of NSW</strong>.
              </div>

              <div className="thankyou-actions">
                <a href={`tel:${PHONE_LINK}`} className="ndis-btn ndis-btn-primary">
                  Call {PHONE}
                </a>
                <Link to="/ndis-support" className="ndis-btn ndis-btn-outline">
                  Back to NDIS Support
                </Link>
              </div>

              <div className="thankyou-info-grid">
                <article className="thankyou-info-card">
                  <div className="thankyou-info-icon">
                    <IconPhone />
                  </div>
                  <div>
                    <h2>Call us</h2>
                    <p>{PHONE}</p>
                  </div>
                </article>

                <article className="thankyou-info-card">
                  <div className="thankyou-info-icon">
                    <IconMail />
                  </div>
                  <div>
                    <h2>Email us</h2>
                    <p>{EMAIL}</p>
                  </div>
                </article>

                <article className="thankyou-info-card">
                  <div className="thankyou-info-icon">
                    <IconLocation />
                  </div>
                  <div>
                    <h2>Our locations</h2>
                    <p>Horsley Park & Five Dock</p>
                  </div>
                </article>
              </div>

              <div className="thankyou-footer-note">
                Trusted • Experienced • Local Support
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}