import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import services from "../data/services.json";

type Service = {
  id: string;
  title: string;
  summary?: string;
};

/* Friendly icons */
function IconCare() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-7-4.6-9.5-9C.8 8.7 3 6 6 6c1.8 0 3 1 4 2 1-1 2.2-2 4-2 3 0 5.2 2.7 3.5 6-2.5 4.4-9.5 9-9.5 9z" />
    </svg>
  );
}
function IconHome() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z" />
    </svg>
  );
}
function IconPeople() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 11a3 3 0 1 0-2.999-3A3 3 0 0 0 16 11zM8 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm8 2c-2.1 0-4 .9-4 2v3h8v-3c0-1.1-1.9-2-4-2zM8 13c-2.1 0-4 .9-4 2v3h7v-3c0-1.1-1.9-2-3-2z" />
    </svg>
  );
}
function IconCar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 11l1.2-3.6A2 2 0 0 1 8.1 6h7.8a2 2 0 0 1 1.9 1.4L19 11v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7zm3.2-3L7.6 10h8.8l-.6-2a.8.8 0 0 0-.8-.6H9a.8.8 0 0 0-.8.6zM7.5 15a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zm9 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z" />
    </svg>
  );
}
function IconPlan() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2zm0 4h10V5H7v2zm2 4h6v2H9v-2zm0 4h6v2H9v-2z" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l3 6 6 .9-4.5 4.4 1.1 6.2L12 16.9 6.4 19.5l1.1-6.2L3 8.9 9 8l3-6z" />
    </svg>
  );
}

function ServiceIcon({ id }: { id: string }) {
  const k = id.toLowerCase();
  if (k.includes("home")) return <IconHome />;
  if (k.includes("community") || k.includes("social") || k.includes("participation")) return <IconPeople />;
  if (k.includes("transport")) return <IconCar />;
  if (k.includes("plan") || k.includes("coord")) return <IconPlan />;
  if (k.includes("skill") || k.includes("capacity")) return <IconStar />;
  return <IconCare />;
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [servicesOpen, setServicesOpen] = useState(false);

  const liRef = useRef<HTMLLIElement | null>(null);
  const itemRefs = useRef<HTMLButtonElement[]>([]);

  const items = (services as Service[]) ?? [];
  const servicesActive = location.pathname.startsWith("/services");

  const { colA, colB } = useMemo(() => {
    const half = Math.ceil(items.length / 2);
    return { colA: items.slice(0, half), colB: items.slice(half) };
  }, [items]);

  const closeMenu = () => setServicesOpen(false);

  // ✅ Close on route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  // ✅ Click outside closes
  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!servicesOpen) return;
      const t = e.target as Node;
      if (liRef.current && !liRef.current.contains(t)) closeMenu();
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [servicesOpen]);

  // ✅ Focus first item when opened
  useEffect(() => {
    if (!servicesOpen) return;
    window.requestAnimationFrame(() => {
      itemRefs.current[0]?.focus();
    });
  }, [servicesOpen]);

  // ✅ Navigate on POINTER DOWN so it still fires even if menu closes
  function goOnPointerDown(e: React.PointerEvent, to: string) {
    // Prevent extra focus/selection, keep event clean
    e.preventDefault();
    e.stopPropagation();

    // Navigate first; route-change effect will also close the menu
    navigate(to);

    // Close immediately for instant UI feedback
    closeMenu();
  }

  // ✅ Keyboard navigation inside mega menu
  function onMegaKeyDown(e: React.KeyboardEvent) {
    if (!servicesOpen) return;

    const allowed = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End", "Escape", "Tab"];
    if (!allowed.includes(e.key)) return;

    const list = itemRefs.current.filter(Boolean);
    const active = document.activeElement as HTMLElement | null;
    const idx = list.findIndex((el) => el === active);

    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      (liRef.current?.querySelector(".nav-mega-trigger") as HTMLButtonElement | null)?.focus();
      return;
    }

    // Let Tab behave normally
    if (e.key === "Tab") return;

    e.preventDefault();

    const cols = 2;
    const rows = Math.ceil(list.length / cols);
    const row = idx >= 0 ? Math.floor(idx / cols) : 0;
    const col = idx >= 0 ? idx % cols : 0;

    const toIndex = (r: number, c: number) => r * cols + c;

    let next = idx >= 0 ? idx : 0;

    switch (e.key) {
      case "ArrowDown": {
        const r = Math.min(rows - 1, row + 1);
        next = Math.min(list.length - 1, toIndex(r, col));
        break;
      }
      case "ArrowUp": {
        const r = Math.max(0, row - 1);
        next = Math.min(list.length - 1, toIndex(r, col));
        break;
      }
      case "ArrowRight":
        next = Math.min(list.length - 1, (idx >= 0 ? idx + 1 : 0));
        break;
      case "ArrowLeft":
        next = Math.max(0, (idx >= 0 ? idx - 1 : 0));
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = list.length - 1;
        break;
    }

    list[next]?.focus();
  }

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* Top contact bar */}
      <div className="topbar" role="region" aria-label="Contact information">
        <div className="topbar-inner">
          <div className="topbar-left">
            <a className="topbar-link" href="tel:0400000000">
              <span className="topbar-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.36 2.3.55 3.6.55a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.1 21 3 13.9 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.2 2.5.6 3.6a1 1 0 0 1-.25 1L6.6 10.8z" />
                </svg>
              </span>
              <span>0400 000 000</span>
            </a>

            <a className="topbar-link" href="mailto:info@togetherwethrive.com.au">
              <span className="topbar-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </span>
              <span>info@togetherwethrive.com.au</span>
            </a>
          </div>

          <div className="topbar-right">
            <div className="topbar-socials" aria-label="Social media links">
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.5V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
                </svg>
              </a>
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.3 2.3.5.6.2 1 .5 1.5 1 .5.5.8.9 1 1.5.2.5.4 1.2.5 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.9-.5 2.3-.2.6-.5 1-.9 1.5-.5.5-.9.8-1.5 1-.5.2-1.2.4-2.3.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.3-2.3-.5-.6-.2-1-.5-1.5-1-.5-.5-.8-.9-1-1.5-.2-.5-.4-1.2-.5-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.9.5-2.3.2-.6.5-1 .9-1.5.5-.5.9-.8 1.5-1 .5-.2 1.2-.4 2.3-.5C8.4 2.2 8.8 2.2 12 2.2z" />
                </svg>
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3V9zm7 0h3.8v1.6h.1c.5-.9 1.7-1.9 3.6-1.9 3.9 0 4.6 2.6 4.6 5.9V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4V9z" />
                </svg>
              </a>
            </div>

            <Link className="topbar-cta" to="/contact">
              Enquire
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="nav" aria-label="Main navigation">
        <NavLink to="/" className="brand" aria-label="Together We Thrive Support Co - Home">
          <img className="brand-logo" src="/logo.jpeg" alt="Together We Thrive Support Co logo" />
          <span className="brand-text">
            <span className="brand-title">Together We Thrive</span>
            <span className="brand-subtitle">Support Co</span>
          </span>
        </NavLink>

        <ul className="nav-list">
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} end>
              Home
            </NavLink>
          </li>

          <li>
            <NavLink to="/about" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              About Us
            </NavLink>
          </li>

          <li className={`nav-mega ${servicesOpen ? "is-open" : ""}`} ref={liRef}>
            <button
              type="button"
              className={servicesActive ? "nav-link active nav-mega-trigger" : "nav-link nav-mega-trigger"}
              aria-haspopup="true"
              aria-expanded={servicesOpen}
              onClick={(e) => {
                e.stopPropagation();
                setServicesOpen((v) => !v);
              }}
            >
              Services <span className="nav-mega-caret" aria-hidden="true">▾</span>
            </button>

            <div className="nav-mega-menu" role="menu" aria-label="Services menu" onKeyDown={onMegaKeyDown}>
              <div className="nav-mega-main">
                <div className="nav-mega-cols">
                  {[colA, colB].map((col, colIndex) => (
                    <div className="nav-mega-col" key={colIndex}>
                      {col.map((s, i) => {
                        const globalIndex = colIndex === 0 ? i * 2 : i * 2 + 1;

                        return (
                          <button
                            key={s.id}
                            type="button"
                            className="nav-mega-item"
                            role="menuitem"
                            onPointerDown={(e) => goOnPointerDown(e, `/services/${s.id}`)}
                            ref={(el) => {
                              if (el) itemRefs.current[globalIndex] = el;
                            }}
                          >
                            <span className="nav-mega-ico" aria-hidden="true">
                              <ServiceIcon id={s.id} />
                            </span>
                            <span className="nav-mega-text">
                              <span className="nav-mega-title">{s.title}</span>
                              {s.summary ? <span className="nav-mega-desc">{s.summary}</span> : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="nav-mega-bottom">
                  <button
                    type="button"
                    className="nav-mega-all"
                    onPointerDown={(e) => goOnPointerDown(e, "/services")}
                  >
                    View all services →
                  </button>
                </div>
              </div>

              <aside className="nav-mega-side" aria-label="Helpful links">
                <h3 className="nav-mega-side-title">Helpful Links</h3>
                <ul className="nav-mega-side-list">
                  <li>
                    <button type="button" onPointerDown={(e) => goOnPointerDown(e, "/how-we-help")}>
                      How We Help
                    </button>
                  </li>
                  <li>
                    <button type="button" onPointerDown={(e) => goOnPointerDown(e, "/about")}>
                      About Us
                    </button>
                  </li>
                  <li>
                    <button type="button" onPointerDown={(e) => goOnPointerDown(e, "/contact")}>
                      Enquire / Contact
                    </button>
                  </li>
                </ul>
                <p className="nav-mega-side-note">NDIS registration pending.</p>
              </aside>
            </div>
          </li>

          <li>
            <NavLink to="/how-we-help" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              How We Help
            </NavLink>
          </li>

          <li>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Contact
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
