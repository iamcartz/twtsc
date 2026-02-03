import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <nav className="nav" aria-label="Main navigation">
        <NavLink to="/" className="brand" aria-label="Together We Thrive Support Co - Home">
          <img
            className="brand-logo"
            src="/logo.jpeg"
            alt="Together We Thrive Support Co logo"
          />
          <span className="brand-text">
            <span className="brand-title">Together We Thrive</span>
            <span className="brand-subtitle">Support Co</span>
          </span>
        </NavLink>

        <ul className="nav-list">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/who-we-support"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Who We Support
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/services"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Services
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/how-we-help"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              How We Help
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Contact
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
