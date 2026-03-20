import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import RoomCard from '../components/RoomCard';

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

  if (loading) return <div className="page"><div className="container"><div className="loading">Loading rooms</div></div></div>;
  if (!branch) return <div className="page"><div className="container"><div className="loading">Branch not found</div></div></div>;

  return (
    <div className="page">
      <div className="container">
        <Link to="/" className="back-link">&larr; All Branches</Link>
        <div className="page-header" style={{ textAlign: 'left', maxWidth: 'none', marginLeft: 0 }}>
          <span className="label">{branch.available_rooms} of {branch.total_rooms} rooms available</span>
          <h1>{branch.name}</h1>
          <p style={{ margin: 0 }}>{branch.description}</p>
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
            />
            Available only
          </label>
        </div>
        <div className="grid grid-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
        {rooms.length === 0 && <p className="empty-state">No rooms match your filter.</p>}
      </div>
    </div>
  );
}
