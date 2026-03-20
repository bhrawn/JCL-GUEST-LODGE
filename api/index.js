import express from 'express';
import initSqlJs from 'sql.js';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// ─── In-Memory Database ────────────────────────────────────────────
let db;

const roomImages = {
  Standard: [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1612320743784-66952008b2e7?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop&q=80',
  ],
  Deluxe: [
    'https://images.unsplash.com/photo-1618773928121-c32f1e0e56cd?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop&q=80',
  ],
  Suite: [
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=600&h=400&fit=crop&q=80',
  ],
};

const branches = [
  { name: 'Lapaz', prefix: 'LP', rooms: 24, description: 'Our flagship branch in the heart of Lapaz. Comfortable rooms with easy access to local markets and transportation hubs.', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop&q=80' },
  { name: 'Danfa', prefix: 'DN', rooms: 11, description: 'A serene retreat surrounded by nature. Perfect for guests seeking a quieter, more peaceful stay away from the city.', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop&q=80' },
  { name: 'Spintex', prefix: 'SP', rooms: 16, description: 'Located on bustling Spintex Road. Ideal for business travelers and visitors to the commercial district.', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=500&fit=crop&q=80' },
  { name: 'Teshie', prefix: 'TS', rooms: 10, description: 'A cozy coastal branch offering ocean breezes and proximity to the beach. Wake up to the sound of waves.', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop&q=80' },
];

const roomTypes = [
  { type: 'Standard', price: 150 },
  { type: 'Deluxe', price: 250 },
  { type: 'Suite', price: 400 },
];

function pickRoomType(index, total) {
  const ratio = index / total;
  if (ratio < 0.65) return roomTypes[0];
  if (ratio < 0.85) return roomTypes[1];
  return roomTypes[2];
}

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();
  db = new SQL.Database();

  db.run(`CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    room_number TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Standard',
    price_per_night REAL NOT NULL,
    is_available INTEGER NOT NULL DEFAULT 1,
    image_url TEXT,
    UNIQUE(branch_id, room_number)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT NOT NULL UNIQUE,
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    total_price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_payment',
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    amount_paid REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    paystack_reference TEXT NOT NULL UNIQUE,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'GHS',
    status TEXT NOT NULL DEFAULT 'pending',
    paid_at TEXT,
    channel TEXT,
    paystack_data TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  // Seed data
  const existingBranches = all('SELECT COUNT(*) as c FROM branches');
  if (existingBranches[0].c === 0) {
    for (const branch of branches) {
      db.run('INSERT INTO branches (name, description, image_url) VALUES (?, ?, ?)', [branch.name, branch.description, branch.image]);
      const branchId = db.exec("SELECT last_insert_rowid() as id")[0].values[0][0];
      for (let i = 1; i <= branch.rooms; i++) {
        const num = String(i).padStart(2, '0');
        const roomNumber = `${branch.prefix}-${num}`;
        const roomType = pickRoomType(i - 1, branch.rooms);
        const images = roomImages[roomType.type];
        const image = images[(i - 1) % images.length];
        db.run('INSERT INTO rooms (branch_id, room_number, type, price_per_night, is_available, image_url) VALUES (?, ?, ?, ?, 1, ?)', [branchId, roomNumber, roomType.type, roomType.price, image]);
      }
    }
  }

  return db;
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  db.run(sql, params);
  const lastId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0];
  return { lastInsertRowid: lastId };
}

// Ensure DB is initialized before handling requests
app.use(async (req, res, next) => {
  try {
    await getDb();
    next();
  } catch (err) {
    console.error('DB init error:', err);
    res.status(500).json({ error: 'Database initialization failed' });
  }
});

// ─── Branch Routes ─────────────────────────────────────────────────
app.get('/api/branches', (req, res) => {
  const result = all(`
    SELECT b.*, COUNT(r.id) as total_rooms,
      SUM(CASE WHEN r.is_available = 1 THEN 1 ELSE 0 END) as available_rooms
    FROM branches b LEFT JOIN rooms r ON r.branch_id = b.id GROUP BY b.id
  `);
  res.json(result);
});

app.get('/api/branches/:id', (req, res) => {
  const branch = get(`
    SELECT b.*, COUNT(r.id) as total_rooms,
      SUM(CASE WHEN r.is_available = 1 THEN 1 ELSE 0 END) as available_rooms
    FROM branches b LEFT JOIN rooms r ON r.branch_id = b.id
    WHERE b.id = ? GROUP BY b.id
  `, [Number(req.params.id)]);
  if (!branch) return res.status(404).json({ error: 'Branch not found' });
  res.json(branch);
});

app.get('/api/branches/:id/rooms', (req, res) => {
  let query = 'SELECT * FROM rooms WHERE branch_id = ?';
  const params = [Number(req.params.id)];
  if (req.query.available === '1') query += ' AND is_available = 1';
  query += ' ORDER BY room_number';
  res.json(all(query, params));
});

// ─── Room Routes ───────────────────────────────────────────────────
app.get('/api/rooms/:id', (req, res) => {
  const room = get(`
    SELECT r.*, b.name as branch_name FROM rooms r
    JOIN branches b ON b.id = r.branch_id WHERE r.id = ?
  `, [Number(req.params.id)]);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

// ─── Booking Routes ────────────────────────────────────────────────
function generateReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `JCL-${date}-${rand}`;
}

app.post('/api/bookings', (req, res) => {
  const { room_id, guest_name, guest_email, guest_phone, check_in, check_out } = req.body;
  if (!room_id || !guest_name || !guest_email || !guest_phone || !check_in || !check_out) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (checkInDate < today) return res.status(400).json({ error: 'Check-in date must be today or in the future' });
  if (checkOutDate <= checkInDate) return res.status(400).json({ error: 'Check-out date must be after check-in date' });

  const room = get('SELECT * FROM rooms WHERE id = ? AND is_available = 1', [room_id]);
  if (!room) return res.status(400).json({ error: 'Room not found or not available' });

  const overlap = get(`SELECT id FROM bookings WHERE room_id = ? AND status != 'cancelled' AND check_in < ? AND check_out > ?`, [room_id, check_out, check_in]);
  if (overlap) return res.status(409).json({ error: 'Room is already booked for the selected dates' });

  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const total_price = nights * room.price_per_night;
  const reference = generateReference();

  const result = run(`INSERT INTO bookings (reference, room_id, guest_name, guest_email, guest_phone, check_in, check_out, total_price, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment', 'unpaid')`, [reference, room_id, guest_name, guest_email, guest_phone, check_in, check_out, total_price]);

  const booking = get(`SELECT bk.*, r.room_number, r.type as room_type, r.price_per_night, b.name as branch_name FROM bookings bk JOIN rooms r ON r.id = bk.room_id JOIN branches b ON b.id = r.branch_id WHERE bk.id = ?`, [result.lastInsertRowid]);
  res.status(201).json(booking);
});

app.get('/api/bookings', (req, res) => {
  res.json(all(`SELECT bk.*, r.room_number, r.type as room_type, b.name as branch_name FROM bookings bk JOIN rooms r ON r.id = bk.room_id JOIN branches b ON b.id = r.branch_id ORDER BY bk.created_at DESC`));
});

app.get('/api/bookings/:reference', (req, res) => {
  const booking = get(`SELECT bk.*, r.room_number, r.type as room_type, r.price_per_night, b.name as branch_name FROM bookings bk JOIN rooms r ON r.id = bk.room_id JOIN branches b ON b.id = r.branch_id WHERE bk.reference = ?`, [req.params.reference]);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
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

app.put('/api/admin/rooms/:id', (req, res) => {
  const { is_available } = req.body;
  const room = get('SELECT * FROM rooms WHERE id = ?', [Number(req.params.id)]);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  run('UPDATE rooms SET is_available = ? WHERE id = ?', [is_available ? 1 : 0, Number(req.params.id)]);
  res.json(get('SELECT * FROM rooms WHERE id = ?', [Number(req.params.id)]));
});

app.put('/api/admin/bookings/:id/cancel', (req, res) => {
  const booking = get('SELECT * FROM bookings WHERE id = ?', [Number(req.params.id)]);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  run("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [Number(req.params.id)]);
  res.json({ success: true });
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

    const booking = get(`SELECT bk.*, r.room_number, b.name as branch_name FROM bookings bk JOIN rooms r ON r.id = bk.room_id JOIN branches b ON b.id = r.branch_id WHERE bk.reference = ?`, [booking_reference]);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.payment_status === 'paid') return res.status(400).json({ error: 'Booking is already fully paid' });

    const payableAmount = payment_type === 'half' ? booking.total_price / 2 : booking.total_price;
    const amount = Math.round(payableAmount * 100);

    const paystackRes = await paystackRequest('/transaction/initialize', 'POST', {
      email: booking.guest_email, amount, currency: 'GHS',
      reference: `PAY-${booking.reference}-${Date.now()}`,
      callback_url: `${req.headers.origin || 'https://jcl-guest-lodge.vercel.app'}/payment/verify`,
      metadata: { booking_reference: booking.reference, booking_id: booking.id, guest_name: booking.guest_name, room: booking.room_number, branch: booking.branch_name, payment_type },
    });

    if (!paystackRes.status) return res.status(400).json({ error: paystackRes.message || 'Failed to initialize payment' });

    run(`INSERT INTO payments (booking_id, paystack_reference, amount, currency, status) VALUES (?, ?, ?, 'GHS', 'pending')`, [booking.id, paystackRes.data.reference, payableAmount]);

    res.json({ authorization_url: paystackRes.data.authorization_url, access_code: paystackRes.data.access_code, reference: paystackRes.data.reference });
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
    const payment = get('SELECT * FROM payments WHERE paystack_reference = ?', [reference]);
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });

    if (txn.status === 'success') {
      run(`UPDATE payments SET status = 'success', paid_at = ?, channel = ?, paystack_data = ? WHERE paystack_reference = ?`, [txn.paid_at || new Date().toISOString(), txn.channel || 'unknown', JSON.stringify(txn), reference]);
      const paymentType = txn.metadata?.payment_type || 'full';
      const isPartial = paymentType === 'half';
      run(`UPDATE bookings SET status = 'confirmed', payment_status = ?, amount_paid = COALESCE(amount_paid, 0) + ? WHERE id = ?`, [isPartial ? 'partial' : 'paid', payment.amount, payment.booking_id]);
      const updatedBooking = get(`SELECT bk.*, r.room_number, r.type as room_type, r.price_per_night, b.name as branch_name FROM bookings bk JOIN rooms r ON r.id = bk.room_id JOIN branches b ON b.id = r.branch_id WHERE bk.id = ?`, [payment.booking_id]);
      res.json({ status: 'success', booking: updatedBooking });
    } else {
      run("UPDATE payments SET status = ? WHERE paystack_reference = ?", [txn.status, reference]);
      res.json({ status: txn.status, message: 'Payment not successful' });
    }
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

app.post('/api/payments/webhook', (req, res) => {
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(JSON.stringify(req.body)).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) return res.status(401).json({ error: 'Invalid signature' });

  const event = req.body;
  if (event.event === 'charge.success') {
    const txn = event.data;
    const payment = get('SELECT * FROM payments WHERE paystack_reference = ?', [txn.reference]);
    if (payment) {
      run(`UPDATE payments SET status = 'success', paid_at = ?, channel = ?, paystack_data = ? WHERE paystack_reference = ?`, [txn.paid_at, txn.channel, JSON.stringify(txn), txn.reference]);
      const paymentType = txn.metadata?.payment_type || 'full';
      const isPartial = paymentType === 'half';
      run(`UPDATE bookings SET status = 'confirmed', payment_status = ?, amount_paid = COALESCE(amount_paid, 0) + ? WHERE id = ?`, [isPartial ? 'partial' : 'paid', payment.amount, payment.booking_id]);
    }
  }
  res.sendStatus(200);
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

export default app;
