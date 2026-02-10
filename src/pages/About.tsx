import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { useEffect, useMemo, useState } from "react";
import "../styles/About.css";

const PHONE = "+61 433 883 614";
const EMAIL = "info@twt.com.au";

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

    // Safari fallback
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return reduced;
}

/**
 * Adds a light reveal animation to sections/cards when they enter the viewport.
 * Automatically disables if user prefers reduced motion.
 */
function useRevealOnScroll(enabled: boolean) {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    if (!nodes.length) return;

    // If disabled (reduced motion), mark everything visible immediately.
    if (!enabled) {
      nodes.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    nodes.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);
}

/**
 * Injects JSON-LD schema (Organization / LocalBusiness + WebSite + BreadcrumbList) for SEO.
 * Uses runtime origin so we don’t hardcode domains.
 */
function useJsonLdSchema() {
  const schemaGraph = useMemo(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const path =
      typeof window !== "undefined" ? window.location.pathname : "/about";

    const pageUrl = origin ? `${origin}${path}` : "/about";
    const siteUrl = origin || "";
    const logoUrl = origin ? `${origin}/logo.jpeg` : "/logo.jpeg";
    const heroImg = origin ? `${origin}/images/about-hero.png` : "/images/about-hero.png";

    // If you later want the breadcrumb to match your nav exactly, just edit these names/urls.
    const breadcrumbs = [
      { name: "Home", item: origin ? `${origin}/` : "/" },
      { name: "About", item: pageUrl },
    ];

    return {
      "@context": "https://schema.org",
      "@graph": [
        // Organization / LocalBusiness
        {
          "@type": ["Organization", "LocalBusiness"],
          "@id": siteUrl ? `${siteUrl}#organization` : "#organization",
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
            "NDIS disability support provider based in South Western Sydney, offering in-home supports, personal care, community participation and psychosocial disability supports.",
          address: [
            {
              "@type": "PostalAddress",
              streetAddress: "Suite 1/1840 The Horsley Drive",
              addressLocality: "Horsley Park",
              addressRegion: "NSW",
              addressCountry: "AU",
            },
            {
              "@type": "PostalAddress",
              streetAddress: "Suite 420/49 Queens Road",
              addressLocality: "Five Dock",
              addressRegion: "NSW",
              addressCountry: "AU",
            },
          ],
          knowsAbout: [
            "NDIS Supports",
            "Psychosocial Disability",
            "Mental Health Support",
            "In-home Support",
            "Personal Care",
            "Community Participation",
          ],
          serviceType: [
            "Assistance with Daily Living & Personal Care",
            "Community Participation & Social Support",
            "Capacity Building & Life Skills Development",
            "Support Coordination",
            "Mental Health & Wellbeing Support",
          ],
        },

        // WebSite (helps Google understand the site as a whole)
        {
          "@type": "WebSite",
          "@id": siteUrl ? `${siteUrl}#website` : "#website",
          url: siteUrl || undefined,
          name: "Together We Thrive Support Co",
          publisher: {
            "@id": siteUrl ? `${siteUrl}#organization` : "#organization",
          },
          inLanguage: "en-AU",
        },

        // WebPage (this About page)
        {
          "@type": "WebPage",
          "@id": pageUrl ? `${pageUrl}#webpage` : "#webpage",
          url: pageUrl,
          name: "About | Together We Thrive Support Co",
          isPartOf: {
            "@id": siteUrl ? `${siteUrl}#website` : "#website",
          },
          about: {
            "@id": siteUrl ? `${siteUrl}#organization` : "#organization",
          },
          inLanguage: "en-AU",
        },

        // BreadcrumbList (helps SERP breadcrumbs)
        {
          "@type": "BreadcrumbList",
          "@id": pageUrl ? `${pageUrl}#breadcrumbs` : "#breadcrumbs",
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
    const id = "twt-jsonld-schema-graph";
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

export default function About() {
  useSeo({
    title: "About | Together We Thrive Support Co",
    description:
      "Learn about Together We Thrive Support Co — who we are, who we support, and our NDIS support services including psychosocial disability and mental health support.",
  });

  const reducedMotion = usePrefersReducedMotion();

  // Subtle scroll reveals (disabled when reduced motion is preferred)
  useRevealOnScroll(!reducedMotion);

  // JSON-LD schema for SEO (Organization + WebSite + WebPage + BreadcrumbList)
  useJsonLdSchema();

  return (
    <main className="page" id="main">
      {/* HERO */}
      <div className={`hero ${reducedMotion ? "" : "hero-animate"}`} data-reveal>
        <div className="hero-content">
          <div className="hero-brand">
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

          <h1>About Us</h1>

          <p className="lead">
            Empowering Ability. Supporting Independence. Building Meaningful
            Lives.
          </p>

          <div className="cta-row">
            <Link to="/contact" className="btn primary">
              Contact Us
            </Link>
            <Link to="/services" className="btn ghost">
              View Services
            </Link>
          </div>

          <p className="muted hero-helper">
            Based in <strong>South Western Sydney</strong> • Expanding across{" "}
            <strong>NSW</strong> as we grow
          </p>

          <div className="pill-row">
            <span className="pill">In-home supports</span>
            <span className="pill">Personal care</span>
            <span className="pill">Community participation</span>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/images/about-hero.png"
            alt="Support worker assisting a participant in the community"
          />
        </div>
      </div>

      {/* 👥 WHO WE ARE */}
      <section className="card" style={{ marginTop: "1.25rem" }} data-reveal>
        <h2>👥 Who We Are</h2>
        <p className="muted">
          Together We Thrive Support Co supports people living with disability
          to live with dignity, independence, and purpose. We provide
          personalised, compassionate support to help participants achieve their
          goals and stay connected with community.
        </p>
        <p className="muted">
          We believe support should go beyond basic care — it should inspire
          confidence, promote growth, and help every individual truly thrive.
        </p>
      </section>

      {/* 💚 CORE VALUES */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>💚 Our Core Values</h2>
        <ul className="list">
          <li>
            <strong>Respect:</strong> We listen, understand, and support your
            choices.
          </li>
          <li>
            <strong>Dignity:</strong> We provide care that protects privacy and
            builds confidence.
          </li>
          <li>
            <strong>Independence:</strong> We focus on skills, routines, and
            supports that help you do more.
          </li>
          <li>
            <strong>Inclusion:</strong> We help you stay connected to community,
            culture, and relationships.
          </li>
          <li>
            <strong>Safety &amp; Quality:</strong> We follow NDIS-aligned
            standards and deliver consistent, professional support.
          </li>
        </ul>
      </section>

      {/* SERVICES + WHO WE SUPPORT */}
      <section className="grid-2" style={{ marginTop: "1rem" }}>
        <div className="card" data-reveal>
          <h2>🧩 Our NDIS Support Services</h2>
          <ul className="list">
            <li>Assistance with Daily Living &amp; Personal Care</li>
            <li>Community Participation &amp; Social Support</li>
            <li>Capacity Building &amp; Life Skills Development</li>
            <li>Support Coordination &amp; Individualised Plans</li>
            <li>
              <strong>Mental Health &amp; Wellbeing Support</strong>
            </li>
          </ul>
          <p className="muted">
            Services can be customised based on participant plans and support
            requirements.
          </p>
        </div>

        <div className="card" data-reveal>
          <h2>🧑‍🦽 Who We Support</h2>
          <ul className="list">
            <li>NDIS participants of all ages</li>
            <li>Individuals living with physical or intellectual disabilities</li>
            <li>
              People living with <strong>psychosocial disability</strong> (mental
              health support needs)
            </li>
            <li>
              People involved with the <strong>justice system</strong> who are
              eligible for NDIS supports and seeking stability, routine, and
              community connection
            </li>
            <li>
              People experiencing <strong>mental health challenges</strong>,
              including those with treatment or care arrangements, who may
              benefit from practical, recovery-focused NDIS supports
            </li>
            <li>
              People seeking greater independence, social connection, and
              improved quality of life
            </li>
            <li>Families and carers looking for reliable support</li>
          </ul>

          {/* ✅ Compliance disclaimer */}
          <p className="muted" style={{ marginTop: ".5rem" }}>
            Supports are provided in line with NDIS guidelines and within the
            scope of our registration.
          </p>
        </div>
      </section>

      {/* 🤝 OUR APPROACH */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>🤝 Our Approach</h2>
        <ul className="list">
          <li>Respectful, inclusive, and culturally sensitive support</li>
          <li>Flexible services tailored to individual goals</li>
          <li>Focus on independence, confidence, and skill development</li>
          <li>Collaborative partnerships with families</li>
          <li>Consistent, professional, compassionate support workers</li>
        </ul>
      </section>

      {/* 🧠 MENTAL HEALTH & WELLBEING */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>🧠 Mental Health &amp; Wellbeing Support</h2>
        <p className="muted">
          We support participants with psychosocial disability in a calm,
          practical way — focusing on daily routines, community connection, and
          building confidence at your pace.
        </p>
        <ul className="list">
          <li>Support with daily routines and planning</li>
          <li>Encouragement to attend appointments and community activities</li>
          <li>Skill-building to improve confidence and independence</li>
          <li>Respectful support for families and carers</li>
        </ul>
      </section>

      {/* 🎯 MISSION & 🌟 VISION */}
      <section className="grid-2" style={{ marginTop: "1rem" }}>
        <div className="card" data-reveal>
          <h2>🎯 Mission</h2>
          <p className="muted">
            To empower people living with disability to live confidently,
            independently, and meaningfully through compassionate, high-quality
            support.
          </p>
        </div>

        <div className="card" data-reveal>
          <h2>🌟 Vision</h2>
          <p className="muted">
            A future where every individual is supported to thrive, fully
            participate in community life, and achieve their personal goals
            without barriers.
          </p>
        </div>
      </section>

      {/* ✅ NDIS COMMITMENT */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>✅ NDIS Commitment</h2>
        <p className="muted">
          We are committed to maintaining high standards aligned with the NDIS,
          focusing on quality, safety, accountability, and participant wellbeing.
        </p>
      </section>

      {/* 💚 WHY CHOOSE US */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>💚 Why Choose Together We Thrive</h2>
        <ul className="list">
          <li>Genuine passion for disability support</li>
          <li>Highly personalised, participant-focused services</li>
          <li>Compassionate and professional support workers</li>
          <li>Strong commitment to inclusion and empowerment</li>
          <li>Reliable, responsive, quality-driven care</li>
        </ul>
      </section>

      {/* 📍 LOCATIONS */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>📍 Service Locations</h2>
        <ul className="list">
          <li>Suite 1/1840 The Horsley Drive, Horsley Park NSW</li>
          <li>Suite 420/49 Queens Road, Five Dock NSW</li>
        </ul>
      </section>

      {/* 📝 REGISTRATION */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>📝 NDIS Registration Status</h2>
        <p className="muted">
          NDIS registration is currently pending. We will update our website
          once registration is confirmed.
        </p>
      </section>

      {/* CONTACT STRIP */}
      <section className="contact-strip" data-reveal>
        <div>
          <h2 style={{ margin: 0 }}>Let’s Thrive Together</h2>
          <p className="muted" style={{ marginTop: ".25rem" }}>
            {EMAIL} • Admin@twt.net.au • Phone: {PHONE}
          </p>
        </div>

        <div className="contact-strip-actions">
          <Link to="/contact" className="btn primary">
            Send an enquiry
          </Link>
          <Link to="/services" className="btn ghost">
            View Services
          </Link>
        </div>
      </section>
    </main>
  );
}
