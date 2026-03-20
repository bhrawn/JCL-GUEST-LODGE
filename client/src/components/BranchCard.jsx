import { Link } from 'react-router-dom';

export default function BranchCard({ branch }) {
  return (
    <div className="card">
      <div className="card-img-wrapper">
        <img src={branch.image_url} alt={branch.name} className="card-img" loading="lazy" />
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span>{branch.total_rooms} rooms</span>
          <span className="badge badge-green">{branch.available_rooms} available</span>
        </div>
        <h3>{branch.name}</h3>
        <p className="card-desc">{branch.description}</p>
        <Link to={`/branches/${branch.id}`} className="btn btn-primary">
          View Rooms
        </Link>
      </div>
    </div>
  );
}
