import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src="/jcl-logo.png" alt="JCL Guest Lodge" className="navbar-logo" />
          <span>Guest Lodge</span>
        </Link>
        <div className="navbar-links">
          <Link to="/">Branches</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </div>
    </nav>
  );
}
