import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import BranchCard from '../components/BranchCard';

/* ── Date Picker ── */
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function DatePickerField({ label, value, onChange, minDate }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    const d = value ? new Date(value + 'T00:00:00') : new Date();
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = value ? new Date(value + 'T00:00:00') : new Date();
    return d.getMonth();
  });
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const minStr = minDate || todayStr;

  const displayDate = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build calendar days
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const selectDay = (day) => {
    const y = viewYear;
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setOpen(false);
  };

  const isPrevDisabled = () => {
    const min = new Date(minStr + 'T00:00:00');
    return new Date(viewYear, viewMonth, 1) <= new Date(min.getFullYear(), min.getMonth(), 1);
  };

  return (
    <div className="bw-date-field" ref={ref}>
      <button
        type="button"
        className={`bw-date-display${!value ? ' bw-date-placeholder' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <svg className="bw-date-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {displayDate || 'Select date'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="bw-cal-popup"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="bw-cal-header">
              <button className="bw-cal-nav" type="button" onClick={prevMonth} disabled={isPrevDisabled()} aria-label="Previous month">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <span className="bw-cal-month">{MONTHS[viewMonth]} {viewYear}</span>
              <button className="bw-cal-nav" type="button" onClick={nextMonth} aria-label="Next month">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>

            <div className="bw-cal-grid">
              {DAYS_OF_WEEK.map(d => (
                <div key={d} className="bw-cal-dow">{d}</div>
              ))}
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`e-${i}`} className="bw-cal-day bw-cal-day--empty" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isDisabled = dateStr < minStr;
                const isSelected = dateStr === value;
                const isToday = dateStr === todayStr;
                return (
                  <button
                    key={day}
                    type="button"
                    className={`bw-cal-day${isSelected ? ' bw-cal-day--selected' : ''}${isToday && !isSelected ? ' bw-cal-day--today' : ''}`}
                    disabled={isDisabled}
                    onClick={() => selectDay(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Branch Dropdown ── */
function BranchDropdown({ branches, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = branches.find(b => String(b.id) === String(value));

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="bw-dropdown" ref={ref}>
      <button type="button" className="bw-dropdown-trigger" onClick={() => setOpen(o => !o)}>
        <span className="bw-dropdown-value">
          {selected ? selected.name : <span className="bw-dropdown-placeholder">Any Branch</span>}
        </span>
        <svg
          className={`bw-dropdown-chevron${open ? ' bw-dropdown-chevron--open' : ''}`}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            className="bw-dropdown-menu"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <li
              className={`bw-dropdown-item${!value ? ' bw-dropdown-item--active' : ''}`}
              onClick={() => { onChange(''); setOpen(false); }}
            >
              <span className="bw-dropdown-item-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </span>
              All Branches
            </li>
            {branches.map(b => (
              <li
                key={b.id}
                className={`bw-dropdown-item${String(value) === String(b.id) ? ' bw-dropdown-item--active' : ''}`}
                onClick={() => { onChange(b.id); setOpen(false); }}
              >
                <span className="bw-dropdown-item-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                {b.name}
                <span className="bw-dropdown-item-badge">Accra</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── animation helpers ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.15, duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.15, duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function AnimSection({ children, className = '', variants = fadeUp, custom = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      custom={custom}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── data ── */
const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
    title: '24/7 Check-in',
    desc: 'Arrive at any hour — our front desk is always ready to welcome you, day or night.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
    ),
    title: '4 Prime Locations',
    desc: 'Strategically located across Accra — Lapaz, Danfa, Spintex, and Teshie.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    ),
    title: 'Flexible Payments',
    desc: 'Pay in full or 50% upfront — we make it easy with Paystack integration.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
    ),
    title: 'Comfort First',
    desc: 'Clean rooms, reliable AC, fast WiFi, and attentive service — essentials done right.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
    ),
    title: 'Group-Friendly',
    desc: 'Rooms for every group size and budget — families, teams, or solo travelers.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    ),
    title: 'Instant Booking',
    desc: 'No calls, no waiting. Browse, select, and confirm your room in under a minute.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Pick a Branch',
    desc: 'Browse our 4 locations across Accra and choose the branch closest to your destination.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
    ),
  },
  {
    num: '02',
    title: 'Choose Your Room',
    desc: 'View available rooms with photos, pricing, and amenities. Find the perfect fit for your stay.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    ),
  },
  {
    num: '03',
    title: 'Book & Pay',
    desc: 'Fill in your details, choose a payment option, and get instant confirmation via email.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    ),
  },
];

const testimonials = [
  {
    name: 'Ama Mensah',
    role: 'Business Traveler',
    text: 'JCL made my stay in Accra seamless. The booking was instant and the room was exactly as pictured. Will definitely be back!',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Kwame Asante',
    role: 'Family Vacation',
    text: 'We booked rooms for the whole family at the Spintex branch. Clean, comfortable, and the staff were incredibly welcoming.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Efua Owusu',
    role: 'Weekend Getaway',
    text: 'The flexible payment option was a lifesaver. I paid 50% upfront and settled the rest at check-in. So convenient!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
];

/* ── Gallery images (replace with real images later) ── */
const GALLERY_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&h=750&q=80', caption: 'Standard Room — Lapaz' },
  { src: 'https://images.unsplash.com/photo-1618773928121-c32f1e0e56cd?auto=format&fit=crop&w=1200&h=750&q=80', caption: 'Deluxe Room — Spintex' },
  { src: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&h=750&q=80', caption: 'Suite — Danfa' },
  { src: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&h=750&q=80', caption: 'Suite — Teshie' },
  { src: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&h=750&q=80', caption: 'Standard Room — Danfa' },
  { src: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&h=750&q=80', caption: 'Deluxe Room — Lapaz' },
  { src: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&h=750&q=80', caption: 'Deluxe Room — Teshie' },
  { src: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&h=750&q=80', caption: 'Standard Room — Spintex' },
  { src: 'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&w=1200&h=750&q=80', caption: 'Suite — Lapaz' },
  { src: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&h=750&q=80', caption: 'Deluxe Room — Danfa' },
];

function GallerySection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = GALLERY_IMAGES.length;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive(p => (p + 1) % total), 3500);
    return () => clearInterval(t);
  }, [paused, total]);

  const prev = () => setActive(p => (p - 1 + total) % total);
  const next = () => setActive(p => (p + 1) % total);

  return (
    <section className="gallery-section" id="gallery">
      <AnimSection>
        <div className="section-header">
          <span className="section-label">Gallery</span>
          <h2 className="section-title">A glimpse inside</h2>
          <p className="section-subtitle">Thoughtfully designed spaces built for comfort and style.</p>
        </div>
      </AnimSection>

      <div
        className="gallery-slider"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Slides */}
        <div className="gallery-track">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="gallery-slide"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <img
                src={GALLERY_IMAGES[active].src}
                alt={GALLERY_IMAGES[active].caption}
                className="gallery-img"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&h=750&q=80'; }}
              />
              {/* Overlay gradient */}
              <div className="gallery-overlay" />
              {/* Caption */}
              <motion.div
                className="gallery-caption"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <span className="gallery-caption-dot" />
                {GALLERY_IMAGES[active].caption}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Prev / Next */}
        <button className="gallery-arrow gallery-arrow--prev" onClick={prev} aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button className="gallery-arrow gallery-arrow--next" onClick={next} aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>

        {/* Dot indicators */}
        <div className="gallery-dots">
          {GALLERY_IMAGES.map((_, i) => (
            <button
              key={i}
              className={`gallery-dot${i === active ? ' gallery-dot--active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Thumbnail strip */}
        <div className="gallery-thumbs">
          {GALLERY_IMAGES.map((img, i) => (
            <button
              key={i}
              className={`gallery-thumb${i === active ? ' gallery-thumb--active' : ''}`}
              onClick={() => setActive(i)}
            >
              <img src={img.src} alt={img.caption} loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [booking, setBooking] = useState({
    branch: '',
    checkin: '',
    checkout: '',
    adults: 1,
    children: 0,
  });

  const setField = (field, value) => setBooking(prev => ({ ...prev, [field]: value }));

  const handleCheckAvailability = (e) => {
    e.preventDefault();
    if (booking.branch) {
      navigate(`/branch/${booking.branch}/rooms`);
    } else {
      document.getElementById('branches')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    api.getBranches()
      .then(setBranches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home-page">

      {/* ══════ HERO ══════ */}
      <section className="hero">
        {/* Gradient orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        {/* Grid pattern overlay */}
        <div className="hero-grid-pattern" />

        <div className="container hero-content">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hero-pill"
          >
            <span className="hero-pill-dot" />
            4 Locations &middot; 61 Rooms &middot; Accra, Ghana
          </motion.div>

          <motion.h1
            className="hero-headline"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Your Perfect Stay,
            <span className="hero-headline-accent"> Effortlessly Booked</span>
          </motion.h1>

          <motion.p
            className="hero-subtext"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Premium guest rooms across Accra. Pick a branch, choose your room,
            and book in under a minute.
          </motion.p>

          {/* Booking Widget */}
          <motion.form
            className="booking-widget"
            onSubmit={handleCheckAvailability}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
          >
            {/* Branch */}
            <div className="bw-field">
              <label>Branch</label>
              <BranchDropdown
                branches={branches}
                value={booking.branch}
                onChange={v => setField('branch', v)}
              />
            </div>

            <div className="bw-divider" />

            {/* Check-in */}
            <div className="bw-field">
              <label>Check-in</label>
              <DatePickerField
                value={booking.checkin}
                onChange={v => {
                  setField('checkin', v);
                  if (booking.checkout && v >= booking.checkout) setField('checkout', '');
                }}
                minDate={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="bw-divider" />

            {/* Check-out */}
            <div className="bw-field">
              <label>Check-out</label>
              <DatePickerField
                value={booking.checkout}
                onChange={v => setField('checkout', v)}
                minDate={booking.checkin
                  ? (() => { const d = new Date(booking.checkin + 'T00:00:00'); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })()
                  : new Date().toISOString().split('T')[0]
                }
              />
            </div>

            <div className="bw-divider" />

            {/* Guests */}
            <div className="bw-field">
              <label>Guests</label>
              <div className="bw-guests">
                <div className="bw-guests-group">
                  <span className="bw-guests-label">Adults</span>
                  <input type="number" min="1" max="10" value={booking.adults}
                    onChange={e => setField('adults', e.target.value)} />
                </div>
                <span className="bw-guests-sep">/</span>
                <div className="bw-guests-group">
                  <span className="bw-guests-label">Children</span>
                  <input type="number" min="0" max="10" value={booking.children}
                    onChange={e => setField('children', e.target.value)} />
                </div>
              </div>
            </div>

            {/* CTA */}
            <button type="submit" className="bw-submit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Check Availability
            </button>
          </motion.form>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="hero-scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <span>Scroll</span>
          <div className="hero-scroll-mouse">
            <motion.div
              className="hero-scroll-dot"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </section>

      {/* ══════ BRANCHES ══════ */}
      <section className="section section-branches" id="branches">
        <div className="container">
          <AnimSection>
            <div className="section-header">
              <span className="section-label">Our Branches</span>
              <h2 className="section-title">Choose your destination</h2>
              <p className="section-subtitle">Each branch offers a unique experience tailored to your needs.</p>
            </div>
          </AnimSection>

          {loading ? (
            <div className="loading">Loading branches</div>
          ) : (
            <div className="grid grid-2">
              {branches.map((branch, i) => (
                <AnimSection key={branch.id} custom={i} variants={fadeUp}>
                  <BranchCard branch={branch} />
                </AnimSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════ GALLERY ══════ */}
      <GallerySection />

      {/* ══════ FEATURES ══════ */}
      <section className="section section-features">
        <div className="container">
          <AnimSection>
            <div className="section-header">
              <span className="section-label">Why JCL</span>
              <h2 className="section-title">More than just a room</h2>
              <p className="section-subtitle">We go the extra mile to make every stay memorable.</p>
            </div>
          </AnimSection>

          <div className="features-grid">
            {features.map((f, i) => (
              <AnimSection key={i} custom={i} variants={fadeUp}>
                <div className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section className="section section-steps">
        <div className="container">
          <AnimSection>
            <div className="section-header">
              <span className="section-label">How It Works</span>
              <h2 className="section-title">Book in 3 simple steps</h2>
              <p className="section-subtitle">From browsing to confirmation in under a minute.</p>
            </div>
          </AnimSection>

          <div className="steps-container">
            {steps.map((step, i) => (
              <div className="step-wrapper" key={i}>
                <AnimSection variants={i % 2 === 0 ? fadeLeft : fadeRight} custom={i}>
                  <div className="step-card">
                    <div className="step-number">{step.num}</div>
                    <div className="step-icon-wrap">{step.icon}</div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </AnimSection>
                {i < steps.length - 1 && (
                  <AnimSection variants={scaleIn} custom={i + 0.5}>
                    <div className="step-connector">
                      <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
                        <path d="M0 12h32m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </AnimSection>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIALS ══════ */}
      <section className="section section-testimonials">
        <div className="container">
          <AnimSection>
            <div className="section-header">
              <span className="section-label">Guest Reviews</span>
              <h2 className="section-title">What our guests say</h2>
              <p className="section-subtitle">Real experiences from real guests across our branches.</p>
            </div>
          </AnimSection>

          <AnimSection>
            <div className="testimonial-carousel">
              <div className="testimonial-track" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
                {testimonials.map((t, i) => (
                  <div className="testimonial-slide" key={i}>
                    <div className="testimonial-card">
                      <div className="testimonial-quote">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" opacity="0.15">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                        </svg>
                      </div>
                      <p className="testimonial-text">{t.text}</p>
                      <div className="testimonial-author">
                        <img src={t.avatar} alt={t.name} className="testimonial-avatar" loading="lazy" />
                        <div>
                          <span className="testimonial-name">{t.name}</span>
                          <span className="testimonial-role">{t.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dots */}
              <div className="testimonial-dots">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    className={`testimonial-dot ${i === activeTestimonial ? 'testimonial-dot-active' : ''}`}
                    onClick={() => setActiveTestimonial(i)}
                    aria-label={`View testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section className="section section-cta">
        <div className="container">
          <AnimSection>
            <div className="cta-box">
              <h2>Ready for a comfortable stay?</h2>
              <p>Browse our rooms and book your perfect stay in Accra today.</p>
              <a href="#branches" className="hero-btn-primary">
                Book Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
          </AnimSection>
        </div>
      </section>
    </div>
  );
}
