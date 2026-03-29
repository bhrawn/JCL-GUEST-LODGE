import { Link } from 'react-router-dom';
import { AMENITIES, AMENITY_ICONS } from '../lib/amenities.jsx';

const FALLBACK = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&q=80';

export default function RoomCard({ room }) {
  const amenities = (AMENITIES[room.type] || AMENITIES.Standard).slice(0, 3);

  return (
    <div className={`card ${!room.is_available ? 'room-unavailable' : ''}`}>
      <div className="card-img-wrapper">
        <img
          src={room.image_url || FALLBACK}
          alt={room.room_number}
          className="card-img"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = FALLBACK; }}
        />
        <span className={`card-badge ${room.is_available ? 'badge-green' : 'badge-red'}`}>
          {room.is_available ? 'Available' : 'Booked'}
        </span>
      </div>
      <div className="card-body">
        <div className="room-header">
          <h4>Room {room.room_number}</h4>
          <span className="room-type-chip">{room.type}</span>
        </div>

        {/* Amenity chips */}
        <div className="room-amenities">
          {amenities.map(a => (
            <span key={a.icon} className="amenity-chip">
              <span className="amenity-chip-icon">{AMENITY_ICONS[a.icon]}</span>
              {a.short}
            </span>
          ))}
        </div>

        <p className="room-price">GHS {room.price_per_night}<span> /night</span></p>

        {room.is_available ? (
          <Link to={`/rooms/${room.id}`} className="btn btn-accent">
            View Room
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        ) : (
          <button className="btn btn-disabled" disabled>Unavailable</button>
        )}
      </div>
    </div>
  );
}
