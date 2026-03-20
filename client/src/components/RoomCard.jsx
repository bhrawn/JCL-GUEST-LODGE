import { Link } from 'react-router-dom';

export default function RoomCard({ room }) {
  return (
    <div className={`card ${!room.is_available ? 'room-unavailable' : ''}`}>
      <div className="card-img-wrapper">
        <img src={room.image_url} alt={room.room_number} className="card-img" loading="lazy" />
      </div>
      <div className="card-body">
        <div className="room-header">
          <h4>Room {room.room_number}</h4>
          <span className={`badge ${room.is_available ? 'badge-green' : 'badge-red'}`}>
            {room.is_available ? 'Available' : 'Booked'}
          </span>
        </div>
        <p className="room-type">{room.type}</p>
        <p className="room-price">GHS {room.price_per_night}<span> /night</span></p>
        {room.is_available ? (
          <Link to={`/book/${room.id}`} className="btn btn-accent">
            Book Now
          </Link>
        ) : (
          <button className="btn btn-disabled" disabled>Unavailable</button>
        )}
      </div>
    </div>
  );
}
