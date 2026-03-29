import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import RoomCard from '../components/RoomCard';

const FALLBACK_BRANCH = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop&q=80';

export default function BranchRooms() {
  const { id } = useParams();
  const [branch, setBranch] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getBranch(id),
      api.getBranchRooms(id, showAvailableOnly),
    ])
      .then(([b, r]) => { setBranch(b); setRooms(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, showAvailableOnly]);

  if (loading) return (
    <div className="page"><div className="container"><div className="loading">Loading rooms…</div></div></div>
  );
  if (!branch) return (
    <div className="page"><div className="container"><div className="loading">Branch not found.</div></div></div>
  );

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Hero banner */}
      <div className="branch-hero">
        <img
          src={branch.image_url || FALLBACK_BRANCH}
          alt={branch.name}
          className="branch-hero-img"
          onError={(e) => { e.currentTarget.src = FALLBACK_BRANCH; }}
        />
        <div className="branch-hero-overlay" />
        <div className="branch-hero-content container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <Link to="/" className="back-link back-link--light">← All Branches</Link>
            <h1 className="branch-hero-title">{branch.name}</h1>
            <p className="branch-hero-sub">{branch.description}</p>
            <div className="branch-hero-stats">
              <span>{branch.total_rooms} rooms total</span>
              <span className="dot">·</span>
              <span className="avail">{branch.available_rooms} available</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        {/* Filter */}
        <div className="branch-filter-row">
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
            />
            <span>Available rooms only</span>
          </label>
          <span className="branch-room-count">{rooms.length} rooms</span>
        </div>

        {/* Grid */}
        <div className="grid grid-3">
          {rooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <RoomCard room={room} />
            </motion.div>
          ))}
        </div>

        {rooms.length === 0 && (
          <p className="empty-state">No rooms match your filter.</p>
        )}
      </div>
    </motion.div>
  );
}
