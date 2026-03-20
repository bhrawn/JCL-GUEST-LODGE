import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Confirmation() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBooking(reference)
      .then(setBooking)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [reference]);

  if (loading) return <div className="page"><div className="container"><div className="loading">Loading booking</div></div></div>;
  if (!booking) return <div className="page"><div className="container"><div className="loading">Booking not found</div></div></div>;

  const nights = Math.ceil(
    (new Date(booking.check_out) - new Date(booking.check_in)) / (1000 * 60 * 60 * 24)
  );

  const isPaid = booking.payment_status === 'paid';
  const isPartial = booking.payment_status === 'partial';
  const amountPaid = booking.amount_paid || 0;
  const balanceDue = booking.total_price - amountPaid;

  return (
    <div className="page">
      <div className="container">
        <div className="confirmation">
          <div className="confirmation-icon" style={(!isPaid && !isPartial) ? { background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'rgba(201,168,76,0.2)' } : {}}>
            {(isPaid || isPartial) ? '\u2713' : '$'}
          </div>
          <h1>{isPaid ? 'Booking Confirmed' : isPartial ? 'Booking Confirmed — Partial Payment' : 'Booking Reserved'}</h1>
          <p className="confirmation-ref">
            Your reference number
            <strong>{booking.reference}</strong>
          </p>

          {isPartial && (
            <div className="error-msg" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'rgba(201,168,76,0.2)', textAlign: 'center', marginBottom: '1.5rem' }}>
              50% paid (GHS {amountPaid.toFixed(2)}) — balance of GHS {balanceDue.toFixed(2)} is due at check-in.
            </div>
          )}

          {!isPaid && !isPartial && (
            <div className="error-msg" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'rgba(201,168,76,0.2)', textAlign: 'center', marginBottom: '1.5rem' }}>
              Payment pending — pay now to confirm your booking, or pay at check-in.
            </div>
          )}

          <div className="confirmation-details">
            <div className="detail-row"><span>Guest</span><span>{booking.guest_name}</span></div>
            <div className="detail-row"><span>Email</span><span>{booking.guest_email}</span></div>
            <div className="detail-row"><span>Phone</span><span>{booking.guest_phone}</span></div>
            <div className="detail-row"><span>Branch</span><span>{booking.branch_name}</span></div>
            <div className="detail-row"><span>Room</span><span>{booking.room_number} ({booking.room_type})</span></div>
            <div className="detail-row"><span>Check-in</span><span>{booking.check_in}</span></div>
            <div className="detail-row"><span>Check-out</span><span>{booking.check_out}</span></div>
            <div className="detail-row"><span>Duration</span><span>{nights} night{nights > 1 ? 's' : ''}</span></div>
            <div className="detail-row">
              <span>Payment</span>
              <span className={`badge ${isPaid ? 'badge-green' : isPartial ? 'badge-yellow' : 'badge-red'}`}>
                {isPaid ? 'Paid in Full' : isPartial ? '50% Paid' : 'Unpaid'}
              </span>
            </div>
            {amountPaid > 0 && (
              <div className="detail-row"><span>Amount Paid</span><span style={{ color: 'var(--success)' }}>GHS {amountPaid.toFixed(2)}</span></div>
            )}
            {balanceDue > 0 && (isPaid ? null : (
              <div className="detail-row"><span>Balance Due</span><span style={{ color: 'var(--danger)' }}>GHS {balanceDue.toFixed(2)}</span></div>
            ))}
            <div className="detail-row total-row"><span>Total</span><span>GHS {booking.total_price.toFixed(2)}</span></div>
          </div>

          <p className="confirmation-note">
            {isPaid
              ? `Full payment received. A confirmation will be sent to ${booking.guest_email}.`
              : isPartial
              ? `Partial payment received. Please bring the remaining GHS ${balanceDue.toFixed(2)} to check-in.`
              : 'Save your booking reference. You can pay online or at check-in.'}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary">Back to Home</Link>
            {!isPaid && !isPartial && (
              <button
                className="btn btn-accent"
                onClick={() => navigate(`/book/${booking.room_id}`, { state: { retryPayment: booking } })}
                style={{ padding: '0 2rem' }}
              >
                Pay Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
