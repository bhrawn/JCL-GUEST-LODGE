import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setStatus('error');
      setError('No payment reference found');
      return;
    }

    api.verifyPayment(reference)
      .then((result) => {
        if (result.status === 'success') {
          setStatus('success');
          setBooking(result.booking);
          // Redirect to confirmation after a short delay
          setTimeout(() => {
            navigate(`/booking/${result.booking.reference}`);
          }, 2000);
        } else {
          setStatus('failed');
          setError('Payment was not successful. Please try again.');
        }
      })
      .catch((err) => {
        setStatus('error');
        setError(err.message || 'Failed to verify payment');
      });
  }, [searchParams, navigate]);

  return (
    <div className="page">
      <div className="container">
        <div className="confirmation">
          {status === 'verifying' && (
            <>
              <div className="loading">Verifying your payment</div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="confirmation-icon">&#10003;</div>
              <h1>Payment Successful</h1>
              <p className="confirmation-note">Redirecting to your booking confirmation...</p>
            </>
          )}

          {(status === 'failed' || status === 'error') && (
            <>
              <div className="confirmation-icon" style={{ background: 'var(--danger-dim)', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}>!</div>
              <h1>Payment Issue</h1>
              <p className="confirmation-note">{error}</p>
              <Link to="/" className="btn btn-primary">Back to Home</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
