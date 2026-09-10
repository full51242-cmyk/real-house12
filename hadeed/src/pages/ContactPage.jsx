import Navbar from "../navbar";
import "./ContactPage.css";

const CONTACT_ITEMS = [
  {
    label: "Phone",
    value: "123467",
    href: "tel:123467",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
      </svg>
    ),
  },
  {
    label: "Email",
    value: "temp@gmail.com",
    href: "mailto:temp@gmail.com",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
      </svg>
    ),
  },
];

export default function ContactPage({ menuOpen, setMenuOpen }) {
  return (
    <div className="page contact-page">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="contact-main">
        <section className="contact-intro">
          <p className="eyebrow">Contact</p>
          <h1>Let’s plan the next property move.</h1>
          <p>
            Tell us what you’re looking for and we’ll help map the right property, investment,
            or development path for your goals.
          </p>
        </section>

        <section className="contact-grid" aria-label="Contact details">
          {CONTACT_ITEMS.map((item) => (
            <a key={item.label} className="contact-card" href={item.href}>
              <div className="contact-icon">{item.icon}</div>
              <div className="contact-meta">
                <span className="contact-label">{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            </a>
          ))}
        </section>
      </main>
    </div>
  );
}
