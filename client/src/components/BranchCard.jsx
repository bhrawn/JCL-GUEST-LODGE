import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FALLBACK = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=500&fit=crop&q=80';

export default function BranchCard({ branch }) {
  const navigate = useNavigate();

  const handleClick = () => navigate(`/branches/${branch.id}`);

  return (
    <motion.div
      className="card branch-card"
      onClick={handleClick}
      whileHover={{ y: -6, boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-img-wrapper">
        <img
          src={branch.image_url || FALLBACK}
          alt={branch.name}
          className="card-img"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = FALLBACK; }}
        />
        <div className="branch-card-overlay" />
        <div className="branch-card-arrow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
          </svg>
        </div>
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span>{branch.total_rooms} rooms</span>
          <span className="badge badge-green">{branch.available_rooms} available</span>
        </div>
        <h3>{branch.name}</h3>
        <p className="card-desc">{branch.description}</p>
        <span className="btn btn-primary branch-card-btn">
          View Rooms
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
          </svg>
        </span>
      </div>
    </motion.div>
  );
}
