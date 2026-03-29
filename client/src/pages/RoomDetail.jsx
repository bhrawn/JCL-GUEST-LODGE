import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { AMENITIES, AMENITY_ICONS, ROOM_DESCRIPTIONS } from '../lib/amenities.jsx';

const EXTRA_IMAGES = {
  Standard: [
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&h=600&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&h=600&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&h=600&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&h=600&q=80',
  ],
  Deluxe: [
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=900&h=600&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&h=600&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=900&h=600&q=80',
    'https://images.unsplash.com/photo-1612320743784-66952008b2e7?auto=format&fit=crop&w=900&h=600&q=80',
  ],
  Suite: [
    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=900&h=600&q=80',
    'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&w=900&h=600&q=80',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&h=600&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32f1e0e56cd?auto=format&fit=crop&w=900&h=600&q=80',
  ],
};

const FALLBACK = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&h=600&q=80';

function RoomSlider({ images }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = images.length;

  useEffect(() => {
    if (paused || total <= 1) return;
    const t = setInterval(() => setActive(p => (p + 1) % total), 4000);
    return () => clearInterval(t);
  }, [paused, total]);

  const prev = () => setActive(p => (p - 1 + total) % total);
  const next = () => setActive(p => (p + 1) % total);

  return (
    <div
      className="rs-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Main slide */}
      <div className="rs-track">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={`Slide ${active + 1}`}
            className="rs-img"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            onError={(e) => { e.currentTarget.src = FALLBACK; }}
            loading="lazy"
          />
        </AnimatePresence>

        {/* Arrows */}
        {total > 1 && (
          <>
            <button className="rs-arrow rs-arrow--prev" onClick={prev} aria-label="Previous">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button className="rs-arrow rs-arrow--next" onClick={next} aria-label="Next">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </>
        )}

        {/* Counter */}
        <div className="rs-counter">{active + 1} / {total}</div>
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="rs-thumbs">
          {images.map((src, i) => (
            <button
              key={i}
              className={`rs-thumb${i === active ? ' rs-thumb--active' : ''}`}
              onClick={() => setActive(i)}
            >
              <img
                src={src}
                alt={`Thumbnail ${i + 1}`}
                onError={(e) => { e.currentTarget.src = FALLBACK; }}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoomDetail() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRoom(roomId)
      .then(setRoom)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [roomId]);

  if (loading) return (
    <div className="page"><div className="container"><div className="loading">Loading room…</div></div></div>
  );
  if (!room) return (
    <div className="page"><div className="container"><div className="loading">Room not found.</div></div></div>
  );

  const amenities = AMENITIES[room.type] || AMENITIES.Standard;
  const description = ROOM_DESCRIPTIONS[room.type] || ROOM_DESCRIPTIONS.Standard;
  const extras = EXTRA_IMAGES[room.type] || EXTRA_IMAGES.Standard;
  const images = [room.image_url || FALLBACK, ...extras];

  return (
    <motion.div
      className="page rd-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="container rd-container">

        <Link to={`/branches/${room.branch_id}`} className="back-link">
          ← Back to rooms
        </Link>

        <div className="rd-layout">

          {/* ── Left: Slider ── */}
          <motion.div
            className="rd-image-col"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div style={{ position: 'relative' }}>
              <span className={`rd-badge ${room.is_available ? 'badge-green' : 'badge-red'}`}>
                {room.is_available ? 'Available' : 'Booked'}
              </span>
              <RoomSlider images={images} />
            </div>
          </motion.div>

          {/* ── Right: Info ── */}
          <motion.div
            className="rd-info-col"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="rd-meta">
              <span className="rd-type-chip">{room.type}</span>
            </div>

            <h1 className="rd-title">Room {room.room_number}</h1>
            <p className="rd-description">{description}</p>

            <div className="rd-amenities-section">
              <h3 className="rd-amenities-title">What's included</h3>
              <div className="rd-amenities-grid">
                {amenities.map(a => (
                  <div key={a.icon} className="rd-amenity">
                    <span className="rd-amenity-icon">{AMENITY_ICONS[a.icon]}</span>
                    <span className="rd-amenity-label">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rd-footer">
              <div className="rd-price-block">
                <span className="rd-price-label">Price per night</span>
                <span className="rd-price">GHS {room.price_per_night}</span>
              </div>

              {room.is_available ? (
                <Link to={`/book/${room.id}`} className="rd-book-btn">
                  Book Now
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              ) : (
                <button className="btn btn-disabled rd-book-btn" disabled>Unavailable</button>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
