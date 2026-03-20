import { Router } from 'express';
import { get, run, saveDb } from '../db.js';

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jcladmin2026';

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: 'admin-mvp-token' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// PUT /api/admin/rooms/:id
router.put('/rooms/:id', (req, res) => {
  const { is_available } = req.body;
  const room = get('SELECT * FROM rooms WHERE id = ?', [Number(req.params.id)]);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  run('UPDATE rooms SET is_available = ? WHERE id = ?', [is_available ? 1 : 0, Number(req.params.id)]);
  saveDb();

  const updated = get('SELECT * FROM rooms WHERE id = ?', [Number(req.params.id)]);
  res.json(updated);
});

// PUT /api/admin/bookings/:id/cancel
router.put('/bookings/:id/cancel', (req, res) => {
  const booking = get('SELECT * FROM bookings WHERE id = ?', [Number(req.params.id)]);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  run("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [Number(req.params.id)]);
  saveDb();
  res.json({ success: true });
});

export default router;
