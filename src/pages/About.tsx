import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { useEffect, useMemo, useState } from "react";
import "../styles/About.css";

const PHONE = "(02) 9188 3644";
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
    const heroImg = origin
      ? `${origin}/images/about-hero.png`
      : "/images/about-hero.png";

    const breadcrumbs = [
      { name: "Home", item: origin ? `${origin}/` : "/" },
      { name: "About", item: pageUrl },
    ];

    return {
      "@context": "https://schema.org",
      "@graph": [
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
            "Participant Rights",
            "Participant Safeguards",
            "NDIS Compliance",
            "Emotional Wellbeing",
            "Behavioural Understanding",
            "Trauma-informed Support",
          ],
          serviceType: [
            "Assistance with Daily Living & Personal Care",
            "Community Participation & Social Support",
            "Capacity Building & Life Skills Development",
            "Support Coordination",
            "Mental Health & Wellbeing Support",
          ],
        },
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
      "Learn about Together We Thrive Support Co, participant first disability support built on advocacy, safeguards, emotional wellbeing and NDIS aligned governance across NSW.",
  });

  const reducedMotion = usePrefersReducedMotion();
  useRevealOnScroll(!reducedMotion);
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

          <p className="muted hero-helper" style={{ marginTop: ".75rem" }}>
            <strong>Built on advocacy, accountability and participant rights</strong>
          </p>

          <p className="muted hero-helper">
            Based in <strong>South Western Sydney</strong>, expanding across{" "}
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
          to live with dignity, independence and purpose. We provide
          personalised, compassionate support with a strong focus on advocacy,
          clear communication and respect for participant rights.
        </p>

        <p className="muted">
          Our company was founded on the belief that quality disability support
          goes beyond daily care. It requires strong advocacy, ethical
          decision making and genuine respect for participant choice and
          control.
        </p>

        <p className="muted">
          Our leadership includes insight into regulatory compliance, participant
          safeguards and ethical governance within the NDIS. One of our Directors
          is an <strong>admitted lawyer in New South Wales</strong>, bringing a
          valuable perspective that strengthens our commitment to transparency,
          accountability and fair, plain language communication.
        </p>

        <p className="muted">
          This means participants and families can feel confident, informed and
          supported, not pressured or confused, at every stage.
        </p>
      </section>

      {/* 🛡 PARTICIPANT RIGHTS & SAFEGUARDS */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>🛡 Participant Rights &amp; Safeguards</h2>
        <p className="muted">
          We take participant protections seriously. This includes strong internal
          governance, accountability and support that aligns with NDIS guidelines
          and your personal choice and control.
        </p>

        <h3 style={{ marginTop: ".75rem" }}>What this means for you</h3>
        <ul className="list">
          <li>A provider that understands participant rights and safeguards</li>
          <li>Clear, fair service agreements explained in plain language</li>
          <li>
            Strong oversight of policies, incident management and complaints
            handling
          </li>
          <li>Ethical decision making at every level of care</li>
          <li>Support aligned with NDIS guidelines and participant choice</li>
        </ul>

        <p className="muted" style={{ marginTop: ".5rem" }}>
          Want more detail? Read our{" "}
          <Link to="/participant-safeguards">Participant Safeguards</Link> page.
        </p>
      </section>

      {/* 💚 CORE VALUES */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>💚 Our Core Values</h2>
        <ul className="list">
          <li>
            <strong>Respect:</strong> We listen, understand and support your choices.
          </li>
          <li>
            <strong>Dignity:</strong> We provide care that protects privacy and builds confidence.
          </li>
          <li>
            <strong>Independence:</strong> We focus on skills, routines and supports that help you do more.
          </li>
          <li>
            <strong>Inclusion:</strong> We help you stay connected to community, culture and relationships.
          </li>
          <li>
            <strong>Safety &amp; Quality:</strong> We follow NDIS aligned standards and deliver consistent, professional support.
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
            Services can be customised based on participant plans and support requirements.
          </p>
        </div>

        <div className="card" data-reveal>
          <h2>🧑‍🦽 Who We Support</h2>
          <ul className="list">
            <li>NDIS participants of all ages</li>
            <li>Individuals living with physical or intellectual disabilities</li>
            <li>
              People living with <strong>psychosocial disability</strong>, mental health support needs
            </li>
            <li>
              People involved with the <strong>justice system</strong> who are eligible for NDIS supports and seeking stability, routine and community connection
            </li>
            <li>
              People experiencing <strong>mental health challenges</strong>, including those with treatment or care arrangements, who may benefit from practical, recovery focused NDIS supports
            </li>
            <li>
              People seeking greater independence, social connection and improved quality of life
            </li>
            <li>Families and carers looking for reliable support</li>
          </ul>

          <p className="muted" style={{ marginTop: ".5rem" }}>
            Supports are provided in line with NDIS guidelines and within the scope of our registration.
          </p>
        </div>
      </section>

      {/* 🤝 OUR APPROACH */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>🤝 Our Approach</h2>

        <p className="muted">
          At the heart of our service is a genuine understanding that every
          person’s needs, behaviours and goals are shaped by their experiences,
          emotions and environment.
        </p>

        <p className="muted">
          Our supports are guided by a deep understanding of human behaviour,
          emotional wellbeing and community connection. This shapes how we plan
          supports with empathy, patience, consistency and respect for each
          person’s journey.
        </p>

        <p className="muted">
          Our leadership includes professional training in{" "}
          <strong>psychology and community services</strong>, influencing our day
          to day approach, especially around emotional safety, communication and
          responding calmly in challenging moments.
        </p>

        <p className="muted">
          You may not notice it straight away, but it is often the small moments
          that make the difference, how someone is spoken to, how behaviour is
          interpreted, or how emotional needs are recognised early.
        </p>

        <p className="muted">
          For families and support coordinators, this provides added confidence
          that emotional wellbeing, behavioural understanding and ethical care
          are central to how supports are planned and delivered.
        </p>

        <ul className="list" style={{ marginTop: ".5rem" }}>
          <li>Respectful, inclusive and culturally sensitive support</li>
          <li>Flexible services tailored to individual goals</li>
          <li>Focus on independence, confidence and skill development</li>
          <li>Collaborative partnerships with families</li>
          <li>Consistent, professional, compassionate support workers</li>
        </ul>
      </section>

      {/* 🧠 MENTAL HEALTH & WELLBEING */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>🧠 Mental Health &amp; Wellbeing Support</h2>
        <p className="muted">
          We support participants with psychosocial disability in a calm,
          practical way, focusing on daily routines, community connection and
          building confidence at your pace.
        </p>
        <ul className="list">
          <li>Support with daily routines and planning</li>
          <li>Encouragement to attend appointments and community activities</li>
          <li>Skill building to improve confidence and independence</li>
          <li>Respectful support for families and carers</li>
        </ul>
      </section>

      {/* 🎯 MISSION & 🌟 VISION */}
      <section className="grid-2" style={{ marginTop: "1rem" }}>
        <div className="card" data-reveal>
          <h2>🎯 Mission</h2>
          <p className="muted">
            To empower people living with disability to live confidently,
            independently and meaningfully through compassionate, high quality
            support.
          </p>
        </div>

        <div className="card" data-reveal>
          <h2>🌟 Vision</h2>
          <p className="muted">
            A future where every individual is supported to thrive, fully
            participate in community life and achieve their personal goals
            without barriers.
          </p>
        </div>
      </section>

      {/* ✅ NDIS COMMITMENT */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>✅ NDIS Commitment</h2>
        <p className="muted">
          We are committed to maintaining high standards aligned with the NDIS,
          focusing on safety, quality, accountability and participant wellbeing.
        </p>
        <p className="muted" style={{ marginTop: ".5rem" }}>
          Our governance approach supports clear service agreements, fair
          communication and strong processes for incident management and
          complaints handling, so participants and families feel confident,
          informed and supported.
        </p>
      </section>

      {/* 💚 WHY CHOOSE US */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>💚 Why Choose Together We Thrive</h2>

        <p className="muted" style={{ marginTop: ".35rem" }}>
          Our services are guided by leadership with a strong understanding of
          participant rights, safeguards and the NDIS framework, including legal
          and regulatory obligations. This means clearer communication, stronger
          protections and support that always puts participants first.
        </p>

        <ul className="list" style={{ marginTop: ".5rem" }}>
          <li>Genuine passion for disability support</li>
          <li>Highly personalised, participant focused services</li>
          <li>Compassionate and professional support workers</li>
          <li>Clear communication and plain language service agreements</li>
          <li>Strong focus on safeguards, accountability and ethical care</li>
          <li>
            Support shaped by emotional wellbeing, communication and respectful
            behaviour support
          </li>
          <li>Reliable, responsive, quality driven support</li>
        </ul>
      </section>

      {/* 📍 LOCATIONS */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>📍 Administration Office Locations</h2>
        <ul className="list">
          <li>Suite 1/1840 The Horsley Drive, Horsley Park NSW</li>
          <li>Suite 420/49 Queens Road, Five Dock NSW</li>
        </ul>
      </section>

      {/* 📝 REGISTRATION */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>📝 NDIS Registration Status</h2>
        <p className="muted">
          NDIS registration is currently pending. We will update our website once
          registration is confirmed.
        </p>
      </section>

      {/* ❓ FAQs */}
      <section className="card" style={{ marginTop: "1rem" }} data-reveal>
        <h2>❓ Frequently Asked Questions</h2>

        <div className="faq">
          <h3 style={{ marginBottom: ".35rem" }}>
            How do you ensure participant rights and safeguards are protected?
          </h3>
          <p className="muted" style={{ marginTop: 0 }}>
            We take governance and participant protections seriously. Our
            leadership team includes expertise in regulatory compliance and
            advocacy awareness, helping ensure our policies, service agreements
            and internal processes are aligned with NDIS requirements and best
            practice standards.
          </p>
          <p className="muted">
            This gives participants and families added confidence that your
            rights, choices and wellbeing are always respected.
          </p>
        </div>

        <div className="faq" style={{ marginTop: ".85rem" }}>
          <h3 style={{ marginBottom: ".35rem" }}>
            Where can I read about your safeguards and complaints process?
          </h3>
          <p className="muted" style={{ marginTop: 0 }}>
            You can read more on our{" "}
            <Link to="/participant-safeguards">Participant Safeguards</Link> page.
          </p>
        </div>
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