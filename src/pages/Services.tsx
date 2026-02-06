import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import services from "../data/services.json";
import { serviceIcons } from "../components/ServiceIcons";
import { Seo } from "../components/Seo";

type Faq = { q: string; a: string };

type Service = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  note?: string;
  icon: string;
  image: string;
  faqs?: Faq[];
};

type CategoryKey =
  | "All"
  | "Personal care"
  | "In-home support"
  | "Community participation"
  | "Transport"
  | "Capacity building"
  | "Other";

function inferCategory(s: Service): CategoryKey {
  const hay = [s.title, s.summary, s.note ?? "", ...(s.bullets ?? [])]
    .join(" ")
    .toLowerCase();

  if (hay.includes("personal care") || hay.includes("shower") || hay.includes("hygiene")) return "Personal care";
  if (hay.includes("in-home") || hay.includes("in home") || hay.includes("home support") || hay.includes("daily living"))
    return "In-home support";
  if (hay.includes("community") || hay.includes("social") || hay.includes("participation") || hay.includes("group"))
    return "Community participation";
  if (hay.includes("transport") || hay.includes("travel") || hay.includes("appointment") || hay.includes("driving"))
    return "Transport";
  if (
    hay.includes("capacity") ||
    hay.includes("skill") ||
    hay.includes("build") ||
    hay.includes("confidence") ||
    hay.includes("independence")
  )
    return "Capacity building";

  return "Other";
}

export default function Services() {
  const items = services as Service[];

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey>("All");

  // Pagination
  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Skeleton loading (simulate quick loading, avoids “dead page” feel)
  const [loading, setLoading] = useState(true);

  // Live region for results count (accessibility)
  const liveRef = useRef<HTMLDivElement | null>(null);

  const iconFor = (key: string): ReactNode => serviceIcons[key] || serviceIcons["people"];

  // ✅ Always start at top on first visit
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // ✅ Skeleton timing (fast)
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(t);
  }, []);

  // Build categories list
  const categories = useMemo(() => {
    const set = new Set<CategoryKey>();
    items.forEach((s) => set.add(inferCategory(s)));
    const ordered: CategoryKey[] = ["All", "Personal care", "In-home support", "Community participation", "Transport", "Capacity building", "Other"];
    const available = ordered.filter((k) => k === "All" || set.has(k));
    return available;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((s) => {
      const cat = inferCategory(s);
      if (category !== "All" && cat !== category) return false;

      if (!q) return true;

      const hay = [s.title, s.summary, s.note ?? "", ...(s.bullets ?? [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, category]);

  // Reset pagination when filters/search change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category]);

  // ✅ When filter/search changes, scroll to top of page content for “default view”
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [query, category]);

  // Announce results count
  useEffect(() => {
    if (!liveRef.current) return;
    liveRef.current.textContent = `${filtered.length} service${filtered.length === 1 ? "" : "s"} shown.`;
  }, [filtered.length]);

  const shown = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const pageTitle = "Services | Together We Thrive Support Co";
  const pageDesc =
    "Explore our NDIS supports: personal care, in-home support, social & community participation, transport, and capacity building.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Services",
    about: "NDIS supports and disability services",
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

      {/* Hidden live region */}
      <div ref={liveRef} className="sr-only" aria-live="polite" />

      {/* HERO */}
      <section className="hero" aria-label="Services hero section">
        <div className="hero-content">
          <div className="hero-brand">
            <img className="hero-brand-logo" src="/logo.jpeg" alt="Together We Thrive Support Co logo" />
            <div className="hero-brand-text">
              <div className="hero-brand-title">Together We Thrive</div>
              <div className="hero-brand-subtitle">NDIS Disability Support</div>
            </div>
          </div>

          <h1>Our Services</h1>
          <p className="lead">
            Simple, caring supports designed to be easy to understand and access—at home and in the community.
          </p>

          <p className="muted" style={{ marginTop: ".5rem" }}>
            <strong>Registration status:</strong> NDIS registration is currently pending.
          </p>

          <div className="cta-row">
            <Link className="btn primary" to="/contact">Enquire</Link>
            <Link className="btn ghost" to="/about">About Us</Link>
          </div>

          {/* Search */}
          <div style={{ marginTop: "1rem" }}>
            <label style={{ fontWeight: 900 }}>
              Search services
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. personal care, transport, community…"
                aria-label="Search services"
              />
            </label>
          </div>

          {/* Category chips */}
          <div className="pill-row" aria-label="Filter services by category">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={c === category ? "pill pill-active" : "pill"}
                onClick={() => setCategory(c)}
                aria-pressed={c === category}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/images/services-hero.jpg"
            alt="Support worker with participant in a welcoming community setting"
            loading="eager"
          />
        </div>
      </section>

      {/* GRID */}
      <section className="cards" aria-label="Our services" style={{ marginTop: "1.25rem" }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <article className="service-card" key={`sk-${i}`} aria-hidden="true">
              <div className="service-img skeleton" />
              <div className="service-body">
                <div className="skeleton-line" style={{ width: "55%" }} />
                <div className="skeleton-line" style={{ width: "90%" }} />
                <div className="skeleton-line" style={{ width: "80%" }} />
                <div className="skeleton-line" style={{ width: "70%" }} />
                <div className="cta-row" style={{ marginTop: "1rem" }}>
                  <div className="skeleton-pill" />
                  <div className="skeleton-pill" />
                </div>
              </div>
            </article>
          ))
        ) : shown.length === 0 ? (
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <h2 style={{ marginTop: 0 }}>No services found</h2>
            <p className="muted" style={{ marginTop: ".25rem" }}>
              Try a different search term or clear filters.
            </p>
            <div className="cta-row" style={{ marginTop: "1rem" }}>
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          shown.map((service) => (
            <article className="service-card" key={service.id}>
              {/* Full-width image + hover zoom */}
              <div className="service-imgwrap" aria-hidden="true">
                <img className="service-imgfull" src={service.image} alt="" loading="lazy" />
              </div>

              <div className="service-body">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "rgba(15, 118, 110, 0.10)",
                      border: "1px solid rgba(15, 118, 110, 0.18)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "0 0 44px",
                    }}
                  >
                    <span style={{ width: 22, height: 22, display: "inline-flex" }}>
                      {iconFor(service.icon)}
                    </span>
                  </span>

                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{service.title}</h2>
                    <p className="muted" style={{ margin: ".35rem 0 0" }}>{service.summary}</p>
                  </div>
                </div>

                <ul className="list">
                  {service.bullets.slice(0, 4).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>

                {service.note ? (
                  <p className="muted" style={{ marginTop: "0.75rem" }}>
                    <strong>Note:</strong> {service.note}
                  </p>
                ) : null}

                <div className="cta-row" style={{ marginTop: "1rem" }}>
                  <Link className="btn primary" to="/contact" aria-label={`Enquire about ${service.title}`}>
                    Enquire
                  </Link>
                  <Link className="btn ghost" to={`/services/${service.id}`} aria-label={`Learn more about ${service.title}`}>
                    Learn more
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Pagination */}
      {!loading && filtered.length > 0 ? (
        <div className="card" style={{ marginTop: "1rem" }}>
          <p className="muted" style={{ margin: 0 }}>
            Showing <strong>{Math.min(visibleCount, filtered.length)}</strong> of{" "}
            <strong>{filtered.length}</strong> services.
          </p>

          <div className="cta-row" style={{ marginTop: "0.85rem" }}>
            {hasMore ? (
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  setVisibleCount((v) => Math.min(filtered.length, v + PAGE_SIZE));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Load more
              </button>
            ) : (
              <button
                type="button"
                className="btn ghost"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Back to top
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* HELP STRIP */}
      <section className="note" aria-label="Need help choosing a service?">
        <h2 style={{ marginTop: 0 }}>Not sure what you need?</h2>
        <p className="muted" style={{ marginTop: ".25rem" }}>
          Tell us a little about your situation and goals. We’ll help you understand your options and the next steps.
        </p>
        <div className="cta-row">
          <Link className="btn primary" to="/contact">Contact Us</Link>
          <Link className="btn ghost" to="/about">About Us</Link>
        </div>
      </section>
    </main>
  );
}
