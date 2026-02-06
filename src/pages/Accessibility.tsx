import { useSeo } from "../hooks/useSeo";

export default function Accessibility() {
  useSeo({
    title: "Accessibility Statement | Together We Thrive",
    description: "Accessibility statement for Together We Thrive Support Co website.",
  });

  return (
    <section className="page">
      <header className="page-header">
        <h1>Accessibility Statement</h1>
        <p className="muted">Last updated: {new Date().toLocaleDateString()}</p>
      </header>

      <div className="card">
        <h2>Our commitment</h2>
        <p className="muted">
          We want our website to be simple, clear, and usable for people with
          disability, including people with cognitive and intellectual disabilities.
        </p>

        <h2>Accessibility features</h2>
        <ul className="list">
          <li>Keyboard-friendly navigation and visible focus styles.</li>
          <li>Skip-to-content link for easier navigation.</li>
          <li>Clear headings, readable spacing, and consistent layout.</li>
          <li>Form validation messages that can be read by screen readers.</li>
        </ul>

        <h2>Need help?</h2>
        <p className="muted">
          If you have trouble using this website, please contact us and we will
          help you.
        </p>

        <p className="muted">
          Email:{" "}
          <a href="mailto:info@twt.com.au">info@twt.com.au</a>
          <br />
          Phone: <a href="tel:0400000000">0400 000 000</a>
        </p>
      </div>
    </section>
  );
}
