import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'jcl.db');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const SQL = await initSqlJs();
const db = new SQL.Database();

db.run(`
  CREATE TABLE branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT
  );
`);
db.run(`
  CREATE TABLE rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    room_number TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Standard',
    price_per_night REAL NOT NULL,
    is_available INTEGER NOT NULL DEFAULT 1,
    image_url TEXT,
    UNIQUE(branch_id, room_number)
  );
`);
db.run(`
  CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT NOT NULL UNIQUE,
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    total_price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    amount_paid REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);
db.run(`
  CREATE TABLE payments (
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
  );
`);

// Real Unsplash images for branches
const branches = [
  {
    name: 'Lapaz',
    prefix: 'LP',
    rooms: 24,
    description: 'Our flagship branch in the heart of Lapaz. Comfortable rooms with easy access to local markets and transportation hubs.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop&q=80',
  },
  {
    name: 'Danfa',
    prefix: 'DN',
    rooms: 11,
    description: 'A serene retreat surrounded by nature. Perfect for guests seeking a quieter, more peaceful stay away from the city.',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop&q=80',
  },
  {
    name: 'Spintex',
    prefix: 'SP',
    rooms: 16,
    description: 'Located on bustling Spintex Road. Ideal for business travelers and visitors to the commercial district.',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=500&fit=crop&q=80',
  },
  {
    name: 'Teshie',
    prefix: 'TS',
    rooms: 10,
    description: 'A cozy coastal branch offering ocean breezes and proximity to the beach. Wake up to the sound of waves.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop&q=80',
  },
];

// Real Unsplash room images by type
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

for (const branch of branches) {
  db.run(
    'INSERT INTO branches (name, description, image_url) VALUES (?, ?, ?)',
    [branch.name, branch.description, branch.image]
  );
  const branchId = db.exec("SELECT last_insert_rowid() as id")[0].values[0][0];

  for (let i = 1; i <= branch.rooms; i++) {
    const num = String(i).padStart(2, '0');
    const roomNumber = `${branch.prefix}-${num}`;
    const roomType = pickRoomType(i - 1, branch.rooms);
    const images = roomImages[roomType.type];
    const image = images[(i - 1) % images.length];
    db.run(
      'INSERT INTO rooms (branch_id, room_number, type, price_per_night, is_available, image_url) VALUES (?, ?, ?, ?, 1, ?)',
      [branchId, roomNumber, roomType.type, roomType.price, image]
    );
  }
}

const data = db.export();
fs.writeFileSync(dbPath, Buffer.from(data));
db.close();

console.log('Database seeded with real images!');
console.log('Branches: 4');
console.log('Rooms: 61');
