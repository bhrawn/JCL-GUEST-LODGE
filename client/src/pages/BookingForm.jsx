import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

export default function BookingForm() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form');
  const [booking, setBooking] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentOption, setPaymentOption] = useState('full'); // 'full' | 'half'

  const [form, setForm] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: '',
    check_out: '',
  });

  useEffect(() => {
    api.getRoom(roomId)
      .then(setRoom)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [roomId]);

  useEffect(() => {
    if (document.getElementById('paystack-script')) return;
    const script = document.createElement('script');
    script.id = 'paystack-script';
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const nights = useMemo(() => {
    if (!form.check_in || !form.check_out) return 0;
    const diff = new Date(form.check_out) - new Date(form.check_in);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [form.check_in, form.check_out]);

  const totalPrice = room ? nights * room.price_per_night : 0;
  const today = new Date().toISOString().split('T')[0];

  const payAmount = paymentOption === 'full' ? booking?.total_price : (booking?.total_price || 0) / 2;
  const balanceDue = paymentOption === 'half' ? (booking?.total_price || 0) / 2 : 0;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (nights <= 0) { setError('Check-out must be after check-in'); return; }
    setSubmitting(true);
    setError('');
    try {
      const bk = await api.createBooking({ room_id: Number(roomId), ...form });
      setBooking(bk);
      setStep('payment');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const handlePayWithPaystack = useCallback(async () => {
    if (!booking) return;
    setPaymentLoading(true);
    setError('');

    try {
      const paymentData = await api.initializePayment(booking.reference, paymentOption);

      if (window.PaystackPop) {
        const popup = new window.PaystackPop();
        popup.newTransaction({
          key: PAYSTACK_PUBLIC_KEY,
          email: booking.guest_email,
          amount: Math.round(payAmount * 100),
          currency: 'GHS',
          ref: paymentData.reference,
          metadata: {
            booking_reference: booking.reference,
            guest_name: booking.guest_name,
            payment_type: paymentOption,
          },
          onSuccess: async (transaction) => {
            try {
              await api.verifyPayment(transaction.reference);
            } catch (_) { /* webhook handles it */ }
            navigate(`/booking/${booking.reference}`);
          },
          onCancel: () => {
            setError('Payment was cancelled. You can try again or pay later.');
            setPaymentLoading(false);
          },
        });
      } else {
        window.location.href = paymentData.authorization_url;
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize payment');
    } finally {
      setPaymentLoading(false);
    }
  }, [booking, navigate, paymentOption, payAmount]);

  const handleSkipPayment = () => {
    if (booking) navigate(`/booking/${booking.reference}`);
  };

  if (loading) return <div className="page"><div className="container"><div className="loading">Loading room</div></div></div>;
  if (!room) return <div className="page"><div className="container"><div className="loading">Room not found</div></div></div>;

  return (
    <div className="page">
      <div className="container">
        <Link to={`/branches/${room.branch_id}`} className="back-link">&larr; Back to rooms</Link>

        <div className="steps-bar">
          <div className={`step ${step === 'form' ? 'step-active' : 'step-done'}`}>
            <span className="step-num">{step === 'form' ? '1' : '\u2713'}</span>
            <span>Guest Details</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step === 'payment' ? 'step-active' : ''}`}>
            <span className="step-num">2</span>
            <span>Payment</span>
          </div>
        </div>

        <div className="booking-layout">
          <div className="room-summary">
            <img src={room.image_url} alt={room.room_number} className="room-summary-img" loading="lazy" />
            <h2>Room {room.room_number}</h2>
            <p className="room-type">{room.type} &middot; {room.branch_name}</p>
            <p className="room-price">GHS {room.price_per_night}<span> /night</span></p>
            {nights > 0 && (
              <div className="price-calc">
                <p>{nights} night{nights > 1 ? 's' : ''} &times; GHS {room.price_per_night}</p>
                <p className="total">GHS {totalPrice.toFixed(2)}</p>
              </div>
            )}
          </div>

          {step === 'form' && (
            <form className="booking-form" onSubmit={handleSubmit}>
              <h2>Guest Details</h2>
              <p>Fill in your details to reserve this room.</p>
              {error && <div className="error-msg">{error}</div>}

              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="guest_name" required value={form.guest_name} onChange={handleChange} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="guest_email" required value={form.guest_email} onChange={handleChange} placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="guest_phone" required value={form.guest_phone} onChange={handleChange} placeholder="+233 XX XXX XXXX" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Check-in</label>
                  <input type="date" name="check_in" required min={today} value={form.check_in} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Check-out</label>
                  <input type="date" name="check_out" required min={form.check_in || today} value={form.check_out} onChange={handleChange} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting || nights <= 0}>
                {submitting ? 'Creating booking...' : nights > 0 ? `Continue to Payment — GHS ${totalPrice.toFixed(2)}` : 'Select dates to continue'}
              </button>
            </form>
          )}

          {step === 'payment' && booking && (
            <div className="booking-form">
              <h2>Complete Payment</h2>
              <p>Your room is reserved. Choose a payment option below.</p>
              {error && <div className="error-msg">{error}</div>}

              {/* Payment Option Selector */}
              <div className="payment-options">
                <button
                  type="button"
                  className={`payment-option ${paymentOption === 'full' ? 'payment-option-active' : ''}`}
                  onClick={() => setPaymentOption('full')}
                >
                  <div className="payment-option-radio">
                    <div className={`radio-dot ${paymentOption === 'full' ? 'radio-dot-active' : ''}`} />
                  </div>
                  <div className="payment-option-content">
                    <span className="payment-option-label">Full Payment</span>
                    <span className="payment-option-desc">Pay the total amount now</span>
                  </div>
                  <span className="payment-option-amount">GHS {booking.total_price.toFixed(2)}</span>
                </button>

                <button
                  type="button"
                  className={`payment-option ${paymentOption === 'half' ? 'payment-option-active' : ''}`}
                  onClick={() => setPaymentOption('half')}
                >
                  <div className="payment-option-radio">
                    <div className={`radio-dot ${paymentOption === 'half' ? 'radio-dot-active' : ''}`} />
                  </div>
                  <div className="payment-option-content">
                    <span className="payment-option-label">Half Payment (50%)</span>
                    <span className="payment-option-desc">Pay the rest at check-in</span>
                  </div>
                  <span className="payment-option-amount">GHS {(booking.total_price / 2).toFixed(2)}</span>
                </button>
              </div>

              {/* Booking Summary */}
              <div className="payment-summary">
                <div className="payment-row">
                  <span>Booking Reference</span>
                  <span className="payment-ref">{booking.reference}</span>
                </div>
                <div className="payment-row">
                  <span>Room</span>
                  <span>{booking.room_number} ({booking.room_type})</span>
                </div>
                <div className="payment-row">
                  <span>Dates</span>
                  <span>{booking.check_in} &rarr; {booking.check_out}</span>
                </div>
                <div className="payment-row">
                  <span>Total Cost</span>
                  <span>GHS {booking.total_price.toFixed(2)}</span>
                </div>
                {paymentOption === 'half' && (
                  <div className="payment-row">
                    <span>Balance Due at Check-in</span>
                    <span style={{ color: 'var(--danger)' }}>GHS {balanceDue.toFixed(2)}</span>
                  </div>
                )}
                <div className="payment-row payment-total">
                  <span>Pay Now</span>
                  <span>GHS {payAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                className="btn btn-accent btn-lg"
                onClick={handlePayWithPaystack}
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Connecting to Paystack...' : `Pay GHS ${payAmount.toFixed(2)} with Paystack`}
              </button>

              <button
                className="btn btn-outline"
                onClick={handleSkipPayment}
                style={{ width: '100%', marginTop: '0.75rem', height: 48 }}
              >
                Pay Later at Check-in
              </button>

              <p className="payment-note">
                Secured by Paystack. Your card details are never stored on our servers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
