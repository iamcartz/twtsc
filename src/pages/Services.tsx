import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";

import services from "../data/services.json";
import { serviceIcons } from "../components/ServiceIcons";
import { Seo } from "../components/Seo";
import useReveal from "../hooks/useReveal";
import "../styles/Services.css";

type Faq = { q: string; a: string };

type Service = {
  id: string;
  title: string;
  category: string;
  summary: string;
  bullets: string[];
  note?: string;
  icon: string;
  image: string;
  faqs?: Faq[];
};

function useServicesJsonLdSchema() {
  const schemaGraph = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "/services";

    const pageUrl = origin ? `${origin}${pathname}` : "/services";
    const siteUrl = origin || "";

    const orgId = siteUrl ? `${siteUrl}#organization` : "#organization";
    const websiteId = siteUrl ? `${siteUrl}#website` : "#website";
    const webpageId = pageUrl ? `${pageUrl}#webpage` : "#webpage";
    const breadcrumbsId = pageUrl ? `${pageUrl}#breadcrumbs` : "#breadcrumbs";

    const logoUrl = origin ? `${origin}/logo.jpeg` : "/logo.jpeg";
    const heroImg = origin
      ? `${origin}/images/services-hero.jpg`
      : "/images/services-hero.jpg";

    const breadcrumbs = [
      { name: "Home", item: origin ? `${origin}/` : "/" },
      { name: "Services", item: pageUrl },
    ];

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["Organization", "LocalBusiness"],
          "@id": orgId,
          name: "Together We Thrive Support Co",
          url: siteUrl || undefined,
          email: "info@twt.net.au",
          telephone: "+61 433 883 614",
          logo: logoUrl,
          image: heroImg,
          areaServed: {
            "@type": "AdministrativeArea",
            name: "New South Wales, Australia",
          },
          description:
            "NDIS disability support services in South Western Sydney including NDIS in-home support, NDIS personal care support, NDIS daily living support, NDIS community participation and psychosocial disability support.",
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
          name: "NDIS Support Services | Together We Thrive Support Co",
          isPartOf: { "@id": websiteId },
          about: { "@id": orgId },
          inLanguage: "en-AU",
        },
        {
          "@type": "CollectionPage",
          "@id": pageUrl ? `${pageUrl}#collection` : "#collection",
          url: pageUrl,
          name: "NDIS Support Services",
          isPartOf: { "@id": websiteId },
          about: { "@id": orgId },
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
    const id = "twt-jsonld-services";
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

export default function Services() {
  useReveal();

  // ✅ Inject JSON-LD schema safely (runtime origin)
  useServicesJsonLdSchema();

  const items = services as Service[];

  const iconFor = (key: string): ReactNode =>
    serviceIcons[key] || serviceIcons["people"];

  const isMentalHealthRelated = (s: Service) => {
    const hay = [
      s.title,
      s.category,
      s.summary,
      s.note || "",
      ...(s.bullets || []),
      ...(s.faqs ? s.faqs.map((f) => `${f.q} ${f.a}`) : []),
    ]
      .join(" ")
      .toLowerCase();

    return (
      hay.includes("mental health") ||
      hay.includes("psychosocial") ||
      hay.includes("wellbeing") ||
      hay.includes("well-being") ||
      hay.includes("anxiety") ||
      hay.includes("depression") ||
      hay.includes("trauma") ||
      hay.includes("coping")
    );
  };

  const pageTitle =
    "NDIS Support Services | Together We Thrive Support Co (South Western Sydney)";
  const pageDesc =
    "Explore our NDIS support services and disability support services in South Western Sydney: NDIS in-home support, NDIS personal care support, NDIS daily living support, NDIS community participation, and psychosocial disability support (mental health & wellbeing).";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "NDIS Support Services",
    about: "NDIS disability support services",
    isPartOf: { "@type": "WebSite", name: "Together We Thrive Support Co" },
  };

  return (
    <main className="page" id="main-content">
      <Seo
        title={pageTitle}
        description={pageDesc}
        canonicalPath="/services"
        ogImage="/og-services.jpg"
        jsonLd={jsonLd}
      />

      {/* HERO */}
      <section className="hero" aria-label="Services hero section">
        <div className="hero-content">
          <div className="hero-brand">
            <img
              className="hero-brand-logo"
              src="/logo.jpeg"
              alt="Together We Thrive Support Co logo"
            />
            <div className="hero-brand-text">
              <div className="hero-brand-title">Together We Thrive</div>
              <div className="hero-brand-subtitle">
                NDIS Support Services • Disability Support Services
              </div>
            </div>
          </div>

          <h1>NDIS support services</h1>

          <p className="lead">
            Person-centred disability support designed to be simple to
            understand and easy to access — at home and in the community across{" "}
            <strong>South Western Sydney</strong>.
          </p>

          <p className="muted" style={{ marginTop: ".5rem" }}>
            Our supports may include <strong>NDIS daily living support</strong>,{" "}
            <strong>NDIS in-home support</strong>,{" "}
            <strong>NDIS personal care support</strong>, and{" "}
            <strong>NDIS community participation</strong>, based on participant
            goals and funding.
          </p>

          <p className="muted" style={{ marginTop: ".5rem" }}>
            We also support participants with{" "}
            <strong>psychosocial disability support</strong> through calm,
            practical <strong>mental health &amp; wellbeing</strong> supports.
          </p>

          <p className="muted" style={{ marginTop: ".5rem" }}>
            <strong>Registration status:</strong> NDIS registration is currently
            pending.
          </p>
        </div>

        <div className="hero-image">
          <img
            src="/images/services-hero.jpg"
            alt="Support worker with participant in a welcoming community setting"
          />
        </div>
      </section>

      {/* SERVICES GRID */}
      <section
        className="svc-grid"
        aria-label="Our services"
        style={{ marginTop: "1.25rem" }}
      >
        {items.map((service) => {
          const mh = isMentalHealthRelated(service);

          return (
            <article className="svc-card reveal" key={service.id}>
              <div className="svc-body">
                <div className="svc-head">
                  <span className="svc-ico" aria-hidden="true">
                    <span className="svc-ico-inner">{iconFor(service.icon)}</span>
                  </span>

                  <div className="svc-head-text">
                    <div className="svc-cat">
                      {service.category || "Other"}
                      {mh && (
                        <span
                          style={{
                            marginLeft: ".5rem",
                            fontSize: ".85rem",
                            padding: ".15rem .5rem",
                            borderRadius: "999px",
                            border: "1px solid rgba(0,0,0,.12)",
                            background: "rgba(0,0,0,.04)",
                          }}
                        >
                          🧠 Psychosocial support
                        </span>
                      )}
                    </div>

                    <h2 className="svc-title">{service.title}</h2>
                    <p className="svc-summary">{service.summary}</p>
                  </div>
                </div>

                <ul className="svc-list">
                  {service.bullets.slice(0, 4).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>

                {service.note && (
                  <p className="muted" style={{ marginTop: "0.75rem" }}>
                    <strong>Note:</strong> {service.note}
                  </p>
                )}

                <div className="cta-row">
                  <Link className="btn primary" to={`/services/${service.id}`}>
                    Learn more
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* HELP STRIP */}
      <section className="note reveal" aria-label="Need help choosing a service?">
        <h2 style={{ marginTop: 0 }}>Not sure what you need?</h2>
        <p className="muted" style={{ marginTop: ".25rem" }}>
          Tell us a little about your situation and goals. We’ll help you
          understand your options and the next steps.
        </p>
        <div className="cta-row">
          <Link className="btn primary" to="/contact">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
