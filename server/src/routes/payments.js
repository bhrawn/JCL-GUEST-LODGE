import { Router } from 'express';
import { get, run, saveDb } from '../db.js';
import crypto from 'crypto';

const router = Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const PAYSTACK_BASE = 'https://api.paystack.co';

async function paystackRequest(path, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${PAYSTACK_BASE}${path}`, options);
  return res.json();
}

// POST /api/payments/initialize — Create a Paystack transaction for a booking
router.post('/initialize', async (req, res) => {
  try {
    const { booking_reference, payment_type = 'full' } = req.body;

    if (!booking_reference) {
      return res.status(400).json({ error: 'booking_reference is required' });
    }

    const booking = get(`
      SELECT bk.*, r.room_number, b.name as branch_name
      FROM bookings bk
      JOIN rooms r ON r.id = bk.room_id
      JOIN branches b ON b.id = r.branch_id
      WHERE bk.reference = ?
    `, [booking_reference]);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.payment_status === 'paid') {
      return res.status(400).json({ error: 'Booking is already fully paid' });
    }

    // Calculate amount based on payment type
    const payableAmount = payment_type === 'half'
      ? booking.total_price / 2
      : booking.total_price;

    // Amount in pesewas (smallest currency unit) — Paystack expects integer
    const amount = Math.round(payableAmount * 100);

    const paystackRes = await paystackRequest('/transaction/initialize', 'POST', {
      email: booking.guest_email,
      amount,
      currency: 'GHS',
      reference: `PAY-${booking.reference}-${Date.now()}`,
      callback_url: `${req.headers.origin || 'http://localhost:5173'}/payment/verify`,
      metadata: {
        booking_reference: booking.reference,
        booking_id: booking.id,
        guest_name: booking.guest_name,
        room: booking.room_number,
        branch: booking.branch_name,
        payment_type,
      },
    });

    if (!paystackRes.status) {
      return res.status(400).json({ error: paystackRes.message || 'Failed to initialize payment' });
    }

    // Store the payment record
    run(`
      INSERT INTO payments (booking_id, paystack_reference, amount, currency, status)
      VALUES (?, ?, ?, 'GHS', 'pending')
    `, [booking.id, paystackRes.data.reference, booking.total_price]);
    saveDb();

    res.json({
      authorization_url: paystackRes.data.authorization_url,
      access_code: paystackRes.data.access_code,
      reference: paystackRes.data.reference,
    });
  } catch (err) {
    console.error('Payment init error:', err);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

// GET /api/payments/verify/:reference — Verify a payment with Paystack
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    const paystackRes = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);

    if (!paystackRes.status) {
      return res.status(400).json({ error: paystackRes.message || 'Verification failed' });
    }

    const txn = paystackRes.data;
    const payment = get('SELECT * FROM payments WHERE paystack_reference = ?', [reference]);

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    if (txn.status === 'success') {
      // Update payment record
      run(`
        UPDATE payments SET status = 'success', paid_at = ?, channel = ?, paystack_data = ?
        WHERE paystack_reference = ?
      `, [txn.paid_at || new Date().toISOString(), txn.channel || 'unknown', JSON.stringify(txn), reference]);

      // Determine if this was a full or partial payment
      const booking = get('SELECT * FROM bookings WHERE id = ?', [payment.booking_id]);
      const paymentType = txn.metadata?.payment_type || 'full';
      const isPartial = paymentType === 'half';

      // Update booking status
      run(`
        UPDATE bookings SET status = 'confirmed', payment_status = ?, amount_paid = COALESCE(amount_paid, 0) + ?
        WHERE id = ?
      `, [isPartial ? 'partial' : 'paid', payment.amount, payment.booking_id]);

      saveDb();

      const updatedBooking = get(`
        SELECT bk.*, r.room_number, r.type as room_type, r.price_per_night, b.name as branch_name
        FROM bookings bk
        JOIN rooms r ON r.id = bk.room_id
        JOIN branches b ON b.id = r.branch_id
        WHERE bk.id = ?
      `, [payment.booking_id]);

      res.json({ status: 'success', booking: updatedBooking });
    } else {
      run("UPDATE payments SET status = ? WHERE paystack_reference = ?", [txn.status, reference]);
      saveDb();
      res.json({ status: txn.status, message: 'Payment not successful' });
    }
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// POST /api/payments/webhook — Paystack webhook (server-to-server)
router.post('/webhook', (req, res) => {
  // Validate webhook signature
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const txn = event.data;
    const payment = get('SELECT * FROM payments WHERE paystack_reference = ?', [txn.reference]);

    if (payment) {
      run(`
        UPDATE payments SET status = 'success', paid_at = ?, channel = ?, paystack_data = ?
        WHERE paystack_reference = ?
      `, [txn.paid_at, txn.channel, JSON.stringify(txn), txn.reference]);

      const paymentType = txn.metadata?.payment_type || 'full';
      const isPartial = paymentType === 'half';

      run(`
        UPDATE bookings SET status = 'confirmed', payment_status = ?, amount_paid = COALESCE(amount_paid, 0) + ?
        WHERE id = ?
      `, [isPartial ? 'partial' : 'paid', payment.amount, payment.booking_id]);

      saveDb();
      console.log(`Webhook: ${isPartial ? 'Partial' : 'Full'} payment ${txn.reference} confirmed for booking #${payment.booking_id}`);
    }
  }

  // Always return 200 to acknowledge the webhook
  res.sendStatus(200);
});

export default router;
