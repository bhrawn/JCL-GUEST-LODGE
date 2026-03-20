import { Router } from 'express';
import { get } from '../db.js';

const router = Router();

// GET /api/rooms/:id
router.get('/:id', (req, res) => {
  const room = get(`
    SELECT r.*, b.name as branch_name
    FROM rooms r
    JOIN branches b ON b.id = r.branch_id
    WHERE r.id = ?
  `, [Number(req.params.id)]);

  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

export default router;
