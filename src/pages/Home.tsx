import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { useEffect, useMemo, useState } from "react";

const PHONE = "(02) 9188 3644";
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
            "Person-centred disability support services and NDIS support services in South Western Sydney, with a focus on psychosocial disability support and community participation.",
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
      "Together We Thrive Support Co | NDIS Disability Support & Psychosocial Services",
    description:
      "Together We Thrive Support Co provides NDIS support services including psychosocial disability support, daily living support, personal care and community participation in South Western Sydney.",
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

          <h1>NDIS Disability Support & Psychosocial Services</h1>

          <p className="lead">
            We support people living with <strong>psychosocial disability</strong>{" "}
            with practical <strong>NDIS-aligned support</strong> that helps you build
            routine, independence and meaningful connection at your pace.
          </p>

          <p className="muted" style={{ marginTop: ".5rem" }}>
            Supports are tailored to goals and NDIS funding. This may include
            help with daily routines, appointments, community participation, and
            skill building for independence.
          </p>

          {/* ✅ Trust line */}
          <p className="muted" style={{ marginTop: ".5rem" }}>
            <strong>Built on advocacy, accountability and participant rights.</strong>
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
            Supporting <strong>South Western Sydney</strong>, expanding across{" "}
            <strong>NSW</strong> as we grow
          </p>

          <div className="pill-row" aria-label="Key supports offered">
            <span className="pill">Psychosocial Disability Support</span>
            <span className="pill">Daily Living Support</span>
            <span className="pill">Community Participation</span>
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
          <h2>Recovery focused, practical support</h2>
          <p className="muted">
            We offer calm, routine based support that helps with planning,
            motivation and taking steady steps forward.
          </p>
        </div>

        <div className="trust-card">
          <h2>Person centred and respectful</h2>
          <p className="muted">
            We listen first. Support is delivered with dignity, privacy and
            clear communication.
          </p>
        </div>

        <div className="trust-card">
          <h2>Guided by safeguards and clear processes</h2>
          <p className="muted">
            Our supports are guided by a strong understanding of participant
            rights, safeguards and the NDIS framework. This means clearer
            communication, fair service agreements and support that keeps your
            wellbeing at the centre.
          </p>
          <p className="muted" style={{ marginTop: ".4rem" }}>
            You can read more on our{" "}
            <Link to="/participant-safeguards">Participant Safeguards</Link> page.
          </p>
        </div>
      </div>

      {/* PRIMARY CARDS */}
      <header className="page-header" style={{ marginTop: "1.5rem" }}>
        <h2>Practical NDIS Support Services</h2>
        <p className="muted">
          Support that is tailored to your goals and designed around NDIS funding.
        </p>
        <p className="muted" style={{ marginTop: ".25rem" }}>
          Our approach is shaped by understanding disability, communication preferences
          and participant rights. This helps us respond thoughtfully, build trust and
          support people in ways that feel safe, respectful and empowering.
        </p>
      </header>

      <div className="cards">
        <article className="service-card">
          <img
            src="/images/community.jpg"
            alt="Two women enjoying coffee outdoors, smiling and talking together"
          />
          <div className="service-body">
            <h3>Connection and community participation</h3>
            <p className="muted">
              Gentle support to get out, rebuild confidence and reconnect with
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
            <h3>Routine, planning and daily living support</h3>
            <p className="muted">
              Support with routines, meal planning, appointments and organising
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
            <h3>In home support and personal care, as needed</h3>
            <p className="muted">
              Respectful support at home to maintain wellbeing, safety and
              independence, always with dignity and privacy.
            </p>
            <Link className="text-link" to="/services">
              Explore in home supports →
            </Link>
          </div>
        </article>
      </div>

      {/* CONTACT STRIP */}
      <div className="contact-strip" aria-label="Quick contact options">
        <div className="contact-strip-left">
          <h2>Ready to talk?</h2>
          <p className="muted">
            Call us or send a message. We will respond as soon as possible.
          </p>
          <p className="muted" style={{ marginTop: ".25rem" }}>
            If you are a participant, family member or support coordinator, we
            are here to make the process clear and stress free.
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
              NDIS participants living with <strong>psychosocial disability</strong>
            </li>
            <li>People seeking routine, independence and stability</li>
            <li>Families, carers and support coordinators</li>
            <li>People wanting stronger community connection</li>
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