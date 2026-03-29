-- JCL Guest Lodge — Supabase Schema + Seed Data
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query → Paste → Run)

-- ─── Tables ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL REFERENCES branches(id),
  room_number TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Standard',
  price_per_night NUMERIC NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  UNIQUE(branch_id, room_number)
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id),
  paystack_reference TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  channel TEXT,
  paystack_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Disable RLS for MVP (service_role key bypasses anyway) ───────
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Public read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Service full access branches" ON branches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service full access rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service full access bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service full access payments" ON payments FOR ALL USING (true) WITH CHECK (true);

-- ─── Seed Branches ────────────────────────────────────────────────
INSERT INTO branches (name, description, image_url) VALUES
  ('Lapaz', 'Our flagship branch in the heart of Lapaz. Comfortable rooms with easy access to local markets and transportation hubs.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop&q=80'),
  ('Danfa', 'A serene retreat surrounded by nature. Perfect for guests seeking a quieter, more peaceful stay away from the city.', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=500&fit=crop&q=80'),
  ('Spintex', 'Located on bustling Spintex Road. Ideal for business travelers and visitors to the commercial district.', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=500&fit=crop&q=80'),
  ('Teshie', 'A cozy coastal branch offering ocean breezes and proximity to the beach. Wake up to the sound of waves.', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=500&fit=crop&q=80')
ON CONFLICT (name) DO NOTHING;

-- ─── Seed Rooms ───────────────────────────────────────────────────
-- Lapaz: 24 rooms (LP-01 to LP-24)
INSERT INTO rooms (branch_id, room_number, type, price_per_night, is_available, image_url)
SELECT b.id, r.room_number, r.type, r.price, true, r.img
FROM branches b,
(VALUES
  ('LP-01','Standard',150,'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&q=80'),
  ('LP-02','Standard',150,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop&q=80'),
  ('LP-03','Standard',150,'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop&q=80'),
  ('LP-04','Standard',150,'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop&q=80'),
  ('LP-05','Standard',150,'https://images.unsplash.com/photo-1612320743784-66952008b2e7?w=600&h=400&fit=crop&q=80'),
  ('LP-06','Standard',150,'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop&q=80'),
  ('LP-07','Standard',150,'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&q=80'),
  ('LP-08','Standard',150,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop&q=80'),
  ('LP-09','Standard',150,'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop&q=80'),
  ('LP-10','Standard',150,'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop&q=80'),
  ('LP-11','Standard',150,'https://images.unsplash.com/photo-1612320743784-66952008b2e7?w=600&h=400&fit=crop&q=80'),
  ('LP-12','Standard',150,'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop&q=80'),
  ('LP-13','Standard',150,'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&q=80'),
  ('LP-14','Standard',150,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop&q=80'),
  ('LP-15','Standard',150,'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop&q=80'),
  ('LP-16','Deluxe',250,'https://images.unsplash.com/photo-1618773928121-c32f1e0e56cd?w=600&h=400&fit=crop&q=80'),
  ('LP-17','Deluxe',250,'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop&q=80'),
  ('LP-18','Deluxe',250,'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop&q=80'),
  ('LP-19','Deluxe',250,'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&h=400&fit=crop&q=80'),
  ('LP-20','Deluxe',250,'https://images.unsplash.com/photo-1618773928121-c32f1e0e56cd?w=600&h=400&fit=crop&q=80'),
  ('LP-21','Suite',400,'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&h=400&fit=crop&q=80'),
  ('LP-22','Suite',400,'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&h=400&fit=crop&q=80'),
  ('LP-23','Suite',400,'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=600&h=400&fit=crop&q=80'),
  ('LP-24','Suite',400,'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&h=400&fit=crop&q=80')
) AS r(room_number, type, price, img)
WHERE b.name = 'Lapaz'
ON CONFLICT (branch_id, room_number) DO NOTHING;

-- Danfa: 11 rooms (DN-01 to DN-11)
INSERT INTO rooms (branch_id, room_number, type, price_per_night, is_available, image_url)
SELECT b.id, r.room_number, r.type, r.price, true, r.img
FROM branches b,
(VALUES
  ('DN-01','Standard',150,'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&q=80'),
  ('DN-02','Standard',150,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop&q=80'),
  ('DN-03','Standard',150,'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop&q=80'),
  ('DN-04','Standard',150,'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop&q=80'),
  ('DN-05','Standard',150,'https://images.unsplash.com/photo-1612320743784-66952008b2e7?w=600&h=400&fit=crop&q=80'),
  ('DN-06','Standard',150,'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop&q=80'),
  ('DN-07','Standard',150,'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&q=80'),
  ('DN-08','Deluxe',250,'https://images.unsplash.com/photo-1618773928121-c32f1e0e56cd?w=600&h=400&fit=crop&q=80'),
  ('DN-09','Deluxe',250,'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop&q=80'),
  ('DN-10','Suite',400,'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&h=400&fit=crop&q=80'),
  ('DN-11','Suite',400,'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&h=400&fit=crop&q=80')
) AS r(room_number, type, price, img)
WHERE b.name = 'Danfa'
ON CONFLICT (branch_id, room_number) DO NOTHING;

-- Spintex: 16 rooms (SP-01 to SP-16)
INSERT INTO rooms (branch_id, room_number, type, price_per_night, is_available, image_url)
SELECT b.id, r.room_number, r.type, r.price, true, r.img
FROM branches b,
(VALUES
  ('SP-01','Standard',150,'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&q=80'),
  ('SP-02','Standard',150,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop&q=80'),
  ('SP-03','Standard',150,'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop&q=80'),
  ('SP-04','Standard',150,'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop&q=80'),
  ('SP-05','Standard',150,'https://images.unsplash.com/photo-1612320743784-66952008b2e7?w=600&h=400&fit=crop&q=80'),
  ('SP-06','Standard',150,'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop&q=80'),
  ('SP-07','Standard',150,'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&q=80'),
  ('SP-08','Standard',150,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop&q=80'),
  ('SP-09','Standard',150,'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop&q=80'),
  ('SP-10','Standard',150,'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop&q=80'),
  ('SP-11','Deluxe',250,'https://images.unsplash.com/photo-1618773928121-c32f1e0e56cd?w=600&h=400&fit=crop&q=80'),
  ('SP-12','Deluxe',250,'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop&q=80'),
  ('SP-13','Deluxe',250,'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop&q=80'),
  ('SP-14','Suite',400,'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&h=400&fit=crop&q=80'),
  ('SP-15','Suite',400,'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&h=400&fit=crop&q=80'),
  ('SP-16','Suite',400,'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=600&h=400&fit=crop&q=80')
) AS r(room_number, type, price, img)
WHERE b.name = 'Spintex'
ON CONFLICT (branch_id, room_number) DO NOTHING;

-- Teshie: 10 rooms (TS-01 to TS-10)
INSERT INTO rooms (branch_id, room_number, type, price_per_night, is_available, image_url)
SELECT b.id, r.room_number, r.type, r.price, true, r.img
FROM branches b,
(VALUES
  ('TS-01','Standard',150,'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&q=80'),
  ('TS-02','Standard',150,'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop&q=80'),
  ('TS-03','Standard',150,'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop&q=80'),
  ('TS-04','Standard',150,'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop&q=80'),
  ('TS-05','Standard',150,'https://images.unsplash.com/photo-1612320743784-66952008b2e7?w=600&h=400&fit=crop&q=80'),
  ('TS-06','Standard',150,'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop&q=80'),
  ('TS-07','Deluxe',250,'https://images.unsplash.com/photo-1618773928121-c32f1e0e56cd?w=600&h=400&fit=crop&q=80'),
  ('TS-08','Deluxe',250,'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=400&fit=crop&q=80'),
  ('TS-09','Suite',400,'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&h=400&fit=crop&q=80'),
  ('TS-10','Suite',400,'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&h=400&fit=crop&q=80')
) AS r(room_number, type, price, img)
WHERE b.name = 'Teshie'
ON CONFLICT (branch_id, room_number) DO NOTHING;
