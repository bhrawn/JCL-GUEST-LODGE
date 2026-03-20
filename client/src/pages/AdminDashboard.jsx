import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [branches, setBranches] = useState([]);
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      navigate('/admin', { replace: true });
      return;
    }
    loadData();
  }, []);

  async function loadData() {
    try {
      const [bks, brs] = await Promise.all([api.getBookings(), api.getBranches()]);
      setBookings(bks);
      setBranches(brs);
      const roomMap = {};
      for (const b of brs) {
        roomMap[b.id] = await api.getBranchRooms(b.id, false);
      }
      setRooms(roomMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRoom(roomId, currentAvailability) {
    try { await api.toggleRoom(roomId, !currentAvailability); await loadData(); }
    catch (err) { alert(err.message); }
  }

  async function handleCancelBooking(bookingId) {
    if (!confirm('Cancel this booking?')) return;
    try { await api.cancelBooking(bookingId); await loadData(); }
    catch (err) { alert(err.message); }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  }

  if (loading) return <div className="page"><div className="container"><div className="loading">Loading dashboard</div></div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-value">{bookings.length}</span>
            <span className="stat-label">Bookings</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{bookings.filter(b => b.status === 'confirmed').length}</span>
            <span className="stat-label">Confirmed</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{branches.length}</span>
            <span className="stat-label">Branches</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{Object.values(rooms).flat().length}</span>
            <span className="stat-label">Rooms</span>
          </div>
        </div>

        <div className="tab-bar">
          <button className={`tab ${tab === 'bookings' ? 'tab-active' : ''}`} onClick={() => setTab('bookings')}>Bookings</button>
          <button className={`tab ${tab === 'rooms' ? 'tab-active' : ''}`} onClick={() => setTab('rooms')}>Rooms</button>
        </div>

        {tab === 'bookings' && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th><th>Guest</th><th>Branch</th><th>Room</th>
                  <th>Check-in</th><th>Check-out</th><th>Total</th><th>Status</th><th>Payment</th><th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan="10" className="empty-cell">No bookings yet</td></tr>
                ) : bookings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ color: 'var(--text)', fontWeight: 600 }}>{b.reference}</td>
                    <td>{b.guest_name}</td>
                    <td>{b.branch_name}</td>
                    <td>{b.room_number}</td>
                    <td>{b.check_in}</td>
                    <td>{b.check_out}</td>
                    <td style={{ color: 'var(--text)' }}>GHS {b.total_price.toFixed(2)}</td>
                    <td><span className={`badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>{b.status}</span></td>
                    <td><span className={`badge ${b.payment_status === 'paid' ? 'badge-green' : b.payment_status === 'partial' ? 'badge-yellow' : 'badge-red'}`}>{b.payment_status === 'partial' ? '50% paid' : b.payment_status || 'unpaid'}</span></td>
                    <td>
                      {b.status === 'confirmed' && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleCancelBooking(b.id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'rooms' && branches.map((branch) => (
          <div key={branch.id} className="room-management-section">
            <h3>{branch.name}</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Room</th><th>Type</th><th>Price/Night</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {(rooms[branch.id] || []).map((room) => (
                    <tr key={room.id}>
                      <td style={{ color: 'var(--text)', fontWeight: 600 }}>{room.room_number}</td>
                      <td>{room.type}</td>
                      <td>GHS {room.price_per_night}</td>
                      <td><span className={`badge ${room.is_available ? 'badge-green' : 'badge-red'}`}>{room.is_available ? 'Available' : 'Unavailable'}</span></td>
                      <td>
                        <button className={`btn btn-sm ${room.is_available ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggleRoom(room.id, room.is_available)}>
                          {room.is_available ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
