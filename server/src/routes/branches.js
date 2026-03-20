import { Router } from 'express';
import { all, get } from '../db.js';

const router = Router();

// GET /api/branches
router.get('/', (req, res) => {
  const branches = all(`
    SELECT b.*,
      COUNT(r.id) as total_rooms,
      SUM(CASE WHEN r.is_available = 1 THEN 1 ELSE 0 END) as available_rooms
    FROM branches b
    LEFT JOIN rooms r ON r.branch_id = b.id
    GROUP BY b.id
  `);
  res.json(branches);
});

// GET /api/branches/:id
router.get('/:id', (req, res) => {
  const branch = get(`
    SELECT b.*,
      COUNT(r.id) as total_rooms,
      SUM(CASE WHEN r.is_available = 1 THEN 1 ELSE 0 END) as available_rooms
    FROM branches b
    LEFT JOIN rooms r ON r.branch_id = b.id
    WHERE b.id = ?
    GROUP BY b.id
  `, [Number(req.params.id)]);

  if (!branch) return res.status(404).json({ error: 'Branch not found' });
  res.json(branch);
});

// GET /api/branches/:id/rooms
router.get('/:id/rooms', (req, res) => {
  let query = 'SELECT * FROM rooms WHERE branch_id = ?';
  const params = [Number(req.params.id)];

  if (req.query.available === '1') {
    query += ' AND is_available = 1';
  }

  query += ' ORDER BY room_number';
  const rooms = all(query, params);
  res.json(rooms);
});

export default router;
