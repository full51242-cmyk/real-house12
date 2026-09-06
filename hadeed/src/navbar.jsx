import { memo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import UserProfile from "./components/UserProfile";
import "./navbar.css";

const NAV_LINKS = [
  { label: "Portfolio", href: "portfolio", color: "#1976d2" },
  { label: "Approach", href: "approach", color: "#42a5f5" },
  { label: "Services", href: "services", color: "#64b5f6" },
  { label: "Contact", href: "contact", color: "#90caf9" },
];

const NavLink = memo(({ link, onClick }) => (
  <a
    href={`#${link.href}`}
    onClick={(e) => onClick(e, link.href)}
    className="nav-link"
    style={{ "--link-color": link.color }}
  >
  <span className="nav-link-text">{link.label}</span>
    <span className="nav-link-underline" />
  </a>
));

NavLink.displayName = "NavLink";

const NavToggle = memo(({ isOpen, onClick }) => (
  <button
    className={`nav-toggle ${isOpen ? "open" : ""}`}
    aria-label="Toggle menu"
    aria-expanded={isOpen}
    onClick={onClick}
  >
    <span className="nav-toggle-line" />
    <span className="nav-toggle-line" />
    <span className="nav-toggle-line" />
  </button>
));

NavToggle.displayName = "NavToggle";

const Navbar = memo(({ menuOpen, setMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLinkClick = useCallback(
    (e, sectionId) => {
      e.preventDefault();
      setMenuOpen(false);

      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    },
    [location.pathname, navigate, setMenuOpen]
  );

  const handleToggleClick = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, [setMenuOpen]);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <a className="navbar-brand" href="#top">
          <div className="navbar-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="36" height="36" rx="4" stroke="#1976d2" strokeWidth="2"/>
              <path d="M10 30L10 15L15 15L15 10L25 10L25 15L30 15L30 30Z" fill="#42a5f5"/>
              <rect x="18" y="20" width="4" height="10" fill="#1976d2"/>
            </svg>
          </div>
          <span className="brand-text">real</span>
          <span className="brand-accent">house</span>
        </a>

        <nav className={`navbar-menu ${menuOpen ? "open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} link={link} onClick={handleLinkClick} />
          ))}
          <Link to="/ai-design" className="nav-link" onClick={() => setMenuOpen(false)} style={{ "--link-color": "#8b5cf6" }}>
            <span className="nav-link-text">AI Design</span>
            <span className="nav-link-underline" />
          </Link>
          <div className="navbar-auth">
            <Link to="/login" className="btn-login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="btn-signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
          </div>
        </nav>

        <div className="navbar-desktop-auth">
          <UserProfile />
          <Link to="/upload" className="btn-upload">
            <svg viewBox="0 0 20 20" fill="currentColor" className="upload-icon">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Upload
          </Link>
          <Link to="/login" className="btn-login">Login</Link>
          <Link to="/register" className="btn-signup">Sign Up</Link>
        </div>

        <NavToggle isOpen={menuOpen} onClick={handleToggleClick} />
      </div>
    </header>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;