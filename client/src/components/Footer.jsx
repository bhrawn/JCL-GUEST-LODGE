import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo-link">
              <img src="/jcl-logo.png" alt="JCL Guest Lodge" className="footer-logo" />
            </Link>
            <p className="footer-tagline">
              Premium guest accommodation across Accra. Comfortable rooms, excellent service, and unbeatable locations since 2018.
            </p>
            <div className="footer-socials">
              <a href="https://www.tiktok.com/@jclguestlodge" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="TikTok">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17V12a4.85 4.85 0 01-5.58-2.13v6.8h3.45V6.69h2.13z"/></svg>
                <span>TikTok</span>
              </a>
              <a href="https://www.instagram.com/jcl_guestlodge/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Browse Rooms</Link></li>
              <li><Link to="/branches/1">Lapaz Branch</Link></li>
              <li><Link to="/branches/2">Danfa Branch</Link></li>
              <li><Link to="/branches/3">Spintex Branch</Link></li>
              <li><Link to="/branches/4">Teshie Branch</Link></li>
            </ul>
          </div>

          {/* Our Locations */}
          <div className="footer-col">
            <h4>Our Locations</h4>
            <ul className="footer-locations">
              <li>
                <span className="loc-name">Lapaz</span>
                <span className="loc-detail">Lapaz Main Road, Near Nyamekye, Accra</span>
              </li>
              <li>
                <span className="loc-name">Danfa</span>
                <span className="loc-detail">Danfa Junction, Off Adenta-Madina Road</span>
              </li>
              <li>
                <span className="loc-name">Spintex</span>
                <span className="loc-detail">Spintex Road, Near Ecobank, Accra</span>
              </li>
              <li>
                <span className="loc-name">Teshie</span>
                <span className="loc-detail">Teshie Nungua Estate, Near Beach Road</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                <span>+233 XX XXX XXXX</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>info@jclguestlodge.com</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>24/7 — Check-in anytime</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} JCL Guest Lodge. All rights reserved.</p>
          <p className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <span>&middot;</span>
            <a href="#">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
