import { Router } from 'express';
import { all, get, run, saveDb } from '../db.js';

const router = Router();

function generateReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `JCL-${date}-${rand}`;
}

// POST /api/bookings
router.post('/', (req, res) => {
  const { room_id, guest_name, guest_email, guest_phone, check_in, check_out } = req.body;

  if (!room_id || !guest_name || !guest_email || !guest_phone || !check_in || !check_out) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    return res.status(400).json({ error: 'Check-in date must be today or in the future' });
  }
  if (checkOutDate <= checkInDate) {
    return res.status(400).json({ error: 'Check-out date must be after check-in date' });
  }

  const room = get('SELECT * FROM rooms WHERE id = ? AND is_available = 1', [room_id]);
  if (!room) {
    return res.status(400).json({ error: 'Room not found or not available' });
  }

  const overlap = get(`
    SELECT id FROM bookings
    WHERE room_id = ? AND status != 'cancelled'
      AND check_in < ? AND check_out > ?
  `, [room_id, check_out, check_in]);

  if (overlap) {
    return res.status(409).json({ error: 'Room is already booked for the selected dates' });
  }

  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const total_price = nights * room.price_per_night;
  const reference = generateReference();

  const result = run(`
    INSERT INTO bookings (reference, room_id, guest_name, guest_email, guest_phone, check_in, check_out, total_price, status, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment', 'unpaid')
  `, [reference, room_id, guest_name, guest_email, guest_phone, check_in, check_out, total_price]);

  saveDb();

  const booking = get(`
    SELECT bk.*, r.room_number, r.type as room_type, r.price_per_night, b.name as branch_name
    FROM bookings bk
    JOIN rooms r ON r.id = bk.room_id
    JOIN branches b ON b.id = r.branch_id
    WHERE bk.id = ?
  `, [result.lastInsertRowid]);

  res.status(201).json(booking);
});

// GET /api/bookings
router.get('/', (req, res) => {
  const bookings = all(`
    SELECT bk.*, r.room_number, r.type as room_type, b.name as branch_name
    FROM bookings bk
    JOIN rooms r ON r.id = bk.room_id
    JOIN branches b ON b.id = r.branch_id
    ORDER BY bk.created_at DESC
  `);
  res.json(bookings);
});

// GET /api/bookings/:reference
router.get('/:reference', (req, res) => {
  const booking = get(`
    SELECT bk.*, r.room_number, r.type as room_type, r.price_per_night, b.name as branch_name
    FROM bookings bk
    JOIN rooms r ON r.id = bk.room_id
    JOIN branches b ON b.id = r.branch_id
    WHERE bk.reference = ?
  `, [req.params.reference]);

  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
});

export default router;
