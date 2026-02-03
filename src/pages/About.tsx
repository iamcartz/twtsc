import { useSeo } from "../hooks/useSeo";

export default function About() {
  useSeo({
    title: "Who We Support | Together We Thrive",
    description:
      "We support NDIS participants with intellectual disabilities and cognitive impairments, plus families and coordinators.",
  });

  return (
    <section className="page">
      <header className="page-header">
        <h1>Who We Support</h1>
        <p className="muted">
          We keep communication simple, respectful, and clear.
        </p>
      </header>

      <div className="card">
        <h2>We support people who need</h2>
        <ul className="list">
          <li>Support at home</li>
          <li>Support to go into the community</li>
          <li>Respectful personal care</li>
          <li>Clear communication and consistent routines</li>
        </ul>
      </div>

      <div className="card">
        <h2>We also work with</h2>
        <ul className="list">
          <li>Families and carers</li>
          <li>Support coordinators</li>
          <li>Plan managers</li>
        </ul>
      </div>
    </section>
  );
}
