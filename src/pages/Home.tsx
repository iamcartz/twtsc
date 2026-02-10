import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { useEffect, useMemo, useState } from "react";

const PHONE = "+61 433 883 614";
const EMAIL = "info@twt.net.au";

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

    // Fallback for older browsers
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return reduced;
}

/**
 * Inject JSON-LD safely using runtime origin (no hardcoded domain).
 * Includes Organization + WebSite + WebPage + BreadcrumbList.
 */
function useHomeJsonLdSchema() {
  const schemaGraph = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "/";

    const pageUrl = origin ? `${origin}${pathname}` : "/";
    const siteUrl = origin || "";

    const orgId = siteUrl ? `${siteUrl}#organization` : "#organization";
    const websiteId = siteUrl ? `${siteUrl}#website` : "#website";
    const webpageId = pageUrl ? `${pageUrl}#webpage` : "#webpage";
    const breadcrumbsId = pageUrl ? `${pageUrl}#breadcrumbs` : "#breadcrumbs";

    const logoUrl = origin ? `${origin}/logo.jpeg` : "/logo.jpeg";
    const heroImg = origin ? `${origin}/images/hero.png` : "/images/hero.png";

    const breadcrumbs = [{ name: "Home", item: origin ? `${origin}/` : "/" }];

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
            "Person-centred disability support services and NDIS support services in South Western Sydney, with a focus on psychosocial disability support and mental health & wellbeing support.",
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
          name: "Together We Thrive Support Co | Home",
          isPartOf: { "@id": websiteId },
          about: { "@id": orgId },
          inLanguage: "en-AU",
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
    const id = "twt-jsonld-home";
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

export default function Home() {
  useSeo({
    title:
      "Together We Thrive Support Co | Psychosocial Disability & Mental Health Support (NDIS)",
    description:
      "Together We Thrive Support Co provides psychosocial disability support and mental health & wellbeing support as part of our NDIS support services in South Western Sydney — helping participants build routine, confidence, and community connection.",
  });

  // ✅ JSON-LD injection (safe runtime origin)
  useHomeJsonLdSchema();

  const reducedMotion = usePrefersReducedMotion();

  return (
    <section className="page">
      {/* HERO */}
      <div className={`hero ${reducedMotion ? "" : "hero-animate"}`}>
        <div className="hero-content">
          {/* Brand row */}
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

          <h1>Psychosocial disability support &amp; mental health wellbeing</h1>

          <p className="lead">
            We support people living with <strong>psychosocial disability</strong>{" "}
            (mental health support needs) with calm, practical{" "}
            <strong>Mental Health &amp; Wellbeing Support</strong>. Our focus is
            helping you build routine, confidence, and meaningful connection —
            at your pace.
          </p>

          <p className="muted" style={{ marginTop: ".5rem" }}>
            Supports are tailored to goals and NDIS funding, and may include help
            with daily routines, appointments, community participation, and
            skill-building for independence.
          </p>

          {/* CTA BUTTONS */}
          <div className="cta-row" aria-label="Primary actions">
            <Link to="/contact" className="btn primary">
              Contact Us
            </Link>

            <Link to="/services" className="btn ghost">
              View Services
            </Link>
          </div>

          {/* Local SEO reassurance */}
          <p className="muted hero-helper">
            Supporting <strong>South Western Sydney</strong> • Expanding across{" "}
            <strong>NSW</strong> as we grow
          </p>

          {/* Key supports (mental health first) */}
          <div className="pill-row" aria-label="Key supports offered">
            <span className="pill">Mental Health &amp; Wellbeing Support</span>
            <span className="pill">Psychosocial disability support</span>
            <span className="pill">Community participation</span>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/images/hero.png"
            alt="Support worker assisting a participant in the community"
          />
        </div>
      </div>

      {/* TRUST / REASSURANCE */}
      <div className="trust-row" aria-label="Trust and service information">
        <div className="trust-card">
          <h2>Recovery-focused, practical support</h2>
          <p className="muted">
            We offer calm, routine-based support that helps with planning,
            motivation, and taking steady steps forward.
          </p>
        </div>

        <div className="trust-card">
          <h2>Person-centred &amp; respectful</h2>
          <p className="muted">
            We listen first. Support is delivered with dignity, privacy, and
            clear communication.
          </p>
        </div>

        <div className="trust-card">
          <h2>NDIS funding support options</h2>
          <p className="muted">
            We support <strong>self-managed</strong> and{" "}
            <strong>plan-managed</strong> participants. If you’re NDIA-managed,
            contact us and we’ll guide you on options.
          </p>
        </div>
      </div>

      {/* PRIMARY CARDS: psychosocial / wellbeing first */}
      <header className="page-header" style={{ marginTop: "1.5rem" }}>
        <h2>Mental Health &amp; Wellbeing Support</h2>
        <p className="muted">
          Support that’s practical, calm, and focused on everyday progress.
        </p>
      </header>

      <div className="cards">
        <article className="service-card">
          <img
            src="/images/community.jpg"
            alt="Two women enjoying coffee outdoors, smiling and talking together"
          />
          <div className="service-body">
            <h3>Connection &amp; community participation</h3>
            <p className="muted">
              Gentle support to get out, rebuild confidence, and reconnect with
              activities and people that matter.
            </p>
            <Link className="text-link" to="/services">
              Explore community participation →
            </Link>
          </div>
        </article>

        <article className="service-card">
          <img
            src="/images/inhome.jpg"
            alt="Support worker assisting an older man using a walker at home"
          />
          <div className="service-body">
            <h3>Routine, planning &amp; daily living support</h3>
            <p className="muted">
              Support with routines, meal planning, appointments, and organising
              your day in a way that feels manageable.
            </p>
            <Link className="text-link" to="/services">
              Explore daily living support →
            </Link>
          </div>
        </article>

        <article className="service-card">
          <img
            src="/images/personal-care.jpg"
            alt="Support worker assisting a participant with personal care"
          />
          <div className="service-body">
            <h3>In-home support &amp; personal care (as needed)</h3>
            <p className="muted">
              Respectful support at home to maintain wellbeing, safety, and
              independence — always with dignity and privacy.
            </p>
            <Link className="text-link" to="/services">
              Explore in-home supports →
            </Link>
          </div>
        </article>
      </div>

      {/* CONTACT STRIP */}
      <div className="contact-strip" aria-label="Quick contact options">
        <div className="contact-strip-left">
          <h2>Ready to talk?</h2>
          <p className="muted">
            Call us or send a message. We’ll respond as soon as possible.
          </p>
        </div>

        <div className="contact-strip-actions">
          <a className="btn ghost" href={`tel:${PHONE.replace(/\s/g, "")}`}>
            Call {PHONE}
          </a>

          <Link className="btn primary" to="/contact">
            Send an enquiry
          </Link>
        </div>
      </div>

      {/* INFO GRID */}
      <div className="grid-2" style={{ marginTop: "1.25rem" }}>
        <div className="card">
          <h2>Where we work</h2>
          <p className="muted">
            We support participants across <strong>South Western Sydney</strong>{" "}
            and are expanding across <strong>NSW</strong> as we grow.
          </p>
        </div>

        <div className="card">
          <h2>Who we support</h2>
          <ul className="list">
            <li>
              People living with <strong>psychosocial disability</strong> (mental
              health support needs)
            </li>
            <li>NDIS participants seeking routine, confidence, and stability</li>
            <li>Families, carers, and support coordinators</li>
            <li>People wanting stronger community connection and independence</li>
          </ul>
          <p className="muted" style={{ marginTop: ".5rem" }}>
            Supports are provided in line with NDIS guidelines and within the
            scope of our registration.
          </p>
        </div>
      </div>
    </section>
  );
}
