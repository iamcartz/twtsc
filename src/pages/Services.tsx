import { useSeo } from "../hooks/useSeo";

export default function Services() {
  useSeo({
    title: "Services | Together We Thrive",
    description:
      "NDIS services: social and community participation, in-home supports, and personal care.",
  });

  return (
    <section className="page">
      <header className="page-header">
        <h1>Our Services</h1>
        <p className="muted">
          Clear, respectful support tailored to each person.
        </p>
      </header>

      <div className="cards">
        <article className="service-card">
          <img
            src="/images/community.jpg"
            alt="Two women enjoying coffee outdoors, smiling and talking together"
          />
          <div className="service-body">
            <h2>Social and Community Participation</h2>
            <p>
              Support to go out, join activities, build confidence, and stay
              connected in the community.
            </p>
          </div>
        </article>

        <article className="service-card">
          <img
            src="/images/inhome.jpg"
            alt="Support worker assisting an older man using a walker at home"
          />
          <div className="service-body">
            <h2>In-Home Supports</h2>
            <p>
              Help with daily routines, household tasks, meal preparation, and
              building independent living skills.
            </p>
          </div>
        </article>

        <article className="service-card">
            <img
                src="/images/personal-care.jpg"
                alt="Support worker assisting an older man with personal care tasks"
            />
          <div className="service-body">
            <h2>Personal Care</h2>
            <p>
              Respectful support with hygiene, dressing, grooming, and daily
              self-care — delivered with dignity and privacy.
            </p>
          </div>
        </article>
      </div>

      <div className="note">
        <h3>Future services</h3>
        <p className="muted">
          As we grow, we aim to introduce day programs and group-based
          activities. These are not yet available.
        </p>
      </div>
    </section>
  );
}
