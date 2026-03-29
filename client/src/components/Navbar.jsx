import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll to a section by id, navigating home first if needed
  const scrollTo = (id) => {
    setMenuOpen(false);
    const doScroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(doScroll, 300);
    } else {
      doScroll();
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar-inner">

        {/* Logo — far left */}
        <Link to="/" className="navbar-brand">
          <img src="/jcl-logo.png" alt="JCL Guest Lodge" className="navbar-logo" />
          <span className="navbar-brand-text">JCL <span className="navbar-brand-sub">Guest Lodge</span></span>
        </Link>

        {/* Nav links — centre */}
        <div className={`navbar-links${menuOpen ? ' navbar-links--open' : ''}`}>
          <Link to="/" className={`nav-link${isActive('/') ? ' nav-link--active' : ''}`} onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <button className="nav-link" onClick={() => scrollTo('branches')}>
            Branches
          </button>
          <button className="nav-link" onClick={() => scrollTo('gallery')}>
            Gallery
          </button>
        </div>

        {/* CTA + hamburger — far right */}
        <div className="navbar-actions">
          <button className="nav-cta" onClick={() => scrollTo('branches')}>
            Book Now
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </button>

          {/* Mobile hamburger */}
          <button
            className={`nav-hamburger${menuOpen ? ' nav-hamburger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

      </div>
    </nav>
  );
}
