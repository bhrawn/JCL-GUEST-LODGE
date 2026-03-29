import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// ─── Supabase Client ──────────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL || 'https://brhipuaudmxltkmgfgum.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyaGlwdWF1ZG14bHRrbWdmZ3VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzk2OTI2MSwiZXhwIjoyMDg5NTQ1MjYxfQ.d44lejZt0xh5WqKuPcAjw1uOY-L6bFXA09a0tdXsQpQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Branch Routes ─────────────────────────────────────────────────
app.get('/api/branches', async (req, res) => {
  try {
    const { data: branches, error } = await supabase.from('branches').select('*');
    if (error) throw error;

    // Get room counts for each branch
    const { data: rooms, error: roomErr } = await supabase.from('rooms').select('id, branch_id, is_available');
    if (roomErr) throw roomErr;

    const result = branches.map(b => ({
      ...b,
      total_rooms: rooms.filter(r => r.branch_id === b.id).length,
      available_rooms: rooms.filter(r => r.branch_id === b.id && r.is_available).length,
    }));

    res.json(result);
  } catch (err) {
    console.error('Branches error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/branches/:id', async (req, res) => {
  try {
    const { data: branch, error } = await supabase
      .from('branches').select('*').eq('id', Number(req.params.id)).single();
    if (error || !branch) return res.status(404).json({ error: 'Branch not found' });

    const { data: rooms } = await supabase.from('rooms').select('id, is_available').eq('branch_id', branch.id);
    branch.total_rooms = rooms?.length || 0;
    branch.available_rooms = rooms?.filter(r => r.is_available).length || 0;

    res.json(branch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/branches/:id/rooms', async (req, res) => {
  try {
    let query = supabase.from('rooms').select('*').eq('branch_id', Number(req.params.id));
    if (req.query.available === '1') query = query.eq('is_available', true);
    query = query.order('room_number');

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Room Routes ───────────────────────────────────────────────────
app.get('/api/rooms/:id', async (req, res) => {
  try {
    const { data: room, error } = await supabase
      .from('rooms').select('*, branches(name)').eq('id', Number(req.params.id)).single();
    if (error || !room) return res.status(404).json({ error: 'Room not found' });

    room.branch_name = room.branches?.name;
    delete room.branches;
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Booking Routes ────────────────────────────────────────────────
function generateReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `JCL-${date}-${rand}`;
}

app.post('/api/bookings', async (req, res) => {
  try {
    const { room_id, guest_name, guest_email, guest_phone, check_in, check_out } = req.body;
    if (!room_id || !guest_name || !guest_email || !guest_phone || !check_in || !check_out) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (checkInDate < today) return res.status(400).json({ error: 'Check-in date must be today or in the future' });
    if (checkOutDate <= checkInDate) return res.status(400).json({ error: 'Check-out date must be after check-in date' });

    // Check room exists and is available
    const { data: room } = await supabase
      .from('rooms').select('*').eq('id', room_id).eq('is_available', true).single();
    if (!room) return res.status(400).json({ error: 'Room not found or not available' });

    // Check for overlapping bookings
    const { data: overlaps } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', room_id)
      .neq('status', 'cancelled')
      .lt('check_in', check_out)
      .gt('check_out', check_in)
      .limit(1);

    if (overlaps?.length > 0) return res.status(409).json({ error: 'Room is already booked for the selected dates' });

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const total_price = nights * room.price_per_night;
    const reference = generateReference();

    const { data: booking, error } = await supabase.from('bookings').insert({
      reference, room_id, guest_name, guest_email, guest_phone, check_in, check_out,
      total_price, status: 'pending_payment', payment_status: 'unpaid',
    }).select().single();

    if (error) throw error;

    // Fetch full booking with joins
    const { data: fullBooking } = await supabase
      .from('bookings')
      .select('*, rooms(room_number, type, price_per_night, branches(name))')
      .eq('id', booking.id).single();

    const result = {
      ...fullBooking,
      room_number: fullBooking.rooms?.room_number,
      room_type: fullBooking.rooms?.type,
      price_per_night: fullBooking.rooms?.price_per_night,
      branch_name: fullBooking.rooms?.branches?.name,
    };
    delete result.rooms;

    res.status(201).json(result);
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, rooms(room_number, type, branches(name))')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const result = data.map(b => ({
      ...b,
      room_number: b.rooms?.room_number,
      room_type: b.rooms?.type,
      branch_name: b.rooms?.branches?.name,
      rooms: undefined,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/:reference', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, rooms(room_number, type, price_per_night, branches(name))')
      .eq('reference', req.params.reference).single();
    if (error || !data) return res.status(404).json({ error: 'Booking not found' });

    const result = {
      ...data,
      room_number: data.rooms?.room_number,
      room_type: data.rooms?.type,
      price_per_night: data.rooms?.price_per_night,
      branch_name: data.rooms?.branches?.name,
    };
    delete result.rooms;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin Routes ──────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jcladmin2026';

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: 'admin-mvp-token' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.put('/api/admin/rooms/:id', async (req, res) => {
  try {
    const { is_available } = req.body;
    const { data, error } = await supabase
      .from('rooms').update({ is_available: !!is_available }).eq('id', Number(req.params.id)).select().single();
    if (error || !data) return res.status(404).json({ error: 'Room not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/bookings/:id/cancel', async (req, res) => {
  try {
    const { error } = await supabase
      .from('bookings').update({ status: 'cancelled' }).eq('id', Number(req.params.id));
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Payment Routes ────────────────────────────────────────────────
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const PAYSTACK_BASE = 'https://api.paystack.co';

async function paystackRequest(path, method = 'GET', body = null) {
  const options = {
    method,
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);
  const r = await fetch(`${PAYSTACK_BASE}${path}`, options);
  return r.json();
}

app.post('/api/payments/initialize', async (req, res) => {
  try {
    const { booking_reference, payment_type = 'full' } = req.body;
    if (!booking_reference) return res.status(400).json({ error: 'booking_reference is required' });

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, rooms(room_number, branches(name))')
      .eq('reference', booking_reference).single();

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.payment_status === 'paid') return res.status(400).json({ error: 'Already fully paid' });

    const payableAmount = payment_type === 'half' ? booking.total_price / 2 : booking.total_price;
    const amount = Math.round(payableAmount * 100);

    const paystackRes = await paystackRequest('/transaction/initialize', 'POST', {
      email: booking.guest_email, amount, currency: 'GHS',
      reference: `PAY-${booking.reference}-${Date.now()}`,
      callback_url: `${req.headers.origin || 'https://jcl-guest-lodge.vercel.app'}/payment/verify`,
      metadata: {
        booking_reference: booking.reference, booking_id: booking.id,
        guest_name: booking.guest_name, room: booking.rooms?.room_number,
        branch: booking.rooms?.branches?.name, payment_type,
      },
    });

    if (!paystackRes.status) return res.status(400).json({ error: paystackRes.message || 'Failed to initialize payment' });

    await supabase.from('payments').insert({
      booking_id: booking.id, paystack_reference: paystackRes.data.reference,
      amount: payableAmount, currency: 'GHS', status: 'pending',
    });

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

app.get('/api/payments/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const paystackRes = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
    if (!paystackRes.status) return res.status(400).json({ error: paystackRes.message || 'Verification failed' });

    const txn = paystackRes.data;
    const { data: payment } = await supabase
      .from('payments').select('*').eq('paystack_reference', reference).single();
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });

    if (txn.status === 'success') {
      await supabase.from('payments').update({
        status: 'success', paid_at: txn.paid_at || new Date().toISOString(),
        channel: txn.channel || 'unknown', paystack_data: txn,
      }).eq('paystack_reference', reference);

      const paymentType = txn.metadata?.payment_type || 'full';
      const isPartial = paymentType === 'half';

      const { data: currentBooking } = await supabase
        .from('bookings').select('amount_paid').eq('id', payment.booking_id).single();

      await supabase.from('bookings').update({
        status: 'confirmed',
        payment_status: isPartial ? 'partial' : 'paid',
        amount_paid: (currentBooking?.amount_paid || 0) + payment.amount,
      }).eq('id', payment.booking_id);

      const { data: updatedBooking } = await supabase
        .from('bookings')
        .select('*, rooms(room_number, type, price_per_night, branches(name))')
        .eq('id', payment.booking_id).single();

      const result = {
        ...updatedBooking,
        room_number: updatedBooking.rooms?.room_number,
        room_type: updatedBooking.rooms?.type,
        price_per_night: updatedBooking.rooms?.price_per_night,
        branch_name: updatedBooking.rooms?.branches?.name,
      };
      delete result.rooms;

      res.json({ status: 'success', booking: result });
    } else {
      await supabase.from('payments').update({ status: txn.status }).eq('paystack_reference', reference);
      res.json({ status: txn.status, message: 'Payment not successful' });
    }
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

app.post('/api/payments/webhook', async (req, res) => {
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(JSON.stringify(req.body)).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) return res.status(401).json({ error: 'Invalid signature' });

  const event = req.body;
  if (event.event === 'charge.success') {
    const txn = event.data;
    const { data: payment } = await supabase
      .from('payments').select('*').eq('paystack_reference', txn.reference).single();

    if (payment) {
      await supabase.from('payments').update({
        status: 'success', paid_at: txn.paid_at, channel: txn.channel, paystack_data: txn,
      }).eq('paystack_reference', txn.reference);

      const paymentType = txn.metadata?.payment_type || 'full';
      const isPartial = paymentType === 'half';

      const { data: currentBooking } = await supabase
        .from('bookings').select('amount_paid').eq('id', payment.booking_id).single();

      await supabase.from('bookings').update({
        status: 'confirmed',
        payment_status: isPartial ? 'partial' : 'paid',
        amount_paid: (currentBooking?.amount_paid || 0) + payment.amount,
      }).eq('id', payment.booking_id);
    }
  }
  res.sendStatus(200);
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

export default app;
