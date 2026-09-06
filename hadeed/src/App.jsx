import { useEffect, useRef, useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadProperty from "./pages/UploadProperty";
import AIDesignGenerator from "./pages/AIDesignGenerator";
import UserProfile from "./components/UserProfile";
import ChatWidget from "./components/chatwidget";
import { propertyAPI } from "./utils/api";

const STATS = [
  { value: "18", unit: "yrs", label: "Building in this city" },
  { value: "240", unit: "+", label: "Properties delivered" },
  { value: "6.2", unit: "M sqft", label: "Under management" },
  { value: "97", unit: "%", label: "Client retention" },
];

const SERVICES = [
  {
    mark: "01",
    title: "Residential Development",
    body: "Ground-up housing and renovation, from single villas to full community master plans.",
  },
  {
    mark: "02",
    title: "Commercial Leasing",
    body: "Office, retail and mixed-use space matched to tenants who plan to stay a decade, not a lease term.",
  },
  {
    mark: "03",
    title: "Investment Advisory",
    body: "Site selection, feasibility and returns modelling for buyers who want the numbers before the tour.",
  },
  {
    mark: "04",
    title: "Asset Management",
    body: "Ongoing operations, maintenance and tenant relations for owners who'd rather not do it themselves.",
  },
];

const DEFAULT_PROPERTIES = [
  {
    id: "default-1",
    name: "Ridge House",
    type: "Residential",
    location: "Clifton, Karachi",
    price: "PKR 5.6 Cr",
    bedrooms: 5,
    bathrooms: 4,
    area: "4200 sqft",
    description: "Luxury family villa with rooftop lounge and landscaped garden.",
    phone: "+92 300 1234567",
    email: "ridgehouse@example.com",
    photos: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "default-2",
    name: "The Founding Yard",
    type: "Commercial",
    location: "Downtown, Karachi",
    price: "PKR 9.2 Cr",
    bedrooms: null,
    bathrooms: null,
    area: "6100 sqft",
    description: "Mixed-use commercial block designed for office and retail demand.",
    phone: "+92 321 7654321",
    email: "foundingyard@example.com",
    photos: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

const PROCESS = [
  { step: "Brief", body: "We take your budget, timeline and non-negotiables in a single sitting." },
  { step: "Shortlist", body: "Three to five properties that actually match, not thirty that vaguely do." },
  { step: "Walkthrough", body: "Site visits with a structural and legal read on each option." },
  { step: "Close", body: "Paperwork, transfer and handover managed end to end." },
];

function Skyline({ progress }) {
  const towers = [
    { d: "M20 400 L20 220 L70 220 L70 180 L110 180 L110 400 Z", len: 900 },
    { d: "M130 400 L130 140 L190 140 L190 400 Z", len: 780 },
    { d: "M210 400 L210 260 L240 260 L240 200 L280 200 L280 400 Z", len: 760 },
    { d: "M300 400 L300 100 L345 100 L345 60 L360 60 L360 400 Z", len: 1000 },
    { d: "M380 400 L380 240 L430 240 L430 400 Z", len: 560 },
  ];
  return (
    <svg
      className="skyline"
      viewBox="0 0 460 410"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line x1="0" y1="400" x2="460" y2="400" stroke="var(--line-dark)" strokeWidth="1" />
      {towers.map((t, i) => (
        <path
          key={i}
          d={t.d}
          stroke="var(--brass)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeDasharray={t.len}
          strokeDashoffset={t.len * (1 - progress)}
          style={{ transition: "stroke-dashoffset 0.2s linear" }}
        />
      ))}
    </svg>
  );
}

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0.15);
  const [menuOpen, setMenuOpen] = useState(false);
  const [properties, setProperties] = useState(DEFAULT_PROPERTIES);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const h = heroRef.current;
      if (!h) return;
      const rect = h.getBoundingClientRect();
      const total = rect.height;
      const seen = Math.min(Math.max(-rect.top + window.innerHeight * 0.3, 0), total);
      setScrollProgress(Math.min(0.15 + seen / total, 1));
    };

    const loadProperties = async () => {
      try {
        const response = await propertyAPI.list();
        const listing = response?.properties?.length ? response.properties : DEFAULT_PROPERTIES;
        setProperties(listing);
      } catch (error) {
        setProperties(DEFAULT_PROPERTIES);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    loadProperties();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={
          <div className="page">
            <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

            <main id="top">
              <section className="hero" ref={heroRef}>
                <div className="hero-copy">
                  <p className="eyebrow">Real estate, built like structure matters</p>
                  <h1>
                    We develop ground you can
                    <em> stand on</em> for thirty years.
                  </h1>
                  <p className="hero-sub">
                    Real House plans, builds and manages residential and commercial property across
                    Karachi — from the first survey stake to the tenant's first year.
                  </p>
                  <div className="hero-actions">
                    <a className="btn btn-primary" href="#portfolio">
                      View the portfolio
                    </a>
                    <a className="btn btn-ghost" href="#contact">
                      Start a project
                    </a>
                  </div>
                </div>
                <div className="hero-visual">
                  <div className="animated-image-container">
                    <img
                      src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&h=900&q=85"
                      alt="Modern commercial interior with glass partitions and polished concrete floors"
                      className="animated-image hero-image"
                    />
                    <div className="image-overlay" />
                    <div className="floating-card">
                      <div className="card-icon">🏢</div>
                      <div className="card-text">Premium Properties</div>
                    </div>
                  </div>
                  <Skyline progress={scrollProgress} />
                </div>
              </section>

              <section className="stats">
                {STATS.map((s) => (
                  <div className="stat" key={s.label}>
                    <p className="stat-value">
                      {s.value}
                      <span>{s.unit}</span>
                    </p>
                    <p className="stat-label">{s.label}</p>
                  </div>
                ))}
              </section>

              <section className="approach" id="approach">
                <div className="section-head">
                  <p className="eyebrow">Approach</p>
                  <h2>Named after iron, because a building is only as good as its frame</h2>
                </div>
                <p className="approach-body">
                  Every Real House project starts underground — soil reports, load calculations,
                  drainage — before a single render is shown to a client. We'd rather lose a
                  week to the site survey than lose a wall to the water table five years in.
                  The result is property that holds its value because it was built to hold
                  its weight.
                </p>
              </section>

              <section className="services" id="services">
                <div className="section-head">
                  <p className="eyebrow">Services</p>
                  <h2>What we take on</h2>
                </div>
                <div className="services-grid">
                  {SERVICES.map((s) => (
                    <div className="service-card" key={s.mark}>
                      <span className="service-mark">{s.mark}</span>
                      <h3>{s.title}</h3>
                      <p>{s.body}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="portfolio" id="portfolio">
                <div className="section-head">
                  <p className="eyebrow">Portfolio</p>
                  <h2>Currently available</h2>
                </div>
                <div className="portfolio-grid">
                  {properties.map((p, index) => {
                    const primaryPhoto = p.photos?.[0];
                    return (
                      <article className="property-card" key={p.id || `${p.name}-${index}`}>
                        <div className="property-plot">
                          {primaryPhoto ? (
                            <img
                              src={primaryPhoto}
                              alt={p.name}
                              className="property-image"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                            />
                          ) : (
                            <svg viewBox="0 0 100 80" className="building-icon">
                              <path d="M10 70 L10 30 L30 10 L50 30 L50 70 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                              <path d="M30 10 L30 5 L70 5 L70 70" fill="none" stroke="currentColor" strokeWidth="2" />
                              <path d="M20 40 L20 50" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M40 40 L40 50" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M60 20 L60 30" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M60 40 L60 50" stroke="currentColor" strokeWidth="1.5" />
                              <rect x="25" y="55" width="10" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
                              <rect x="55" y="55" width="10" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                          )}
                        </div>
                        <div className="property-info">
                          <h3>{p.name}</h3>
                          <p className="property-type">{p.type}</p>
                          <p className="property-location">{p.location}</p>
                          <p className="property-price">{p.price}</p>
                          {p.bedrooms || p.bathrooms ? (
                            <p className="property-meta">
                              {p.bedrooms ? `${p.bedrooms} bed` : ""}
                              {p.bedrooms && p.bathrooms ? " • " : ""}
                              {p.bathrooms ? `${p.bathrooms} bath` : ""}
                            </p>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="process">
                <div className="section-head">
                  <p className="eyebrow">How it runs</p>
                  <h2>Four steps, in this order</h2>
                </div>
                <ol className="process-list">
                  {PROCESS.map((p, i) => (
                    <li key={p.step}>
                      <span className="process-index">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3>{p.step}</h3>
                        <p>{p.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </main>

            <footer className="footer">
              <span className="wordmark small">jaani</span>
              <p>Karachi, Pakistan — property development &amp; management</p>
              <p className="footer-fine">&copy; {new Date().getFullYear()} Real House. All rights reserved.</p>
            </footer>
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<UploadProperty />} />
        <Route path="/ai-design" element={<AIDesignGenerator />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
      <ChatWidget />
    </>
  );
}